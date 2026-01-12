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

        // Supervisor Evaluations Table (Dean to Faculty)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS supervisor_evaluations (
                id INT PRIMARY KEY AUTO_INCREMENT,
                evaluator_id INT NOT NULL,
                evaluatee_id INT NOT NULL,
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
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (evaluatee_id) REFERENCES faculty(id) ON DELETE CASCADE,
                FOREIGN KEY (evaluation_period_id) REFERENCES evaluation_periods(id) ON DELETE CASCADE
            )
        `);

        // Supervisor Evaluation Ratings Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS supervisor_evaluation_ratings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                evaluation_id INT NOT NULL,
                category VARCHAR(50),
                criterion_index INT,
                rating INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (evaluation_id) REFERENCES supervisor_evaluations(id) ON DELETE CASCADE
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
        const { code, evaluatorId } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Evaluation code is required'
            });
        }

        // 1. Get Evaluator's College (Dean)
        const [evaluatorData] = await promisePool.query(
            'SELECT college_id FROM faculty WHERE id = ?',
            [evaluatorId]
        );

        if (evaluatorData.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Evaluator not found'
            });
        }

        const evaluator = evaluatorData[0];

        // 2. Check if it's a Supervisor Evaluation Code (starts with SUP)
        if (code.startsWith('SUP')) {
            const [supCodes] = await promisePool.query(`
                SELECT 
                    sec.id as code_id,
                    sec.evaluatee_id,
                    f.first_name,
                    f.last_name,
                    f.position as faculty_role,
                    f.college_id,
                    sec.evaluator_type,
                    sec.criteria_type
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
            if (evaluator.college_id !== supData.college_id) {
                return res.status(403).json({
                    success: false,
                    message: 'This faculty member is not within your assigned college.'
                });
            }

            // Check Self-Evaluation Constraint
            if (evaluatorId && parseInt(evaluatorId) === supData.evaluatee_id) {
                return res.status(403).json({
                    success: false,
                    message: 'You cannot evaluate yourself.'
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
                    type: 'Supervisor', // Flag for frontend submission logic
                    criteriaType: supData.criteria_type || 'old'
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
 * GET /api/dean/evaluations/completed/:userId
 * Get completed evaluations for a dean (supervisor)
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
 * POST /api/dean/evaluations/submit
 * Submit completed evaluation for Dean (Supervisor)
 */
router.post('/submit', async (req, res) => {
    const connection = await promisePool.getConnection();

    try {
        await connection.beginTransaction();

        const { studentId: evaluatorId, assignmentId, ratings, comments, evaluatorName, evaluationDate, evaluationType, evaluateeId: reqEvaluateeId, criteriaType } = req.body;

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
        // Calculate category scores based on prefix
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
