const mysql = require('mysql2/promise');

async function checkSpecificColumn() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'faculty_evaluation'
    });

    try {
        const [columns] = await connection.query("SHOW COLUMNS FROM student_evaluations LIKE 'evaluation_date'");
        if (columns.length > 0) {
            console.log('✅ evaluation_date column exists!');
        } else {
            console.log('❌ evaluation_date column MISSING!');
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkSpecificColumn();
