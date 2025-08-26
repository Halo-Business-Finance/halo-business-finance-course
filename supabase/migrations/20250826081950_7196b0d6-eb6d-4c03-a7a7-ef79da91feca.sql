-- Update course_modules RLS policy to restrict public access
-- Drop the existing public policy
DROP POLICY IF EXISTS "Public can view preview courses, enrolled users see all active" ON course_modules;

-- Create new restrictive policy that only allows access to enrolled users
CREATE POLICY "Enrolled users and admins can view active course modules" 
ON course_modules 
FOR SELECT 
USING (
  is_active = true 
  AND (
    -- Admins can see all modules
    is_admin(auth.uid()) 
    OR 
    -- Enrolled users can see modules (must be authenticated)
    (
      auth.uid() IS NOT NULL 
      AND EXISTS (
        SELECT 1 
        FROM course_enrollments 
        WHERE course_enrollments.user_id = auth.uid() 
        AND course_enrollments.status = 'active'
      )
    )
  )
);

-- Create a separate policy for completely public preview content if needed
-- This would be for truly public marketing content only
CREATE POLICY "Public preview for marketing modules only" 
ON course_modules 
FOR SELECT 
USING (
  is_active = true 
  AND public_preview = true
  -- Only allow very basic info for public preview, not full course structure
  -- This could be used for landing page teasers, etc.
);

-- Update the admin policy to be more explicit
DROP POLICY IF EXISTS "Admins can manage course modules" ON course_modules;

CREATE POLICY "Admins have full access to course modules" 
ON course_modules 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Add logging for course module access attempts by unauthenticated users
CREATE OR REPLACE FUNCTION log_course_module_access_attempt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log when unauthenticated users attempt to access course modules
  IF auth.uid() IS NULL THEN
    INSERT INTO security_events (event_type, severity, details)
    VALUES (
      'unauthorized_course_access_attempt',
      'medium',
      jsonb_build_object(
        'module_id', NEW.module_id,
        'module_title', NEW.title,
        'timestamp', now(),
        'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for',
        'user_agent', current_setting('request.headers', true)::json->>'user-agent'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Note: We don't add this trigger as SELECT operations don't use triggers
-- Instead, we'll monitor through other means

-- Create a view for truly public course information (marketing purposes)
CREATE OR REPLACE VIEW public_course_overview AS
SELECT 
  module_id,
  title,
  skill_level,
  -- Only show very basic info publicly
  CASE 
    WHEN public_preview = true THEN LEFT(description, 150) || '...'
    ELSE 'Login required to view course details'
  END as description_preview,
  CASE 
    WHEN public_preview = true THEN duration
    ELSE NULL
  END as duration,
  public_preview,
  is_active
FROM course_modules 
WHERE is_active = true;

-- Grant public access to the overview view only
GRANT SELECT ON public_course_overview TO anon, authenticated;

-- Ensure proper RLS is enabled
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;