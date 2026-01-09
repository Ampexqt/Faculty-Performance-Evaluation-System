const { promisePool } = require('./config/db');

async function checkUsers() {
    try {
        const [users] = await promisePool.query(
            `SELECT id, first_name, last_name, email, role, department_id, college_id 
             FROM faculty 
             WHERE first_name LIKE '%Jhon%' OR last_name LIKE '%Rueda%' 
                OR first_name LIKE '%alnazer%' OR last_name LIKE '%Pagador%'`
        );
        console.log("Users found:", JSON.stringify(users, null, 2));

        if (users.length > 0) {
            const deptIds = users.map(u => u.department_id).filter(id => id);
            const collegeIds = users.map(u => u.college_id).filter(id => id);

            if (deptIds.length > 0) {
                const [depts] = await promisePool.query('SELECT * FROM departments WHERE id IN (?)', [deptIds]);
                console.log("Departments:", JSON.stringify(depts, null, 2));
            }

            if (collegeIds.length > 0) {
                const [colleges] = await promisePool.query('SELECT * FROM colleges WHERE id IN (?)', [collegeIds]);
                console.log("Colleges:", JSON.stringify(colleges, null, 2));
            }
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkUsers();
