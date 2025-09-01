-- Update intermediate skill level modules to expert level
-- since loan originator programs only have beginner and expert
UPDATE course_modules 
SET skill_level = 'expert' 
WHERE skill_level = 'intermediate';

-- Add a comment for clarity
COMMENT ON COLUMN course_modules.skill_level IS 'Skill level for loan originator programs: beginner or expert only';