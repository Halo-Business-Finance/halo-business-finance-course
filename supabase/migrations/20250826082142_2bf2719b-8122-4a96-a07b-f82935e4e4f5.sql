-- Fix the function search path mutable warning
-- by setting the search_path parameter on the function

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
SECURITY INVOKER
SET search_path TO 'public'  -- Fix: Set explicit search_path
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