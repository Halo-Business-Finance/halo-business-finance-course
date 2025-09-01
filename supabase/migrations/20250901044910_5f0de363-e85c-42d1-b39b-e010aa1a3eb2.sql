-- Complete the remaining modules for all 13 course types
-- Adding the missing modules for courses 6-13

-- Construction Loans - Complete Intermediate and Expert modules
INSERT INTO course_modules (module_id, title, description, duration, skill_level, order_index, is_active) VALUES
-- Construction Loans Intermediate modules
('construction-loans-intermediate-module-1', 'Advanced Project Management', 'Complex construction project management and risk mitigation.', '60 minutes', 'intermediate', 1, true),
('construction-loans-intermediate-module-2', 'Complex Financing Structures', 'Advanced construction financing structures and strategies.', '60 minutes', 'intermediate', 2, true),
('construction-loans-intermediate-module-3', 'Risk Mitigation Strategies', 'Advanced risk assessment and mitigation for construction projects.', '60 minutes', 'intermediate', 3, true),
('construction-loans-intermediate-module-4', 'Environmental and Regulatory', 'Managing environmental and regulatory challenges in construction.', '60 minutes', 'intermediate', 4, true),
('construction-loans-intermediate-module-5', 'Multi-Phase Development', 'Financing complex multi-phase construction developments.', '60 minutes', 'intermediate', 5, true),
('construction-loans-intermediate-module-6', 'Problem Resolution', 'Managing troubled construction loans and workout strategies.', '60 minutes', 'intermediate', 6, true),
('construction-loans-intermediate-module-7', 'Portfolio Management', 'Managing construction loan portfolios effectively.', '60 minutes', 'intermediate', 7, true),

-- Construction Loans Expert modules
('construction-loans-expert-module-1', 'Strategic Portfolio Planning', 'Master-level construction lending portfolio strategy.', '75 minutes', 'expert', 1, true),
('construction-loans-expert-module-2', 'Advanced Risk Analytics', 'Sophisticated risk analytics for construction lending.', '75 minutes', 'expert', 2, true),
('construction-loans-expert-module-3', 'Market Leadership', 'Building market leadership in construction lending.', '75 minutes', 'expert', 3, true),
('construction-loans-expert-module-4', 'Innovation in Construction Finance', 'Driving innovation in construction financing products.', '75 minutes', 'expert', 4, true),
('construction-loans-expert-module-5', 'Strategic Partnerships', 'Building strategic partnerships in construction lending.', '75 minutes', 'expert', 5, true),
('construction-loans-expert-module-6', 'Regulatory Excellence', 'Advanced regulatory compliance for construction lending.', '75 minutes', 'expert', 6, true),
('construction-loans-expert-module-7', 'Future of Construction Finance', 'Anticipating future trends in construction financing.', '75 minutes', 'expert', 7, true);

-- Lines of Credit - Complete Intermediate and Expert modules
INSERT INTO course_modules (module_id, title, description, duration, skill_level, order_index, is_active) VALUES
-- Lines of Credit Intermediate modules
('lines-of-credit-intermediate-module-1', 'Advanced Credit Structures', 'Complex credit line structures and optimization techniques.', '60 minutes', 'intermediate', 1, true),
('lines-of-credit-intermediate-module-2', 'Portfolio Management', 'Managing credit line portfolios and risk concentration.', '60 minutes', 'intermediate', 2, true),
('lines-of-credit-intermediate-module-3', 'Complex Scenarios', 'Handling complex credit line scenarios and challenges.', '60 minutes', 'intermediate', 3, true),
('lines-of-credit-intermediate-module-4', 'Advanced Monitoring', 'Sophisticated monitoring and early warning systems.', '60 minutes', 'intermediate', 4, true),
('lines-of-credit-intermediate-module-5', 'Covenant Design', 'Advanced covenant design and management strategies.', '60 minutes', 'intermediate', 5, true),
('lines-of-credit-intermediate-module-6', 'Technology Integration', 'Leveraging technology in credit line management.', '60 minutes', 'intermediate', 6, true),
('lines-of-credit-intermediate-module-7', 'Problem Resolution', 'Managing troubled credit lines and restructuring options.', '60 minutes', 'intermediate', 7, true),

