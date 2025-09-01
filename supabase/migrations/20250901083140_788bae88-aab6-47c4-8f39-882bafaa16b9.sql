-- Fix security warnings: Add SET search_path to functions that are missing it

-- Fix function search path for update_adaptive_module_instances_updated_at
CREATE OR REPLACE FUNCTION update_adaptive_module_instances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix function search path for auto_initialize_adaptive_modules
CREATE OR REPLACE FUNCTION auto_initialize_adaptive_modules()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM initialize_adaptive_modules_for_user(NEW.user_id, NEW.course_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix function search path for initialize_adaptive_modules_for_user (already has SECURITY DEFINER but missing SET search_path)
CREATE OR REPLACE FUNCTION initialize_adaptive_modules_for_user(p_user_id uuid, p_course_id text)
RETURNS void AS $$
BEGIN  
  INSERT INTO public.adaptive_module_instances (
    user_id, 
    course_id, 
    adaptive_module_id,
    personalized_content,
    adaptive_path
  )
  SELECT 
    p_user_id,
    p_course_id,
    am.id,
    jsonb_build_object(
      'initial_assessment_required', true,
      'personalization_level', 'standard',
      'preferred_learning_style', 'mixed'
    ),
    jsonb_build_array(
      jsonb_build_object(
        'step', 1,
        'type', 'assessment',
        'status', 'pending'
      )
    )
  FROM public.adaptive_modules am
  WHERE am.is_active = true
  ON CONFLICT (user_id, course_id, adaptive_module_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;