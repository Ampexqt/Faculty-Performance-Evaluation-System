const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/qce/stats
 * Get dashboard statistics for the QCE Manager's college
 */
router.get('/', async (req, res) => {
    try {
        const { college_id } = req.query;

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

        // 2. Get Total Programs (Departments) count for this college
        const [programsResult] = await promisePool.query(
            'SELECT COUNT(*) as count FROM departments WHERE college_id = ? AND status = "active"',
            [college_id]
        );
        const totalPrograms = programsResult[0].count;

        // 3. For Active Evaluations and Pending Dean Evals, 
        // we'll use placeholders for now as per current phase, 
        // or query real tables if available in future.
        const activeEvaluations = 0;
        const pendingDeanEvals = 0;

        res.json({
            success: true,
            data: {
                totalFaculty,
                totalPrograms,
                activeEvaluations,
                pendingDeanEvals
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
