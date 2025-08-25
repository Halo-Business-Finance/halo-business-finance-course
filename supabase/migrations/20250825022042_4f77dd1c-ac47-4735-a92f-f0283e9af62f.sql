-- First, let's check if the current super admin user has a role record
-- and create one if missing, using the user metadata
-- This will ensure the admin dashboard can load user data properly

-- Insert the super admin role for the authenticated user if it doesn't exist
INSERT INTO public.user_roles (user_id, role, is_active, created_at, updated_at)
SELECT 
  'adc9b95f-9e8e-45d0-85f3-abf59de2bc6c'::uuid,
  'super_admin',
  true,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = 'adc9b95f-9e8e-45d0-85f3-abf59de2bc6c'::uuid
);

-- Also ensure there's a profile record for this user
INSERT INTO public.profiles (user_id, name, email, created_at, updated_at)
SELECT 
  'adc9b95f-9e8e-45d0-85f3-abf59de2bc6c'::uuid,
  'Varda Dinkha',
  'varda@halobusinessfinance.com',
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = 'adc9b95f-9e8e-45d0-85f3-abf59de2bc6c'::uuid
);

-- Now check for other users that might be missing role records and add default trainee roles
INSERT INTO public.user_roles (user_id, role, is_active, created_at, updated_at)
SELECT 
  p.user_id,
  'trainee',
  true,
  now(),
  now()
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE ur.user_id IS NULL;