const { promisePool } = require('./config/db');

async function checkSchema() {
    try {
        const [periodCols] = await promisePool.query('DESCRIBE evaluation_periods');
        console.log('--- evaluation_periods ---');
        periodCols.forEach(c => console.log(`${c.Field} (${c.Type})`));

        console.log('\n--- vpaa tables ---');
        const [tables] = await promisePool.query("SHOW TABLES LIKE 'vpaa%'");
        tables.forEach(t => console.log(Object.values(t)[0]));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSchema();
