-- Just insert the loan processing modules using existing course structure
-- Let's use the SBA courses but modify them to be loan processing focused
INSERT INTO course_content_modules (id, course_id, title, description, duration, lessons_count, order_index, topics, is_active) VALUES
('loan-application-processing-module', 'sba-7a-loans-beginner', 'Loan Application Processing & Documentation', 'Processing loan applications, documentation review, and initial compliance verification', '3 hours', 8, 10, 
'["Application Intake", "Document Verification", "Income Verification", "Credit Check", "Initial Compliance", "Customer Communication", "File Setup", "Processing Timeline"]'::jsonb, true),

('loan-workflow-processing-module', 'sba-7a-loans-beginner', 'Loan Processing Workflow Management', 'Managing loan processing workflows, timelines, and quality control procedures', '2.5 hours', 7, 11,
'["Workflow Design", "Timeline Management", "Task Prioritization", "Quality Control", "Process Optimization", "Team Coordination", "Status Tracking"]'::jsonb, true),

('loan-documentation-compliance-module', 'sba-7a-loans-expert', 'Advanced Documentation & Compliance Processing', 'Comprehensive document verification and regulatory compliance procedures', '4 hours', 10, 12,
'["Income Verification", "Asset Documentation", "Credit Report Analysis", "Regulatory Compliance", "Risk Assessment", "File Documentation", "Audit Trail", "Compliance Monitoring", "Legal Requirements", "Documentation Standards"]'::jsonb, true),

('loan-closing-administration-module', 'sba-7a-loans-expert', 'Loan Closing & Post-Processing Administration', 'Final loan closing procedures and post-closing administration workflows', '3.5 hours', 9, 13,
'["Closing Documentation", "Fund Disbursement", "Title Review", "Insurance Verification", "Final Compliance", "Customer Onboarding", "Post-Closing Follow-up", "Record Management", "Portfolio Transition"]'::jsonb, true);