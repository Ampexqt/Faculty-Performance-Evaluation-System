const { promisePool } = require('../config/db');

async function addSexToEvaluators() {
    try {
        console.log('Adding "sex" column to evaluator_accounts table...');

        const query = `
            ALTER TABLE evaluator_accounts 
            ADD COLUMN sex ENUM('Male', 'Female') NOT NULL AFTER full_name;
        `;

        await promisePool.query(query);
        console.log('✅ "sex" column added successfully');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️ "sex" column already exists');
            process.exit(0);
        }
        console.error('❌ Error adding column:', error);
        process.exit(1);
    }
}

addSexToEvaluators();
