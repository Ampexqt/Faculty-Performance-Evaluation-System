const { promisePool } = require('./config/db');

async function listDeptsOnly() {
    try {
        const [depts] = await promisePool.query('SELECT * FROM departments');
        console.log("Departments Count:", depts.length);
        console.log(JSON.stringify(depts, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

listDeptsOnly();
