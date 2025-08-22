-- Strategy: Create new course modules with Halo Business Finance loan products, then migrate data

-- Insert new course modules based on Halo Business Finance's actual loan products
INSERT INTO course_modules (module_id, title, description, order_index, skill_level, is_active, lessons_count, duration) VALUES
('sba-7a-loans', 'SBA 7(a) Loans', 'Master SBA 7(a) loan programs - versatile financing for working capital, equipment, and real estate purchases up to $5 million.', 0, 'beginner', true, 8, '2-3 hours'),
('sba-504-loans', 'SBA 504 Loans', 'Learn SBA 504 loan structures for real estate and major equipment purchases with fixed-rate financing and only 10% down payment required.', 1, 'intermediate', true, 6, '2 hours'),
('sba-express-loans', 'SBA Express Loans', 'Fast-track SBA financing with expedited approval process. Up to $500,000 with 36-hour approval timeline guaranteed.', 2, 'beginner', true, 5, '1.5 hours'),
('usda-bi-loans', 'USDA B&I Loans', 'Rural business development financing backed by USDA guarantee. Up to $25 million for rural area businesses.', 3, 'intermediate', true, 7, '2.5 hours'),
('working-capital', 'Working Capital Solutions', 'Bridge cash flow gaps and fund day-to-day business operations with flexible working capital and revolving credit lines.', 4, 'beginner', true, 6, '2 hours'),
('business-line-of-credit', 'Business Line of Credit', 'Flexible access to capital when you need it with revolving credit lines. Draw funds as needed and pay interest only on used funds.', 5, 'intermediate', true, 7, '2.5 hours'),
('term-loans', 'Term Loans & Fixed Rate Financing', 'Fixed-rate business loans for major investments and growth initiatives with competitive rates and fixed monthly payments.', 6, 'intermediate', true, 8, '3 hours'),
('lending-process', 'Commercial Lending Process & Underwriting', 'Master the streamlined commercial lending process, from application to approval, including credit analysis and risk assessment.', 7, 'advanced', true, 10, '4 hours')
ON CONFLICT (module_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  skill_level = EXCLUDED.skill_level,
  lessons_count = EXCLUDED.lessons_count,
  duration = EXCLUDED.duration;

-- Now update related tables to reference the new modules (copy data from old to new)
-- Update course_documents
UPDATE course_documents SET module_id = 'sba-7a-loans' WHERE module_id = 'foundations';
UPDATE course_documents SET module_id = 'sba-504-loans' WHERE module_id = 'capital-markets';
UPDATE course_documents SET module_id = 'sba-express-loans' WHERE module_id = 'sba-loans';
UPDATE course_documents SET module_id = 'usda-bi-loans' WHERE module_id = 'conventional-loans';
UPDATE course_documents SET module_id = 'working-capital' WHERE module_id = 'bridge-loans';
UPDATE course_documents SET module_id = 'business-line-of-credit' WHERE module_id = 'alternative-finance';
UPDATE course_documents SET module_id = 'term-loans' WHERE module_id = 'credit-risk';
UPDATE course_documents SET module_id = 'lending-process' WHERE module_id = 'regulatory-compliance';

-- Update course_videos
UPDATE course_videos SET module_id = 'sba-7a-loans' WHERE module_id = 'foundations';
UPDATE course_videos SET module_id = 'sba-504-loans' WHERE module_id = 'capital-markets';
UPDATE course_videos SET module_id = 'sba-express-loans' WHERE module_id = 'sba-loans';
UPDATE course_videos SET module_id = 'usda-bi-loans' WHERE module_id = 'conventional-loans';
UPDATE course_videos SET module_id = 'working-capital' WHERE module_id = 'bridge-loans';
UPDATE course_videos SET module_id = 'business-line-of-credit' WHERE module_id = 'alternative-finance';
UPDATE course_videos SET module_id = 'term-loans' WHERE module_id = 'credit-risk';
UPDATE course_videos SET module_id = 'lending-process' WHERE module_id = 'regulatory-compliance';

-- Update course_articles
UPDATE course_articles SET module_id = 'sba-7a-loans' WHERE module_id = 'foundations';
UPDATE course_articles SET module_id = 'sba-504-loans' WHERE module_id = 'capital-markets';
UPDATE course_articles SET module_id = 'sba-express-loans' WHERE module_id = 'sba-loans';
UPDATE course_articles SET module_id = 'usda-bi-loans' WHERE module_id = 'conventional-loans';
UPDATE course_articles SET module_id = 'working-capital' WHERE module_id = 'bridge-loans';
UPDATE course_articles SET module_id = 'business-line-of-credit' WHERE module_id = 'alternative-finance';
UPDATE course_articles SET module_id = 'term-loans' WHERE module_id = 'credit-risk';
UPDATE course_articles SET module_id = 'lending-process' WHERE module_id = 'regulatory-compliance';

-- Update course_assessments
UPDATE course_assessments SET module_id = 'sba-7a-loans' WHERE module_id = 'foundations';
UPDATE course_assessments SET module_id = 'sba-504-loans' WHERE module_id = 'capital-markets';
UPDATE course_assessments SET module_id = 'sba-express-loans' WHERE module_id = 'sba-loans';
UPDATE course_assessments SET module_id = 'usda-bi-loans' WHERE module_id = 'conventional-loans';
UPDATE course_assessments SET module_id = 'working-capital' WHERE module_id = 'bridge-loans';
UPDATE course_assessments SET module_id = 'business-line-of-credit' WHERE module_id = 'alternative-finance';
UPDATE course_assessments SET module_id = 'term-loans' WHERE module_id = 'credit-risk';
UPDATE course_assessments SET module_id = 'lending-process' WHERE module_id = 'regulatory-compliance';

-- Update encrypted_course_content
UPDATE encrypted_course_content SET module_id = 'sba-7a-loans' WHERE module_id = 'foundations';
UPDATE encrypted_course_content SET module_id = 'sba-504-loans' WHERE module_id = 'capital-markets';
UPDATE encrypted_course_content SET module_id = 'sba-express-loans' WHERE module_id = 'sba-loans';
UPDATE encrypted_course_content SET module_id = 'usda-bi-loans' WHERE module_id = 'conventional-loans';
UPDATE encrypted_course_content SET module_id = 'working-capital' WHERE module_id = 'bridge-loans';
UPDATE encrypted_course_content SET module_id = 'business-line-of-credit' WHERE module_id = 'alternative-finance';
UPDATE encrypted_course_content SET module_id = 'term-loans' WHERE module_id = 'credit-risk';
UPDATE encrypted_course_content SET module_id = 'lending-process' WHERE module_id = 'regulatory-compliance';

-- Update course_progress
UPDATE course_progress SET module_id = 'sba-7a-loans' WHERE module_id = 'foundations';
UPDATE course_progress SET module_id = 'sba-504-loans' WHERE module_id = 'capital-markets';
UPDATE course_progress SET module_id = 'sba-express-loans' WHERE module_id = 'sba-loans';
UPDATE course_progress SET module_id = 'usda-bi-loans' WHERE module_id = 'conventional-loans';
UPDATE course_progress SET module_id = 'working-capital' WHERE module_id = 'bridge-loans';
UPDATE course_progress SET module_id = 'business-line-of-credit' WHERE module_id = 'alternative-finance';
UPDATE course_progress SET module_id = 'term-loans' WHERE module_id = 'credit-risk';
UPDATE course_progress SET module_id = 'lending-process' WHERE module_id = 'regulatory-compliance';

-- Finally, deactivate the old course modules
UPDATE course_modules SET is_active = false 
WHERE module_id IN ('foundations', 'capital-markets', 'sba-loans', 'conventional-loans', 'bridge-loans', 'alternative-finance', 'credit-risk', 'regulatory-compliance');