-- Life Tracker schema
-- Run this once in your Supabase project's SQL Editor (Project > SQL Editor > New query).

create table if not exists public.life_tracker_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  life_data jsonb not null default '{}'::jsonb,
  year_data jsonb not null default '{}'::jsonb,
  habit_labels jsonb not null default '[]'::jsonb,
  birth_date date,
  user_name text,
  updated_at timestamptz not null default now()
);

-- Row Level Security: a user can only ever see or modify their own row.
-- This is enforced by Postgres itself, independent of any app-level code,
-- so it's safe even though the Supabase "anon" key is public in the client bundle.
alter table public.life_tracker_data enable row level security;

drop policy if exists "Users can view own data" on public.life_tracker_data;
create policy "Users can view own data"
  on public.life_tracker_data for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own data" on public.life_tracker_data;
create policy "Users can insert own data"
  on public.life_tracker_data for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own data" on public.life_tracker_data;
create policy "Users can update own data"
  on public.life_tracker_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own data" on public.life_tracker_data;
create policy "Users can delete own data"
  on public.life_tracker_data for delete
  using (auth.uid() = user_id);

-- Keep updated_at fresh on every write.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.life_tracker_data;
create trigger set_updated_at
  before update on public.life_tracker_data
  for each row execute function public.set_updated_at();
