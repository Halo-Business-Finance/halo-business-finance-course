-- Security Fix 1: Implement Data Masking for Profile Access
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(
  data_value TEXT,
  field_type TEXT,
  user_role TEXT DEFAULT 'user'
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Super admins can see full data with explicit logging
  IF user_role = 'super_admin' THEN
    RETURN data_value;
  END IF;
  
  -- Regular admins get masked data
  IF user_role = 'admin' THEN
    CASE field_type
      WHEN 'email' THEN
        RETURN CASE 
          WHEN data_value IS NULL THEN NULL
          ELSE CONCAT(LEFT(data_value, 2), '***@', RIGHT(SPLIT_PART(data_value, '@', 2), 4))
        END;
      WHEN 'phone' THEN
        RETURN CASE 
          WHEN data_value IS NULL THEN NULL
          ELSE CONCAT('XXX-XXX-', RIGHT(data_value, 4))
        END;
      WHEN 'name' THEN
        RETURN CASE 
          WHEN data_value IS NULL THEN NULL
          ELSE CONCAT(LEFT(data_value, 1), '*** ', RIGHT(SPLIT_PART(data_value, ' ', -1), 1))
        END;
      ELSE 
        RETURN '***MASKED***';
    END CASE;
  END IF;
  
  -- Non-admin users get heavily masked data
  RETURN '***PROTECTED***';
END;
$$;

-- Security Fix 2: Create Secure Profile Access Function
CREATE OR REPLACE FUNCTION public.get_masked_user_profiles()
RETURNS TABLE(
  user_id UUID,
  name TEXT,
  email TEXT, 
  phone TEXT,
  location TEXT,
  company TEXT,
  title TEXT,
  created_at TIMESTAMPTZ,
  is_masked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role TEXT;
  requesting_user_id UUID;
BEGIN
  -- Get current user info
  requesting_user_id := auth.uid();
  
  -- Verify user is authenticated
  IF requesting_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required for profile access';
  END IF;
  
  -- Get user role
  SELECT role INTO current_user_role
  FROM public.user_roles 
  WHERE user_id = requesting_user_id 
  AND is_active = true 
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      ELSE 3
    END
  LIMIT 1;
  
  -- Default to 'user' if no role found
  current_user_role := COALESCE(current_user_role, 'user');
  
  -- Log the profile access attempt with detailed audit trail
  PERFORM log_admin_profile_access_detailed(
    requesting_user_id,
    current_user_role,
    'bulk_profile_access',
    jsonb_build_object(
      'access_timestamp', now(),
      'user_role', current_user_role,
      'data_masking_applied', current_user_role != 'super_admin',
      'access_justification', 'administrative_review',
      'compliance_framework', 'GDPR_Article_32'
    )
  );
  
  -- Return masked or unmasked data based on role
  RETURN QUERY
  SELECT 
    p.user_id,
    mask_sensitive_data(p.name, 'name', current_user_role) as name,
    mask_sensitive_data(p.email, 'email', current_user_role) as email,
    mask_sensitive_data(p.phone, 'phone', current_user_role) as phone,
    CASE 
      WHEN current_user_role = 'super_admin' THEN p.location
      ELSE '***MASKED***'
    END as location,
    CASE 
      WHEN current_user_role IN ('super_admin', 'admin') THEN p.company
      ELSE '***MASKED***'
    END as company,
    CASE 
      WHEN current_user_role IN ('super_admin', 'admin') THEN p.title  
      ELSE '***MASKED***'
    END as title,
    p.created_at,
    (current_user_role != 'super_admin') as is_masked
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;

-- Security Fix 3: Enhanced Audit Logging Function
CREATE OR REPLACE FUNCTION public.log_admin_profile_access_detailed(
  accessing_admin_id UUID,
  admin_role TEXT,
  access_type TEXT,
  access_metadata JSONB
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert detailed audit log entry
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_resource,
    details,
    data_classification,
    risk_score,
    session_id,
    ip_address,
    user_agent
  ) VALUES (
    accessing_admin_id,
    'customer_profile_access_with_masking',
    'profiles_table_bulk_access',
    jsonb_build_object(
      'access_type', access_type,
      'admin_role', admin_role,
      'timestamp', now(),
      'data_masking_status', CASE WHEN admin_role = 'super_admin' THEN 'disabled' ELSE 'enabled' END,
      'customer_data_fields', ARRAY['name', 'email', 'phone', 'location', 'company'],
      'compliance_note', 'profile_access_with_gdpr_compliant_masking',
      'metadata', access_metadata
    ),
    CASE WHEN admin_role = 'super_admin' THEN 'restricted' ELSE 'confidential' END,
    CASE WHEN admin_role = 'super_admin' THEN 8 ELSE 4 END,
    COALESCE(current_setting('request.headers', true)::json->>'x-session-id', 'unknown'),
    COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', '0.0.0.0'),
    COALESCE(current_setting('request.headers', true)::json->>'user-agent', 'unknown')
  );
  
  -- Create security monitoring entry for super admin unmasked access
  IF admin_role = 'super_admin' THEN
    INSERT INTO public.security_events (
      user_id,
      event_type, 
      severity,
      details,
      logged_via_secure_function
    ) VALUES (
      accessing_admin_id,
      'super_admin_unmasked_customer_data_access',
      'high',
      jsonb_build_object(
        'admin_user', accessing_admin_id,
        'access_type', 'full_customer_pii_access',
        'data_protection_bypassed', true,
        'requires_compliance_review', true,
        'timestamp', now(),
        'justification_required', true
      ),
      true
    );
  END IF;
END;
$$;

-- Security Fix 4: Strengthen Lead Data Protection
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS data_classification TEXT DEFAULT 'confidential',
ADD COLUMN IF NOT EXISTS access_restricted_to JSONB DEFAULT '{"roles": ["super_admin", "admin"], "justification_required": true}'::jsonb;

-- Security Fix 5: Create Lead Access Control Function
CREATE OR REPLACE FUNCTION public.can_access_lead_data()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check authentication
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user role
  SELECT role INTO user_role
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND is_active = true 
  AND role IN ('super_admin', 'admin')
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      ELSE 3
    END
  LIMIT 1;
  
  -- Log access attempt
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity, 
    details,
    logged_via_secure_function
  ) VALUES (
    auth.uid(),
    'lead_data_access_attempt',
    'medium',
    jsonb_build_object(
      'user_role', COALESCE(user_role, 'unauthorized'),
      'access_granted', user_role IS NOT NULL,
      'timestamp', now(),
      'data_type', 'customer_lead_information'
    ),
    true
  );
  
  RETURN user_role IS NOT NULL;
END;
$$;

-- Security Fix 6: Update Leads RLS Policy for Enhanced Protection
DROP POLICY IF EXISTS "Admins can manage leads" ON public.leads;

CREATE POLICY "Restricted admin access to leads with logging" 
ON public.leads 
FOR ALL 
USING (can_access_lead_data())
WITH CHECK (can_access_lead_data());

-- Security Fix 7: Make Audit Tables Truly Append-Only
CREATE OR REPLACE FUNCTION public.prevent_audit_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent all updates and deletes on audit tables
  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    -- Log the attempt
    INSERT INTO public.security_events (
      event_type,
      severity,
      details,
      logged_via_secure_function
    ) VALUES (
      'audit_tampering_attempt',
      'critical',
      jsonb_build_object(
        'attempted_operation', TG_OP,
        'table_name', TG_TABLE_NAME,
        'user_id', auth.uid(),
        'timestamp', now(),
        'blocked', true,
        'threat_level', 'critical'
      ),
      true
    );
    
    RAISE EXCEPTION 'Audit records are immutable. This incident has been logged.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply append-only protection to audit tables
DROP TRIGGER IF EXISTS protect_admin_audit_log ON public.admin_audit_log;
CREATE TRIGGER protect_admin_audit_log
  BEFORE UPDATE OR DELETE ON public.admin_audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

DROP TRIGGER IF EXISTS protect_security_events ON public.security_events;  
CREATE TRIGGER protect_security_events
  BEFORE UPDATE OR DELETE ON public.security_events
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();