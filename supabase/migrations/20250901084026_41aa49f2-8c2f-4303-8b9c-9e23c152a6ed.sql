-- Create module quizzes table to store quiz questions for each adaptive module
CREATE TABLE IF NOT EXISTS public.module_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key text NOT NULL, -- Reference to adaptive_modules.module_key instead of FK
  question_number integer NOT NULL,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'multiple_choice',
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer integer NOT NULL,
  explanation text NOT NULL,
  difficulty_level text NOT NULL DEFAULT 'intermediate',
  points integer DEFAULT 10,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(module_key, question_number)
);

-- Enable RLS
ALTER TABLE public.module_quizzes ENABLE ROW LEVEL SECURITY;

-- RLS policies
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

-- Create quiz attempts table to track user quiz attempts
CREATE TABLE IF NOT EXISTS public.module_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_instance_id uuid REFERENCES public.adaptive_module_instances(id) ON DELETE CASCADE,
  quiz_type text NOT NULL DEFAULT 'module_quiz', -- 'module_quiz' or 'final_test'
  attempt_number integer NOT NULL DEFAULT 1,
  questions_answered jsonb NOT NULL DEFAULT '[]'::jsonb,
  user_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL,
  passing_score integer NOT NULL DEFAULT 80,
  is_passed boolean GENERATED ALWAYS AS (score >= passing_score) STORED,
  time_started timestamp with time zone NOT NULL DEFAULT now(),
  time_completed timestamp with time zone,
  time_spent_minutes integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.module_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own quiz attempts" 
ON public.module_quiz_attempts FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all quiz attempts" 
ON public.module_quiz_attempts FOR SELECT 
USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_module_quizzes_module_key ON public.module_quizzes(module_key);
CREATE INDEX IF NOT EXISTS idx_module_quiz_attempts_user_module ON public.module_quiz_attempts(user_id, module_instance_id);
CREATE INDEX IF NOT EXISTS idx_module_quiz_attempts_passed ON public.module_quiz_attempts(user_id, is_passed);

-- Function to check if user has passed the required quiz for a module
CREATE OR REPLACE FUNCTION has_passed_module_quiz(p_user_id uuid, p_module_instance_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.module_quiz_attempts 
    WHERE user_id = p_user_id 
    AND module_instance_id = p_module_instance_id 
    AND quiz_type = 'module_quiz'
    AND is_passed = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to check if user has passed the final test
CREATE OR REPLACE FUNCTION has_passed_final_test(p_user_id uuid, p_course_id text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.module_quiz_attempts mqa
    JOIN public.adaptive_module_instances ami ON ami.id = mqa.module_instance_id
    JOIN public.adaptive_modules am ON am.id = ami.adaptive_module_id
    WHERE mqa.user_id = p_user_id 
    AND ami.course_id = p_course_id
    AND am.module_key = 'mastery_certification'
    AND mqa.quiz_type = 'final_test'
    AND mqa.is_passed = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update adaptive_module_instances to track quiz completion requirements
ALTER TABLE public.adaptive_module_instances 
ADD COLUMN IF NOT EXISTS quiz_required boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS quiz_passed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS can_progress boolean DEFAULT false;