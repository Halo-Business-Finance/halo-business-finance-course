-- Insert loan processing modules into existing loan processing courses
INSERT INTO course_content_modules (id, course_id, title, description, duration, lessons_count, order_index, topics, is_active) VALUES
('loan-app-processing-mod-1', 'loan-application-processing', 'Loan Application Intake and Review', 'Processing initial loan applications and documentation review', '2 hours', 5, 1, 
'["Application Review", "Document Verification", "Initial Compliance Check", "Customer Communication", "File Setup"]'::jsonb, true),

('loan-doc-verification-mod-1', 'loan-documentation-verification', 'Document Verification and Compliance', 'Comprehensive document verification and compliance procedures', '3 hours', 6, 1,
'["Income Verification", "Asset Documentation", "Credit Report Analysis", "Regulatory Compliance", "Risk Assessment", "File Documentation"]'::jsonb, true),

('loan-workflow-mgmt-mod-1', 'loan-workflow-management', 'Loan Processing Workflow Management', 'Managing loan processing workflows and timelines', '2.5 hours', 7, 1,
'["Workflow Design", "Timeline Management", "Task Prioritization", "Quality Control", "Process Optimization", "Team Coordination", "Status Tracking"]'::jsonb, true),

('loan-closing-proc-mod-1', 'loan-closing-procedures', 'Loan Closing and Administration', 'Final loan closing procedures and post-closing administration', '3 hours', 8, 1,
'["Closing Documentation", "Fund Disbursement", "Title Review", "Insurance Verification", "Final Compliance", "Customer Onboarding", "Post-Closing Follow-up", "Record Management"]'::jsonb, true);