-- Run once in your Supabase project: SQL Editor → New query → paste → Run.
-- One row per user holds all of that user's progress. Row-level security makes sure
-- each signed-in user can only read and write their own row.

create table if not exists public.progress (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

-- Newer Supabase projects don't give the API roles access to new tables automatically.
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.progress to authenticated;

drop policy if exists "Users manage their own progress" on public.progress;
create policy "Users manage their own progress"
  on public.progress
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
