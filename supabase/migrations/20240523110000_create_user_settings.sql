create extension if not exists "pgcrypto";

create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text,
  company text,
  role text,
  contact_email text,
  language text not null default 'en',
  timezone text not null default 'Africa/Casablanca',
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  api_key_encrypted text,
  api_key_hash text,
  api_key_label text,
  api_key_last_four text,
  notifications jsonb not null default '{"campaignSummaries": true, "performanceAlerts": true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_settings_user_unique unique (user_id)
);

alter table public.user_settings enable row level security;

create policy "Users can view their settings" on public.user_settings
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their settings" on public.user_settings
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their settings" on public.user_settings
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their settings" on public.user_settings
  for delete
  using (auth.uid() = user_id);

create or replace function public.set_user_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_user_settings_updated_at
before update on public.user_settings
for each row execute procedure public.set_user_settings_updated_at();
