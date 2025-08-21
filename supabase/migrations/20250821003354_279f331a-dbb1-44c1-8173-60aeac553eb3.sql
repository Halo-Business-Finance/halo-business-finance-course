-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin', 'manager', 'agent', 'viewer', 'loan_processor', 'underwriter', 'funder', 'closer', 'tech', 'loan_originator')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin') 
    AND ur.is_active = true
  )
);

CREATE POLICY "Super admins can manage all user roles" 
ON public.user_roles 
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin' 
    AND ur.is_active = true
  )
);

-- Create security_events table for audit logging
CREATE TABLE public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Create policies for security_events
CREATE POLICY "Admins can view all security events" 
ON public.security_events 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin') 
    AND ur.is_active = true
  )
);

CREATE POLICY "System can insert security events" 
ON public.security_events 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create functions for role management
CREATE OR REPLACE FUNCTION public.assign_user_role(
  p_target_user_id UUID,
  p_new_role TEXT,
  p_reason TEXT DEFAULT 'Role assignment',
  p_mfa_verified BOOLEAN DEFAULT false
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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