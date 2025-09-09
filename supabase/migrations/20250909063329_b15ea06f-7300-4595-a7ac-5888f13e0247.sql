-- Add quiz completion tracking to course_progress table
ALTER TABLE course_progress 
ADD COLUMN quiz_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN quiz_score INTEGER DEFAULT 0,
ADD COLUMN quiz_attempts INTEGER DEFAULT 0;