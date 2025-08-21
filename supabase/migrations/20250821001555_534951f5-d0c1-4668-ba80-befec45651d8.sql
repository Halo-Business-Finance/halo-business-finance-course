-- Remove duplicate agent role for the super_admin user
-- Keep only the super_admin role since it has higher privileges
DELETE FROM public.user_roles 
WHERE user_id = 'd6449078-92a1-4959-96b5-9e647246d1e9' 
  AND role = 'agent' 
  AND is_active = true;

-- Also update the get_user_role function to handle multiple roles properly
-- by returning the highest priority role
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid DEFAULT auth.uid())
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Return highest priority role for users with multiple roles
  SELECT COALESCE(
    (
      SELECT role FROM public.user_roles 
      WHERE user_id = p_user_id AND is_active = true 
      ORDER BY 
        CASE role
          WHEN 'super_admin' THEN 1
          WHEN 'admin' THEN 2  
          WHEN 'manager' THEN 3
          WHEN 'loan_originator' THEN 4
          WHEN 'loan_processor' THEN 4
          WHEN 'underwriter' THEN 4
          WHEN 'funder' THEN 4
          WHEN 'closer' THEN 4
          WHEN 'agent' THEN 5
          WHEN 'tech' THEN 6
          ELSE 7
        END ASC
      LIMIT 1
    ),
    'viewer'::public.user_role
  );
$$;