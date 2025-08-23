-- Create a simple, working version of get_user_profile without complex logging
CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS TABLE(id uuid, user_id uuid, name text, email text, phone text, title text, company text, city text, state text, location text, avatar_url text, join_date timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone, theme text, language text, timezone text, date_format text, font_size text, reduced_motion boolean, email_notifications boolean, push_notifications boolean, marketing_emails boolean, course_progress boolean, new_courses boolean, webinar_reminders boolean, weekly_progress boolean, marketing_communications boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only authenticated users can access their own data
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Simple logging without complex triggers
  INSERT INTO public.security_events (event_type, severity, details, user_id, logged_via_secure_function)
  VALUES (
    'profile_self_access',
    'low',
    jsonb_build_object(
      'access_type', 'self_profile_access',
      'timestamp', now(),
      'user_id', auth.uid()
    ),
    auth.uid(),
    true
  );

  -- Return user's own profile data
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.name,
    p.email,
    p.phone,
    p.title,
    p.company,
    p.city,
    p.state,
    p.location,
    p.avatar_url,
    p.join_date,
    p.created_at,
    p.updated_at,
    p.theme,
    p.language,
    p.timezone,
    p.date_format,
    p.font_size,
    p.reduced_motion,
    p.email_notifications,
    p.push_notifications,
    p.marketing_emails,
    p.course_progress,
    p.new_courses,
    p.webinar_reminders,
    p.weekly_progress,
    p.marketing_communications
  FROM public.profiles p
  WHERE p.user_id = auth.uid();
END;
$$;