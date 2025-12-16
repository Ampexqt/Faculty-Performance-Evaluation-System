const mysql = require('mysql2/promise');

async function checkEvaluations() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'faculty_evaluation'
    });

    try {
        console.log('Checking recent evaluations...\n');

        const [rows] = await connection.query(`
            SELECT 
                id,
                student_id, 
                total_score, 
                score_commitment,
                comments,
                submitted_at 
            FROM student_evaluations 
            ORDER BY id DESC 
            LIMIT 5
        `);

        if (rows.length === 0) {
            console.log('No evaluations found.');
        } else {
            console.log('Found evaluations in student_evaluations table:');
            console.table(rows);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkEvaluations();
