-- Create a trigger to automatically assign admin roles based on user metadata
CREATE OR REPLACE FUNCTION public.handle_admin_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
DECLARE
  user_role_type text;
BEGIN
  -- Get the role from user metadata
  user_role_type := NEW.raw_user_meta_data ->> 'role';
  
  -- Only assign admin roles if specified in metadata
  IF user_role_type IN ('admin', 'super_admin') THEN
    -- Insert the role into user_roles table
    INSERT INTO public.user_roles (user_id, role, is_active)
    VALUES (NEW.id, user_role_type::public.user_role, true);
    
    -- Log the role assignment
    INSERT INTO public.security_events (
      user_id, event_type, severity, details
    ) VALUES (
      NEW.id,
      'admin_role_auto_assigned',
      'high',
      jsonb_build_object(
        'role', user_role_type,
        'assigned_at', now(),
        'method', 'signup_metadata'
      )
    );
  ELSE
    -- Assign default user role for regular signups
    INSERT INTO public.user_roles (user_id, role, is_active)
    VALUES (NEW.id, 'viewer'::public.user_role, true);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_admin_user_created ON auth.users;
CREATE TRIGGER on_admin_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_admin_user_signup();