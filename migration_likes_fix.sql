-- CLEAN RESET FOR LIKES TABLE
-- This will solve the 406 error by ensuring the table exactly matches the expected schema

-- 1. DROP the table if it exists (Atomic reset)
drop table if exists likes;

-- 2. Create the table
create table likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  media_id text not null,
  media_type text check (media_type in ('movie', 'book', 'tv')) not null,
  title text not null,
  poster_path text,
  vote_average numeric,
  
  unique(user_id, media_id)
);

-- 3. Enable RLS
alter table likes enable row level security;

-- 4. Create Policies
create policy "Likes are viewable by owner." on likes
  for select using (auth.uid() = user_id);

create policy "Users can insert their own likes." on likes
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own likes." on likes
  for delete using (auth.uid() = user_id);

-- Note: 406 error can also be caused by stagnant cache. 
-- After running this, please REFRESH your browser page.
