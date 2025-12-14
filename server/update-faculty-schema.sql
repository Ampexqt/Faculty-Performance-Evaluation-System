-- Run this script in phpMyAdmin to update your database schema
USE faculty_evaluation;

-- Add gender column to faculty table
ALTER TABLE faculty
ADD COLUMN gender ENUM('Male', 'Female') AFTER last_name;
