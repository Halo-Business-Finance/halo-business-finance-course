-- Drop existing function first to avoid conflicts
DROP FUNCTION IF EXISTS public.log_course_access_attempt(text, text, boolean);

-- Create comprehensive audit logging for course access
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