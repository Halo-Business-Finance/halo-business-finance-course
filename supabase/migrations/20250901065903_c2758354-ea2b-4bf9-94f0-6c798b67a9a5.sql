-- Update courses with appropriate image URLs based on course type
UPDATE courses SET image_url = '/src/assets/course-sba-professional.jpg' 
WHERE id LIKE 'sba-%';

UPDATE courses SET image_url = '/src/assets/commercial-lending-hero.jpg' 
WHERE id LIKE 'commercial-%';

UPDATE courses SET image_url = '/src/assets/course-finance-professional.jpg' 
WHERE id LIKE 'equipment-%';

UPDATE courses SET image_url = '/src/assets/course-credit-professional.jpg' 
WHERE id LIKE '%credit%' OR id LIKE 'working-capital%';

UPDATE courses SET image_url = '/src/assets/business-analytics.jpg' 
WHERE id LIKE 'invoice-%' OR id LIKE 'merchant-%' OR id LIKE 'asset-based%';

UPDATE courses SET image_url = '/src/assets/construction-hero.jpg' 
WHERE id LIKE 'construction-%';

UPDATE courses SET image_url = '/src/assets/business-meeting.jpg' 
WHERE id LIKE 'franchise-%';

UPDATE courses SET image_url = '/src/assets/healthcare-financing.jpg' 
WHERE id LIKE 'healthcare-%';

UPDATE courses SET image_url = '/src/assets/restaurant-financing.jpg' 
WHERE id LIKE 'restaurant-%';

UPDATE courses SET image_url = '/src/assets/course-finance-professional.jpg' 
WHERE id LIKE 'bridge-%' OR id LIKE 'term-%';