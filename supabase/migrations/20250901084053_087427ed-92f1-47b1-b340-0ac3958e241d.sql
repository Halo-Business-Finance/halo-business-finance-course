-- Create module quizzes table with simplified structure
CREATE TABLE IF NOT EXISTS public.module_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key text NOT NULL,
  question_number integer NOT NULL,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'multiple_choice',
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer integer NOT NULL,
  explanation text NOT NULL,
  difficulty_level text NOT NULL DEFAULT 'intermediate',
  points integer DEFAULT 10,
  is_final_test boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(module_key, question_number)
);

-- Enable RLS
ALTER TABLE public.module_quizzes ENABLE ROW LEVEL SECURITY;

-- RLS policies for module_quizzes
CREATE POLICY "Admins can manage module quizzes" 
ON public.module_quizzes FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Enrolled users can view module quizzes" 
ON public.module_quizzes FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM course_enrollments 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    ) OR is_admin(auth.uid())
  )
);

-- Create quiz attempts table
CREATE TABLE IF NOT EXISTS public.module_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_key text NOT NULL,
  quiz_type text NOT NULL DEFAULT 'module_quiz',
  attempt_number integer NOT NULL DEFAULT 1,
  questions_answered jsonb NOT NULL DEFAULT '[]'::jsonb,
  user_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL,
  passing_score integer NOT NULL DEFAULT 80,
  is_passed boolean DEFAULT false,
  time_started timestamp with time zone NOT NULL DEFAULT now(),
  time_completed timestamp with time zone,
  time_spent_minutes integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.module_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies for quiz attempts
CREATE POLICY "Users can manage their own quiz attempts" 
ON public.module_quiz_attempts FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all quiz attempts" 
ON public.module_quiz_attempts FOR SELECT 
USING (is_admin(auth.uid()));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_module_quizzes_module_key ON public.module_quizzes(module_key);
CREATE INDEX IF NOT EXISTS idx_module_quiz_attempts_user_module ON public.module_quiz_attempts(user_id, module_key);
CREATE INDEX IF NOT EXISTS idx_module_quiz_attempts_passed ON public.module_quiz_attempts(user_id, is_passed);

-- Add quiz tracking columns to adaptive_module_instances
ALTER TABLE public.adaptive_module_instances 
ADD COLUMN IF NOT EXISTS quiz_required boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS quiz_passed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS can_progress boolean DEFAULT false;