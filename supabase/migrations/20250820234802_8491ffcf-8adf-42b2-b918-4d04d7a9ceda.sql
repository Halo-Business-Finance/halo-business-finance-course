-- Fix the admin user signup trigger to handle existing roles
CREATE OR REPLACE FUNCTION public.handle_admin_user_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role_type text;
BEGIN
  -- Get the role from user metadata
  user_role_type := NEW.raw_user_meta_data ->> 'role';
  
  -- Only assign admin roles if specified in metadata
  IF user_role_type IN ('admin', 'super_admin') THEN
    -- Use INSERT ... ON CONFLICT to handle duplicate key issues
    INSERT INTO public.user_roles (user_id, role, is_active)
    VALUES (NEW.id, user_role_type::public.user_role, true)
    ON CONFLICT (user_id, role) 
    DO UPDATE SET 
      is_active = true,
      updated_at = now();
    
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
    VALUES (NEW.id, 'viewer'::public.user_role, true)
    ON CONFLICT (user_id, role) 
    DO UPDATE SET 
      is_active = true,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$function$;