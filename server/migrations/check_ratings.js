const { promisePool } = require('../config/db');

async function checkRatings() {
    try {
        const [ratings] = await promisePool.query("SELECT * FROM supervisor_evaluation_ratings WHERE evaluation_id = 15");
        console.log(ratings);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkRatings();
