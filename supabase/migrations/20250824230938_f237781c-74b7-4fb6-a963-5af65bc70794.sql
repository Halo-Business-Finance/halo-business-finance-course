-- Security Fix: Restrict public access to course modules
-- Remove unauthenticated access to protect intellectual property
DROP POLICY IF EXISTS "Public and enrolled users can view course modules" ON public.course_modules;

CREATE POLICY "Enrolled users and admins can view course modules" 
ON public.course_modules 
FOR SELECT 
USING (
  (is_active = true) AND 
  (is_admin(auth.uid()) OR (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM course_enrollments 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  ))
);