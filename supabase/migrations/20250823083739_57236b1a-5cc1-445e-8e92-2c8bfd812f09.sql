-- Update RLS policy to allow public viewing of active course modules
DROP POLICY IF EXISTS "Authenticated users can view modules" ON public.course_modules;

-- Create new policy for public viewing of active modules
CREATE POLICY "Public can view active modules" 
ON public.course_modules 
FOR SELECT 
USING (is_active = true);