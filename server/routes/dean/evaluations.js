const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

// Initialize tables if they don't exist
const initializeTables = async () => {
    try {
        const connection = await promisePool.getConnection();

        // Admin/Supervisor Evaluations Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS admin_evaluations (
                id INT PRIMARY KEY AUTO_INCREMENT,
                evaluator_id INT NOT NULL,
                faculty_assignment_id INT NOT NULL,
                evaluation_period_id INT NOT NULL,
                score_commitment DECIMAL(5,2),
                score_knowledge DECIMAL(5,2),
                score_teaching DECIMAL(5,2),
                score_management DECIMAL(5,2),
                total_score DECIMAL(5,2),
                comments TEXT,
                evaluator_name VARCHAR(100),
                evaluator_position VARCHAR(100),
                evaluation_date DATE,
                status ENUM('pending', 'completed') DEFAULT 'pending',
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (faculty_assignment_id) REFERENCES faculty_assignments(id) ON DELETE CASCADE,
                FOREIGN KEY (evaluation_period_id) REFERENCES evaluation_periods(id) ON DELETE CASCADE
            )
        `);

        // Admin Evaluation Ratings Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS admin_evaluation_ratings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                evaluation_id INT NOT NULL,
                category VARCHAR(50),
                criterion_index INT,
                rating INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (evaluation_id) REFERENCES admin_evaluations(id) ON DELETE CASCADE
            )
        `);

        connection.release();
        console.log('Admin evaluation tables initialized');
    } catch (error) {
        console.error('Error initializing admin tables:', error);
    }
};

// Run initialization
initializeTables();

/**
 * POST /api/dean/evaluations/validate
 * Validate evaluation code and return assignment details
 */
