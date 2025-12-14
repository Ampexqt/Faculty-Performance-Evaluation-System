const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/qce/departments
 * Get departments by college_id
 */
router.get('/', async (req, res) => {
    try {
        const { college_id } = req.query;

        if (!college_id) {
            return res.status(400).json({
                success: false,
                message: 'college_id is required'
            });
        }

        const [departments] = await promisePool.query(`
            SELECT 
                id,
                department_code,
                department_name,
                college_id
            FROM departments
            WHERE college_id = ? AND status = 'active'
            ORDER BY department_name ASC
        `, [college_id]);

        res.json({
            success: true,
            data: departments
        });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching departments',
            error: error.message
        });
    }
});

module.exports = router;
