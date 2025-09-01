-- Create courses table
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

-- Create course_content_modules table (more detailed than course_modules)
CREATE TABLE IF NOT EXISTS public.course_content_modules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
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

-- Create loan_examples table
CREATE TABLE IF NOT EXISTS public.loan_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id TEXT NOT NULL REFERENCES public.course_content_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scenario TEXT NOT NULL,
  loan_amount TEXT NOT NULL,
  loan_type TEXT NOT NULL,
  borrower_profile TEXT NOT NULL,
  key_learning_points JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create case_studies table
CREATE TABLE IF NOT EXISTS public.case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id TEXT NOT NULL REFERENCES public.course_content_modules(id) ON DELETE CASCADE,
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

-- Create scripts table
CREATE TABLE IF NOT EXISTS public.scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id TEXT NOT NULL REFERENCES public.course_content_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scenario TEXT NOT NULL,
  dialogues JSONB NOT NULL DEFAULT '[]'::jsonb,
  key_points JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create module_quiz_questions table
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

-- Create module_quizzes table
CREATE TABLE IF NOT EXISTS public.module_quizzes (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES public.course_content_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  passing_score INTEGER NOT NULL DEFAULT 75,
  time_limit_minutes INTEGER,
  max_attempts INTEGER DEFAULT 3,
  quiz_type TEXT DEFAULT 'module' CHECK (quiz_type IN ('module', 'final')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key for quiz questions
ALTER TABLE public.module_quiz_questions 
ADD CONSTRAINT fk_quiz_questions_quiz 
FOREIGN KEY (quiz_id) REFERENCES public.module_quizzes(id) ON DELETE CASCADE;

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_content_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_quiz_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
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

CREATE POLICY "Admins can manage courses" ON public.courses
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for course_content_modules  
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

CREATE POLICY "Admins can manage modules" ON public.course_content_modules
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for loan_examples
CREATE POLICY "Enrolled users can view loan examples" ON public.loan_examples
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR is_admin(auth.uid())
  )
);

CREATE POLICY "Admins can manage loan examples" ON public.loan_examples
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for case_studies
CREATE POLICY "Enrolled users can view case studies" ON public.case_studies
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR is_admin(auth.uid())
  )
);

CREATE POLICY "Admins can manage case studies" ON public.case_studies
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for scripts
CREATE POLICY "Enrolled users can view scripts" ON public.scripts
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR is_admin(auth.uid())
  )
);

CREATE POLICY "Admins can manage scripts" ON public.scripts
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for module_quizzes
CREATE POLICY "Enrolled users can view quizzes" ON public.module_quizzes
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR is_admin(auth.uid())
  )
);

CREATE POLICY "Admins can manage quizzes" ON public.module_quizzes
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for module_quiz_questions
CREATE POLICY "Enrolled users can view quiz questions" ON public.module_quiz_questions
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR is_admin(auth.uid())
  )
);

CREATE POLICY "Admins can manage quiz questions" ON public.module_quiz_questions
FOR ALL USING (is_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_content_modules_course_id ON public.course_content_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_content_modules_status ON public.course_content_modules(status);
CREATE INDEX IF NOT EXISTS idx_loan_examples_module_id ON public.loan_examples(module_id);
CREATE INDEX IF NOT EXISTS idx_case_studies_module_id ON public.case_studies(module_id);
CREATE INDEX IF NOT EXISTS idx_scripts_module_id ON public.scripts(module_id);
CREATE INDEX IF NOT EXISTS idx_module_quizzes_module_id ON public.module_quizzes(module_id);
CREATE INDEX IF NOT EXISTS idx_module_quiz_questions_quiz_id ON public.module_quiz_questions(quiz_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_content_modules_updated_at
  BEFORE UPDATE ON public.course_content_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();