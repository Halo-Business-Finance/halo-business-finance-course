-- Create function to get active admins with recent activity
CREATE OR REPLACE FUNCTION public.get_active_admins_with_activity()
RETURNS TABLE(
  user_id uuid,
  name text,
  email text,
  role text,
  is_active boolean,
  recent_activity_count bigint,
  last_activity timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT
    p.user_id,
    p.name,
    p.email,
    ur.role,
    ur.is_active,
    COUNT(aal.id) as recent_activity_count,
    MAX(aal.created_at) as last_activity
  FROM profiles p
  INNER JOIN user_roles ur ON p.user_id = ur.user_id
  INNER JOIN admin_audit_log aal ON p.user_id = aal.admin_user_id
  WHERE ur.is_active = true
    AND ur.role IN ('admin', 'super_admin')
    AND aal.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY p.user_id, p.name, p.email, ur.role, ur.is_active
  ORDER BY recent_activity_count DESC, last_activity DESC;
$$;