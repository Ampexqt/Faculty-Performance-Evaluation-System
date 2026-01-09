const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'faculty_evaluation_db',
};

async function updateTable() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Check if column exists
        const [columns] = await connection.query(`
            SHOW COLUMNS FROM supervisor_evaluation_codes LIKE 'evaluator_type'
        `);

        if (columns.length === 0) {
            console.log('Adding evaluator_type column...');
            await connection.query(`
                ALTER TABLE supervisor_evaluation_codes
                ADD COLUMN evaluator_type VARCHAR(20) DEFAULT 'Dean' AFTER evaluation_period_id
            `);
            console.log('Column added successfully.');
        } else {
            console.log('Column evaluator_type already exists.');
        }

        connection.end();
    } catch (error) {
        console.error('Error updating table:', error);
    }
}

updateTable();