-- Lines of Credit Expert modules
('lines-of-credit-expert-module-1', 'Strategic Portfolio Management', 'Master-level credit line portfolio strategy and optimization.', '75 minutes', 'expert', 1, true),
('lines-of-credit-expert-module-2', 'Advanced Risk Management', 'Sophisticated risk management for credit line portfolios.', '75 minutes', 'expert', 2, true),
('lines-of-credit-expert-module-3', 'Market Innovation', 'Driving innovation in credit line products and services.', '75 minutes', 'expert', 3, true),
('lines-of-credit-expert-module-4', 'Partnership Strategies', 'Building strategic partnerships in credit line lending.', '75 minutes', 'expert', 4, true),
('lines-of-credit-expert-module-5', 'Regulatory Excellence', 'Advanced regulatory compliance and best practices.', '75 minutes', 'expert', 5, true),
('lines-of-credit-expert-module-6', 'Performance Analytics', 'Advanced analytics for credit line portfolio optimization.', '75 minutes', 'expert', 6, true),
('lines-of-credit-expert-module-7', 'Future Trends', 'Anticipating future trends in credit line lending.', '75 minutes', 'expert', 7, true);

-- Asset-Based Lending - All modules
INSERT INTO course_modules (module_id, title, description, duration, skill_level, order_index, is_active) VALUES
-- Asset-Based Lending Beginner modules
('asset-based-lending-beginner-module-1', 'ABL Fundamentals', 'Introduction to asset-based lending principles and concepts.', '45 minutes', 'beginner', 1, true),
('asset-based-lending-beginner-module-2', 'Collateral Types', 'Understanding different types of ABL collateral and valuation.', '45 minutes', 'beginner', 2, true),
('asset-based-lending-beginner-module-3', 'Basic Structuring', 'Fundamental ABL structuring principles and techniques.', '45 minutes', 'beginner', 3, true),
('asset-based-lending-beginner-module-4', 'Application Process', 'Step-by-step ABL application and underwriting process.', '45 minutes', 'beginner', 4, true),
('asset-based-lending-beginner-module-5', 'Field Examination', 'Basic field examination procedures and requirements.', '45 minutes', 'beginner', 5, true),
('asset-based-lending-beginner-module-6', 'Monitoring Basics', 'Essential ABL monitoring and reporting requirements.', '45 minutes', 'beginner', 6, true),
('asset-based-lending-beginner-module-7', 'Loan Administration', 'Basic ABL loan administration and servicing.', '45 minutes', 'beginner', 7, true),

-- Asset-Based Lending Intermediate modules
('asset-based-lending-intermediate-module-1', 'Advanced Collateral Analysis', 'Complex collateral evaluation and risk assessment techniques.', '60 minutes', 'intermediate', 1, true),
('asset-based-lending-intermediate-module-2', 'Complex Deal Structures', 'Advanced ABL structuring for challenging transactions.', '60 minutes', 'intermediate', 2, true),
('asset-based-lending-intermediate-module-3', 'Industry Specialization', 'ABL for specialized industries and unique scenarios.', '60 minutes', 'intermediate', 3, true),
('asset-based-lending-intermediate-module-4', 'Risk Management', 'Advanced risk assessment and mitigation strategies.', '60 minutes', 'intermediate', 4, true),
('asset-based-lending-intermediate-module-5', 'Advanced Monitoring', 'Sophisticated monitoring and early warning systems.', '60 minutes', 'intermediate', 5, true),
('asset-based-lending-intermediate-module-6', 'Portfolio Management', 'Managing ABL portfolios and concentration risk.', '60 minutes', 'intermediate', 6, true),
('asset-based-lending-intermediate-module-7', 'Problem Resolution', 'Managing troubled ABL loans and workout strategies.', '60 minutes', 'intermediate', 7, true),

