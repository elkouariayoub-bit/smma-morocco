create extension if not exists "pgcrypto";

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  name text not null,
  description text,
  status text not null default 'planned' check (status in ('planned', 'active', 'paused', 'completed', 'archived')),
  start_date date not null,
  end_date date,
  position integer not null default 0,
  milestones jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists campaigns_user_id_position_idx on public.campaigns (user_id, position asc);
create index if not exists campaigns_client_id_idx on public.campaigns (client_id);

alter table public.campaigns enable row level security;

create policy "Users can view their campaigns" on public.campaigns
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their campaigns" on public.campaigns
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their campaigns" on public.campaigns
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their campaigns" on public.campaigns
  for delete
  using (auth.uid() = user_id);

create or replace function public.set_campaigns_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_campaigns_updated_at
before update on public.campaigns
for each row execute procedure public.set_campaigns_updated_at();
