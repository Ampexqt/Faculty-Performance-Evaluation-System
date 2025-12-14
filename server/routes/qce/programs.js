const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/qce/programs
 * Get all programs for the QCE Manager's college or Department Chair
 */
router.get('/', async (req, res) => {
    try {
        const { college_id, department_id, chairperson_id } = req.query;

        let query = `
            SELECT 
                p.id,
                p.program_code as code,
                p.program_name as name,
                p.college_id,
                p.chairperson_id,
                CONCAT(f.first_name, ' ', f.last_name) as chairperson_name,
                p.status
            FROM programs p
            LEFT JOIN faculty f ON p.chairperson_id = f.id
            WHERE p.status = 'active'
        `;
        const params = [];

        if (chairperson_id) {
            query += ` AND p.chairperson_id = ?`;
            params.push(chairperson_id);
        } else if (department_id) {
            // Find programs in the same college as the department
            query += ` AND p.college_id = (SELECT college_id FROM departments WHERE id = ?)`;
            params.push(department_id);
        } else if (college_id) {
            query += ` AND p.college_id = ?`;
            params.push(college_id);
        } else {
            return res.status(400).json({
                success: false,
                message: 'college_id, department_id, or chairperson_id is required'
            });
        }

        query += ` ORDER BY p.program_name ASC`;

        // ... rest of the function ...

        const [programs] = await promisePool.query(query, params);

        // TODO: Update enrolledStudents logic when students table is fully linked to programs
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
        // ... error handling ...
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
 * Create a new program attached to the QCE's college
 */
router.post('/', async (req, res) => {
    try {
        const { programCode, programName, qceId, chairpersonId, userType } = req.body;

        if (!programCode || !programName || !qceId) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Get user's college_id
        let collegeId = null;
        let finalChairpersonId = chairpersonId;

        // If user is explicitly identified as faculty (e.g. Dept Chair), check faculty table first
        if (userType === 'faculty') {
            const [facultyParams] = await promisePool.query(
                'SELECT college_id, id FROM faculty WHERE id = ?',
                [qceId]
            );

            if (facultyParams.length > 0) {
                collegeId = facultyParams[0].college_id;
                if (!finalChairpersonId) {
                    finalChairpersonId = facultyParams[0].id;
                }
            }
        }

        // If not found in faculty (or not specified as faculty), check qce_accounts
        if (!collegeId) {
            const [qceAccount] = await promisePool.query(
                'SELECT college_id FROM qce_accounts WHERE id = ?',
                [qceId]
            );

            if (qceAccount.length > 0 && qceAccount[0].college_id) {
                collegeId = qceAccount[0].college_id;
            } else {
                // Fallback: Check faculty table if we haven't already
                if (userType !== 'faculty') {
                    const [facultyParams] = await promisePool.query(
                        'SELECT college_id, id FROM faculty WHERE id = ?',
                        [qceId]
                    );

                    if (facultyParams.length > 0) {
                        collegeId = facultyParams[0].college_id;
                        if (!finalChairpersonId) {
                            finalChairpersonId = facultyParams[0].id;
                        }
                    }
                }
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
            'SELECT id FROM programs WHERE (program_code = ? OR program_name = ?) AND college_id = ?',
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
            INSERT INTO programs (college_id, program_code, program_name, chairperson_id, status)
            VALUES (?, ?, ?, ?, 'active')
        `, [collegeId, programCode, programName, finalChairpersonId || null]);

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

/**
 * PUT /api/qce/programs/:id
 * Update program details
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { programCode, programName } = req.body;

        if (!programCode || !programName) {
            return res.status(400).json({
                success: false,
                message: 'Program code and name are required'
            });
        }

        const [result] = await promisePool.query(
            'UPDATE programs SET program_code = ?, program_name = ? WHERE id = ?',
            [programCode, programName, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Program not found'
            });
        }

        res.json({
            success: true,
            message: 'Program updated successfully'
        });

    } catch (error) {
        console.error('Error updating program:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating program',
            error: error.message
        });
    }
});

/**
 * DELETE /api/qce/programs/:id
 * Soft delete (set status to inactive) a program
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if program exists
        const [existing] = await promisePool.query('SELECT id FROM programs WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Program not found'
            });
        }

        // Soft delete
        await promisePool.query(
            "UPDATE programs SET status = 'inactive' WHERE id = ?",
            [id]
        );

        res.json({
            success: true,
            message: 'Program deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting program:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting program',
            error: error.message
        });
    }
});

module.exports = router;

