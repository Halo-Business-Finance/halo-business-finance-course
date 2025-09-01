-- Add missing SBA Express courses
INSERT INTO courses (id, title, description, level, image_url, is_active, order_index) VALUES
('sba-express-beginner', 'SBA Express - Beginner', 'Learn the fundamentals of SBA Express loan programs, including eligibility requirements, application processes, and basic underwriting principles for faster SBA financing solutions.', 'beginner', '/src/assets/course-sba-professional.jpg', true, 200),
('sba-express-intermediate', 'SBA Express - Intermediate', 'Advanced SBA Express loan structuring, risk assessment, and portfolio management techniques for experienced lending professionals.', 'intermediate', '/src/assets/course-sba-professional.jpg', true, 201),
('sba-express-expert', 'SBA Express - Expert', 'Master complex SBA Express loan scenarios, regulatory compliance, and strategic program implementation for senior lending executives.', 'expert', '/src/assets/course-sba-professional.jpg', true, 202);

-- Add missing Healthcare Financing courses  
INSERT INTO courses (id, title, description, level, image_url, is_active, order_index) VALUES
('healthcare-financing-beginner', 'Healthcare Financing - Beginner', 'Introduction to healthcare industry financing, including medical equipment loans, practice acquisition, and healthcare-specific lending requirements.', 'beginner', '/src/assets/finance-expert-1.jpg', true, 300),
('healthcare-financing-intermediate', 'Healthcare Financing - Intermediate', 'Advanced healthcare financing strategies, regulatory compliance, and specialized loan products for medical professionals and healthcare facilities.', 'intermediate', '/src/assets/finance-expert-1.jpg', true, 301),
('healthcare-financing-expert', 'Healthcare Financing - Expert', 'Expert-level healthcare financing, complex deal structuring, and strategic portfolio management for healthcare lending specialists.', 'expert', '/src/assets/finance-expert-1.jpg', true, 302);