-- Asset-Based Lending Expert modules
('asset-based-lending-expert-module-1', 'Strategic Portfolio Planning', 'Master-level ABL portfolio strategy and optimization.', '75 minutes', 'expert', 1, true),
('asset-based-lending-expert-module-2', 'Advanced Analytics', 'Sophisticated analytics and performance measurement.', '75 minutes', 'expert', 2, true),
('asset-based-lending-expert-module-3', 'Market Leadership', 'Building market leadership in asset-based lending.', '75 minutes', 'expert', 3, true),
('asset-based-lending-expert-module-4', 'Innovation Strategies', 'Driving innovation in ABL products and services.', '75 minutes', 'expert', 4, true),
('asset-based-lending-expert-module-5', 'Partnership Development', 'Building strategic partnerships in the ABL ecosystem.', '75 minutes', 'expert', 5, true),
('asset-based-lending-expert-module-6', 'Regulatory Excellence', 'Advanced regulatory compliance and risk management.', '75 minutes', 'expert', 6, true),
('asset-based-lending-expert-module-7', 'Future Trends', 'Anticipating future trends in asset-based lending.', '75 minutes', 'expert', 7, true);

-- Term Loans - All modules
INSERT INTO course_modules (module_id, title, description, duration, skill_level, order_index, is_active) VALUES
-- Term Loans Beginner modules
('term-loans-beginner-module-1', 'Term Loan Fundamentals', 'Introduction to term lending principles and concepts.', '45 minutes', 'beginner', 1, true),
('term-loans-beginner-module-2', 'Loan Structures', 'Understanding different term loan structures and features.', '45 minutes', 'beginner', 2, true),
('term-loans-beginner-module-3', 'Amortization Schedules', 'Basic amortization principles and payment calculations.', '45 minutes', 'beginner', 3, true),
('term-loans-beginner-module-4', 'Underwriting Basics', 'Fundamental underwriting principles for term loans.', '45 minutes', 'beginner', 4, true),
('term-loans-beginner-module-5', 'Documentation Requirements', 'Essential documents for term loan transactions.', '45 minutes', 'beginner', 5, true),
('term-loans-beginner-module-6', 'Collateral Analysis', 'Basic collateral evaluation for term loans.', '45 minutes', 'beginner', 6, true),
('term-loans-beginner-module-7', 'Loan Servicing', 'Basic term loan servicing and administration.', '45 minutes', 'beginner', 7, true),

-- Term Loans Intermediate modules
('term-loans-intermediate-module-1', 'Advanced Structuring', 'Complex term loan structuring and optimization techniques.', '60 minutes', 'intermediate', 1, true),
('term-loans-intermediate-module-2', 'Risk Assessment', 'Advanced risk evaluation methods for term loans.', '60 minutes', 'intermediate', 2, true),
('term-loans-intermediate-module-3', 'Industry Analysis', 'Industry-specific considerations for term lending.', '60 minutes', 'intermediate', 3, true),
('term-loans-intermediate-module-4', 'Complex Scenarios', 'Handling challenging term loan scenarios and structures.', '60 minutes', 'intermediate', 4, true),
('term-loans-intermediate-module-5', 'Covenant Design', 'Advanced covenant design and monitoring strategies.', '60 minutes', 'intermediate', 5, true),
('term-loans-intermediate-module-6', 'Portfolio Management', 'Managing term loan portfolios effectively.', '60 minutes', 'intermediate', 6, true),
('term-loans-intermediate-module-7', 'Problem Resolution', 'Managing troubled term loans and restructuring options.', '60 minutes', 'intermediate', 7, true),

