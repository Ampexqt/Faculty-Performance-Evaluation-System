-- Add department_id to qce_accounts table
ALTER TABLE qce_accounts 
ADD COLUMN department_id INT AFTER college_id,
ADD FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- Update existing QCE account (Kyle Dela Cruz) with a department
-- Assuming Computer Science department exists in CICS
UPDATE qce_accounts 
SET department_id = (
    SELECT id FROM departments 
    WHERE department_name LIKE '%Computer Science%' 
    OR department_code = 'CS'
    LIMIT 1
)
WHERE email = 'kyle@gmail.com';
