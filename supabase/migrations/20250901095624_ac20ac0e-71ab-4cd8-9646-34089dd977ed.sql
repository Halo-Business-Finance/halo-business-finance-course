-- Delete Loan Originator Professional Training Course and all associated data

-- First delete case studies associated with modules of this course
DELETE FROM case_studies 
WHERE module_id IN (
  SELECT id FROM course_content_modules 
  WHERE course_id = 'loan-originator-professional'
);

-- Delete course videos associated with modules of this course
DELETE FROM course_videos 
WHERE module_id IN (
  SELECT id FROM course_content_modules 
  WHERE course_id = 'loan-originator-professional'
);

-- Delete course documents associated with modules of this course
DELETE FROM course_documents 
WHERE module_id IN (
  SELECT id FROM course_content_modules 
  WHERE course_id = 'loan-originator-professional'
);

-- Delete course articles associated with modules of this course
DELETE FROM course_articles 
WHERE module_id IN (
  SELECT id FROM course_content_modules 
  WHERE course_id = 'loan-originator-professional'
);

-- Delete course progress for this course
DELETE FROM course_progress 
WHERE course_id = 'loan-originator-professional';

-- Delete course enrollments for this course
DELETE FROM course_enrollments 
WHERE course_id = 'loan-originator-professional';

-- Delete modules from course_content_modules table
DELETE FROM course_content_modules 
WHERE course_id = 'loan-originator-professional';

-- Delete modules from course_modules table that have this course_id
DELETE FROM course_modules 
WHERE course_id = 'loan-originator-professional';

-- Finally delete the main course
DELETE FROM courses 
WHERE id = 'loan-originator-professional';