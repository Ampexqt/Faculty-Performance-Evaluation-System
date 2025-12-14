ALTER TABLE students
ADD COLUMN sex VARCHAR(20) AFTER last_name,
ADD COLUMN program_id INT AFTER department_id,
ADD COLUMN section VARCHAR(20) AFTER year_level;

-- Make department_id nullable if it wasn't, or just ensure it's there. It's already there.
-- Add foreign key for program_id if programs table exists
-- ALTER TABLE students ADD CONSTRAINT fk_students_program FOREIGN KEY (program_id) REFERENCES programs(id);
