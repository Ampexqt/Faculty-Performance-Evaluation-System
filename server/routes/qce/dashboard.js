const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/qce/stats
 * Get dashboard statistics for the QCE Manager's college
 */
router.get('/', async (req, res) => {
    try {
        const { college_id, department_id } = req.query;

        // If department_id is provided (Dept Chair view)
        if (department_id) {
            // 1. Get Faculty count for this department
            const [facultyResult] = await promisePool.query(
                'SELECT COUNT(*) as count FROM faculty WHERE department_id = ? AND status = "active"',
                [department_id]
            );
            const totalFaculty = facultyResult[0].count;

            // 2. Get active Subjects count for this department
            const [subjectsResult] = await promisePool.query(
                'SELECT COUNT(*) as count FROM subjects WHERE department_id = ? AND status = "active"',
                [department_id]
            );
            const activeSubjects = subjectsResult[0].count;

            // 3. Placeholder for active evaluations
            const activeEvaluations = 0;

            return res.json({
                success: true,
                data: {
                    totalFaculty,
                    activeSubjects,
                    activeEvaluations
                }
            });
        }

        // If only college_id is provided (Dean/QCE Manager view)
        if (!college_id) {
            return res.status(400).json({
                success: false,
                message: 'college_id is required'
            });
        }

        // 1. Get Total Faculty count for this college
        const [facultyResult] = await promisePool.query(
            'SELECT COUNT(*) as count FROM faculty WHERE college_id = ? AND status = "active"',
            [college_id]
        );
        const totalFaculty = facultyResult[0].count;

        // 2. Get Total Programs count for this college
        const [programsResult] = await promisePool.query(
            'SELECT COUNT(*) as count FROM programs WHERE college_id = ? AND status = "active"',
            [college_id]
        );
        const totalPrograms = programsResult[0].count;

        // 3. Get Created and Not Created Evaluation counts
        const [evalStats] = await promisePool.query(`
            SELECT 
                COUNT(CASE WHEN fa.eval_code IS NOT NULL AND fa.eval_code != '' THEN 1 END) as created_count,
                COUNT(CASE WHEN fa.eval_code IS NULL OR fa.eval_code = '' THEN 1 END) as not_created_count
            FROM faculty_assignments fa
            JOIN faculty f ON fa.faculty_id = f.id
            WHERE f.college_id = ? AND fa.status = 'active' AND f.status = 'active'
        `, [college_id]);

        const evaluationsCreated = evalStats[0].created_count;
        const evaluationsNotCreated = evalStats[0].not_created_count;

        res.json({
            success: true,
            data: {
                totalFaculty,
                totalPrograms,
                evaluationsCreated,
                evaluationsNotCreated
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
});

module.exports = router;
