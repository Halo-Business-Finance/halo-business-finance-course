-- Delete the correct Loan Originator Professional Training Course and all associated data
-- The correct ID is 'loan-originator' not 'loan-originator-professional'

-- First delete case studies associated with modules of this course
DELETE FROM case_studies 
WHERE module_id IN (
  SELECT id FROM course_content_modules 
  WHERE course_id = 'loan-originator'
);

-- Delete course videos associated with modules of this course
DELETE FROM course_videos 
WHERE module_id IN (
  SELECT id FROM course_content_modules 
  WHERE course_id = 'loan-originator'
);

-- Delete course documents associated with modules of this course
DELETE FROM course_documents 
WHERE module_id IN (
  SELECT id FROM course_content_modules 
  WHERE course_id = 'loan-originator'
);

-- Delete course articles associated with modules of this course
DELETE FROM course_articles 
WHERE module_id IN (
  SELECT id FROM course_content_modules 
  WHERE course_id = 'loan-originator'
);

-- Delete course assessments for this course
DELETE FROM course_assessments 
WHERE module_id IN (
  SELECT id FROM course_content_modules 
  WHERE course_id = 'loan-originator'
);

-- Delete course progress for this course
DELETE FROM course_progress 
WHERE course_id = 'loan-originator';

-- Delete course enrollments for this course
DELETE FROM course_enrollments 
WHERE course_id = 'loan-originator';

-- Delete modules from course_content_modules table
DELETE FROM course_content_modules 
WHERE course_id = 'loan-originator';

-- Delete modules from course_modules table that have this course_id
DELETE FROM course_modules 
WHERE course_id = 'loan-originator';

-- Finally delete the main course with correct ID
DELETE FROM courses 
WHERE id = 'loan-originator';