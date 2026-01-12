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
                fa.section as assignment_section,
                fa.criteria_type,
                s.subject_code,
                s.subject_name,
                s.department_id as subject_department_id,
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

        // 2. Validate Student Year Level, Section, and Department/Program
        if (studentId) {
            // Fetch student details with program code
            const [students] = await promisePool.query(`
                SELECT s.year_level, s.section, s.department_id, p.program_code 
                FROM students s
                LEFT JOIN programs p ON s.program_id = p.id
                WHERE s.id = ?
            `, [studentId]);

            if (students.length > 0) {
                const student = students[0];
                const studentYearLevel = student.year_level;
                const studentSection = student.section;
                const programCode = student.program_code;
                const assignmentSection = assignment.assignment_section;

                // Construction of signatures
                const studentYearSection = `${studentYearLevel}-${studentSection}`;
                const normalizedAssignmentSection = assignmentSection.replace(/\s+/g, '').toUpperCase();
                const normalizedLegacySig = studentYearSection.replace(/\s+/g, '').toUpperCase(); // "2-B"

                let allowed = false;

                // Check 1: Strict Program Match (e.g. "BSIT2-B")
                // This allows cross-department evaluation if explicitly assigned (e.g. Gen Ed assigns to BSIT 2-B)
                if (programCode) {
                    const strictSig = `${programCode}${studentYearSection}`.replace(/\s+/g, '').toUpperCase();
                    if (normalizedAssignmentSection.includes(strictSig)) {
                        allowed = true;
                    }
                }

                // Check 2: Same Department Fallback (Legacy "2-B")
                // Only allow ambiguous "2-B" match if Student and Subject are from same Department
                if (!allowed && normalizedAssignmentSection.includes(normalizedLegacySig)) {
                    if (student.department_id === assignment.subject_department_id) {
                        allowed = true;
                    }
                }

                if (!allowed) {
                    return res.status(400).json({
                        success: false,
                        message: `This evaluation is not intended for your section/program. Assignment: ${assignmentSection}, You: ${programCode ? programCode + ' ' : ''}${studentYearLevel}-${studentSection}.`
                    });
                }
            }
        }

        // 3. Check if student has already evaluated this assignment
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
                status: 'Pending',
                criteriaType: assignment.criteria_type || 'old'
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
 * GET /api/student/evaluations/completed/:studentId
 * Get completed evaluations for a student
 */
