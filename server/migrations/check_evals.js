const { promisePool } = require('../config/db');

async function checkEvaluations() {
    try {
        const [faculty] = await promisePool.query("SELECT id FROM faculty WHERE last_name = 'Andrade'");
        if (faculty.length === 0) {
            console.log('Fherdz not found');
            return;
        }
        const fherdzId = faculty[0].id;
        console.log(`Fherdz ID: ${fherdzId}`);

        const [evals] = await promisePool.query("SELECT id, total_score, status FROM supervisor_evaluations WHERE evaluatee_id = ?", [fherdzId]);
        console.log(evals);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkEvaluations();
