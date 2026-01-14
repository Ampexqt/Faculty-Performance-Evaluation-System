const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/vpaa/deans
 * Get all Deans for VPAA to evaluate
 */
router.get('/deans', async (req, res) => {
    try {
        const [deans] = await promisePool.query(`
            SELECT 
                f.id,
                CONCAT(f.first_name, ' ', f.last_name) as full_name,
                f.email,
                f.sex,
                f.position,
                c.college_name,
                f.college_id
            FROM faculty f
            LEFT JOIN colleges c ON f.college_id = c.id
            WHERE f.position LIKE '%Dean%' AND f.status = 'active'
            ORDER BY f.first_name ASC
        `);

        res.json({
            success: true,
            data: deans
        });
    } catch (error) {
        console.error('Error fetching deans:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching deans',
            error: error.message
        });
    }
});

/**
 * POST /api/vpaa/join-evaluation
 * VPAA joins evaluation using code
 */
router.post('/join-evaluation', async (req, res) => {
    try {
        const { vpaa_id, code } = req.body;

        if (!vpaa_id || !code) {
            return res.status(400).json({
                success: false,
                message: 'VPAA ID and code are required'
            });
        }

        // 1. Find the code in supervisor_evaluation_codes
        const [codes] = await promisePool.query(
            `SELECT * FROM supervisor_evaluation_codes 
             WHERE code = ? AND status = 'active' AND evaluator_type = 'VPAA'`,
            [code]
        );

        if (codes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired VPAA evaluation code'
            });
        }

        const evalCode = codes[0];

        // 2. Check if already joined (in supervisor_evaluations)
        const [existing] = await promisePool.query(
            `SELECT id FROM supervisor_evaluations 
             WHERE evaluator_id = ? AND evaluatee_id = ? AND evaluation_period_id = ?`,
            [vpaa_id, evalCode.evaluatee_id, evalCode.evaluation_period_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You have already joined this evaluation'
            });
        }

        // 3. Create evaluation record in supervisor_evaluations
        await promisePool.query(
            `INSERT INTO supervisor_evaluations 
             (evaluator_id, evaluatee_id, evaluation_period_id, evaluator_position, status)
             VALUES (?, ?, ?, 'VPAA', 'pending')`,
            [vpaa_id, evalCode.evaluatee_id, evalCode.evaluation_period_id]
        );

        // 4. Mark code as used
        await promisePool.query(
            `UPDATE supervisor_evaluation_codes SET status = 'used' WHERE id = ?`,
            [evalCode.id]
        );

        res.json({
            success: true,
            message: 'Successfully joined evaluation'
        });

    } catch (error) {
        console.error('Error joining evaluation:', error);
        res.status(500).json({
            success: false,
            message: 'Error joining evaluation',
            error: error.message
        });
    }
});

/**
 * GET /api/vpaa/my-evaluations/:vpaaId
 * Get all evaluations for VPAA
 */
router.get('/my-evaluations/:vpaaId', async (req, res) => {
    try {
        const { vpaaId } = req.params;

        const [evaluations] = await promisePool.query(`
            SELECT 
                se.*,
                CONCAT(f.first_name, ' ', f.last_name) as dean_name,
                f.email as dean_email,
                c.college_name,
                ep.period_name as semester
            FROM supervisor_evaluations se
            LEFT JOIN faculty f ON se.evaluatee_id = f.id
            LEFT JOIN colleges c ON f.college_id = c.id
            LEFT JOIN evaluation_periods ep ON se.evaluation_period_id = ep.id
            WHERE se.evaluator_id = ? AND se.evaluator_position = 'VPAA'
            ORDER BY se.created_at DESC
        `, [vpaaId]);

        res.json({
            success: true,
            data: evaluations
        });
    } catch (error) {
        console.error('Error fetching evaluations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching evaluations',
            error: error.message
        });
    }
});

/**
 * POST /api/vpaa/submit-evaluation
 * Submit evaluation for a dean
 */
router.post('/submit-evaluation', async (req, res) => {
    try {
        const { evaluation_id, scores, comments, ratings } = req.body;
        // scores might be an object { commitment, knowledge, teaching, management, total }

        if (!evaluation_id) {
            return res.status(400).json({
                success: false,
                message: 'Evaluation ID is required'
            });
        }

        const { commitment, knowledge, teaching, management } = scores || {};

        // Extract ratings from the request (it might be in 'ratings' or inside 'comments' string if legacy)
        let ratingsObj = ratings || {};
        let additionalComments = comments;

        // Backward compatibility if ratings are inside comments string
        if (!ratings && typeof comments === 'string' && comments.startsWith('{')) {
            try {
                const parsed = JSON.parse(comments);
                if (parsed.ratings) {
                    ratingsObj = parsed.ratings;
                    additionalComments = parsed.comments || '';
                }
            } catch (e) {
                // Not JSON, ignore
            }
        }

        // Calculate accurate average from ratings if available
        let finalTotalScore = scores?.total;

        if (Object.keys(ratingsObj).length > 0) {
            const allRatings = Object.values(ratingsObj).flat();
            if (allRatings.length > 0) {
                const sum = allRatings.reduce((a, b) => a + Number(b), 0);
                finalTotalScore = (sum / allRatings.length).toFixed(2);
            }

            // Save ratings to database
            // First delete existing ratings for this evaluation (to allow re-submission/updates)
            await promisePool.query('DELETE FROM supervisor_evaluation_ratings WHERE evaluation_id = ?', [evaluation_id]);

            // Insert new ratings
            const insertValues = [];
            Object.entries(ratingsObj).forEach(([category, catRatings]) => {
                catRatings.forEach((rating, index) => {
                    insertValues.push([evaluation_id, category, index, rating]);
                });
            });

            if (insertValues.length > 0) {
                await promisePool.query(
                    'INSERT INTO supervisor_evaluation_ratings (evaluation_id, category, criterion_index, rating) VALUES ?',
                    [insertValues]
                );
            }
        }

        await promisePool.query(
            `UPDATE supervisor_evaluations 
             SET score_commitment = ?, 
                 score_knowledge = ?, 
                 score_teaching = ?, 
                 score_management = ?, 
                 total_score = ?,
                 comments = ?, 
                 status = 'completed', 
                 submitted_at = NOW()
             WHERE id = ?`,
            [commitment, knowledge, teaching, management, finalTotalScore, additionalComments, evaluation_id]
        );

        res.json({
            success: true,
            message: 'Evaluation submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting evaluation:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting evaluation',
            error: error.message
        });
    }
});

module.exports = router;
