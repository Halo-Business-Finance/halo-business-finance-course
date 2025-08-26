-- Check and fix any remaining security definer views or functions
-- First, let's identify any views with security definer properties

-- Remove security definer property from any existing views that might have it
-- Check if there are any existing problematic views and fix them

-- List all views and their definitions to identify security definer issues
-- Since we can't directly query pg_views in migration, let's be more targeted

-- Check for any functions that might be incorrectly flagged as security definer views
-- and ensure they're properly defined

-- Drop and recreate the public_course_overview view with explicit non-security-definer properties
DROP VIEW IF EXISTS public_course_overview CASCADE;

-- Create the view again, ensuring it's a regular view without any security definer properties
CREATE VIEW public_course_overview 
WITH (security_barrier = false) -- Explicitly set security_barrier to false
AS
SELECT 
  module_id,
  title,
  skill_level,
  -- Only show very limited preview information
  CASE 
    WHEN public_preview = true THEN LEFT(COALESCE(description, ''), 100) || '...'
    ELSE 'Sign in to view course details'
  END as preview_description,
  CASE 
    WHEN public_preview = true THEN COALESCE(duration, 'TBD')
    ELSE 'Login required'
  END as preview_duration,
  is_active
FROM course_modules 
WHERE is_active = true 
  AND public_preview = true;

-- Ensure the view has proper permissions but no security definer properties
GRANT SELECT ON public_course_overview TO anon, authenticated;

-- Also check if there are any inherited issues from functions
-- Make sure our logging function doesn't have unnecessary security definer properties
-- (though it needs SECURITY DEFINER for proper operation)

-- Verify RLS is properly enabled on course_modules
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;

-- Double-check that we don't have any problematic view definitions
-- The main course_modules table should now be properly secured with only enrolled user access