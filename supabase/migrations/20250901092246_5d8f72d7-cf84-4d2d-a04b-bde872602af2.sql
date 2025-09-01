-- Fix security linter warning by updating the function search path
CREATE OR REPLACE FUNCTION auto_assign_module_to_course()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Auto-assign course_id based on module_id pattern if not already set
  IF NEW.course_id IS NULL THEN
    NEW.course_id := CASE 
      WHEN NEW.module_id LIKE 'sba-7a-beginner%' THEN 'sba-7a-beginner'
      WHEN NEW.module_id LIKE 'sba-7a-expert%' OR NEW.module_id LIKE 'sba-7a-intermediate%' THEN 'sba-7a-expert'
      WHEN NEW.module_id LIKE 'sba-express-beginner%' THEN 'sba-express-beginner'
      WHEN NEW.module_id LIKE 'sba-express-expert%' OR NEW.module_id LIKE 'sba-express-intermediate%' THEN 'sba-express-expert'
      WHEN NEW.module_id LIKE 'commercial-real-estate-beginner%' THEN 'commercial-real-estate-beginner'
      WHEN NEW.module_id LIKE 'commercial-real-estate-expert%' OR NEW.module_id LIKE 'commercial-real-estate-intermediate%' THEN 'commercial-real-estate-expert'
      WHEN NEW.module_id LIKE 'equipment-financing-beginner%' THEN 'equipment-financing-beginner'
      WHEN NEW.module_id LIKE 'equipment-financing-expert%' OR NEW.module_id LIKE 'equipment-financing-intermediate%' THEN 'equipment-financing-expert'
      WHEN NEW.module_id LIKE 'business-lines-of-credit-beginner%' THEN 'business-lines-of-credit-beginner'
      WHEN NEW.module_id LIKE 'business-lines-of-credit-expert%' OR NEW.module_id LIKE 'business-lines-of-credit-intermediate%' THEN 'business-lines-of-credit-expert'
      WHEN NEW.module_id LIKE 'invoice-factoring-beginner%' THEN 'invoice-factoring-beginner'
      WHEN NEW.module_id LIKE 'invoice-factoring-expert%' OR NEW.module_id LIKE 'invoice-factoring-intermediate%' THEN 'invoice-factoring-expert'
      WHEN NEW.module_id LIKE 'merchant-cash-advances-beginner%' THEN 'merchant-cash-advances-beginner'
      WHEN NEW.module_id LIKE 'merchant-cash-advances-expert%' OR NEW.module_id LIKE 'merchant-cash-advances-intermediate%' THEN 'merchant-cash-advances-expert'
      WHEN NEW.module_id LIKE 'asset-based-lending-beginner%' THEN 'asset-based-lending-beginner'
      WHEN NEW.module_id LIKE 'asset-based-lending-expert%' OR NEW.module_id LIKE 'asset-based-lending-intermediate%' THEN 'asset-based-lending-expert'
      WHEN NEW.module_id LIKE 'construction-loans-beginner%' THEN 'construction-loans-beginner'
      WHEN NEW.module_id LIKE 'construction-loans-expert%' OR NEW.module_id LIKE 'construction-loans-intermediate%' THEN 'construction-loans-expert'
      WHEN NEW.module_id LIKE 'franchise-financing-beginner%' THEN 'franchise-financing-beginner'
      WHEN NEW.module_id LIKE 'franchise-financing-expert%' OR NEW.module_id LIKE 'franchise-financing-intermediate%' THEN 'franchise-financing-expert'
      WHEN NEW.module_id LIKE 'working-capital-beginner%' THEN 'working-capital-beginner'
      WHEN NEW.module_id LIKE 'working-capital-expert%' OR NEW.module_id LIKE 'working-capital-intermediate%' THEN 'working-capital-expert'
      WHEN NEW.module_id LIKE 'healthcare-financing-beginner%' THEN 'healthcare-financing-beginner'
      WHEN NEW.module_id LIKE 'healthcare-financing-expert%' OR NEW.module_id LIKE 'healthcare-financing-intermediate%' THEN 'healthcare-financing-expert'
      WHEN NEW.module_id LIKE 'restaurant-financing-beginner%' THEN 'restaurant-financing-beginner'
      WHEN NEW.module_id LIKE 'restaurant-financing-expert%' OR NEW.module_id LIKE 'restaurant-financing-intermediate%' THEN 'restaurant-financing-expert'
      WHEN NEW.module_id LIKE 'bridge-loans-beginner%' THEN 'bridge-loans-beginner'
      WHEN NEW.module_id LIKE 'bridge-loans-expert%' OR NEW.module_id LIKE 'bridge-loans-intermediate%' THEN 'bridge-loans-expert'
      WHEN NEW.module_id LIKE 'term-loans-beginner%' THEN 'term-loans-beginner'
      WHEN NEW.module_id LIKE 'term-loans-expert%' OR NEW.module_id LIKE 'term-loans-intermediate%' THEN 'term-loans-expert'
      WHEN NEW.module_id LIKE 'business-acquisition-beginner%' THEN 'business-acquisition-beginner'
      WHEN NEW.module_id LIKE 'business-acquisition-expert%' OR NEW.module_id LIKE 'business-acquisition-intermediate%' THEN 'business-acquisition-expert'
      ELSE NEW.course_id
    END;
  END IF;

  -- Auto-correct skill level for intermediate modules
  IF NEW.module_id LIKE '%intermediate%' THEN
    NEW.skill_level := 'expert'::skill_level;
  END IF;

  RETURN NEW;
END;
$$;