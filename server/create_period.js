const mysql = require('mysql2/promise');

async function createPeriod() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'faculty_evaluation'
    });

    try {
        console.log('Creating default active evaluation period...\n');

        // Get academic year first
        const [years] = await connection.query('SELECT id FROM academic_years WHERE status = "active" LIMIT 1');
        const academicYearId = years.length > 0 ? years[0].id : 1; // Default to 1 if no active year

        await connection.query(`
            INSERT INTO evaluation_periods 
            (academic_year_id, period_name, start_date, end_date, status, is_active) 
            VALUES (?, 'Default Evaluation Period', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active', 1)
        `, [academicYearId]);

        console.log('✅ Created active evaluation period!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

createPeriod();
