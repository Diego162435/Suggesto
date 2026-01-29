-- Migration script to create series table
-- Ensure this script is run on Supabase/PostgreSQL
CREATE TABLE IF NOT EXISTS public.series (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    overview text,
    poster_path text,
    release_date date,
    vote_average numeric,
    seasons jsonb DEFAULT '[]'::jsonb,
    episodes jsonb DEFAULT '[]'::jsonb,
    genres jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "public read" ON public.series FOR SELECT USING (true);

-- Authenticated write access
CREATE POLICY "auth write" ON public.series FOR ALL TO authenticated USING (auth.role() = 'authenticated');
