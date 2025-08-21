-- Create learning_tools table
CREATE TABLE public.learning_tools (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  tool_url text,
  tool_type text NOT NULL DEFAULT 'web_tool',
  category text DEFAULT 'general',
  tags text[],
  is_active boolean DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create learning_webinars table  
CREATE TABLE public.learning_webinars (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  presenter text NOT NULL,
  scheduled_date date,
  scheduled_time time,
  timezone text DEFAULT 'EST',
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  recording_url text,
  registration_url text,
  max_attendees integer,
  current_attendees integer DEFAULT 0,
  tags text[],
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learning_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_webinars ENABLE ROW LEVEL SECURITY;

-- RLS policies for learning_tools
CREATE POLICY "Authenticated users can view active tools" 
ON public.learning_tools 
FOR SELECT 
USING ((auth.uid() IS NOT NULL) AND (is_active = true));

CREATE POLICY "Admins can manage tools" 
ON public.learning_tools 
FOR ALL 
USING (is_admin(auth.uid()));

-- RLS policies for learning_webinars  
CREATE POLICY "Authenticated users can view active webinars" 
ON public.learning_webinars 
FOR SELECT 
USING ((auth.uid() IS NOT NULL) AND (is_active = true));

CREATE POLICY "Admins can manage webinars" 
ON public.learning_webinars 
FOR ALL 
USING (is_admin(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_learning_tools_updated_at
BEFORE UPDATE ON public.learning_tools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_webinars_updated_at
BEFORE UPDATE ON public.learning_webinars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();