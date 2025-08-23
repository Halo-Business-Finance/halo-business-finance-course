-- Create learning statistics table
CREATE TABLE IF NOT EXISTS public.learning_stats (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
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

-- Create RLS policies for learning_stats
CREATE POLICY "Users can view their own learning stats" ON public.learning_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning stats" ON public.learning_stats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning stats" ON public.learning_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all learning stats" ON public.learning_stats
    FOR SELECT USING (is_admin(auth.uid()));

-- Create RLS policies for module_completions
CREATE POLICY "Users can view their own module completions" ON public.module_completions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own module completions" ON public.module_completions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all module completions" ON public.module_completions
    FOR SELECT USING (is_admin(auth.uid()));

-- Create RLS policies for daily_learning_activity
CREATE POLICY "Users can view their own daily activity" ON public.daily_learning_activity
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own daily activity" ON public.daily_learning_activity
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all daily activity" ON public.daily_learning_activity
    FOR SELECT USING (is_admin(auth.uid()));

-- Create RLS policies for learning_achievements
CREATE POLICY "Users can view their own achievements" ON public.learning_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements" ON public.learning_achievements
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all achievements" ON public.learning_achievements
    FOR SELECT USING (is_admin(auth.uid()));

-- Create function to update learning statistics
CREATE OR REPLACE FUNCTION public.update_learning_stats()
RETURNS TRIGGER AS $$
DECLARE
    user_record UUID;
    today_date DATE;
    streak_count INTEGER;
BEGIN
    user_record := COALESCE(NEW.user_id, OLD.user_id);
    today_date := CURRENT_DATE;
    
    -- Update or insert learning stats
    INSERT INTO public.learning_stats (user_id, last_activity_at)
    VALUES (user_record, now())
    ON CONFLICT (user_id) DO UPDATE SET
        last_activity_at = now(),
        updated_at = now();
    
    -- Update daily activity
    INSERT INTO public.daily_learning_activity (user_id, activity_date)
    VALUES (user_record, today_date)
    ON CONFLICT (user_id, activity_date) DO UPDATE SET
        updated_at = now();
    
    -- Calculate and update streak
    WITH consecutive_days AS (
        SELECT 
            activity_date,
            activity_date - ROW_NUMBER() OVER (ORDER BY activity_date)::INTEGER AS grp
        FROM public.daily_learning_activity 
        WHERE user_id = user_record 
        AND activity_date <= today_date
        ORDER BY activity_date DESC
    ),
    streak_groups AS (
        SELECT 
            grp,
            COUNT(*) as consecutive_count,
            MAX(activity_date) as latest_date
        FROM consecutive_days 
        GROUP BY grp
        ORDER BY latest_date DESC
        LIMIT 1
    )
    SELECT COALESCE(consecutive_count, 0) INTO streak_count
    FROM streak_groups
    WHERE latest_date = today_date;
    
    -- Update streak in learning_stats
    UPDATE public.learning_stats 
    SET 
        current_streak_days = COALESCE(streak_count, 0),
        longest_streak_days = GREATEST(longest_streak_days, COALESCE(streak_count, 0))
    WHERE user_id = user_record;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update module completion stats
CREATE OR REPLACE FUNCTION public.update_module_completion_stats()
RETURNS TRIGGER AS $$
DECLARE
    user_record UUID;
    module_count INTEGER;
    time_spent INTEGER;
BEGIN
    user_record := NEW.user_id;
    
    -- Count completed modules
    SELECT COUNT(*) INTO module_count
    FROM public.module_completions
    WHERE user_id = user_record;
    
    -- Sum time spent
    SELECT COALESCE(SUM(time_spent_minutes), 0) INTO time_spent
    FROM public.module_completions
    WHERE user_id = user_record;
    
    -- Update learning stats
    INSERT INTO public.learning_stats (
        user_id, 
        total_modules_completed, 
        total_time_spent_minutes,
        last_activity_at
    )
    VALUES (user_record, module_count, time_spent, now())
    ON CONFLICT (user_id) DO UPDATE SET
        total_modules_completed = module_count,
        total_time_spent_minutes = time_spent,
        last_activity_at = now(),
        updated_at = now();
    
    -- Update daily activity
    INSERT INTO public.daily_learning_activity (
        user_id, 
        activity_date, 
        modules_completed,
        time_spent_minutes
    )
    VALUES (
        user_record, 
        CURRENT_DATE, 
        1,
        COALESCE(NEW.time_spent_minutes, 0)
    )
    ON CONFLICT (user_id, activity_date) DO UPDATE SET
        modules_completed = daily_learning_activity.modules_completed + 1,
        time_spent_minutes = daily_learning_activity.time_spent_minutes + COALESCE(NEW.time_spent_minutes, 0),
        updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update assessment stats
CREATE OR REPLACE FUNCTION public.update_assessment_stats()
RETURNS TRIGGER AS $$
DECLARE
    user_record UUID;
    passed_count INTEGER;
BEGIN
    IF NEW.is_passed = true THEN
        user_record := NEW.user_id;
        
        -- Count passed assessments
        SELECT COUNT(*) INTO passed_count
        FROM public.assessment_attempts
        WHERE user_id = user_record AND is_passed = true;
        
        -- Update learning stats
        INSERT INTO public.learning_stats (
            user_id, 
            total_assessments_passed,
            last_activity_at
        )
        VALUES (user_record, passed_count, now())
        ON CONFLICT (user_id) DO UPDATE SET
            total_assessments_passed = passed_count,
            last_activity_at = now(),
            updated_at = now();
        
        -- Update daily activity
        INSERT INTO public.daily_learning_activity (
            user_id, 
            activity_date, 
            assessments_taken
        )
        VALUES (user_record, CURRENT_DATE, 1)
        ON CONFLICT (user_id, activity_date) DO UPDATE SET
            assessments_taken = daily_learning_activity.assessments_taken + 1,
            updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER trigger_update_module_completion_stats
    AFTER INSERT ON public.module_completions
    FOR EACH ROW EXECUTE FUNCTION public.update_module_completion_stats();

CREATE TRIGGER trigger_update_assessment_stats
    AFTER INSERT ON public.assessment_attempts
    FOR EACH ROW EXECUTE FUNCTION public.update_assessment_stats();

CREATE TRIGGER trigger_update_learning_activity
    AFTER INSERT OR UPDATE ON public.course_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_learning_stats();

-- Enable realtime for all learning stats tables
ALTER TABLE public.learning_stats REPLICA IDENTITY FULL;
ALTER TABLE public.module_completions REPLICA IDENTITY FULL;
ALTER TABLE public.daily_learning_activity REPLICA IDENTITY FULL;
ALTER TABLE public.learning_achievements REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.module_completions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_learning_activity;
ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_achievements;

-- Add unique constraint to learning_stats to ensure one record per user
ALTER TABLE public.learning_stats ADD CONSTRAINT unique_user_stats UNIQUE (user_id);