-- Update course modules to reflect Halo Business Finance's actual loan products and services

-- Update existing modules with Halo Business Finance's actual offerings
UPDATE course_modules SET 
  title = 'SBA 7(a) Loans',
  description = 'Master SBA 7(a) loan programs - versatile financing for working capital, equipment, and real estate purchases up to $5 million.',
  module_id = 'sba-7a-loans',
  order_index = 0
WHERE module_id = 'foundations';

UPDATE course_modules SET 
  title = 'SBA 504 Loans',
  description = 'Learn SBA 504 loan structures for real estate and major equipment purchases with fixed-rate financing and only 10% down payment required.',
  module_id = 'sba-504-loans',
  order_index = 1
WHERE module_id = 'capital-markets';

UPDATE course_modules SET 
  title = 'SBA Express Loans',
  description = 'Fast-track SBA financing with expedited approval process. Up to $500,000 with 36-hour approval timeline guaranteed.',
  module_id = 'sba-express-loans',
  order_index = 2
WHERE module_id = 'sba-loans';

UPDATE course_modules SET 
  title = 'USDA B&I Loans',
  description = 'Rural business development financing backed by USDA guarantee. Up to $25 million for rural area businesses.',
  module_id = 'usda-bi-loans',
  order_index = 3
WHERE module_id = 'conventional-loans';

UPDATE course_modules SET 
  title = 'Working Capital Solutions',
  description = 'Bridge cash flow gaps and fund day-to-day business operations with flexible working capital and revolving credit lines.',
  module_id = 'working-capital',
  order_index = 4
WHERE module_id = 'bridge-loans';

UPDATE course_modules SET 
  title = 'Business Line of Credit',
  description = 'Flexible access to capital when you need it with revolving credit lines. Draw funds as needed and pay interest only on used funds.',
  module_id = 'business-line-of-credit',
  order_index = 5
WHERE module_id = 'alternative-finance';

UPDATE course_modules SET 
  title = 'Term Loans & Fixed Rate Financing',
  description = 'Fixed-rate business loans for major investments and growth initiatives with competitive rates and fixed monthly payments.',
  module_id = 'term-loans',
  order_index = 6
WHERE module_id = 'credit-risk';

UPDATE course_modules SET 
  title = 'Commercial Lending Process & Underwriting',
  description = 'Master the streamlined commercial lending process, from application to approval, including credit analysis and risk assessment.',
  module_id = 'lending-process',
  order_index = 7
WHERE module_id = 'regulatory-compliance';