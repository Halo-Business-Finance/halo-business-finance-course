-- Create 7 course modules for each main loan originator course (beginner and expert levels)

-- SBA 7(a) Loans - Beginner (7 modules)
INSERT INTO course_modules (module_id, title, description, course_id, skill_level, order_index, duration, is_active) VALUES
('sba-7a-intro-beginner', 'SBA 7(a) Introduction & Overview', 'Comprehensive introduction to SBA 7(a) loan programs, eligibility criteria, and basic program structure', 'sba-7a-beginner', 'beginner', 1, '45 minutes', true),
('sba-7a-application-beginner', 'Application Process & Documentation', 'Step-by-step application process, required documentation, and initial client consultation', 'sba-7a-beginner', 'beginner', 2, '60 minutes', true),
('sba-7a-underwriting-beginner', 'Basic Underwriting Principles', 'Fundamental underwriting concepts, credit analysis, and financial statement review', 'sba-7a-beginner', 'beginner', 3, '75 minutes', true),
('sba-7a-compliance-beginner', 'SBA Compliance & Requirements', 'SBA compliance standards, regulatory requirements, and program guidelines', 'sba-7a-beginner', 'beginner', 4, '50 minutes', true),
('sba-7a-risk-beginner', 'Risk Assessment Fundamentals', 'Basic risk assessment techniques, collateral evaluation, and guaranty requirements', 'sba-7a-beginner', 'beginner', 5, '55 minutes', true),
('sba-7a-closing-beginner', 'Loan Closing Process', 'Closing procedures, final documentation, and funding requirements', 'sba-7a-beginner', 'beginner', 6, '40 minutes', true),
('sba-7a-servicing-beginner', 'Portfolio Management Basics', 'Basic loan servicing, monitoring, and customer relationship management', 'sba-7a-beginner', 'beginner', 7, '45 minutes', true);

-- SBA 7(a) Loans - Expert (7 modules)
INSERT INTO course_modules (module_id, title, description, course_id, skill_level, order_index, duration, is_active) VALUES
('sba-7a-advanced-expert', 'Advanced SBA 7(a) Strategies', 'Complex deal structuring, advanced program features, and strategic implementation', 'sba-7a-expert', 'expert', 1, '90 minutes', true),
('sba-7a-complex-expert', 'Complex Application Scenarios', 'Handling complex applications, problem resolution, and advanced documentation', 'sba-7a-expert', 'expert', 2, '85 minutes', true),
('sba-7a-master-underwriting-expert', 'Master-Level Underwriting', 'Advanced underwriting techniques, complex credit analysis, and sophisticated risk evaluation', 'sba-7a-expert', 'expert', 3, '100 minutes', true),
('sba-7a-regulatory-expert', 'Regulatory Mastery & Compliance', 'Advanced compliance management, regulatory changes, and policy interpretation', 'sba-7a-expert', 'expert', 4, '70 minutes', true),
('sba-7a-sophisticated-risk-expert', 'Sophisticated Risk Management', 'Advanced risk mitigation strategies, complex collateral structures, and guaranty optimization', 'sba-7a-expert', 'expert', 5, '80 minutes', true),
('sba-7a-advanced-closing-expert', 'Advanced Closing Techniques', 'Complex closing scenarios, problem resolution, and advanced funding strategies', 'sba-7a-expert', 'expert', 6, '65 minutes', true),
('sba-7a-portfolio-expert', 'Strategic Portfolio Management', 'Advanced portfolio strategies, performance optimization, and client relationship excellence', 'sba-7a-expert', 'expert', 7, '75 minutes', true);

-- SBA Express - Beginner (7 modules)
INSERT INTO course_modules (module_id, title, description, course_id, skill_level, order_index, duration, is_active) VALUES
('sba-express-intro-beginner', 'SBA Express Introduction', 'Overview of SBA Express program features, benefits, and eligibility requirements', 'sba-express-beginner', 'beginner', 1, '40 minutes', true),
('sba-express-application-beginner', 'Express Application Process', 'Streamlined application procedures, documentation requirements, and processing timeline', 'sba-express-beginner', 'beginner', 2, '50 minutes', true),
('sba-express-underwriting-beginner', 'Express Underwriting Standards', 'Accelerated underwriting principles, credit evaluation, and decision criteria', 'sba-express-beginner', 'beginner', 3, '60 minutes', true),
('sba-express-compliance-beginner', 'Express Compliance Framework', 'Program compliance requirements, regulatory standards, and quality control', 'sba-express-beginner', 'beginner', 4, '45 minutes', true),
('sba-express-risk-beginner', 'Express Risk Assessment', 'Risk evaluation techniques, collateral requirements, and guaranty considerations', 'sba-express-beginner', 'beginner', 5, '55 minutes', true),
('sba-express-closing-beginner', 'Express Closing Procedures', 'Efficient closing processes, documentation management, and funding coordination', 'sba-express-beginner', 'beginner', 6, '35 minutes', true),
('sba-express-servicing-beginner', 'Express Loan Servicing', 'Ongoing loan management, customer service, and portfolio monitoring', 'sba-express-beginner', 'beginner', 7, '40 minutes', true);

