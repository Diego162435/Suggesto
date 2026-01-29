-- Migration to add Parental Control features to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_kids_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS parental_pin TEXT,
ADD COLUMN IF NOT EXISTS allowed_content_ratings TEXT[] DEFAULT ARRAY['L', '10'];

-- Comment: These columns are used by ParentalControlContext.tsx and SettingsPage.tsx