-- Term Loans Expert modules
('term-loans-expert-module-1', 'Strategic Portfolio Management', 'Master-level term loan portfolio strategy.', '75 minutes', 'expert', 1, true),
('term-loans-expert-module-2', 'Advanced Risk Management', 'Sophisticated risk management techniques for term loans.', '75 minutes', 'expert', 2, true),
('term-loans-expert-module-3', 'Market Innovation', 'Driving innovation in term loan products and services.', '75 minutes', 'expert', 3, true),
('term-loans-expert-module-4', 'Partnership Strategies', 'Building strategic partnerships in term lending.', '75 minutes', 'expert', 4, true),
('term-loans-expert-module-5', 'Regulatory Excellence', 'Advanced regulatory compliance for term lending.', '75 minutes', 'expert', 5, true),
('term-loans-expert-module-6', 'Performance Analytics', 'Advanced analytics for term loan portfolio optimization.', '75 minutes', 'expert', 6, true),
('term-loans-expert-module-7', 'Future Trends', 'Anticipating future trends in term lending.', '75 minutes', 'expert', 7, true);

-- Invoice Factoring - All modules
INSERT INTO course_modules (module_id, title, description, duration, skill_level, order_index, is_active) VALUES
-- Invoice Factoring Beginner modules
('invoice-factoring-beginner-module-1', 'Factoring Fundamentals', 'Introduction to invoice factoring and receivables financing.', '45 minutes', 'beginner', 1, true),
('invoice-factoring-beginner-module-2', 'Receivables Evaluation', 'Basic accounts receivable evaluation and assessment.', '45 minutes', 'beginner', 2, true),
('invoice-factoring-beginner-module-3', 'Factoring Structures', 'Understanding different factoring structures and options.', '45 minutes', 'beginner', 3, true),
('invoice-factoring-beginner-module-4', 'Application Process', 'Step-by-step factoring application and approval process.', '45 minutes', 'beginner', 4, true),
('invoice-factoring-beginner-module-5', 'Credit Analysis', 'Basic credit analysis of account debtors.', '45 minutes', 'beginner', 5, true),
('invoice-factoring-beginner-module-6', 'Collections Basics', 'Introduction to factoring collections and administration.', '45 minutes', 'beginner', 6, true),
('invoice-factoring-beginner-module-7', 'Reporting and Monitoring', 'Basic factoring reporting and monitoring requirements.', '45 minutes', 'beginner', 7, true),

-- Invoice Factoring Intermediate modules
('invoice-factoring-intermediate-module-1', 'Advanced Receivables Analysis', 'Complex receivables evaluation and risk assessment.', '60 minutes', 'intermediate', 1, true),
('invoice-factoring-intermediate-module-2', 'Complex Deal Structures', 'Advanced factoring structures for challenging scenarios.', '60 minutes', 'intermediate', 2, true),
('invoice-factoring-intermediate-module-3', 'Industry Specialization', 'Factoring for specialized industries and unique scenarios.', '60 minutes', 'intermediate', 3, true),
('invoice-factoring-intermediate-module-4', 'Risk Management', 'Advanced risk assessment and mitigation strategies.', '60 minutes', 'intermediate', 4, true),
('invoice-factoring-intermediate-module-5', 'Advanced Collections', 'Sophisticated collections and recovery strategies.', '60 minutes', 'intermediate', 5, true),
('invoice-factoring-intermediate-module-6', 'Portfolio Management', 'Managing factoring portfolios and concentration risk.', '60 minutes', 'intermediate', 6, true),
('invoice-factoring-intermediate-module-7', 'Problem Resolution', 'Managing troubled factoring relationships and workouts.', '60 minutes', 'intermediate', 7, true),

-- Invoice Factoring Expert modules
('invoice-factoring-expert-module-1', 'Strategic Portfolio Planning', 'Master-level factoring portfolio strategy and optimization.', '75 minutes', 'expert', 1, true),
('invoice-factoring-expert-module-2', 'Advanced Analytics', 'Sophisticated analytics and performance measurement.', '75 minutes', 'expert', 2, true),
('invoice-factoring-expert-module-3', 'Market Leadership', 'Building market leadership in invoice factoring.', '75 minutes', 'expert', 3, true),
('invoice-factoring-expert-module-4', 'Innovation Strategies', 'Driving innovation in factoring products and services.', '75 minutes', 'expert', 4, true),
('invoice-factoring-expert-module-5', 'Partnership Development', 'Building strategic partnerships in factoring.', '75 minutes', 'expert', 5, true),
('invoice-factoring-expert-module-6', 'Regulatory Excellence', 'Advanced regulatory compliance and risk management.', '75 minutes', 'expert', 6, true),
('invoice-factoring-expert-module-7', 'Future Trends', 'Anticipating future trends in invoice factoring.', '75 minutes', 'expert', 7, true);

