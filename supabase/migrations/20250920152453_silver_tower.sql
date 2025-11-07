/*
  # MCQ Training Platform Database Schema

  1. New Tables
    - `profiles` - User profiles with role information (teacher/student)
    - `learning_levels` - Beginner, Intermediate, Expert levels
    - `subjects` - Aptitude and Electronics & Instrumentation
    - `topics` - Subject subtopics
    - `questions` - MCQ questions with options and explanations
    - `tests` - Test configurations created by teachers
    - `test_assignments` - Test assignments to student groups
    - `test_attempts` - Student test attempt records
    - `test_answers` - Individual question answers in test attempts
    - `student_groups` - Groups of students managed by teachers
    - `group_members` - Junction table for student-group relationships

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Teachers can manage their own content and assigned students
    - Students can only access assigned content and their own results

  3. Key Features
    - Comprehensive test management system
    - Progress tracking and analytics
    - Learning level progression
    - Teacher-student group management
*/

-- Create enum types
CREATE TYPE user_role AS ENUM ('teacher', 'student');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'expert');
CREATE TYPE subject_type AS ENUM ('aptitude', 'electronics');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Learning levels
CREATE TABLE IF NOT EXISTS learning_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level difficulty_level NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type subject_type NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Topics
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  level difficulty_level NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option text NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation text,
  difficulty difficulty_level NOT NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Student groups
CREATE TABLE IF NOT EXISTS student_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  teacher_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Group members
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES student_groups(id) ON DELETE CASCADE,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, student_id)
);

-- Tests
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  subject_id uuid REFERENCES subjects(id),
  topic_ids uuid[] DEFAULT '{}',
  difficulty difficulty_level NOT NULL,
  question_count integer DEFAULT 10 CHECK (question_count > 0),
  time_limit_minutes integer DEFAULT 30 CHECK (time_limit_minutes > 0),
  created_by uuid REFERENCES profiles(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Test assignments
CREATE TABLE IF NOT EXISTS test_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES tests(id) ON DELETE CASCADE,
  group_id uuid REFERENCES student_groups(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES profiles(id),
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  max_attempts integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Test attempts
CREATE TABLE IF NOT EXISTS test_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES tests(id) ON DELETE CASCADE,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  assignment_id uuid REFERENCES test_assignments(id),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  score integer DEFAULT 0,
  total_questions integer NOT NULL,
  time_taken_minutes integer,
  is_completed boolean DEFAULT false
);

-- Test answers
CREATE TABLE IF NOT EXISTS test_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  selected_option text CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  is_correct boolean DEFAULT false,
  answered_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_answers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Teachers can read student profiles in their groups"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    role = 'student' AND id IN (
      SELECT gm.student_id FROM group_members gm
      JOIN student_groups sg ON gm.group_id = sg.id
      WHERE sg.teacher_id = auth.uid()
    )
  );

-- Learning levels policies (readable by all authenticated users)
CREATE POLICY "Authenticated users can read learning levels"
  ON learning_levels FOR SELECT
  TO authenticated
  USING (true);

-- Subjects policies (readable by all authenticated users)
CREATE POLICY "Authenticated users can read subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (true);

-- Topics policies (readable by all authenticated users)
CREATE POLICY "Authenticated users can read topics"
  ON topics FOR SELECT
  TO authenticated
  USING (true);

-- Questions policies
CREATE POLICY "Authenticated users can read questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can create questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Teachers can update their questions"
  ON questions FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Student groups policies
CREATE POLICY "Teachers can manage their groups"
  ON student_groups FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Students can read their groups"
  ON student_groups FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT group_id FROM group_members WHERE student_id = auth.uid()
    )
  );

-- Group members policies
CREATE POLICY "Teachers can manage group members"
  ON group_members FOR ALL
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM student_groups WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can read their group memberships"
  ON group_members FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Tests policies
CREATE POLICY "Teachers can manage their tests"
  ON tests FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Students can read assigned tests"
  ON tests FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT ta.test_id FROM test_assignments ta
      JOIN group_members gm ON ta.group_id = gm.group_id
      WHERE gm.student_id = auth.uid()
    )
  );

-- Test assignments policies
CREATE POLICY "Teachers can manage test assignments"
  ON test_assignments FOR ALL
  TO authenticated
  USING (assigned_by = auth.uid())
  WITH CHECK (assigned_by = auth.uid());

CREATE POLICY "Students can read their assignments"
  ON test_assignments FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE student_id = auth.uid()
    )
  );

-- Test attempts policies
CREATE POLICY "Students can manage their attempts"
  ON test_attempts FOR ALL
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can read attempts for their tests"
  ON test_attempts FOR SELECT
  TO authenticated
  USING (
    test_id IN (
      SELECT id FROM tests WHERE created_by = auth.uid()
    )
  );

