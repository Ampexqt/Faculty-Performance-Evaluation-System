const { promisePool } = require('./config/db');

async function checkPresidentSchema() {
    try {
        console.log('--- SHOW CREATE TABLE president_evaluations ---');
        const [create] = await promisePool.query('SHOW CREATE TABLE president_evaluations');
        console.log(create[0]['Create Table']);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkPresidentSchema();
