-- Fix 1: Remove direct auth.users references and Fix 3: Make user_id NOT NULL where needed

-- First, let's make user_id columns NOT NULL where RLS depends on them
-- This prevents RLS violations from nullable user_id fields

-- assessment_attempts - user_id should be NOT NULL as RLS depends on it
ALTER TABLE public.assessment_attempts 
ALTER COLUMN user_id SET NOT NULL;

-- course_enrollments - user_id should be NOT NULL as RLS depends on it  
ALTER TABLE public.course_enrollments 
ALTER COLUMN user_id SET NOT NULL;

-- course_progress - user_id should be NOT NULL as RLS depends on it
ALTER TABLE public.course_progress 
ALTER COLUMN user_id SET NOT NULL;

-- daily_learning_activity - user_id should be NOT NULL as RLS depends on it
ALTER TABLE public.daily_learning_activity 
ALTER COLUMN user_id SET NOT NULL;

-- learning_achievements - user_id should be NOT NULL as RLS depends on it
ALTER TABLE public.learning_achievements 
ALTER COLUMN user_id SET NOT NULL;

-- learning_stats - user_id should be NOT NULL as RLS depends on it
ALTER TABLE public.learning_stats 
ALTER COLUMN user_id SET NOT NULL;

-- module_completions - user_id should be NOT NULL as RLS depends on it
ALTER TABLE public.module_completions 
ALTER COLUMN user_id SET NOT NULL;

-- notifications - user_id should be NOT NULL as RLS depends on it
ALTER TABLE public.notifications 
ALTER COLUMN user_id SET NOT NULL;

-- profiles - user_id should be NOT NULL as RLS depends on it
ALTER TABLE public.profiles 
ALTER COLUMN user_id SET NOT NULL;

-- enhanced_mfa - user_id should be NOT NULL as RLS depends on it
ALTER TABLE public.enhanced_mfa 
ALTER COLUMN user_id SET NOT NULL;

-- enhanced_device_security - user_id should be NOT NULL as RLS depends on it  
ALTER TABLE public.enhanced_device_security 
ALTER COLUMN user_id SET NOT NULL;

-- Create indexes on user_id columns for better performance
-- This helps with RLS policy checks and user-specific queries

CREATE INDEX IF NOT EXISTS idx_assessment_attempts_user_id ON public.assessment_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON public.course_enrollments (user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_user_id ON public.course_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_daily_learning_activity_user_id ON public.daily_learning_activity (user_id);
CREATE INDEX IF NOT EXISTS idx_learning_achievements_user_id ON public.learning_achievements (user_id);
CREATE INDEX IF NOT EXISTS idx_learning_stats_user_id ON public.learning_stats (user_id);
CREATE INDEX IF NOT EXISTS idx_module_completions_user_id ON public.module_completions (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_mfa_user_id ON public.enhanced_mfa (user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_device_security_user_id ON public.enhanced_device_security (user_id);

-- Fix potential foreign key issues by ensuring proper cascade behavior
-- Update any foreign key constraints to reference profiles.user_id instead of auth.users.id where appropriate

-- Note: Most tables already properly reference auth.users.id with CASCADE DELETE
-- which is correct. The profiles table acts as the bridge between auth.users and application data.