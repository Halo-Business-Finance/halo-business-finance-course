-- Add Equipment Loan Processing course (using 'beginner' as level since it's a single course)
INSERT INTO courses (id, title, description, level, image_url, is_active, order_index) VALUES
('equipment-loan-processing', 'Equipment Loan Processing', 'Comprehensive training on equipment financing, including new and used equipment loans, lease financing, and specialized equipment lending for various industries.', 'beginner', '/src/assets/business-meeting.jpg', true, 405);

-- Add 7 course modules for Equipment Loan Processing
INSERT INTO course_content_modules (id, course_id, title, description, duration, order_index, lessons_count, is_active) VALUES
('equipment-module-1', 'equipment-loan-processing', 'Equipment Financing Overview', 'Introduction to equipment financing, types of equipment loans, lease vs. purchase decisions, and industry market dynamics.', '45 minutes', 1, 5, true),
('equipment-module-2', 'equipment-loan-processing', 'Equipment Valuation and Appraisal', 'Equipment valuation methodologies, depreciation analysis, residual value assessment, and appraisal techniques for lending decisions.', '55 minutes', 2, 7, true),
('equipment-module-3', 'equipment-loan-processing', 'Credit Analysis and Underwriting', 'Equipment loan underwriting standards, cash flow analysis, collateral evaluation, and risk assessment specific to equipment financing.', '60 minutes', 3, 8, true),
('equipment-module-4', 'equipment-loan-processing', 'Industry-Specific Equipment Lending', 'Specialized equipment financing for construction, manufacturing, healthcare, transportation, and technology sectors.', '50 minutes', 4, 6, true),
('equipment-module-5', 'equipment-loan-processing', 'Documentation and Legal Considerations', 'Equipment loan documentation, UCC filings, security agreements, and legal requirements for equipment collateral.', '50 minutes', 5, 6, true),
('equipment-module-6', 'equipment-loan-processing', 'Lease Financing and Structures', 'Equipment lease structures, capital vs. operating leases, lease accounting, and vendor financing programs.', '55 minutes', 6, 7, true),
('equipment-module-7', 'equipment-loan-processing', 'Portfolio Management and Collections', 'Equipment loan servicing, portfolio monitoring, repossession procedures, and remarketing strategies for equipment lenders.', '50 minutes', 7, 6, true);