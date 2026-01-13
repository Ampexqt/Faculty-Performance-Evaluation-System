const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

/**
 * GET /api/qce/evaluation-results/:collegeId
 * Get comprehensive evaluation results for all faculty in a college
 */
router.get('/evaluation-results/:collegeId', async (req, res) => {
    try {
        const { collegeId } = req.params;

        // Fetch all faculty in the college with their evaluation data
        const [facultyData] = await promisePool.query(`
            SELECT 
                f.id,
                CONCAT(f.first_name, ' ', f.last_name) as name,
                f.position,
                f.department_id,
                d.department_name,
                
                -- Student Evaluations Count
                (SELECT COUNT(DISTINCT se.id) 
                 FROM student_evaluations se
                 JOIN faculty_assignments fa ON se.faculty_assignment_id = fa.id
                 WHERE fa.faculty_id = f.id AND se.status = 'completed') as studentEvaluations,
                
                -- Supervisor Evaluations Count
                (SELECT COUNT(*) 
                 FROM supervisor_evaluations sup
                 WHERE sup.evaluatee_id = f.id AND sup.status = 'completed') as supervisorEvaluations,
                
                -- Student Average Score
                (SELECT AVG(se.total_score)
                 FROM student_evaluations se
                 JOIN faculty_assignments fa ON se.faculty_assignment_id = fa.id
                 WHERE fa.faculty_id = f.id AND se.status = 'completed') as studentAverage,
                
                -- Supervisor Average Score
                (SELECT AVG(sup.total_score)
                 FROM supervisor_evaluations sup
                 WHERE sup.evaluatee_id = f.id AND sup.status = 'completed') as supervisorAverage
                
            FROM faculty f
            LEFT JOIN departments d ON f.department_id = d.id
            WHERE f.college_id = ? AND f.status = 'active'
            ORDER BY f.last_name, f.first_name
        `, [collegeId]);

        // Calculate overall scores for each faculty
        const results = facultyData.map(faculty => {
            const studentAvg = parseFloat(faculty.studentAverage) || 0;
            const supervisorAvg = parseFloat(faculty.supervisorAverage) || 0;

            // Calculate weighted overall score
            // Student evaluations: 60% weight, Supervisor evaluations: 40% weight
            let overallScore = null;

            if (studentAvg > 0 && supervisorAvg > 0) {
                overallScore = (studentAvg * 0.6) + (supervisorAvg * 0.4);
            } else if (studentAvg > 0) {
                overallScore = studentAvg;
            } else if (supervisorAvg > 0) {
                overallScore = supervisorAvg;
            }

            return {
                id: faculty.id,
                name: faculty.name,
                position: faculty.position,
                department: faculty.department_name,
                studentEvaluations: parseInt(faculty.studentEvaluations) || 0,
                supervisorEvaluations: parseInt(faculty.supervisorEvaluations) || 0,
                studentAverage: studentAvg,
                supervisorAverage: supervisorAvg,
                overallScore: overallScore
            };
        });

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Error fetching evaluation results:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching evaluation results',
            error: error.message
        });
    }
});

/**
 * GET /api/qce/evaluation-results/faculty/:facultyId
 * Get detailed evaluation results for a specific faculty member
 */
