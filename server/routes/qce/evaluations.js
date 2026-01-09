const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/qce/faculty-evaluations
 * Get all faculty with their evaluation statistics for a specific college
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

        console.log(`Fetching faculty evaluations for college_id: ${college_id}`);

        const query = `
            SELECT 
                f.id,
                CONCAT(f.first_name, ' ', f.last_name) as name,
                f.position,
                f.email,
                d.department_name,
                COUNT(DISTINCT fa.id) as subjects_count,
                COUNT(DISTINCT fa.section) as sections_count,
                COUNT(DISTINCT CASE WHEN fa.eval_code IS NOT NULL AND fa.eval_code != '' THEN fa.id END) as started_count,
                COUNT(DISTINCT fa.id) as total_evaluations,
                0 as evaluation_progress -- Still keeping this for now but UI will use status
            FROM faculty f
            LEFT JOIN departments d ON f.department_id = d.id
            LEFT JOIN faculty_assignments fa ON f.id = fa.faculty_id AND fa.status = 'active'
            WHERE f.college_id = ? 
                AND f.status = 'active'

            GROUP BY f.id, f.first_name, f.last_name, f.position, f.email, d.department_name
            ORDER BY f.last_name ASC
        `;

        const [faculty] = await promisePool.query(query, [college_id]);
        console.log(`Found ${faculty.length} faculty members`);

        res.json({
            success: true,
            data: faculty
        });

    } catch (error) {
        console.error('Error fetching faculty evaluations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching faculty evaluations',
            error: error.message
        });
    }
});

/**
 * GET /api/qce/faculty-evaluations/:facultyId
 * Get detailed evaluation information for a specific faculty member
 */
router.get('/:facultyId', async (req, res) => {
    try {
        const { facultyId } = req.params;
        console.log(`Fetching faculty detail for ID: ${facultyId}`);

        // Get faculty basic info
        const [facultyInfo] = await promisePool.query(`
            SELECT 
                f.id,
                CONCAT(f.first_name, ' ', f.last_name) as name,
                f.position,
                f.email,
                d.department_name,
                c.college_name
            FROM faculty f
            LEFT JOIN departments d ON f.department_id = d.id
            LEFT JOIN colleges c ON f.college_id = c.id
            WHERE f.id = ?
        `, [facultyId]);

        console.log('Faculty Info Result:', facultyInfo);

        if (facultyInfo.length === 0) {
            console.log('Faculty not found in database');
            return res.status(404).json({
                success: false,
                message: 'Faculty not found'
            });
        }

        // Get evaluation details by subject and section
        const [evaluations] = await promisePool.query(`
            SELECT 
                fa.id as assignment_id,
                SUBSTRING_INDEX(fa.section, '-', -1) as section,
                fa.section as full_section,
                s.subject_code,
                s.subject_name,
                CASE 
                    WHEN fa.section REGEXP '^[0-9]+-' THEN SUBSTRING_INDEX(fa.section, '-', 1)
                    ELSE SUBSTRING_INDEX(TRIM(SUBSTRING_INDEX(fa.section, '-', 1)), ' ', -1)
                END as year_level,
                fa.eval_code,
                COUNT(DISTINCT st.id) as total_students,
                COUNT(DISTINCT se.student_id) as evaluated_count,
                COALESCE(
                    ROUND(
                        (COUNT(DISTINCT se.student_id) / NULLIF(COUNT(DISTINCT st.id), 0)) * 100, 
                        0
                    ), 
                    0
                ) as progress,
                CASE 
                    WHEN fa.eval_code IS NULL OR fa.eval_code = '' THEN 'Not Created'
                    WHEN COUNT(DISTINCT se.student_id) = COUNT(DISTINCT st.id) AND COUNT(DISTINCT st.id) > 0 
                    THEN 'Completed'
                    ELSE 'In Progress'
                END as status
            FROM faculty_assignments fa
            INNER JOIN subjects s ON fa.subject_id = s.id
            LEFT JOIN students st ON (
                st.section = fa.section 
                OR CONCAT(st.year_level, '-', st.section) = fa.section
            ) AND st.status = 'active'
            LEFT JOIN student_evaluations se ON se.faculty_assignment_id = fa.id 
                AND se.student_id = st.id
            WHERE fa.faculty_id = ? AND fa.status = 'active'
            GROUP BY fa.id, fa.section, s.subject_code, s.subject_name
            ORDER BY s.subject_code ASC, fa.section ASC
        `, [facultyId]);

        // Calculate summary statistics
        const totalSubjects = new Set(evaluations.map(e => e.subject_code)).size;
        const totalSections = new Set(evaluations.map(e => e.full_section)).size;
        const totalStudents = evaluations.reduce((sum, e) => sum + parseInt(e.total_students), 0);
        const evaluatedStudents = evaluations.reduce((sum, e) => sum + parseInt(e.evaluated_count), 0);
        const pendingStudents = totalStudents - evaluatedStudents;

        res.json({
            success: true,
            faculty: {
                ...facultyInfo[0],
                subjects_count: totalSubjects,
                sections_count: totalSections,
                total_students: totalStudents,
                evaluated_count: evaluatedStudents,
                pending_count: pendingStudents,
                overall_progress: totalStudents > 0 ? Math.round((evaluatedStudents / totalStudents) * 100) : 0
            },
            evaluations: evaluations
        });

    } catch (error) {
        console.error('Error fetching faculty evaluation details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching faculty evaluation details',
            error: error.message
        });
    }
});

module.exports = router;
