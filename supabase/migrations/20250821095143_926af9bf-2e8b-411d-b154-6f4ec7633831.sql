-- Fix admin audit log security policy to be more restrictive
DROP POLICY IF EXISTS "System can insert audit logs" ON admin_audit_log;

-- Create more restrictive policy that only allows authenticated admins to insert audit logs
CREATE POLICY "Only admins can insert audit logs" 
ON admin_audit_log 
FOR INSERT 
TO authenticated 
WITH CHECK (
  -- Only allow if the user is an admin or if it's a system-level operation (auth.uid() is null for system operations)
  auth.uid() IS NULL OR is_admin(auth.uid())
);