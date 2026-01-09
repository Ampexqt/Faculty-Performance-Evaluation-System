const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'faculty_evaluation',
};

async function checkCollege() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`SELECT * FROM colleges WHERE id = 17`);
        console.log('College:', rows);
        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkCollege();
