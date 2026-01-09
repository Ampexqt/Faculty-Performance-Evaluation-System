const { promisePool } = require('./config/db');

async function fixData() {
    try {
        // 1. Create Department for College 16
        console.log("Creating department for College 16...");
        const [deptResult] = await promisePool.query(
            'INSERT INTO departments (college_id, department_code, department_name, status) VALUES (?, ?, ?, ?)',
            [16, 'Engineering', 'Department of Engineering', 'active']
        );
        const newDeptId = deptResult.insertId;
        console.log("Created Department ID:", newDeptId);

        // 2. Assign Marco (id 30) to this department
        console.log("Assigning Marco (id 30) to new department...");
        await promisePool.query(
            'UPDATE faculty SET department_id = ? WHERE id = 30',
            [newDeptId]
        );
        console.log("Marco assigned to department.");

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

fixData();
