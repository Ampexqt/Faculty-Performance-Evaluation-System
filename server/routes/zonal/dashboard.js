const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/zonal/dashboard/stats
 * Get dashboard statistics for Zonal Admin
 */
router.get('/stats', async (req, res) => {
    try {
        // Get total colleges
        const [collegesCount] = await promisePool.query(`
      SELECT COUNT(*) as total FROM colleges WHERE status = 'active'
    `);

        // Get total QCE accounts
        const [qceCount] = await promisePool.query(`
      SELECT COUNT(*) as total FROM qce_accounts WHERE status = 'active'
    `);

        // Get total faculty across all colleges
        const [facultyCount] = await promisePool.query(`
      SELECT COUNT(*) as total FROM faculty WHERE status = 'active'
    `);

        // Get active evaluations count
        const [evaluationsCount] = await promisePool.query(`
      SELECT COUNT(*) as total 
      FROM evaluation_periods 
      WHERE status = 'active'
    `);

        // Get colleges added this year
        const [newColleges] = await promisePool.query(`
      SELECT COUNT(*) as total 
      FROM colleges 
      WHERE YEAR(created_at) = YEAR(CURDATE())
    `);

        res.json({
            success: true,
            data: {
                totalColleges: collegesCount[0].total,
                qceAccounts: qceCount[0].total,
                totalFaculty: facultyCount[0].total,
                activeEvaluations: evaluationsCount[0].total,
                newCollegesThisYear: newColleges[0].total
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
});

/**
 * GET /api/zonal/dashboard/colleges
 * Get colleges with detailed information for dashboard
 */
router.get('/colleges', async (req, res) => {
    try {
        const [colleges] = await promisePool.query(`
      SELECT 
        c.id,
        c.college_code,
        c.college_name,
        c.faculty_count,
        c.status,
        c.created_at,
        CONCAT(f.first_name, ' ', f.last_name) as dean_name
      FROM colleges c
      LEFT JOIN faculty f ON c.dean_id = f.id
      WHERE c.status = 'active'
      ORDER BY c.college_name ASC
    `);

        res.json({
            success: true,
            data: colleges,
            total: colleges.length
        });
    } catch (error) {
        console.error('Error fetching colleges for dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching colleges',
            error: error.message
        });
    }
});

/**
 * GET /api/zonal/dashboard/recent-activity
 * Get recent system activity
 */
router.get('/recent-activity', async (req, res) => {
    try {
        // Get recent colleges
        const [recentColleges] = await promisePool.query(`
      SELECT 
        'college' as type,
        college_name as name,
        created_at
      FROM colleges
      ORDER BY created_at DESC
      LIMIT 5
    `);

        // Get recent QCE accounts
        const [recentQCE] = await promisePool.query(`
      SELECT 
        'qce' as type,
        full_name as name,
        created_at
      FROM qce_accounts
      ORDER BY created_at DESC
      LIMIT 5
    `);

        // Combine and sort
        const activities = [...recentColleges, ...recentQCE]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);

        res.json({
            success: true,
            data: activities
        });
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent activity',
            error: error.message
        });
    }
});

module.exports = router;
