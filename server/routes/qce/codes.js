const express = require('express');
const router = express.Router();
const { promisePool } = require('../../config/db');

// Initialize Supervisor Codes Table
const initializeTables = async () => {
    try {
        const connection = await promisePool.getConnection();

        await connection.query(`
            CREATE TABLE IF NOT EXISTS supervisor_evaluation_codes (
                id INT PRIMARY KEY AUTO_INCREMENT,
                code VARCHAR(20) UNIQUE NOT NULL,
                evaluatee_id INT NOT NULL,
                evaluation_period_id INT,
                status ENUM('active', 'used', 'expired') DEFAULT 'active',
                created_by INT NOT NULL, 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NULL,
                FOREIGN KEY (evaluatee_id) REFERENCES faculty(id) ON DELETE CASCADE
            )
        `);

        connection.release();
        console.log('Supervisor evaluation codes table initialized');
    } catch (error) {
        console.error('Error initializing supervisor code table:', error);
    }
};

initializeTables();

/**
 * POST /api/qce/code/generate-supervisor
 * Generate a unique code for a Dean to evaluate a Faculty member
 */
router.post('/generate-supervisor', async (req, res) => {
    try {
        const { evaluateeId, creatorId } = req.body;

        if (!evaluateeId || !creatorId) {
            return res.status(400).json({
                success: false,
                message: 'Evaluatee ID and Creator ID are required'
            });
        }

        // Generate a random 6-char code (e.g., SUP-X7A-9P2)
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars
        let randomPart = '';
        for (let i = 0; i < 6; i++) {
            randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const code = `SUP-${randomPart.substring(0, 3)}-${randomPart.substring(3)}`;

        // Get active evaluation period
        const [periods] = await promisePool.query(
            'SELECT id FROM evaluation_periods WHERE status = "active" ORDER BY id DESC LIMIT 1'
        );

        let periodId = null;
        if (periods.length > 0) {
            periodId = periods[0].id;
        }

        // Insert code
        await promisePool.query(
            `INSERT INTO supervisor_evaluation_codes 
            (code, evaluatee_id, evaluation_period_id, created_by, status) 
            VALUES (?, ?, ?, ?, 'active')`,
            [code, evaluateeId, periodId, creatorId]
        );

        res.json({
            success: true,
            message: 'Supervisor evaluation code generated',
            data: {
                code
            }
        });

    } catch (error) {
        console.error('Error generating supervisor code:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate code',
            error: error.message
        });
    }
});

/**
 * GET /api/qce/code/supervisor/active/:evaluateeId
 * Get active supervisor code for a faculty member
 */
router.get('/supervisor/active/:evaluateeId', async (req, res) => {
    try {
        const { evaluateeId } = req.params;

        const [rows] = await promisePool.query(
            `SELECT code, created_at FROM supervisor_evaluation_codes 
             WHERE evaluatee_id = ? AND status = 'active' 
             ORDER BY created_at DESC LIMIT 1`,
            [evaluateeId]
        );

        if (rows.length > 0) {
            res.json({
                success: true,
                data: rows[0]
            });
        } else {
            res.json({
                success: false,
                message: 'No active code found'
            });
        }

    } catch (error) {
        console.error('Error fetching active supervisor code:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching code'
        });
    }
});

module.exports = router;
