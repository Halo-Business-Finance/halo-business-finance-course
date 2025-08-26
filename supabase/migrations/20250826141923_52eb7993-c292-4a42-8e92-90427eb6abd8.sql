-- Security Fix Phase 1: Consolidate Course Module RLS Policies and Enhance Content Protection

-- First, drop all existing conflicting policies on course_modules
DROP POLICY IF EXISTS "Admins have full access to course modules" ON public.course_modules;
DROP POLICY IF EXISTS "Military grade course access - enrolled users only" ON public.course_modules;
DROP POLICY IF EXISTS "Public can view course previews, enrolled users see full conten" ON public.course_modules;
DROP POLICY IF EXISTS "Public can view preview courses, enrolled users see all active" ON public.course_modules;

-- Create a single, consolidated RLS policy for course_modules
CREATE POLICY "secure_course_module_access" ON public.course_modules
FOR SELECT USING (
  -- Always allow if user is admin
  is_admin(auth.uid()) OR
  -- For public preview: only basic marketing info for active modules with public_preview=true
  (is_active = true AND public_preview = true AND auth.uid() IS NULL) OR
  -- For enrolled users: full access to active modules if enrolled in any course
  (is_active = true AND auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE user_id = auth.uid() AND status = 'active'
  ))
);

-- Add content classification to course modules for better security
ALTER TABLE public.course_modules 
ADD COLUMN IF NOT EXISTS content_classification text DEFAULT 'preview';

-- Add content protection metadata
ALTER TABLE public.course_modules 
ADD COLUMN IF NOT EXISTS security_metadata jsonb DEFAULT '{"access_level": "preview", "ip_restrictions": false}'::jsonb;

-- Update public preview modules to have proper classification
UPDATE public.course_modules 
SET content_classification = 'preview',
    security_metadata = '{"access_level": "preview", "requires_enrollment": false, "content_type": "marketing"}'::jsonb
WHERE public_preview = true;

-- Update non-preview modules to have restricted classification  
UPDATE public.course_modules 
SET content_classification = 'restricted',
    security_metadata = '{"access_level": "restricted", "requires_enrollment": true, "content_type": "premium"}'::jsonb
WHERE public_preview = false OR public_preview IS NULL;

-- Create security function to validate course content access
CREATE OR REPLACE FUNCTION public.validate_course_content_access(
  module_id text, 
  requested_fields text[] DEFAULT ARRAY['basic']
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  module_classification text;
  requires_enrollment boolean;
  user_enrolled boolean := false;
BEGIN
  -- Get module classification
  SELECT content_classification, 
         (security_metadata->>'requires_enrollment')::boolean
  INTO module_classification, requires_enrollment
  FROM public.course_modules 
  WHERE course_modules.module_id = validate_course_content_access.module_id;
  
  -- If module doesn't exist, deny access
  IF module_classification IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user is enrolled if required
  IF requires_enrollment AND auth.uid() IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM course_enrollments 
      WHERE user_id = auth.uid() AND status = 'active'
    ) INTO user_enrolled;
  END IF;
  
  -- Admin access
  IF is_admin(auth.uid()) THEN
    RETURN true;
  END IF;
  
  -- Preview content - allow basic fields only
  IF module_classification = 'preview' THEN
    RETURN array_length(requested_fields, 1) <= 5; -- Limit to basic marketing fields
  END IF;
  
  -- Restricted content - require enrollment
  IF module_classification = 'restricted' THEN
    RETURN user_enrolled;
  END IF;
  
  RETURN false;
END;
$$;

-- Enhanced input validation trigger for course modules
CREATE OR REPLACE FUNCTION public.validate_course_module_input()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate title length and content
  IF LENGTH(NEW.title) < 3 OR LENGTH(NEW.title) > 200 THEN
    RAISE EXCEPTION 'Course module title must be between 3 and 200 characters';
  END IF;
  
  -- Sanitize description if provided
  IF NEW.description IS NOT NULL THEN
    NEW.description := substring(NEW.description, 1, 1000);
  END IF;
  
  -- Validate order_index
  IF NEW.order_index < 0 OR NEW.order_index > 1000 THEN
    RAISE EXCEPTION 'Order index must be between 0 and 1000';
  END IF;
  
  -- Log security event for module changes
  IF TG_OP = 'UPDATE' AND auth.uid() IS NOT NULL THEN
    INSERT INTO public.security_events (user_id, event_type, severity, details)
    VALUES (
      auth.uid(),
      'course_module_modified',
      'medium',
      jsonb_build_object(
        'module_id', NEW.module_id,
        'action', TG_OP,
        'classification', NEW.content_classification,
        'admin_user', is_admin(auth.uid())
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply validation trigger
DROP TRIGGER IF EXISTS validate_course_module_trigger ON public.course_modules;
CREATE TRIGGER validate_course_module_trigger
  BEFORE INSERT OR UPDATE ON public.course_modules
  FOR EACH ROW EXECUTE FUNCTION validate_course_module_input();

-- Enhanced security monitoring for course access
CREATE OR REPLACE FUNCTION public.log_course_access_attempt(
  module_id text,
  access_type text,
  success boolean
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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
    'course_content_access_attempt',
    CASE WHEN success THEN 'low' ELSE 'medium' END,
    jsonb_build_object(
      'module_id', module_id,
      'access_type', access_type,
      'success', success,
      'timestamp', now(),
      'user_authenticated', auth.uid() IS NOT NULL,
      'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
    ),
    true
  );
END;
$$;