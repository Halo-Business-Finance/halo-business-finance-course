-- Fix the security warning by setting search_path for the function
CREATE OR REPLACE FUNCTION sync_course_modules_to_courses()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert or update in courses table when course_modules changes
  INSERT INTO courses (id, title, description, level, is_active, order_index, created_at, updated_at)
  VALUES (
    NEW.module_id,
    NEW.title, 
    NEW.description,
    CASE 
      WHEN NEW.skill_level = 'beginner' THEN 'beginner'
      WHEN NEW.skill_level = 'intermediate' THEN 'intermediate'
      WHEN NEW.skill_level = 'expert' THEN 'expert'
      ELSE 'beginner'
    END,
    NEW.is_active,
    NEW.order_index,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    level = EXCLUDED.level,
    is_active = EXCLUDED.is_active,
    order_index = EXCLUDED.order_index,
    updated_at = EXCLUDED.updated_at;
    
  RETURN NEW;
END;
$$;