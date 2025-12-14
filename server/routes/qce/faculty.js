const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { promisePool } = require('../../config/db');

/**
 * GET /api/qce/faculty
 * Get all faculty members (optionally filtered by college/department if needed)
 */
router.get('/', async (req, res) => {
    try {
        const { college_id, department_id } = req.query; // If we want to filter by college or department

        let query = `
            SELECT 
                f.id,
                f.employee_id,
                f.email,
                f.first_name,
                f.last_name,
                f.gender,
                f.position as role,
                f.employment_status as status,
                f.department_id,
                f.college_id,
                d.department_name,
                c.college_name
            FROM faculty f
            LEFT JOIN departments d ON f.department_id = d.id
            LEFT JOIN colleges c ON f.college_id = c.id
        `;

        const params = [];

        if (department_id) {
            query += ` WHERE f.department_id = ? AND f.position != 'Department Chair'`;
            params.push(department_id);
            // Optional: Filter out Dept Chair if needed
            // query += ` AND f.position != 'Department Chair'`;
        } else if (college_id) {
            query += ` WHERE f.college_id = ? OR c.id = ?`;
            params.push(college_id, college_id);
        }

        query += ` ORDER BY f.last_name ASC`;

        const [faculty] = await promisePool.query(query, params);

        // Transform data to match frontend expectation
        const formattedFaculty = faculty.map(f => ({
            id: f.id,
            name: `${f.first_name} ${f.last_name}`,
            role: f.role,
            status: f.status, // employment_status
            teachingLoad: '0 units', // Placeholder as per UI
            email: f.email,
            gender: f.gender,
            department: f.department_name || f.college_name // Show college name if department is missing
        }));

        res.json({
            success: true,
            data: formattedFaculty
        });
    } catch (error) {
        console.error('Error fetching faculty:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching faculty',
            error: error.message
        });
    }
});

/**
 * POST /api/qce/faculty
 * Create new faculty member
 * Automatically assigns to the QCE's college (Since user prefers College-level assignment)
 */
router.post('/', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            gender,
            role,
            employmentStatus,
            email,
            password,
            departmentId, // Optional: for Dept Chairs
            qceId, // Creator's ID (QCE Manager or Dean)
            creatorType = 'qce_account' // 'qce_account' or 'faculty'
        } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !password || !role || !employmentStatus || !qceId) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        // Get user's college_id based on creator type
        let collegeId = null;

        if (creatorType === 'faculty') {
            // Check faculty table (for Deans)
            const [facultyParams] = await promisePool.query(
                'SELECT college_id FROM faculty WHERE id = ?',
                [qceId]
            );

            if (facultyParams.length > 0 && facultyParams[0].college_id) {
                collegeId = facultyParams[0].college_id;
            }
        } else {
            // Default: Check qce_accounts first
            const [qceAccount] = await promisePool.query(
                'SELECT college_id FROM qce_accounts WHERE id = ?',
                [qceId]
            );

            if (qceAccount.length > 0 && qceAccount[0].college_id) {
                collegeId = qceAccount[0].college_id;
            }
        }

        if (!collegeId) {
            return res.status(400).json({
                success: false,
                message: 'Creator account not found or has no assigned college'
            });
        }

        // Check availability
        const [existing] = await promisePool.query(
            'SELECT id FROM faculty WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Generate Employee ID (Format: FAC-YYYY-RANDOM)
        const year = new Date().getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        const employeeId = `FAC-${year}-${random}`;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into database
        const [result] = await promisePool.query(`
            INSERT INTO faculty (
                employee_id, 
                first_name, 
                last_name, 
                gender, 
                email, 
                password, 
                position, 
                employment_status, 
                college_id,
                department_id,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        `, [
            employeeId,
            firstName,
            lastName,
            gender || null,
            email,
            hashedPassword,
            role,
            employmentStatus,
            collegeId,
            departmentId || null // Allow department assignment if provided
        ]);

        res.status(201).json({
            success: true,
            message: 'Faculty member added successfully',
            data: {
                id: result.insertId,
                name: `${firstName} ${lastName}`,
                email,
                role,
                status: employmentStatus,
                collegeId: collegeId
            }
        });

    } catch (error) {
        console.error('Error creating faculty:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating faculty member',
            error: error.message
        });
    }
});

module.exports = router;
