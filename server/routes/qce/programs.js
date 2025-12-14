const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/qce/programs
 * Get all programs (departments) for the QCE Manager's college
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

        const [programs] = await promisePool.query(`
            SELECT 
                id,
                department_code as code,
                department_name as name,
                faculty_count as enrolledStudents, -- Placeholder: We might strictly need a student count query here later
                status
            FROM departments
            WHERE college_id = ? AND status = 'active'
            ORDER BY department_name ASC
        `, [college_id]);

        // For now, we will just pass the raw counts. 
        // In a real scenario, you'd do a COUNT(*) on the students table linked to this department/program.
        // For keeping it simple as per request, I'll return what we have.

        // TODO: Update enrolledStudents logic when students table is fully linked.
        const formattedPrograms = programs.map(p => ({
            ...p,
            enrolledStudents: 0, // Default to 0 until we have student data
            activeSections: 0    // Default to 0
        }));

        res.json({
            success: true,
            data: formattedPrograms
        });
    } catch (error) {
        console.error('Error fetching programs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching programs',
            error: error.message
        });
    }
});

/**
 * POST /api/qce/programs
 * Create a new program (department) attached to the QCE's college
 */
router.post('/', async (req, res) => {
    try {
        const { programCode, programName, qceId } = req.body;

        if (!programCode || !programName || !qceId) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Get user's college_id (check qce_accounts first, then faculty)
        let collegeId = null;

        const [qceAccount] = await promisePool.query(
            'SELECT college_id FROM qce_accounts WHERE id = ?',
            [qceId]
        );

        if (qceAccount.length > 0 && qceAccount[0].college_id) {
            collegeId = qceAccount[0].college_id;
        } else {
            // Check faculty table (for Deans)
            const [facultyParams] = await promisePool.query(
                'SELECT college_id FROM faculty WHERE id = ?',
                [qceId]
            );

            if (facultyParams.length > 0 && facultyParams[0].college_id) {
                collegeId = facultyParams[0].college_id;
            }
        }

        if (!collegeId) {
            return res.status(400).json({
                success: false,
                message: 'User account not found or has no assigned college'
            });
        }

        // Check for duplicates in this college
        const [existing] = await promisePool.query(
            'SELECT id FROM departments WHERE (department_code = ? OR department_name = ?) AND college_id = ?',
            [programCode, programName, collegeId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Program with this code or name already exists in your college'
            });
        }

        // Insert new program
        const [result] = await promisePool.query(`
            INSERT INTO departments (college_id, department_code, department_name, status)
            VALUES (?, ?, ?, 'active')
        `, [collegeId, programCode, programName]);

        res.status(201).json({
            success: true,
            message: 'Program added successfully',
            data: {
                id: result.insertId,
                code: programCode,
                name: programName,
                enrolledStudents: 0,
                activeSections: 0
            }
        });

    } catch (error) {
        console.error('Error adding program:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding program',
            error: error.message
        });
    }
});

module.exports = router;
