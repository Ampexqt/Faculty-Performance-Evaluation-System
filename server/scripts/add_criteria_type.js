const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { promisePool } = require('../config/db');

const addCriteriaTypeColumn = async () => {
    try {
        console.log('Connected to database pool.');

        // Add to faculty_assignments
        try {
            await promisePool.query(`
                ALTER TABLE faculty_assignments 
                ADD COLUMN criteria_type ENUM('old', 'new') DEFAULT 'old'
            `);
            console.log('Added criteria_type to faculty_assignments');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('criteria_type column already exists in faculty_assignments');
            } else {
                console.error('Error altering faculty_assignments:', err.message);
            }
        }

        // Add to supervisor_evaluation_codes
        try {
            await promisePool.query(`
                ALTER TABLE supervisor_evaluation_codes 
                ADD COLUMN criteria_type ENUM('old', 'new') DEFAULT 'old'
            `);
            console.log('Added criteria_type to supervisor_evaluation_codes');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('criteria_type column already exists in supervisor_evaluation_codes');
            } else {
                console.error('Error altering supervisor_evaluation_codes:', err.message);
            }
        }

    } catch (error) {
        console.error('Database operation failed:', error);
    } finally {
        process.exit();
    }
};

addCriteriaTypeColumn();
