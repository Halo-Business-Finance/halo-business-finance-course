-- Delete all incorrect course data to start fresh (simplified)
-- This will clear out the migrated data that was incorrect

-- First, disable the trigger to avoid conflicts during cleanup
DROP TRIGGER IF EXISTS sync_course_modules_trigger ON course_modules;

-- Delete all courses from the courses table
DELETE FROM courses;

-- Delete all course modules from course_modules table  
DELETE FROM course_modules;

-- Also clean up related course content to avoid orphaned data
DELETE FROM course_content_modules;
DELETE FROM course_videos;
DELETE FROM course_articles;
DELETE FROM course_documents;
DELETE FROM course_assessments;
DELETE FROM case_studies;