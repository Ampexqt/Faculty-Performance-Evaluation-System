const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'faculty_evaluation',
};

async function fixUserDept() {
    try {
        const connection = await mysql.createConnection(dbConfig);

        // 1. Create Department
        // Check if exists first to avoid duplicates if re-run
        const [existing] = await connection.execute("SELECT id FROM departments WHERE department_name = 'Department of Information Technology'");

        let deptId;
        if (existing.length > 0) {
            deptId = existing[0].id;
            console.log('Department already exists:', deptId);
        } else {
            const [result] = await connection.execute(
                "INSERT INTO departments (department_code, department_name, college_id, status) VALUES (?, ?, ?, ?)",
                ['DIT', 'Department of Information Technology', 17, 'active']
            );
            deptId = result.insertId;
            console.log('Created Department:', deptId);
        }

        // 2. Update User (ID 40)
        await connection.execute(
            "UPDATE faculty SET department_id = ? WHERE id = 40",
            [deptId]
        );
        console.log('Updated User 40 with Department ID:', deptId);

        // Also update local storage if possible? No, can't touch client storage.
        // User will likely need to re-login or the fetchCurrentUser will pick it up.

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

fixUserDept();