-- Merchant Cash Advances - All modules
INSERT INTO course_modules (module_id, title, description, duration, skill_level, order_index, is_active) VALUES
-- Merchant Cash Advances Beginner modules
('merchant-cash-advances-beginner-module-1', 'MCA Fundamentals', 'Introduction to merchant cash advances and revenue-based financing.', '45 minutes', 'beginner', 1, true),
('merchant-cash-advances-beginner-module-2', 'Factor Rates and Pricing', 'Understanding factor rates, fees, and MCA pricing structures.', '45 minutes', 'beginner', 2, true),
('merchant-cash-advances-beginner-module-3', 'Qualification Criteria', 'Basic qualification requirements and assessment criteria.', '45 minutes', 'beginner', 3, true),
('merchant-cash-advances-beginner-module-4', 'Application Process', 'Step-by-step MCA application and approval process.', '45 minutes', 'beginner', 4, true),
('merchant-cash-advances-beginner-module-5', 'Revenue Analysis', 'Basic business revenue analysis and forecasting.', '45 minutes', 'beginner', 5, true),
('merchant-cash-advances-beginner-module-6', 'Collection Methods', 'Understanding MCA collection methods and procedures.', '45 minutes', 'beginner', 6, true),
('merchant-cash-advances-beginner-module-7', 'Monitoring and Administration', 'Basic MCA monitoring and administrative procedures.', '45 minutes', 'beginner', 7, true),

-- Merchant Cash Advances Intermediate modules
('merchant-cash-advances-intermediate-module-1', 'Advanced Revenue Analysis', 'Complex revenue analysis and cash flow modeling.', '60 minutes', 'intermediate', 1, true),
('merchant-cash-advances-intermediate-module-2', 'Risk Assessment', 'Advanced risk evaluation methods for MCA transactions.', '60 minutes', 'intermediate', 2, true),
('merchant-cash-advances-intermediate-module-3', 'Industry Specialization', 'MCA for specialized industries and unique business models.', '60 minutes', 'intermediate', 3, true),
('merchant-cash-advances-intermediate-module-4', 'Complex Scenarios', 'Handling challenging MCA scenarios and structures.', '60 minutes', 'intermediate', 4, true),
('merchant-cash-advances-intermediate-module-5', 'Technology Integration', 'Leveraging technology in MCA processes and monitoring.', '60 minutes', 'intermediate', 5, true),
('merchant-cash-advances-intermediate-module-6', 'Portfolio Management', 'Managing MCA portfolios and performance optimization.', '60 minutes', 'intermediate', 6, true),
('merchant-cash-advances-intermediate-module-7', 'Problem Resolution', 'Managing troubled MCA relationships and recovery strategies.', '60 minutes', 'intermediate', 7, true),

-- Merchant Cash Advances Expert modules
('merchant-cash-advances-expert-module-1', 'Strategic Portfolio Management', 'Master-level MCA portfolio strategy and optimization.', '75 minutes', 'expert', 1, true),
('merchant-cash-advances-expert-module-2', 'Advanced Risk Management', 'Sophisticated risk management techniques for MCA.', '75 minutes', 'expert', 2, true),
('merchant-cash-advances-expert-module-3', 'Market Innovation', 'Driving innovation in MCA products and services.', '75 minutes', 'expert', 3, true),
('merchant-cash-advances-expert-module-4', 'Partnership Strategies', 'Building strategic partnerships in the MCA ecosystem.', '75 minutes', 'expert', 4, true),
('merchant-cash-advances-expert-module-5', 'Regulatory Excellence', 'Advanced regulatory compliance and best practices.', '75 minutes', 'expert', 5, true),
('merchant-cash-advances-expert-module-6', 'Performance Analytics', 'Advanced analytics for MCA portfolio optimization.', '75 minutes', 'expert', 6, true),
('merchant-cash-advances-expert-module-7', 'Future Trends', 'Anticipating future trends in merchant cash advances.', '75 minutes', 'expert', 7, true);

