const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/faculty/dashboard/stats
 * Get dashboard statistics for a faculty member
 */
router.get('/stats', async (req, res) => {
    try {
        const { faculty_id } = req.query;

        if (!faculty_id) {
            return res.status(400).json({
                success: false,
                message: 'Faculty ID is required'
            });
        }

        // Get stats
        // 1. Assigned Subjects (Active assignments)
        // 2. Total Students Handled (Sum of student_count in active assignments)
        // 3. Students Evaluated (Count of evaluations received)

        const [results] = await promisePool.query(`
            SELECT 
                (SELECT COUNT(*) 
                 FROM faculty_assignments 
                 WHERE faculty_id = ? AND status = 'active') as assigned_subjects,
                
                (SELECT COUNT(*) 
                 FROM students s
                 JOIN faculty_assignments fa ON (s.section = fa.section OR CONCAT(s.year_level, '-', s.section) = fa.section)
                 WHERE fa.faculty_id = ? AND fa.status = 'active' AND s.status = 'active') as total_students_handled,

                (SELECT COUNT(*)
                 FROM student_evaluations se
                 JOIN faculty_assignments fa ON se.faculty_assignment_id = fa.id
                 WHERE fa.faculty_id = ?) as students_evaluated,

                (SELECT COUNT(*) 
                 FROM supervisor_evaluations 
                 WHERE evaluatee_id = ?) as supervisors_evaluated
        `, [faculty_id, faculty_id, faculty_id, faculty_id]);

        const stats = results[0];

        res.json({
            success: true,
            data: {
                assignedSubjects: stats.assigned_subjects,
                totalStudentsHandled: stats.total_students_handled,
                studentsEvaluated: stats.students_evaluated,
                supervisorsEvaluated: stats.supervisors_evaluated
            }
        });

    } catch (error) {
        console.error('Error fetching faculty dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
});

module.exports = router;
