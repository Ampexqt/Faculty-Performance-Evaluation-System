const { promisePool } = require('./config/db');

async function fixFacultyData() {
    try {
        console.log('Fixing faculty data...');

        // 1. Assign Celz to Department 12 (BSIT) - Marco's Department
        // Assuming Celz matches by email or name.
        const [celz] = await promisePool.query("SELECT id FROM faculty WHERE email = 'celz@gmail.com'");
        if (celz.length > 0) {
            await promisePool.query("UPDATE faculty SET department_id = 12 WHERE id = ?", [celz[0].id]);
            console.log('Assigned Celz to Department 12.');
        } else {
            console.log('Celz not found (by email celz@gmail.com). Checking name...');
            await promisePool.query("UPDATE faculty SET department_id = 12 WHERE first_name = 'Celz' AND department_id IS NULL");
        }

        // 2. Cleanup seeded fake data
        const fakeEmails = [
            'alan.turing@university.edu',
            'ada.lovelace@university.edu',
            'grace.hopper@university.edu'
        ];

        await promisePool.query("DELETE FROM faculty WHERE email IN (?)", [fakeEmails]);
        console.log('Deleted fake faculty (Alan, Ada, Grace).');

        const fakeSubjects = ['CS101', 'CS102', 'CS103'];
        await promisePool.query("DELETE FROM subjects WHERE subject_code IN (?)", [fakeSubjects]);
        console.log('Deleted fake subjects (CS101, CS102, CS103).');

        console.log('Data fixed. Refresh your page.');

    } catch (error) {
        console.error('Error fixing data:', error);
    }
    process.exit();
}

fixFacultyData();
