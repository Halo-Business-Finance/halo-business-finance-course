-- Update the check constraint to include new roles: trainee and tech_support_admin
-- Drop the old constraint
ALTER TABLE public.user_roles DROP CONSTRAINT user_roles_role_check;

-- Add the updated constraint with new roles
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_role_check 
CHECK (role = ANY (ARRAY[
  'admin'::text, 
  'super_admin'::text, 
  'manager'::text, 
  'agent'::text, 
  'trainee'::text,
  'tech_support_admin'::text,
  'loan_processor'::text, 
  'underwriter'::text, 
  'funder'::text, 
  'closer'::text, 
  'tech'::text, 
  'loan_originator'::text
]));

-- Log this update
SELECT log_admin_action(
  'system_update',
  NULL,
  'user_roles_constraint',
  jsonb_build_object(
    'action', 'updated_role_constraint',
    'description', 'Updated role constraint to include trainee and tech_support_admin roles',
    'timestamp', now()
  )
);