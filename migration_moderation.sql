-- Migration for Moderation & Admin Role

-- 1. Add is_admin column to profiles
alter table profiles add column is_admin boolean default false;

-- 2. Update comments policies to allow admins to delete any comment
drop policy if exists "Users can delete their own comments." on comments;

create policy "Users can delete their own or admin can delete any comments." on comments
  for delete using (
    auth.uid() = user_id OR 
    (select is_admin from profiles where id = auth.uid()) = true
  );

-- 3. Create a reports table for moderation
create table reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references public.profiles(id) not null,
  comment_id uuid references public.comments(id) on delete cascade,
  reason text not null,
  status text check (status in ('pending', 'resolved', 'ignored')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table reports enable row level security;

create policy "Reports are viewable by admins only." on reports
  for select using (
    (select is_admin from profiles where id = auth.uid()) = true
  );

create policy "Users can insert reports." on reports
  for insert with check (auth.uid() = reporter_id);

create policy "Admins can update reports." on reports
  for update using (
    (select is_admin from profiles where id = auth.uid()) = true
  );
