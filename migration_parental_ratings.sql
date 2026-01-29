-- Add allowed_ratings column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS allowed_content_ratings TEXT[] DEFAULT '{"L", "10"}'::TEXT[];

-- Note: Ratings will be stored as strings: 'L', '10', '12', '14', '16', '18'
