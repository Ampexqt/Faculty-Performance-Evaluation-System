const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'faculty_evaluation',
};

async function checkUser() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`SELECT id, first_name, last_name, position, department_id, college_id FROM faculty WHERE first_name LIKE '%Marco%' OR last_name LIKE '%Pagotaisidro%'`);
        console.log('User Data:', rows);
        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkUser();