router.get('/evaluation-results/faculty/:facultyId', async (req, res) => {
    try {
        const { facultyId } = req.params;

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

        if (facultyInfo.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Faculty not found'
            });
        }

        // Get student evaluations details
        const [studentEvals] = await promisePool.query(`
            SELECT 
                se.id,
                se.total_score,
                se.sentiment_score,
                se.submitted_at,
                se.evaluation_date,
                s.subject_name,
                s.subject_code,
                fa.section,
                ay.year_label,
                ay.semester
            FROM student_evaluations se
            JOIN faculty_assignments fa ON se.faculty_assignment_id = fa.id
            JOIN subjects s ON fa.subject_id = s.id
            JOIN academic_years ay ON fa.academic_year_id = ay.id
            WHERE fa.faculty_id = ? AND se.status = 'completed'
            ORDER BY se.evaluation_date DESC
        `, [facultyId]);

        // Get supervisor evaluations with academic year info
        const [supervisorEvals] = await promisePool.query(`
            SELECT 
                sup.id,
                sup.total_score,
                sup.score_commitment,
                sup.score_knowledge,
                sup.score_teaching,
                sup.score_management,
                sup.comments,
                sup.evaluator_name,
                sup.evaluator_position,
                sup.evaluation_date,
                ay.year_label,
                ay.semester
            FROM supervisor_evaluations sup
            JOIN evaluation_periods ep ON sup.evaluation_period_id = ep.id
            JOIN academic_years ay ON ep.academic_year_id = ay.id
            WHERE sup.evaluatee_id = ? AND sup.status = 'completed'
            ORDER BY sup.evaluation_date DESC
        `, [facultyId]);

        // Calculate statistics
        const studentAvg = studentEvals.length > 0
            ? studentEvals.reduce((sum, e) => sum + parseFloat(e.total_score), 0) / studentEvals.length
            : 0;

        const supervisorAvg = supervisorEvals.length > 0
            ? supervisorEvals.reduce((sum, e) => sum + parseFloat(e.total_score), 0) / supervisorEvals.length
            : 0;

        let overallScore = null;
        if (studentAvg > 0 && supervisorAvg > 0) {
            overallScore = (studentAvg * 0.6) + (supervisorAvg * 0.4);
        } else if (studentAvg > 0) {
            overallScore = studentAvg;
        } else if (supervisorAvg > 0) {
            overallScore = supervisorAvg;
        }

        res.json({
            success: true,
            data: {
                faculty: facultyInfo[0],
                studentEvaluations: studentEvals,
                supervisorEvaluations: supervisorEvals,
                statistics: {
                    studentCount: studentEvals.length,
                    supervisorCount: supervisorEvals.length,
                    studentAverage: studentAvg,
                    supervisorAverage: supervisorAvg,
                    overallScore: overallScore
                }
            }
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

/**
 * GET /api/qce/evaluation-results/faculty/:facultyId/annex/:annexType
 * Get aggregated ratings for specific annex type (A=Student, B=Peer, D=Supervisor)
 */
router.get('/evaluation-results/faculty/:facultyId/annex/:annexType', async (req, res) => {
    try {
        const { facultyId, annexType } = req.params;
        const type = annexType.toLowerCase();

        let query = '';
        let params = [];
        let ratings = {};
        let criteriaType = 'new'; // Default

        if (type === 'annex-a') {
            // Annex A: Student Evaluations
            query = `
                SELECT 
                    erd.category,
                    erd.criterion_index,
                    AVG(erd.rating) as avg_rating,
                    COUNT(erd.rating) as count
                FROM evaluation_ratings_detail erd
                JOIN student_evaluations se ON erd.evaluation_id = se.id
                JOIN faculty_assignments fa ON se.faculty_assignment_id = fa.id
                WHERE fa.faculty_id = ? AND se.status = 'completed'
                GROUP BY erd.category, erd.criterion_index
            `;
            params = [facultyId];

        } else if (type === 'annex-b') {
            // Annex B: Computation Summary (Student + Supervisor History)

            // 1. Get Active Academic Year as base
            const [activeYearRows] = await promisePool.query("SELECT year_label FROM academic_years WHERE status = 'active' LIMIT 1");
            const activeYear = activeYearRows[0]?.year_label || '2025-2026';

            // 2. Get Student Evaluation History
            const [studentStats] = await promisePool.query(`
                SELECT 
                    ay.year_label, 
                    ay.semester, 
                    AVG(se.total_score) as avg_score
                FROM student_evaluations se
                JOIN faculty_assignments fa ON se.faculty_assignment_id = fa.id
                JOIN academic_years ay ON fa.academic_year_id = ay.id
                WHERE fa.faculty_id = ? AND se.status = 'completed'
                GROUP BY ay.year_label, ay.semester
            `, [facultyId]);

            // 3. Get Supervisor Evaluation History
            const [supervisorStats] = await promisePool.query(`
                SELECT 
                    ay.year_label, 
                    ay.semester, 
                    AVG(sup.total_score) as avg_score
                FROM supervisor_evaluations sup
                JOIN evaluation_periods ep ON sup.evaluation_period_id = ep.id
                JOIN academic_years ay ON ep.academic_year_id = ay.id
                WHERE sup.evaluatee_id = ? AND sup.status = 'completed'
                GROUP BY ay.year_label, ay.semester
            `, [facultyId]);

            return res.json({
                success: true,
                data: {
                    activeYear,
                    studentStats,
                    supervisorStats
                }
            });

        } else if (type === 'annex-d') {
            // Annex D: Supervisor (Dean) Detailed Ratings
            const position = 'Supervisor';

            query = `
                SELECT 
                    ser.category,
                    ser.criterion_index,
                    AVG(ser.rating) as avg_rating,
                    COUNT(ser.rating) as count
                FROM supervisor_evaluation_ratings ser
                JOIN supervisor_evaluations se ON ser.evaluation_id = se.id
                WHERE se.evaluatee_id = ? 
                AND se.status = 'completed' 
                AND se.evaluator_position = ?
                GROUP BY ser.category, ser.criterion_index
            `;
            params = [facultyId, position];
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid annex type'
            });
        }

        const [rows] = await promisePool.query(query, params);

        // Process rows into ratings object { "A-0": 4.5, "A-1": ... }
        // And infer criteria type
        let maxIndexA = 0;
        let maxIndexC = 0;

        rows.forEach(row => {
            const key = `${row.category}-${row.criterion_index}`;
            ratings[key] = parseFloat(row.avg_rating);

            if (row.category === 'A' && row.criterion_index > maxIndexA) maxIndexA = row.criterion_index;
            if (row.category === 'C' && row.criterion_index > maxIndexC) maxIndexC = row.criterion_index;
        });

        // Infer criteria type
        // New Criteria: A has 6 items (index 5)
        // Old Criteria: C has 5 items (index 4)
        if (maxIndexA >= 5) {
            criteriaType = 'new';
        } else if (maxIndexC >= 4) {
            criteriaType = 'old';
        } else {
            // Fallback or default
            criteriaType = 'new';
        }

        // Fetch overall average score based on total_score in evaluation tables
        let avgQuery = '';
        if (type === 'annex-a') {
            avgQuery = `
                SELECT AVG(se.total_score) as overall_avg
                FROM student_evaluations se
                JOIN faculty_assignments fa ON se.faculty_assignment_id = fa.id
                WHERE fa.faculty_id = ? AND se.status = 'completed'
            `;
        } else if (type === 'annex-b' || type === 'annex-d') {
            const position = type === 'annex-b' ? 'Department Chair' : 'Supervisor';
            avgQuery = `
                SELECT AVG(se.total_score) as overall_avg
                FROM supervisor_evaluations se
                WHERE se.evaluatee_id = ? 
                AND se.status = 'completed' 
                AND se.evaluator_position = ?
            `;
        }

        let averageScore = 0;
        if (avgQuery) {
            const [avgRows] = await promisePool.query(avgQuery, params); // params are same as main query ([facultyId] or [facultyId, position])
            averageScore = parseFloat(avgRows[0]?.overall_avg || 0);
        }

        res.json({
            success: true,
            data: {
                ratings,
                criteriaType,
                averageScore
            }
        });

    } catch (error) {
        console.error('Error fetching annex report:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching annex report'
        });
    }
});

module.exports = router;
