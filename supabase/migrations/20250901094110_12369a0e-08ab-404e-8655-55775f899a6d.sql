-- First create the loan-originator course if it doesn't exist
INSERT INTO courses (id, title, description, level, is_active, order_index, created_at, updated_at)
VALUES (
  'loan-originator', 
  'Loan Originator Professional Training', 
  'Comprehensive loan origination training covering all aspects from basic customer service to advanced regulatory compliance and portfolio management',
  'expert',
  true,
  3,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  updated_at = EXCLUDED.updated_at;

-- Now ensure course_content_modules has proper data for loan originator
-- Check if we have the loan originator modules
DO $$
DECLARE
    module_count INTEGER;
BEGIN
    -- Count existing loan originator modules
    SELECT COUNT(*) INTO module_count 
    FROM course_content_modules 
    WHERE course_id = 'loan-originator';
    
    -- If we don't have enough modules, insert the 21 loan originator modules for all skill levels
    IF module_count < 21 THEN
        -- Delete existing to avoid duplicates
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
        
        -- Insert Intermediate Loan Originator Modules (7 modules)
        INSERT INTO course_content_modules (id, course_id, title, description, duration, order_index, topics, is_active) VALUES
        ('loan-originator-advanced-underwriting-intermediate', 'loan-originator', 'Advanced Underwriting Concepts', 'Deep dive into underwriting principles and risk assessment', '60 minutes', 8, '["underwriting", "risk assessment", "credit analysis"]'::jsonb, true),
        ('loan-originator-complex-scenarios-intermediate', 'loan-originator', 'Complex Loan Scenarios', 'Handling challenging loan applications and special circumstances', '55 minutes', 9, '["complex scenarios", "problem solving", "exceptions"]'::jsonb, true),
        ('loan-originator-advanced-products-intermediate', 'loan-originator', 'Advanced Loan Products', 'Specialized loan products and their unique requirements', '50 minutes', 10, '["specialized products", "jumbo loans", "investment properties"]'::jsonb, true),
        ('loan-originator-sales-techniques-intermediate', 'loan-originator', 'Advanced Sales Techniques', 'Sophisticated sales strategies for loan originators', '45 minutes', 11, '["sales techniques", "consultative selling", "objection handling"]'::jsonb, true),
        ('loan-originator-regulation-intermediate', 'loan-originator', 'Advanced Regulatory Knowledge', 'In-depth regulatory compliance and recent changes', '65 minutes', 12, '["TRID", "HMDA", "fair lending"]'::jsonb, true),
        ('loan-originator-pipeline-intermediate', 'loan-originator', 'Pipeline Management', 'Managing loan pipeline and workflow optimization', '40 minutes', 13, '["pipeline management", "workflow", "efficiency"]'::jsonb, true),
        ('loan-originator-mentoring-intermediate', 'loan-originator', 'Mentoring and Leadership', 'Developing leadership skills and mentoring junior staff', '35 minutes', 14, '["leadership", "mentoring", "team development"]'::jsonb, true);
        
        -- Insert Expert Loan Originator Modules (7 modules)
        INSERT INTO course_content_modules (id, course_id, title, description, duration, order_index, topics, is_active) VALUES
        ('loan-originator-strategic-planning-expert', 'loan-originator', 'Strategic Business Planning', 'Strategic planning for loan origination business growth', '70 minutes', 15, '["strategic planning", "business development", "market analysis"]'::jsonb, true),
        ('loan-originator-market-trends-expert', 'loan-originator', 'Market Analysis and Trends', 'Understanding market dynamics and economic factors', '60 minutes', 16, '["market analysis", "economic trends", "forecasting"]'::jsonb, true),
        ('loan-originator-portfolio-expert', 'loan-originator', 'Portfolio Management', 'Advanced portfolio management and risk mitigation', '65 minutes', 17, '["portfolio management", "risk mitigation", "performance metrics"]'::jsonb, true),
        ('loan-originator-innovation-expert', 'loan-originator', 'Innovation and Technology', 'Emerging technologies and innovative practices', '55 minutes', 18, '["fintech", "innovation", "digital transformation"]'::jsonb, true),
        ('loan-originator-executive-expert', 'loan-originator', 'Executive Leadership', 'Executive-level leadership and decision making', '75 minutes', 19, '["executive leadership", "decision making", "strategic thinking"]'::jsonb, true),
        ('loan-originator-regulatory-expert', 'loan-originator', 'Regulatory Strategy', 'Strategic approach to regulatory compliance and changes', '50 minutes', 20, '["regulatory strategy", "compliance management", "policy development"]'::jsonb, true),
        ('loan-originator-mastery-expert', 'loan-originator', 'Loan Origination Mastery', 'Master-level concepts and industry leadership', '80 minutes', 21, '["mastery", "industry leadership", "thought leadership"]'::jsonb, true);
    END IF;
END $$;