-- Continue creating 7 course modules for remaining loan originator courses

-- Equipment Financing - Beginner (7 modules)
INSERT INTO course_modules (module_id, title, description, course_id, skill_level, order_index, duration, is_active) VALUES
('equipment-intro-beginner', 'Equipment Financing Basics', 'Introduction to equipment financing programs, asset types, and lending fundamentals', 'equipment-financing-beginner', 'beginner', 1, '45 minutes', true),
('equipment-application-beginner', 'Equipment Loan Application', 'Application process for equipment financing, documentation requirements, and vendor relationships', 'equipment-financing-beginner', 'beginner', 2, '55 minutes', true),
('equipment-underwriting-beginner', 'Equipment Underwriting Fundamentals', 'Basic equipment underwriting, asset evaluation, and borrower credit analysis', 'equipment-financing-beginner', 'beginner', 3, '70 minutes', true),
('equipment-valuation-beginner', 'Equipment Valuation Methods', 'Asset appraisal techniques, depreciation analysis, and market value assessment', 'equipment-financing-beginner', 'beginner', 4, '60 minutes', true),
('equipment-risk-beginner', 'Equipment Risk Assessment', 'Risk evaluation for equipment loans, asset risk, and borrower analysis', 'equipment-financing-beginner', 'beginner', 5, '50 minutes', true),
('equipment-closing-beginner', 'Equipment Loan Closing', 'Closing procedures for equipment financing, UCC filings, and funding coordination', 'equipment-financing-beginner', 'beginner', 6, '45 minutes', true),
('equipment-management-beginner', 'Equipment Portfolio Management', 'Managing equipment loans, asset monitoring, and customer relationships', 'equipment-financing-beginner', 'beginner', 7, '40 minutes', true);

-- Equipment Financing - Expert (7 modules)
INSERT INTO course_modules (module_id, title, description, course_id, skill_level, order_index, duration, is_active) VALUES
('equipment-advanced-expert', 'Advanced Equipment Strategies', 'Complex equipment financing structures, lease vs. purchase analysis, and strategic implementation', 'equipment-financing-expert', 'expert', 1, '80 minutes', true),
('equipment-complex-expert', 'Complex Equipment Transactions', 'Sophisticated equipment deals, multi-asset transactions, and vendor program management', 'equipment-financing-expert', 'expert', 2, '75 minutes', true),
('equipment-master-underwriting-expert', 'Master Equipment Underwriting', 'Advanced underwriting techniques, complex asset analysis, and sophisticated risk evaluation', 'equipment-financing-expert', 'expert', 3, '90 minutes', true),
('equipment-advanced-valuation-expert', 'Advanced Equipment Valuation', 'Sophisticated asset valuation, complex depreciation models, and market expertise', 'equipment-financing-expert', 'expert', 4, '70 minutes', true),
('equipment-sophisticated-risk-expert', 'Sophisticated Equipment Risk Management', 'Advanced risk mitigation, complex asset protection, and strategic risk assessment', 'equipment-financing-expert', 'expert', 5, '65 minutes', true),
('equipment-expert-closing-expert', 'Expert Equipment Closing', 'Complex closing scenarios, advanced documentation, and sophisticated funding strategies', 'equipment-financing-expert', 'expert', 6, '60 minutes', true),
('equipment-strategic-expert', 'Strategic Equipment Portfolio Management', 'Advanced portfolio strategies, vendor relationships, and client excellence', 'equipment-financing-expert', 'expert', 7, '55 minutes', true);

-- Invoice Factoring - Beginner (7 modules)
INSERT INTO course_modules (module_id, title, description, course_id, skill_level, order_index, duration, is_active) VALUES
('invoice-intro-beginner', 'Invoice Factoring Introduction', 'Fundamentals of invoice factoring, cash flow solutions, and program basics', 'invoice-factoring-beginner', 'beginner', 1, '40 minutes', true),
('invoice-application-beginner', 'Factoring Application Process', 'Application procedures, client onboarding, and documentation requirements', 'invoice-factoring-beginner', 'beginner', 2, '50 minutes', true),
('invoice-underwriting-beginner', 'Factoring Underwriting Basics', 'Basic factoring underwriting, debtor analysis, and credit evaluation', 'invoice-factoring-beginner', 'beginner', 3, '65 minutes', true),
('invoice-verification-beginner', 'Invoice Verification Process', 'Invoice verification procedures, debtor confirmation, and quality control', 'invoice-factoring-beginner', 'beginner', 4, '55 minutes', true),
('invoice-risk-beginner', 'Factoring Risk Assessment', 'Risk evaluation techniques, debtor creditworthiness, and collection analysis', 'invoice-factoring-beginner', 'beginner', 5, '60 minutes', true),
('invoice-funding-beginner', 'Factoring Funding Process', 'Funding procedures, advance rates, and reserve management', 'invoice-factoring-beginner', 'beginner', 6, '45 minutes', true),
('invoice-collections-beginner', 'Collections & Client Management', 'Collection procedures, client relationships, and ongoing account management', 'invoice-factoring-beginner', 'beginner', 7, '50 minutes', true);

