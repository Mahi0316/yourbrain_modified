# Setup Instructions

## Environment Variables Required

You need to create a `.env` file in the root directory with your Supabase credentials:

```bash
# Create .env file
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### How to get Supabase credentials:

1. Go to [supabase.com](https://supabase.com)
2. Create a new project or use an existing one
3. Go to Settings > API
4. Copy the Project URL and anon/public key
5. Replace the values in your `.env` file

### Example .env file:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Database Setup

The application expects these tables in your Supabase database:

- `classrooms` - stores classroom information
- `classroom_students` - stores student-classroom relationships  
- `tests` - stores test information
- `test_attempts` - stores student test attempts
- `questions` - stores MCQ questions
- `test_questions` - junction table linking tests to questions
- `results` - stores student test results
- `users` - stores user role information
- `students` - stores student information

### Setting up the database:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration file: `supabase/migrations/20250101000000_simple_classroom_schema.sql`
4. This will create all the required tables with proper relationships and sample data

**Note:** There are two migration files in the project:
- `20250920152453_silver_tower.sql` - Complex schema (not used by current code)
- `20250101000000_simple_classroom_schema.sql` - Simple schema (matches the code)

## Running the Application

1. Install dependencies: `npm install`
2. Set up environment variables (see above)
3. Run the development server: `npm run dev`
4. Open http://localhost:5176 in your browser

## Features

- Teacher Dashboard: Create classrooms, manage tests
- Student Dashboard: Join classrooms, take tests
- Authentication: Login/signup system
- Real-time updates via Supabase
