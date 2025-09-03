-- Add modules to existing loan processing courses
INSERT INTO course_content_modules (id, course_id, title, description, duration, lessons_count, order_index, topics, is_active) VALUES

-- Bridge Loan Processing modules
('bridge-loan-processing-1', 'bridge-loan-processing', 'Bridge Loan Fundamentals', 'Understanding bridge loan structures and requirements', '2 hours', 5, 1, 
'["Bridge Loan Basics", "Short-term Financing", "Exit Strategies", "Risk Assessment", "Timeline Management"]'::jsonb, true),

('bridge-loan-processing-2', 'bridge-loan-processing', 'Bridge Loan Documentation', 'Processing documentation for bridge loans', '2.5 hours', 6, 2,
'["Application Processing", "Property Valuation", "Exit Strategy Documentation", "Borrower Qualification", "Risk Documentation", "Closing Requirements"]'::jsonb, true),

-- Equipment Loan Processing modules  
('equipment-loan-processing-1', 'equipment-loan-processing', 'Equipment Financing Fundamentals', 'Core concepts in equipment loan processing', '2 hours', 6, 1,
'["Equipment Valuation", "Depreciation Analysis", "Vendor Coordination", "Insurance Requirements", "UCC Filings", "Equipment Inspection"]'::jsonb, true),

('equipment-loan-processing-2', 'equipment-loan-processing', 'Equipment Loan Documentation', 'Documentation requirements for equipment financing', '3 hours', 7, 2,
'["Equipment Specifications", "Purchase Agreements", "Delivery Confirmation", "Title Documentation", "Warranty Information", "Maintenance Records", "Insurance Documentation"]'::jsonb, true),

-- SBA Loan Processing modules
('sba-loan-processing-1', 'sba-loan-processing', 'SBA Loan Processing Fundamentals', 'Core SBA loan processing procedures', '3 hours', 8, 1,
'["SBA Guidelines", "Eligibility Requirements", "SBA Forms", "Personal Financial Statements", "Business Plans", "Cash Flow Analysis", "Collateral Requirements", "Environmental Reviews"]'::jsonb, true),

('sba-loan-processing-2', 'sba-loan-processing', 'SBA Compliance and Quality Control', 'Ensuring SBA compliance throughout the process', '2.5 hours', 6, 2,
'["SBA SOPs", "Quality Control", "File Review", "Compliance Monitoring", "Reporting Requirements", "Audit Preparation"]'::jsonb, true),

-- Agriculture Loan Processing modules
('agriculture-loan-processing-1', 'agriculture-loan-processing', 'Agricultural Lending Fundamentals', 'Understanding agricultural loan processing', '3 hours', 7, 1,
'["Agricultural Markets", "Crop Cycles", "Livestock Valuation", "Farm Financial Analysis", "Seasonal Cash Flow", "Commodity Pricing", "Weather Risk"]'::jsonb, true),

('agriculture-loan-processing-2', 'agriculture-loan-processing', 'Agricultural Documentation', 'Specialized documentation for agricultural loans', '2.5 hours', 6, 2,
'["Farm Operating Plans", "Production Records", "Income Verification", "Asset Documentation", "Environmental Compliance", "Insurance Requirements"]'::jsonb, true),

-- Apartment & Multi-Family Processing modules
('apartment-multifamily-processing-1', 'apartment-multifamily-processing', 'Multi-Family Property Analysis', 'Analyzing multi-family investment properties', '3.5 hours', 8, 1,
'["Property Analysis", "Rent Roll Review", "Operating Income", "Expense Analysis", "Market Comparables", "Cap Rate Analysis", "NOI Calculation", "DSCR Assessment"]'::jsonb, true),

('apartment-multifamily-processing-2', 'apartment-multifamily-processing', 'Multi-Family Loan Documentation', 'Documentation requirements for multi-family loans', '3 hours', 7, 2,
'["Property Management Agreements", "Lease Reviews", "Operating Statements", "Environmental Reports", "Property Condition Reports", "Appraisal Review", "Title Insurance"]'::jsonb, true);

-- Add additional modules to existing processing courses to populate loan processing section
INSERT INTO course_content_modules (id, course_id, title, description, duration, lessons_count, order_index, topics, is_active) VALUES

-- Additional modules for loan documentation verification (create course first if needed)
('loan-documentation-verification-2', 'loan-documentation-verification', 'Advanced Document Analysis', 'Advanced techniques for document verification and fraud detection', '2.5 hours', 6, 3,
'["Fraud Detection", "Document Authentication", "Income Analysis", "Asset Verification", "Credit Report Analysis", "Third-party Verification"]'::jsonb, true),

-- Additional modules for loan workflow management
('loan-workflow-management-2', 'loan-workflow-management', 'Process Optimization', 'Optimizing loan processing workflows for efficiency', '2 hours', 5, 4,
'["Bottleneck Identification", "Automation Opportunities", "Quality Metrics", "Performance Tracking", "Process Improvement"]'::jsonb, true),

-- Additional modules for loan closing procedures  
('loan-closing-procedures-2', 'loan-closing-procedures', 'Post-Closing Administration', 'Managing loans after closing and ongoing administration', '2.5 hours', 6, 5,
'["Loan Servicing Setup", "Payment Processing", "Escrow Management", "Insurance Monitoring", "Compliance Tracking", "Customer Service"]'::jsonb, true);