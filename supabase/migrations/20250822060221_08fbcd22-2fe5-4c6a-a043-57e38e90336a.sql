-- Deactivate the extra courses that weren't in the original sidebar
UPDATE course_modules SET is_active = false 
WHERE module_id IN (
  'risk-management',
  'commercial-underwriting', 
  'portfolio-management',
  'digital-transformation',
  'leadership-development'
);

-- Update the order indexes for the remaining original courses
UPDATE course_modules SET order_index = 0 WHERE module_id = 'foundations';
UPDATE course_modules SET order_index = 1 WHERE module_id = 'capital-markets';
UPDATE course_modules SET order_index = 2 WHERE module_id = 'sba-loans';
UPDATE course_modules SET order_index = 3 WHERE module_id = 'conventional-loans';
UPDATE course_modules SET order_index = 4 WHERE module_id = 'bridge-loans';
UPDATE course_modules SET order_index = 5 WHERE module_id = 'alternative-finance';
UPDATE course_modules SET order_index = 6 WHERE module_id = 'credit-risk';
UPDATE course_modules SET order_index = 7 WHERE module_id = 'regulatory-compliance';