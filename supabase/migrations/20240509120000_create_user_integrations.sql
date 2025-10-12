create extension if not exists "pgcrypto";

create table if not exists public.user_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  platform text not null check (platform in ('meta', 'x', 'tiktok')),
  api_key text,
  api_secret text,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  is_connected boolean not null default false,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_integrations_user_platform_key unique (user_id, platform)
);

alter table public.user_integrations enable row level security;

create policy "Users can view their integrations" on public.user_integrations
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their integrations" on public.user_integrations
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their integrations" on public.user_integrations
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their integrations" on public.user_integrations
  for delete
  using (auth.uid() = user_id);

create or replace function public.set_user_integrations_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_user_integrations_updated_at
before update on public.user_integrations
for each row execute procedure public.set_user_integrations_updated_at();
