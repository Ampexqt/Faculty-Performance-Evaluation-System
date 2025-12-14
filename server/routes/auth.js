const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { promisePool } = require('../config/db');

/**
 * POST /api/auth/login
 * Login endpoint for Zonal Admin
 * 
 * Request body:
 * {
 *   email: string,        // Email or School ID
 *   password: string
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   user: {
 *     id: number,
 *     username: string,
 *     email: string,
 *     full_name: string,
 *     zone: string,
 *     role: string
 *   }
 * }
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email/School ID and password are required'
            });
        }

        // Query database for admin user by email
        const [admins] = await promisePool.query(
            'SELECT * FROM admins WHERE email = ? AND status = ?',
            [email, 'active']
        );

        // Check if user exists
        if (admins.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const admin = admins[0];

        // Compare password with hashed password
        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Login successful - return user data (without password)
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                full_name: admin.full_name,
                zone: admin.zone,
                role: 'Zonal Admin',
                status: admin.status
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
});

/**
 * POST /api/auth/logout
 * Logout endpoint (for future use with sessions/tokens)
 */
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

/**
 * GET /api/auth/verify
 * Verify if user is authenticated (for future use with sessions/tokens)
 */
router.get('/verify', (req, res) => {
    // For now, just return a placeholder
    // In production, you'd verify JWT token or session here
    res.json({
        success: false,
        message: 'Authentication verification not implemented yet'
    });
});

module.exports = router;
