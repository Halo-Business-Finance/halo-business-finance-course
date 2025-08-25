-- Insert sample categories
INSERT INTO cms_categories (id, name, slug, description, sort_order) VALUES
  (gen_random_uuid(), 'General', 'general', 'General content pages', 1),
  (gen_random_uuid(), 'Products', 'products', 'Product related pages', 2),
  (gen_random_uuid(), 'Support', 'support', 'Support and help pages', 3);

-- Insert sample pages
INSERT INTO cms_pages (id, title, slug, content, status, meta_title, meta_description, is_homepage, sort_order, category_id) VALUES
  (gen_random_uuid(), 'Home Page', 'home', '<h1>Welcome to our website</h1><p>This is the home page content.</p>', 'published', 'Home - Welcome to our site', 'Welcome to our website homepage', true, 1, (SELECT id FROM cms_categories WHERE slug = 'general' LIMIT 1)),
  (gen_random_uuid(), 'About Us', 'about', '<h1>About Our Company</h1><p>Learn more about our company and mission.</p>', 'published', 'About Us - Our Story', 'Learn about our company history and mission', false, 2, (SELECT id FROM cms_categories WHERE slug = 'general' LIMIT 1)),
  (gen_random_uuid(), 'Products Overview', 'products', '<h1>Our Products</h1><p>Discover our amazing product lineup.</p>', 'draft', 'Products - Our Solutions', 'Explore our comprehensive product offerings', false, 3, (SELECT id FROM cms_categories WHERE slug = 'products' LIMIT 1)),
  (gen_random_uuid(), 'Contact Us', 'contact', '<h1>Get in Touch</h1><p>Contact us for more information.</p>', 'published', 'Contact Us - Get in Touch', 'Contact our team for support and inquiries', false, 4, (SELECT id FROM cms_categories WHERE slug = 'support' LIMIT 1));

-- Insert sample tags
INSERT INTO cms_tags (id, name, slug, color, description) VALUES
  (gen_random_uuid(), 'Important', 'important', '#ef4444', 'Important content that needs attention'),
  (gen_random_uuid(), 'Featured', 'featured', '#3b82f6', 'Featured content for homepage'),
  (gen_random_uuid(), 'New', 'new', '#10b981', 'Newly created content');

-- Insert sample menus
INSERT INTO cms_menus (id, name, label, location, is_active) VALUES
  (gen_random_uuid(), 'main-navigation', 'Main Navigation', 'header', true),
  (gen_random_uuid(), 'footer-links', 'Footer Links', 'footer', true);

-- Insert sample menu items
INSERT INTO cms_menu_items (id, menu_id, title, url, sort_order, is_active) VALUES
  (gen_random_uuid(), (SELECT id FROM cms_menus WHERE name = 'main-navigation' LIMIT 1), 'Home', '/', 1, true),
  (gen_random_uuid(), (SELECT id FROM cms_menus WHERE name = 'main-navigation' LIMIT 1), 'About', '/about', 2, true),
  (gen_random_uuid(), (SELECT id FROM cms_menus WHERE name = 'main-navigation' LIMIT 1), 'Products', '/products', 3, true),
  (gen_random_uuid(), (SELECT id FROM cms_menus WHERE name = 'main-navigation' LIMIT 1), 'Contact', '/contact', 4, true),
  (gen_random_uuid(), (SELECT id FROM cms_menus WHERE name = 'footer-links' LIMIT 1), 'Privacy Policy', '/privacy', 1, true),
  (gen_random_uuid(), (SELECT id FROM cms_menus WHERE name = 'footer-links' LIMIT 1), 'Terms of Service', '/terms', 2, true);