-- Assign admin role to the existing user (varda@halobusinessfinance.com)
-- User ID from auth logs: adc9b95f-9e8e-45d0-85f3-abf59de2bc6c

INSERT INTO public.user_roles (user_id, role, is_active)
VALUES ('adc9b95f-9e8e-45d0-85f3-abf59de2bc6c', 'super_admin', true)
ON CONFLICT (user_id, role) 
DO UPDATE SET is_active = true, updated_at = now();

-- Also create a profile for this user if it doesn't exist
INSERT INTO public.profiles (user_id, name, email)
VALUES ('adc9b95f-9e8e-45d0-85f3-abf59de2bc6c', 'Varda Dinkha', 'varda@halobusinessfinance.com')
ON CONFLICT (user_id) 
DO UPDATE SET 
  name = COALESCE(EXCLUDED.name, profiles.name),
  email = COALESCE(EXCLUDED.email, profiles.email),
  updated_at = now();