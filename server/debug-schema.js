const { promisePool } = require('./config/db');

async function checkSchema() {
    try {
        console.log('--- Faculty Assignments Columns ---');
        const [faCols] = await promisePool.query('SHOW COLUMNS FROM faculty_assignments');
        console.log(JSON.stringify(faCols.map(c => c.Field), null, 2));

        console.log('\n--- Student Evaluations Columns ---');
        const [seCols] = await promisePool.query('SHOW COLUMNS FROM student_evaluations');
        console.log(JSON.stringify(seCols.map(c => c.Field), null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
    process.exit();
}

checkSchema();
