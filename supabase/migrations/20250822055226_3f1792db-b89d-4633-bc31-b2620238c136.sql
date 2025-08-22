-- Add the missing SBA Loan Programs course module
INSERT INTO course_modules (
  module_id,
  title,
  description,
  duration,
  skill_level,
  order_index,
  lessons_count,
  prerequisites,
  is_active
) VALUES (
  'sba-loans',
  'SBA Loan Programs',
  'Comprehensive guide to Small Business Administration loan programs, application processes, and compliance requirements for commercial lenders.',
  '3 hours',
  'intermediate',
  2,
  14,
  ARRAY['foundations'],
  true
)
ON CONFLICT (module_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = now();

-- Add Conventional Lending course
INSERT INTO course_modules (
  module_id,
  title,
  description,
  duration,
  skill_level,
  order_index,
  lessons_count,
  prerequisites,
  is_active
) VALUES (
  'conventional-loans',
  'Conventional Lending',
  'Master conventional loan products, underwriting standards, and portfolio management strategies for traditional commercial lending.',
  '2.5 hours',
  'intermediate',
  3,
  12,
  ARRAY['foundations'],
  true
)
ON CONFLICT (module_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = now();

-- Add Bridge Financing course
INSERT INTO course_modules (
  module_id,
  title,
  description,
  duration,
  skill_level,
  order_index,
  lessons_count,
  prerequisites,
  is_active
) VALUES (
  'bridge-loans',
  'Bridge Financing',
  'Learn short-term financing solutions, deal structuring, and risk management for bridge loan products.',
  '2 hours',
  'expert',
  4,
  10,
  ARRAY['conventional-loans', 'sba-loans'],
  true
)
ON CONFLICT (module_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = now();

-- Add Alternative Finance course
INSERT INTO course_modules (
  module_id,
  title,
  description,
  duration,
  skill_level,
  order_index,
  lessons_count,
  prerequisites,
  is_active
) VALUES (
  'alternative-finance',
  'Alternative Finance',
  'Explore non-traditional financing options including equipment financing, factoring, and merchant cash advances.',
  '2.5 hours',
  'expert',
  5,
  11,
  ARRAY['conventional-loans'],
  true
)
ON CONFLICT (module_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = now();

-- Add Credit Analysis course
INSERT INTO course_modules (
  module_id,
  title,
  description,
  duration,
  skill_level,
  order_index,
  lessons_count,
  prerequisites,
  is_active
) VALUES (
  'credit-risk',
  'Credit Analysis',
  'Advanced credit risk assessment techniques, financial statement analysis, and decision-making frameworks.',
  '3.5 hours',
  'expert',
  6,
  16,
  ARRAY['foundations', 'conventional-loans'],
  true
)
ON CONFLICT (module_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = now();

-- Update existing courses to proper order
UPDATE course_modules SET order_index = 7 WHERE module_id = 'risk-management';
UPDATE course_modules SET order_index = 8 WHERE module_id = 'capital-markets';
UPDATE course_modules SET order_index = 9 WHERE module_id = 'regulatory-compliance';
UPDATE course_modules SET order_index = 10 WHERE module_id = 'commercial-underwriting';
UPDATE course_modules SET order_index = 11 WHERE module_id = 'portfolio-management';
UPDATE course_modules SET order_index = 12 WHERE module_id = 'digital-transformation';
UPDATE course_modules SET order_index = 13 WHERE module_id = 'leadership-development';