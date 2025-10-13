-- Create tables for dashboard metrics and time series
create extension if not exists pgcrypto;

create table if not exists public.dashboard_metrics (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value numeric not null,
  change numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.dashboard_metric_series (
  id uuid primary key default gen_random_uuid(),
  metric_key text not null references public.dashboard_metrics(key) on delete cascade,
  data_date date not null,
  value numeric not null,
  created_at timestamptz not null default now(),
  constraint dashboard_metric_series_unique unique (metric_key, data_date)
);

create table if not exists public.dashboard_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_name text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.dashboard_metrics enable row level security;
alter table public.dashboard_metric_series enable row level security;
alter table public.dashboard_events enable row level security;

-- Allow authenticated users to read metrics and series
create policy "Authenticated users can read dashboard metrics" on public.dashboard_metrics
  for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can read dashboard metric series" on public.dashboard_metric_series
  for select
  using (auth.role() = 'authenticated');

-- Allow service role inserts/updates (handled by Supabase service key)
create policy "Service role manages dashboard metrics" on public.dashboard_metrics
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "Service role manages dashboard metric series" on public.dashboard_metric_series
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Analytics events policies
create policy "Authenticated users can insert dashboard events" on public.dashboard_events
  for insert
  with check (auth.uid() = user_id);

create policy "Service role manages dashboard events" on public.dashboard_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

insert into public.dashboard_metrics (key, value, change)
values
  ('clients', 15, 12.5)
  on conflict (key) do update set value = excluded.value, change = excluded.change;

insert into public.dashboard_metrics (key, value, change)
values
  ('campaigns', 8, 5.2)
  on conflict (key) do update set value = excluded.value, change = excluded.change;

insert into public.dashboard_metric_series (metric_key, data_date, value)
select metric_key, data_date, value from (
  values
    ('clients', current_date - 6, 9),
    ('clients', current_date - 5, 10),
    ('clients', current_date - 4, 11),
    ('clients', current_date - 3, 13),
    ('clients', current_date - 2, 14),
    ('clients', current_date - 1, 15),
    ('clients', current_date, 15),
    ('campaigns', current_date - 6, 4),
    ('campaigns', current_date - 5, 5),
    ('campaigns', current_date - 4, 5),
    ('campaigns', current_date - 3, 6),
    ('campaigns', current_date - 2, 7),
    ('campaigns', current_date - 1, 8),
    ('campaigns', current_date, 8)
) as seed(metric_key, data_date, value)
on conflict (metric_key, data_date) do update set value = excluded.value;
