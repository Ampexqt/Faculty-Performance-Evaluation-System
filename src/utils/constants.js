/**
 * Application Constants
 * Faculty Performance Evaluation System
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Routes
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',

    // Zonal Admin Routes
    ZONAL_DASHBOARD: '/zonal/dashboard',
    ZONAL_COLLEGES: '/zonal/colleges',
    ZONAL_QCE: '/zonal/qce-management',
    ZONAL_ACADEMIC_YEARS: '/zonal/academic-years',
    ZONAL_PROGRAMS: '/zonal/programs',
    ZONAL_SETTINGS: '/zonal/settings',

    // QCE Manager Routes
    QCE_DASHBOARD: '/qce/dashboard',
    QCE_FACULTY: '/qce/faculty',
    QCE_PROGRAMS: '/qce/programs',
    QCE_EVALUATIONS: '/qce/evaluations',

    // Common Routes
    PROFILE: '/profile',
    SETTINGS: '/settings',
    NOT_FOUND: '/404',
};

// User Roles
export const USER_ROLES = {
    ZONAL_ADMIN: 'Zonal Admin',
    QCE_MANAGER: 'QCE Manager',
    FACULTY: 'Faculty',
    STUDENT: 'Student',
    SUPERVISOR: 'Supervisor',
};

// Evaluation Status
export const EVALUATION_STATUS = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
};

// College Status
export const COLLEGE_STATUS = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
};

// Breakpoints
export const BREAKPOINTS = {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280,
};

// Pagination
export const ITEMS_PER_PAGE = 10;

// Date Formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const DISPLAY_DATE_FORMAT = 'MMM DD, YYYY';
