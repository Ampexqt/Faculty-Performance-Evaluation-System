const { promisePool } = require('../config/db');

async function createEvaluatorAccountsTable() {
    try {
        console.log('Creating evaluator_accounts table...');

        const query = `
            CREATE TABLE IF NOT EXISTS evaluator_accounts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                position VARCHAR(50) NOT NULL, -- 'VPAA', 'President', etc.
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await promisePool.query(query);
        console.log('✅ evaluator_accounts table created successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating table:', error);
        process.exit(1);
    }
}

createEvaluatorAccountsTable();
