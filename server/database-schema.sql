-- ============================================================
-- FACULTY PERFORMANCE EVALUATION SYSTEM - COMPLETE DATABASE SCHEMA
-- ============================================================
-- Run this in phpMyAdmin (http://localhost/phpmyadmin)

-- Create database
CREATE DATABASE IF NOT EXISTS faculty_evaluation;
USE faculty_evaluation;

-- ============================================================
-- 1. ADMIN TABLE (Zonal Admin)
-- ============================================================

CREATE TABLE IF NOT EXISTS admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  zone VARCHAR(100),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default Zonal Admin (Password: admin123 - hashed with bcrypt)
INSERT INTO admins (username, email, password, full_name, zone, status) VALUES
('admin', 'admin@faculty.edu', '$2b$10$ZK17CRCqw0fr/9.jC9dj8ObZE7z5zd4xUhhKUIFJRMgSsLr5uHKju', 'Zonal Administrator', 'Zone 1', 'active');

-- ============================================================
-- 2. COLLEGES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS colleges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  college_code VARCHAR(20) UNIQUE NOT NULL,
  college_name VARCHAR(200) NOT NULL,
  dean_id INT,
  faculty_count INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample colleges
INSERT INTO colleges (college_code, college_name, dean_id, faculty_count, status) VALUES
('COE', 'College of Engineering', NULL, 45, 'active'),
('CAS', 'College of Arts and Sciences', NULL, 62, 'active'),
('CBA', 'College of Business Administration', NULL, 38, 'active'),
('CED', 'College of Education', NULL, 51, 'active'),
('CICT', 'College of Information and Communications Technology', NULL, 29, 'active'),
('CAF', 'College of Agriculture and Forestry', NULL, 34, 'active'),
('CHSE', 'College of Health Sciences and Education', NULL, 42, 'active'),
('CCJE', 'College of Criminal Justice Education', NULL, 27, 'active');

-- ============================================================
-- 3. DEPARTMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  college_id INT NOT NULL,
  department_code VARCHAR(20) UNIQUE NOT NULL,
  department_name VARCHAR(200) NOT NULL,
  chair_id INT,
  faculty_count INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
);

-- Sample departments
INSERT INTO departments (college_id, department_code, department_name, chair_id, faculty_count, status) VALUES
(1, 'CE', 'Civil Engineering', NULL, 12, 'active'),
(1, 'ME', 'Mechanical Engineering', NULL, 10, 'active'),
(1, 'EE', 'Electrical Engineering', NULL, 11, 'active'),
(1, 'ECE', 'Electronics and Communications Engineering', NULL, 12, 'active'),
(2, 'MATH', 'Mathematics', NULL, 15, 'active'),
(2, 'PHYS', 'Physics', NULL, 12, 'active'),
(2, 'CHEM', 'Chemistry', NULL, 14, 'active'),
(2, 'BIO', 'Biology', NULL, 21, 'active'),
(3, 'ACCT', 'Accountancy', NULL, 18, 'active'),
(3, 'MKTG', 'Marketing', NULL, 12, 'active'),
(3, 'MGMT', 'Management', NULL, 8, 'active');

-- ============================================================
-- 4. QCE ACCOUNTS TABLE (Quality Control and Evaluation)
-- ============================================================

CREATE TABLE IF NOT EXISTS qce_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  position VARCHAR(100),
  college_id INT,
  department_id INT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE SET NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ============================================================
-- 5. FACULTY TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS faculty (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  last_name VARCHAR(50) NOT NULL,
  gender ENUM('Male', 'Female'),
  department_id INT,
  college_id INT,
  position VARCHAR(100),
  employment_status ENUM('Regular', 'Part-time', 'Contractual') DEFAULT 'Regular',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE SET NULL
);

-- ============================================================
-- 6. STUDENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  last_name VARCHAR(50) NOT NULL,
  department_id INT,
  year_level INT,
  status ENUM('active', 'inactive', 'graduated') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ============================================================
