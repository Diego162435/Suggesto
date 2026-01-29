-- Migration for Social Features (Favorites, Likes, Comments)

-- 1. Create Favorites Table (Private collection)
create table favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  media_id text not null,
  media_type text check (media_type in ('movie', 'book', 'tv')) not null,
  title text not null,
  poster_path text,
  vote_average numeric
);

alter table favorites enable row level security;

-- Policies for Favorites
create policy "Favorites are viewable by owner only." on favorites
  for select using (auth.uid() = user_id);

create policy "Users can insert their own favorites." on favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own favorites." on favorites
  for delete using (auth.uid() = user_id);


-- 2. Migrate existing Likes to Favorites (assuming current likes were used as favorites)
insert into favorites (user_id, media_id, media_type, title, poster_path, vote_average, created_at)
select user_id, media_id, media_type, title, poster_path, vote_average, created_at
from likes;

-- 3. Clear Likes table to repurpose it for "Community Likes" (Thumbs Up)
-- Ideally we start fresh for specific "Like" semantic vs "Save/Favorite"
truncate table likes;

-- Optionally ensure Likes table structure is correct if it was ad-hoc
-- (Assuming it exists, but making sure RLS allows public view for counts)
alter table likes enable row level security;

-- Drop existing policies on likes if they conflict (safely)
drop policy if exists "Likes are viewable by everyone." on likes;
drop policy if exists "Users can insert their own likes." on likes;
drop policy if exists "Users can delete their own likes." on likes;

-- Re-create Policies for Likes (Public View, Private User Mutation)
create policy "Likes are viewable by everyone." on likes
  for select using (true);

create policy "Users can insert their own likes." on likes
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own likes." on likes
  for delete using (auth.uid() = user_id);


-- 4. Create Comments Table
create table comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  media_id text not null,
  media_type text not null, -- movie, book, tv
  content text not null,
  
  -- Denormalized user info for simpler fetching (optional, but profiles join is better. Let's stick to join)
  constraint content_length check (char_length(content) > 0)
);

alter table comments enable row level security;

create policy "Comments are viewable by everyone." on comments
  for select using (true);

create policy "Users can insert their own comments." on comments
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own comments." on comments
  for delete using (auth.uid() = user_id);

-- Helper view or function for like counts (optional, usually client side count is fine for small scale, 
-- but for "Top Community" we might need a view)

create or replace view top_community_content as
select 
  media_id, 
  media_type, 
  title, 
  poster_path, 
  count(*) as like_count
from likes
group by media_id, media_type, title, poster_path
order by like_count desc;
