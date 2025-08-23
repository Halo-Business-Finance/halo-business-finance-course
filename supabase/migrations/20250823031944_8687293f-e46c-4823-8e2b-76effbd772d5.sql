-- Assign admin role to the current user (Varda Dinkha)
-- This will allow access to the admin dashboard

INSERT INTO public.user_roles (user_id, role, is_active)
VALUES ('71ac2b44-b866-43e0-8895-1036f0cdf4f0', 'admin', true)
ON CONFLICT (user_id, role) DO UPDATE SET
  is_active = true,
  updated_at = now();