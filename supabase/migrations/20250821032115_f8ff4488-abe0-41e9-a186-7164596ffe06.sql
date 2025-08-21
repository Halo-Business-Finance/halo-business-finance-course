-- Add city and state fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN city TEXT,
ADD COLUMN state TEXT;