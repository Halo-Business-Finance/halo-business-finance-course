-- Create courses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'expert')),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course_content_modules table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.course_content_modules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  lessons_count INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  topics JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in-progress', 'completed')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key constraint if it doesn't exist
DO $$ BEGIN
  ALTER TABLE public.course_content_modules 
  ADD CONSTRAINT fk_course_content_modules_course 
  FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create other tables if they don't exist
CREATE TABLE IF NOT EXISTS public.loan_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id TEXT NOT NULL,
  title TEXT NOT NULL,
  scenario TEXT NOT NULL,
  loan_amount TEXT NOT NULL,
  loan_type TEXT NOT NULL,
  borrower_profile TEXT NOT NULL,
  key_learning_points JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key for loan_examples if it doesn't exist
DO $$ BEGIN
  ALTER TABLE public.loan_examples 
  ADD CONSTRAINT fk_loan_examples_module 
  FOREIGN KEY (module_id) REFERENCES public.course_content_modules(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  situation TEXT NOT NULL,
  challenge TEXT NOT NULL,
  solution TEXT NOT NULL,
  outcome TEXT NOT NULL,
  lessons_learned JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key for case_studies if it doesn't exist
DO $$ BEGIN
  ALTER TABLE public.case_studies 
  ADD CONSTRAINT fk_case_studies_module 
  FOREIGN KEY (module_id) REFERENCES public.course_content_modules(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.module_quizzes (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  passing_score INTEGER NOT NULL DEFAULT 75,
  time_limit_minutes INTEGER,
  max_attempts INTEGER DEFAULT 3,
  quiz_type TEXT DEFAULT 'module' CHECK (quiz_type IN ('module', 'final')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key for module_quizzes if it doesn't exist
DO $$ BEGIN
  ALTER TABLE public.module_quizzes 
  ADD CONSTRAINT fk_module_quizzes_module 
  FOREIGN KEY (module_id) REFERENCES public.course_content_modules(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.module_quiz_questions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key for quiz questions only if it doesn't exist
DO $$ BEGIN
  ALTER TABLE public.module_quiz_questions 
  ADD CONSTRAINT fk_quiz_questions_quiz_new 
  FOREIGN KEY (quiz_id) REFERENCES public.module_quizzes(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;