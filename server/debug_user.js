const { promisePool } = require('./config/db');

async function checkRecentSubjects() {
    try {
        const [subjects] = await promisePool.query("SELECT * FROM subjects ORDER BY id DESC LIMIT 5");
        console.log('Recent Subjects:', subjects);

        // Also check Departments
        const [depts] = await promisePool.query("SELECT * FROM departments");
        console.log('Departments:', depts);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkRecentSubjects();
