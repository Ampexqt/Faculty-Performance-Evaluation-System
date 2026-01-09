const { promisePool } = require('./config/db');

async function checkSupervisorEvals() {
    try {
        console.log('--- supervisor_evaluations ---');
        try {
            const [rows] = await promisePool.query('SELECT * FROM supervisor_evaluations LIMIT 5');
            console.log(rows);

            // Count query test
            const [count] = await promisePool.query('SELECT COUNT(*) as count FROM supervisor_evaluations WHERE evaluatee_id = 7'); // assuming 7 or whatever ID
            console.log('Count test:', count[0].count);

        } catch (e) {
            console.log('Error:', e.message);
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSupervisorEvals();
