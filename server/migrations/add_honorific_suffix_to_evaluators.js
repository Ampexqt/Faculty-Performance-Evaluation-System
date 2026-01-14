const { promisePool } = require('../config/db');

async function addHonorificAndSuffixToEvaluators() {
    try {
        console.log('Adding "honorific" and "suffix" columns to evaluator_accounts table...');

        const query = `
            ALTER TABLE evaluator_accounts 
            ADD COLUMN honorific VARCHAR(50) DEFAULT NULL AFTER full_name,
            ADD COLUMN suffix VARCHAR(50) DEFAULT NULL AFTER honorific;
        `;

        await promisePool.query(query);
        console.log('✅ Columns added successfully to evaluator_accounts table');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding columns:', error);
        process.exit(1);
    }
}

addHonorificAndSuffixToEvaluators();
