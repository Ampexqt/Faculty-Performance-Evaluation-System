const { promisePool } = require('./config/db');

async function checkStudentEvalSchema() {
    try {
        console.log('--- student_evaluations ---');
        try {
            const [cols] = await promisePool.query('DESCRIBE student_evaluations');
            cols.forEach(c => console.log(`${c.Field} (${c.Type})`));
        } catch (e) {
            console.log('Table student_evaluations does not exist or error:', e.message);
        }

        console.log('--- students ---');
        try {
            const [cols] = await promisePool.query('DESCRIBE students');
            cols.forEach(c => console.log(`${c.Field} (${c.Type})`));
        } catch (e) {
            console.log('Table students does not exist or error:', e.message);
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkStudentEvalSchema();
