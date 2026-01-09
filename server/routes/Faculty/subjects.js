const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/faculty/subjects/list
 * Get all subjects assigned to a faculty member
 */
router.get('/list', async (req, res) => {
    try {
        const { faculty_id } = req.query;

        if (!faculty_id) {
            return res.status(400).json({
                success: false,
                message: 'Faculty ID is required'
            });
        }

        // Get assigned subjects with evaluation progress
        const [subjects] = await promisePool.query(`
            SELECT 
                fa.id,
                s.subject_code,
                s.subject_name,
                fa.section,
                fa.eval_code,
                (SELECT COUNT(*) 
                 FROM students st 
                 WHERE (st.section = fa.section OR CONCAT(st.year_level, '-', st.section) = fa.section) 
                 AND st.status = 'active') as total_students,
                (SELECT COUNT(DISTINCT student_id) 
                 FROM student_evaluations se 
                 WHERE se.faculty_assignment_id = fa.id) as students_evaluated,
                (SELECT COUNT(*) 
                 FROM supervisor_evaluations se 
                 WHERE se.evaluatee_id = ?) as supervisor_evaluated
            FROM faculty_assignments fa
            JOIN subjects s ON fa.subject_id = s.id
            WHERE fa.faculty_id = ? AND fa.status = 'active'
            ORDER BY s.subject_code ASC
        `, [faculty_id, faculty_id]);

        // Eval code is currently not generated here, controlled by QCE
        const processedSubjects = subjects.map(sub => ({
            ...sub,
            evalCode: sub.eval_code
        }));

        res.json({
            success: true,
            data: processedSubjects
        });

    } catch (error) {
        console.error('Error fetching faculty subjects:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subjects',
            error: error.message
        });
    }
});

/**
 * GET /api/faculty/subjects/evaluators
 * Get recent evaluators (anonymized)
 */
router.get('/evaluators', async (req, res) => {
    try {
        const { faculty_id } = req.query;

        if (!faculty_id) {
            return res.status(400).json({
                success: false,
                message: 'Faculty ID is required'
            });
        }

        // Get recent evaluations (Students)
        const [studentEvaluations] = await promisePool.query(`
            SELECT 
                se.id,
                CONCAT(st.year_level, '-', st.section) as section,
                'Submitted' as status,
                se.submitted_at
            FROM student_evaluations se
            JOIN faculty_assignments fa ON se.faculty_assignment_id = fa.id
            JOIN students st ON se.student_id = st.id
            WHERE fa.faculty_id = ?
            ORDER BY se.submitted_at DESC
            LIMIT 5
        `, [faculty_id]);

        // Get supervisor evaluations
        const [supervisorEvaluations] = await promisePool.query(`
            SELECT 
                id,
                evaluator_position,
                'Submitted' as status,
                submitted_at
            FROM supervisor_evaluations
            WHERE evaluatee_id = ?
            ORDER BY submitted_at DESC
            LIMIT 5
        `, [faculty_id]);

        const processedEvaluators = studentEvaluations.map(ev => ({
            id: ev.id,
            studentName: 'Student Name Hidden',
            section: ev.section,
            status: ev.status,
            type: 'student',
            date: ev.submitted_at
        }));

        const processedSupervisors = supervisorEvaluations.map(ev => ({
            id: ev.id,
            name: ev.evaluator_position,
            status: ev.status,
            type: 'supervisor',
            date: ev.submitted_at
        }));

        // Get total counts
        const [studentCount] = await promisePool.query(`
            SELECT COUNT(*) as count 
            FROM student_evaluations se
            JOIN faculty_assignments fa ON se.faculty_assignment_id = fa.id
            WHERE fa.faculty_id = ?
        `, [faculty_id]);

        const [supervisorCount] = await promisePool.query(`
            SELECT COUNT(*) as count FROM supervisor_evaluations WHERE evaluatee_id = ?
        `, [faculty_id]);

        res.json({
            success: true,
            data: processedEvaluators,
            supervisorData: processedSupervisors,
            counts: {
                student: studentCount[0].count,
                supervisor: supervisorCount[0].count
            }
        });

    } catch (error) {
        console.error('Error fetching evaluators:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching evaluators',
            error: error.message
        });
    }
});

module.exports = router;
