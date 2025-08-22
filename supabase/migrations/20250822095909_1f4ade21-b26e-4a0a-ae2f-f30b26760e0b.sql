-- Create a function to get trainee progress data for admins
CREATE OR REPLACE FUNCTION public.get_trainee_progress_data()
RETURNS TABLE(
  user_id uuid,
  trainee_name text,
  trainee_email text,
  trainee_phone text,
  trainee_company text,
  join_date timestamp with time zone,
  total_courses integer,
  completed_courses integer,
  in_progress_courses integer,
  overall_progress_percentage numeric,
  last_activity timestamp with time zone,
  course_progress_details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to access this function
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required'
      USING ERRCODE = '42501';
  END IF;

  -- Log admin access to trainee progress data
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'trainee_progress_data_access',
    'course_progress',
    jsonb_build_object(
      'access_type', 'bulk_trainee_progress_view',
      'timestamp', now(),
      'reason', 'admin_dashboard_view'
    ),
    'confidential'
  );

  RETURN QUERY
  SELECT 
    p.user_id,
    p.name as trainee_name,
    p.email as trainee_email,
    p.phone as trainee_phone,
    p.company as trainee_company,
    p.join_date,
    COALESCE(progress_stats.total_courses, 0)::integer as total_courses,
    COALESCE(progress_stats.completed_courses, 0)::integer as completed_courses,
    COALESCE(progress_stats.in_progress_courses, 0)::integer as in_progress_courses,
    COALESCE(progress_stats.overall_progress, 0)::numeric as overall_progress_percentage,
    progress_stats.last_activity,
    COALESCE(progress_stats.course_details, '[]'::jsonb) as course_progress_details
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.user_id = ur.user_id
  LEFT JOIN (
    SELECT 
      cp.user_id,
      COUNT(DISTINCT cp.course_id) as total_courses,
      COUNT(DISTINCT CASE WHEN cp.completed_at IS NOT NULL THEN cp.course_id END) as completed_courses,
      COUNT(DISTINCT CASE WHEN cp.completed_at IS NULL AND cp.progress_percentage > 0 THEN cp.course_id END) as in_progress_courses,
      AVG(cp.progress_percentage) as overall_progress,
      MAX(cp.updated_at) as last_activity,
      jsonb_agg(
        jsonb_build_object(
          'course_id', cp.course_id,
          'module_id', cp.module_id,
          'progress_percentage', cp.progress_percentage,
          'completed_at', cp.completed_at,
          'updated_at', cp.updated_at
        )
      ) as course_details
    FROM public.course_progress cp
    GROUP BY cp.user_id
  ) progress_stats ON p.user_id = progress_stats.user_id
  WHERE ur.role = 'trainee' 
    AND ur.is_active = true
  ORDER BY p.name;
END;
$$;