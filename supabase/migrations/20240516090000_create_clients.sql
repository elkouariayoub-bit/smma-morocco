create extension if not exists "pgcrypto";

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  contact_encrypted text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_user_id_created_at_idx on public.clients (user_id, created_at desc);

alter table public.clients enable row level security;

create policy "Users can view their clients" on public.clients
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their clients" on public.clients
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their clients" on public.clients
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their clients" on public.clients
  for delete
  using (auth.uid() = user_id);

create or replace function public.set_clients_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_clients_updated_at
before update on public.clients
for each row execute procedure public.set_clients_updated_at();
