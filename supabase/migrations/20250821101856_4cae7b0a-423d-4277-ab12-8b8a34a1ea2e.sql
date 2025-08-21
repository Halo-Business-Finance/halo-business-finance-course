-- Drop the constraint first to allow updates
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Update all existing 'viewer' roles to 'trainee' roles
UPDATE public.user_roles 
SET role = 'trainee' 
WHERE role = 'viewer';

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
  'user_roles_migration',
  jsonb_build_object(
    'action', 'migrated_viewer_to_trainee',
    'description', 'Successfully updated all viewer roles to trainee and updated role constraint',
    'timestamp', now()
  )
);