-- Create some initial instructors if none exist (simpler version)
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
) 
SELECT 
  'John Smith', 
  'Senior Business Finance Consultant', 
  'Halo Business Finance', 
  '15+ years', 
  'John brings over 15 years of experience in commercial lending and business finance. He has helped hundreds of businesses secure funding and optimize their financial strategies.', 
  'JS', 
  'blue', 
  1, 
  true
WHERE NOT EXISTS (SELECT 1 FROM instructors WHERE name = 'John Smith');

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
) 
SELECT 
  'Sarah Johnson', 
  'Commercial Lending Specialist', 
  'Halo Business Finance', 
  '12+ years', 
  'Sarah specializes in SBA lending and has extensive experience in underwriting complex commercial transactions. She is passionate about helping small businesses access capital.', 
  'SJ', 
  'green', 
  2, 
  true
WHERE NOT EXISTS (SELECT 1 FROM instructors WHERE name = 'Sarah Johnson');

-- Create RPC function to safely assign admin role to current user
CREATE OR REPLACE FUNCTION public.make_current_user_admin()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN 'No authenticated user';
  END IF;
  
  -- Insert or update user role to super_admin
  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (current_user_id, 'super_admin', true)
  ON CONFLICT (user_id, role) 
  DO UPDATE SET is_active = true;
  
  RETURN 'Super admin role assigned to: ' || current_user_id;
END;
$$;