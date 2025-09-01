-- Update the courses table to support 'none' as a skill level
-- First check if the level column exists and add the new constraint
DO $$
BEGIN
    -- Drop the existing check constraint if it exists
    ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_level_check;
    
    -- Add new constraint that includes 'none' as a valid level
    ALTER TABLE courses ADD CONSTRAINT courses_level_check 
    CHECK (level IN ('beginner', 'intermediate', 'expert', 'none'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;