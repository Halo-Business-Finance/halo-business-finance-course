-- Update RLS policy to allow viewing active videos without enrollment requirement
-- This allows users to browse and view course content before enrolling

DROP POLICY IF EXISTS "Enrolled users can view course videos" ON course_videos;

CREATE POLICY "Users can view active videos"
ON course_videos
FOR SELECT
USING (
  is_active = true
  OR is_admin(auth.uid())
);