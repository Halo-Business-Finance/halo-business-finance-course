-- Fix the security definer view issue by removing it and using RLS policies instead

-- Drop the security definer view
DROP VIEW IF EXISTS public.admin_mfa_overview;

-- Create a secure function that returns masked MFA data for admins
CREATE OR REPLACE FUNCTION public.get_admin_mfa_overview()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  method_type TEXT,
  method_name TEXT,
  is_enabled BOOLEAN,
  is_primary BOOLEAN,
  trust_level INTEGER,
  compliance_level TEXT,
  device_bound BOOLEAN,
  hardware_key_id TEXT,
  certificate_fingerprint TEXT,
  failure_count INTEGER,
  last_used_at TIMESTAMP WITH TIME ZONE,
  enrolled_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  secret_key_masked TEXT,
  backup_codes_masked TEXT[],
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can call this function
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Log admin access to MFA overview
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'mfa_overview_access',
    'enhanced_mfa',
    jsonb_build_object(
      'access_type', 'admin_mfa_overview',
      'timestamp', NOW(),
      'security_classification', 'restricted'
    ),
    'restricted'
  );

  RETURN QUERY
  SELECT 
    m.id,
    m.user_id,
    m.method_type,
    m.method_name,
    m.is_enabled,
    m.is_primary,
    m.trust_level,
    m.compliance_level,
    m.device_bound,
    m.hardware_key_id,
    m.certificate_fingerprint,
    m.failure_count,
    m.last_used_at,
    m.enrolled_at,
    m.expires_at,
    m.created_at,
    m.updated_at,
    -- Always mask sensitive fields for admin access
    '***MASKED***'::TEXT as secret_key_masked,
    ARRAY['***MASKED***']::TEXT[] as backup_codes_masked,
    m.metadata
  FROM public.enhanced_mfa m;
END;
$$;

-- Create additional policy for super admin access to masked MFA data
CREATE POLICY "Super admins can view MFA for administration" 
ON public.enhanced_mfa 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
  AND auth.uid() != enhanced_mfa.user_id  -- Only for other users, not their own
);