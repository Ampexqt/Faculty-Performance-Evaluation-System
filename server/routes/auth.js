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

        // Check evaluator_accounts table for President/VPAA
        const [evaluators] = await promisePool.query(
            'SELECT * FROM evaluator_accounts WHERE email = ? AND status = ?',
            [email, 'active']
        );

        if (evaluators.length > 0) {
            const evaluator = evaluators[0];

            // Compare password with hashed password
            const isPasswordValid = await bcrypt.compare(password, evaluator.password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Login successful - return evaluator data
            return res.json({
                success: true,
                message: 'Login successful',
                user: {
                    id: evaluator.id,
                    email: evaluator.email,
                    full_name: evaluator.full_name,
                    position: evaluator.position,
                    sex: evaluator.sex,
                    role: evaluator.position, // 'President' or 'VPAA'
                    status: evaluator.status
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
            } else if (user.position && user.position.toLowerCase().includes('department chair')) {
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
            } else {
                // Regular Faculty
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
                        role: 'Faculty',
                        status: user.status
                    }
                });
            }
        }

        // Check students table
        const [students] = await promisePool.query(
            'SELECT * FROM students WHERE (email = ? OR student_id = ?) AND status = ?',
            [email, email, 'active']
        );

        if (students.length > 0) {
            const student = students[0];

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, student.password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Get college and program info
            let collegeName = null;
            let programName = null;

            if (student.department_id) {
                const [colleges] = await promisePool.query(
                    'SELECT college_name FROM colleges WHERE id = ?',
                    [student.department_id]
                );
                if (colleges.length > 0) collegeName = colleges[0].college_name;
            }

            if (student.program_id) {
                const [programs] = await promisePool.query(
                    'SELECT program_name FROM programs WHERE id = ?',
                    [student.program_id]
                );
                if (programs.length > 0) programName = programs[0].program_name;
            }

            return res.json({
                success: true,
                message: 'Login successful',
                user: {
                    id: student.id,
                    student_id: student.student_id,
                    email: student.email,
                    full_name: `${student.first_name} ${student.last_name}`,
                    role: 'Student',
                    college_id: student.department_id,
                    college_name: collegeName,
                    program_id: student.program_id,
                    program_name: programName,
                    year_level: student.year_level,
                    section: student.section,
                    status: student.status
                }
            });
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

/**
 * POST /api/auth/register
 * Register new student
 */
router.post('/register', async (req, res) => {
    try {
        const {
            schoolId,
            firstName,
            lastName,
            middleInitial,
            sex,
            email,
            department, // This is college_id
            program,    // This is program_id
            yearLevel,
            section,
            password
        } = req.body;

        // Basic validation
        if (!schoolId || !firstName || !lastName || !email || !password || !department || !program) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        // Check if student already exists (by School ID or Email)
        const [existing] = await promisePool.query(
            'SELECT id FROM students WHERE student_id = ? OR email = ?',
            [schoolId, email]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Student with this School ID or Email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new student
        // Mapping: department -> department_id (which is college), program -> program_id
        const [result] = await promisePool.query(
            `INSERT INTO students (
                student_id, 
                first_name, 
                middle_name, 
                last_name, 
                sex,
                email, 
                password, 
                department_id, 
                program_id, 
                year_level, 
                section, 
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [
                schoolId,
                firstName,
                middleInitial || null,
                lastName,
                sex,
                email,
                hashedPassword,
                department,
                program,
                yearLevel,
                section
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                id: result.insertId,
                student_id: schoolId,
                email: email
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});


/**
 * POST /api/auth/reset-password
 * Reset password for a user
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email and new password are required'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // Define checks for each table
        // 1. Check Admins
        const [admins] = await promisePool.query('SELECT id FROM admins WHERE email = ?', [email]);
        if (admins.length > 0) {
            await promisePool.query('UPDATE admins SET password = ? WHERE id = ?', [passwordHash, admins[0].id]);
            return res.json({ success: true, message: 'Password has been successfully updated.' });
        }

        // 2. Check QCE Accounts
        const [qce] = await promisePool.query('SELECT id FROM qce_accounts WHERE email = ?', [email]);
        if (qce.length > 0) {
            await promisePool.query('UPDATE qce_accounts SET password = ? WHERE id = ?', [passwordHash, qce[0].id]);
            return res.json({ success: true, message: 'Password has been successfully updated.' });
        }

        // 3. Check Evaluator Accounts
        const [evaluators] = await promisePool.query('SELECT id FROM evaluator_accounts WHERE email = ?', [email]);
        if (evaluators.length > 0) {
            await promisePool.query('UPDATE evaluator_accounts SET password = ? WHERE id = ?', [passwordHash, evaluators[0].id]);
            return res.json({ success: true, message: 'Password has been successfully updated.' });
        }

        // 4. Check Faculty
        const [faculty] = await promisePool.query('SELECT id FROM faculty WHERE email = ?', [email]);
        if (faculty.length > 0) {
            await promisePool.query('UPDATE faculty SET password = ? WHERE id = ?', [passwordHash, faculty[0].id]);
            return res.json({ success: true, message: 'Password has been successfully updated.' });
        }

        // 5. Check Students
        const [students] = await promisePool.query('SELECT id FROM students WHERE email = ?', [email]);
        if (students.length > 0) {
            await promisePool.query('UPDATE students SET password = ? WHERE id = ?', [passwordHash, students[0].id]);
            return res.json({ success: true, message: 'Password has been successfully updated.' });
        }

        // If email not found in any table
        return res.status(404).json({
            success: false,
            message: 'No account found with this email address'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: error.message
        });
    }
});

module.exports = router;