-- Invoice Factoring - Expert (7 modules)
INSERT INTO course_modules (module_id, title, description, course_id, skill_level, order_index, duration, is_active) VALUES
('invoice-advanced-expert', 'Advanced Factoring Strategies', 'Complex factoring structures, selective factoring, and strategic program design', 'invoice-factoring-expert', 'expert', 1, '75 minutes', true),
('invoice-complex-expert', 'Complex Factoring Scenarios', 'Sophisticated client needs, multi-debtor portfolios, and advanced structuring', 'invoice-factoring-expert', 'expert', 2, '70 minutes', true),
('invoice-master-underwriting-expert', 'Master Factoring Underwriting', 'Advanced underwriting techniques, complex debtor analysis, and portfolio evaluation', 'invoice-factoring-expert', 'expert', 3, '85 minutes', true),
('invoice-advanced-verification-expert', 'Advanced Verification Techniques', 'Sophisticated verification processes, fraud detection, and quality assurance', 'invoice-factoring-expert', 'expert', 4, '65 minutes', true),
('invoice-sophisticated-risk-expert', 'Sophisticated Risk Management', 'Advanced risk mitigation, complex portfolio management, and strategic protection', 'invoice-factoring-expert', 'expert', 5, '80 minutes', true),
('invoice-expert-funding-expert', 'Expert Funding Strategies', 'Complex funding scenarios, advanced reserve management, and optimization techniques', 'invoice-factoring-expert', 'expert', 6, '60 minutes', true),
('invoice-strategic-expert', 'Strategic Collections & Portfolio Management', 'Advanced collection strategies, client relationship excellence, and portfolio optimization', 'invoice-factoring-expert', 'expert', 7, '70 minutes', true);

-- Merchant Cash Advances - Beginner (7 modules)
INSERT INTO course_modules (module_id, title, description, course_id, skill_level, order_index, duration, is_active) VALUES
('mca-intro-beginner', 'Merchant Cash Advance Basics', 'Introduction to MCA programs, cash flow solutions, and basic structure', 'merchant-cash-advances-beginner', 'beginner', 1, '35 minutes', true),
('mca-application-beginner', 'MCA Application Process', 'Application procedures, merchant onboarding, and required documentation', 'merchant-cash-advances-beginner', 'beginner', 2, '45 minutes', true),
('mca-underwriting-beginner', 'MCA Underwriting Fundamentals', 'Basic MCA underwriting, cash flow analysis, and merchant evaluation', 'merchant-cash-advances-beginner', 'beginner', 3, '60 minutes', true),
('mca-pricing-beginner', 'MCA Pricing & Structuring', 'Factor rates, holdback percentages, and basic deal structuring', 'merchant-cash-advances-beginner', 'beginner', 4, '50 minutes', true),
('mca-risk-beginner', 'MCA Risk Assessment', 'Risk evaluation for merchant advances, industry analysis, and cash flow assessment', 'merchant-cash-advances-beginner', 'beginner', 5, '55 minutes', true),
('mca-funding-beginner', 'MCA Funding Process', 'Funding procedures, ACH setup, and payment collection systems', 'merchant-cash-advances-beginner', 'beginner', 6, '40 minutes', true),
('mca-servicing-beginner', 'MCA Servicing & Collections', 'Ongoing servicing, payment monitoring, and merchant relationship management', 'merchant-cash-advances-beginner', 'beginner', 7, '45 minutes', true);

