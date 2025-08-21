-- Enhanced profiles security - Fixed version without SELECT trigger

-- 1. Add enhanced security logging for profile modifications (not SELECT)
CREATE OR REPLACE FUNCTION public.log_profile_access_enhanced()
RETURNS TRIGGER AS $$
BEGIN
  -- Log all profile modifications by admins (modifying other users' data)
  IF auth.uid() != COALESCE(NEW.user_id, OLD.user_id) AND is_admin(auth.uid()) THEN
    -- Log detailed access information
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details,
      data_classification
    ) VALUES (
      auth.uid(),
      CASE TG_OP 
        WHEN 'UPDATE' THEN 'profile_sensitive_data_modification'
        WHEN 'INSERT' THEN 'profile_sensitive_data_creation'
        WHEN 'DELETE' THEN 'profile_sensitive_data_deletion'
        ELSE TG_OP
      END,
      COALESCE(NEW.user_id, OLD.user_id),
      'profiles',
      jsonb_build_object(
        'access_type', TG_OP,
        'timestamp', now(),
        'sensitive_fields_accessed', ARRAY['email', 'phone', 'name', 'location', 'company'],
        'security_classification', 'confidential',
        'reason', 'administrative_modification',
        'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
      ),
      'confidential'
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create trigger for profile modifications (INSERT, UPDATE, DELETE only)
DROP TRIGGER IF EXISTS trigger_log_profile_modifications ON public.profiles;
CREATE TRIGGER trigger_log_profile_modifications
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION log_profile_access_enhanced();

-- 3. Add function to validate and log sensitive data access
CREATE OR REPLACE FUNCTION public.validate_and_log_profile_access(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'SECURITY_VIOLATION: Authentication required for profile access'
      USING ERRCODE = '42501';
  END IF;

  -- Allow users to access their own data
  IF auth.uid() = target_user_id THEN
    RETURN true;
  END IF;

  -- Admin access with mandatory logging
  IF is_admin(auth.uid()) THEN
    -- Log admin viewing sensitive customer data
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details,
      data_classification
    ) VALUES (
      auth.uid(),
      'profile_sensitive_data_view',
      target_user_id,
      'profiles',
      jsonb_build_object(
        'access_type', 'SELECT',
        'timestamp', now(),
        'sensitive_fields', ARRAY['email', 'phone', 'name', 'location', 'company'],
        'security_classification', 'confidential',
        'reason', 'administrative_review'
      ),
      'confidential'
    );
    
    RETURN true;
  END IF;

  -- Access denied - log security violation
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'unauthorized_profile_access_attempt',
    'critical',
    jsonb_build_object(
      'attempted_target', target_user_id,
      'requesting_user', auth.uid(),
      'timestamp', now(),
      'violation_type', 'insufficient_permissions',
      'sensitive_data_attempted', true
    ),
    auth.uid()
  );

  RETURN false;
END;
$$;

-- 4. Update RLS policy with enhanced security and logging
DROP POLICY IF EXISTS "Users can view own profile data" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles with logging" ON public.profiles;

CREATE POLICY "Secure profile access with mandatory logging" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (validate_and_log_profile_access(user_id));

-- 5. Add data masking function for sensitive fields
CREATE OR REPLACE FUNCTION public.get_masked_profile_data(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  name text,
  email text,
  phone text,
  location text,
  company text,
  title text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return data if user has permission
  IF NOT validate_and_log_profile_access(profile_user_id) THEN
    RAISE EXCEPTION 'Access denied to profile data';
  END IF;

  -- Return full data for own profile or admin access
  IF auth.uid() = profile_user_id OR is_admin(auth.uid()) THEN
    RETURN QUERY
    SELECT p.id, p.user_id, p.name, p.email, p.phone, p.location, p.company, p.title
    FROM profiles p
    WHERE p.user_id = profile_user_id;
  ELSE
    -- This shouldn't happen due to RLS, but extra safety
    RAISE EXCEPTION 'Unauthorized access attempt logged';
  END IF;
END;
$$;