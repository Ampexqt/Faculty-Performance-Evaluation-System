const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'faculty_evaluation',
};

async function listDepartments() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`SELECT * FROM departments`);
        console.log('Departments:', rows);
        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listDepartments();
