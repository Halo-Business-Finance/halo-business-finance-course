-- Phase 1: Critical PII Protection - Fix Conflicting RLS Policies on profiles table

-- Drop the conflicting policy that blocks all access
DROP POLICY IF EXISTS "Profiles only accessible via secure functions" ON public.profiles;

-- Ensure we have proper RLS policies for profiles table
-- Keep the existing secure policies but make them consistent

-- Update the secure profile access policy to be more explicit
DROP POLICY IF EXISTS "Admins can view profiles with logging" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles with logging" ON public.profiles;

-- Create consolidated RLS policies for profiles table
CREATE POLICY "Users can view own profile securely" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile securely" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view profiles with mandatory logging" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  (is_admin(auth.uid()) AND validate_sensitive_profile_access(user_id))
);

CREATE POLICY "Admins can update profiles with mandatory logging" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR 
  (is_admin(auth.uid()) AND validate_sensitive_profile_access(user_id))
)
WITH CHECK (
  auth.uid() = user_id 
  OR 
  (is_admin(auth.uid()) AND validate_sensitive_profile_access(user_id))
);

-- Drop the insecure secure_user_profiles table since it's a duplicate with no RLS
DROP TABLE IF EXISTS public.secure_user_profiles CASCADE;

-- Create enhanced PII access monitoring function
CREATE OR REPLACE FUNCTION public.log_pii_access_comprehensive(
  accessed_user_id uuid, 
  access_type text, 
  fields_accessed text[] DEFAULT NULL,
  access_reason text DEFAULT 'general_access'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log all PII access attempts with enhanced details
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    details
  ) VALUES (
    auth.uid(),
    'pii_access_comprehensive',
    CASE 
      WHEN auth.uid() = accessed_user_id THEN 'low'
      WHEN is_admin(auth.uid()) THEN 'medium'
      ELSE 'critical'
    END,
    jsonb_build_object(
      'accessed_user_id', accessed_user_id,
      'access_type', access_type,
      'fields_accessed', COALESCE(fields_accessed, ARRAY['profile_data']),
      'access_reason', access_reason,
      'timestamp', now(),
      'authorized', auth.uid() = accessed_user_id OR is_admin(auth.uid()),
      'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for',
      'session_info', current_setting('request.jwt.claims', true)::json
    )
  );
  
  -- Enhanced admin audit logging for PII access
  IF is_admin(auth.uid()) AND auth.uid() != accessed_user_id THEN
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details,
      data_classification
    ) VALUES (
      auth.uid(),
      'pii_access_comprehensive_admin',
      accessed_user_id,
      'profiles_pii_data',
      jsonb_build_object(
        'access_type', access_type,
        'fields_accessed', COALESCE(fields_accessed, ARRAY['profile_data']),
        'access_reason', access_reason,
        'timestamp', now(),
        'compliance_note', 'admin_accessing_customer_pii_with_enhanced_logging',
        'security_classification', 'confidential_pii'
      ),
      'confidential'
    );
  END IF;
  
  -- Create security alert for unauthorized access attempts
  IF NOT (auth.uid() = accessed_user_id OR is_admin(auth.uid())) THEN
    PERFORM create_security_alert(
      'unauthorized_pii_access_enhanced',
      'critical',
      'Critical: Unauthorized PII Access Attempt Detected',
      format('SECURITY BREACH: User %s attempted unauthorized access to PII for user %s. Fields: %s. Immediate investigation required.', 
             auth.uid(), accessed_user_id, array_to_string(COALESCE(fields_accessed, ARRAY['unknown']), ', ')),
      jsonb_build_object(
        'unauthorized_user', auth.uid(),
        'target_user', accessed_user_id,
        'fields_attempted', COALESCE(fields_accessed, ARRAY['unknown']),
        'access_type', access_type,
        'threat_level', 'critical',
        'requires_immediate_investigation', true,
        'potential_gdpr_violation', true,
        'automatic_response_recommended', true
      )
    );
  END IF;
END;
$$;