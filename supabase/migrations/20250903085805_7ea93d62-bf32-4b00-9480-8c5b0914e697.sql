-- Fix the trigger function to use correct column names
CREATE OR REPLACE FUNCTION public.lock_other_courses_on_module_start()
RETURNS TRIGGER AS $$
BEGIN
  -- When a user starts progress on a module (first time), lock other courses
  IF OLD.progress_percentage = 0 AND NEW.progress_percentage > 0 THEN
    -- Set the current course as actively being studied
    UPDATE course_enrollments 
    SET 
      is_active_study = true,
      started_module_id = NEW.lesson_id, -- Use lesson_id from course_progress
      study_started_at = now(),
      updated_at = now()
    WHERE user_id = NEW.user_id 
    AND course_id = NEW.course_id;
    
    -- Lock all other enrolled courses for this user
    UPDATE course_enrollments 
    SET 
      status = 'locked_studying_other',
      updated_at = now()
    WHERE user_id = NEW.user_id 
    AND course_id != NEW.course_id 
    AND status = 'active';
    
    -- Log the course locking event
    INSERT INTO security_events (user_id, event_type, severity, details)
    VALUES (
      NEW.user_id,
      'courses_locked_module_started',
      'low',
      jsonb_build_object(
        'active_course_id', NEW.course_id,
        'started_module_id', NEW.lesson_id,
        'locked_courses_count', (
          SELECT COUNT(*) FROM course_enrollments 
          WHERE user_id = NEW.user_id 
          AND course_id != NEW.course_id 
          AND status = 'locked_studying_other'
        ),
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;