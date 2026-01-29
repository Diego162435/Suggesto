-- Tabela para notificações internas
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text default 'info', -- 'info', 'success', 'warning', 'recommendation'
  is_read boolean default false,
  link text, -- link opcional para onde redirecionar ao clicar
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.notifications enable row level security;

-- Limpar políticas antigas se existirem
drop policy if exists "Users can see their own notifications" on public.notifications;
drop policy if exists "Users can update their own notifications" on public.notifications;

-- Política: Usuários só podem ver suas próprias notificações
create policy "Users can see their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Política: Usuários podem marcar como lido (update)
create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);
