-- Make all course modules publicly viewable
UPDATE public.course_modules 
SET public_preview = true 
WHERE public_preview = false;