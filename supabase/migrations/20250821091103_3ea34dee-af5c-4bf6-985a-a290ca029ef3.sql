-- Insert sample learning tools
INSERT INTO public.learning_tools (title, description, tool_url, tool_type, category, tags, order_index) VALUES
('Financial Calculator', 'Advanced calculator for loan payments, NPV, and IRR calculations', 'https://www.calculator.net/finance-calculator.html', 'calculator', 'finance', ARRAY['calculator', 'finance', 'loans'], 1),
('Credit Score Simulator', 'Tool to simulate credit score impacts of various scenarios', NULL, 'simulator', 'credit', ARRAY['credit', 'simulation', 'score'], 2),
('Loan Comparison Tool', 'Compare different loan options side by side', NULL, 'web_tool', 'comparison', ARRAY['loans', 'comparison', 'analysis'], 3),
('ROI Calculator', 'Calculate return on investment for business projects', 'https://www.calculator.net/roi-calculator.html', 'calculator', 'investment', ARRAY['roi', 'investment', 'returns'], 4);

-- Insert sample webinars
INSERT INTO public.learning_webinars (title, description, presenter, scheduled_date, scheduled_time, status, registration_url, tags) VALUES
('Current Trends in Business Lending', 'Explore the latest trends and innovations in business lending for 2024', 'Sarah Johnson, Senior Finance Expert', '2024-03-15', '14:00:00', 'scheduled', 'https://example.com/register/trends', ARRAY['trends', 'lending', 'business']),
('Navigating SBA Loan Changes', 'Understanding recent changes to SBA loan programs and requirements', 'Michael Chen, SBA Specialist', '2024-02-28', '13:00:00', 'completed', NULL, ARRAY['sba', 'loans', 'regulations']),
('Alternative Financing Solutions', 'Discovering non-traditional financing options for businesses', 'Lisa Rodriguez, Finance Consultant', '2024-02-14', '15:00:00', 'completed', NULL, ARRAY['alternative', 'financing', 'options']);

-- Insert sample documents
INSERT INTO public.course_documents (title, description, file_type, file_url, file_size, category, tags) VALUES
('Business Finance Handbook', 'Comprehensive guide covering all aspects of business finance', 'PDF', 'https://example.com/docs/finance-handbook.pdf', 2516582, 'guide', ARRAY['finance', 'handbook', 'guide']),
('SBA Loan Application Checklist', 'Step-by-step checklist for SBA loan applications', 'PDF', 'https://example.com/docs/sba-checklist.pdf', 870400, 'checklist', ARRAY['sba', 'checklist', 'application']),
('Financial Analysis Templates', 'Excel templates for financial modeling and analysis', 'XLSX', 'https://example.com/docs/financial-templates.xlsx', 1228800, 'template', ARRAY['templates', 'analysis', 'excel']),
('Regulatory Compliance Guide', 'Latest regulations and compliance requirements', 'PDF', 'https://example.com/docs/compliance-guide.pdf', 3251200, 'guide', ARRAY['compliance', 'regulations', 'legal']);