const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * POST /api/student/evaluations/validate
 * Validate evaluation code and return assignment details
 */
router.post('/validate', async (req, res) => {
    try {
        const { code, studentId } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Evaluation code is required'
            });
        }

        // 1. Find the assignment with this code
        const [assignments] = await promisePool.query(`
            SELECT 
                fa.id as assignment_id,
                fa.subject_id,
                fa.faculty_id,
                s.subject_code,
                s.subject_name,
                f.first_name,
                f.last_name,
                f.position as faculty_role
            FROM faculty_assignments fa
            JOIN subjects s ON fa.subject_id = s.id
            JOIN faculty f ON fa.faculty_id = f.id
            WHERE fa.eval_code = ? AND fa.status = 'active'
        `, [code]);

        if (assignments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Invalid evaluation code'
            });
        }

        const assignment = assignments[0];

        // 2. Check if student has already evaluated this assignment
        // Assuming studentId is provided. If not, we might skipped this check or require it.
        // For now, we'll proceed pending logic. 
        // Ideally, we should check the 'student_evaluations' table.

        let hasEvaluated = false;
        if (studentId) {
            const [evals] = await promisePool.query(
                'SELECT id FROM student_evaluations WHERE student_id = ? AND faculty_assignment_id = ?',
                [studentId, assignment.assignment_id]
            );
            if (evals.length > 0) {
                hasEvaluated = true;
            }
        }

        if (hasEvaluated) {
            return res.status(400).json({
                success: false,
                message: 'You have already evaluated this subject'
            });
        }

        res.json({
            success: true,
            data: {
                id: assignment.assignment_id,
                subject: `${assignment.subject_code} - ${assignment.subject_name}`,
                instructor: `${assignment.first_name} ${assignment.last_name}`,
                facultyRole: assignment.faculty_role,
                status: 'Pending'
            }
        });

    } catch (error) {
        console.error('Error validating code:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating code',
            error: error.message
        });
    }
});

/**
 * GET /api/student/evaluations/assignment/:assignmentId
 * Get faculty role for an assignment
 */
router.get('/assignment/:assignmentId', async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const [assignments] = await promisePool.query(`
            SELECT f.position as faculty_role
            FROM faculty_assignments fa
            JOIN faculty f ON fa.faculty_id = f.id
            WHERE fa.id = ?
        `, [assignmentId]);

        if (assignments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        res.json({
            success: true,
            facultyRole: assignments[0].faculty_role
        });

    } catch (error) {
        console.error('Error fetching faculty role:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching faculty role',
            error: error.message
        });
    }
});

/**
 * POST /api/student/evaluations/submit
 * Submit completed evaluation
 */
router.post('/submit', async (req, res) => {
    try {
        const { studentId, assignmentId, ratings, comments } = req.body;

        if (!studentId || !assignmentId || !ratings) {
            return res.status(400).json({
                success: false,
                message: 'Student ID, Assignment ID, and ratings are required'
            });
        }

        // Get current active evaluation period (you may need to adjust this query)
        const [periods] = await promisePool.query(
            'SELECT id FROM evaluation_periods WHERE status = "active" LIMIT 1'
        );

        if (periods.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No active evaluation period found'
            });
        }

        const evaluationPeriodId = periods[0].id;

        // Check if student has already evaluated this assignment
        const [existing] = await promisePool.query(
            'SELECT id FROM student_evaluations WHERE student_id = ? AND faculty_assignment_id = ? AND evaluation_period_id = ?',
            [studentId, assignmentId, evaluationPeriodId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted an evaluation for this subject'
            });
        }

        // Create student evaluation record with comments
        const [evalResult] = await promisePool.query(
            `INSERT INTO student_evaluations (student_id, faculty_assignment_id, evaluation_period_id, status, comments, submitted_at)
             VALUES (?, ?, ?, 'completed', ?, NOW())`,
            [studentId, assignmentId, evaluationPeriodId, comments || null]
        );

        const evaluationId = evalResult.insertId;

        // Get all criteria from database
        const [criteria] = await promisePool.query(
            'SELECT id, category, criterion_text FROM evaluation_criteria WHERE status = "active" ORDER BY order_num'
        );

        // Map ratings to criteria and insert responses
        // The ratings object keys are in format "Category-index"
        const responses = [];

        for (const [key, rating] of Object.entries(ratings)) {
            // Find matching criterion
            const [category, indexStr] = key.split('-');
            const index = parseInt(indexStr);

            // Find the criterion that matches this category and index
            const categoryKey = Object.keys(EVALUATION_CRITERIA).find(k => k.startsWith(category.split('.')[0]));
            if (categoryKey) {
                const criterionText = EVALUATION_CRITERIA[categoryKey][index];
                const criterion = criteria.find(c => c.criterion_text === criterionText);

                if (criterion) {
                    responses.push([evaluationId, criterion.id, rating]);
                }
            }
        }

        // Insert all responses
        if (responses.length > 0) {
            await promisePool.query(
                'INSERT INTO evaluation_responses (evaluation_id, criterion_id, rating) VALUES ?',
                [responses]
            );
        }

        res.json({
            success: true,
            message: 'Evaluation submitted successfully',
            evaluationId
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

// Evaluation criteria for mapping (same as frontend)
const EVALUATION_CRITERIA = {
    'A. Commitment': [
        'Demonstrates sensitivity to students\' ability to attend and absorb content information.',
        'Integrates sensitively his/her learning objectives with those of the students in a collaborative process.',
        'Makes self available to students beyond official time.',
        'Regularly comes to class on time, well-groomed and well-prepared to complete assigned responsibilities.',
        'Keeps accurate records of students\' performance and prompt submission of the same.'
    ],
    'B. Knowledge of Subject': [
        'Demonstrates mastery of the subject matter (explains the subject matter without relying solely on the prescribed textbook).',
        'Draws and shares information on the state of the art of theory and practice in his/her discipline.',
        'Integrates subject to practical circumstances and learning intents/purposes of students.',
        'Explains the relevance of the present topic to the previous lessons and relates the subject matter to relevant current issues or daily life activities.',
        'Demonstrates up-to-date knowledge and/or awareness on current trends and issues of the subject.'
    ],
    'C. Teaching for Independent Learning': [
        'Creates teaching strategies that allow students to practice using concepts they need to understand (interactive discussion).',
        'Enhances student self-esteem and/or gives due recognition to students\' performance/potentials.',
        'Allows students to create their own course with objectives and realistically defined student-professor rules and makes them accountable for them.',
        'Allows students to think independently and make their own decisions and holds them accountable for their performance based largely on their success in executing decisions.',
        'Encourages students to learn beyond what is required and helps/ guides the students how to apply the concepts learned.'
    ],
    'D. Management of Learning': [
        'Creates opportunities for intensive and/or extensive contribution of the students in class activities (e.g., breaks class into dyads, triads, or buzz/task groups).',
        'Assumes roles of facilitator, resource person, coach, inquisitor, integrator, referee in drawing students to contribute to knowledge and understanding of concepts at hand.',
        'Designs and implements learning conditions and experiences that promote healthy exchange and/or confrontations.',
        'Structures/re-structures learning and teaching-learning context to enhance attainment of collective learning objectives.',
        'Uses instructional materials (audio-visual materials, field trips, film showing, computer-aided instruction, etc.) to reinforce learning processes.'
    ]
};

module.exports = router;
