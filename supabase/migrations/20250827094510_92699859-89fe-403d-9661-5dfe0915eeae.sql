-- Create missing module_completions table
CREATE TABLE public.module_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  module_id text NOT NULL,
  completed_at timestamp with time zone DEFAULT now(),
  time_spent_minutes integer DEFAULT 0,
  progress_percentage integer DEFAULT 100,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.module_completions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own module completions" 
ON public.module_completions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own module completions" 
ON public.module_completions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own module completions" 
ON public.module_completions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all module completions" 
ON public.module_completions 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Create trigger for updating timestamps
CREATE TRIGGER update_module_completion_stats_trigger
AFTER INSERT ON public.module_completions
FOR EACH ROW
EXECUTE FUNCTION public.update_module_completion_stats();

-- Add index for better performance
CREATE INDEX idx_module_completions_user_id ON public.module_completions(user_id);
CREATE INDEX idx_module_completions_module_id ON public.module_completions(module_id);