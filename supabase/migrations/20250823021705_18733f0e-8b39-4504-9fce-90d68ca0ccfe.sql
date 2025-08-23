-- Create learning statistics table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.learning_stats (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    total_modules_completed INTEGER DEFAULT 0,
    total_assessments_passed INTEGER DEFAULT 0,
    total_time_spent_minutes INTEGER DEFAULT 0,
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create module completion tracking
CREATE TABLE IF NOT EXISTS public.module_completions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    module_id TEXT NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    time_spent_minutes INTEGER DEFAULT 0,
    score INTEGER DEFAULT NULL
);

-- Create daily learning activity tracking
CREATE TABLE IF NOT EXISTS public.daily_learning_activity (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    activity_date DATE NOT NULL,
    modules_completed INTEGER DEFAULT 0,
    assessments_taken INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, activity_date)
);

-- Create learning achievements table
CREATE TABLE IF NOT EXISTS public.learning_achievements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    achievement_type TEXT NOT NULL,
    achievement_title TEXT NOT NULL,
    achievement_description TEXT,
    earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on all tables
ALTER TABLE public.learning_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_learning_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies (only if they don't exist)
DO $$ 
BEGIN
    -- Learning stats policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learning_stats' AND policyname = 'Users can view their own learning stats') THEN
        EXECUTE 'CREATE POLICY "Users can view their own learning stats" ON public.learning_stats FOR SELECT USING (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learning_stats' AND policyname = 'Users can update their own learning stats') THEN
        EXECUTE 'CREATE POLICY "Users can update their own learning stats" ON public.learning_stats FOR UPDATE USING (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learning_stats' AND policyname = 'Users can insert their own learning stats') THEN
        EXECUTE 'CREATE POLICY "Users can insert their own learning stats" ON public.learning_stats FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learning_stats' AND policyname = 'Admins can view all learning stats') THEN
        EXECUTE 'CREATE POLICY "Admins can view all learning stats" ON public.learning_stats FOR SELECT USING (is_admin(auth.uid()))';
    END IF;
    
    -- Module completions policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'module_completions' AND policyname = 'Users can view their own module completions') THEN
        EXECUTE 'CREATE POLICY "Users can view their own module completions" ON public.module_completions FOR SELECT USING (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'module_completions' AND policyname = 'Users can insert their own module completions') THEN
        EXECUTE 'CREATE POLICY "Users can insert their own module completions" ON public.module_completions FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'module_completions' AND policyname = 'Admins can view all module completions') THEN
        EXECUTE 'CREATE POLICY "Admins can view all module completions" ON public.module_completions FOR SELECT USING (is_admin(auth.uid()))';
    END IF;
    
    -- Daily activity policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_learning_activity' AND policyname = 'Users can view their own daily activity') THEN
        EXECUTE 'CREATE POLICY "Users can view their own daily activity" ON public.daily_learning_activity FOR SELECT USING (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_learning_activity' AND policyname = 'Users can manage their own daily activity') THEN
        EXECUTE 'CREATE POLICY "Users can manage their own daily activity" ON public.daily_learning_activity FOR ALL USING (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_learning_activity' AND policyname = 'Admins can view all daily activity') THEN
        EXECUTE 'CREATE POLICY "Admins can view all daily activity" ON public.daily_learning_activity FOR SELECT USING (is_admin(auth.uid()))';
    END IF;
    
    -- Achievements policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learning_achievements' AND policyname = 'Users can view their own achievements') THEN
        EXECUTE 'CREATE POLICY "Users can view their own achievements" ON public.learning_achievements FOR SELECT USING (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learning_achievements' AND policyname = 'System can create achievements') THEN
        EXECUTE 'CREATE POLICY "System can create achievements" ON public.learning_achievements FOR INSERT WITH CHECK (true)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learning_achievements' AND policyname = 'Admins can view all achievements') THEN
        EXECUTE 'CREATE POLICY "Admins can view all achievements" ON public.learning_achievements FOR SELECT USING (is_admin(auth.uid()))';
    END IF;
END $$;