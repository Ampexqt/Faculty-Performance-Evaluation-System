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

        console.log('Creating academic year with data:', { year_code, year_label, semester, start_date, end_date });

        // Check if year_code already exists
        const [existing] = await promisePool.query(
            'SELECT id FROM academic_years WHERE year_code = ?',
            [year_code]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Academic year with this code already exists'
            });
        }

        const [result] = await promisePool.query(`
            INSERT INTO academic_years (year_code, year_label, semester, start_date, end_date, is_current, status)
            VALUES (?, ?, ?, ?, ?, FALSE, 'inactive')
        `, [year_code, year_label, semester, start_date, end_date]);

        console.log('Academic year created successfully:', result.insertId);

        res.status(201).json({
            success: true,
            message: 'Academic year created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating academic year:', error);
        console.error('Error details:', error.message);
        console.error('SQL Error Code:', error.code);

        res.status(500).json({
            success: false,
            message: 'Error creating academic year',
            error: error.message
        });
    }
});

/**
 * POST /api/zonal/academic-years/deactivate-all
 * Deactivate all academic years
 * IMPORTANT: This must come BEFORE /:id routes
 */
router.post('/deactivate-all', async (req, res) => {
    try {
        console.log('Deactivating all academic years');

        await promisePool.query(`
            UPDATE academic_years SET status = 'inactive', is_current = FALSE
        `);

        console.log('All academic years deactivated');

        res.json({
            success: true,
            message: 'All academic years deactivated'
        });
    } catch (error) {
        console.error('Error deactivating all academic years:', error);
        res.status(500).json({
            success: false,
            message: 'Error deactivating academic years',
            error: error.message
        });
    }
});

/**
 * PUT /api/zonal/academic-years/:id/activate
 * Activate a specific academic year
 * IMPORTANT: This must come BEFORE the generic /:id route
 */
router.put('/:id/activate', async (req, res) => {
    try {
        const { id } = req.params;

        console.log('Activating academic year:', id);

        const [result] = await promisePool.query(`
            UPDATE academic_years 
            SET status = 'active', is_current = TRUE
            WHERE id = ?
        `, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Academic year not found'
            });
        }

        console.log('Academic year activated successfully');

        res.json({
            success: true,
            message: 'Academic year activated successfully'
        });
    } catch (error) {
        console.error('Error activating academic year:', error);
        res.status(500).json({
            success: false,
            message: 'Error activating academic year',
            error: error.message
        });
    }
});

/**
 * PUT /api/zonal/academic-years/:id/close
 * Close a specific academic year
 * IMPORTANT: This must come BEFORE the generic /:id route
 */
router.put('/:id/close', async (req, res) => {
    try {
        const { id } = req.params;

        console.log('Closing academic year:', id);

        const [result] = await promisePool.query(`
            UPDATE academic_years 
            SET status = 'inactive', is_current = FALSE
            WHERE id = ?
        `, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Academic year not found'
            });
        }

        console.log('Academic year closed successfully');

        res.json({
            success: true,
            message: 'Academic year closed successfully'
        });
    } catch (error) {
        console.error('Error closing academic year:', error);
        res.status(500).json({
            success: false,
            message: 'Error closing academic year',
            error: error.message
        });
    }
});

/**
 * PUT /api/zonal/academic-years/:id
 * Update academic year
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { year_code, year_label, semester, start_date, end_date } = req.body;

        console.log('Updating academic year:', id, { year_code, year_label, semester, start_date, end_date });

        const [result] = await promisePool.query(`
            UPDATE academic_years
            SET year_code = ?, year_label = ?, semester = ?, start_date = ?, end_date = ?
            WHERE id = ?
        `, [year_code, year_label, semester, start_date, end_date, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Academic year not found'
            });
        }

        console.log('Academic year updated successfully');

        res.json({
            success: true,
            message: 'Academic year updated successfully'
        });
    } catch (error) {
        console.error('Error updating academic year:', error);
        console.error('Error details:', error.message);

        res.status(500).json({
            success: false,
            message: 'Error updating academic year',
            error: error.message
        });
    }
});

/**
 * DELETE /api/zonal/academic-years/:id
 * Delete academic year
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await promisePool.query(`
            DELETE FROM academic_years WHERE id = ?
        `, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Academic year not found'
            });
        }

        res.json({
            success: true,
            message: 'Academic year deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting academic year:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting academic year',
            error: error.message
        });
    }
});

module.exports = router;
