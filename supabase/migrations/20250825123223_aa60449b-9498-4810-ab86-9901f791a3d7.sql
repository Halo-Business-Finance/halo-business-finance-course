-- Create leads table for storing contact sales inquiries
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Contact Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT NOT NULL,
  job_title TEXT,
  
  -- Business Information
  company_size TEXT,
  budget TEXT,
  timeline TEXT,
  message TEXT,
  
  -- Lead Source and Status
  lead_source TEXT NOT NULL DEFAULT 'contact_sales',
  lead_type TEXT NOT NULL DEFAULT 'sales', -- 'sales', 'demo', 'support'
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'closed'
  
  -- Admin Assignment
  assigned_to UUID,
  
  -- Notes and Follow-up
  admin_notes TEXT,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  last_contacted TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies for leads table
CREATE POLICY "Public can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all leads" 
ON public.leads 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update leads" 
ON public.leads 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete leads" 
ON public.leads 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_leads_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_leads_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX idx_leads_lead_type ON public.leads(lead_type);