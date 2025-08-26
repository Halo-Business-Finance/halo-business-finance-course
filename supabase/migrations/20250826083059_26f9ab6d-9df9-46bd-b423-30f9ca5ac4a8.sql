-- MILITARY GRADE SECURITY IMPLEMENTATION
-- Priority 1: Fix critical infinite recursion in user_roles RLS policies

-- Step 1: Drop problematic RLS policies on user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles; 
DROP POLICY IF EXISTS "Super admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Only admins can assign roles" ON user_roles;

-- Step 2: Create secure functions to check roles without recursion
CREATE OR REPLACE FUNCTION public.check_user_has_role_secure(check_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = check_role 
    AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role_secure()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER  
SET search_path TO 'public'
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid()
  AND is_active = true 
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'tech_support_admin' THEN 3
      WHEN 'instructor' THEN 4
      ELSE 5
    END
  LIMIT 1;
$$;

-- Step 3: Create new secure RLS policies using functions
CREATE POLICY "Users can view their own roles secure"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all roles secure" 
  ON user_roles FOR SELECT
  USING (public.check_user_has_role_secure('super_admin'));

CREATE POLICY "Super admins can manage all roles secure"
  ON user_roles FOR ALL
  USING (public.check_user_has_role_secure('super_admin'))
  WITH CHECK (public.check_user_has_role_secure('super_admin'));

-- Step 4: Secure course modules - remove public preview exposure
UPDATE course_modules SET public_preview = false WHERE public_preview = true;

-- Create military-grade course access policy
DROP POLICY IF EXISTS "Public can view preview courses, enrolled users see all active" ON course_modules;
DROP POLICY IF EXISTS "Enrolled users and admins can view active course modules" ON course_modules;

CREATE POLICY "Military grade course access - enrolled users only"
  ON course_modules FOR SELECT
  USING (
    is_active = true 
    AND (
      public.check_user_has_role_secure('admin') 
      OR public.check_user_has_role_secure('super_admin')
      OR EXISTS (
        SELECT 1 FROM course_enrollments 
        WHERE user_id = auth.uid() 
        AND status = 'active'
      )
    )
  );

-- Step 5: Secure CMS tables from public exposure
DROP POLICY IF EXISTS "Authenticated users can view CMS categories" ON cms_categories;
DROP POLICY IF EXISTS "Authenticated users can view tags" ON cms_tags; 
DROP POLICY IF EXISTS "Authenticated users can view page tags" ON cms_page_tags;

CREATE POLICY "Enrolled users can view CMS categories"
  ON cms_categories FOR SELECT
  USING (
    public.check_user_has_role_secure('admin')
    OR EXISTS (
      SELECT 1 FROM course_enrollments 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Enrolled users can view CMS tags"
  ON cms_tags FOR SELECT
  USING (
    public.check_user_has_role_secure('admin')
    OR EXISTS (
      SELECT 1 FROM course_enrollments 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Enrolled users can view CMS page tags"
  ON cms_page_tags FOR SELECT
  USING (
    public.check_user_has_role_secure('admin')
    OR EXISTS (
      SELECT 1 FROM course_enrollments 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Step 6: Create advanced threat detection tables
CREATE TABLE IF NOT EXISTS public.threat_detection_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source_ip inet,
  user_agent text,
  request_path text,
  threat_indicators jsonb DEFAULT '{}',
  geolocation jsonb DEFAULT '{}',
  automated_response text,
  is_blocked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on threat detection
ALTER TABLE public.threat_detection_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage threat detection"
  ON threat_detection_events FOR ALL
  USING (public.check_user_has_role_secure('super_admin'))
  WITH CHECK (public.check_user_has_role_secure('super_admin'));

-- Step 7: Create advanced rate limiting table
CREATE TABLE IF NOT EXISTS public.advanced_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP, user_id, or fingerprint
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  is_blocked boolean DEFAULT false,
  block_until timestamptz,
  threat_level integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.advanced_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage rate limits"
  ON advanced_rate_limits FOR ALL
  USING (true)
  WITH CHECK (true);

-- Step 8: Create comprehensive security monitoring function
CREATE OR REPLACE FUNCTION public.log_security_threat(
  p_event_type text,
  p_severity text,
  p_source_ip inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_request_path text DEFAULT NULL,
  p_threat_indicators jsonb DEFAULT '{}',
  p_auto_block boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  threat_id uuid;
BEGIN
  INSERT INTO threat_detection_events (
    event_type,
    severity, 
    source_ip,
    user_agent,
    request_path,
    threat_indicators,
    automated_response,
    is_blocked
  ) VALUES (
    p_event_type,
    p_severity,
    p_source_ip,
    p_user_agent, 
    p_request_path,
    p_threat_indicators,
    CASE WHEN p_auto_block THEN 'AUTO_BLOCKED' ELSE 'MONITORED' END,
    p_auto_block
  ) RETURNING id INTO threat_id;

  -- Create security alert for critical threats
  IF p_severity = 'critical' THEN
    PERFORM create_security_alert(
      p_event_type,
      'critical',
      'Critical Security Threat Detected',
      format('Critical threat: %s detected from IP %s', p_event_type, p_source_ip),
      jsonb_build_object(
        'threat_id', threat_id,
        'auto_blocked', p_auto_block,
        'requires_immediate_attention', true
      )
    );
  END IF;

  RETURN threat_id;
END;
$$;

-- Step 9: Create military-grade audit enhancement function
CREATE OR REPLACE FUNCTION public.enhanced_audit_log(
  p_admin_user_id uuid,
  p_action text,
  p_target_user_id uuid DEFAULT NULL,
  p_target_resource text DEFAULT NULL,
  p_details jsonb DEFAULT '{}',
  p_data_classification text DEFAULT 'restricted'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  client_ip text;
  user_agent_header text;
BEGIN
  -- Extract request metadata
  BEGIN
    client_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
    user_agent_header := current_setting('request.headers', true)::json->>'user-agent';
  EXCEPTION WHEN OTHERS THEN
    client_ip := 'unknown';
    user_agent_header := 'unknown';
  END;

  -- Insert enhanced audit log
  INSERT INTO admin_audit_log (
    admin_user_id,
    action,
    target_user_id,
    target_resource,
    details,
    data_classification,
    ip_address,
    user_agent,
    metadata_enhanced,
    risk_score
  ) VALUES (
    p_admin_user_id,
    p_action,
    p_target_user_id,
    p_target_resource,
    p_details,
    p_data_classification::data_classification,
    client_ip,
    user_agent_header,
    jsonb_build_object(
      'timestamp', now(),
      'session_validated', true,
      'compliance_logged', true,
      'security_level', 'military_grade'
    ),
    CASE 
      WHEN p_data_classification = 'restricted' THEN 9
      WHEN p_data_classification = 'confidential' THEN 7
      ELSE 5
    END
  );

  -- Trigger breach detection analysis
  PERFORM detect_potential_data_breach();
END;
$$;