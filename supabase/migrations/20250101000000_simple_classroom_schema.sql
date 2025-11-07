-- Simple Classroom Management System Schema
-- This matches the tables expected by the React components

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  teacher_id uuid NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create classroom_students table (junction table)
CREATE TABLE IF NOT EXISTS classroom_students (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id text NOT NULL, -- Using text for student_id as per the code
  joined_at timestamptz DEFAULT now(),
  UNIQUE(classroom_id, student_id)
);

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE,
  level text DEFAULT 'beginner',
  duration_seconds integer DEFAULT 60,
  created_at timestamptz DEFAULT now()
);

-- Create test_attempts table
CREATE TABLE IF NOT EXISTS test_attempts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id uuid REFERENCES tests(id) ON DELETE CASCADE,
  student_id text NOT NULL,
  status text DEFAULT 'in_progress',
  score integer DEFAULT 0,
  total integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  level text NOT NULL DEFAULT 'beginner',
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option text NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  created_at timestamptz DEFAULT now()
);

-- Create test_questions table (junction table for tests and questions)
CREATE TABLE IF NOT EXISTS test_questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id uuid REFERENCES tests(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  UNIQUE(test_id, question_id)
);

-- Create results table (for student dashboard)
CREATE TABLE IF NOT EXISTS results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,
  level text NOT NULL,
  score integer NOT NULL,
  total integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create users table (for Dashboard.jsx)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  role text NOT NULL DEFAULT 'student',
  created_at timestamptz DEFAULT now()
);

-- Create students table (for TeacherDashboard.jsx)
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Basic policies (you may want to customize these based on your auth setup)
CREATE POLICY "Allow all operations for authenticated users" ON classrooms FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON classroom_students FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON tests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON test_attempts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON questions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON test_questions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON results FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON students FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert some sample questions
INSERT INTO questions (level, question, option_a, option_b, option_c, option_d, correct_option) VALUES
('beginner', 'What is 2 + 3?', '4', '5', '6', '7', 'B'),
('beginner', 'What comes next: 2, 4, 6, ?', '7', '8', '9', '10', 'B'),
('intermediate', 'If x + 3 = 7, what is x?', '2', '3', '4', '5', 'C'),
('intermediate', 'Find the next number: 3, 6, 12, ?', '18', '20', '24', '30', 'C'),
('advanced', 'What is 7 × 6 - 5?', '37', '42', '40', '47', 'A'),
('advanced', 'Solve: 2^5 ÷ 2^2 = ?', '2', '4', '6', '8', 'D');
