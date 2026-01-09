const { promisePool } = require('./config/db');

async function fixData() {
    try {
        console.log('Fixing data...');

        // 1. Create Department for College 14 if not exists
        const [existingDept] = await promisePool.query("SELECT id FROM departments WHERE college_id = 14 AND department_code = 'DIT'");

        let deptId;
        if (existingDept.length > 0) {
            deptId = existingDept[0].id;
            console.log('Department DIT already exists with ID:', deptId);
        } else {
            const [result] = await promisePool.query(
                "INSERT INTO departments (college_id, department_code, department_name, status) VALUES (14, 'DIT', 'Department of Information Technology', 'active')"
            );
            deptId = result.insertId;
            console.log('Created Department DIT with ID:', deptId);
        }

        // 2. Update Jene Pastor (ID 23)
        await promisePool.query("UPDATE faculty SET department_id = ? WHERE id = 23", [deptId]);
        console.log('Updated Jene Pastor to belong to Department ID:', deptId);

        // 3. Check Egy Gelon (ID 27) - College 15
        // If college 15 doesn't exist, create it? Or move him to 14?
        // Let's check if college 15 exists.
        const [col15] = await promisePool.query("SELECT id FROM colleges WHERE id = 15");
        if (col15.length === 0) {
            console.log('College 15 does not exist. Creating generic college for Egy Gelon.');
            const [newCol] = await promisePool.query("INSERT INTO colleges (college_code, college_name, status) VALUES ('CET', 'College of Engineering and Technology', 'active')");
            // Update Egy to this new college
            const newColId = newCol.insertId;
            await promisePool.query("UPDATE faculty SET college_id = ? WHERE id = 27", [newColId]);
            console.log('Moved Egy Gelon to new College ID:', newColId);

            // Create Dept for this new college
            const [newDept] = await promisePool.query("INSERT INTO departments (college_id, department_code, department_name, status) VALUES (?, 'DET', 'Department of Engineering Technology', 'active')", [newColId]);
            await promisePool.query("UPDATE faculty SET department_id = ? WHERE id = 27", [newDept.insertId]);
            console.log('Created Department DET and assigned Egy Gelon.');
        } else {
            // College 15 exists, create department
            const [exDept15] = await promisePool.query("SELECT id FROM departments WHERE college_id = 15 LIMIT 1");
            let dept15Id;
            if (exDept15.length > 0) {
                dept15Id = exDept15[0].id;
            } else {
                const [res15] = await promisePool.query("INSERT INTO departments (college_id, department_code, department_name, status) VALUES (15, 'GEN', 'General Department', 'active')");
                dept15Id = res15.insertId;
                console.log('Created General Department for College 15');
            }
            await promisePool.query("UPDATE faculty SET department_id = ? WHERE id = 27", [dept15Id]);
            console.log('Updated Egy Gelon to belong to Department ID:', dept15Id);
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

fixData();
