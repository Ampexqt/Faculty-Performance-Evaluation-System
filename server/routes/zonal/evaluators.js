const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { promisePool } = require('../../config/db');

/**
 * GET /api/zonal/evaluators
 * Get all evaluator accounts
 */
router.get('/', async (req, res) => {
    try {
        const [accounts] = await promisePool.query(`
            SELECT 
                id,
                email,
                full_name,
                position,
                full_name,
                sex,
                position,
                status,
                created_at
            FROM evaluator_accounts
            ORDER BY full_name ASC
        `);

        res.json({
            success: true,
            data: accounts
        });
    } catch (error) {
        console.error('Error fetching evaluator accounts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching evaluator accounts',
            error: error.message
        });
    }
});

/**
 * POST /api/zonal/evaluators
 * Create new evaluator account
 */
router.post('/', async (req, res) => {
    try {
        const { firstName, middleInitial, lastName, sex, email, position, temporaryPassword } = req.body;

        if (!email || !temporaryPassword || !firstName || !lastName || !position || !sex) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if email exists
        const [existing] = await promisePool.query('SELECT id FROM evaluator_accounts WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
        const fullName = `${firstName} ${middleInitial ? middleInitial + '. ' : ''}${lastName}`;

        // Insert user
        const [result] = await promisePool.query(`
            INSERT INTO evaluator_accounts (email, password, full_name, sex, position, status)
            VALUES (?, ?, ?, ?, ?, 'active')
        `, [email, hashedPassword, fullName, sex, position]);

        res.status(201).json({
            success: true,
            message: 'Evaluator account created successfully',
            data: {
                id: result.insertId,
                full_name: fullName,
                email,
                position
            }
        });

    } catch (error) {
        console.error('Error creating evaluator account:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating evaluator account',
            error: error.message
        });
    }
});

/**
 * PUT /api/zonal/evaluators/:id
 * Update evaluator account
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, middleInitial, lastName, sex, email, position } = req.body;

        if (!email || !firstName || !lastName || !position || !sex) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if email exists for other accounts
        const [existing] = await promisePool.query(
            'SELECT id FROM evaluator_accounts WHERE email = ? AND id != ?',
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
            UPDATE evaluator_accounts 
            SET email = ?, full_name = ?, sex = ?, position = ?
            WHERE id = ?
        `, [email, fullName, sex, position, id]);

        res.json({
            success: true,
            message: 'Evaluator account updated successfully',
            data: {
                id,
                full_name: fullName,
                email,
                position
            }
        });

    } catch (error) {
        console.error('Error updating evaluator account:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating evaluator account',
            error: error.message
        });
    }
});

/**
 * DELETE /api/zonal/evaluators/:id
 * Delete evaluator account
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if account exists
        const [account] = await promisePool.query(
            'SELECT id FROM evaluator_accounts WHERE id = ?',
            [id]
        );

        if (account.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Evaluator account not found'
            });
        }

        // Delete account
        await promisePool.query('DELETE FROM evaluator_accounts WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Evaluator account deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting evaluator account:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting evaluator account',
            error: error.message
        });
    }
});

module.exports = router;
