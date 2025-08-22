-- Insert comprehensive course articles for all modules
INSERT INTO course_articles (module_id, title, content, excerpt, order_index, is_published, reading_time_minutes, category, tags) VALUES

-- Foundations Module Articles
('foundations', 'Financial Statement Analysis Fundamentals', 
'Understanding financial statements is crucial for commercial lending success. This comprehensive guide covers balance sheets, income statements, and cash flow statements with practical examples from Halo Business Finance deals.

## Balance Sheet Analysis
The balance sheet provides a snapshot of a company''s financial position. Key areas to focus on:
- Asset quality and composition
- Debt structure and leverage ratios
- Working capital management
- Equity position and retained earnings

## Income Statement Deep Dive
Revenue recognition, expense management, and profitability analysis are essential skills for commercial lenders.

## Cash Flow Statement Mastery
Cash flow is king in commercial lending. Learn to analyze operating, investing, and financing activities.',
'Master the fundamentals of financial statement analysis for commercial lending decisions', 1, true, 15, 'analysis', ARRAY['financial-statements', 'analysis', 'lending']),

('foundations', 'Risk Assessment Framework', 
'Halo Business Finance''s proprietary risk assessment methodology combines quantitative analysis with qualitative factors to make informed lending decisions.

## The Five Pillars of Risk Assessment
1. Financial Performance Analysis
2. Management Quality Evaluation  
3. Industry and Market Analysis
4. Competitive Position Assessment
5. Economic Environment Impact

## Quantitative Metrics
- Debt-to-equity ratios
- Current and quick ratios
- Interest coverage ratios
- Cash conversion cycles

## Qualitative Factors
Management experience, industry trends, and market positioning play crucial roles in risk evaluation.',
'Learn Halo''s comprehensive risk assessment framework for commercial lending', 2, true, 12, 'risk', ARRAY['risk-assessment', 'methodology', 'framework']),

-- Capital Markets Articles
('capital-markets', 'Understanding Capital Market Dynamics', 
'Capital markets form the backbone of commercial lending operations. This article explores how institutional funding, secondary markets, and regulatory changes impact lending strategies.

## Primary vs Secondary Markets
Understanding the distinction between primary and secondary markets helps lenders position their loan products effectively.

## Institutional Funding Sources
- Bank holding companies
- Credit unions
- Private equity firms
- Insurance companies

## Market Liquidity Factors
Interest rate environment, regulatory changes, and economic cycles all influence capital availability.',
'Explore how capital markets influence commercial lending strategies and decisions', 1, true, 18, 'markets', ARRAY['capital-markets', 'funding', 'liquidity']),

-- Risk Management Articles  
('risk-management', 'Advanced Credit Risk Modeling', 
'Modern credit risk assessment requires sophisticated modeling techniques that combine traditional analysis with advanced statistical methods.

## Probability of Default Models
Learn to build and validate PD models using historical data and market indicators.

## Loss Given Default Analysis
Understanding recovery rates and collateral valuation for accurate LGD estimates.

## Exposure at Default Calculations
Managing commitment utilization and credit line exposure across portfolios.',
'Master advanced statistical methods for credit risk assessment and modeling', 1, true, 20, 'modeling', ARRAY['credit-risk', 'modeling', 'statistics']),

-- Additional articles for other modules...
('regulatory-compliance', 'Banking Regulation Essentials', 
'Navigate the complex regulatory landscape affecting commercial lending operations, from Basel III to Dodd-Frank compliance requirements.', 
'Essential guide to banking regulations impacting commercial lending decisions', 1, true, 16, 'compliance', ARRAY['regulation', 'compliance', 'basel']),

('commercial-underwriting', 'Deal Structuring Mastery', 
'Learn advanced techniques for structuring commercial loan deals that balance risk and profitability while meeting client needs.', 
'Master the art of commercial loan deal structuring and negotiation', 1, true, 22, 'underwriting', ARRAY['deal-structuring', 'negotiation', 'underwriting']),

('portfolio-management', 'Portfolio Optimization Strategies', 
'Implement sophisticated portfolio management techniques to maximize risk-adjusted returns across your commercial loan portfolio.', 
'Advanced strategies for optimizing commercial loan portfolio performance', 1, true, 19, 'portfolio', ARRAY['portfolio', 'optimization', 'performance']),

('digital-transformation', 'Fintech Integration in Commercial Lending', 
'Explore how digital transformation and fintech partnerships are reshaping commercial lending operations and customer experience.', 
'Understanding digital transformation impacts on commercial lending', 1, true, 14, 'fintech', ARRAY['fintech', 'digital', 'transformation']),

('leadership-development', 'Leading High-Performance Lending Teams', 
'Develop essential leadership skills for managing commercial lending teams in today''s dynamic banking environment.', 
'Essential leadership skills for commercial banking managers and executives', 1, true, 17, 'leadership', ARRAY['leadership', 'management', 'teams']);

-- Insert comprehensive course assessments
INSERT INTO course_assessments (module_id, title, description, questions, passing_score, max_attempts, time_limit_minutes, order_index) VALUES

