-- Add college_id to faculty table
ALTER TABLE faculty
ADD COLUMN college_id INT AFTER department_id,
ADD CONSTRAINT fk_faculty_college 
FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE SET NULL;