-- Merchant Cash Advances - Expert (7 modules)
INSERT INTO course_modules (module_id, title, description, course_id, skill_level, order_index, duration, is_active) VALUES
('mca-advanced-expert', 'Advanced MCA Strategies', 'Complex MCA structures, split funding, and strategic program development', 'merchant-cash-advances-expert', 'expert', 1, '70 minutes', true),
('mca-complex-expert', 'Complex MCA Scenarios', 'Sophisticated merchant needs, multi-location businesses, and advanced structuring', 'merchant-cash-advances-expert', 'expert', 2, '65 minutes', true),
('mca-master-underwriting-expert', 'Master MCA Underwriting', 'Advanced underwriting techniques, complex cash flow analysis, and sophisticated evaluation', 'merchant-cash-advances-expert', 'expert', 3, '80 minutes', true),
('mca-advanced-pricing-expert', 'Advanced MCA Pricing', 'Sophisticated pricing models, risk-based pricing, and competitive positioning', 'merchant-cash-advances-expert', 'expert', 4, '60 minutes', true),
('mca-sophisticated-risk-expert', 'Sophisticated MCA Risk Management', 'Advanced risk strategies, portfolio diversification, and strategic protection', 'merchant-cash-advances-expert', 'expert', 5, '75 minutes', true),
('mca-expert-funding-expert', 'Expert MCA Funding', 'Complex funding scenarios, advanced payment systems, and optimization strategies', 'merchant-cash-advances-expert', 'expert', 6, '55 minutes', true),
('mca-strategic-expert', 'Strategic MCA Portfolio Management', 'Advanced portfolio management, merchant relationship excellence, and performance optimization', 'merchant-cash-advances-expert', 'expert', 7, '65 minutes', true);

-- Asset-Based Lending - Beginner (7 modules)
INSERT INTO course_modules (module_id, title, description, course_id, skill_level, order_index, duration, is_active) VALUES
('abl-intro-beginner', 'Asset-Based Lending Introduction', 'Fundamentals of asset-based lending, collateral types, and program basics', 'asset-based-lending-beginner', 'beginner', 1, '50 minutes', true),
('abl-application-beginner', 'ABL Application Process', 'Application procedures for asset-based loans, borrowing base analysis, and documentation', 'asset-based-lending-beginner', 'beginner', 2, '60 minutes', true),
('abl-underwriting-beginner', 'ABL Underwriting Fundamentals', 'Basic ABL underwriting, collateral evaluation, and borrower analysis', 'asset-based-lending-beginner', 'beginner', 3, '75 minutes', true),
('abl-collateral-beginner', 'Collateral Analysis Methods', 'Asset evaluation techniques, borrowing base calculations, and collateral monitoring', 'asset-based-lending-beginner', 'beginner', 4, '65 minutes', true),
('abl-risk-beginner', 'ABL Risk Assessment', 'Risk evaluation for asset-based loans, collateral risk, and borrower analysis', 'asset-based-lending-beginner', 'beginner', 5, '70 minutes', true),
('abl-closing-beginner', 'ABL Closing Process', 'Closing procedures for ABL facilities, UCC filings, and security documentation', 'asset-based-lending-beginner', 'beginner', 6, '55 minutes', true),
('abl-monitoring-beginner', 'ABL Monitoring & Management', 'Ongoing monitoring, borrowing base management, and client relationships', 'asset-based-lending-beginner', 'beginner', 7, '60 minutes', true);

-- Asset-Based Lending - Expert (7 modules)
INSERT INTO course_modules (module_id, title, description, course_id, skill_level, order_index, duration, is_active) VALUES
('abl-advanced-expert', 'Advanced ABL Strategies', 'Complex ABL structures, syndicated facilities, and strategic implementation', 'asset-based-lending-expert', 'expert', 1, '90 minutes', true),
('abl-complex-expert', 'Complex ABL Transactions', 'Sophisticated ABL deals, multi-borrower facilities, and complex structuring', 'asset-based-lending-expert', 'expert', 2, '85 minutes', true),
('abl-master-underwriting-expert', 'Master ABL Underwriting', 'Advanced underwriting techniques, complex collateral analysis, and sophisticated evaluation', 'asset-based-lending-expert', 'expert', 3, '100 minutes', true),
('abl-advanced-collateral-expert', 'Advanced Collateral Management', 'Sophisticated collateral strategies, complex borrowing base structures, and optimization', 'asset-based-lending-expert', 'expert', 4, '80 minutes', true),
('abl-sophisticated-risk-expert', 'Sophisticated ABL Risk Management', 'Advanced risk mitigation, complex monitoring systems, and strategic protection', 'asset-based-lending-expert', 'expert', 5, '85 minutes', true),
('abl-expert-closing-expert', 'Expert ABL Closing', 'Complex closing scenarios, advanced documentation, and sophisticated security structures', 'asset-based-lending-expert', 'expert', 6, '70 minutes', true),
('abl-strategic-expert', 'Strategic ABL Portfolio Management', 'Advanced portfolio strategies, client relationship excellence, and performance optimization', 'asset-based-lending-expert', 'expert', 7, '75 minutes', true);