-- Foundations Assessment
('foundations', 'Financial Analysis Fundamentals Quiz', 'Test your understanding of financial statement analysis and risk assessment principles', 
'[
  {
    "id": 1,
    "question": "What is the primary purpose of analyzing a company''s current ratio?",
    "type": "multiple_choice",
    "options": [
      "To assess long-term debt capacity",
      "To evaluate short-term liquidity",
      "To measure profitability trends",
      "To determine asset utilization"
    ],
    "correct_answer": 1,
    "explanation": "The current ratio measures a company''s ability to pay short-term obligations using current assets."
  },
  {
    "id": 2,
    "question": "Which financial statement provides the best view of a company''s cash generation ability?",
    "type": "multiple_choice",
    "options": [
      "Balance Sheet",
      "Income Statement", 
      "Cash Flow Statement",
      "Statement of Retained Earnings"
    ],
    "correct_answer": 2,
    "explanation": "The cash flow statement shows actual cash receipts and payments, providing the clearest picture of cash generation."
  },
  {
    "id": 3,
    "question": "Calculate the debt-to-equity ratio for a company with $500K total debt and $1M shareholders equity.",
    "type": "calculation",
    "correct_answer": "0.5 or 50%",
    "explanation": "Debt-to-equity ratio = Total Debt / Shareholders Equity = $500K / $1M = 0.5"
  }
]'::jsonb, 70, 3, 30, 1),

-- Capital Markets Assessment
('capital-markets', 'Capital Markets Knowledge Check', 'Evaluate your understanding of capital market dynamics and funding sources',
'[
  {
    "id": 1,
    "question": "What typically happens to loan demand when interest rates rise?",
    "type": "multiple_choice",
    "options": [
      "Demand increases significantly",
      "Demand decreases",
      "Demand remains unchanged", 
      "Only refinancing increases"
    ],
    "correct_answer": 1,
    "explanation": "Higher interest rates typically reduce loan demand as borrowing becomes more expensive."
  },
  {
    "id": 2,
    "question": "Which funding source typically offers the lowest cost of capital for banks?",
    "type": "multiple_choice",
    "options": [
      "Wholesale funding",
      "Customer deposits",
      "Federal funds",
      "Subordinated debt"
    ],
    "correct_answer": 1,
    "explanation": "Customer deposits are typically the lowest cost funding source for banks."
  }
]'::jsonb, 75, 3, 25, 1),

-- Risk Management Assessment
('risk-management', 'Risk Assessment Proficiency Test', 'Demonstrate your mastery of advanced risk management concepts',
'[
  {
    "id": 1,
    "question": "What is the primary difference between expected loss and unexpected loss?",
    "type": "short_answer",
    "correct_answer": "Expected loss is the average loss anticipated over time, while unexpected loss represents potential losses beyond the expected amount due to adverse events.",
    "explanation": "Expected loss = PD × LGD × EAD, while unexpected loss represents the volatility around this expected value."
  }
]'::jsonb, 80, 3, 45, 1),

-- Add assessments for remaining modules
('regulatory-compliance', 'Regulatory Compliance Assessment', 'Test your knowledge of banking regulations and compliance requirements',
'[{"id": 1, "question": "What is the primary purpose of Basel III capital requirements?", "type": "multiple_choice", "options": ["Increase bank profitability", "Enhance financial system stability", "Reduce regulatory burden", "Simplify reporting"], "correct_answer": 1}]'::jsonb, 75, 3, 40, 1),

('commercial-underwriting', 'Underwriting Mastery Evaluation', 'Assess your commercial loan underwriting and deal structuring skills',
'[{"id": 1, "question": "What factors are most important when structuring a commercial real estate loan?", "type": "short_answer", "correct_answer": "Property cash flow, borrower creditworthiness, loan-to-value ratio, debt service coverage ratio, and market conditions"}]'::jsonb, 80, 3, 60, 1),

('portfolio-management', 'Portfolio Management Assessment', 'Evaluate your portfolio optimization and performance measurement knowledge',
'[{"id": 1, "question": "How do you calculate risk-adjusted return on assets (RAROA)?", "type": "calculation", "correct_answer": "(Net Income - Risk Premium) / Average Assets"}]'::jsonb, 75, 3, 50, 1),

('digital-transformation', 'Digital Banking Assessment', 'Test your understanding of fintech integration and digital transformation',
'[{"id": 1, "question": "What are the key benefits of API integration in commercial lending?", "type": "short_answer", "correct_answer": "Faster processing, improved data accuracy, enhanced customer experience, better risk assessment, and operational efficiency"}]'::jsonb, 70, 3, 35, 1),

('leadership-development', 'Leadership Skills Evaluation', 'Assess your commercial banking leadership and management capabilities',
'[{"id": 1, "question": "What leadership qualities are most important for managing a commercial lending team?", "type": "short_answer", "correct_answer": "Strategic thinking, risk management expertise, team development, regulatory knowledge, and customer relationship skills"}]'::jsonb, 75, 3, 45, 1);

-- Insert course documents and resources
INSERT INTO course_documents (module_id, title, description, file_url, file_type, category, is_downloadable, tags) VALUES

