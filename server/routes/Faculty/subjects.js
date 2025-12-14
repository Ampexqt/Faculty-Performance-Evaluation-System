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
                fa.student_count as total_students,
                (SELECT COUNT(*) 
                 FROM student_evaluations se 
                 WHERE se.faculty_assignment_id = fa.id) as students_evaluated
            FROM faculty_assignments fa
            JOIN subjects s ON fa.subject_id = s.id
            WHERE fa.faculty_id = ? AND fa.status = 'active'
            ORDER BY s.subject_code ASC
        `, [faculty_id]);

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

        // Get recent evaluations
        const [evaluators] = await promisePool.query(`
            SELECT 
                se.id,
                fa.section,
                'Submitted' as status,
                se.submitted_at
            FROM student_evaluations se
            JOIN faculty_assignments fa ON se.faculty_assignment_id = fa.id
            WHERE fa.faculty_id = ?
            ORDER BY se.submitted_at DESC
            LIMIT 5
        `, [faculty_id]);

        // Map to anonymized format
        const processedEvaluators = evaluators.map(ev => ({
            id: ev.id,
            studentName: 'Student Name Hidden',
            section: ev.section,
            status: ev.status
        }));

        res.json({
            success: true,
            data: processedEvaluators
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