router.get('/completed/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        const [evaluations] = await promisePool.query(`
            SELECT 
                se.id,
                se.evaluation_date,
                se.total_score,
                s.subject_code,
                s.subject_name,
                f.first_name,
                f.last_name
            FROM student_evaluations se
            JOIN faculty_assignments fa ON se.faculty_assignment_id = fa.id
            JOIN subjects s ON fa.subject_id = s.id
            JOIN faculty f ON fa.faculty_id = f.id
            WHERE se.student_id = ? AND se.status = 'completed'
            ORDER BY se.evaluation_date DESC
        `, [studentId]);

        const formattedEvaluations = evaluations.map(evaluation => ({
            id: evaluation.id,
            subject: `${evaluation.subject_code} - ${evaluation.subject_name}`,
            instructor: `${evaluation.first_name} ${evaluation.last_name}`,
            completedDate: new Date(evaluation.evaluation_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            totalScore: evaluation.total_score
        }));

        res.json({
            success: true,
            data: formattedEvaluations
        });

    } catch (error) {
        console.error('Error fetching completed evaluations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching completed evaluations'
        });
    }
});

/**
 * POST /api/student/evaluations/submit
 * Submit completed evaluation with all details
 */
router.post('/submit', async (req, res) => {
    const connection = await promisePool.getConnection();

    try {
        await connection.beginTransaction();

        const { studentId, assignmentId, ratings, comments, evaluatorName, evaluationDate, criteriaType } = req.body;

        // Validation
        if (!studentId || !assignmentId || !ratings) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Student ID, Assignment ID, and ratings are required'
            });
        }

        if (!evaluatorName || !evaluationDate) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Evaluator name and date are required'
            });
        }

        // Get current active evaluation period
        let [periods] = await connection.query(
            'SELECT id FROM evaluation_periods WHERE status = "active" ORDER BY id DESC LIMIT 1'
        );

        let evaluationPeriodId;

        if (periods.length > 0) {
            evaluationPeriodId = periods[0].id;
        } else {
            // Fallback: Check for active Academic Year and auto-create evaluation period if missing
            // This handles cases where Zonal Admin activates a year but doesn't explicitly create an eval period
            const [activeYears] = await connection.query(
                'SELECT id, year_label, semester, start_date, end_date FROM academic_years WHERE status = "active" LIMIT 1'
            );

            if (activeYears.length === 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'No active academic year found. Please contact the administrator.'
                });
            }

            const activeYear = activeYears[0];
            const periodName = `Evaluation Period ${activeYear.year_label} ${activeYear.semester}`;

            // Check if one exists but maybe inactive? If so, reactivate it? 
            // For now, just create new if not found active. To avoid duplicates, check by academic_year_id first.
            const [existingPeriods] = await connection.query(
                'SELECT id FROM evaluation_periods WHERE academic_year_id = ? LIMIT 1',
                [activeYear.id]
            );

            if (existingPeriods.length > 0) {
                // Reactivate it
                evaluationPeriodId = existingPeriods[0].id;
                await connection.query(
                    'UPDATE evaluation_periods SET status = "active", is_active = TRUE WHERE id = ?',
                    [evaluationPeriodId]
                );
            } else {
                // Create new
                const [insResult] = await connection.query(
                    `INSERT INTO evaluation_periods 
                    (academic_year_id, period_name, start_date, end_date, is_active, status)
                    VALUES (?, ?, ?, ?, TRUE, 'active')`,
                    [activeYear.id, periodName, activeYear.start_date, activeYear.end_date]
                );
                evaluationPeriodId = insResult.insertId;
            }
        }

        // Check if student has already evaluated this assignment
        const [existing] = await connection.query(
            'SELECT id FROM student_evaluations WHERE student_id = ? AND faculty_assignment_id = ?',
            [studentId, assignmentId]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'You have already submitted an evaluation for this subject'
            });
        }

        // Calculate category scores
        // Calculate category scores based on prefix (works for both Old and New criteria titles)
        let scoreCommitment = 0;
        let scoreKnowledge = 0;
        let scoreTeaching = 0;
        let scoreManagement = 0;

        for (const [key, rating] of Object.entries(ratings)) {
            const val = parseInt(rating) || 0;
            if (key.startsWith('A.')) scoreCommitment += val;
            else if (key.startsWith('B.')) scoreKnowledge += val;
            else if (key.startsWith('C.')) scoreTeaching += val;
            else if (key.startsWith('D.')) scoreManagement += val;
        }

        let totalScore = scoreCommitment + scoreKnowledge + scoreTeaching + scoreManagement;

        // Normalize total score to 100-point scale if using new criteria (Max raw score is 75)
        if (criteriaType === 'new') {
            totalScore = (totalScore / 75) * 100;
        }

        // Insert main evaluation record with all details
        const [evalResult] = await connection.query(
            `INSERT INTO student_evaluations (
                student_id, 
                faculty_assignment_id, 
                evaluation_period_id,
                score_commitment,
                score_knowledge,
                score_teaching,
                score_management,
                total_score,
                comments,
                evaluator_name,
                evaluator_position,
                evaluation_date,
                status,
                submitted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', NOW())`,
            [
                studentId,
                assignmentId,
                evaluationPeriodId,
                scoreCommitment,
                scoreKnowledge,
                scoreTeaching,
                scoreManagement,
                totalScore,
                comments || null,
                evaluatorName,
                'Student',
                evaluationDate
            ]
        );

        const evaluationId = evalResult.insertId;

        // Insert detailed ratings for each criterion
        const ratingDetails = [];

        for (const [key, rating] of Object.entries(ratings)) {
            // Parse the key format: "A. Commitment-0", "B. Knowledge of Subject-1", etc.
            const lastDashIndex = key.lastIndexOf('-');
            const category = key.substring(0, lastDashIndex);
            const criterionIndex = parseInt(key.substring(lastDashIndex + 1));

            // Map category to short code
            let categoryCode = '';
            if (category.startsWith('A.')) categoryCode = 'A';
            else if (category.startsWith('B.')) categoryCode = 'B';
            else if (category.startsWith('C.')) categoryCode = 'C';
            else if (category.startsWith('D.')) categoryCode = 'D';

            if (categoryCode) {
                ratingDetails.push([
                    evaluationId,
                    categoryCode,
                    criterionIndex,
                    parseInt(rating) || 0
                ]);
            }
        }

        // Insert all rating details
        if (ratingDetails.length > 0) {
            await connection.query(
                `INSERT INTO evaluation_ratings_detail 
                (evaluation_id, category, criterion_index, rating) 
                VALUES ?`,
                [ratingDetails]
            );
        }

        // Also save comment to evaluation_comments table if it exists
        if (comments && comments.trim().length > 0) {
            await connection.query(
                'INSERT INTO evaluation_comments (evaluation_id, comment_text) VALUES (?, ?)',
                [evaluationId, comments]
            );
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Evaluation submitted successfully',
            data: {
                evaluationId,
                totalScore,
                categoryScores: {
                    commitment: scoreCommitment,
                    knowledge: scoreKnowledge,
                    teaching: scoreTeaching,
                    management: scoreManagement
                }
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error submitting evaluation:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting evaluation',
            error: error.message
        });
    } finally {
        connection.release();
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
