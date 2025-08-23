-- Update RLS policy to allow public viewing of course modules
DROP POLICY IF EXISTS "Enrolled users can view course modules" ON course_modules;

CREATE POLICY "Public and enrolled users can view course modules" 
ON course_modules 
FOR SELECT 
USING (
  is_active = true AND (
    -- Public users can view courses
    auth.uid() IS NULL OR 
    -- Admins can view all courses
    is_admin(auth.uid()) OR 
    -- Enrolled users can view courses
    EXISTS (
      SELECT 1 FROM course_enrollments 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  )
);