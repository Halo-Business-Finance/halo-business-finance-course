-- Enable public viewing for course catalog
-- This allows anonymous users to browse courses before enrolling

-- Add public viewing policy for courses table
CREATE POLICY "Public can view active courses for catalog browsing" 
ON public.courses 
FOR SELECT 
USING (is_active = true);

-- Add public viewing policy for course_content_modules table (for basic module info)
CREATE POLICY "Public can view active modules for catalog preview" 
ON public.course_content_modules 
FOR SELECT 
USING (is_active = true);

-- Add public viewing policy for course_modules table if needed
CREATE POLICY "Public can view active course modules for catalog" 
ON public.course_modules 
FOR SELECT 
USING (is_active = true AND public_preview = true);