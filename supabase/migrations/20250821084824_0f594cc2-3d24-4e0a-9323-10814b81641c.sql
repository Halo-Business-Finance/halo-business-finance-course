-- Create skill levels enum
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'expert');

-- Create enhanced modules table with skill levels
CREATE TABLE public.course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  skill_level skill_level NOT NULL DEFAULT 'beginner',
  duration TEXT,
  lessons_count INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL,
  prerequisites TEXT[], -- Array of module_ids that must be completed first
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document library table for PDFs and resources
CREATE TABLE public.course_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id TEXT REFERENCES public.course_modules(module_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_type TEXT NOT NULL, -- 'pdf', 'word', 'excel', etc.
  file_url TEXT NOT NULL,
  file_size BIGINT, -- in bytes
  upload_user_id UUID REFERENCES auth.users(id),
  download_count INTEGER DEFAULT 0,
  is_downloadable BOOLEAN DEFAULT true,
  category TEXT, -- 'reference', 'worksheet', 'template', etc.
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assessments table
CREATE TABLE public.course_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id TEXT REFERENCES public.course_modules(module_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assessment_type TEXT NOT NULL DEFAULT 'quiz', -- 'quiz', 'checkpoint', 'final'
  time_limit_minutes INTEGER, -- null means no time limit
  passing_score INTEGER DEFAULT 70, -- percentage required to pass
  max_attempts INTEGER DEFAULT 3,
  questions JSONB NOT NULL, -- Store questions and answers
  is_required BOOLEAN DEFAULT true,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user progress tracking table
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT REFERENCES public.course_modules(module_id) ON DELETE CASCADE,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  is_completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  time_spent_minutes INTEGER DEFAULT 0,
  UNIQUE(user_id, module_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assessment attempts table
CREATE TABLE public.assessment_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.course_assessments(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  answers JSONB NOT NULL, -- Store user answers
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  is_passed BOOLEAN NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_taken_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, assessment_id, attempt_number)
);

-- Create automatic enrollment table
CREATE TABLE public.user_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  enrollment_type TEXT DEFAULT 'automatic', -- 'automatic', 'manual', 'invitation'
  is_active BOOLEAN DEFAULT true,
  completion_target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_enrollments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for course_modules (public read, admin write)
CREATE POLICY "Anyone can view active modules" 
ON public.course_modules 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage modules" 
ON public.course_modules 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create RLS policies for course_documents (authenticated users can read, admins can write)
CREATE POLICY "Authenticated users can view documents" 
ON public.course_documents 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage documents" 
ON public.course_documents 
FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update documents" 
ON public.course_documents 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete documents" 
ON public.course_documents 
FOR DELETE 
USING (public.is_admin(auth.uid()));

-- Create RLS policies for course_assessments (authenticated users can read, admins can write)
CREATE POLICY "Authenticated users can view assessments" 
ON public.course_assessments 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage assessments" 
ON public.course_assessments 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create RLS policies for user_progress (users can only see their own progress)
CREATE POLICY "Users can view their own progress" 
ON public.user_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.user_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own progress" 
ON public.user_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" 
ON public.user_progress 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Create RLS policies for assessment_attempts (users can only see their own attempts)
CREATE POLICY "Users can view their own attempts" 
ON public.assessment_attempts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts" 
ON public.assessment_attempts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts" 
ON public.assessment_attempts 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Create RLS policies for user_enrollments (users can only see their own enrollment)
CREATE POLICY "Users can view their own enrollment" 
ON public.user_enrollments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollment" 
ON public.user_enrollments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollment" 
ON public.user_enrollments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all enrollments" 
ON public.user_enrollments 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_course_modules_skill_level ON public.course_modules(skill_level);
CREATE INDEX idx_course_modules_order ON public.course_modules(order_index);
CREATE INDEX idx_course_documents_module ON public.course_documents(module_id);
CREATE INDEX idx_course_documents_category ON public.course_documents(category);
CREATE INDEX idx_course_assessments_module ON public.course_assessments(module_id);
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_module ON public.user_progress(module_id);
CREATE INDEX idx_assessment_attempts_user ON public.assessment_attempts(user_id);
CREATE INDEX idx_assessment_attempts_assessment ON public.assessment_attempts(assessment_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_course_modules_updated_at
  BEFORE UPDATE ON public.course_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_documents_updated_at
  BEFORE UPDATE ON public.course_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_assessments_updated_at
  BEFORE UPDATE ON public.course_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_enrollments_updated_at
  BEFORE UPDATE ON public.user_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically enroll users when they sign up
CREATE OR REPLACE FUNCTION public.auto_enroll_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-enroll the new user
  INSERT INTO public.user_enrollments (user_id, enrollment_type)
  VALUES (NEW.id, 'automatic');
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-enroll users on signup
CREATE TRIGGER auto_enroll_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_enroll_user();