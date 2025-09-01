-- Fix the course_modules table to match the updated course_content_modules for loan originator
-- Remove old loan originator modules from course_modules table
DELETE FROM course_modules WHERE course_id = 'loan-originator';

-- Insert the correct 14 loan originator modules (7 beginner + 7 expert) into course_modules table
-- Beginner modules (7)
INSERT INTO course_modules (module_id, course_id, title, description, duration, skill_level, lessons_count, order_index, is_active, public_preview, created_at, updated_at) VALUES
('loan-originator-intro-beginner', 'loan-originator', 'Introduction to Loan Origination', 'Learn the fundamentals of loan origination process, from application to closing', '45 minutes', 'beginner', 5, 1, true, false, now(), now()),
('loan-originator-customer-service-beginner', 'loan-originator', 'Customer Service Excellence', 'Master customer service skills essential for loan originators', '40 minutes', 'beginner', 4, 2, true, false, now(), now()),
('loan-originator-products-beginner', 'loan-originator', 'Loan Products Overview', 'Understanding different types of loan products and their features', '50 minutes', 'beginner', 6, 3, true, false, now(), now()),
('loan-originator-documentation-beginner', 'loan-originator', 'Documentation Fundamentals', 'Essential documents required for loan applications', '35 minutes', 'beginner', 4, 4, true, false, now(), now()),
('loan-originator-compliance-beginner', 'loan-originator', 'Basic Compliance Requirements', 'Introduction to regulatory compliance in loan origination', '55 minutes', 'beginner', 7, 5, true, false, now(), now()),
('loan-originator-technology-beginner', 'loan-originator', 'Technology and Systems', 'Using loan origination systems and technology tools', '30 minutes', 'beginner', 3, 6, true, false, now(), now()),
('loan-originator-ethics-beginner', 'loan-originator', 'Professional Ethics', 'Ethical practices and professional standards for loan originators', '25 minutes', 'beginner', 3, 7, true, false, now(), now());

-- Expert modules (7)
INSERT INTO course_modules (module_id, course_id, title, description, duration, skill_level, lessons_count, order_index, is_active, public_preview, created_at, updated_at) VALUES
('loan-originator-strategic-planning-expert', 'loan-originator', 'Strategic Business Planning', 'Strategic planning for loan origination business growth', '70 minutes', 'expert', 8, 8, true, false, now(), now()),
('loan-originator-market-trends-expert', 'loan-originator', 'Market Analysis and Trends', 'Understanding market dynamics and economic factors', '60 minutes', 'expert', 7, 9, true, false, now(), now()),
('loan-originator-portfolio-expert', 'loan-originator', 'Portfolio Management', 'Advanced portfolio management and risk mitigation', '65 minutes', 'expert', 7, 10, true, false, now(), now()),
('loan-originator-innovation-expert', 'loan-originator', 'Innovation and Technology', 'Emerging technologies and innovative practices', '55 minutes', 'expert', 6, 11, true, false, now(), now()),
('loan-originator-executive-expert', 'loan-originator', 'Executive Leadership', 'Executive-level leadership and decision making', '75 minutes', 'expert', 8, 12, true, false, now(), now()),
('loan-originator-regulatory-expert', 'loan-originator', 'Regulatory Strategy', 'Strategic approach to regulatory compliance and changes', '50 minutes', 'expert', 6, 13, true, false, now(), now()),
('loan-originator-mastery-expert', 'loan-originator', 'Loan Origination Mastery', 'Master-level concepts and industry leadership', '80 minutes', 'expert', 9, 14, true, false, now(), now());