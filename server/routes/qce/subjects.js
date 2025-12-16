const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/qce/subjects
 * Get all subjects (optionally filtered by department_id)
 */
router.get('/', async (req, res) => {
    try {
        const { department_id } = req.query;

        let query = `
            SELECT 
                s.*,
                (SELECT COUNT(DISTINCT section) FROM faculty_assignments fa WHERE fa.subject_id = s.id AND fa.status = 'active') as active_count
            FROM subjects s
            WHERE s.status = 'active'
        `;
        const params = [];

        if (department_id) {
            query += ` AND s.department_id = ?`;
            params.push(department_id);
        }

        query += ` ORDER BY s.subject_code ASC`;

        const [subjects] = await promisePool.query(query, params);

        res.json({
            success: true,
            data: subjects.map(s => ({
                id: s.id,
                code: s.subject_code,
                name: s.subject_name,
                units: s.units,
                departmentId: s.department_id,
                activeSections: s.active_count || 0
            }))
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subjects',
            error: error.message
        });
    }
});

/**
 * POST /api/qce/subjects
 * Create a new subject
 */
router.post('/', async (req, res) => {
    try {
        const { subjectCode, subjectName, units, departmentId } = req.body;

        if (!subjectCode || !subjectName || !departmentId) {
            return res.status(400).json({
                success: false,
                message: 'Subject Code, Name, and Department ID are required'
            });
        }

        // Check duplicates
        const [existing] = await promisePool.query(
            'SELECT id FROM subjects WHERE subject_code = ?',
            [subjectCode]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Subject code already exists'
            });
        }

        const [result] = await promisePool.query(
            'INSERT INTO subjects (subject_code, subject_name, units, department_id, status) VALUES (?, ?, ?, ?, ?)',
            [subjectCode, subjectName, units || 3, departmentId, 'active']
        );

        res.status(201).json({
            success: true,
            message: 'Subject created successfully',
            data: {
                id: result.insertId,
                code: subjectCode,
                name: subjectName,
                units: units || 3,
                departmentId,
                activeSections: 0
            }
        });

    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating subject',
            error: error.message
        });
    }
});

/**
 * GET /api/qce/subjects/assignments
 * Get all subject assignments (optionally filtered by department_id)
 */
router.get('/assignments', async (req, res) => {
    try {
        const { department_id } = req.query;

        let query = `
            SELECT 
                fa.id,
                fa.subject_id,
                fa.faculty_id,
                fa.section,
                fa.schedule,
                fa.room,
                s.subject_code,
                s.subject_name,
                f.first_name,
                f.last_name,
                ay.year_label,
                ay.semester
            FROM faculty_assignments fa
            JOIN subjects s ON fa.subject_id = s.id
            JOIN faculty f ON fa.faculty_id = f.id
            JOIN academic_years ay ON fa.academic_year_id = ay.id
            WHERE fa.status = 'active'
        `;
        const params = [];

        if (department_id) {
            // Filter by subject's department or faculty's department?
            // Usually Dept Chair wants to see subjects assigned UNDER their department.
            query += ` AND s.department_id = ?`;
            params.push(department_id);
        }

        if (req.query.faculty_id) {
            query += ` AND fa.faculty_id = ?`;
            params.push(req.query.faculty_id);
        }

        query += ` ORDER BY s.subject_code ASC, fa.section ASC`;

        const [assignments] = await promisePool.query(query, params);

        res.json({
            success: true,
            data: assignments.map(a => ({
                id: a.id,
                subjectId: a.subject_id,
                facultyId: a.faculty_id,
                subjectCode: a.subject_code,
                subjectName: a.subject_name,
                section: a.section,
                facultyName: `${a.first_name} ${a.last_name}`,
                schedule: a.schedule,
                academicYear: `${a.year_label} ${a.semester}`
            }))
        });

    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching assignments',
            error: error.message
        });
    }
});

/**
 * POST /api/qce/subjects/assignments
 * Assign a subject to a faculty
 */
