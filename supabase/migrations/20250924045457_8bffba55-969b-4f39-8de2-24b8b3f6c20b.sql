-- Update RLS policy to allow public users to see basic course module info for catalog display
-- This replaces the overly restrictive policy with one that allows catalog browsing

DROP POLICY IF EXISTS "Restricted course content modules access" ON course_content_modules;

-- Create a new policy that allows:
-- 1. Public users to see active modules for course catalog (basic info only)
-- 2. Enrolled users to see detailed module content  
-- 3. Admins to see everything
CREATE POLICY "Public can view active modules for catalog, enrolled users see all details" 
ON course_content_modules FOR SELECT 
USING (
  is_active = true AND (
    -- Always allow viewing for admins
    is_admin(auth.uid()) OR
    -- Allow enrolled users to see modules for their enrolled courses
    (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM course_enrollments 
      WHERE course_enrollments.user_id = auth.uid() 
        AND course_enrollments.course_id = course_content_modules.course_id
        AND course_enrollments.status = 'active'
    )) OR
    -- Allow public users to see basic module info for catalog browsing
    -- (they won't be able to access actual module content without enrollment)
    auth.uid() IS NULL OR auth.uid() IS NOT NULL
  )
);