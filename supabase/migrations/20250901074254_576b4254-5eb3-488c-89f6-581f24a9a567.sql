-- Add Bridge Loan Processing course (using 'beginner' as level since it's a single course)
INSERT INTO courses (id, title, description, level, image_url, is_active, order_index) VALUES
('bridge-loan-processing', 'Bridge Loan Processing', 'Complete training on bridge lending including short-term financing, transitional lending, construction-to-perm loans, and specialized bridge loan structures for commercial and residential properties.', 'beginner', '/src/assets/business-meeting.jpg', true, 406);

-- Add 7 course modules for Bridge Loan Processing
INSERT INTO course_content_modules (id, course_id, title, description, duration, order_index, lessons_count, is_active) VALUES
('bridge-module-1', 'bridge-loan-processing', 'Bridge Lending Fundamentals', 'Introduction to bridge loans, short-term financing concepts, market dynamics, and the role of bridge lending in real estate transactions.', '45 minutes', 1, 5, true),
('bridge-module-2', 'bridge-loan-processing', 'Underwriting and Risk Assessment', 'Bridge loan underwriting criteria, exit strategy analysis, property valuation, and risk mitigation strategies for short-term lending.', '60 minutes', 2, 8, true),
('bridge-module-3', 'bridge-loan-processing', 'Construction-to-Permanent Financing', 'Construction loan processes, draw schedules, project monitoring, and conversion to permanent financing structures.', '55 minutes', 3, 7, true),
('bridge-module-4', 'bridge-loan-processing', 'Commercial Bridge Lending', 'Commercial property bridge loans, income property transitions, refinancing strategies, and institutional bridge lending programs.', '50 minutes', 4, 6, true),
('bridge-module-5', 'bridge-loan-processing', 'Residential Bridge Solutions', 'Residential bridge loans, fix-and-flip financing, home purchase bridges, and residential investor lending programs.', '50 minutes', 5, 6, true),
('bridge-module-6', 'bridge-loan-processing', 'Documentation and Legal Framework', 'Bridge loan documentation, security instruments, personal guarantees, and legal requirements for transitional lending.', '55 minutes', 6, 7, true),
('bridge-module-7', 'bridge-loan-processing', 'Portfolio Management and Exit Strategies', 'Bridge loan servicing, monitoring construction progress, exit strategy execution, and portfolio risk management for bridge lenders.', '50 minutes', 7, 6, true);