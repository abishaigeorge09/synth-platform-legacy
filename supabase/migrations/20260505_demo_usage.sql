-- Phase: AI demo daily cap.
--
-- A per-user, per-UTC-day counter for AI message sends from demo
-- (anonymous) accounts. The matching client-side counter in
-- src/features/app/store/useDemoUsage.ts is the soft UX defence;
-- this table + the claude-chat Edge Function check make it bulletproof.
--
-- Why anonymous-only: real signed-up coaches pay for their own usage
-- and shouldn't be capped. Demo users hit our shared Anthropic
-- billing, so they get a daily ceiling. The Edge Function reads
-- auth.users.is_anonymous to decide whether to enforce.
--
-- One row per (user, day). 30-message-per-day cap matches the client
-- store's DEMO_DAILY_AI_LIMIT constant. If the cap changes, update
-- both — they live independently because the client check saves a
-- network round-trip on the obvious "you're over" case.

create table if not exists public.demo_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  message_count integer not null default 0,
  -- Last-update timestamp helps debug when a counter went sideways.
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

-- Index on (user_id, date) is implicit via the composite primary key.
-- No additional indexes needed — every query is by exact (user, day).

alter table public.demo_usage enable row level security;

-- Only the user themselves can read/write their own counter row.
-- The Edge Function authenticates as the user (uses their JWT to
-- construct a user-scoped supabase client), so it inherits these
-- permissions naturally. Service role bypasses RLS but we don't use
-- the service role for this table — keeps the blast radius small.
drop policy if exists "demo usage own select" on public.demo_usage;
create policy "demo usage own select"
  on public.demo_usage
  for select
  using (auth.uid() = user_id);

drop policy if exists "demo usage own insert" on public.demo_usage;
create policy "demo usage own insert"
  on public.demo_usage
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "demo usage own update" on public.demo_usage;
create policy "demo usage own update"
  on public.demo_usage
  for update
  using (auth.uid() = user_id);

-- No delete policy: counter rows accumulate. Clean up via a scheduled
-- task (e.g. drop rows older than 7 days) if storage becomes a
-- concern. Volume is tiny — 1 row per (user, day) at the demo tier.

-- Forward-compat note: signed-up users never get a row here because
-- the Edge Function only writes when is_anonymous is true. If we
-- ever want to track usage for paying tiers we'd add a separate
-- table or column with a different cap.
