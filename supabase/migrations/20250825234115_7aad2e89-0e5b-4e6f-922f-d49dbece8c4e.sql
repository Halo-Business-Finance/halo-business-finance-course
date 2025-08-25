-- Fix all remaining functions that need proper search_path settings

-- Update all functions that don't have SET search_path specified
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_leads_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_enroll_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Auto-enroll the new user
  INSERT INTO public.user_enrollments (user_id, enrollment_type)
  VALUES (NEW.id, 'automatic');
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_enroll_in_course()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Auto-enroll new users in the main course
  INSERT INTO course_enrollments (user_id, course_id, status)
  VALUES (NEW.user_id, 'halo-launch-pad-learn', 'active');
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_role_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow the setup_initial_admin function to bypass restrictions
  IF current_setting('application_name', true) = 'setup_initial_admin' THEN
    RETURN NEW;
  END IF;
  
  -- Prevent users from assigning themselves admin roles (except during initial setup)
  IF NEW.user_id = auth.uid() AND NEW.role IN ('admin', 'super_admin', 'tech_support_admin') THEN
    RAISE EXCEPTION 'Users cannot assign admin roles to themselves';
  END IF;
  
  -- Only super_admin can assign super_admin roles
  IF NEW.role = 'super_admin' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Only super admins can assign super admin roles';
    END IF;
  END IF;

  -- Only super_admin or admin can assign tech_support_admin roles  
  IF NEW.role = 'tech_support_admin' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Only super admins or admins can assign tech support admin roles';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_learning_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;