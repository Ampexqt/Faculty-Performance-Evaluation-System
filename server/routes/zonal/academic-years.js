const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/zonal/academic-years
 * Get all academic years
 */
router.get('/', async (req, res) => {
    try {
        const [years] = await promisePool.query(`
            SELECT * FROM academic_years 
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            data: years
        });
    } catch (error) {
        console.error('Error fetching academic years:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching academic years',
            error: error.message
        });
    }
});

/**
 * POST /api/zonal/academic-years
 * Create new academic year
 */
router.post('/', async (req, res) => {
    try {
        const { year_code, year_label, semester, start_date, end_date } = req.body;

        const [result] = await promisePool.query(`
            INSERT INTO academic_years (year_code, year_label, semester, start_date, end_date, status)
            VALUES (?, ?, ?, ?, ?, 'active')
        `, [year_code, year_label, semester, start_date, end_date]);

        res.status(201).json({
            success: true,
            message: 'Academic year created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating academic year:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating academic year',
            error: error.message
        });
    }
});

module.exports = router;