-- Franchise Financing - All modules
INSERT INTO course_modules (module_id, title, description, duration, skill_level, order_index, is_active) VALUES
-- Franchise Financing Beginner modules
('franchise-financing-beginner-module-1', 'Franchise Financing Basics', 'Introduction to franchise financing and industry fundamentals.', '45 minutes', 'beginner', 1, true),
('franchise-financing-beginner-module-2', 'Franchisor Relationships', 'Understanding franchisor-franchisee dynamics and requirements.', '45 minutes', 'beginner', 2, true),
('franchise-financing-beginner-module-3', 'Evaluation Criteria', 'Basic franchise evaluation and assessment criteria.', '45 minutes', 'beginner', 3, true),
('franchise-financing-beginner-module-4', 'SBA Franchise Programs', 'Understanding SBA franchise financing programs and benefits.', '45 minutes', 'beginner', 4, true),
('franchise-financing-beginner-module-5', 'Application Process', 'Step-by-step franchise financing application procedures.', '45 minutes', 'beginner', 5, true),
('franchise-financing-beginner-module-6', 'Due Diligence', 'Basic franchise due diligence and documentation requirements.', '45 minutes', 'beginner', 6, true),
('franchise-financing-beginner-module-7', 'Loan Administration', 'Basic franchise loan servicing and administration.', '45 minutes', 'beginner', 7, true),

-- Franchise Financing Intermediate modules
('franchise-financing-intermediate-module-1', 'Advanced Franchise Analysis', 'Complex franchise evaluation and risk assessment techniques.', '60 minutes', 'intermediate', 1, true),
('franchise-financing-intermediate-module-2', 'Multi-Unit Financing', 'Financing strategies for multi-unit franchise development.', '60 minutes', 'intermediate', 2, true),
('franchise-financing-intermediate-module-3', 'Industry Analysis', 'Industry-specific considerations for franchise financing.', '60 minutes', 'intermediate', 3, true),
('franchise-financing-intermediate-module-4', 'Risk Management', 'Advanced risk assessment and mitigation strategies.', '60 minutes', 'intermediate', 4, true),
('franchise-financing-intermediate-module-5', 'Complex Structures', 'Advanced financing structures for franchise transactions.', '60 minutes', 'intermediate', 5, true),
('franchise-financing-intermediate-module-6', 'Portfolio Management', 'Managing franchise financing portfolios effectively.', '60 minutes', 'intermediate', 6, true),
('franchise-financing-intermediate-module-7', 'Problem Resolution', 'Managing troubled franchise loans and workout strategies.', '60 minutes', 'intermediate', 7, true),

-- Franchise Financing Expert modules
('franchise-financing-expert-module-1', 'Strategic Portfolio Planning', 'Master-level franchise financing portfolio strategy.', '75 minutes', 'expert', 1, true),
('franchise-financing-expert-module-2', 'Advanced Analytics', 'Sophisticated analytics and performance measurement.', '75 minutes', 'expert', 2, true),
('franchise-financing-expert-module-3', 'Market Leadership', 'Building market leadership in franchise financing.', '75 minutes', 'expert', 3, true),
('franchise-financing-expert-module-4', 'Innovation Strategies', 'Driving innovation in franchise financing products.', '75 minutes', 'expert', 4, true),
('franchise-financing-expert-module-5', 'Partnership Development', 'Building strategic partnerships in franchise financing.', '75 minutes', 'expert', 5, true),
('franchise-financing-expert-module-6', 'Regulatory Excellence', 'Advanced regulatory compliance and risk management.', '75 minutes', 'expert', 6, true),
('franchise-financing-expert-module-7', 'Future Trends', 'Anticipating future trends in franchise financing.', '75 minutes', 'expert', 7, true);

