-- Add font_size column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN font_size text DEFAULT 'medium';