-- Fix the security definer view issue by creating a proper RLS-compliant view
-- Drop the previous view
DROP VIEW IF EXISTS public_course_overview;

-- Create a simple view without security definer properties
-- This view will respect RLS policies properly
CREATE VIEW public_course_overview AS
SELECT 
  module_id,
  title,
  skill_level,
  -- Only show limited info for public preview modules
  CASE 
    WHEN public_preview = true AND is_active = true THEN 
      CASE 
        WHEN LENGTH(description) > 150 THEN LEFT(description, 150) || '...'
        ELSE description
      END
    ELSE 'Authentication required to view full course details'
  END as description_preview,
  CASE 
    WHEN public_preview = true AND is_active = true THEN duration
    ELSE 'Sign in to view'
  END as duration_display,
  public_preview,
  is_active
FROM course_modules 
WHERE is_active = true AND public_preview = true;

-- Enable RLS on the view (views inherit RLS from underlying tables)
-- The view will automatically respect the RLS policies of course_modules table

-- Remove the overly permissive public preview policy since we now have a dedicated view
DROP POLICY IF EXISTS "Public preview for marketing modules only" ON course_modules;

-- Update course_modules to be strictly for authenticated users only
-- Keep only the restrictive policy for enrolled users and admins
-- The existing "Enrolled users and admins can view active course modules" policy is sufficient

-- Grant appropriate access to the public overview view
-- This view only shows limited preview information
GRANT SELECT ON public_course_overview TO anon, authenticated;