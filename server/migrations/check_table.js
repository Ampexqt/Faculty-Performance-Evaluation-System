const { promisePool } = require('../config/db');

async function checkTableStructure() {
    try {
        const [rows] = await promisePool.query("DESCRIBE supervisor_evaluations");
        rows.forEach(row => {
            console.log(`${row.Field}: ${row.Type}`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkTableStructure();
