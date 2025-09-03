-- Add a status column to course_enrollments to track if a course is actively being studied
ALTER TABLE course_enrollments 
ADD COLUMN IF NOT EXISTS is_active_study boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS started_module_id text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS study_started_at timestamp with time zone DEFAULT NULL;

-- Create function to lock other courses when user starts a module
CREATE OR REPLACE FUNCTION public.lock_other_courses_on_module_start()
RETURNS TRIGGER AS $$
BEGIN
  -- When a user starts progress on a module (first time), lock other courses
  IF OLD.progress_percentage = 0 AND NEW.progress_percentage > 0 THEN
    -- Set the current course as actively being studied
    UPDATE course_enrollments 
    SET 
      is_active_study = true,
      started_module_id = NEW.module_id,
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
        'started_module_id', NEW.module_id,
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

-- Create trigger for course locking
CREATE TRIGGER lock_courses_on_module_start
  AFTER UPDATE ON course_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.lock_other_courses_on_module_start();

-- Function to unlock courses when user completes their active course
CREATE OR REPLACE FUNCTION public.unlock_courses_on_completion(p_user_id uuid, p_course_id text)
RETURNS void AS $$
BEGIN
  -- Check if user has completed all modules in the active course
  IF NOT EXISTS (
    SELECT 1 FROM course_content_modules ccm
    LEFT JOIN course_progress cp ON ccm.id = cp.module_id AND cp.user_id = p_user_id
    WHERE ccm.course_id = p_course_id 
    AND ccm.is_active = true
    AND (cp.progress_percentage IS NULL OR cp.progress_percentage < 100)
  ) THEN
    -- All modules completed, unlock other courses
    UPDATE course_enrollments 
    SET 
      status = 'active',
      updated_at = now()
    WHERE user_id = p_user_id 
    AND status = 'locked_studying_other';
    
    -- Mark current course study as completed
    UPDATE course_enrollments 
    SET 
      is_active_study = false,
      started_module_id = NULL,
      updated_at = now()
    WHERE user_id = p_user_id 
    AND course_id = p_course_id;
    
    -- Log the course unlocking event
    INSERT INTO security_events (user_id, event_type, severity, details)
    VALUES (
      p_user_id,
      'courses_unlocked_course_completed',
      'low',
      jsonb_build_object(
        'completed_course_id', p_course_id,
        'unlocked_courses_count', (
          SELECT COUNT(*) FROM course_enrollments 
          WHERE user_id = p_user_id 
          AND status = 'active'
        ),
        'timestamp', now()
      )
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update course_enrollments RLS policy to handle locked courses
DROP POLICY IF EXISTS "Users can view their own enrollments" ON course_enrollments;
CREATE POLICY "Users can view their own enrollments" 
ON course_enrollments 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for course access based on study status
CREATE OR REPLACE FUNCTION public.can_access_course(p_course_id text, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  -- Admins can access all courses
  IF is_admin(p_user_id) THEN
    RETURN true;
  END IF;
  
  -- Check if user is enrolled and course is not locked
  RETURN EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE user_id = p_user_id 
    AND course_id = p_course_id 
    AND status IN ('active', 'completed')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;