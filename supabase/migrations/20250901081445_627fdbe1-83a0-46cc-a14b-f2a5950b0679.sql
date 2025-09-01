-- Remove intermediate level courses for Loan Originator courses
-- These are courses that don't contain 'processing' or 'underwriting' in their titles

DELETE FROM courses 
WHERE level = 'intermediate' 
AND title NOT ILIKE '%processing%' 
AND title NOT ILIKE '%underwriting%';

-- Update the constraint to reflect that we now only support beginner, expert, and none levels for new courses
-- (keeping 'intermediate' for existing Processing and Underwriting courses)
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_level_check;
ALTER TABLE courses ADD CONSTRAINT courses_level_check 
CHECK (level IN ('beginner', 'intermediate', 'expert', 'none'));