-- SBA Express - Expert (7 modules)
INSERT INTO course_modules (module_id, title, description, course_id, skill_level, order_index, duration, is_active) VALUES
('sba-express-advanced-expert', 'Advanced Express Strategies', 'Complex Express loan structures, advanced program utilization, and strategic implementation', 'sba-express-expert', 'expert', 1, '75 minutes', true),
('sba-express-complex-expert', 'Complex Express Scenarios', 'Handling challenging Express applications, problem resolution, and advanced processing', 'sba-express-expert', 'expert', 2, '70 minutes', true),
('sba-express-master-underwriting-expert', 'Master Express Underwriting', 'Advanced underwriting for Express loans, complex analysis, and sophisticated decision-making', 'sba-express-expert', 'expert', 3, '85 minutes', true),
('sba-express-regulatory-expert', 'Express Regulatory Excellence', 'Advanced compliance management, regulatory interpretation, and policy mastery', 'sba-express-expert', 'expert', 4, '60 minutes', true),
('sba-express-advanced-risk-expert', 'Advanced Express Risk Management', 'Sophisticated risk strategies, complex guaranty structures, and mitigation techniques', 'sba-express-expert', 'expert', 5, '70 minutes', true),
('sba-express-expert-closing-expert', 'Expert Express Closing', 'Advanced closing techniques, complex scenarios, and optimal funding strategies', 'sba-express-expert', 'expert', 6, '55 minutes', true),
('sba-express-strategic-expert', 'Strategic Express Portfolio Management', 'Advanced portfolio optimization, performance management, and client excellence', 'sba-express-expert', 'expert', 7, '65 minutes', true);

-- Commercial Real Estate - Beginner (7 modules)
INSERT INTO course_modules (module_id, title, description, course_id, skill_level, order_index, duration, is_active) VALUES
('cre-intro-beginner', 'Commercial Real Estate Basics', 'Introduction to commercial real estate financing, property types, and market fundamentals', 'commercial-real-estate-beginner', 'beginner', 1, '50 minutes', true),
('cre-application-beginner', 'CRE Application Process', 'Commercial real estate loan application procedures, required documentation, and initial analysis', 'commercial-real-estate-beginner', 'beginner', 2, '65 minutes', true),
('cre-underwriting-beginner', 'CRE Underwriting Fundamentals', 'Basic commercial real estate underwriting, cash flow analysis, and property evaluation', 'commercial-real-estate-beginner', 'beginner', 3, '80 minutes', true),
('cre-valuation-beginner', 'Property Valuation Methods', 'Basic property valuation techniques, appraisal review, and market analysis', 'commercial-real-estate-beginner', 'beginner', 4, '70 minutes', true),
('cre-risk-beginner', 'CRE Risk Assessment', 'Risk evaluation for commercial properties, market risk, and borrower analysis', 'commercial-real-estate-beginner', 'beginner', 5, '60 minutes', true),
('cre-closing-beginner', 'CRE Closing Process', 'Commercial real estate closing procedures, title work, and funding coordination', 'commercial-real-estate-beginner', 'beginner', 6, '55 minutes', true),
('cre-management-beginner', 'CRE Portfolio Management', 'Managing commercial real estate loans, property monitoring, and relationship management', 'commercial-real-estate-beginner', 'beginner', 7, '45 minutes', true);

-- Commercial Real Estate - Expert (7 modules)
INSERT INTO course_modules (module_id, title, description, course_id, skill_level, order_index, duration, is_active) VALUES
('cre-advanced-expert', 'Advanced CRE Strategies', 'Complex commercial real estate financing, sophisticated deal structures, and market leadership', 'commercial-real-estate-expert', 'expert', 1, '95 minutes', true),
('cre-complex-expert', 'Complex CRE Transactions', 'Handling sophisticated CRE deals, multi-property transactions, and complex structuring', 'commercial-real-estate-expert', 'expert', 2, '90 minutes', true),
('cre-master-underwriting-expert', 'Master CRE Underwriting', 'Advanced underwriting techniques, complex cash flow analysis, and sophisticated risk evaluation', 'commercial-real-estate-expert', 'expert', 3, '105 minutes', true),
('cre-advanced-valuation-expert', 'Advanced Valuation Techniques', 'Sophisticated property valuation, complex appraisal analysis, and market expertise', 'commercial-real-estate-expert', 'expert', 4, '85 minutes', true),
('cre-sophisticated-risk-expert', 'Sophisticated CRE Risk Management', 'Advanced risk mitigation, complex market analysis, and strategic risk assessment', 'commercial-real-estate-expert', 'expert', 5, '80 minutes', true),
('cre-expert-closing-expert', 'Expert CRE Closing', 'Complex closing scenarios, advanced documentation, and sophisticated funding strategies', 'commercial-real-estate-expert', 'expert', 6, '75 minutes', true),
('cre-strategic-expert', 'Strategic CRE Portfolio Management', 'Advanced portfolio strategies, market leadership, and client relationship excellence', 'commercial-real-estate-expert', 'expert', 7, '70 minutes', true);