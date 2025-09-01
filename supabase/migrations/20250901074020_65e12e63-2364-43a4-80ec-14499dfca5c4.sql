-- Add SBA Loan Processing course (using 'beginner' as level since it's a single course)
INSERT INTO courses (id, title, description, level, image_url, is_active, order_index) VALUES
('sba-loan-processing', 'SBA Loan Processing', 'Comprehensive training on Small Business Administration loan programs, including 7(a) loans, 504 loans, microloans, and disaster relief lending for small business financing.', 'beginner', '/src/assets/business-meeting.jpg', true, 404);

-- Add 7 course modules for SBA Loan Processing
INSERT INTO course_content_modules (id, course_id, title, description, duration, order_index, lessons_count, is_active) VALUES
('sba-module-1', 'sba-loan-processing', 'SBA Program Overview', 'Introduction to SBA loan programs, eligibility requirements, and the role of preferred lenders in small business financing.', '50 minutes', 1, 6, true),
('sba-module-2', 'sba-loan-processing', '7(a) Loan Program', 'Processing SBA 7(a) loans, underwriting guidelines, guaranty procedures, and documentation requirements for general business purposes.', '60 minutes', 2, 8, true),
('sba-module-3', 'sba-loan-processing', '504 Loan Program', 'Understanding SBA 504/CDC loans for real estate and equipment financing, including certified development company partnerships.', '55 minutes', 3, 7, true),
('sba-module-4', 'sba-loan-processing', 'Microloans and Express Loans', 'Processing SBA microloans, express loans, and community advantage loans for small-scale business financing needs.', '45 minutes', 4, 5, true),
('sba-module-5', 'sba-loan-processing', 'Underwriting and Credit Analysis', 'SBA-specific underwriting standards, credit analysis techniques, and risk assessment for guaranteed loan programs.', '65 minutes', 5, 9, true),
('sba-module-6', 'sba-loan-processing', 'Disaster Relief and Special Programs', 'SBA disaster relief loans, economic injury loans, and specialized programs for veterans, women, and minority-owned businesses.', '50 minutes', 6, 6, true),
('sba-module-7', 'sba-loan-processing', 'Loan Servicing and Compliance', 'SBA loan servicing requirements, compliance monitoring, liquidation procedures, and portfolio management best practices.', '55 minutes', 7, 7, true);