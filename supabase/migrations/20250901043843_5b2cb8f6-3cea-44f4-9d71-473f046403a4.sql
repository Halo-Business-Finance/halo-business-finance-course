-- Delete all incorrect course data to start fresh
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

-- Reset any auto-increment sequences if they exist
-- This ensures clean IDs when we add new courses later

-- Log the cleanup
INSERT INTO security_events (event_type, severity, details)
VALUES (
  'course_data_cleanup',
  'low',
  jsonb_build_object(
    'action', 'deleted_all_incorrect_course_data',
    'reason', 'preparing_for_fresh_course_setup',
    'timestamp', now(),
    'tables_cleaned', ARRAY['courses', 'course_modules', 'course_content_modules', 'course_videos', 'course_articles', 'course_documents', 'course_assessments', 'case_studies']
  )
);