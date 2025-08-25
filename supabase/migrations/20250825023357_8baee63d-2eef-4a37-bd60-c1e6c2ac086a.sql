-- Clean up orphaned data for user that was deleted from auth but remains in our tables
-- Remove from user_roles table
DELETE FROM public.user_roles 
WHERE user_id = '71ac2b44-b866-43e0-8895-1036f0cdf4f0';

-- Remove from profiles table if exists
DELETE FROM public.profiles 
WHERE user_id = '71ac2b44-b866-43e0-8895-1036f0cdf4f0';

-- Remove from any other tables that might reference this user
DELETE FROM public.course_enrollments 
WHERE user_id = '71ac2b44-b866-43e0-8895-1036f0cdf4f0';

DELETE FROM public.learning_stats 
WHERE user_id = '71ac2b44-b866-43e0-8895-1036f0cdf4f0';

DELETE FROM public.daily_learning_activity 
WHERE user_id = '71ac2b44-b866-43e0-8895-1036f0cdf4f0';