router.post('/assignments', async (req, res) => {
    try {
        const { facultyId, subjectId, section, academicYearId } = req.body;

        if (!facultyId || !subjectId || !section) {
            return res.status(400).json({
                success: false,
                message: 'Faculty, Subject, and Section are required'
            });
        }

        // Use provided academicYearId or find current active one
        let yearId = academicYearId;
        if (!yearId) {
            const [activeYear] = await promisePool.query(
                'SELECT id FROM academic_years WHERE is_current = TRUE LIMIT 1'
            );
            if (activeYear.length > 0) {
                yearId = activeYear[0].id;
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'No active academic year found'
                });
            }
        }

        // Check for duplicate assignment (same subject, section, and academic year)
        const [existingAssignment] = await promisePool.query(
            'SELECT id FROM faculty_assignments WHERE subject_id = ? AND section = ? AND academic_year_id = ? AND status = "active"',
            [subjectId, section, yearId]
        );

        if (existingAssignment.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'This subject is already assigned to this section for the selected academic year.'
            });
        }

        // Insert assignment
        const [result] = await promisePool.query(
            'INSERT INTO faculty_assignments (faculty_id, subject_id, academic_year_id, section, status) VALUES (?, ?, ?, ?, ?)',
            [facultyId, subjectId, yearId, section, 'active']
        );

        res.status(201).json({
            success: true,
            message: 'Subject assigned successfully',
            data: {
                id: result.insertId,
                facultyId,
                subjectId,
                section
            }
        });

    } catch (error) {
        console.error('Error assigning subject:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning subject',
            error: error.message
        });
    }
});

/**
 * PUT /api/qce/subjects/:id
 * Update subject details
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { subjectCode, subjectName, units } = req.body;

        if (!subjectCode || !subjectName) {
            return res.status(400).json({
                success: false,
                message: 'Subject code and name are required'
            });
        }

        const [result] = await promisePool.query(
            'UPDATE subjects SET subject_code = ?, subject_name = ?, units = ? WHERE id = ?',
            [subjectCode, subjectName, units || 3, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        res.json({
            success: true,
            message: 'Subject updated successfully'
        });

    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating subject',
            error: error.message
        });
    }
});

/**
 * DELETE /api/qce/subjects/:id
 * Soft delete (set status to inactive) a subject
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if subject exists
        const [existing] = await promisePool.query('SELECT id FROM subjects WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        // Soft delete
        await promisePool.query(
            "UPDATE subjects SET status = 'inactive' WHERE id = ?",
            [id]
        );

        res.json({
            success: true,
            message: 'Subject deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting subject',
            error: error.message
        });
    }
});

/**
 * PUT /api/qce/subjects/assignments/:id
 * Update a subject assignment
 */
router.put('/assignments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { subjectId, facultyId, section } = req.body;

        // Validate required fields
        if (!subjectId || !facultyId || !section) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if assignment exists
        const [existing] = await promisePool.query(
            'SELECT id FROM faculty_assignments WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        // Check for duplicate assignment (same subject, section, and academic year)
        // We need the academic_year_id of the current assignment to check conflicts
        const [currentAssignment] = await promisePool.query(
            'SELECT academic_year_id FROM faculty_assignments WHERE id = ?',
            [id]
        );

        if (currentAssignment.length > 0) {
            const yearId = currentAssignment[0].academic_year_id;
            const [duplicateCheck] = await promisePool.query(
                'SELECT id FROM faculty_assignments WHERE subject_id = ? AND section = ? AND academic_year_id = ? AND status = "active" AND id != ?',
                [subjectId, section, yearId, id]
            );

            if (duplicateCheck.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'This subject is already assigned to this section for the current academic year.'
                });
            }
        }

        // Update assignment
        await promisePool.query(
            'UPDATE faculty_assignments SET faculty_id = ?, subject_id = ?, section = ? WHERE id = ?',
            [facultyId, subjectId, section, id]
        );

        res.json({
            success: true,
            message: 'Assignment updated successfully'
        });

    } catch (error) {
        console.error('Error updating assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating assignment',
            error: error.message
        });
    }
});

/**
 * DELETE /api/qce/subjects/assignments/:id
 * Delete a subject assignment
 */
router.delete('/assignments/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if assignment exists
        const [existing] = await promisePool.query(
            'SELECT id FROM faculty_assignments WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        // Delete assignment
        await promisePool.query(
            'DELETE FROM faculty_assignments WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Assignment deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting assignment',
            error: error.message
        });
    }
});

/**
 * POST /api/qce/subjects/assignments/generate-code
 * Save generated evaluation code for an assignment
 */
router.post('/assignments/generate-code', async (req, res) => {
    try {
        const { assignmentId, code } = req.body;

        if (!assignmentId || !code) {
            return res.status(400).json({
                success: false,
                message: 'Assignment ID and Code are required'
            });
        }

        const [result] = await promisePool.query(
            'UPDATE faculty_assignments SET eval_code = ? WHERE id = ?',
            [code, assignmentId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        res.json({
            success: true,
            message: 'Evaluation code saved successfully'
        });

    } catch (error) {
        console.error('Error saving evaluation code:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving evaluation code',
            error: error.message
        });
    }
});

module.exports = router;
