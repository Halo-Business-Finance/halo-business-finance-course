-- Enable RLS on new tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_content_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_quiz_questions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for courses
DROP POLICY IF EXISTS "Enrolled users can view courses" ON public.courses;
CREATE POLICY "Enrolled users can view courses" ON public.courses
FOR SELECT USING (
  is_active = true AND (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.course_enrollments 
        WHERE user_id = auth.uid() AND status = 'active'
      ) OR is_admin(auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
CREATE POLICY "Admins can manage courses" ON public.courses
FOR ALL USING (is_admin(auth.uid()));

-- Create RLS policies for course_content_modules
DROP POLICY IF EXISTS "Enrolled users can view active modules" ON public.course_content_modules;
CREATE POLICY "Enrolled users can view active modules" ON public.course_content_modules
FOR SELECT USING (
  is_active = true AND (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.course_enrollments 
        WHERE user_id = auth.uid() AND status = 'active'
      ) OR is_admin(auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Admins can manage modules" ON public.course_content_modules;
CREATE POLICY "Admins can manage modules" ON public.course_content_modules
FOR ALL USING (is_admin(auth.uid()));

-- Create RLS policies for loan_examples
DROP POLICY IF EXISTS "Enrolled users can view loan examples" ON public.loan_examples;
CREATE POLICY "Enrolled users can view loan examples" ON public.loan_examples
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR is_admin(auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can manage loan examples" ON public.loan_examples;
CREATE POLICY "Admins can manage loan examples" ON public.loan_examples
FOR ALL USING (is_admin(auth.uid()));

-- Create RLS policies for case_studies
DROP POLICY IF EXISTS "Enrolled users can view case studies" ON public.case_studies;
CREATE POLICY "Enrolled users can view case studies" ON public.case_studies
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR is_admin(auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can manage case studies" ON public.case_studies;
CREATE POLICY "Admins can manage case studies" ON public.case_studies
FOR ALL USING (is_admin(auth.uid()));

-- Create RLS policies for module_quizzes
DROP POLICY IF EXISTS "Enrolled users can view quizzes" ON public.module_quizzes;
CREATE POLICY "Enrolled users can view quizzes" ON public.module_quizzes
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR is_admin(auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can manage quizzes" ON public.module_quizzes;
CREATE POLICY "Admins can manage quizzes" ON public.module_quizzes
FOR ALL USING (is_admin(auth.uid()));

-- Create RLS policies for module_quiz_questions
DROP POLICY IF EXISTS "Enrolled users can view quiz questions" ON public.module_quiz_questions;
CREATE POLICY "Enrolled users can view quiz questions" ON public.module_quiz_questions
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR is_admin(auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can manage quiz questions" ON public.module_quiz_questions;
CREATE POLICY "Admins can manage quiz questions" ON public.module_quiz_questions
FOR ALL USING (is_admin(auth.uid()));

-- Fix search path warning by updating the function with SECURITY DEFINER and set search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_level ON public.courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_active ON public.courses(is_active);
CREATE INDEX IF NOT EXISTS idx_course_content_modules_course_id ON public.course_content_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_content_modules_status ON public.course_content_modules(status);
CREATE INDEX IF NOT EXISTS idx_loan_examples_module_id ON public.loan_examples(module_id);
CREATE INDEX IF NOT EXISTS idx_case_studies_module_id ON public.case_studies(module_id);
CREATE INDEX IF NOT EXISTS idx_module_quizzes_module_id ON public.module_quizzes(module_id);
CREATE INDEX IF NOT EXISTS idx_module_quiz_questions_quiz_id ON public.module_quiz_questions(quiz_id);