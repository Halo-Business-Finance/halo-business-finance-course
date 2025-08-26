-- Add public_preview field to course_modules table
ALTER TABLE public.course_modules 
ADD COLUMN public_preview boolean DEFAULT false;

-- Update some existing modules to be publicly viewable as previews
UPDATE public.course_modules 
SET public_preview = true 
WHERE module_id IN ('commercial-lending-fundamentals', 'sba-lending-basics', 'credit-analysis-essentials')
LIMIT 3;

-- Update RLS policy to allow public viewing of preview courses
DROP POLICY IF EXISTS "Enrolled users and admins can view course modules" ON public.course_modules;

CREATE POLICY "Public can view preview courses, enrolled users see all active courses"
ON public.course_modules
FOR SELECT
USING (
  (public_preview = true AND is_active = true) OR
  (is_active = true AND (
    is_admin(auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM course_enrollments 
      WHERE course_enrollments.user_id = auth.uid() 
      AND course_enrollments.status = 'active'
    )
  ))
);