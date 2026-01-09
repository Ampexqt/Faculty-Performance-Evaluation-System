const { promisePool } = require('./config/db');

async function checkAssignments() {
    try {
        console.log('--- faculty_assignments ---');
        const [rows] = await promisePool.query('SELECT id, faculty_id, section, student_count FROM faculty_assignments WHERE faculty_id = ?', [22]); // Assuming 22 is the faculty ID from previous context or generic check
        console.log(rows);

        console.log('--- generic check ---');
        const [all] = await promisePool.query('SELECT * FROM faculty_assignments LIMIT 5');
        console.log(all);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkAssignments();
