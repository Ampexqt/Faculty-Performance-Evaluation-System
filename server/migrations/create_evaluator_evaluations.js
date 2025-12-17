const { promisePool } = require('../config/db');

async function createEvaluatorTables() {
    try {
        console.log('Creating evaluator evaluation tables...');

        // Table for President to evaluate VPAA
        const presidentEvaluationsQuery = `
            CREATE TABLE IF NOT EXISTS president_evaluations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                president_id INT NOT NULL,
                vpaa_id INT NOT NULL,
                academic_year_id INT NOT NULL,
                semester ENUM('1st', '2nd') NOT NULL,
                rating DECIMAL(3,2) DEFAULT NULL,
                comments TEXT,
                status ENUM('pending', 'completed') DEFAULT 'pending',
                evaluated_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_evaluation (president_id, vpaa_id, academic_year_id, semester)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        // Table for VPAA evaluation codes for Deans
        const vpaaCodesQuery = `
            CREATE TABLE IF NOT EXISTS vpaa_evaluation_codes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vpaa_id INT NOT NULL,
                dean_id INT NOT NULL,
                code VARCHAR(10) NOT NULL UNIQUE,
                academic_year_id INT NOT NULL,
                semester ENUM('1st', '2nd') NOT NULL,
                status ENUM('active', 'used', 'expired') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        // Table for VPAA to evaluate Deans
        const vpaaEvaluationsQuery = `
            CREATE TABLE IF NOT EXISTS vpaa_evaluations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vpaa_id INT NOT NULL,
                dean_id INT NOT NULL,
                code_id INT NOT NULL,
                academic_year_id INT NOT NULL,
                semester ENUM('1st', '2nd') NOT NULL,
                rating DECIMAL(3,2) DEFAULT NULL,
                comments TEXT,
                status ENUM('pending', 'completed') DEFAULT 'pending',
                evaluated_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_evaluation (vpaa_id, dean_id, academic_year_id, semester)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await promisePool.query(presidentEvaluationsQuery);
        console.log('✅ president_evaluations table created');

        await promisePool.query(vpaaCodesQuery);
        console.log('✅ vpaa_evaluation_codes table created');

        await promisePool.query(vpaaEvaluationsQuery);
        console.log('✅ vpaa_evaluations table created');

        console.log('✅ All evaluator tables created successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating tables:', error);
        process.exit(1);
    }
}

createEvaluatorTables();
