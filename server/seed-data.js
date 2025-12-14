const bcrypt = require('bcryptjs');
const { promisePool } = require('./config/db');

async function seed() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const deptId = 12; // BSIT
        const collegeId = 9; // CCS

        // 1. Insert Faculty
        console.log('Seeding Faculty...');
        const facultyData = [
            ['alan.turing@university.edu', 'Alan', 'Turing', 'Male', 'Professor', 'Regular', deptId, collegeId, hashedPassword],
            ['ada.lovelace@university.edu', 'Ada', 'Lovelace', 'Female', 'Associate Professor', 'Regular', deptId, collegeId, hashedPassword],
            ['grace.hopper@university.edu', 'Grace', 'Hopper', 'Female', 'Assistant Professor', 'Part-time', deptId, collegeId, hashedPassword]
        ];

        for (const f of facultyData) {
            const [exists] = await promisePool.query('SELECT id FROM faculty WHERE email = ?', [f[0]]);
            if (exists.length === 0) {
                const empId = 'EMP' + Math.floor(1000 + Math.random() * 9000);
                await promisePool.query(
                    'INSERT INTO faculty (email, first_name, last_name, gender, position, employment_status, department_id, college_id, password, employee_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [...f, empId]
                );
                console.log(`Inserted faculty: ${f[1]} ${f[2]}`);
            } else {
                console.log(`Faculty already exists: ${f[1]} ${f[2]}`);
            }
        }

        // 2. Insert Subjects
        console.log('Seeding Subjects...');
        const subjectsData = [
            ['CS101', 'Introduction to Computing', 3],
            ['CS102', 'Computer Programming 1', 3],
            ['CS103', 'Discrete Structures', 3]
        ];

        for (const s of subjectsData) {
            const [exists] = await promisePool.query('SELECT id FROM subjects WHERE subject_code = ?', [s[0]]);
            if (exists.length === 0) {
                await promisePool.query(
                    'INSERT INTO subjects (subject_code, subject_name, units, department_id, status) VALUES (?, ?, ?, ?, ?)',
                    [...s, deptId, 'active']
                );
                console.log(`Inserted subject: ${s[0]}`);
            } else {
                console.log(`Subject already exists: ${s[0]}`);
            }
        }

        // 3. Assign Subjects (Schedules)
        console.log('Seeding Assignments...');

        // Fetch valid IDs
        const [facs] = await promisePool.query('SELECT id, email FROM faculty');
        const [subs] = await promisePool.query('SELECT id, subject_code FROM subjects');

        // Find academic year
        let ayId = 1;
        const [ay] = await promisePool.query('SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1');
        if (ay.length > 0) {
            ayId = ay[0].id;
        } else {
            console.log('No current academic year found, checking any.');
            const [anyAy] = await promisePool.query('SELECT id FROM academic_years LIMIT 1');
            if (anyAy.length > 0) ayId = anyAy[0].id;
        }

        if (facs.length > 0 && subs.length > 0 && ayId) {
            const assignments = [
                { email: 'alan.turing@university.edu', code: 'CS101', section: 'BSIT 1-A' },
                { email: 'alan.turing@university.edu', code: 'CS101', section: 'BSIT 1-B' },
                { email: 'ada.lovelace@university.edu', code: 'CS102', section: 'BSIT 1-A' }
            ];

            for (const assign of assignments) {
                const f = facs.find(user => user.email === assign.email);
                const s = subs.find(subj => subj.subject_code === assign.code);

                if (f && s) {
                    // Check duplicate
                    const [dup] = await promisePool.query(
                        'SELECT id FROM faculty_assignments WHERE faculty_id = ? AND subject_id = ? AND section = ? AND academic_year_id = ?',
                        [f.id, s.id, assign.section, ayId]
                    );

                    if (dup.length === 0) {
                        await promisePool.query(
                            'INSERT INTO faculty_assignments (faculty_id, subject_id, academic_year_id, section, status) VALUES (?, ?, ?, ?, ?)',
                            [f.id, s.id, ayId, assign.section, 'active']
                        );
                        console.log(`Assigned ${assign.code} to ${assign.email} (${assign.section})`);
                    } else {
                        console.log(`Assignment exists: ${assign.code} -> ${assign.email}`);
                    }
                }
            }
        }

        console.log('Seeding Complete!');

    } catch (error) {
        console.error('Error seeding:', error);
    }
    process.exit();
}

seed();
