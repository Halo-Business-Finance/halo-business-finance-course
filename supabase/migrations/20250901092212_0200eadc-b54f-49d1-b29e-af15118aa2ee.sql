-- Fix course module connections based on module_id patterns
-- This migration will connect orphaned modules to their appropriate courses

-- First, let's update modules with clear course ID patterns
UPDATE course_modules 
SET course_id = CASE 
  -- SBA 7(a) loans
  WHEN module_id LIKE 'sba-7a-beginner%' THEN 'sba-7a-beginner'
  WHEN module_id LIKE 'sba-7a-expert%' THEN 'sba-7a-expert' 
  WHEN module_id LIKE 'sba-7a-intermediate%' THEN 'sba-7a-expert'
  
  -- SBA Express loans  
  WHEN module_id LIKE 'sba-express-beginner%' THEN 'sba-express-beginner'
  WHEN module_id LIKE 'sba-express-expert%' THEN 'sba-express-expert'
  WHEN module_id LIKE 'sba-express-intermediate%' THEN 'sba-express-expert'
  
  -- Commercial Real Estate
  WHEN module_id LIKE 'commercial-real-estate-beginner%' THEN 'commercial-real-estate-beginner'
  WHEN module_id LIKE 'commercial-real-estate-expert%' THEN 'commercial-real-estate-expert'
  WHEN module_id LIKE 'commercial-real-estate-intermediate%' THEN 'commercial-real-estate-expert'
  
  -- Equipment Financing
  WHEN module_id LIKE 'equipment-financing-beginner%' THEN 'equipment-financing-beginner'
  WHEN module_id LIKE 'equipment-financing-expert%' THEN 'equipment-financing-expert' 
  WHEN module_id LIKE 'equipment-financing-intermediate%' THEN 'equipment-financing-expert'
  
  -- Business Lines of Credit
  WHEN module_id LIKE 'business-lines-of-credit-beginner%' THEN 'business-lines-of-credit-beginner'
  WHEN module_id LIKE 'business-lines-of-credit-expert%' THEN 'business-lines-of-credit-expert'
  WHEN module_id LIKE 'business-lines-of-credit-intermediate%' THEN 'business-lines-of-credit-expert'
  
  -- Invoice Factoring 
  WHEN module_id LIKE 'invoice-factoring-beginner%' THEN 'invoice-factoring-beginner'
  WHEN module_id LIKE 'invoice-factoring-expert%' THEN 'invoice-factoring-expert'
  WHEN module_id LIKE 'invoice-factoring-intermediate%' THEN 'invoice-factoring-expert'
  
  -- Merchant Cash Advances
  WHEN module_id LIKE 'merchant-cash-advances-beginner%' THEN 'merchant-cash-advances-beginner'
  WHEN module_id LIKE 'merchant-cash-advances-expert%' THEN 'merchant-cash-advances-expert'
  WHEN module_id LIKE 'merchant-cash-advances-intermediate%' THEN 'merchant-cash-advances-expert'
  
  -- Asset Based Lending
  WHEN module_id LIKE 'asset-based-lending-beginner%' THEN 'asset-based-lending-beginner' 
  WHEN module_id LIKE 'asset-based-lending-expert%' THEN 'asset-based-lending-expert'
  WHEN module_id LIKE 'asset-based-lending-intermediate%' THEN 'asset-based-lending-expert'
  
  -- Construction Loans
  WHEN module_id LIKE 'construction-loans-beginner%' THEN 'construction-loans-beginner'
  WHEN module_id LIKE 'construction-loans-expert%' THEN 'construction-loans-expert'
  WHEN module_id LIKE 'construction-loans-intermediate%' THEN 'construction-loans-expert'
  
  -- Franchise Financing
  WHEN module_id LIKE 'franchise-financing-beginner%' THEN 'franchise-financing-beginner'
  WHEN module_id LIKE 'franchise-financing-expert%' THEN 'franchise-financing-expert'
  WHEN module_id LIKE 'franchise-financing-intermediate%' THEN 'franchise-financing-expert'
  
  -- Working Capital
  WHEN module_id LIKE 'working-capital-beginner%' THEN 'working-capital-beginner'
  WHEN module_id LIKE 'working-capital-expert%' THEN 'working-capital-expert'
  WHEN module_id LIKE 'working-capital-intermediate%' THEN 'working-capital-expert'
  
  -- Healthcare Financing
  WHEN module_id LIKE 'healthcare-financing-beginner%' THEN 'healthcare-financing-beginner'
  WHEN module_id LIKE 'healthcare-financing-expert%' THEN 'healthcare-financing-expert'
  WHEN module_id LIKE 'healthcare-financing-intermediate%' THEN 'healthcare-financing-expert'
  
  -- Restaurant Financing
  WHEN module_id LIKE 'restaurant-financing-beginner%' THEN 'restaurant-financing-beginner'
  WHEN module_id LIKE 'restaurant-financing-expert%' THEN 'restaurant-financing-expert'
  WHEN module_id LIKE 'restaurant-financing-intermediate%' THEN 'restaurant-financing-expert'
  
  -- Bridge Loans
  WHEN module_id LIKE 'bridge-loans-beginner%' THEN 'bridge-loans-beginner'
  WHEN module_id LIKE 'bridge-loans-expert%' THEN 'bridge-loans-expert' 
  WHEN module_id LIKE 'bridge-loans-intermediate%' THEN 'bridge-loans-expert'
  
  -- Term Loans
  WHEN module_id LIKE 'term-loans-beginner%' THEN 'term-loans-beginner'
  WHEN module_id LIKE 'term-loans-expert%' THEN 'term-loans-expert'
  WHEN module_id LIKE 'term-loans-intermediate%' THEN 'term-loans-expert'
  
  -- Business Acquisition (already connected, but ensuring consistency)
  WHEN module_id LIKE 'business-acquisition-beginner%' THEN 'business-acquisition-beginner'
  WHEN module_id LIKE 'business-acquisition-expert%' THEN 'business-acquisition-expert'
  WHEN module_id LIKE 'business-acquisition-intermediate%' THEN 'business-acquisition-expert'
  
  ELSE course_id -- Keep existing course_id if no pattern matches
