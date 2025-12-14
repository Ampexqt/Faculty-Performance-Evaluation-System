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

        // Try to find user in admins table first
        const [admins] = await promisePool.query(
            'SELECT * FROM admins WHERE email = ? AND status = ?',
            [email, 'active']
        );

        if (admins.length > 0) {
            const admin = admins[0];

            // Compare password with hashed password
            const isPasswordValid = await bcrypt.compare(password, admin.password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Login successful - return Zonal Admin data
            return res.json({
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
        }

        // If not found in admins, try qce_accounts table
        const [qceAccounts] = await promisePool.query(
            'SELECT * FROM qce_accounts WHERE email = ? AND status = ?',
            [email, 'active']
        );

        if (qceAccounts.length > 0) {
            const qce = qceAccounts[0];

            // Compare password with hashed password
            const isPasswordValid = await bcrypt.compare(password, qce.password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Get college information
            let collegeName = null;
            if (qce.college_id) {
                const [colleges] = await promisePool.query(
                    'SELECT college_name FROM colleges WHERE id = ?',
                    [qce.college_id]
                );
                if (colleges.length > 0) {
                    collegeName = colleges[0].college_name;
                }
            }

            // Get department information
            let departmentName = null;
            if (qce.department_id) {
                const [departments] = await promisePool.query(
                    'SELECT department_name FROM departments WHERE id = ?',
                    [qce.department_id]
                );
                if (departments.length > 0) {
                    departmentName = departments[0].department_name;
                }
            }

            // Login successful - return QCE data
            return res.json({
                success: true,
                message: 'Login successful',
                user: {
                    id: qce.id,
                    email: qce.email,
                    full_name: qce.full_name,
                    position: qce.position,
                    college_id: qce.college_id,
                    college_name: collegeName,
                    department_id: qce.department_id,
                    department_name: departmentName,
                    role: 'QCE Manager',
                    status: qce.status
                }
            });
        }

        // Check faculty table for Dean
        const [faculty] = await promisePool.query(
            'SELECT * FROM faculty WHERE email = ? AND status = ?',
            [email, 'active']
        );

        if (faculty.length > 0) {
            const user = faculty[0];

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check if user is a Dean (using position/role column)
            // Note: Database schema has 'position', query result uses 'position'
            if (user.position && user.position.toLowerCase().includes('dean')) {

                // Get college information
                let collegeName = null;
                if (user.college_id) {
                    const [colleges] = await promisePool.query(
                        'SELECT college_name FROM colleges WHERE id = ?',
                        [user.college_id]
                    );
                    if (colleges.length > 0) {
                        collegeName = colleges[0].college_name;
                    }
                }

                // Get department information
                let departmentName = null;
                if (user.department_id) {
                    const [departments] = await promisePool.query(
                        'SELECT department_name FROM departments WHERE id = ?',
                        [user.department_id]
                    );
                    if (departments.length > 0) {
                        departmentName = departments[0].department_name;
                    }
                }

                return res.json({
                    success: true,
                    message: 'Login successful',
                    user: {
                        id: user.id,
                        email: user.email,
                        full_name: `${user.first_name} ${user.last_name}`,
                        position: user.position,
                        college_id: user.college_id,
                        college_name: collegeName,
                        department_id: user.department_id,
                        department_name: departmentName,
                        role: 'Dean', // Explicitly set role for frontend routing
                        status: user.status
                    }
                });
            } else if (user.position && user.position.toLowerCase().includes('chair')) {
                // Get college information
                let collegeName = null;
                if (user.college_id) {
                    const [colleges] = await promisePool.query(
                        'SELECT college_name FROM colleges WHERE id = ?',
                        [user.college_id]
                    );
                    if (colleges.length > 0) {
                        collegeName = colleges[0].college_name;
                    }
                }

                // Get department information
                let departmentName = null;
                if (user.department_id) {
                    const [departments] = await promisePool.query(
                        'SELECT department_name FROM departments WHERE id = ?',
                        [user.department_id]
                    );
                    if (departments.length > 0) {
                        departmentName = departments[0].department_name;
                    }
                }

                return res.json({
                    success: true,
                    message: 'Login successful',
                    user: {
                        id: user.id,
                        email: user.email,
                        full_name: `${user.first_name} ${user.last_name}`,
                        position: user.position,
                        college_id: user.college_id,
                        college_name: collegeName,
                        department_id: user.department_id,
                        department_name: departmentName,
                        role: 'Department Chair',
                        status: user.status
                    }
                });
            }
        }

        // User not found in either table
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
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
