const mysql = require('mysql2/promise');

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'faculty_evaluation'
    });

    try {
        console.log('Checking student_evaluations columns...\n');
        const [columns] = await connection.query('SHOW COLUMNS FROM student_evaluations');
        console.table(columns);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkSchema();
