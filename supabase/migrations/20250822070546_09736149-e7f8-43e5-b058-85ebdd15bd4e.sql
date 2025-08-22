-- Check if we have any users with admin roles
-- If not, we need to set up initial admin access

-- First, let's create some initial instructors if none exist
INSERT INTO instructors (
  name, 
  title, 
  company, 
  years_experience, 
  bio, 
  avatar_initials, 
  avatar_color, 
  display_order, 
  is_active
) VALUES 
  (
    'John Smith', 
    'Senior Business Finance Consultant', 
    'Halo Business Finance', 
    '15+ years', 
    'John brings over 15 years of experience in commercial lending and business finance. He has helped hundreds of businesses secure funding and optimize their financial strategies.', 
    'JS', 
    'blue', 
    1, 
    true
  ),
  (
    'Sarah Johnson', 
    'Commercial Lending Specialist', 
    'Halo Business Finance', 
    '12+ years', 
    'Sarah specializes in SBA lending and has extensive experience in underwriting complex commercial transactions. She is passionate about helping small businesses access capital.', 
    'SJ', 
    'green', 
    2, 
    true
  ),
  (
    'Michael Chen', 
    'Senior Underwriter', 
    'Halo Business Finance', 
    '10+ years', 
    'Michael has deep expertise in credit analysis and risk assessment. He has underwritten over $500M in commercial loans and trains new underwriters on best practices.', 
    'MC', 
    'purple', 
    3, 
    true
  )
ON CONFLICT (name) DO NOTHING;

-- Create RPC function to safely check if user needs admin role assignment
CREATE OR REPLACE FUNCTION public.check_and_assign_initial_admin()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_count INTEGER;
  first_user_id UUID;
BEGIN
  -- Check if there are any super_admin users
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles 
  WHERE role = 'super_admin' AND is_active = true;
  
  -- If no super_admin exists, make the first user a super_admin
  IF admin_count = 0 THEN
    -- Get the first user that exists in profiles
    SELECT user_id INTO first_user_id
    FROM public.profiles 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- If we found a user, make them super_admin
    IF first_user_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role, is_active)
      VALUES (first_user_id, 'super_admin', true)
      ON CONFLICT (user_id, role) 
      DO UPDATE SET is_active = true;
      
      RETURN 'Admin role assigned to first user: ' || first_user_id;
    ELSE
      RETURN 'No users found in profiles table';
    END IF;
  ELSE
    RETURN 'Admin users already exist: ' || admin_count;
  END IF;
END;
$$;

-- Run the function to set up initial admin if needed
SELECT public.check_and_assign_initial_admin();