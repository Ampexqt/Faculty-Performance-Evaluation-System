const { promisePool } = require('./config/db');

async function setupPrograms() {
    try {
        console.log('Creating programs table...');
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS programs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                program_code VARCHAR(50) NOT NULL,
                program_name VARCHAR(100) NOT NULL,
                college_id INT NOT NULL,
                chairperson_id INT,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX (college_id),
                INDEX (chairperson_id)
            )
        `);
        console.log('Programs table created.');

        console.log('Migrating data from departments to programs...');
        const [departments] = await promisePool.query('SELECT * FROM departments');

        let migratedCount = 0;
        for (const dept of departments) {
            // Check if exists
            const [existing] = await promisePool.query('SELECT id FROM programs WHERE program_code = ? AND college_id = ?', [dept.department_code, dept.college_id]);
            if (existing.length === 0) {
                await promisePool.query(`
                    INSERT INTO programs (program_code, program_name, college_id, chairperson_id, status)
                    VALUES (?, ?, ?, ?, ?)
                `, [dept.department_code, dept.department_name, dept.college_id, dept.chair_id, dept.status || 'active']);
                migratedCount++;
            }
        }
        console.log(`Migrated ${migratedCount} programs.`);

    } catch (error) {
        console.error('Error setting up programs:', error);
    }
    process.exit();
}

setupPrograms();
