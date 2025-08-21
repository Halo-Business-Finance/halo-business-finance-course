-- Enhanced profiles security - Final corrected version

-- 1. Create enhanced security logging function for profile modifications
CREATE OR REPLACE FUNCTION public.log_profile_modifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Log all profile modifications by admins accessing other users' data
  IF TG_OP != 'SELECT' AND auth.uid() != COALESCE(NEW.user_id, OLD.user_id) AND is_admin(auth.uid()) THEN
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details,
      data_classification
    ) VALUES (
      auth.uid(),
      format('profile_sensitive_data_%s', lower(TG_OP)),
      COALESCE(NEW.user_id, OLD.user_id),
      'profiles',
      jsonb_build_object(
        'operation', TG_OP,
        'timestamp', now(),
        'sensitive_fields', ARRAY['email', 'phone', 'name', 'location', 'company'],
        'data_classification', 'confidential',
        'admin_reason', 'administrative_operation'
      ),
      'confidential'
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create trigger for profile modifications logging
DROP TRIGGER IF EXISTS trigger_profile_modifications_audit ON public.profiles;
CREATE TRIGGER trigger_profile_modifications_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION log_profile_modifications();

-- 3. Enhanced validation function with comprehensive logging
CREATE OR REPLACE FUNCTION public.secure_profile_access(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  access_count INTEGER;
BEGIN
  -- Require authentication for all profile access
  IF auth.uid() IS NULL THEN
    INSERT INTO public.security_events (event_type, severity, details)
    VALUES (
      'unauthenticated_profile_access_attempt',
      'critical',
      jsonb_build_object('attempted_target', target_user_id, 'timestamp', now())
    );
    RETURN false;
  END IF;

  -- Users can access their own profiles
  IF auth.uid() = target_user_id THEN
    RETURN true;
  END IF;

  -- Admin access with comprehensive logging and monitoring
  IF is_admin(auth.uid()) THEN
    -- Log every admin access to customer sensitive data
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details,
      data_classification
    ) VALUES (
      auth.uid(),
      'profile_customer_data_access',
      target_user_id,
      'profiles',
      jsonb_build_object(
        'access_type', 'customer_pii_view',
        'timestamp', now(),
        'sensitive_data_fields', ARRAY['email', 'phone', 'name', 'location', 'company'],
        'data_classification', 'confidential',
        'compliance_note', 'admin_accessing_customer_pii'
      ),
      'confidential'
    );

    -- Check for suspicious access patterns (potential data scraping)
    SELECT COUNT(*) INTO access_count
    FROM admin_audit_log
    WHERE admin_user_id = auth.uid()
      AND action = 'profile_customer_data_access'
      AND created_at > now() - interval '1 hour';

    -- Alert if admin accessing too many profiles (potential breach)
    IF access_count >= 15 THEN
      PERFORM create_security_alert(
        'potential_data_breach_detected',
        'critical',
        'Potential Customer Data Breach - Excessive Profile Access',
        format('SECURITY ALERT: Admin %s has accessed %s customer profiles in the last hour. This may indicate unauthorized data scraping or a potential security breach. Immediate investigation required.', 
               auth.uid(), access_count),
        jsonb_build_object(
          'admin_user_id', auth.uid(),
          'profile_access_count', access_count,
          'time_window', '1_hour',
          'alert_level', 'critical',
          'requires_immediate_attention', true,
          'potential_gdpr_violation', true
        )
      );
    END IF;

    RETURN true;
  END IF;

  -- Unauthorized access attempt - log as security incident
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'unauthorized_customer_data_access',
    'critical',
    jsonb_build_object(
      'attempted_target_profile', target_user_id,
      'unauthorized_user', auth.uid(),
      'timestamp', now(),
      'violation_type', 'customer_pii_access_denied',
      'potential_compliance_issue', true
    ),
    auth.uid()
  );

  RETURN false;
END;
$$;

-- 4. Replace existing SELECT policy with enhanced security
DROP POLICY IF EXISTS "Admins can view all profiles with logging" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile data" ON public.profiles;

CREATE POLICY "Enhanced secure customer profile access" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (secure_profile_access(user_id));