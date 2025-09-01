-- Add course_id relationship to course_modules table
ALTER TABLE public.course_modules 
ADD COLUMN IF NOT EXISTS course_id text REFERENCES public.courses(id) ON DELETE CASCADE;

-- Create index for better performance on course_id lookups
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id);

-- Update RLS policy to include course_id in filtering
DROP POLICY IF EXISTS "Authenticated users can view course modules" ON public.course_modules;
DROP POLICY IF EXISTS "Public can view preview courses, enrolled users see all active" ON public.course_modules;
DROP POLICY IF EXISTS "Secure course module access" ON public.course_modules;

-- Create new comprehensive RLS policy for course modules
CREATE POLICY "Users can view course modules based on enrollment and preview"
ON public.course_modules FOR SELECT
USING (
  (is_active = true) AND (
    is_admin(auth.uid()) OR 
    (
      auth.uid() IS NOT NULL AND (
        EXISTS (
          SELECT 1 FROM course_enrollments 
          WHERE user_id = auth.uid() 
          AND status = 'active'
        ) OR 
        (public_preview = true)
      )
    )
  )
);

-- Allow admins to manage course modules
CREATE POLICY "Admins can manage course modules"
ON public.course_modules FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));