-- Fix the search path security issue
CREATE OR REPLACE FUNCTION auto_enroll_in_course()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-enroll new users in the main course
  INSERT INTO course_enrollments (user_id, course_id, status)
  VALUES (NEW.user_id, 'halo-launch-pad-learn', 'active');
  
  RETURN NEW;
END;
$$;