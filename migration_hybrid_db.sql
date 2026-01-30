-- Migration for Hybrid/Curated Items (Coffee Makers, etc.)
-- This table allows storing manual products alongside the API-fetched media content.

create table curated_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Core fields that match the prompt
  category_id text, -- e.g. 'coffee-makers', 'office'
  title text not null,
  description text,
  image_url text, 
  amazon_term text, -- for generating links
  
  -- The Hybrid/Flexible Power: JSON data for diverse attributes
  extra_data jsonb default '{}'::jsonb,
  
  -- Metadata for our app structure
  slug text unique,
  type text default 'product' -- 'product', 'movie', 'book' (if we manually curate them)
);

-- Enable RLS
alter table curated_items enable row level security;

-- Public read access
create policy "Curated items are viewable by everyone." on curated_items
  for select using (true);

-- Only admins can insert/update (You can adjust this policy later for dashboard usage)
-- For now, we assume direct SQL insertion or dashboard user.
-- create policy "Admins can insert." on curated_items ...

-- Example Insertion (Seed Data):
-- insert into curated_items (title, description, amazon_term, extra_data)
-- values (
--   'Cafeteira Nespresso Essenza Mini',
--   'Ideal para quem tem pouco espaço e ama café rápido.',
--   'Nespresso Essenza Mini',
--   '{"brand": "Nespresso", "voltage": "110v", "color": "Red"}'
-- );