-- Test answers policies
CREATE POLICY "Students can manage their answers"
  ON test_answers FOR ALL
  TO authenticated
  USING (
    attempt_id IN (
      SELECT id FROM test_attempts WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can read answers for their tests"
  ON test_answers FOR SELECT
  TO authenticated
  USING (
    attempt_id IN (
      SELECT ta.id FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      WHERE t.created_by = auth.uid()
    )
  );

-- Insert initial data
INSERT INTO learning_levels (name, level, description) VALUES
('Beginner', 'beginner', 'Foundation level concepts and basic problem solving'),
('Intermediate', 'intermediate', 'Moderate complexity with advanced problem solving'),
('Expert', 'expert', 'Advanced concepts with complex problem solving');

INSERT INTO subjects (name, type, description) VALUES
('Quantitative Aptitude', 'aptitude', 'Mathematical and numerical reasoning skills'),
('Logical Reasoning', 'aptitude', 'Pattern recognition and logical thinking'),
('Verbal Ability', 'aptitude', 'Language comprehension and communication skills'),
('Industrial Instrumentation', 'electronics', 'Measurement and control systems in industry'),
('Process Control', 'electronics', 'Automatic control of industrial processes'),
('Embedded C', 'electronics', 'Programming microcontrollers and embedded systems'),
('Microprocessor & Microcontroller', 'electronics', '8-bit and 32-bit processor architectures'),
('Sensors & Transducers', 'electronics', 'Signal conversion and measurement devices'),
('Network Systems', 'electronics', 'Communication protocols and network design'),
('Analog Integrated Circuits', 'electronics', 'Analog circuit design and analysis'),
('VLSI', 'electronics', 'Very Large Scale Integration design and fabrication');

-- Insert topics for each subject and level
DO $$
DECLARE
  subject_record RECORD;
  level_record RECORD;
BEGIN
  -- Get all subjects and levels
  FOR subject_record IN SELECT id, name, type FROM subjects LOOP
    FOR level_record IN SELECT level FROM learning_levels LOOP
      -- Insert topics based on subject type and level
      IF subject_record.type = 'aptitude' THEN
        CASE subject_record.name
          WHEN 'Quantitative Aptitude' THEN
            INSERT INTO topics (subject_id, name, description, level) VALUES
            (subject_record.id, 'Number Systems', 'Binary, octal, hexadecimal number systems', level_record.level),
            (subject_record.id, 'Arithmetic', 'Basic arithmetic operations and percentages', level_record.level),
            (subject_record.id, 'Algebra', 'Linear equations and inequalities', level_record.level),
            (subject_record.id, 'Geometry', 'Basic shapes, areas, and volumes', level_record.level),
            (subject_record.id, 'Statistics', 'Mean, median, mode, and probability', level_record.level);
          WHEN 'Logical Reasoning' THEN
            INSERT INTO topics (subject_id, name, description, level) VALUES
            (subject_record.id, 'Pattern Recognition', 'Identifying sequences and patterns', level_record.level),
            (subject_record.id, 'Puzzles', 'Logic puzzles and brain teasers', level_record.level),
            (subject_record.id, 'Analogies', 'Relationship-based reasoning', level_record.level),
            (subject_record.id, 'Classification', 'Grouping and categorization', level_record.level),
            (subject_record.id, 'Series', 'Number and letter series completion', level_record.level);
          WHEN 'Verbal Ability' THEN
            INSERT INTO topics (subject_id, name, description, level) VALUES
            (subject_record.id, 'Grammar', 'Parts of speech and sentence structure', level_record.level),
            (subject_record.id, 'Vocabulary', 'Word meanings and usage', level_record.level),
            (subject_record.id, 'Comprehension', 'Reading and understanding passages', level_record.level),
            (subject_record.id, 'Synonyms & Antonyms', 'Word relationships', level_record.level),
            (subject_record.id, 'Sentence Correction', 'Grammar and style correction', level_record.level);
        END CASE;
      ELSE
        -- Electronics subjects
        CASE subject_record.name
          WHEN 'Industrial Instrumentation' THEN
            INSERT INTO topics (subject_id, name, description, level) VALUES
            (subject_record.id, 'Measurement Systems', 'Measurement principles and standards', level_record.level),
            (subject_record.id, 'Control Loops', 'Open and closed loop control systems', level_record.level),
            (subject_record.id, 'Process Variables', 'Temperature, pressure, flow measurement', level_record.level),
            (subject_record.id, 'Calibration', 'Instrument calibration techniques', level_record.level),
            (subject_record.id, 'Safety Systems', 'Industrial safety and protection', level_record.level);
          WHEN 'Process Control' THEN
            INSERT INTO topics (subject_id, name, description, level) VALUES
            (subject_record.id, 'PID Controllers', 'Proportional, integral, derivative control', level_record.level),
            (subject_record.id, 'SCADA Systems', 'Supervisory control and data acquisition', level_record.level),
            (subject_record.id, 'DCS', 'Distributed control systems', level_record.level),
            (subject_record.id, 'HMI', 'Human machine interface design', level_record.level),
            (subject_record.id, 'Process Optimization', 'Control system tuning and optimization', level_record.level);
          ELSE
            -- Default topics for other electronics subjects
            INSERT INTO topics (subject_id, name, description, level) VALUES
            (subject_record.id, 'Fundamentals', 'Basic concepts and principles', level_record.level),
            (subject_record.id, 'Applications', 'Practical applications and use cases', level_record.level),
            (subject_record.id, 'Design', 'System design and implementation', level_record.level),
            (subject_record.id, 'Troubleshooting', 'Problem diagnosis and solution', level_record.level),
            (subject_record.id, 'Advanced Topics', 'Complex concepts and techniques', level_record.level);
        END CASE;
      END IF;
    END LOOP;
  END LOOP;
END $$;