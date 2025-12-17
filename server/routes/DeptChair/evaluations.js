const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * POST /api/dept-chair/evaluations/validate
 * Validate evaluation code and return assignment details
 */
router.post('/validate', async (req, res) => {
    try {
        const { code, evaluatorId, departmentId } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Evaluation code is required'
            });
        }

        // 1. Check if it's a Supervisor Evaluation Code (starts with SUP)
        if (code.startsWith('SUP')) {
            const [supCodes] = await promisePool.query(`
                SELECT 
                    sec.id as code_id,
                    sec.evaluatee_id,
                    f.first_name,
                    f.last_name,
                    f.position as faculty_role,
                    f.department_id
                FROM supervisor_evaluation_codes sec
                JOIN faculty f ON sec.evaluatee_id = f.id
                WHERE sec.code = ? AND sec.status = 'active'
            `, [code]);

            if (supCodes.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Invalid or expired supervisor code'
                });
            }

            const supData = supCodes[0];

            // Check Department Constraint
            if (departmentId && supData.department_id != departmentId) {
                return res.status(403).json({
                    success: false,
                    message: 'This faculty member is not within your assigned department.'
                });
            }

            // Return data formatted for the frontend
            return res.json({
                success: true,
                data: {
                    id: `SUP-${supData.code_id}`, // Unique ID for key
                    evaluateeId: supData.evaluatee_id, // Important for submission
                    subject: 'Faculty Supervision', // Context for Dept Chair
                    evaluatee: `${supData.first_name} ${supData.last_name}`,
                    evaluateeRole: supData.faculty_role,
                    status: 'Pending',
                    type: 'Supervisor' // Flag for frontend submission logic
                }
            });
        }

        // 2. Reject non-SUP codes
        return res.status(404).json({
            success: false,
            message: 'Invalid evaluation code. Only Supervisor (SUP) codes are accepted.'
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
 * GET /api/dept-chair/evaluations/completed/:userId
 * Get completed evaluations for a Dept Chair (supervisor)
 */
router.get('/completed/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch from supervisor_evaluations
        const [evaluations] = await promisePool.query(`
            SELECT 
                se.id,
                se.evaluation_date,
                se.total_score,
                f.first_name,
                f.last_name
            FROM supervisor_evaluations se
            JOIN faculty f ON se.evaluatee_id = f.id
            WHERE se.evaluator_id = ? AND se.status = 'completed'
            ORDER BY se.evaluation_date DESC
        `, [userId]);

        const formattedEvaluations = evaluations.map(evaluation => ({
            id: evaluation.id,
            subject: 'Faculty Supervision', // Static for now as per design
            evaluatee: `${evaluation.first_name} ${evaluation.last_name}`,
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
 * POST /api/dept-chair/evaluations/submit
 * Submit completed evaluation for Dept Chair (Supervisor)
 */
router.post('/submit', async (req, res) => {
    const connection = await promisePool.getConnection();

    try {
        await connection.beginTransaction();

        const { studentId: evaluatorId, assignmentId, ratings, comments, evaluatorName, evaluationDate, evaluationType, evaluateeId: reqEvaluateeId } = req.body;

        // Validation
        if (!evaluatorId || !ratings) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Evaluator ID and ratings are required'
            });
        }

        // Get current active evaluation period (Reuse robust logic)
        let [periods] = await connection.query(
            'SELECT id FROM evaluation_periods WHERE status = "active" ORDER BY id DESC LIMIT 1'
        );

        let evaluationPeriodId;

        if (periods.length > 0) {
            evaluationPeriodId = periods[0].id;
        } else {
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

            const [existingPeriods] = await connection.query(
                'SELECT id FROM evaluation_periods WHERE academic_year_id = ? LIMIT 1',
                [activeYear.id]
            );

            if (existingPeriods.length > 0) {
                evaluationPeriodId = existingPeriods[0].id;
                await connection.query(
                    'UPDATE evaluation_periods SET status = "active", is_active = TRUE WHERE id = ?',
                    [evaluationPeriodId]
                );
            } else {
                const [insResult] = await connection.query(
                    `INSERT INTO evaluation_periods 
                    (academic_year_id, period_name, start_date, end_date, is_active, status)
                    VALUES (?, ?, ?, ?, TRUE, 'active')`,
                    [activeYear.id, periodName, activeYear.start_date, activeYear.end_date]
                );
                evaluationPeriodId = insResult.insertId;
            }
        }

        // Check for existing evaluation in supervisor_evaluations
        // Determine evaluateeId:
        let evaluateeId;
        if (evaluationType === 'Supervisor') {
            evaluateeId = reqEvaluateeId; // Use explicitly passed ID from frontend
        } else {
            evaluateeId = assignmentId; // Fallback or initial assumption
            // Fetch faculty_id from assignment
            const [assignData] = await connection.query(
                'SELECT faculty_id FROM faculty_assignments WHERE id = ?',
                [assignmentId]
            );
            if (assignData.length > 0) {
                evaluateeId = assignData[0].faculty_id;
            }
        }

        const [existing] = await connection.query(
            `SELECT id FROM supervisor_evaluations 
             WHERE evaluator_id = ? AND evaluatee_id = ? AND evaluation_period_id = ?`,
            [evaluatorId, evaluateeId, evaluationPeriodId]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'You have already evaluated this faculty member.'
            });
        }

        // Calculate scores
        const categoryScores = {
            'A. Commitment': 0,
            'B. Knowledge of Subject': 0,
            'C. Teaching for Independent Learning': 0,
            'D. Management of Learning': 0
        };

        for (const [key, rating] of Object.entries(ratings)) {
            const category = Object.keys(categoryScores).find(cat => key.startsWith(cat));
            if (category) {
                categoryScores[category] += parseInt(rating) || 0;
            }
        }

        const scoreCommitment = categoryScores['A. Commitment'];
        const scoreKnowledge = categoryScores['B. Knowledge of Subject'];
        const scoreTeaching = categoryScores['C. Teaching for Independent Learning'];
        const scoreManagement = categoryScores['D. Management of Learning'];
        const totalScore = scoreCommitment + scoreKnowledge + scoreTeaching + scoreManagement;

        // Insert into supervisor_evaluations
        const [evalResult] = await connection.query(
            `INSERT INTO supervisor_evaluations (
                evaluator_id, 
                evaluatee_id,
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
                evaluatorId,
                evaluateeId,
                evaluationPeriodId,
                scoreCommitment,
                scoreKnowledge,
                scoreTeaching,
                scoreManagement,
                totalScore,
                comments || null,
                evaluatorName,
                'Department Chair', // Set position as Department Chair
                evaluationDate
            ]
        );

        const evaluationId = evalResult.insertId;

        // Insert ratings details
        const ratingDetails = [];
        for (const [key, rating] of Object.entries(ratings)) {
            const lastDashIndex = key.lastIndexOf('-');
            const category = key.substring(0, lastDashIndex);
            const criterionIndex = parseInt(key.substring(lastDashIndex + 1));

            ratingDetails.push([
                evaluationId,
                category,
                criterionIndex,
                parseInt(rating) || 0
            ]);
        }

        if (ratingDetails.length > 0) {
            await connection.query(
                `INSERT INTO supervisor_evaluation_ratings 
                 (evaluation_id, category, criterion_index, rating) 
                 VALUES ?`,
                [ratingDetails]
            );
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Evaluation submitted successfully',
            data: { evaluationId }
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

module.exports = router;
