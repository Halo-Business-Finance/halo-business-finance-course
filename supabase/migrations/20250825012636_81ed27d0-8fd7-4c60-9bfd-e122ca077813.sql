-- Enhanced CMS Tables for comprehensive content management

-- Create CMS pages table for standalone pages (not tied to courses)
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  featured_image_url TEXT,
  template TEXT DEFAULT 'default',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID REFERENCES auth.users(id),
  parent_id UUID REFERENCES public.cms_pages(id),
  sort_order INTEGER DEFAULT 0,
  is_homepage BOOLEAN DEFAULT false,
  custom_css TEXT,
  custom_js TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CMS media library table
CREATE TABLE IF NOT EXISTS public.cms_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  folder_path TEXT DEFAULT '/',
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CMS menus table for navigation management
CREATE TABLE IF NOT EXISTS public.cms_menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  location TEXT, -- header, footer, sidebar
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CMS menu items table
CREATE TABLE IF NOT EXISTS public.cms_menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID NOT NULL REFERENCES public.cms_menus(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.cms_menu_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  page_id UUID REFERENCES public.cms_pages(id) ON DELETE SET NULL,
  target TEXT DEFAULT '_self',
  icon TEXT,
  css_class TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CMS content blocks for reusable content
CREATE TABLE IF NOT EXISTS public.cms_content_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL, -- text, html, image, video, form, widget
  content JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  is_global BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CMS tags table
CREATE TABLE IF NOT EXISTS public.cms_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3B82F6',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CMS page tags junction table
CREATE TABLE IF NOT EXISTS public.cms_page_tags (
  page_id UUID NOT NULL REFERENCES public.cms_pages(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.cms_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (page_id, tag_id)
);

-- Create CMS categories table
CREATE TABLE IF NOT EXISTS public.cms_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.cms_categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add category reference to pages
ALTER TABLE public.cms_pages 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.cms_categories(id);

-- Add RLS policies
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_page_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_categories ENABLE ROW LEVEL SECURITY;

-- CMS Pages policies
CREATE POLICY "Admins can manage all CMS pages" ON public.cms_pages
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Published pages are viewable by everyone" ON public.cms_pages
  FOR SELECT USING (status = 'published');

-- CMS Media policies
CREATE POLICY "Admins can manage all media" ON public.cms_media
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Media is viewable by authenticated users" ON public.cms_media
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- CMS Menus policies
CREATE POLICY "Admins can manage menus" ON public.cms_menus
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Active menus are viewable by everyone" ON public.cms_menus
  FOR SELECT USING (is_active = true);

-- CMS Menu Items policies
CREATE POLICY "Admins can manage menu items" ON public.cms_menu_items
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Active menu items are viewable by everyone" ON public.cms_menu_items
  FOR SELECT USING (is_active = true);

-- CMS Content Blocks policies
CREATE POLICY "Admins can manage content blocks" ON public.cms_content_blocks
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Global content blocks are viewable by everyone" ON public.cms_content_blocks
  FOR SELECT USING (is_global = true);

-- CMS Tags policies
CREATE POLICY "Admins can manage tags" ON public.cms_tags
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Tags are viewable by everyone" ON public.cms_tags
  FOR SELECT USING (true);

-- CMS Page Tags policies
CREATE POLICY "Admins can manage page tags" ON public.cms_page_tags
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Page tags are viewable by everyone" ON public.cms_page_tags
  FOR SELECT USING (true);

-- CMS Categories policies
CREATE POLICY "Admins can manage categories" ON public.cms_categories
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Categories are viewable by everyone" ON public.cms_categories
  FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON public.cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON public.cms_pages(status);
CREATE INDEX IF NOT EXISTS idx_cms_pages_published_at ON public.cms_pages(published_at);
CREATE INDEX IF NOT EXISTS idx_cms_media_file_type ON public.cms_media(file_type);
CREATE INDEX IF NOT EXISTS idx_cms_media_folder_path ON public.cms_media(folder_path);
CREATE INDEX IF NOT EXISTS idx_cms_menu_items_sort_order ON public.cms_menu_items(sort_order);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cms_pages_updated_at
    BEFORE UPDATE ON public.cms_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_media_updated_at
    BEFORE UPDATE ON public.cms_media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_menus_updated_at
    BEFORE UPDATE ON public.cms_menus
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_menu_items_updated_at
    BEFORE UPDATE ON public.cms_menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_content_blocks_updated_at
    BEFORE UPDATE ON public.cms_content_blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_categories_updated_at
    BEFORE UPDATE ON public.cms_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();