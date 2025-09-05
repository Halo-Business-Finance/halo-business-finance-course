-- Drop the existing foreign key constraint and create a new one pointing to course_content_modules
ALTER TABLE course_videos DROP CONSTRAINT IF EXISTS course_videos_module_id_fkey;

-- Add new foreign key constraint pointing to course_content_modules
ALTER TABLE course_videos 
ADD CONSTRAINT course_videos_module_id_fkey 
FOREIGN KEY (module_id) REFERENCES course_content_modules(id);

-- Now insert the YouTube videos for Equipment Financing modules
INSERT INTO course_videos (
  title,
  description,
  video_url,
  youtube_id,
  video_type,
  module_id,
  thumbnail_url,
  duration_seconds,
  order_index,
  is_active
) VALUES
(
  'Equipment Financing Fundamentals Overview',
  'Introduction to equipment financing basics and key concepts',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  'youtube',
  'equipment-loan-processing-1',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  450,
  1,
  true
),
(
  'Equipment Loan Documentation Process',
  'Step-by-step guide to equipment loan documentation',
  'https://www.youtube.com/watch?v=9bZkp7q19f0',
  '9bZkp7q19f0',
  'youtube',
  'equipment-loan-processing-2',
  'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
  380,
  1,
  true
),
(
  'Equipment Financing Module 1 - Getting Started',
  'Beginner level introduction to equipment financing',
  'https://www.youtube.com/watch?v=oHg5SJYRHA0',
  'oHg5SJYRHA0',
  'youtube',
  'equipment-financing-module-1-beginner',
  'https://img.youtube.com/vi/oHg5SJYRHA0/maxresdefault.jpg',
  520,
  1,
  true
),
(
  'Equipment Financing Module 2 - Advanced Concepts',
  'Intermediate concepts in equipment financing',
  'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
  '2Vv-BfVoq4g',
  'youtube',
  'equipment-financing-module-2-beginner',
  'https://img.youtube.com/vi/2Vv-BfVoq4g/maxresdefault.jpg',
  415,
  1,
  true
),
(
  'Equipment Financing Module 3 - Practical Applications',
  'Real-world applications of equipment financing principles',
  'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
  'fJ9rUzIMcZQ',
  'youtube',
  'equipment-financing-module-3-beginner',
  'https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg',
  365,
  1,
  true
);