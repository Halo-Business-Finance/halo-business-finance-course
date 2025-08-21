-- Enhanced profiles table security with comprehensive audit logging (corrected)

-- 1. Add enhanced security logging for profile modifications (not SELECT)
CREATE OR REPLACE FUNCTION public.log_profile_modifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Log all profile modifications by admins (modifying other users' data)
  IF auth.uid() != COALESCE(NEW.user_id, OLD.user_id) AND is_admin(auth.uid()) THEN
    -- Log detailed modification information
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
        'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for',
        'old_values', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        'new_values', CASE WHEN TG_OP IN ('UPDATE', 'INSERT') THEN row_to_json(NEW) ELSE NULL END
      ),
      'confidential'
    );

    -- Create security alert for unauthorized modifications
    PERFORM create_security_alert(
      'admin_profile_modification',
      'high', 
      'Admin Modified Customer Profile Data',
      format('Admin %s performed %s operation on profile for user %s. Review for policy compliance.', 
             auth.uid(), TG_OP, COALESCE(NEW.user_id, OLD.user_id)),
      jsonb_build_object(
        'admin_user_id', auth.uid(),
        'target_user_id', COALESCE(NEW.user_id, OLD.user_id),
        'operation', TG_OP,
        'risk_level', 'high',
        'requires_review', true
      )
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create trigger for profile modifications only
DROP TRIGGER IF EXISTS trigger_log_profile_modifications ON public.profiles;
CREATE TRIGGER trigger_log_profile_modifications
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION log_profile_modifications();

-- 3. Add function to validate and log sensitive data access
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

  -- User accessing own data - allowed without logging
  IF auth.uid() = target_user_id THEN
    RETURN true;
  END IF;

  -- Admin accessing other user's data - log and allow
  IF is_admin(auth.uid()) THEN
    -- Log admin access to sensitive customer data
    PERFORM log_sensitive_data_access('profiles', target_user_id, 'Administrative profile access');
    
    -- Log to admin audit trail with enhanced details
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
        'sensitive_fields_accessed', ARRAY['email', 'phone', 'name', 'location', 'company'],
        'security_classification', 'confidential',
        'reason', 'administrative_review',
        'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
      ),
      'confidential'
    );

    RETURN true;
  END IF;

  -- Access denied - log security event
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'unauthorized_profile_access_attempt',
    'critical',
    jsonb_build_object(
      'attempted_target', target_user_id,
      'requesting_user', auth.uid(),
      'timestamp', now(),
      'access_denied_reason', 'insufficient_permissions',
      'security_threat_level', 'high'
    ),
    auth.uid()
  );

  -- Create immediate security alert
  PERFORM create_security_alert(
    'unauthorized_customer_data_access',
    'critical',
    'Unauthorized Access to Customer Personal Data',
    format('User %s attempted unauthorized access to customer profile %s. Immediate investigation required.', 
           auth.uid(), target_user_id),
    jsonb_build_object(
      'requesting_user', auth.uid(),
      'target_user', target_user_id,
      'threat_level', 'critical',
      'requires_immediate_investigation', true
    )
  );

  RETURN false;
END;
$$;

-- 4. Enhanced RLS policy with comprehensive security validation
DROP POLICY IF EXISTS "Users can view own profile data" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles with logging" ON public.profiles;

CREATE POLICY "Secure profile access with mandatory logging" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (
  -- Validate access permissions and log sensitive data access
  validate_sensitive_profile_access(user_id)
);

-- 5. Function to monitor and alert on suspicious profile access patterns
CREATE OR REPLACE FUNCTION public.monitor_profile_access_patterns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  suspicious_admin RECORD;
  bulk_access_admin RECORD;
BEGIN
  -- Check for admins accessing too many profiles (data scraping detection)
  FOR bulk_access_admin IN
    SELECT 
      admin_user_id,
      COUNT(DISTINCT target_user_id) as unique_profiles_accessed,
      COUNT(*) as total_access_count,
      MIN(created_at) as first_access,
      MAX(created_at) as last_access
    FROM admin_audit_log 
    WHERE action = 'profile_sensitive_data_view'
      AND created_at > now() - interval '1 hour'
    GROUP BY admin_user_id
    HAVING COUNT(DISTINCT target_user_id) >= 10
  LOOP
    -- Create critical security alert for potential data breach
    PERFORM create_security_alert(
      'potential_customer_data_breach',
      'critical',
      'Potential Customer Data Breach - Bulk Profile Access',
      format('URGENT: Admin %s accessed %s different customer profiles in 1 hour. Investigate immediately for data breach.', 
             bulk_access_admin.admin_user_id, 
             bulk_access_admin.unique_profiles_accessed),
      jsonb_build_object(
        'admin_user_id', bulk_access_admin.admin_user_id,
        'profiles_accessed', bulk_access_admin.unique_profiles_accessed,
        'total_operations', bulk_access_admin.total_access_count,
        'time_window', '1_hour',
        'threat_level', 'critical',
        'potential_data_breach', true,
        'requires_immediate_action', true
      )
    );
  END LOOP;

  -- Check for unusual access times (off-hours access)
  FOR suspicious_admin IN
    SELECT 
      admin_user_id,
      COUNT(*) as access_count,
      MIN(created_at) as first_access,
      MAX(created_at) as last_access
    FROM admin_audit_log 
    WHERE action = 'profile_sensitive_data_view'
      AND created_at > now() - interval '24 hours'
      AND (
        EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC') < 8 
        OR EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC') > 20
        OR EXTRACT(DOW FROM created_at) IN (0, 6) -- Weekend access
      )
    GROUP BY admin_user_id
    HAVING COUNT(*) >= 5
  LOOP
    -- Create alert for suspicious timing
    PERFORM create_security_alert(
      'suspicious_off_hours_access',
      'high',
      'Suspicious Off-Hours Customer Data Access',
      format('Admin %s accessed customer profiles %s times during off-hours/weekends. Review access justification.', 
             suspicious_admin.admin_user_id, 
             suspicious_admin.access_count),
      jsonb_build_object(
        'admin_user_id', suspicious_admin.admin_user_id,
        'access_count', suspicious_admin.access_count,
        'access_pattern', 'off_hours',
        'risk_level', 'high',
        'requires_justification', true
      )
    );
  END LOOP;
END;
$$;

-- 6. Create scheduled monitoring function (to be called periodically)
CREATE OR REPLACE FUNCTION public.run_customer_data_security_monitoring()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Run pattern monitoring
  PERFORM monitor_profile_access_patterns();
  
  -- Log monitoring execution
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'customer_data_security_monitoring_executed',
    'low',
    jsonb_build_object(
      'timestamp', now(),
      'monitoring_type', 'profile_access_patterns',
      'status', 'completed'
    )
  );
END;
$$;