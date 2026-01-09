const { promisePool } = require('./config/db');

async function debugStudentStats() {
    try {
        const [students] = await promisePool.query("SELECT id, year_level, section FROM students WHERE first_name LIKE '%Patrick%'");
        const student = students[0];

        // 2. Find Student Evaluations
        const [evals] = await promisePool.query("SELECT faculty_assignment_id FROM student_evaluations WHERE student_id = ?", [student.id]);

        if (evals.length > 0) {
            const assignmentIds = evals.map(e => e.faculty_assignment_id);
            const [assignments] = await promisePool.query(`SELECT id, section FROM faculty_assignments WHERE id IN (${assignmentIds.join(',')})`);
            console.log('Assignment Sections:', assignments.map(a => a.section));
            console.log('Student Section:', student.section);
            console.log('Student Year:', student.year_level);
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

debugStudentStats();
