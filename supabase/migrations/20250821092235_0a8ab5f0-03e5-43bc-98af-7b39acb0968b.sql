-- Phase 1: Fix Critical Admin Privilege Escalation

-- First, create a secure function to check user roles without exposing user_roles table
CREATE OR REPLACE FUNCTION public.check_user_has_role(check_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = check_role 
    AND is_active = true
  );
$$;

-- Remove the policy that allows users to view their own roles directly
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Strengthen the admin policies to prevent any user access to user_roles table
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;

-- Create new stricter policies for user_roles
CREATE POLICY "Only super admins can view user roles"
ON public.user_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin' 
    AND ur.is_active = true
  )
);

CREATE POLICY "Only super admins can insert user roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin' 
    AND ur.is_active = true
  )
);

CREATE POLICY "Only super admins can update user roles"
ON public.user_roles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin' 
    AND ur.is_active = true
  )
);

CREATE POLICY "Only super admins can delete user roles"
ON public.user_roles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin' 
    AND ur.is_active = true
  )
);

-- Add validation trigger to prevent unauthorized role assignments
CREATE OR REPLACE FUNCTION public.validate_role_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent users from assigning themselves admin roles
  IF NEW.user_id = auth.uid() AND NEW.role IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Users cannot assign admin roles to themselves';
  END IF;
  
  -- Only super_admin can assign super_admin roles
  IF NEW.role = 'super_admin' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Only super admins can assign super admin roles';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER validate_role_assignment_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_role_assignment();

-- Strengthen existing role assignment functions with additional security
DROP FUNCTION IF EXISTS public.assign_user_role(uuid, text, text, boolean);
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