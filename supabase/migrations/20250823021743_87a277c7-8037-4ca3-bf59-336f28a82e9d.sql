-- Create function to update learning statistics with proper security
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to update module completion stats with proper security
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to update assessment stats with proper security
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_module_completion_stats ON public.module_completions;
DROP TRIGGER IF EXISTS trigger_update_assessment_stats ON public.assessment_attempts;
DROP TRIGGER IF EXISTS trigger_update_learning_activity ON public.course_progress;

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
DO $$
BEGIN
    -- Check if tables are already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'learning_stats'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_stats;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'module_completions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.module_completions;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'daily_learning_activity'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_learning_activity;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'learning_achievements'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_achievements;
    END IF;
END $$;