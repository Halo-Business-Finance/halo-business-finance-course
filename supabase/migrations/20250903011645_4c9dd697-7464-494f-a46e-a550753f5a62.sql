-- Security Fix Migration - Drop existing function first
DROP FUNCTION IF EXISTS public.mask_sensitive_data(text, text, text);

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

-- Security Fix 2: Enhanced Audit Logging Function  
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
    risk_score
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
    CASE WHEN admin_role = 'super_admin' THEN 8 ELSE 4 END
  );
END;
$$;

-- Security Fix 3: Create Secure Profile Access Function
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
  
  -- Log the profile access attempt
  PERFORM log_admin_profile_access_detailed(
    requesting_user_id,
    current_user_role,
    'bulk_profile_access',
    jsonb_build_object(
      'access_timestamp', now(),
      'user_role', current_user_role,
      'data_masking_applied', current_user_role != 'super_admin'
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