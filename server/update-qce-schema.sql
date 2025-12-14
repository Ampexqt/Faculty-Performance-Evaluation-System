-- Run this script in phpMyAdmin to update your database schema
USE faculty_evaluation;

-- Add college_id column to qce_accounts table
ALTER TABLE qce_accounts
ADD COLUMN college_id INT AFTER position,
ADD CONSTRAINT fk_qce_college 
FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE SET NULL;
