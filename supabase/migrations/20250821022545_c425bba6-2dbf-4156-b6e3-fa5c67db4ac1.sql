-- Create instructors table
CREATE TABLE public.instructors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT 'Halo Business Finance',
  years_experience TEXT NOT NULL,
  bio TEXT NOT NULL,
  avatar_initials TEXT NOT NULL,
  avatar_color TEXT NOT NULL DEFAULT 'primary',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active instructors" 
ON public.instructors 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage instructors" 
ON public.instructors 
FOR ALL 
USING (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_instructors_updated_at
BEFORE UPDATE ON public.instructors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default instructors data
INSERT INTO public.instructors (name, title, years_experience, bio, avatar_initials, avatar_color, display_order) VALUES
(
  'Sarah Mitchell',
  'Senior Vice President, Business Finance',
  '15+ years experience',
  'Expert in SBA lending and commercial finance with extensive experience in business development and client relationship management.',
  'SM',
  'primary',
  1
),
(
  'David Thompson', 
  'Director of Credit Analysis',
  '12+ years experience',
  'Specialist in risk assessment and credit analysis with deep knowledge of regulatory compliance and underwriting standards.',
  'DT',
  'success',
  2
);