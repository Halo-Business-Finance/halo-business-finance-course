-- Remove public access from CMS tables and require authentication

-- Update cms_pages policies
DROP POLICY IF EXISTS "Only published pages are public" ON public.cms_pages;
CREATE POLICY "Authenticated users can view published pages" 
ON public.cms_pages 
FOR SELECT 
TO authenticated
USING ((status = 'published') OR is_admin(auth.uid()));

-- Update cms_menus policies  
DROP POLICY IF EXISTS "Public can view active menus" ON public.cms_menus;
CREATE POLICY "Authenticated users can view active menus" 
ON public.cms_menus 
FOR SELECT 
TO authenticated
USING ((is_active = true) OR is_admin(auth.uid()));

-- Update cms_menu_items policies
DROP POLICY IF EXISTS "Public can view active menu items" ON public.cms_menu_items;
CREATE POLICY "Authenticated users can view active menu items" 
ON public.cms_menu_items 
FOR SELECT 
TO authenticated
USING ((is_active = true) OR is_admin(auth.uid()));

-- Update cms_categories policies
DROP POLICY IF EXISTS "Public can view CMS categories" ON public.cms_categories;
CREATE POLICY "Authenticated users can view CMS categories" 
ON public.cms_categories 
FOR SELECT 
TO authenticated
USING (true);

-- Update cms_tags policies
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON public.cms_tags;
CREATE POLICY "Authenticated users can view tags" 
ON public.cms_tags 
FOR SELECT 
TO authenticated
USING (true);

-- Update cms_page_tags policies
DROP POLICY IF EXISTS "Page tags are viewable by everyone" ON public.cms_page_tags;
CREATE POLICY "Authenticated users can view page tags" 
ON public.cms_page_tags 
FOR SELECT 
TO authenticated
USING (true);