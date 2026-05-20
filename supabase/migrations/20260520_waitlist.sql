-- Public-facing waitlist. Three pieces:
--
--   1. public.waitlist
--      Append-only table of signups. RLS-enabled. Anyone (anonymous
--      visitors included) can INSERT, but nobody can SELECT — so emails
--      stay private. The unique(email) constraint stops the same person
--      from registering twice and re-incrementing the counter.
--
--   2. public.waitlist_count
--      Singleton table (one row, id = true) holding the running total.
--      Anyone can SELECT it, which is what powers the real-time number
--      on the homepage / signup screen. Supabase Realtime can subscribe
--      to UPDATE events on this row because of the read policy below.
--
--   3. trg_increment_waitlist_count
--      Trigger that fires after each waitlist insert and bumps
--      waitlist_count.total by 1. Means we never expose the raw table,
--      we just expose the count.
--
-- Front-end displays (205 + waitlist_count.total) — 205 is a baseline
-- "social proof" floor; the realtime number grows on top of it.

create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  name        text,
  sport       text,
  created_at  timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- Anyone can join the waitlist (anon or authed).
drop policy if exists waitlist_anyone_can_join on public.waitlist;
create policy waitlist_anyone_can_join
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

-- Nobody can read raw rows. (No select policy = denied under RLS.)

------------------------------------------------------------------------
-- Public count singleton
------------------------------------------------------------------------

create table if not exists public.waitlist_count (
  id     boolean primary key default true,
  total  integer not null default 0,
  constraint waitlist_count_singleton check (id = true)
);

insert into public.waitlist_count (id, total)
values (true, 0)
on conflict (id) do nothing;

alter table public.waitlist_count enable row level security;

drop policy if exists waitlist_count_anyone_reads on public.waitlist_count;
create policy waitlist_count_anyone_reads
  on public.waitlist_count
  for select
  to anon, authenticated
  using (true);

------------------------------------------------------------------------
-- Trigger — increment count on every successful waitlist insert
------------------------------------------------------------------------

create or replace function public.increment_waitlist_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.waitlist_count
     set total = total + 1
   where id = true;
  return new;
end;
$$;

drop trigger if exists trg_increment_waitlist_count on public.waitlist;
create trigger trg_increment_waitlist_count
  after insert on public.waitlist
  for each row
  execute function public.increment_waitlist_count();

------------------------------------------------------------------------
-- Realtime
------------------------------------------------------------------------

-- Enable realtime for the count table so the front-end can subscribe to
-- UPDATE events and see the number tick up live.
alter publication supabase_realtime add table public.waitlist_count;
