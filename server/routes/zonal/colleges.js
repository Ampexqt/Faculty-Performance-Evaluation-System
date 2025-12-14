const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/colleges
 * Get all colleges with their details
 */
router.get('/', async (req, res) => {
    try {
        const [colleges] = await promisePool.query(`
      SELECT 
        id,
        college_code,
        college_name,
        dean_id,
        faculty_count,
        status,
        created_at
      FROM colleges
      WHERE status = 'active'
      ORDER BY college_name ASC
    `);

        res.json({
            success: true,
            data: colleges,
            total: colleges.length
        });
    } catch (error) {
        console.error('Error fetching colleges:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching colleges',
            error: error.message
        });
    }
});

/**
 * GET /api/colleges/:id
 * Get single college by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [colleges] = await promisePool.query(`
      SELECT 
        id,
        college_code,
        college_name,
        dean_id,
        faculty_count,
        status,
        created_at
      FROM colleges
      WHERE id = ?
    `, [id]);

        if (colleges.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'College not found'
            });
        }

        res.json({
            success: true,
            data: colleges[0]
        });
    } catch (error) {
        console.error('Error fetching college:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching college',
            error: error.message
        });
    }
});

/**
 * POST /api/colleges
 * Create new college
 */
router.post('/', async (req, res) => {
    try {
        const { college_code, college_name, dean_id, faculty_count } = req.body;

        // Validation
        if (!college_code || !college_name) {
            return res.status(400).json({
                success: false,
                message: 'College code and name are required'
            });
        }

        const [result] = await promisePool.query(`
      INSERT INTO colleges (college_code, college_name, dean_id, faculty_count)
      VALUES (?, ?, ?, ?)
    `, [college_code, college_name, dean_id || null, faculty_count || 0]);

        res.status(201).json({
            success: true,
            message: 'College created successfully',
            data: {
                id: result.insertId,
                college_code,
                college_name
            }
        });
    } catch (error) {
        console.error('Error creating college:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'College code already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating college',
            error: error.message
        });
    }
});

/**
 * PUT /api/colleges/:id
 * Update college
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { college_code, college_name, dean_id, faculty_count, status } = req.body;

        const [result] = await promisePool.query(`
      UPDATE colleges
      SET 
        college_code = COALESCE(?, college_code),
        college_name = COALESCE(?, college_name),
        dean_id = COALESCE(?, dean_id),
        faculty_count = COALESCE(?, faculty_count),
        status = COALESCE(?, status)
      WHERE id = ?
    `, [college_code, college_name, dean_id, faculty_count, status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'College not found'
            });
        }

        res.json({
            success: true,
            message: 'College updated successfully'
        });
    } catch (error) {
        console.error('Error updating college:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating college',
            error: error.message
        });
    }
});

/**
 * DELETE /api/colleges/:id
 * Delete college
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await promisePool.query(`
      DELETE FROM colleges WHERE id = ?
    `, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'College not found'
            });
        }

        res.json({
            success: true,
            message: 'College deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting college:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting college',
            error: error.message
        });
    }
});

module.exports = router;
