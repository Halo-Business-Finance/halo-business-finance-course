-- Fix security warnings

-- 1. Add RLS policy for "Halo Launch Pad Learn" table
CREATE POLICY "Allow authenticated users to read course data" 
ON public."Halo Launch Pad Learn" 
FOR SELECT 
TO authenticated
USING (true);

-- 2. Fix function search_path for security
CREATE OR REPLACE FUNCTION public.assign_user_role(
  p_target_user_id UUID,
  p_new_role TEXT,
  p_reason TEXT DEFAULT 'Role assignment',
  p_mfa_verified BOOLEAN DEFAULT false
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller has admin privileges
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin') 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Insert or update user role
  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (p_target_user_id, p_new_role, true)
  ON CONFLICT (user_id, role) 
  DO UPDATE SET is_active = true, updated_at = now();

  -- Log security event
  INSERT INTO public.security_events (user_id, event_type, severity, details)
  VALUES (auth.uid(), 'role_assigned', 'medium', jsonb_build_object(
    'target_user_id', p_target_user_id,
    'assigned_role', p_new_role,
    'reason', p_reason
  ));

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_user_role(
  p_target_user_id UUID,
  p_reason TEXT DEFAULT 'Role revocation',
  p_mfa_verified BOOLEAN DEFAULT false
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller has admin privileges
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin') 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Deactivate user roles
  UPDATE public.user_roles 
  SET is_active = false, updated_at = now()
  WHERE user_id = p_target_user_id;

  -- Log security event
  INSERT INTO public.security_events (user_id, event_type, severity, details)
  VALUES (auth.uid(), 'role_revoked', 'high', jsonb_build_object(
    'target_user_id', p_target_user_id,
    'reason', p_reason
  ));

  RETURN true;
END;
$$;