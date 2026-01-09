const { promisePool } = require('./config/db');

async function checkJhon() {
    try {
        const [users] = await promisePool.query(
            `SELECT id, first_name, last_name, department_id, college_id 
             FROM faculty 
             WHERE first_name LIKE '%Jhon%'`
        );
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkJhon();
