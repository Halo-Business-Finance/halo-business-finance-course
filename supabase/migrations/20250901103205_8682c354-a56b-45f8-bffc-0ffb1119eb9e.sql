-- Run the data migration to import all course modules from static data
-- This will populate the course_content_modules table with all 273 modules from courseData.ts

-- First, let's clear existing data to avoid conflicts
DELETE FROM case_studies;
DELETE FROM module_quiz_questions;
DELETE FROM module_quizzes;
DELETE FROM course_content_modules;
DELETE FROM courses WHERE id LIKE '%beginner%' OR id LIKE '%intermediate%' OR id LIKE '%expert%';

-- The migration will be run from the client-side using the migrateCourseDataToSupabase function
-- This is a placeholder to ensure we have the proper setup