const { promisePool } = require('./config/db');

async function listDepts() {
    try {
        const [rows] = await promisePool.query('SELECT * FROM departments WHERE college_id = 16');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

listDepts();
