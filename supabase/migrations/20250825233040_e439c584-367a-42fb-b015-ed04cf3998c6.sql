-- Create CMS settings table
CREATE TABLE public.cms_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cms_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for CMS settings
CREATE POLICY "Admins can manage CMS settings" 
ON public.cms_settings 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view CMS settings" 
ON public.cms_settings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cms_settings_updated_at
    BEFORE UPDATE ON public.cms_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();