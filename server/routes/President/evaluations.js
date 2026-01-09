const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/president/vpaa-list
 * Get all VPAA accounts for evaluation
 */
router.get('/vpaa-list', async (req, res) => {
    try {
        const [vpaaList] = await promisePool.query(`
            SELECT 
                id,
                full_name,
                email,
                sex,
                position,
                status
            FROM evaluator_accounts
            WHERE position = 'VPAA' AND status = 'active'
            ORDER BY full_name ASC
        `);

        res.json({
            success: true,
            data: vpaaList
        });
    } catch (error) {
        console.error('Error fetching VPAA list:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching VPAA list',
            error: error.message
        });
    }
});

/**
 * POST /api/president/evaluate-vpaa
 * President evaluates VPAA (no code needed)
 */
router.post('/evaluate-vpaa', async (req, res) => {
    try {
        let { president_id, vpaa_id, academic_year_id, semester, rating, comments } = req.body;

        // Normalize semester to match enum('1st', '2nd')
        if (semester && semester.toString().toLowerCase().includes('1st')) {
            semester = '1st';
        } else if (semester && semester.toString().toLowerCase().includes('2nd')) {
            semester = '2nd';
        }

        if (!president_id || !vpaa_id || !academic_year_id || !semester) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        // Check if evaluation already exists
        const [existing] = await promisePool.query(
            `SELECT id FROM president_evaluations 
             WHERE president_id = ? AND vpaa_id = ? AND academic_year_id = ? AND semester = ?`,
            [president_id, vpaa_id, academic_year_id, semester]
        );

        if (existing.length > 0) {
            // Update existing evaluation
            await promisePool.query(
                `UPDATE president_evaluations 
                 SET rating = ?, comments = ?, status = 'completed', evaluated_at = NOW()
                 WHERE id = ?`,
                [rating, comments, existing[0].id]
            );

            return res.json({
                success: true,
                message: 'Evaluation updated successfully'
            });
        } else {
            // Create new evaluation
            await promisePool.query(
                `INSERT INTO president_evaluations 
                 (president_id, vpaa_id, academic_year_id, semester, rating, comments, status, evaluated_at)
                 VALUES (?, ?, ?, ?, ?, ?, 'completed', NOW())`,
                [president_id, vpaa_id, academic_year_id, semester, rating, comments]
            );

            return res.json({
                success: true,
                message: 'Evaluation submitted successfully'
            });
        }
    } catch (error) {
        console.error('Error submitting evaluation:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting evaluation',
            error: error.message
        });
    }
});

/**
 * GET /api/president/evaluations
 * Get all evaluations by president
 */
router.get('/evaluations/:presidentId', async (req, res) => {
    try {
        const { presidentId } = req.params;

        const [evaluations] = await promisePool.query(`
            SELECT 
                pe.*,
                ea.full_name as vpaa_name,
                ea.email as vpaa_email
            FROM president_evaluations pe
            LEFT JOIN evaluator_accounts ea ON pe.vpaa_id = ea.id
            WHERE pe.president_id = ?
            ORDER BY pe.created_at DESC
        `, [presidentId]);

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

module.exports = router;
