const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { promisePool } = require('../../config/db');

/**
 * GET /api/zonal/qce
 * Get all QCE accounts
 */
router.get('/', async (req, res) => {
    try {
        const [accounts] = await promisePool.query(`
            SELECT 
                qa.id,
                qa.email,
                qa.full_name,
                qa.position,
                qa.status,
                qa.college_id,
                qa.department_id,
                c.college_name as assigned_college,
                d.department_name as assigned_department,
                qa.created_at
            FROM qce_accounts qa
            LEFT JOIN colleges c ON qa.college_id = c.id
            LEFT JOIN departments d ON qa.department_id = d.id
            ORDER BY qa.full_name ASC
        `);

        res.json({
            success: true,
            data: accounts
        });
    } catch (error) {
        console.error('Error fetching QCE accounts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching QCE accounts',
            error: error.message
        });
    }
});

/**
 * POST /api/zonal/qce
 * Create new QCE account
 */
router.post('/', async (req, res) => {
    try {
        const { firstName, middleInitial, lastName, email, collegeId, departmentId, password } = req.body;

        if (!email || !password || !firstName || !lastName || !collegeId) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if email exists
        const [existing] = await promisePool.query('SELECT id FROM qce_accounts WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const fullName = `${firstName} ${middleInitial ? middleInitial + '. ' : ''}${lastName}`;

        // Insert user
        const [result] = await promisePool.query(`
            INSERT INTO qce_accounts (email, password, full_name, position, college_id, department_id, status)
            VALUES (?, ?, ?, ?, ?, ?, 'active')
        `, [email, hashedPassword, fullName, 'QCE Manager', collegeId, departmentId || null]);

        res.status(201).json({
            success: true,
            message: 'QCE account created successfully',
            data: {
                id: result.insertId,
                full_name: fullName,
                email,
                college_id: collegeId,
                department_id: departmentId
            }
        });

    } catch (error) {
        console.error('Error creating QCE account:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating QCE account',
            error: error.message
        });
    }
});

/**
 * PUT /api/zonal/qce/:id
 * Update QCE account
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, middleInitial, lastName, email, collegeId, departmentId } = req.body;

        if (!email || !firstName || !lastName || !collegeId) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if email exists for other accounts
        const [existing] = await promisePool.query(
            'SELECT id FROM qce_accounts WHERE email = ? AND id != ?',
            [email, id]
        );
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const fullName = `${firstName} ${middleInitial ? middleInitial + '. ' : ''}${lastName}`;

        // Update account
        await promisePool.query(`
            UPDATE qce_accounts 
            SET email = ?, full_name = ?, college_id = ?, department_id = ?
            WHERE id = ?
        `, [email, fullName, collegeId, departmentId || null, id]);

        res.json({
            success: true,
            message: 'QCE account updated successfully',
            data: {
                id,
                full_name: fullName,
                email,
                college_id: collegeId,
                department_id: departmentId
            }
        });

    } catch (error) {
        console.error('Error updating QCE account:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating QCE account',
            error: error.message
        });
    }
});

/**
 * DELETE /api/zonal/qce/:id
 * Delete QCE account
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if account exists
        const [account] = await promisePool.query(
            'SELECT id FROM qce_accounts WHERE id = ?',
            [id]
        );

        if (account.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'QCE account not found'
            });
        }

        // Delete account
        await promisePool.query('DELETE FROM qce_accounts WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'QCE account deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting QCE account:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting QCE account',
            error: error.message
        });
    }
});

module.exports = router;
