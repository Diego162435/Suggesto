-- Create a table for user likes (Favorites)
create table likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  media_id text not null,
  media_type text check (media_type in ('movie', 'book', 'tv')) not null,
  title text not null,
  poster_path text,
  vote_average numeric,
  
  -- Prevent duplicate likes for the same item by the same user
  unique(user_id, media_id)
);

alter table likes enable row level security;

create policy "Likes are viewable by everyone." on likes
  for select using (true);

create policy "Users can insert their own likes." on likes
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own likes." on likes
  for delete using (auth.uid() = user_id);
