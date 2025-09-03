-- Final security fix: Restrict public access to course_content_modules table
-- Remove public preview policy that exposes course structure

DROP POLICY IF EXISTS "Public can view active modules for catalog preview" ON public.course_content_modules;

-- Create a restricted policy that only allows authenticated enrolled users
-- and maintains very limited public preview only for marketing purposes
CREATE POLICY "Restricted course content modules access"
ON public.course_content_modules
FOR SELECT
USING (
  is_active = true 
  AND (
    -- Only authenticated users can see full details
    (auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.course_enrollments 
        WHERE user_id = auth.uid() 
        AND course_id = course_content_modules.course_id 
        AND status = 'active'
      )
      OR public.is_admin(auth.uid())
    ))
    -- Very limited public preview - only basic info for specific demo modules
    OR (
      auth.uid() IS NULL 
      AND course_id = 'demo-course'
      AND id IN ('demo-module-1', 'preview-module-1')
    )
  )
);

-- Log the final security fix
INSERT INTO public.security_events (event_type, severity, details, logged_via_secure_function)
VALUES (
  'final_course_content_security_fix',
  'medium',
  jsonb_build_object(
    'fix_applied', 'course_content_modules_access_restricted',
    'timestamp', now(),
    'security_improvement', 'proprietary_curriculum_protected',
    'previous_exposure', 'public_course_structure_visible'
  ),
  true
);