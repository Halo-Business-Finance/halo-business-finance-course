-- Replace SBA Express module with Capital Markets module
UPDATE course_modules SET 
  title = 'Capital Markets & Commercial Finance',
  description = 'Understand capital markets, commercial finance structures, and investment banking principles for business lending and growth capital.',
  module_id = 'capital-markets'
WHERE module_id = 'sba-express-loans';