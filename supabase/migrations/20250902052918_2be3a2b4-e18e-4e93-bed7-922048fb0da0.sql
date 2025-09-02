-- Remove intermediate skill level from database
-- 1. First, delete all courses with intermediate level
DELETE FROM courses WHERE level = 'intermediate';

-- 2. Delete all course modules with intermediate skill level
DELETE FROM course_modules WHERE skill_level = 'intermediate';

-- 3. Update the skill_level enum to only include beginner and expert
ALTER TYPE skill_level RENAME TO skill_level_old;
CREATE TYPE skill_level AS ENUM ('beginner', 'expert');

-- 4. Update course_modules table to use new enum
ALTER TABLE course_modules 
ALTER COLUMN skill_level TYPE skill_level 
USING skill_level::text::skill_level;

-- 5. Drop the old enum
DROP TYPE skill_level_old;

-- 6. Log the cleanup
INSERT INTO public.security_events (
  event_type,
  severity,
  details,
  logged_via_secure_function
) VALUES (
  'intermediate_skill_levels_removed',
  'low',
  jsonb_build_object(
    'timestamp', now(),
    'action', 'removed_all_intermediate_skill_levels',
    'changes_applied', ARRAY[
      'deleted_intermediate_courses_from_courses_table',
      'deleted_intermediate_modules_from_course_modules_table',
      'updated_skill_level_enum_to_beginner_expert_only'
    ],
    'remaining_skill_levels', ARRAY['beginner', 'expert']
  ),
  true
);