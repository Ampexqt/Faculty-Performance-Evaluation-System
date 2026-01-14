const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/zonal/vpaa-results
 * Get VPAA evaluation results - shows VPAAs evaluated by the President
 */
router.get('/vpaa-results', async (req, res) => {
    try {
        // Fetch all VPAAs with their President evaluation data
        const [vpaaData] = await promisePool.query(`
            SELECT 
                f.id,
                CONCAT(f.first_name, ' ', f.last_name) as name,
                f.position,
                'University-wide' as college,
                
                -- President Evaluations Count
                (SELECT COUNT(*) 
                 FROM supervisor_evaluations sup
                 WHERE sup.evaluatee_id = f.id 
                 AND sup.evaluator_position = 'President' 
                 AND sup.status = 'completed') as president_completed,
                
                -- President Average Score
                (SELECT AVG(sup.total_score)
                 FROM supervisor_evaluations sup
                 WHERE sup.evaluatee_id = f.id 
                 AND sup.evaluator_position = 'President' 
                 AND sup.status = 'completed') as supervisorAverage
                
            FROM faculty f
            WHERE f.position LIKE '%VPAA%' AND f.status = 'active'
            ORDER BY f.last_name, f.first_name
        `);

        // Calculate overall scores for each VPAA
        const results = vpaaData.map(vpaa => {
            const supervisorAvg = parseFloat(vpaa.supervisorAverage) || 0;

            // For VPAA, only President evaluation matters
            const overallScore = supervisorAvg;

            return {
                id: vpaa.id,
                name: vpaa.name,
                position: vpaa.position,
                college: vpaa.college,
                president_completed: parseInt(vpaa.president_completed) || 0,
                supervisorAverage: supervisorAvg,
                overallScore: overallScore
            };
        });

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Error fetching VPAA results:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching VPAA results',
            error: error.message
        });
    }
});

module.exports = router;
