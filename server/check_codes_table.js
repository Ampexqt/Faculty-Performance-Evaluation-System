const { promisePool } = require('./config/db');

async function checkTable() {
    try {
        const [columns] = await promisePool.query('DESCRIBE supervisor_evaluation_codes');
        console.log('Columns in supervisor_evaluation_codes:');
        columns.forEach(col => console.log(`${col.Field} (${col.Type})`));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkTable();
