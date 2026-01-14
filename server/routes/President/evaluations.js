const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/president/vpaa-list
 * Get all VPAA accounts for evaluation
 */
router.get('/vpaa-list', async (req, res) => {
    try {
        // Get active academic year first
        const [activeYear] = await promisePool.query(
            "SELECT id, semester FROM academic_years WHERE status = 'active' LIMIT 1"
        );

        if (activeYear.length === 0) {
            return res.json({
                success: true,
                data: [] // No active year means no evaluations can be done/checked efficiently
            });
        }

        const { id: activeAyId, semester: rawSemester } = activeYear[0];

        // Normalize semester to match enum('1st', '2nd')
        let activeSemester = rawSemester;
        if (rawSemester && rawSemester.toString().toLowerCase().includes('1st')) {
            activeSemester = '1st';
        } else if (rawSemester && rawSemester.toString().toLowerCase().includes('2nd')) {
            activeSemester = '2nd';
        }

        const [vpaaList] = await promisePool.query(`
            SELECT 
                ea.id,
                ea.honorific,
                ea.full_name,
                ea.suffix,
                ea.email,
                ea.sex,
                ea.position,
                ea.status,
                CASE 
                    WHEN pe.id IS NOT NULL THEN 1 
                    ELSE 0 
                END as is_evaluated
            FROM evaluator_accounts ea
            LEFT JOIN president_evaluations pe ON 
                pe.vpaa_id = ea.id AND 
                pe.academic_year_id = ? AND 
                pe.semester = ?
            WHERE ea.position = 'VPAA' AND ea.status = 'active'
            ORDER BY ea.full_name ASC
        `, [activeAyId, activeSemester]);

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

        // Parse complex comments JSON to extract specific fields
        let ratingsObj = {};
        let textComments = "";
        let criteriaVersion = "old";

        try {
            // The frontend sends everything packed in 'comments'
            const parsed = typeof comments === 'string' ? JSON.parse(comments) : comments;
            ratingsObj = parsed.ratings || {};
            textComments = parsed.text_comments || "";
            criteriaVersion = parsed.criteria_version || "old";
        } catch (e) {
            // fallback if it's just a simple string
            textComments = comments;
        }

        let evaluationId;

        // Check if evaluation already exists
        const [existing] = await promisePool.query(
            `SELECT id FROM president_evaluations 
             WHERE president_id = ? AND vpaa_id = ? AND academic_year_id = ? AND semester = ?`,
            [president_id, vpaa_id, academic_year_id, semester]
        );

        // Store cleaned comments (without the massive ratings blob)
        // We still keep criteria_version in there for now as it's metadata
        const storageComments = JSON.stringify({
            text_comments: textComments,
            criteria_version: criteriaVersion
        });

        if (existing.length > 0) {
            evaluationId = existing[0].id;
            // Update existing evaluation
            await promisePool.query(
                `UPDATE president_evaluations 
                 SET rating = ?, comments = ?, status = 'completed', evaluated_at = NOW()
                 WHERE id = ?`,
                [rating, storageComments, evaluationId]
            );
        } else {
            // Create new evaluation
            const [result] = await promisePool.query(
                `INSERT INTO president_evaluations 
                 (president_id, vpaa_id, academic_year_id, semester, rating, comments, status, evaluated_at)
                 VALUES (?, ?, ?, ?, ?, ?, 'completed', NOW())`,
                [president_id, vpaa_id, academic_year_id, semester, rating, storageComments]
            );
            evaluationId = result.insertId;
        }

        // --- Save Detailed Ratings to president_evaluation_ratings Table ---
        // Requirement: Table 'president_evaluation_ratings' must exist

        // 1. Delete existing ratings for this evaluation (clean slate)
        await promisePool.query('DELETE FROM president_evaluation_ratings WHERE evaluation_id = ?', [evaluationId]);

        // 2. Prepare new ratings for insertion
        const insertValues = [];

        // ratingsObj keys are formatted as 'CategoryName-Index', e.g., 'A. Commitment-0'
        Object.entries(ratingsObj).forEach(([key, value]) => {
            const lastDashIndex = key.lastIndexOf('-');
            if (lastDashIndex !== -1) {
                const category = key.substring(0, lastDashIndex);
                const index = parseInt(key.substring(lastDashIndex + 1));

                // Only push if we successfully parsed the key
                if (category && !isNaN(index)) {
                    insertValues.push([evaluationId, category, index, value]);
                }
            }
        });

        // 3. Bulk Insert
        if (insertValues.length > 0) {
            await promisePool.query(
                'INSERT INTO president_evaluation_ratings (evaluation_id, category, criterion_index, rating) VALUES ?',
                [insertValues]
            );
        }

        return res.json({
            success: true,
            message: existing.length > 0 ? 'Evaluation updated successfully' : 'Evaluation submitted successfully'
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
