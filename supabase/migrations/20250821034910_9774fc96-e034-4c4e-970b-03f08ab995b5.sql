-- Add preferences columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'light',
ADD COLUMN IF NOT EXISTS language text DEFAULT 'en',
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'est',
ADD COLUMN IF NOT EXISTS date_format text DEFAULT 'mdy',
ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS push_notifications boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS marketing_emails boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS reduced_motion boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS course_progress boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS new_courses boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS webinar_reminders boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS weekly_progress boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS marketing_communications boolean DEFAULT false;