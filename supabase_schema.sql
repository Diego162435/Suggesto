-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  avatar_url text,

  constraint username_length check (char_length(username) >= 3)
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Set up Realtime!
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table profiles;

-- Handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a table for user ratings
create table user_ratings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  media_id text not null,
  media_type text check (media_type in ('movie', 'book')) not null,
  title text not null,
  poster_path text,
  rating integer check (rating >= 0 and rating <= 10) not null,
  pace text check (pace in ('slow', 'medium', 'fast')) not null,
  genre text not null,
  comment text
);

alter table user_ratings enable row level security;

create policy "Ratings are viewable by everyone." on user_ratings
  for select using (true);

create policy "Users can insert their own ratings." on user_ratings
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own ratings." on user_ratings
  for update using (auth.uid() = user_id);

create policy "Users can delete their own ratings." on user_ratings
  for delete using (auth.uid() = user_id);

-- Create a table for wishlist
create table wishlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  media_id text not null,
  media_type text check (media_type in ('movie', 'book')) not null,
  title text not null,
  poster_path text,
  status text check (status in ('want_to_consume', 'consumed')) not null
);

alter table wishlist enable row level security;

create policy "Wishlist items are viewable by everyone." on wishlist
  for select using (true);

create policy "Users can insert their own wishlist items." on wishlist
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own wishlist items." on wishlist
  for update using (auth.uid() = user_id);

create policy "Users can delete their own wishlist items." on wishlist
  for delete using (auth.uid() = user_id);
