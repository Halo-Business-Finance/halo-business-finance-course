-- Query to find and fix any remaining functions without search_path
DO $$
DECLARE
    func_record RECORD;
    func_definition TEXT;
BEGIN
    -- Find functions that might be missing search_path
    FOR func_record IN 
        SELECT p.proname as function_name, p.oid
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.prosecdef = true
          AND (p.proconfig IS NULL OR NOT (array_to_string(p.proconfig, ', ') LIKE '%search_path%'))
    LOOP
        RAISE NOTICE 'Function missing search_path: %', func_record.function_name;
    END LOOP;
END $$;

-- Update any functions that might have been missed
-- Note: This is a comprehensive approach to ensure all functions have proper search_path

-- Make sure all our security functions have the search path set
CREATE OR REPLACE FUNCTION public.revoke_user_role(
  p_target_user_id uuid, 
  p_reason text DEFAULT 'Role revocation'::text, 
  p_mfa_verified boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Prevent self-revocation of admin roles
  IF p_target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot revoke your own admin roles';
  END IF;

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

  -- Log security event with enhanced details
  INSERT INTO public.security_events (user_id, event_type, severity, details)
  VALUES (auth.uid(), 'role_revoked', 'critical', jsonb_build_object(
    'target_user_id', p_target_user_id,
    'reason', p_reason,
    'mfa_verified', p_mfa_verified,
    'timestamp', now()
  ));

  RETURN true;
END;
$$;

-- Ensure assign_user_role also has proper search_path (recreate to be sure)
CREATE OR REPLACE FUNCTION public.assign_user_role(
  p_target_user_id uuid, 
  p_new_role text, 
  p_reason text DEFAULT 'Role assignment'::text,
  p_mfa_verified boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Prevent self-assignment of admin roles
  IF p_target_user_id = auth.uid() AND p_new_role IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Cannot assign admin roles to yourself';
  END IF;

  -- Check if caller has appropriate privileges
  IF p_new_role = 'super_admin' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Only super admins can assign super admin roles';
    END IF;
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin') 
      AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Admin privileges required';
    END IF;
  END IF;

  -- Insert or update user role
  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (p_target_user_id, p_new_role, true)
  ON CONFLICT (user_id, role) 
  DO UPDATE SET is_active = true, updated_at = now();

  -- Log security event with enhanced details
  INSERT INTO public.security_events (user_id, event_type, severity, details)
  VALUES (auth.uid(), 'role_assigned', 'high', jsonb_build_object(
    'target_user_id', p_target_user_id,
    'assigned_role', p_new_role,
    'reason', p_reason,
    'mfa_verified', p_mfa_verified,
    'timestamp', now()
  ));

  RETURN true;
END;
$$;