-- Update RLS policy to allow public access to all active courses in the catalog
DROP POLICY IF EXISTS "Limited course preview for unauthenticated users" ON public.courses;

-- Create new policy allowing public access to all active courses
CREATE POLICY "Public can view active courses in catalog" 
ON public.courses 
FOR SELECT 
USING (is_active = true);