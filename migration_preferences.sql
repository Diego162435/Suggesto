-- Migration to add preferences column to profiles
-- This allows storing user interests/genres directly on their profile

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Ensure RLS allows users to update their own preferences (already covered by existing update policy, but good to verify)
-- Existing policy: create policy "Users can update own profile." on profiles for update using (auth.uid() = id);
-- This covers the new column automatically.
