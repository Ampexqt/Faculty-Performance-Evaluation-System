-- Run this script in phpMyAdmin to update QCE accounts schema
USE faculty_evaluation;

-- Add department_id column to qce_accounts table
ALTER TABLE qce_accounts
ADD COLUMN department_id INT AFTER college_id,
ADD CONSTRAINT fk_qce_department 
FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;
