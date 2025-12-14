const { promisePool } = require('./config/db');

async function checkFaculty() {
    try {
        console.log('Checking Faculty table...');
        const [rows] = await promisePool.query('SELECT id, first_name, last_name, email, position, department_id, college_id FROM faculty');
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
    process.exit();
}

checkFaculty();
