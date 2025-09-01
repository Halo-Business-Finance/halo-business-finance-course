-- Add USDA Loan Processing course with no skill level
INSERT INTO courses (id, title, description, level, image_url, is_active, order_index) VALUES
('usda-loan-processing', 'USDA Loan Processing', 'Comprehensive training on USDA rural development loan programs, including guaranteed loans, direct loans, and grant programs for agricultural and rural business financing.', 'general', '/src/assets/business-meeting.jpg', true, 403);

-- Add 7 course modules for USDA Loan Processing
INSERT INTO course_content_modules (id, course_id, title, description, duration, order_index, lessons_count, is_active) VALUES
('usda-module-1', 'usda-loan-processing', 'USDA Program Overview', 'Introduction to USDA Rural Development programs, eligibility requirements, and program structure for agricultural and rural business lending.', '45 minutes', 1, 5, true),
('usda-module-2', 'usda-loan-processing', 'Guaranteed Loan Programs', 'Understanding USDA guaranteed loan programs, lender requirements, and application processes for business and industry loans.', '50 minutes', 2, 6, true),
('usda-module-3', 'usda-loan-processing', 'Direct Loan Programs', 'Processing USDA direct loans, underwriting standards, and documentation requirements for rural development financing.', '55 minutes', 3, 7, true),
('usda-module-4', 'usda-loan-processing', 'Agricultural Lending', 'Specialized USDA programs for agricultural operations, farm loans, and agricultural business financing requirements.', '60 minutes', 4, 8, true),
('usda-module-5', 'usda-loan-processing', 'Rural Business Programs', 'USDA rural business and cooperative programs, community development financing, and economic development initiatives.', '50 minutes', 5, 6, true),
('usda-module-6', 'usda-loan-processing', 'Grant Programs and Incentives', 'USDA grant programs, value-added producer grants, and rural development incentives for qualifying projects.', '45 minutes', 6, 5, true),
('usda-module-7', 'usda-loan-processing', 'Compliance and Servicing', 'USDA loan servicing requirements, compliance monitoring, reporting obligations, and portfolio management best practices.', '55 minutes', 7, 7, true);