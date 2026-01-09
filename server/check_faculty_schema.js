const { promisePool } = require('./config/db');

async function checkSchema() {
    try {
        const [rows] = await promisePool.query('SHOW COLUMNS FROM faculty');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSchema();
