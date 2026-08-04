-- Waitlist survey + count reconciliation.
--
-- The live prod `public.waitlist` predates the repo's 20260520 migration and was
-- created with a different shape (id, email, note, source, created_at) — it has
-- neither the name/sport columns the frontend inserts nor the waitlist_count
-- singleton + trigger the live number reads. That mismatch is why signups failed
-- and the count never moved. This migration reconciles prod to what the app
-- expects, additively and idempotently (no existing row is modified).

-- 1. Columns the frontend writes (all nullable — a bare email still joins).
alter table public.waitlist
  add column if not exists name           text,
  add column if not exists sport          text,
  add column if not exists role           text,
  add column if not exists university     text,
  add column if not exists wearable       text,
  add column if not exists tools          text[],
  add column if not exists track_wants    text[],
  add column if not exists dimensionality text,
  add column if not exists user_agent     text;

-- 2. Public count singleton — powers the live "N already joined" number. Seeded
--    to the current real row count so it is correct from the first render.
create table if not exists public.waitlist_count (
  id     boolean primary key default true,
  total  integer not null default 0,
  constraint waitlist_count_singleton check (id = true)
);

insert into public.waitlist_count (id, total)
values (true, (select count(*)::int from public.waitlist))
on conflict (id) do update set total = excluded.total;

alter table public.waitlist_count enable row level security;

-- Anyone may read the count (it powers the homepage number); nobody writes it
-- directly — the trigger below does, as security definer.
drop policy if exists waitlist_count_anyone_reads on public.waitlist_count;
create policy waitlist_count_anyone_reads
  on public.waitlist_count for select
  to anon, authenticated
  using (true);

-- 3. Trigger — bump the count after each new signup.
create or replace function public.increment_waitlist_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.waitlist_count set total = total + 1 where id = true;
  return new;
end;
$$;

drop trigger if exists trg_increment_waitlist_count on public.waitlist;
create trigger trg_increment_waitlist_count
  after insert on public.waitlist
  for each row execute function public.increment_waitlist_count();

-- 3b. Table-level GRANTs. This project was created without default privileges,
--     so RLS policies alone are not enough — anon also needs the base grant or
--     every insert fails with 42501. anon gets INSERT only on waitlist (never
--     SELECT — emails stay private); the count is readable; service_role (the
--     /responses reader) gets full access.
grant insert on public.waitlist to anon, authenticated;
grant select on public.waitlist_count to anon, authenticated;
grant select, insert, update, delete on public.waitlist to service_role;
grant select, insert, update on public.waitlist_count to service_role;

-- 4. Realtime — let the browser subscribe to UPDATE on the count singleton so
--    the number ticks up live. Guarded so re-runs do not error.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'waitlist_count'
  ) then
    alter publication supabase_realtime add table public.waitlist_count;
  end if;
end $$;
