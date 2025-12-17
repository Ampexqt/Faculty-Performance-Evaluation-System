const mysql = require('mysql2/promise');

async function checkPeriod() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'faculty_evaluation'
    });

    try {
        console.log('Checking active evaluation period...\n');
        const [periods] = await connection.query(
            'SELECT * FROM evaluation_periods WHERE status = "active"'
        );
        console.table(periods);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkPeriod();
