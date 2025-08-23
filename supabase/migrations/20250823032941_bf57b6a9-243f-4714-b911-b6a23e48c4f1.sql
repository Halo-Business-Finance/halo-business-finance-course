-- Fix the security definer view issue
-- Remove the security definer property from the view and use proper RLS instead

-- Drop the existing view
DROP VIEW IF EXISTS public.secure_profiles;

-- Create the secure view without security definer
CREATE VIEW public.secure_profiles AS
SELECT 
  id,
  user_id,
  -- Mask sensitive fields based on access rights
  CASE 
    WHEN auth.uid() = user_id OR is_admin(auth.uid()) THEN name
    ELSE '***'
  END AS name,
  CASE 
    WHEN auth.uid() = user_id OR is_admin(auth.uid()) THEN email
    ELSE '***@***.***'
  END AS email,
  CASE 
    WHEN auth.uid() = user_id OR is_admin(auth.uid()) THEN phone
    ELSE '***-***-****'
  END AS phone,
  -- Non-sensitive fields remain visible
  title,
  company,
  city,
  state,
  location,
  avatar_url,
  join_date,
  created_at,
  updated_at,
  theme,
  language,
  timezone,
  date_format,
  font_size,
  reduced_motion,
  email_notifications,
  push_notifications,
  marketing_emails,
  course_progress,
  new_courses,
  webinar_reminders,
  weekly_progress,
  marketing_communications,
  data_classification,
  encryption_status
FROM public.profiles
WHERE 
  -- Users can only see their own data or admins can see all
  auth.uid() = user_id OR is_admin(auth.uid());

-- Enable RLS on the view
ALTER TABLE public.secure_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the secure view
CREATE POLICY "Users can view secure profiles" ON public.secure_profiles
FOR SELECT USING (
  auth.uid() = user_id OR is_admin(auth.uid())
);

-- Grant usage on the view to authenticated users
GRANT SELECT ON public.secure_profiles TO authenticated;