-- Phase 1: Critical Security Fixes
-- Remove public access to course modules and restrict to authenticated enrolled users
DROP POLICY IF EXISTS "Public can view active modules" ON public.course_modules;

-- Create secure policy for course modules access
CREATE POLICY "Enrolled users can view course modules" 
ON public.course_modules 
FOR SELECT 
USING (
  is_active = true AND (
    is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM course_enrollments 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  )
);

-- Enhance security for course videos - require enrollment
DROP POLICY IF EXISTS "Authenticated users can view videos" ON public.course_videos;

CREATE POLICY "Enrolled users can view course videos"
ON public.course_videos 
FOR SELECT 
USING (
  is_active = true AND (
    is_admin(auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM course_enrollments 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  )
);

-- Secure course articles access
DROP POLICY IF EXISTS "Authenticated users can view articles" ON public.course_articles;

CREATE POLICY "Enrolled users can view published articles"
ON public.course_articles 
FOR SELECT 
USING (
  is_published = true AND (
    is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM course_enrollments 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  )
);

-- Secure course documents access
DROP POLICY IF EXISTS "Authenticated users can view documents" ON public.course_documents;

CREATE POLICY "Enrolled users can view course documents"
ON public.course_documents 
FOR SELECT 
USING (
  is_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Create function to validate admin role assignments more strictly
CREATE OR REPLACE FUNCTION public.validate_admin_role_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent self-assignment of admin roles except during initial setup
  IF NEW.user_id = auth.uid() AND NEW.role IN ('admin', 'super_admin', 'tech_support_admin') THEN
    -- Allow only if no existing super_admin exists (initial setup)
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin' AND is_active = true) THEN
      RAISE EXCEPTION 'Users cannot assign admin roles to themselves after initial setup';
    END IF;
  END IF;

  -- Enhanced logging for role assignments
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    details,
    logged_via_secure_function
  ) VALUES (
    auth.uid(),
    'role_assignment_attempt',
    CASE 
      WHEN NEW.role = 'super_admin' THEN 'high'
      WHEN NEW.role IN ('admin', 'tech_support_admin') THEN 'medium'
      ELSE 'low'
    END,
    jsonb_build_object(
      'target_user_id', NEW.user_id,
      'assigned_role', NEW.role,
      'assigning_user', auth.uid(),
      'timestamp', now(),
      'is_self_assignment', NEW.user_id = auth.uid()
    ),
    true
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;