router.post('/validate', async (req, res) => {
    try {
        const { code, evaluatorId, collegeId } = req.body;

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
                    f.college_id
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

            // Check College Constraint
            if (collegeId && supData.college_id != collegeId) {
                return res.status(403).json({
                    success: false,
                    message: 'This faculty member is not within your assigned college.'
                });
            }

            // Return data formatted for the frontend
            return res.json({
                success: true,
                data: {
                    id: `SUP-${supData.code_id}`, // Unique ID for key
                    evaluateeId: supData.evaluatee_id, // Important for submission
                    subject: 'Faculty Supervision', // Context for Dean
                    evaluatee: `${supData.first_name} ${supData.last_name}`,
                    evaluateeRole: supData.faculty_role,
                    status: 'Pending',
                    type: 'Supervisor' // Flag for frontend submission logic
                }
            });
        }

        // 2. Fallback to Standard Assignment-based (Dept Chair code)
        // Join with faculty and departments to check college
        const [assignments] = await promisePool.query(`
            SELECT 
                fa.id as assignment_id,
                fa.subject_id,
                fa.faculty_id,
                s.subject_code,
                s.subject_name,
                f.first_name,
                f.last_name,
                f.position as faculty_role,
                f.college_id
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

        // Remove 'const' to use outer scope or if isolated, this simple block is fine but IDE complains about scope leak?
        // Actually, 'assignment' here is fine if 'const' was not used before in the same block scope. 
        // But since I pasted it sequentially in the previous step, it might be colliding if I didn't verify scope.
        // Let's create a new block for this fallback logic to isolate variables.
        {
            const assignment = assignments[0];

            // Check if evaluatee (faculty) is in the Dean's college
            if (collegeId && assignment.college_id != collegeId) {
                return res.status(403).json({
                    success: false,
                    message: 'This faculty member is not within your assigned college.'
                });
            }

            // Check if already evaluated (Admin/Dean evaluation on assignment)
            let hasEvaluated = false;
            if (evaluatorId) {
                const [evals] = await promisePool.query(
                    'SELECT id FROM admin_evaluations WHERE evaluator_id = ? AND faculty_assignment_id = ?',
                    [evaluatorId, assignment.assignment_id]
                );
                if (evals.length > 0) {
                    hasEvaluated = true;
                }
            }

            if (hasEvaluated) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already evaluated this faculty for this assignment'
                });
            }

            res.json({
                success: true,
                data: {
                    id: assignment.assignment_id, // Assignment ID
                    evaluateeId: assignment.faculty_id,
                    subject: `${assignment.subject_code} - ${assignment.subject_name}`,
                    evaluatee: `${assignment.first_name} ${assignment.last_name}`,
                    evaluateeRole: assignment.faculty_role,
                    status: 'Pending',
                    type: 'Assignment'
                }
            });
        }

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
 * GET /api/dean/evaluations/completed/:userId
 * Get completed evaluations for a dean
 */
router.get('/completed/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const [evaluations] = await promisePool.query(`
            SELECT 
                ae.id,
                ae.evaluation_date,
                ae.total_score,
                s.subject_code,
                s.subject_name,
                f.first_name,
                f.last_name
            FROM admin_evaluations ae
            JOIN faculty_assignments fa ON ae.faculty_assignment_id = fa.id
            JOIN subjects s ON fa.subject_id = s.id
            JOIN faculty f ON fa.faculty_id = f.id
            WHERE ae.evaluator_id = ? AND ae.status = 'completed'
            ORDER BY ae.evaluation_date DESC
        `, [userId]);

        const formattedEvaluations = evaluations.map(evaluation => ({
            id: evaluation.id,
            subject: `${evaluation.subject_code} - ${evaluation.subject_name}`,
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
 * POST /api/dean/evaluations/submit
 * Submit completed evaluation for Dean
 */
router.post('/submit', async (req, res) => {
    const connection = await promisePool.getConnection();

    try {
        await connection.beginTransaction();

        const { studentId: evaluatorId, assignmentId, ratings, comments, evaluatorName, evaluationDate, evaluationType } = req.body;

        // Validation
        if (!evaluatorId || !ratings) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Evaluator ID and ratings are required'
            });
        }

        // Get current active evaluation period
        const [periods] = await connection.query(
            'SELECT id FROM evaluation_periods WHERE status = "active" ORDER BY id DESC LIMIT 1'
        );

        if (periods.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'No active evaluation period found. Please contact the administrator.'
            });
        }

        const evaluationPeriodId = periods[0].id;

        // HANDLE SUPERVISOR EVALUATION (No Assignment ID)
        if (evaluationType === 'Supervisor') {
            const evaluateeId = assignmentId; // In Supervisor flow, ID is evaluatee ID.

            // Check existing
            const [existing] = await connection.query(
                `SELECT id FROM admin_evaluations 
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

            // Dynamic table update for evaluatee_id
            try {
                // We use Promise.all to try both ALTERs without waiting (non-blocking if error) but sequentially is safer
                await connection.query("ALTER TABLE admin_evaluations ADD COLUMN evaluatee_id INT NULL AFTER evaluator_id").catch(() => { });
                await connection.query("ALTER TABLE admin_evaluations MODIFY COLUMN faculty_assignment_id INT NULL").catch(() => { });
            } catch (e) {
                // Ignore
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

            const [evalResult] = await connection.query(
                `INSERT INTO admin_evaluations (
                    evaluator_id, 
                    evaluatee_id,
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
                ) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', NOW())`,
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
                    'Supervisor',
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
                    `INSERT INTO admin_evaluation_ratings 
                     (evaluation_id, category, criterion_index, rating) 
                     VALUES ?`,
                    [ratingDetails]
                );
            }

            await connection.commit();
            return res.json({ success: true, message: 'Evaluation submitted successfully', data: { evaluationId } });

        }

        // Check if already evaluated (Standard)
        const [existing] = await connection.query(
            'SELECT id FROM admin_evaluations WHERE evaluator_id = ? AND faculty_assignment_id = ?',
            [evaluatorId, assignmentId]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'You have already submitted an evaluation for this subject'
            });
        }

        // Calculate category scores
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

        const [evalResult] = await connection.query(
            `INSERT INTO admin_evaluations (
                evaluator_id, 
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
                evaluatorId,
                assignmentId,
                evaluationPeriodId,
                scoreCommitment,
                scoreKnowledge,
                scoreTeaching,
                scoreManagement,
                totalScore,
                comments || null,
                evaluatorName,
                'Supervisor', // Deans act as Supervisors
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

            let categoryCode = '';
            if (category.startsWith('A.')) categoryCode = 'A';
            else if (category.startsWith('B.')) categoryCode = 'B';
            else if (category.startsWith('C.')) categoryCode = 'C';
            else if (category.startsWith('D.')) categoryCode = 'D';

            if (categoryCode) {
                ratingDetails.push([
                    evaluationId,
                    category, // Keeping full category name for clarity in new table, or use Code
                    criterionIndex,
                    parseInt(rating) || 0
                ]);
            }
        }

        if (ratingDetails.length > 0) {
            await connection.query(
                `INSERT INTO admin_evaluation_ratings 
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
