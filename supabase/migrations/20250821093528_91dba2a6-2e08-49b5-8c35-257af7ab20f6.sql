-- Phase 1: Critical Course Content Protection
-- Update course_modules RLS policy to require enrollment or admin access
DROP POLICY IF EXISTS "Anyone can view active modules" ON course_modules;
CREATE POLICY "Enrolled users and admins can view modules" ON course_modules
FOR SELECT USING (
  is_admin(auth.uid()) OR 
  (is_active = true AND EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE user_id = auth.uid() 
    AND course_id = 'halo-launch-pad-learn' 
    AND status = 'active'
  ))
);

-- Update course_videos RLS policy to require enrollment or admin access  
DROP POLICY IF EXISTS "Anyone can view active videos" ON course_videos;
CREATE POLICY "Enrolled users and admins can view videos" ON course_videos
FOR SELECT USING (
  is_admin(auth.uid()) OR 
  (is_active = true AND EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE user_id = auth.uid() 
    AND course_id = 'halo-launch-pad-learn' 
    AND status = 'active'
  ))
);

-- Update course_articles RLS policy to require enrollment or admin access
DROP POLICY IF EXISTS "Anyone can view published articles" ON course_articles;
CREATE POLICY "Enrolled users and admins can view articles" ON course_articles
FOR SELECT USING (
  is_admin(auth.uid()) OR 
  (is_published = true AND EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE user_id = auth.uid() 
    AND course_id = 'halo-launch-pad-learn' 
    AND status = 'active'
  ))
);

-- Update course_documents RLS policy to require enrollment or admin access
DROP POLICY IF EXISTS "Authenticated users can view documents" ON course_documents;
CREATE POLICY "Enrolled users and admins can view documents" ON course_documents
FOR SELECT USING (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE user_id = auth.uid() 
    AND course_id = 'halo-launch-pad-learn' 
    AND status = 'active'
  )
);

-- Update course_assessments RLS policy to require enrollment or admin access
DROP POLICY IF EXISTS "Authenticated users can view assessments" ON course_assessments;
CREATE POLICY "Enrolled users and admins can view assessments" ON course_assessments
FOR SELECT USING (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE user_id = auth.uid() 
    AND course_id = 'halo-launch-pad-learn' 
    AND status = 'active'
  )
);

-- Create audit logging table for security events
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action text NOT NULL,
  target_user_id uuid,
  target_resource text,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admins can view audit logs" ON admin_audit_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
);

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON admin_audit_log
FOR INSERT WITH CHECK (true);

-- Create function for audit logging
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action text,
  p_target_user_id uuid DEFAULT NULL,
  p_target_resource text DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_user_id,
    target_resource,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_target_user_id,
    p_target_resource,
    p_details
  );
END;
$$;