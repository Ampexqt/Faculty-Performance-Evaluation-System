const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection, promisePool } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
    res.json({
        message: 'Faculty Performance Evaluation System API',
        status: 'Server is running! 🚀',
        timestamp: new Date().toISOString()
    });
});

// Database connection test route
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await promisePool.query('SELECT 1 + 1 AS result');
        res.json({
            success: true,
            message: 'Database connection successful! ✅',
            testQuery: rows[0],
            database: process.env.DB_NAME
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed! ❌',
            error: error.message
        });
    }
});

// Sample API route - Get all tables in database
app.get('/api/tables', async (req, res) => {
    try {
        const [tables] = await promisePool.query('SHOW TABLES');
        res.json({
            success: true,
            message: 'Tables retrieved successfully',
            tables: tables
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tables',
            error: error.message
        });
    }
});

// ============================================================
// API ROUTES
// ============================================================

// Authentication routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Zonal Admin routes
const zonalCollegesRoutes = require('./routes/zonal/colleges');
const zonalDashboardRoutes = require('./routes/zonal/dashboard');
const zonalQCERoutes = require('./routes/zonal/qce');
const zonalAcademicYearsRoutes = require('./routes/zonal/academic-years');

app.use('/api/zonal/colleges', zonalCollegesRoutes);
app.use('/api/zonal/dashboard', zonalDashboardRoutes);
app.use('/api/zonal/qce', zonalQCERoutes);
app.use('/api/zonal/academic-years', zonalAcademicYearsRoutes);

// QCE Manager routes
const qceFacultyRoutes = require('./routes/qce/faculty');
const qceDepartmentsRoutes = require('./routes/qce/departments');
const qceProgramsRoutes = require('./routes/qce/programs'); // Treat programs as departments
const qceDashboardRoutes = require('./routes/qce/dashboard');
const qceSubjectsRoutes = require('./routes/qce/subjects');

app.use('/api/qce/faculty', qceFacultyRoutes);
app.use('/api/qce/departments', qceDepartmentsRoutes);
app.use('/api/qce/programs', qceProgramsRoutes);
app.use('/api/qce/stats', qceDashboardRoutes);
app.use('/api/qce/subjects', qceSubjectsRoutes);

// Faculty routes
const facultyDashboardRoutes = require('./routes/Faculty/dashboard');
const facultySubjectsRoutes = require('./routes/Faculty/subjects');

app.use('/api/faculty/dashboard', facultyDashboardRoutes);
app.use('/api/faculty/subjects', facultySubjectsRoutes);

// Student routes
const studentEvaluationsRoutes = require('./routes/Student/evaluations');
app.use('/api/student/evaluations', studentEvaluationsRoutes);

// Start server
const startServer = async () => {
    // Test database connection first
    const dbConnected = await testConnection();

    if (!dbConnected) {
        console.log('\n⚠️  Warning: Server starting without database connection');
        console.log('Please check your WAMP MySQL server and database configuration\n');
    }

    app.listen(PORT, () => {
        console.log('\n' + '='.repeat(50));
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
        console.log(`🧪 Test DB: http://localhost:${PORT}/api/test-db`);
        console.log('='.repeat(50) + '\n');
    });
};

startServer();
