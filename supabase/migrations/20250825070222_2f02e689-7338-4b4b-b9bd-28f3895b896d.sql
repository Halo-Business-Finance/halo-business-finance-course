-- Create media storage bucket for CMS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cms-media', 'cms-media', true);

-- Create RLS policies for cms-media bucket
CREATE POLICY "Admins can upload media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cms-media' AND is_admin(auth.uid()));

CREATE POLICY "Admins can view all media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cms-media' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'cms-media' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'cms-media' AND is_admin(auth.uid()));

-- Allow public read access to published media files
CREATE POLICY "Public can view published media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cms-media');