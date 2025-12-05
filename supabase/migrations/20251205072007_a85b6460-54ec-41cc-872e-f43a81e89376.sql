-- Fix 1: User notifications INSERT policy - restrict to service role only
DROP POLICY IF EXISTS "System can create notifications" ON user_notifications;
CREATE POLICY "System can create notifications" ON user_notifications
FOR INSERT WITH CHECK (current_setting('request.jwt.role', true) = 'service_role');

-- Fix 2: Add length constraints to discussion_posts
ALTER TABLE discussion_posts 
  ADD CONSTRAINT discussion_posts_title_length CHECK (char_length(title) <= 200),
  ADD CONSTRAINT discussion_posts_content_length CHECK (char_length(content) <= 10000);

-- Fix 3: Add length constraints to course_reviews
ALTER TABLE course_reviews
  ADD CONSTRAINT course_reviews_title_length CHECK (char_length(title) <= 200),
  ADD CONSTRAINT course_reviews_content_length CHECK (char_length(content) <= 5000);