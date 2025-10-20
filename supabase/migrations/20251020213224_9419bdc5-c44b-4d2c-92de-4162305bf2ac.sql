-- Fix RLS policies for profiles table to allow users to update their own profiles

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile only" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile only" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile only" ON profiles;

-- Create correct RLS policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);