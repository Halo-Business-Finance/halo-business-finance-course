-- Enhance profiles table security with comprehensive audit logging and data classification

-- 1. Add enhanced security logging for profile access
CREATE OR REPLACE FUNCTION public.log_profile_access_enhanced()
RETURNS TRIGGER AS $$
BEGIN
  -- Log all profile access by admins (viewing other users' data)
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
        WHEN 'SELECT' THEN 'profile_sensitive_data_view'
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
        'reason', 'administrative_access',
        'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
      ),
      'confidential'
    );

    -- Create security alert for bulk access patterns
    IF TG_OP = 'SELECT' THEN
      -- Check if this admin has accessed many profiles recently (potential data scraping)
      PERFORM create_security_alert(
        'bulk_profile_access_detected',
        'medium', 
        'Potential Bulk Profile Data Access',
        format('Admin %s accessed profile data for user %s. Monitor for data scraping patterns.', 
               auth.uid(), COALESCE(NEW.user_id, OLD.user_id)),
        jsonb_build_object(
          'admin_user_id', auth.uid(),
          'target_user_id', COALESCE(NEW.user_id, OLD.user_id),
          'access_pattern', 'profile_view',
          'risk_level', 'medium'
        )
      ) WHERE (
        SELECT COUNT(DISTINCT target_user_id) 
        FROM admin_audit_log 
        WHERE admin_user_id = auth.uid() 
          AND action = 'profile_sensitive_data_view'
          AND created_at > now() - interval '1 hour'
      ) >= 10;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create trigger for enhanced profile access logging
DROP TRIGGER IF EXISTS trigger_log_profile_access_enhanced ON public.profiles;
CREATE TRIGGER trigger_log_profile_access_enhanced
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION log_profile_access_enhanced();

-- 3. Add function to validate sensitive data access permissions
CREATE OR REPLACE FUNCTION public.validate_sensitive_profile_access(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow access if user is viewing their own data or is admin
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'SECURITY_VIOLATION: Authentication required for profile access'
      USING ERRCODE = '42501';
  END IF;

  IF auth.uid() = target_user_id THEN
    RETURN true; -- User accessing own data
  END IF;

  IF is_admin(auth.uid()) THEN
    -- Log admin access to sensitive data
    PERFORM log_sensitive_data_access('profiles', target_user_id, 'Administrative profile review');
    RETURN true;
  END IF;

  -- Access denied - log security event
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'unauthorized_profile_access_attempt',
    'high',
    jsonb_build_object(
      'attempted_target', target_user_id,
      'requesting_user', auth.uid(),
      'timestamp', now(),
      'access_denied_reason', 'insufficient_permissions'
    ),
    auth.uid()
  );

  RETURN false;
END;
$$;

-- 4. Add enhanced RLS policy with additional security checks
DROP POLICY IF EXISTS "Enhanced security for profile viewing" ON public.profiles;
CREATE POLICY "Enhanced security for profile viewing" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (
  -- Users can view their own profile
  auth.uid() = user_id 
  OR 
  -- Admins can view profiles with mandatory logging
  (is_admin(auth.uid()) AND validate_sensitive_profile_access(user_id))
);

-- 5. Create function to monitor suspicious profile access patterns
CREATE OR REPLACE FUNCTION public.monitor_profile_access_patterns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  suspicious_admin RECORD;
BEGIN
  -- Check for admins with unusual access patterns
  FOR suspicious_admin IN
    SELECT 
      admin_user_id,
      COUNT(*) as access_count,
      COUNT(DISTINCT target_user_id) as unique_profiles_accessed,
      MIN(created_at) as first_access,
      MAX(created_at) as last_access
    FROM admin_audit_log 
    WHERE action LIKE 'profile_%'
      AND created_at > now() - interval '24 hours'
    GROUP BY admin_user_id
    HAVING COUNT(*) > 50 OR COUNT(DISTINCT target_user_id) > 25
  LOOP
    -- Create high-priority security alert
    PERFORM create_security_alert(
      'suspicious_profile_access_pattern',
      'high',
      'Suspicious Profile Access Pattern Detected',
      format('Admin %s accessed %s profiles (%s total operations) in 24 hours. Investigate for potential data breach.', 
             suspicious_admin.admin_user_id, 
             suspicious_admin.unique_profiles_accessed,
             suspicious_admin.access_count),
      jsonb_build_object(
        'admin_user_id', suspicious_admin.admin_user_id,
        'access_count', suspicious_admin.access_count,
        'unique_profiles', suspicious_admin.unique_profiles_accessed,
        'time_window', '24_hours',
        'risk_level', 'high',
        'requires_investigation', true
      )
    );
  END LOOP;
END;
$$;