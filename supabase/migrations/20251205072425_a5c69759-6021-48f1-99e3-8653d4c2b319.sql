-- Fix: Restrict course_videos access to enrolled users only
-- Drop the function created in failed migration if it exists
DROP FUNCTION IF EXISTS public.is_enrolled_in_video_course(uuid);

-- Create a function to check if user is enrolled in the course that owns the video
CREATE OR REPLACE FUNCTION public.is_enrolled_in_video_course(video_module_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM course_enrollments ce
    JOIN course_content_modules ccm ON ccm.course_id = ce.course_id
    WHERE ccm.id = video_module_id
      AND ce.user_id = auth.uid()
      AND ce.status IN ('active', 'completed')
  )
$$;

-- Re-create the policy (it was dropped in the failed migration)
DROP POLICY IF EXISTS "Enrolled users can view course videos" ON course_videos;

-- New policy: Users can only view videos from courses they are enrolled in
CREATE POLICY "Enrolled users can view course videos" ON course_videos
FOR SELECT
USING (
  is_active = true 
  AND (
    is_admin(auth.uid()) 
    OR is_enrolled_in_video_course(module_id)
  )
);