-- Foundations Documents
('foundations', 'Financial Analysis Template', 'Excel template for comprehensive financial statement analysis', '/documents/financial-analysis-template.xlsx', 'application/xlsx', 'template', true, ARRAY['template', 'analysis', 'excel']),
('foundations', 'Risk Assessment Checklist', 'Comprehensive checklist for commercial loan risk evaluation', '/documents/risk-assessment-checklist.pdf', 'application/pdf', 'checklist', true, ARRAY['checklist', 'risk', 'evaluation']),
('foundations', 'Industry Benchmarks Guide', 'Key financial ratios and benchmarks by industry sector', '/documents/industry-benchmarks.pdf', 'application/pdf', 'reference', true, ARRAY['benchmarks', 'ratios', 'industry']),

-- Capital Markets Documents  
('capital-markets', 'Market Analysis Framework', 'Framework for analyzing capital market conditions and trends', '/documents/market-analysis-framework.pdf', 'application/pdf', 'framework', true, ARRAY['framework', 'market-analysis', 'trends']),
('capital-markets', 'Funding Source Comparison', 'Detailed comparison of various institutional funding sources', '/documents/funding-sources.xlsx', 'application/xlsx', 'reference', true, ARRAY['funding', 'comparison', 'institutions']),

-- Risk Management Documents
('risk-management', 'Credit Risk Models Handbook', 'Comprehensive guide to building and validating credit risk models', '/documents/credit-risk-models.pdf', 'application/pdf', 'handbook', true, ARRAY['models', 'credit-risk', 'validation']),
('risk-management', 'Portfolio Risk Calculator', 'Excel tool for calculating portfolio-level risk metrics', '/documents/portfolio-risk-calculator.xlsx', 'application/xlsx', 'tool', true, ARRAY['calculator', 'portfolio', 'metrics']),

-- Additional documents for other modules
('regulatory-compliance', 'Regulatory Compliance Manual', 'Complete guide to banking regulations affecting commercial lending', '/documents/compliance-manual.pdf', 'application/pdf', 'manual', true, ARRAY['compliance', 'regulations', 'manual']),
('commercial-underwriting', 'Deal Structure Examples', 'Real-world examples of commercial loan deal structures', '/documents/deal-structures.pdf', 'application/pdf', 'examples', true, ARRAY['examples', 'structures', 'deals']),
('portfolio-management', 'Performance Metrics Dashboard', 'Excel dashboard for tracking portfolio performance metrics', '/documents/performance-dashboard.xlsx', 'application/xlsx', 'dashboard', true, ARRAY['dashboard', 'metrics', 'performance']),
('digital-transformation', 'Fintech Integration Guide', 'Best practices for integrating fintech solutions in commercial lending', '/documents/fintech-integration.pdf', 'application/pdf', 'guide', true, ARRAY['guide', 'fintech', 'integration']),
('leadership-development', 'Leadership Assessment Tool', 'Self-assessment tool for evaluating leadership capabilities', '/documents/leadership-assessment.pdf', 'application/pdf', 'assessment', true, ARRAY['assessment', 'leadership', 'evaluation']);

-- Add more videos to complete the content
INSERT INTO course_videos (module_id, title, description, video_type, video_url, youtube_id, thumbnail_url, order_index, tags) VALUES

-- Additional Foundations Videos
('foundations', 'Cash Flow Analysis Deep Dive', 'Advanced techniques for analyzing and projecting cash flows', 'youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 4, ARRAY['cash-flow', 'analysis', 'projections']),

-- Capital Markets Videos
('capital-markets', 'Understanding Interest Rate Risk', 'How interest rate changes impact commercial lending portfolios', 'youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 1, ARRAY['interest-rates', 'risk', 'portfolio']),
('capital-markets', 'Secondary Market Dynamics', 'Exploring loan sales and secondary market opportunities', 'youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 2, ARRAY['secondary-market', 'loan-sales', 'liquidity']),

-- Risk Management Videos
('risk-management', 'Building Credit Scorecards', 'Step-by-step guide to developing credit scoring models', 'youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 1, ARRAY['scorecards', 'modeling', 'credit']),
('risk-management', 'Stress Testing Methodologies', 'Advanced stress testing techniques for commercial portfolios', 'youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 2, ARRAY['stress-testing', 'portfolio', 'methodology']),

-- Videos for remaining modules
('regulatory-compliance', 'Basel III Implementation', 'Understanding Basel III requirements for commercial banks', 'youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 1, ARRAY['basel', 'compliance', 'capital']),
('commercial-underwriting', 'Advanced Deal Structuring', 'Complex commercial loan structuring techniques', 'youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 1, ARRAY['structuring', 'deals', 'advanced']),
('portfolio-management', 'Portfolio Analytics', 'Using data analytics for portfolio optimization', 'youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 1, ARRAY['analytics', 'optimization', 'data']),
('digital-transformation', 'AI in Commercial Lending', 'Leveraging artificial intelligence for lending decisions', 'youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 1, ARRAY['ai', 'automation', 'decisions']),
('leadership-development', 'Leading Through Change', 'Managing teams during regulatory and market changes', 'youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 1, ARRAY['leadership', 'change', 'management']);