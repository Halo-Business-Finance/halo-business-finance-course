-- Create course enrollments table for proper access control
CREATE TABLE public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id TEXT NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS on course enrollments
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies for course enrollments
CREATE POLICY "Users can view their own enrollments" 
ON public.course_enrollments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments" 
ON public.course_enrollments 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can manage all enrollments" 
ON public.course_enrollments 
FOR ALL 
USING (is_admin());

-- Update the overly permissive RLS policy on Halo Launch Pad Learn table
DROP POLICY IF EXISTS "Allow authenticated users to read course data" ON public."Halo Launch Pad Learn";

-- Create new restrictive policy that checks enrollment or admin status
CREATE POLICY "Users can view courses they are enrolled in or admins can view all" 
ON public."Halo Launch Pad Learn"
FOR SELECT 
USING (
  is_admin() OR 
  EXISTS (
    SELECT 1 FROM public.course_enrollments 
    WHERE user_id = auth.uid() 
    AND course_id = 'halo-launch-pad-learn' 
    AND status = 'active'
  )
);

-- Add trigger for updating course_enrollments updated_at
CREATE TRIGGER update_course_enrollments_updated_at
BEFORE UPDATE ON public.course_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default enrollment for existing users (optional - for migration purposes)
-- This ensures existing users maintain access
INSERT INTO public.course_enrollments (user_id, course_id, status)
SELECT DISTINCT p.user_id, 'halo-launch-pad-learn', 'active'
FROM public.profiles p
ON CONFLICT (user_id, course_id) DO NOTHING;