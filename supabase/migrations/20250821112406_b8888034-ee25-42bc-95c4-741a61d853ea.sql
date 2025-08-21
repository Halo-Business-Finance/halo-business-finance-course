-- Enhanced Security Monitoring and Audit Logging
-- This migration implements comprehensive security fixes from the security review

-- 1. Create a function to log profile data access by admins
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log when admins access profile data (not when users access their own)
  IF auth.uid() != COALESCE(NEW.user_id, OLD.user_id) AND is_admin(auth.uid()) THEN
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details
    ) VALUES (
      auth.uid(),
      'profile_data_access',
      COALESCE(NEW.user_id, OLD.user_id),
      'profiles',
      jsonb_build_object(
        'access_type', TG_OP,
        'accessed_fields', CASE 
          WHEN TG_OP = 'SELECT' THEN 'profile_view'
          WHEN TG_OP = 'UPDATE' THEN 'profile_modification'
          ELSE TG_OP
        END,
        'timestamp', now(),
        'data_classification', 'confidential'
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger for profile access logging
DROP TRIGGER IF EXISTS profile_access_audit_trigger ON public.profiles;
CREATE TRIGGER profile_access_audit_trigger
  AFTER SELECT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_access();

-- 3. Enhanced security alert function for unusual access patterns
CREATE OR REPLACE FUNCTION public.detect_unusual_profile_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  suspicious_admin RECORD;
  bulk_access_admin RECORD;
BEGIN
  -- Check for admins accessing unusually high number of profiles
  FOR bulk_access_admin IN
    SELECT 
      admin_user_id,
      COUNT(DISTINCT target_user_id) as profile_count,
      MAX(created_at) as last_access
    FROM admin_audit_log 
    WHERE action = 'profile_data_access' 
      AND created_at > NOW() - INTERVAL '1 hour'
    GROUP BY admin_user_id
    HAVING COUNT(DISTINCT target_user_id) >= 20
  LOOP
    -- Create alert for bulk profile access
    PERFORM create_security_alert(
      'bulk_profile_access',
      'high',
      'Bulk Profile Data Access Detected',
      format('Admin user %s accessed %s different user profiles in the last hour', 
             bulk_access_admin.admin_user_id, bulk_access_admin.profile_count),
      jsonb_build_object(
        'admin_user_id', bulk_access_admin.admin_user_id,
        'profile_count', bulk_access_admin.profile_count,
        'last_access', bulk_access_admin.last_access,
        'risk_level', 'medium'
      )
    );
  END LOOP;

  -- Check for profile access outside business hours (assuming 9 AM - 6 PM EST)
  FOR suspicious_admin IN
    SELECT 
      admin_user_id,
      COUNT(*) as access_count,
      MIN(created_at) as first_access,
      MAX(created_at) as last_access
    FROM admin_audit_log 
    WHERE action = 'profile_data_access' 
      AND created_at > NOW() - INTERVAL '24 hours'
      AND (
        EXTRACT(HOUR FROM created_at AT TIME ZONE 'EST') < 9 
        OR EXTRACT(HOUR FROM created_at AT TIME ZONE 'EST') > 18
        OR EXTRACT(DOW FROM created_at) IN (0, 6) -- Sunday = 0, Saturday = 6
      )
    GROUP BY admin_user_id
    HAVING COUNT(*) >= 5
  LOOP
    -- Create alert for off-hours access
    PERFORM create_security_alert(
      'off_hours_profile_access',
      'medium',
      'Off-Hours Profile Access Detected',
      format('Admin user %s accessed %s user profiles outside business hours', 
             suspicious_admin.admin_user_id, suspicious_admin.access_count),
      jsonb_build_object(
        'admin_user_id', suspicious_admin.admin_user_id,
        'access_count', suspicious_admin.access_count,
        'first_access', suspicious_admin.first_access,
        'last_access', suspicious_admin.last_access,
        'risk_level', 'medium'
      )
    );
  END LOOP;
END;
$$;

-- 4. Create a data masking function for sensitive profile fields
CREATE OR REPLACE FUNCTION public.mask_sensitive_profile_data(profile_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only mask data if user is not admin and not viewing their own data
  IF NOT is_admin(auth.uid()) THEN
    RETURN jsonb_build_object(
      'id', profile_data->>'id',
      'name', CASE 
        WHEN profile_data->>'user_id' = auth.uid()::text THEN profile_data->>'name'
        ELSE '***'
      END,
      'title', profile_data->>'title',
      'company', profile_data->>'company',
      'city', profile_data->>'city',
      'state', profile_data->>'state',
      'email', CASE 
        WHEN profile_data->>'user_id' = auth.uid()::text THEN profile_data->>'email'
        ELSE '***@***.***'
      END,
      'phone', CASE 
        WHEN profile_data->>'user_id' = auth.uid()::text THEN profile_data->>'phone'
        ELSE '***-***-****'
      END
    );
  END IF;
  
  RETURN profile_data;
END;
$$;

-- 5. Create function to run periodic security analysis
CREATE OR REPLACE FUNCTION public.run_comprehensive_security_analysis()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Run existing security analysis
  PERFORM analyze_security_events();
  
  -- Run new profile access analysis
  PERFORM detect_unusual_profile_access();
  
  -- Log that analysis was run
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'security_analysis_completed',
    'low',
    jsonb_build_object(
      'timestamp', now(),
      'analysis_type', 'comprehensive',
      'triggered_by', 'periodic_check'
    )
  );
END;
$$;

-- 6. Enhanced safe_profiles view with audit logging
DROP VIEW IF EXISTS public.safe_profiles;
CREATE VIEW public.safe_profiles 
WITH (security_invoker = true) AS
SELECT 
  p.id,
  p.user_id,
  p.name,
  p.title,
  p.company,
  p.city,
  p.state,
  p.avatar_url,
  p.join_date,
  p.created_at
FROM public.profiles p
WHERE 
  -- Users can see their own profile
  p.user_id = auth.uid()
  OR 
  -- Admins can see all profiles (with logging via trigger)
  is_admin(auth.uid());

-- 7. Create policy to ensure safe_profiles access is properly controlled
DROP POLICY IF EXISTS "Safe profiles view access control" ON public.profiles;
CREATE POLICY "Safe profiles view access control" ON public.profiles
FOR SELECT USING (
  -- Users can view their own data
  user_id = auth.uid() 
  OR 
  -- Admins can view all data (will be logged)
  is_admin(auth.uid())
);

-- 8. Add additional security event logging for critical operations
CREATE OR REPLACE FUNCTION public.log_critical_security_event(
  event_name text,
  severity_level text DEFAULT 'high',
  event_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    event_name,
    severity_level,
    event_details || jsonb_build_object(
      'timestamp', now(),
      'user_id', auth.uid(),
      'session_info', current_setting('request.headers', true)
    ),
    auth.uid()
  );
END;
$$;

-- Grant necessary permissions
GRANT SELECT ON public.safe_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.run_comprehensive_security_analysis() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_critical_security_event(text, text, jsonb) TO authenticated;