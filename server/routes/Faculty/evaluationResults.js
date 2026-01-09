const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/faculty/evaluation-results/my-results
 * Get evaluation results for a specific faculty member
 */
router.get('/my-results', async (req, res) => {
    try {
        const { faculty_id } = req.query;

        if (!faculty_id) {
            return res.status(400).json({
                success: false,
                message: 'Faculty ID is required'
            });
        }

        // 1. Get Student Evaluations Stats & Comments
        const [studentStats] = await promisePool.query(`
            SELECT 
                COUNT(*) as count,
                AVG(total_score) as average_score,
                AVG(score_commitment) as avg_commitment,
                AVG(score_knowledge) as avg_knowledge,
                AVG(score_teaching) as avg_teaching,
                AVG(score_management) as avg_management
            FROM student_evaluations se
            JOIN faculty_assignments fa ON se.faculty_assignment_id = fa.id
            WHERE fa.faculty_id = ? AND se.status = 'completed'
        `, [faculty_id]);

        const [studentComments] = await promisePool.query(`
            SELECT 
                se.comments,
                se.evaluation_date
            FROM student_evaluations se
            JOIN faculty_assignments fa ON se.faculty_assignment_id = fa.id
            WHERE fa.faculty_id = ? 
            AND se.status = 'completed' 
            AND se.comments IS NOT NULL 
            AND TRIM(se.comments) != ''
            ORDER BY se.evaluation_date DESC
        `, [faculty_id]);

        // 2. Get Supervisor Evaluations Stats & Comments
        const [supervisorStats] = await promisePool.query(`
            SELECT 
                COUNT(*) as count,
                AVG(total_score) as average_score,
                AVG(score_commitment) as avg_commitment,
                AVG(score_knowledge) as avg_knowledge,
                AVG(score_teaching) as avg_teaching,
                AVG(score_management) as avg_management
            FROM supervisor_evaluations
            WHERE evaluatee_id = ? AND status = 'completed'
        `, [faculty_id]);

        const [supervisorComments] = await promisePool.query(`
            SELECT 
                comments,
                evaluation_date
            FROM supervisor_evaluations
            WHERE evaluatee_id = ? 
            AND status = 'completed'
            AND comments IS NOT NULL
            AND TRIM(comments) != ''
            ORDER BY evaluation_date DESC
        `, [faculty_id]);

        // Score Normalization: The database stores total_score as sum of 4 categories (max 20).
        // We need to convert it to a 5-point scale by dividing by 4.
        const normalizeScore = (score) => (parseFloat(score) || 0) / 4;

        // Category scores are already out of 5 (average of items), or wait, check DB.
        // Usually category/criterion is rate 1-5. 
        // If category is sum (e.g. 5 items * 5 = 25), then we need to know.
        // Checking Student/evaluations.js: categoryScores[cat] += parseInt(rating). 
        // A category has 5 items. So max for a category is 25.
        // So average_commitment from DB is out of 25.
        // To get 5-point scale for category: divide by 5.
        // To get 5-point scale for overall total_score (sum of 4 categories): max is 100.
        // Wait, let's re-read Student/evaluations.js carefully.
        // "A. Commitment": 5 items. Rating 1-5. Max category score = 25.
        // Total Score = Sum of 4 categories = Max 100.
        // So validation: 64.50 / 100 * 5 = 3.225. Or just divide by 20.
        // Let's assume standard behavior:
        // Category Average (AVG(score_commitment)) is out of 25. Normalize by dividing by 5.
        // Overall Average (AVG(total_score)) is out of 100. Normalize by dividing by 20.

        const normalizeCategory = (score) => (parseFloat(score) || 0) / 5;
        const normalizeOverall = (score) => (parseFloat(score) || 0) / 20;

        const studentAvg = normalizeOverall(studentStats[0].average_score);
        const supervisorAvg = normalizeOverall(supervisorStats[0].average_score);

        // Calculate Overall Score (60% Student, 40% Supervisor)
        let overallRating = 0;
        if (studentAvg > 0 && supervisorAvg > 0) {
            overallRating = (studentAvg * 0.6) + (supervisorAvg * 0.4);
        } else if (studentAvg > 0) {
            overallRating = studentAvg;
        } else if (supervisorAvg > 0) {
            overallRating = supervisorAvg;
        }

        // Calculate Detailed Breakdown (Weighted Average of both if available, else just available one)
        const calcWeighted = (sVal, supVal) => {
            sVal = normalizeCategory(sVal);
            supVal = normalizeCategory(supVal);

            if (sVal > 0 && supVal > 0) return (sVal * 0.6) + (supVal * 0.4);
            if (sVal > 0) return sVal;
            if (supVal > 0) return supVal;
            return 0;
        };

        const scoreBreakdown = [
            {
                category: 'Commitment',
                score: calcWeighted(studentStats[0].avg_commitment, supervisorStats[0].avg_commitment)
            },
            {
                category: 'Knowledge of Subject',
                score: calcWeighted(studentStats[0].avg_knowledge, supervisorStats[0].avg_knowledge)
            },
            {
                category: 'Teaching for Independent Learning',
                score: calcWeighted(studentStats[0].avg_teaching, supervisorStats[0].avg_teaching)
            },
            {
                category: 'Management of Learning',
                score: calcWeighted(studentStats[0].avg_management, supervisorStats[0].avg_management)
            },
        ];

        // Format comments - Ensure anonymity and combining both sources
        // Supervisor comments are also anonymized as requested ("make it same as the students comments")
        const allComments = [
            ...studentComments.map(c => ({ text: c.comments, date: c.evaluation_date, source: 'Student' })),
            ...supervisorComments.map(c => ({ text: c.comments, date: c.evaluation_date, source: 'Supervisor' }))
        ];

        // Sort by date desc
        allComments.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Return just strings, or objects? Frontend expects strings currently.
        // The prompt says "dont include their name just make it same as the students comments".
        // So just return the text strings.
        const formattedComments = allComments.map(c => `"${c.text}"`);

        // Determine Rating Label
        let ratingLabel = 'Poor';
        if (overallRating >= 4.5) ratingLabel = 'Outstanding';
        else if (overallRating >= 3.5) ratingLabel = 'Very Satisfactory';
        else if (overallRating >= 2.5) ratingLabel = 'Satisfactory';
        else if (overallRating >= 1.5) ratingLabel = 'Fair';

        res.json({
            success: true,
            data: {
                overallRating,
                maxRating: 5.0,
                ratingLabel,
                scoreBreakdown,
                studentComments: formattedComments // We use the same field name for compatibility, but it contains both
            }
        });

    } catch (error) {
        console.error('Error fetching faculty evaluation results:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching evaluation results',
            error: error.message
        });
    }
});

module.exports = router;
