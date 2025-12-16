const mysql = require('mysql2/promise');

async function runMigration() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'faculty_evaluation'
    });

    try {
        console.log('Connected to database');
        console.log('Running migration to enhance student_evaluations table...\n');

        // Check and add columns one by one
        const columnsToAdd = [
            { name: 'score_commitment', type: 'INT NOT NULL DEFAULT 0 COMMENT "Total score for Category A: Commitment"' },
            { name: 'score_knowledge', type: 'INT NOT NULL DEFAULT 0 COMMENT "Total score for Category B: Knowledge of Subject"' },
            { name: 'score_teaching', type: 'INT NOT NULL DEFAULT 0 COMMENT "Total score for Category C: Teaching for Independent Learning"' },
            { name: 'score_management', type: 'INT NOT NULL DEFAULT 0 COMMENT "Total score for Category D: Management of Learning"' },
            { name: 'total_score', type: 'INT NOT NULL DEFAULT 0 COMMENT "Sum of all category scores"' },
            { name: 'comments', type: 'TEXT COMMENT "Additional feedback from student"' },
            { name: 'evaluator_name', type: 'VARCHAR(255) COMMENT "Name of the student evaluator"' },
            { name: 'evaluator_position', type: 'VARCHAR(100) DEFAULT "Student" COMMENT "Position of evaluator"' },
            { name: 'evaluation_date', type: 'DATE COMMENT "Date when evaluation was submitted"' }
        ];

        for (const column of columnsToAdd) {
            try {
                // Check if column exists
                const [columns] = await connection.query(
                    `SHOW COLUMNS FROM student_evaluations LIKE '${column.name}'`
                );

                if (columns.length === 0) {
                    // Column doesn't exist, add it
                    await connection.query(
                        `ALTER TABLE student_evaluations ADD COLUMN ${column.name} ${column.type}`
                    );
                    console.log(`✅ Added column: ${column.name}`);
                } else {
                    console.log(`⏭️  Column already exists: ${column.name}`);
                }
            } catch (error) {
                console.error(`❌ Error adding column ${column.name}:`, error.message);
            }
        }

        // Create evaluation_ratings_detail table
        try {
            await connection.query(`
                CREATE TABLE IF NOT EXISTS evaluation_ratings_detail (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    evaluation_id INT NOT NULL,
                    category VARCHAR(50) NOT NULL COMMENT 'A, B, C, or D',
                    criterion_index INT NOT NULL COMMENT 'Index of criterion within category (0-4)',
                    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5) COMMENT 'Rating value 1-5',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    
                    FOREIGN KEY (evaluation_id) REFERENCES student_evaluations(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_rating (evaluation_id, category, criterion_index)
                )
            `);
            console.log('✅ Created table: evaluation_ratings_detail');
        } catch (error) {
            if (error.code === 'ER_TABLE_EXISTS_ERROR') {
                console.log('⏭️  Table already exists: evaluation_ratings_detail');
            } else {
                console.error('❌ Error creating table:', error.message);
            }
        }

        // Create indexes
        const indexes = [
            { table: 'student_evaluations', name: 'idx_student_evaluations_faculty', column: 'faculty_assignment_id' },
            { table: 'student_evaluations', name: 'idx_student_evaluations_student', column: 'student_id' },
            { table: 'evaluation_ratings_detail', name: 'idx_evaluation_ratings_eval', column: 'evaluation_id' }
        ];

        for (const index of indexes) {
            try {
                await connection.query(
                    `CREATE INDEX ${index.name} ON ${index.table}(${index.column})`
                );
                console.log(`✅ Created index: ${index.name}`);
            } catch (error) {
                if (error.code === 'ER_DUP_KEYNAME') {
                    console.log(`⏭️  Index already exists: ${index.name}`);
                } else {
                    console.error(`❌ Error creating index ${index.name}:`, error.message);
                }
            }
        }

        console.log('\n✅ Migration completed successfully!');
        console.log('\nYou can now submit evaluations with full details!');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await connection.end();
    }
}

runMigration();
