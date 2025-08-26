-- Create missing tables for comprehensive learning platform

-- Learning sessions table
CREATE TABLE public.learning_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_id TEXT,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('study', 'assessment', 'review', 'practice')),
  duration_minutes INTEGER DEFAULT 0,
  focus_score INTEGER DEFAULT 100,
  interaction_count INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Learning events table for analytics tracking
CREATE TABLE public.learning_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own learning sessions" 
ON public.learning_sessions 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own learning events" 
ON public.learning_events 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all learning sessions" 
ON public.learning_sessions 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all learning events" 
ON public.learning_events 
FOR SELECT 
USING (is_admin(auth.uid()));