-- 7. ACADEMIC YEARS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS academic_years (
  id INT PRIMARY KEY AUTO_INCREMENT,
  year_code VARCHAR(20) UNIQUE NOT NULL,
  year_label VARCHAR(50) NOT NULL,
  semester ENUM('1st Semester', '2nd Semester', 'Summer') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample academic years
INSERT INTO academic_years (year_code, year_label, semester, start_date, end_date, is_current, status) VALUES
('2024-2025-1', '2024-2025', '1st Semester', '2024-08-01', '2024-12-31', TRUE, 'active'),
('2024-2025-2', '2024-2025', '2nd Semester', '2025-01-01', '2025-05-31', FALSE, 'active'),
('2023-2024-1', '2023-2024', '1st Semester', '2023-08-01', '2023-12-31', FALSE, 'completed'),
('2023-2024-2', '2023-2024', '2nd Semester', '2024-01-01', '2024-05-31', FALSE, 'completed');

-- ============================================================
-- 8. SUBJECTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subject_code VARCHAR(20) UNIQUE NOT NULL,
  subject_name VARCHAR(200) NOT NULL,
  department_id INT,
  units INT DEFAULT 3,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ============================================================
-- 9. FACULTY ASSIGNMENTS TABLE (Faculty-Subject-Class)
-- ============================================================

CREATE TABLE IF NOT EXISTS faculty_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  faculty_id INT NOT NULL,
  subject_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  section VARCHAR(50),
  schedule VARCHAR(200),
  room VARCHAR(50),
  student_count INT DEFAULT 0,
  status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

-- ============================================================
-- 10. EVALUATION PERIODS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS evaluation_periods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  academic_year_id INT NOT NULL,
  period_name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  status ENUM('upcoming', 'active', 'closed') DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

-- Sample evaluation period
INSERT INTO evaluation_periods (academic_year_id, period_name, start_date, end_date, is_active, status) VALUES
(1, 'Midterm Evaluation 2024-2025 1st Sem', '2024-10-01', '2024-10-31', TRUE, 'active');

-- ============================================================
-- 11. EVALUATION CRITERIA TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS evaluation_criteria (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category VARCHAR(100) NOT NULL,
  criterion_text TEXT NOT NULL,
  weight DECIMAL(5,2) DEFAULT 1.00,
  order_num INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample criteria
INSERT INTO evaluation_criteria (category, criterion_text, weight, order_num, status) VALUES
('Teaching Effectiveness', 'Demonstrates mastery of the subject matter', 1.00, 1, 'active'),
('Teaching Effectiveness', 'Explains concepts clearly and effectively', 1.00, 2, 'active'),
('Teaching Effectiveness', 'Uses appropriate teaching methods and strategies', 1.00, 3, 'active'),
('Teaching Effectiveness', 'Provides relevant examples and applications', 1.00, 4, 'active'),
('Classroom Management', 'Maintains discipline and order in the classroom', 1.00, 5, 'active'),
('Classroom Management', 'Starts and ends classes on time', 1.00, 6, 'active'),
('Classroom Management', 'Creates a conducive learning environment', 1.00, 7, 'active'),
('Student Engagement', 'Encourages student participation and interaction', 1.00, 8, 'active'),
('Student Engagement', 'Responds to student questions and concerns', 1.00, 9, 'active'),
('Assessment', 'Provides fair and timely assessment of student work', 1.00, 10, 'active');

-- ============================================================
-- 12. STUDENT EVALUATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS student_evaluations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  faculty_assignment_id INT NOT NULL,
  evaluation_period_id INT NOT NULL,
  status ENUM('pending', 'completed') DEFAULT 'pending',
  submitted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (faculty_assignment_id) REFERENCES faculty_assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (evaluation_period_id) REFERENCES evaluation_periods(id) ON DELETE CASCADE,
  UNIQUE KEY unique_evaluation (student_id, faculty_assignment_id, evaluation_period_id)
);

-- ============================================================
-- 13. EVALUATION RESPONSES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS evaluation_responses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  evaluation_id INT NOT NULL,
  criterion_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evaluation_id) REFERENCES student_evaluations(id) ON DELETE CASCADE,
  FOREIGN KEY (criterion_id) REFERENCES evaluation_criteria(id) ON DELETE CASCADE
);

-- ============================================================
-- 14. EVALUATION COMMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS evaluation_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  evaluation_id INT NOT NULL,
  comment_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evaluation_id) REFERENCES student_evaluations(id) ON DELETE CASCADE
);

-- ============================================================
-- 15. EVALUATION RESULTS TABLE (Aggregated Results)
-- ============================================================

CREATE TABLE IF NOT EXISTS evaluation_results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  faculty_assignment_id INT NOT NULL,
  evaluation_period_id INT NOT NULL,
  total_evaluations INT DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  rating_breakdown JSON,
  status ENUM('pending', 'completed', 'published') DEFAULT 'pending',
  generated_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_assignment_id) REFERENCES faculty_assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (evaluation_period_id) REFERENCES evaluation_periods(id) ON DELETE CASCADE,
  UNIQUE KEY unique_result (faculty_assignment_id, evaluation_period_id)
);

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Show all tables
SHOW TABLES;

-- Show table structures
DESCRIBE admins;
DESCRIBE colleges;
DESCRIBE departments;
DESCRIBE qce_accounts;
DESCRIBE faculty;
DESCRIBE students;
DESCRIBE academic_years;
DESCRIBE subjects;
DESCRIBE faculty_assignments;
DESCRIBE evaluation_periods;
DESCRIBE evaluation_criteria;
DESCRIBE student_evaluations;
DESCRIBE evaluation_responses;
DESCRIBE evaluation_comments;
DESCRIBE evaluation_results;

-- Show sample data
SELECT * FROM admins;
SELECT * FROM colleges;
SELECT * FROM academic_years;
SELECT * FROM evaluation_criteria;
