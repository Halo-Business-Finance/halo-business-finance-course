-- Fix the security linter warning by setting proper search_path
DROP FUNCTION IF EXISTS public.validate_admin_role_assignment();

CREATE OR REPLACE FUNCTION public.validate_admin_role_assignment()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Prevent self-assignment of admin roles except during initial setup
  IF NEW.user_id = auth.uid() AND NEW.role IN ('admin', 'super_admin', 'tech_support_admin') THEN
    -- Allow only if no existing super_admin exists (initial setup)
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin' AND is_active = true) THEN
      RAISE EXCEPTION 'Users cannot assign admin roles to themselves after initial setup';
    END IF;
  END IF;

  -- Enhanced logging for role assignments
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    details,
    logged_via_secure_function
  ) VALUES (
    auth.uid(),
    'role_assignment_attempt',
    CASE 
      WHEN NEW.role = 'super_admin' THEN 'high'
      WHEN NEW.role IN ('admin', 'tech_support_admin') THEN 'medium'
      ELSE 'low'
    END,
    jsonb_build_object(
      'target_user_id', NEW.user_id,
      'assigned_role', NEW.role,
      'assigning_user', auth.uid(),
      'timestamp', now(),
      'is_self_assignment', NEW.user_id = auth.uid()
    ),
    true
  );

  RETURN NEW;
END;
$$;

-- Add trigger for enhanced role assignment validation
DROP TRIGGER IF EXISTS validate_admin_role_assignment_trigger ON public.user_roles;
CREATE TRIGGER validate_admin_role_assignment_trigger
  BEFORE INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_admin_role_assignment();