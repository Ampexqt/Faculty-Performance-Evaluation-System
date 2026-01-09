const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/student/dashboard/stats
 * Get student dashboard statistics (Total, Pending, Completed Evaluations)
 * Expects query params: studentId, programId, section
 */
router.get('/stats', async (req, res) => {
    try {
        const { studentId, programId, section } = req.query;

        console.log('Fetching student stats for:', { studentId, programId, section });

        if (!studentId || !section) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: studentId, section'
            });
        }

        // 1. Get current active academic year AND student's year level
        const [activeYear] = await promisePool.query(
            'SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1'
        );

        if (activeYear.length === 0) {
            return res.json({
                success: true,
                stats: {
                    totalEvaluations: 0,
                    pendingEvaluations: 0,
                    completedEvaluations: 0
                },
                message: 'No active academic year found'
            });
        }

        const academicYearId = activeYear[0].id;

        // Fetch student details to get year_level
        const [studentResult] = await promisePool.query(
            'SELECT year_level FROM students WHERE id = ?',
            [studentId]
        );

        if (studentResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const studentYear = studentResult[0].year_level;
        // Construct the section string to look for (e.g., "2-B")
        // We use LIKE to match "2-B", "BSIT 2-B", etc.
        const searchSection = `%${studentYear}-${section}`;

        // 2. Get Total Assignments
        // Filter by active status, academic year, and section match
        const [totalResult] = await promisePool.query(`
            SELECT COUNT(*) as total
            FROM faculty_assignments fa
            JOIN subjects s ON fa.subject_id = s.id
            WHERE 
                fa.status = 'active'
                AND fa.academic_year_id = ?
                AND fa.section LIKE ?
        `, [academicYearId, searchSection]);

        const totalEvaluations = totalResult[0].total || 0;

        // 3. Get Completed Evaluations
        const [completedResult] = await promisePool.query(`
            SELECT COUNT(*) as completed
            FROM student_evaluations se
            JOIN faculty_assignments fa ON se.faculty_assignment_id = fa.id
            WHERE 
                se.student_id = ?
                AND se.status = 'completed'
                AND fa.status = 'active'
                AND fa.academic_year_id = ?
                AND fa.section LIKE ?
        `, [studentId, academicYearId, searchSection]);

        const completedEvaluations = completedResult[0].completed || 0;

        // 4. Calculate Pending
        const pendingEvaluations = Math.max(0, totalEvaluations - completedEvaluations);

        // 5. Calculate Completion Rate
        const completionRate = totalEvaluations > 0
            ? Math.round((completedEvaluations / totalEvaluations) * 100)
            : 0;

        res.json({
            success: true,
            stats: {
                totalEvaluations,
                pendingEvaluations,
                completedEvaluations,
                completionRate
            }
        });

    } catch (error) {
        console.error('Error fetching student dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
});

module.exports = router;
