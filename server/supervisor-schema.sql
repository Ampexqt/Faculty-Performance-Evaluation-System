-- ============================================================
-- 16. SUPERVISOR EVALUATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS supervisor_evaluations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  evaluator_id INT NOT NULL,
  evaluatee_id INT NOT NULL,
  evaluation_period_id INT NOT NULL,
  score_commitment DECIMAL(5,2),
  score_knowledge DECIMAL(5,2),
  score_teaching DECIMAL(5,2),
  score_management DECIMAL(5,2),
  total_score DECIMAL(5,2),
  comments TEXT,
  evaluator_name VARCHAR(100),
  evaluator_position VARCHAR(100),
  evaluation_date DATE,
  status ENUM('pending', 'completed') DEFAULT 'pending',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (evaluatee_id) REFERENCES faculty(id) ON DELETE CASCADE,
  FOREIGN KEY (evaluation_period_id) REFERENCES evaluation_periods(id) ON DELETE CASCADE
);

-- ============================================================
-- 17. SUPERVISOR EVALUATION RATINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS supervisor_evaluation_ratings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  evaluation_id INT NOT NULL,
  category VARCHAR(50),
  criterion_index INT,
  rating INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evaluation_id) REFERENCES supervisor_evaluations(id) ON DELETE CASCADE
);
