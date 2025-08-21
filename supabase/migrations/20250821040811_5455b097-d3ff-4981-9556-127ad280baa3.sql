-- Clear all user progress data for fresh start
-- This will remove course enrollments and security events while keeping user accounts

-- Clear all course enrollments (this resets all course progress)
DELETE FROM public.course_enrollments;

-- Clear all security events for a fresh start
DELETE FROM public.security_events;

-- Reset any progress-related fields in profiles (if any exist)
-- Keep user accounts and basic profile info intact