-- Remove intermediate skill level from database schema and data

-- First, convert skill_level column to text temporarily
ALTER TABLE course_modules ALTER COLUMN skill_level TYPE text;

-- Update any existing 'intermediate' skill levels to 'expert'
UPDATE course_modules 
SET skill_level = 'expert'
WHERE skill_level = 'intermediate';

UPDATE adaptive_module_instances 
SET current_difficulty_level = 'expert'
WHERE current_difficulty_level = 'intermediate';

UPDATE adaptive_modules 
SET difficulty_level = 'expert'
WHERE difficulty_level = 'intermediate';

-- Drop the old enum type
DROP TYPE skill_level;

-- Create new skill_level enum with only beginner and expert
CREATE TYPE skill_level AS ENUM ('beginner', 'expert');

-- Convert the column back to use the new enum
ALTER TABLE course_modules 
ALTER COLUMN skill_level TYPE skill_level USING skill_level::skill_level;