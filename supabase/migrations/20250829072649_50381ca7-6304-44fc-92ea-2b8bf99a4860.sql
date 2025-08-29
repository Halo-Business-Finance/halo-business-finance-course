-- Final Security Fix: Protect Course Content from Competitor Scraping

-- Update course_modules RLS policy to require authentication for preview access
DROP POLICY IF EXISTS "Public can view preview courses, enrolled users see all active" ON public.course_modules;
DROP POLICY IF EXISTS "secure_course_module_access" ON public.course_modules;

-- Create more secure course module access policy
CREATE POLICY "Authenticated users can view course modules" 
ON public.course_modules 
FOR SELECT 
USING (
  is_active = true AND (
    -- Admins can see all
    is_admin(auth.uid()) OR
    -- Enrolled users can see all active modules
    (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM course_enrollments 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )) OR
    -- Public preview only for very limited content and requires auth
    (public_preview = true AND auth.uid() IS NOT NULL)
  )
);

-- Add comprehensive audit logging for course access
CREATE OR REPLACE FUNCTION public.log_course_access_attempt(
  p_module_id text,
  p_access_type text,
  p_success boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    details,
    logged_via_secure_function
  ) VALUES (
    auth.uid(),
    'course_access_attempt',
    CASE WHEN p_success THEN 'low' ELSE 'medium' END,
    jsonb_build_object(
      'module_id', p_module_id,
      'access_type', p_access_type,
      'success', p_success,
      'timestamp', now(),
      'user_authenticated', auth.uid() IS NOT NULL,
      'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
    ),
    true
  );
END;
$$;

-- Create function to validate course content access
CREATE OR REPLACE FUNCTION public.validate_course_content_access(
  p_module_id text,
  p_requested_fields text[] DEFAULT ARRAY['basic']
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_enrolled boolean := false;
  is_admin_user boolean := false;
  module_preview boolean := false;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    PERFORM log_course_access_attempt(p_module_id, 'unauthenticated_access', false);
    RETURN false;
  END IF;

  -- Check admin status
  is_admin_user := is_admin(auth.uid());
  
  -- Check enrollment status
  SELECT EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  ) INTO user_enrolled;
  
  -- Check if module allows public preview
  SELECT public_preview INTO module_preview
  FROM course_modules 
  WHERE module_id = p_module_id;
  
  -- Grant access based on rules
  IF is_admin_user OR user_enrolled OR (module_preview AND auth.uid() IS NOT NULL) THEN
    PERFORM log_course_access_attempt(p_module_id, 'authorized_access', true);
    RETURN true;
  ELSE
    PERFORM log_course_access_attempt(p_module_id, 'unauthorized_access', false);
    RETURN false;
  END IF;
END;
$$;