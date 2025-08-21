-- Fix Security Definer View Issue
-- Replace the security definer view with proper RLS policies

-- 1. DROP the problematic view
DROP VIEW IF EXISTS public.profiles_secure;

-- 2. CREATE a regular view without security definer
CREATE OR REPLACE VIEW public.profiles_secure AS
SELECT 
  id,
  user_id,
  name,
  CASE 
    WHEN auth.uid() = user_id OR is_admin(auth.uid()) THEN email
    ELSE CASE 
      WHEN email IS NOT NULL THEN 
        substring(email from 1 for 2) || '***@' || split_part(email, '@', 2)
      ELSE NULL
    END
  END as email,
  CASE 
    WHEN auth.uid() = user_id OR is_admin(auth.uid()) THEN phone
    ELSE CASE 
      WHEN phone IS NOT NULL THEN '***-***-' || right(phone, 4)
      ELSE NULL
    END
  END as phone,
  CASE 
    WHEN auth.uid() = user_id OR is_admin(auth.uid()) THEN location
    ELSE CASE 
      WHEN location IS NOT NULL THEN split_part(location, ',', -1)
      ELSE NULL
    END
  END as location,
  title,
  company,
  avatar_url,
  city,
  state,
  theme,
  language,
  timezone,
  date_format,
  font_size,
  reduced_motion,
  email_notifications,
  push_notifications,
  marketing_emails,
  marketing_communications,
  course_progress,
  weekly_progress,
  webinar_reminders,
  new_courses,
  join_date,
  created_at,
  updated_at
FROM public.profiles;

-- 3. Enable RLS on the view properly
CREATE POLICY "Users can access secure profile view"
ON public.profiles_secure
FOR SELECT
USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- 4. Update the can_view_sensitive_profile_data function to be simpler
CREATE OR REPLACE FUNCTION public.can_view_sensitive_profile_data(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT (auth.uid() = profile_user_id OR is_admin(auth.uid()));
$$;