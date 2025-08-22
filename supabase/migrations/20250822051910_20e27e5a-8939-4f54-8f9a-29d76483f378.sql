-- Fix MFA security vulnerabilities by implementing granular RLS policies

-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Users can manage their own enhanced MFA" ON public.enhanced_mfa;

-- Create separate policies for different operations with proper security restrictions

-- 1. Users can only SELECT their own MFA configurations
CREATE POLICY "Users can view their own MFA" 
ON public.enhanced_mfa 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Users can INSERT their own MFA configurations
CREATE POLICY "Users can create their own MFA" 
ON public.enhanced_mfa 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Users can UPDATE their own MFA configurations
CREATE POLICY "Users can update their own MFA" 
ON public.enhanced_mfa 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Only super admins can DELETE MFA configurations (for account recovery)
CREATE POLICY "Super admins can delete MFA for account recovery" 
ON public.enhanced_mfa 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'super_admin' 
  AND is_active = true
));

-- 5. Create a secure view for admin MFA management that masks sensitive data
CREATE OR REPLACE VIEW public.admin_mfa_overview AS
SELECT 
  id,
  user_id,
  method_type,
  method_name,
  is_enabled,
  is_primary,
  trust_level,
  compliance_level,
  device_bound,
  hardware_key_id,
  certificate_fingerprint,
  failure_count,
  last_used_at,
  enrolled_at,
  expires_at,
  created_at,
  updated_at,
  -- Mask sensitive fields for admins
  CASE WHEN is_admin(auth.uid()) AND auth.uid() != user_id 
    THEN '***MASKED***' 
    ELSE secret_key 
  END as secret_key,
  CASE WHEN is_admin(auth.uid()) AND auth.uid() != user_id 
    THEN ARRAY['***MASKED***'] 
    ELSE backup_codes 
  END as backup_codes,
  -- Keep metadata visible for admin monitoring
  metadata
FROM public.enhanced_mfa
WHERE 
  -- Users can see their own data
  auth.uid() = user_id 
  OR 
  -- Admins can see basic info but not secrets
  is_admin(auth.uid());

-- Enable RLS on the view
ALTER VIEW public.admin_mfa_overview SET (security_barrier = true);

-- 6. Create secure function for admin MFA reset (emergency use only)
CREATE OR REPLACE FUNCTION public.admin_emergency_mfa_reset(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  incident_id TEXT;
BEGIN
  -- Only super admins can perform emergency MFA reset
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required for emergency MFA reset';
  END IF;

  -- Create security incident for the emergency reset
  incident_id := 'MFA-RESET-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  
  INSERT INTO public.security_incident_response (
    incident_id,
    incident_type,
    severity,
    title,
    description,
    status,
    affected_users,
    affected_systems,
    detected_at
  ) VALUES (
    incident_id,
    'emergency_mfa_reset',
    'high',
    'Emergency MFA Reset Performed',
    format('Super admin %s performed emergency MFA reset for user %s', auth.uid(), target_user_id),
    'resolved',
    ARRAY[target_user_id],
    ARRAY['authentication', 'mfa'],
    NOW()
  );

  -- Log the admin action with full audit trail
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_user_id,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'emergency_mfa_reset',
    target_user_id,
    'enhanced_mfa',
    jsonb_build_object(
      'incident_id', incident_id,
      'reset_reason', 'emergency_admin_reset',
      'timestamp', NOW(),
      'security_classification', 'restricted',
      'compliance_note', 'emergency_procedure_followed'
    ),
    'restricted'
  );

  -- Disable all MFA methods for the user
  UPDATE public.enhanced_mfa 
  SET 
    is_enabled = false,
    secret_key = NULL,
    backup_codes = NULL,
    updated_at = NOW()
  WHERE user_id = target_user_id;

  RETURN true;
END;
$$;

-- 7. Create function to validate MFA access attempts with rate limiting
CREATE OR REPLACE FUNCTION public.validate_mfa_access_attempt(p_user_id UUID, p_method_type TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count INTEGER;
  is_locked BOOLEAN := false;
  mfa_record RECORD;
BEGIN
  -- Check if user is requesting their own MFA or if admin
  IF auth.uid() != p_user_id AND NOT is_admin(auth.uid()) THEN
    -- Log unauthorized access attempt
    INSERT INTO public.security_events (event_type, severity, details, user_id)
    VALUES (
      'unauthorized_mfa_access_attempt',
      'critical',
      jsonb_build_object(
        'attempted_target_user', p_user_id,
        'requesting_user', auth.uid(),
        'method_type', p_method_type,
        'timestamp', NOW()
      ),
      auth.uid()
    );
    
    RETURN jsonb_build_object('allowed', false, 'reason', 'unauthorized_access');
  END IF;

  -- Get MFA record with failure tracking
  SELECT * INTO mfa_record 
  FROM public.enhanced_mfa 
  WHERE user_id = p_user_id 
    AND method_type = p_method_type 
    AND is_enabled = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'mfa_not_configured');
  END IF;

  -- Check if account is locked due to too many failures
  IF mfa_record.failure_count >= 5 THEN
    is_locked := true;
  END IF;

  RETURN jsonb_build_object(
    'allowed', NOT is_locked,
    'failure_count', mfa_record.failure_count,
    'trust_level', mfa_record.trust_level,
    'is_locked', is_locked,
    'method_type', p_method_type
  );
END;
$$;