END
WHERE course_id IS NULL OR course_id != CASE 
  -- Same CASE logic here to ensure existing connections are also corrected
  WHEN module_id LIKE 'sba-7a-beginner%' THEN 'sba-7a-beginner'
  WHEN module_id LIKE 'sba-7a-expert%' THEN 'sba-7a-expert'
  WHEN module_id LIKE 'sba-7a-intermediate%' THEN 'sba-7a-expert'
  WHEN module_id LIKE 'sba-express-beginner%' THEN 'sba-express-beginner'
  WHEN module_id LIKE 'sba-express-expert%' THEN 'sba-express-expert'
  WHEN module_id LIKE 'sba-express-intermediate%' THEN 'sba-express-expert'
  WHEN module_id LIKE 'commercial-real-estate-beginner%' THEN 'commercial-real-estate-beginner'
  WHEN module_id LIKE 'commercial-real-estate-expert%' THEN 'commercial-real-estate-expert'
  WHEN module_id LIKE 'commercial-real-estate-intermediate%' THEN 'commercial-real-estate-expert'
  WHEN module_id LIKE 'equipment-financing-beginner%' THEN 'equipment-financing-beginner'
  WHEN module_id LIKE 'equipment-financing-expert%' THEN 'equipment-financing-expert'
  WHEN module_id LIKE 'equipment-financing-intermediate%' THEN 'equipment-financing-expert'
  WHEN module_id LIKE 'business-lines-of-credit-beginner%' THEN 'business-lines-of-credit-beginner'
  WHEN module_id LIKE 'business-lines-of-credit-expert%' THEN 'business-lines-of-credit-expert'
  WHEN module_id LIKE 'business-lines-of-credit-intermediate%' THEN 'business-lines-of-credit-expert'
  WHEN module_id LIKE 'invoice-factoring-beginner%' THEN 'invoice-factoring-beginner'
  WHEN module_id LIKE 'invoice-factoring-expert%' THEN 'invoice-factoring-expert'
  WHEN module_id LIKE 'invoice-factoring-intermediate%' THEN 'invoice-factoring-expert'
  WHEN module_id LIKE 'merchant-cash-advances-beginner%' THEN 'merchant-cash-advances-beginner'
  WHEN module_id LIKE 'merchant-cash-advances-expert%' THEN 'merchant-cash-advances-expert'
  WHEN module_id LIKE 'merchant-cash-advances-intermediate%' THEN 'merchant-cash-advances-expert'
  WHEN module_id LIKE 'asset-based-lending-beginner%' THEN 'asset-based-lending-beginner'
  WHEN module_id LIKE 'asset-based-lending-expert%' THEN 'asset-based-lending-expert'
  WHEN module_id LIKE 'asset-based-lending-intermediate%' THEN 'asset-based-lending-expert'
  WHEN module_id LIKE 'construction-loans-beginner%' THEN 'construction-loans-beginner'
  WHEN module_id LIKE 'construction-loans-expert%' THEN 'construction-loans-expert'
  WHEN module_id LIKE 'construction-loans-intermediate%' THEN 'construction-loans-expert'
  WHEN module_id LIKE 'franchise-financing-beginner%' THEN 'franchise-financing-beginner'
  WHEN module_id LIKE 'franchise-financing-expert%' THEN 'franchise-financing-expert'
  WHEN module_id LIKE 'franchise-financing-intermediate%' THEN 'franchise-financing-expert'
  WHEN module_id LIKE 'working-capital-beginner%' THEN 'working-capital-beginner'
  WHEN module_id LIKE 'working-capital-expert%' THEN 'working-capital-expert'
  WHEN module_id LIKE 'working-capital-intermediate%' THEN 'working-capital-expert'
  WHEN module_id LIKE 'healthcare-financing-beginner%' THEN 'healthcare-financing-beginner'
  WHEN module_id LIKE 'healthcare-financing-expert%' THEN 'healthcare-financing-expert'
  WHEN module_id LIKE 'healthcare-financing-intermediate%' THEN 'healthcare-financing-expert'
  WHEN module_id LIKE 'restaurant-financing-beginner%' THEN 'restaurant-financing-beginner'
  WHEN module_id LIKE 'restaurant-financing-expert%' THEN 'restaurant-financing-expert'
  WHEN module_id LIKE 'restaurant-financing-intermediate%' THEN 'restaurant-financing-expert'
  WHEN module_id LIKE 'bridge-loans-beginner%' THEN 'bridge-loans-beginner'
  WHEN module_id LIKE 'bridge-loans-expert%' THEN 'bridge-loans-expert'
  WHEN module_id LIKE 'bridge-loans-intermediate%' THEN 'bridge-loans-expert'
  WHEN module_id LIKE 'term-loans-beginner%' THEN 'term-loans-beginner'
  WHEN module_id LIKE 'term-loans-expert%' THEN 'term-loans-expert'
  WHEN module_id LIKE 'term-loans-intermediate%' THEN 'term-loans-expert'
  WHEN module_id LIKE 'business-acquisition-beginner%' THEN 'business-acquisition-beginner'
  WHEN module_id LIKE 'business-acquisition-expert%' THEN 'business-acquisition-expert'
  WHEN module_id LIKE 'business-acquisition-intermediate%' THEN 'business-acquisition-expert'
  ELSE course_id
END;

-- Update skill levels to match the course assignments (intermediate -> expert)
UPDATE course_modules 
SET skill_level = 'expert'::skill_level
WHERE module_id LIKE '%intermediate%' AND skill_level != 'expert';

-- Create function to automatically assign modules to courses when inserted/updated
CREATE OR REPLACE FUNCTION auto_assign_module_to_course()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to automatically assign modules when inserted or updated
DROP TRIGGER IF EXISTS trigger_auto_assign_module_to_course ON course_modules;
CREATE TRIGGER trigger_auto_assign_module_to_course
  BEFORE INSERT OR UPDATE ON course_modules
  FOR EACH ROW EXECUTE FUNCTION auto_assign_module_to_course();