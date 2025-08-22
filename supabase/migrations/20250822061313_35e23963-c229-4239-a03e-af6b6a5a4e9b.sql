-- Add new course modules for Halo Business Finance's actual loan products
-- Delete existing modules first and recreate with proper structure

DELETE FROM course_modules WHERE module_id IN (
  'foundations', 'capital-markets', 'sba-loans', 'conventional-loans', 
  'bridge-loans', 'alternative-finance', 'credit-risk', 'regulatory-compliance'
);

-- Insert new modules based on Halo Business Finance's actual loan products
INSERT INTO course_modules (module_id, title, description, order_index, skill_level, duration, lessons_count) VALUES
('sba-7a-loans', 'SBA 7(a) Loans', 'Master SBA 7(a) loan programs - versatile financing for working capital, equipment, and real estate purchases up to $5 million.', 0, 'beginner', '45 minutes', 6),
('sba-504-loans', 'SBA 504 Loans', 'Learn SBA 504 loan structures for real estate and major equipment purchases with fixed-rate financing and only 10% down payment required.', 1, 'intermediate', '40 minutes', 5),
('sba-express-loans', 'SBA Express Loans', 'Fast-track SBA financing with expedited approval process. Up to $500,000 with 36-hour approval timeline guaranteed.', 2, 'beginner', '30 minutes', 4),
('usda-bi-loans', 'USDA B&I Loans', 'Rural business development financing backed by USDA guarantee. Up to $25 million for rural area businesses.', 3, 'intermediate', '35 minutes', 5),
('working-capital', 'Working Capital Solutions', 'Bridge cash flow gaps and fund day-to-day business operations with flexible working capital and revolving credit lines.', 4, 'beginner', '25 minutes', 4),
('business-line-of-credit', 'Business Line of Credit', 'Flexible access to capital when you need it with revolving credit lines. Draw funds as needed and pay interest only on used funds.', 5, 'intermediate', '30 minutes', 4),
('term-loans', 'Term Loans & Fixed Rate Financing', 'Fixed-rate business loans for major investments and growth initiatives with competitive rates and fixed monthly payments.', 6, 'intermediate', '35 minutes', 5),
('lending-process', 'Commercial Lending Process & Underwriting', 'Master the streamlined commercial lending process, from application to approval, including credit analysis and risk assessment.', 7, 'expert', '50 minutes', 7);