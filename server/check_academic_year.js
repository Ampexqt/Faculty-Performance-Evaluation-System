const { promisePool } = require('./config/db');

async function checkAcademicYears() {
    try {
        console.log('--- Active Academic Year Semester ---');
        const [rows] = await promisePool.query("SELECT id, year_label, semester FROM academic_years WHERE status = 'active'");
        console.log(rows);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkAcademicYears();
