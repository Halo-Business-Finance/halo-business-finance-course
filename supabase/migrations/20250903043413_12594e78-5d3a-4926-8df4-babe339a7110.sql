-- Add more loan processing modules to existing loan processing courses
INSERT INTO course_content_modules (id, course_id, title, description, duration, lessons_count, order_index, topics, is_active) VALUES
('loan-app-processing-basics', 'loan-application-processing', 'Loan Application Processing Fundamentals', 'Basic loan application processing procedures and best practices', '2 hours', 6, 1, 
'["Application Review", "Document Collection", "Initial Screening", "Customer Communication", "File Organization", "Processing Standards"]'::jsonb, true),

('documentation-verification-advanced', 'loan-documentation-verification', 'Advanced Documentation Verification', 'In-depth document verification and validation procedures', '3 hours', 8, 1,
'["Income Verification", "Asset Documentation", "Credit Analysis", "Document Authentication", "Fraud Detection", "Compliance Check", "Quality Assurance", "Audit Preparation"]'::jsonb, true),

('processing-workflow-optimization', 'loan-workflow-management', 'Processing Workflow Optimization', 'Optimizing loan processing workflows for efficiency and compliance', '2.5 hours', 7, 1,
'["Workflow Analysis", "Process Mapping", "Bottleneck Identification", "Automation Opportunities", "Quality Metrics", "Performance Tracking", "Team Collaboration"]'::jsonb, true),

('commercial-processing-specialist', 'commercial-loan-processing-advanced', 'Commercial Loan Processing Specialist', 'Advanced commercial loan processing techniques and procedures', '4 hours', 12, 1,
'["Commercial Underwriting", "Financial Analysis", "Cash Flow Assessment", "Collateral Evaluation", "Risk Analysis", "Legal Documentation", "Regulatory Compliance", "Portfolio Management", "Due Diligence", "Credit Structuring", "Loan Syndication", "Post-Closing Administration"]'::jsonb, true);