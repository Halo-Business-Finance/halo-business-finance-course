-- Remove intermediate skill level from database schema and data

-- First, update any existing 'intermediate' skill levels to 'expert' using text comparison
UPDATE course_modules 
SET skill_level = 'expert'::skill_level
WHERE skill_level::text = 'intermediate';

UPDATE adaptive_module_instances 
SET current_difficulty_level = 'expert'
WHERE current_difficulty_level = 'intermediate';

UPDATE adaptive_modules 
SET difficulty_level = 'expert'
WHERE difficulty_level = 'intermediate';

-- Now drop and recreate the skill_level enum to only include beginner and expert
ALTER TYPE skill_level RENAME TO skill_level_old;

CREATE TYPE skill_level AS ENUM ('beginner', 'expert');

-- Update the course_modules table to use the new enum
ALTER TABLE course_modules 
ALTER COLUMN skill_level TYPE skill_level 
USING CASE 
  WHEN skill_level_old::text = 'intermediate' THEN 'expert'::skill_level
  ELSE skill_level_old::text::skill_level 
END;

-- Drop the old enum type
DROP TYPE skill_level_old;