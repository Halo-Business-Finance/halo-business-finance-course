-- Update course images to make each course unique
UPDATE courses SET image_url = '/src/assets/enterprise-features.jpg' WHERE id = 'equipment-loan-processing';
UPDATE courses SET image_url = '/src/assets/commercial-lending-hero.jpg' WHERE id = 'bridge-loan-processing';
UPDATE courses SET image_url = '/src/assets/business-team.jpg' WHERE id = 'agriculture-loan-processing';
UPDATE courses SET image_url = '/src/assets/hero-finance.jpg' WHERE id = 'apartment-multifamily-processing';
UPDATE courses SET image_url = '/src/assets/course-sba-professional.jpg' WHERE id = 'sba-loan-underwriting';
UPDATE courses SET image_url = '/src/assets/business-cta.jpg' WHERE id = 'construction-loan-underwriting';
UPDATE courses SET image_url = '/src/assets/dedicated-support.jpg' WHERE id = 'usda-loan-underwriting';
UPDATE courses SET image_url = '/src/assets/course-finance-professional.jpg' WHERE id = 'equipment-finance-loan-underwriting';
UPDATE courses SET image_url = '/src/assets/course-credit-professional.jpg' WHERE id = 'bridge-loan-underwriting';
UPDATE courses SET image_url = '/src/assets/commercial-banker-3.jpg' WHERE id = 'commercial-loan-underwriting';

-- Update any other courses that might be using business-meeting.jpg
UPDATE courses SET image_url = '/src/assets/business-analytics.jpg' WHERE id = 'halo-launch-pad-learn' AND image_url = '/src/assets/business-meeting.jpg';
UPDATE courses SET image_url = '/src/assets/finance-course-bg.jpg' WHERE image_url = '/src/assets/business-meeting.jpg' AND id NOT IN (
  'equipment-loan-processing', 'bridge-loan-processing', 'agriculture-loan-processing', 
  'apartment-multifamily-processing', 'sba-loan-underwriting', 'construction-loan-underwriting',
  'usda-loan-underwriting', 'equipment-finance-loan-underwriting', 'bridge-loan-underwriting',
  'commercial-loan-underwriting'
);