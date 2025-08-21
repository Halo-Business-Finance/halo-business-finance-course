-- Create video management tables
CREATE TABLE public.course_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id TEXT REFERENCES public.course_modules(module_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_type TEXT NOT NULL DEFAULT 'youtube', -- 'youtube', 'url', 'upload'
  video_url TEXT NOT NULL,
  youtube_id TEXT, -- extracted from youtube URLs
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  upload_user_id UUID REFERENCES auth.users(id),
  view_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create articles management table
CREATE TABLE public.course_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id TEXT REFERENCES public.course_modules(module_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES auth.users(id),
  featured_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  publish_date TIMESTAMP WITH TIME ZONE,
  order_index INTEGER NOT NULL DEFAULT 0,
  reading_time_minutes INTEGER,
  tags TEXT[],
  category TEXT DEFAULT 'general', -- 'tutorial', 'guide', 'reference', 'case-study'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content uploads table for tracking file uploads
CREATE TABLE public.content_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  upload_user_id UUID REFERENCES auth.users(id) NOT NULL,
  content_type TEXT, -- 'video', 'article', 'document', 'image'
  related_content_id UUID, -- can reference videos, articles, etc.
  is_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.course_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_uploads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for course_videos
CREATE POLICY "Anyone can view active videos" 
ON public.course_videos 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage videos" 
ON public.course_videos 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create RLS policies for course_articles
CREATE POLICY "Anyone can view published articles" 
ON public.course_articles 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage articles" 
ON public.course_articles 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create RLS policies for content_uploads
CREATE POLICY "Users can view their own uploads" 
ON public.content_uploads 
FOR SELECT 
USING (auth.uid() = upload_user_id);

CREATE POLICY "Users can create uploads" 
ON public.content_uploads 
FOR INSERT 
WITH CHECK (auth.uid() = upload_user_id);

CREATE POLICY "Admins can view all uploads" 
ON public.content_uploads 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage uploads" 
ON public.content_uploads 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_course_videos_module ON public.course_videos(module_id);
CREATE INDEX idx_course_videos_type ON public.course_videos(video_type);
CREATE INDEX idx_course_videos_active ON public.course_videos(is_active);
CREATE INDEX idx_course_articles_module ON public.course_articles(module_id);
CREATE INDEX idx_course_articles_published ON public.course_articles(is_published);
CREATE INDEX idx_course_articles_category ON public.course_articles(category);
CREATE INDEX idx_content_uploads_user ON public.content_uploads(upload_user_id);
CREATE INDEX idx_content_uploads_type ON public.content_uploads(content_type);

-- Create triggers for updated_at columns
CREATE TRIGGER update_course_videos_updated_at
  BEFORE UPDATE ON public.course_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_articles_updated_at
  BEFORE UPDATE ON public.course_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for content uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('course-content', 'course-content', false);

-- Create storage policies for course content
CREATE POLICY "Authenticated users can view course content" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'course-content' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can upload course content" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'course-content' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update course content" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'course-content' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete course content" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'course-content' AND public.is_admin(auth.uid()));