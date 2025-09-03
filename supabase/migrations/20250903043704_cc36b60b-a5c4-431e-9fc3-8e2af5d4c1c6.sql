-- Remove duplicate loan processing courses that were created
DELETE FROM course_content_modules WHERE course_id IN (
  'loan-application-processing',
  'loan-documentation-verification', 
  'loan-workflow-management',
  'loan-closing-procedures',
  'commercial-loan-processing-advanced',
  'sba-loan-processing-specialist'
);

-- Remove the duplicate loan processing courses  
DELETE FROM courses WHERE id IN (
  'loan-application-processing',
  'loan-documentation-verification',
  'loan-workflow-management', 
  'loan-closing-procedures',
  'commercial-loan-processing-advanced',
  'sba-loan-processing-specialist'
);