-- Bridge Loans - All modules
INSERT INTO course_modules (module_id, title, description, duration, skill_level, order_index, is_active) VALUES
-- Bridge Loans Beginner modules
('bridge-loans-beginner-module-1', 'Bridge Lending Fundamentals', 'Introduction to bridge lending and interim financing concepts.', '45 minutes', 'beginner', 1, true),
('bridge-loans-beginner-module-2', 'Loan Structures', 'Understanding different bridge loan structures and features.', '45 minutes', 'beginner', 2, true),
('bridge-loans-beginner-module-3', 'Risk Assessment', 'Basic risk assessment for bridge loan transactions.', '45 minutes', 'beginner', 3, true),
('bridge-loans-beginner-module-4', 'Exit Strategies', 'Understanding and evaluating bridge loan exit strategies.', '45 minutes', 'beginner', 4, true),
('bridge-loans-beginner-module-5', 'Application Process', 'Step-by-step bridge loan application and approval process.', '45 minutes', 'beginner', 5, true),
('bridge-loans-beginner-module-6', 'Documentation Requirements', 'Essential documents for bridge loan transactions.', '45 minutes', 'beginner', 6, true),
('bridge-loans-beginner-module-7', 'Loan Administration', 'Basic bridge loan servicing and administration.', '45 minutes', 'beginner', 7, true),

-- Bridge Loans Intermediate modules
('bridge-loans-intermediate-module-1', 'Advanced Structuring', 'Complex bridge loan structuring and optimization techniques.', '60 minutes', 'intermediate', 1, true),
('bridge-loans-intermediate-module-2', 'Risk Management', 'Advanced risk evaluation and mitigation strategies.', '60 minutes', 'intermediate', 2, true),
('bridge-loans-intermediate-module-3', 'Market Analysis', 'Complex market analysis for bridge loan transactions.', '60 minutes', 'intermediate', 3, true),
('bridge-loans-intermediate-module-4', 'Complex Scenarios', 'Handling challenging bridge loan scenarios and structures.', '60 minutes', 'intermediate', 4, true),
('bridge-loans-intermediate-module-5', 'Exit Strategy Optimization', 'Advanced exit strategy planning and execution.', '60 minutes', 'intermediate', 5, true),
('bridge-loans-intermediate-module-6', 'Portfolio Management', 'Managing bridge loan portfolios effectively.', '60 minutes', 'intermediate', 6, true),
('bridge-loans-intermediate-module-7', 'Problem Resolution', 'Managing troubled bridge loans and workout strategies.', '60 minutes', 'intermediate', 7, true),

-- Bridge Loans Expert modules
('bridge-loans-expert-module-1', 'Strategic Portfolio Management', 'Master-level bridge lending portfolio strategy.', '75 minutes', 'expert', 1, true),
('bridge-loans-expert-module-2', 'Advanced Risk Management', 'Sophisticated risk management for bridge lending.', '75 minutes', 'expert', 2, true),
('bridge-loans-expert-module-3', 'Market Innovation', 'Driving innovation in bridge lending products and services.', '75 minutes', 'expert', 3, true),
('bridge-loans-expert-module-4', 'Partnership Strategies', 'Building strategic partnerships in bridge lending.', '75 minutes', 'expert', 4, true),
('bridge-loans-expert-module-5', 'Regulatory Excellence', 'Advanced regulatory compliance for bridge lending.', '75 minutes', 'expert', 5, true),
('bridge-loans-expert-module-6', 'Performance Analytics', 'Advanced analytics for bridge loan portfolio optimization.', '75 minutes', 'expert', 6, true),
('bridge-loans-expert-module-7', 'Future Trends', 'Anticipating future trends in bridge lending.', '75 minutes', 'expert', 7, true);