const { promisePool } = require('./config/db');

async function checkSubjects() {
    try {
        console.log('Checking Subjects table...');
        const [rows] = await promisePool.query('SELECT * FROM subjects');
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
    process.exit();
}

checkSubjects();
