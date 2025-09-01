-- Populate the courses table from existing course_modules data
-- This will make your 13 courses visible in the Course Manager

-- First, let's see what we have in course_modules
INSERT INTO courses (id, title, description, level, is_active, order_index, created_at, updated_at)
SELECT 
  module_id as id,
  title,
  description,
  CASE 
    WHEN skill_level = 'beginner' THEN 'beginner'
    WHEN skill_level = 'intermediate' THEN 'intermediate'  
    WHEN skill_level = 'expert' THEN 'expert'
    ELSE 'beginner'
  END as level,
  is_active,
  order_index,
  created_at,
  updated_at
FROM course_modules
WHERE NOT EXISTS (
  SELECT 1 FROM courses WHERE courses.id = course_modules.module_id
);

-- Also ensure any future course_modules get added to courses table
CREATE OR REPLACE FUNCTION sync_course_modules_to_courses()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to keep courses table in sync
DROP TRIGGER IF EXISTS sync_course_modules_trigger ON course_modules;
CREATE TRIGGER sync_course_modules_trigger
  AFTER INSERT OR UPDATE ON course_modules
  FOR EACH ROW EXECUTE FUNCTION sync_course_modules_to_courses();