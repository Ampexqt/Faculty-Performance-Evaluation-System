-- ============================================================
-- ALTER EXISTING student_evaluations TABLE
-- Add new columns for enhanced evaluation tracking
-- ============================================================

-- Add category score columns
ALTER TABLE student_evaluations 
ADD COLUMN IF NOT EXISTS score_commitment INT NOT NULL DEFAULT 0 COMMENT 'Total score for Category A: Commitment',
ADD COLUMN IF NOT EXISTS score_knowledge INT NOT NULL DEFAULT 0 COMMENT 'Total score for Category B: Knowledge of Subject',
ADD COLUMN IF NOT EXISTS score_teaching INT NOT NULL DEFAULT 0 COMMENT 'Total score for Category C: Teaching for Independent Learning',
ADD COLUMN IF NOT EXISTS score_management INT NOT NULL DEFAULT 0 COMMENT 'Total score for Category D: Management of Learning',
ADD COLUMN IF NOT EXISTS total_score INT NOT NULL DEFAULT 0 COMMENT 'Sum of all category scores',
ADD COLUMN IF NOT EXISTS comments TEXT COMMENT 'Additional feedback from student',
ADD COLUMN IF NOT EXISTS evaluator_name VARCHAR(255) COMMENT 'Name of the student evaluator',
ADD COLUMN IF NOT EXISTS evaluator_position VARCHAR(100) DEFAULT 'Student' COMMENT 'Position of evaluator',
ADD COLUMN IF NOT EXISTS evaluation_date DATE COMMENT 'Date when evaluation was submitted';

-- ============================================================
-- CREATE evaluation_ratings_detail TABLE
-- Stores individual ratings for each criterion
-- ============================================================

CREATE TABLE IF NOT EXISTS evaluation_ratings_detail (
  id INT PRIMARY KEY AUTO_INCREMENT,
  evaluation_id INT NOT NULL,
  category VARCHAR(50) NOT NULL COMMENT 'A, B, C, or D',
  criterion_index INT NOT NULL COMMENT 'Index of criterion within category (0-4)',
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5) COMMENT 'Rating value 1-5',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (evaluation_id) REFERENCES student_evaluations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_rating (evaluation_id, category, criterion_index)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_student_evaluations_faculty ON student_evaluations(faculty_assignment_id);
CREATE INDEX IF NOT EXISTS idx_student_evaluations_student ON student_evaluations(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_ratings_eval ON evaluation_ratings_detail(evaluation_id);
