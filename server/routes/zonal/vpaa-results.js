const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/zonal/vpaa-results
 * Get VPAA evaluation results - shows VPAAs evaluated by the President
 */
router.get('/vpaa-results', async (req, res) => {
    try {
        // Fetch all VPAAs from evaluator_accounts and their President evaluation data
        const [vpaaData] = await promisePool.query(`
            SELECT 
                ea.id,
                TRIM(CONCAT(
                    COALESCE(ea.honorific, ''), ' ', 
                    ea.full_name, ' ', 
                    COALESCE(ea.suffix, '')
                )) as name,
                ea.position,
                'University-wide' as college,
                
                -- President Evaluations Count
                (SELECT COUNT(*) 
                 FROM president_evaluations pe
                 WHERE pe.vpaa_id = ea.id 
                 AND pe.status = 'completed') as president_completed,
                
                -- President Average Score
                (SELECT AVG(pe.rating)
                 FROM president_evaluations pe
                 WHERE pe.vpaa_id = ea.id 
                 AND pe.status = 'completed') as supervisorAverage
                
            FROM evaluator_accounts ea
            WHERE ea.position = 'VPAA' AND ea.status = 'active'
            ORDER BY ea.full_name
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
