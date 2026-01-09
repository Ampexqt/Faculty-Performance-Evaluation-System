const { promisePool } = require('./config/db');

async function listAll() {
    try {
        const [colleges] = await promisePool.query('SELECT * FROM colleges');
        const [depts] = await promisePool.query('SELECT * FROM departments');
        console.log("Colleges:", JSON.stringify(colleges, null, 2));
        console.log("Departments:", JSON.stringify(depts, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

listAll();
