-- First create loan processing courses
INSERT INTO courses (id, title, description, level, is_active, order_index) VALUES
('loan-application-processing', 'Loan Application Processing', 'Core loan application processing and documentation workflows', 'intermediate', true, 1),
('loan-documentation-verification', 'Loan Documentation Verification', 'Document verification and compliance procedures', 'intermediate', true, 2), 
('loan-workflow-management', 'Loan Processing Workflow Management', 'Managing loan processing workflows and timelines', 'advanced', true, 3),
('loan-closing-procedures', 'Loan Closing Procedures', 'Final loan closing and post-closing administration', 'advanced', true, 4),
('commercial-loan-processing-advanced', 'Advanced Commercial Loan Processing', 'Complex commercial loan processing procedures', 'expert', true, 5),
('sba-loan-processing-specialist', 'SBA Loan Processing Specialist', 'Specialized SBA loan processing and compliance', 'expert', true, 6);

-- Now insert loan processing modules
INSERT INTO course_content_modules (id, course_id, title, description, duration, lessons_count, order_index, topics, is_active) VALUES
('loan-application-processing-1', 'loan-application-processing', 'Loan Application Intake and Review', 'Processing initial loan applications and documentation review', '2 hours', 5, 1, 
'["Application Review", "Document Verification", "Initial Compliance Check", "Customer Communication", "File Setup"]'::jsonb, true),

('loan-documentation-verification-1', 'loan-documentation-verification', 'Document Verification and Compliance', 'Comprehensive document verification and compliance procedures', '3 hours', 6, 2,
'["Income Verification", "Asset Documentation", "Credit Report Analysis", "Regulatory Compliance", "Risk Assessment", "File Documentation"]'::jsonb, true),

('loan-workflow-management-1', 'loan-workflow-management', 'Loan Processing Workflow Management', 'Managing loan processing workflows and timelines', '2.5 hours', 7, 3,
'["Workflow Design", "Timeline Management", "Task Prioritization", "Quality Control", "Process Optimization", "Team Coordination", "Status Tracking"]'::jsonb, true),

('loan-closing-procedures-1', 'loan-closing-procedures', 'Loan Closing and Administration', 'Final loan closing procedures and post-closing administration', '3 hours', 8, 4,
'["Closing Documentation", "Fund Disbursement", "Title Review", "Insurance Verification", "Final Compliance", "Customer Onboarding", "Post-Closing Follow-up", "Record Management"]'::jsonb, true),

('commercial-processing-advanced-1', 'commercial-loan-processing-advanced', 'Advanced Commercial Loan Processing', 'Complex commercial loan processing procedures', '4 hours', 10, 5,
'["Commercial Underwriting", "Financial Statement Analysis", "Cash Flow Evaluation", "Collateral Assessment", "Environmental Review", "Legal Documentation", "Syndication Process", "Portfolio Management", "Risk Mitigation", "Regulatory Compliance"]'::jsonb, true),

('sba-processing-specialist-1', 'sba-loan-processing-specialist', 'SBA Loan Processing Specialist', 'Specialized SBA loan processing and government compliance', '3.5 hours', 9, 6,
'["SBA Guidelines", "Government Forms", "Eligibility Verification", "SBA Documentation", "Guarantee Processing", "Compliance Monitoring", "Reporting Requirements", "Quality Assurance", "Customer Support"]'::jsonb, true);