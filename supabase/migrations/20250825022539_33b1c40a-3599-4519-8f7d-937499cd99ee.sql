-- Create a function to validate email domains for different roles
CREATE OR REPLACE FUNCTION public.validate_email_domain_for_role(email_address text, user_role text DEFAULT 'trainee')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Normalize email to lowercase
  email_address := lower(email_address);
  
  -- Admin roles require halobusinessfinance.com domain
  IF user_role IN ('admin', 'super_admin', 'tech_support_admin') THEN
    RETURN email_address LIKE '%@halobusinessfinance.com';
  END IF;
  
  -- Trainees can use any email domain
  IF user_role = 'trainee' THEN
    RETURN true;
  END IF;
  
  -- Default to allowing any email for unknown roles
  RETURN true;
END;
$function$;

-- Create a function to auto-assign roles based on email domain
CREATE OR REPLACE FUNCTION public.auto_assign_role_by_email_domain()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  user_email text;
  assigned_role text := 'trainee';
BEGIN
  -- Get the email from the new user
  user_email := lower(NEW.email);
  
  -- Auto-assign role based on email domain
  IF user_email LIKE '%@halobusinessfinance.com' THEN
    -- For halobusinessfinance.com emails, start with trainee role
    -- Admins can later promote them to admin roles
    assigned_role := 'trainee';
  ELSE
    -- All other emails get trainee role
    assigned_role := 'trainee';
  END IF;
  
  -- Insert the role assignment
  INSERT INTO public.user_roles (user_id, role, is_active, created_at, updated_at)
  VALUES (NEW.id, assigned_role, true, now(), now())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Update the existing handle_new_user function to include role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  user_email text;
  assigned_role text := 'trainee';
BEGIN
  -- Get the email from the new user
  user_email := lower(NEW.email);
  
  -- Create profile
  INSERT INTO public.profiles (user_id, name, email, created_at, updated_at)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'New User'),
    NEW.email,
    now(),
    now()
  );
  
  -- Auto-assign role based on email domain
  IF user_email LIKE '%@halobusinessfinance.com' THEN
    -- For halobusinessfinance.com emails, start with trainee role
    -- Admins can later promote them to admin roles if needed
    assigned_role := 'trainee';
  ELSE
    -- All other emails get trainee role
    assigned_role := 'trainee';
  END IF;
  
  -- Insert the role assignment
  INSERT INTO public.user_roles (user_id, role, is_active, created_at, updated_at)
  VALUES (NEW.id, assigned_role, true, now(), now())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Create a function to validate admin role assignments
CREATE OR REPLACE FUNCTION public.validate_admin_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  user_email text;
BEGIN
  -- Skip validation for trainee role
  IF NEW.role = 'trainee' THEN
    RETURN NEW;
  END IF;
  
  -- Get the user's email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = NEW.user_id;
  
  -- Check if email domain is valid for admin roles
  IF NEW.role IN ('admin', 'super_admin', 'tech_support_admin') THEN
    IF NOT validate_email_domain_for_role(user_email, NEW.role) THEN
      RAISE EXCEPTION 'Admin roles require a @halobusinessfinance.com email address. User email: %', user_email;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to validate admin role assignments
DROP TRIGGER IF EXISTS validate_admin_role_assignment_trigger ON public.user_roles;
CREATE TRIGGER validate_admin_role_assignment_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_admin_role_assignment();