const { promisePool } = require('./config/db');

async function checkFaculty() {
    try {
        const [rows] = await promisePool.query('SELECT id, first_name, last_name, department_id, college_id FROM faculty WHERE first_name LIKE "%Marco%" OR last_name LIKE "%Pagotalsidro%"');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkFaculty();
