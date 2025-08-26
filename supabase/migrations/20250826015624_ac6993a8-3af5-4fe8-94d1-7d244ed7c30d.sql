-- Update all course modules to beginner skill level
UPDATE course_modules 
SET skill_level = 'beginner'
WHERE skill_level != 'beginner';