const { promisePool } = require('../config/db');

async function checkScore() {
    try {
        const [rows] = await promisePool.query("SELECT id, total_score FROM supervisor_evaluations WHERE id = 14");
        console.log(rows);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkScore();
