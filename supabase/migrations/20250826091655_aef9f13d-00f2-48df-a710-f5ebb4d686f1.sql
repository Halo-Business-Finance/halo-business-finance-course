-- Enable public preview for all active course modules
UPDATE public.course_modules 
SET public_preview = true 
WHERE is_active = true;

-- Drop existing function first
DROP FUNCTION IF EXISTS public.get_public_course_previews();

-- Create enhanced public course previews function with richer marketing data
CREATE OR REPLACE FUNCTION public.get_public_course_previews()
RETURNS TABLE(
  module_id text, 
  title text, 
  skill_level text, 
  description text, 
  duration text, 
  lessons_count integer,
  prerequisites text[],
  is_active boolean,
  order_index integer
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT 
    cm.module_id,
    cm.title,
    cm.skill_level::text,
    COALESCE(cm.description, 'Course description coming soon') as description,
    COALESCE(cm.duration, 'Duration TBD') as duration,
    COALESCE(cm.lessons_count, 0) as lessons_count,
    COALESCE(cm.prerequisites, ARRAY[]::text[]) as prerequisites,
    cm.is_active,
    cm.order_index
  FROM course_modules cm
  WHERE cm.is_active = true 
    AND cm.public_preview = true
  ORDER BY cm.order_index;
$function$;

-- Update RLS policies to allow public preview access
DROP POLICY IF EXISTS "Public can view preview courses, enrolled users see all active" ON public.course_modules;

CREATE POLICY "Public can view course previews, enrolled users see full content" 
ON public.course_modules 
FOR SELECT 
USING (
  (is_active = true AND public_preview = true) 
  OR 
  (is_active = true AND (
    is_admin(auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM course_enrollments 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  ))
);