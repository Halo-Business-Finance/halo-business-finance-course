-- Fix loan originator modules to only have beginner and expert skill levels
-- Remove intermediate modules and keep only 14 modules total (7 beginner + 7 expert)

-- First, delete all existing loan originator modules
DELETE FROM course_content_modules WHERE course_id = 'loan-originator';

-- Insert Beginner Loan Originator Modules (7 modules)
INSERT INTO course_content_modules (id, course_id, title, description, duration, order_index, topics, is_active) VALUES
('loan-originator-intro-beginner', 'loan-originator', 'Introduction to Loan Origination', 'Learn the fundamentals of loan origination process, from application to closing', '45 minutes', 1, '["loan process", "documentation", "compliance basics"]'::jsonb, true),
('loan-originator-customer-service-beginner', 'loan-originator', 'Customer Service Excellence', 'Master customer service skills essential for loan originators', '40 minutes', 2, '["communication", "customer relations", "problem solving"]'::jsonb, true),
('loan-originator-products-beginner', 'loan-originator', 'Loan Products Overview', 'Understanding different types of loan products and their features', '50 minutes', 3, '["product knowledge", "features", "benefits"]'::jsonb, true),
('loan-originator-documentation-beginner', 'loan-originator', 'Documentation Fundamentals', 'Essential documents required for loan applications', '35 minutes', 4, '["documentation", "forms", "requirements"]'::jsonb, true),
('loan-originator-compliance-beginner', 'loan-originator', 'Basic Compliance Requirements', 'Introduction to regulatory compliance in loan origination', '55 minutes', 5, '["regulations", "compliance", "legal requirements"]'::jsonb, true),
('loan-originator-technology-beginner', 'loan-originator', 'Technology and Systems', 'Using loan origination systems and technology tools', '30 minutes', 6, '["LOS", "technology", "digital tools"]'::jsonb, true),
('loan-originator-ethics-beginner', 'loan-originator', 'Professional Ethics', 'Ethical practices and professional standards for loan originators', '25 minutes', 7, '["ethics", "professional standards", "integrity"]'::jsonb, true);

-- Insert Expert Loan Originator Modules (7 modules)
INSERT INTO course_content_modules (id, course_id, title, description, duration, order_index, topics, is_active) VALUES
('loan-originator-strategic-planning-expert', 'loan-originator', 'Strategic Business Planning', 'Strategic planning for loan origination business growth', '70 minutes', 8, '["strategic planning", "business development", "market analysis"]'::jsonb, true),
('loan-originator-market-trends-expert', 'loan-originator', 'Market Analysis and Trends', 'Understanding market dynamics and economic factors', '60 minutes', 9, '["market analysis", "economic trends", "forecasting"]'::jsonb, true),
('loan-originator-portfolio-expert', 'loan-originator', 'Portfolio Management', 'Advanced portfolio management and risk mitigation', '65 minutes', 10, '["portfolio management", "risk mitigation", "performance metrics"]'::jsonb, true),
('loan-originator-innovation-expert', 'loan-originator', 'Innovation and Technology', 'Emerging technologies and innovative practices', '55 minutes', 11, '["fintech", "innovation", "digital transformation"]'::jsonb, true),
('loan-originator-executive-expert', 'loan-originator', 'Executive Leadership', 'Executive-level leadership and decision making', '75 minutes', 12, '["executive leadership", "decision making", "strategic thinking"]'::jsonb, true),
('loan-originator-regulatory-expert', 'loan-originator', 'Regulatory Strategy', 'Strategic approach to regulatory compliance and changes', '50 minutes', 13, '["regulatory strategy", "compliance management", "policy development"]'::jsonb, true),
('loan-originator-mastery-expert', 'loan-originator', 'Loan Origination Mastery', 'Master-level concepts and industry leadership', '80 minutes', 14, '["mastery", "industry leadership", "thought leadership"]'::jsonb, true);