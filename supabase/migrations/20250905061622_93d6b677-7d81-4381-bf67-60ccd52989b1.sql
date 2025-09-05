-- Enable real-time updates for admin dashboard tables
-- Set replica identity to capture full row data
ALTER TABLE public.security_events REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL; 
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;

-- Add tables to supabase_realtime publication to enable real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;