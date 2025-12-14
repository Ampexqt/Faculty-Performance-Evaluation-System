async function test() {
    try {
        // 1. Fetch current user (Dept Chair) to get college_id
        // Assuming user ID 5 based on previous context (Marco Pagotaisidro)
        const userId = 5;

        console.log('--- Fetching all faculty to find Dept Chair ---');
        const response1 = await fetch('http://localhost:5000/api/qce/faculty');
        const data1 = await response1.json();

        const deptChair = data1.data.find(f => f.lastName === 'Pagotaisidro');
        console.log('Dept Chair Found:', JSON.stringify(deptChair, null, 2));

        if (deptChair && deptChair.college_id) {
            console.log(`\n--- Fetching faculty for College ID: ${deptChair.college_id} ---`);
            const response2 = await fetch(`http://localhost:5000/api/qce/faculty?college_id=${deptChair.college_id}`);
            const data2 = await response2.json();
            console.log('Faculty in College:', data2.data.length);
            data2.data.forEach(f => console.log(`- ${f.name} (${f.role})`));
        } else {
            console.log('Could not find Dept Chair or College ID is missing');
        }

    } catch (error) {
        console.error(error);
    }
}

test();
