-- Clean up incorrect course modules that don't belong to the main loan categories
-- Delete all modules that aren't part of the three main loan categories
DELETE FROM course_modules 
WHERE course_id NOT IN ('loan-originator', 'loan-processing', 'loan-underwriting') 
   OR course_id IS NULL;