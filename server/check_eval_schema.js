const { promisePool } = require('./config/db');

async function checkSchema() {
    try {
        const [rows] = await promisePool.query("DESCRIBE evaluators");
        console.log('Columns:', rows.map(r => r.Field));
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSchema();
