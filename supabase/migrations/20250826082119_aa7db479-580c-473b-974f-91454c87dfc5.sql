-- Systematically check for and fix any security definer views
-- We need to identify existing views that might have security definer properties

-- Check if there are any system or custom views with security definer properties
-- Let's try to identify them by looking for common patterns

-- Drop our view completely and avoid creating any view for now
DROP VIEW IF EXISTS public_course_overview CASCADE;

-- Instead of a view, let's check if the issue comes from existing database objects
-- First, ensure all our tables have proper RLS and policies

-- Let's check if there are any existing problematic views by checking information_schema
-- Since we can't query directly in migration, let's be systematic about known views

-- Check if the issue might be with any existing views in the auth schema or other schemas
-- that might have been created with security definer properties

-- Let's create a simple function to get course preview data instead of a view
-- This avoids the security definer view issue entirely
CREATE OR REPLACE FUNCTION get_public_course_previews()
RETURNS TABLE (
  module_id text,
  title text,
  skill_level text,
  preview_description text,
  preview_duration text,
  is_active boolean
)
LANGUAGE sql
STABLE
SECURITY INVOKER  -- Use SECURITY INVOKER instead of DEFINER
AS $$
  SELECT 
    cm.module_id,
    cm.title,
    cm.skill_level::text,
    CASE 
      WHEN cm.public_preview = true THEN LEFT(COALESCE(cm.description, ''), 100) || '...'
      ELSE 'Sign in to view course details'
    END as preview_description,
    CASE 
      WHEN cm.public_preview = true THEN COALESCE(cm.duration, 'TBD')
      ELSE 'Login required'
    END as preview_duration,
    cm.is_active
  FROM course_modules cm
  WHERE cm.is_active = true 
    AND cm.public_preview = true;
$$;

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION get_public_course_previews() TO anon, authenticated;

-- Ensure course_modules table has proper RLS
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;