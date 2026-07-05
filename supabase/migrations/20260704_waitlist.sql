-- Phase: public waitlist capture.
--
-- Backs the one-page waitlist that renders when VITE_WAITLIST_MODE=true
-- (see src/features/landing/WaitlistPage.tsx + src/lib/waitlist.ts).
--
-- Anyone (anonymous, no auth) can INSERT their email. Nobody can SELECT,
-- UPDATE, or DELETE through the anon/authenticated roles — the list is
-- write-only from the browser's perspective. Read the signups from the
-- Supabase dashboard (Table editor / SQL) or the service role, both of
-- which bypass RLS. This keeps the email list from leaking via the public
-- anon key that ships in the client bundle.

create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  -- Stored lower-cased + trimmed by the client; the unique index below
  -- makes a repeat signup a no-op instead of a duplicate row.
  email      text not null,
  -- Optional free-text "what's your sport / role" style field. Nullable so
  -- the form can ship with just an email box today and grow later.
  note       text,
  -- Where the signup came from (utm / referrer / 'waitlist-hero'), handy
  -- for attribution without a separate analytics join.
  source     text,
  created_at timestamptz not null default now()
);

-- Case-insensitive dedupe: one row per email regardless of casing. The
-- client lower-cases before insert, so this is belt-and-suspenders.
create unique index if not exists waitlist_email_key
  on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

-- Table-level GRANT. This is a SEPARATE layer from RLS: PostgREST rejects the
-- request with 42501 ("permission denied for table") BEFORE evaluating RLS
-- unless the role holds the INSERT privilege. Supabase usually auto-grants
-- this to anon/authenticated via default privileges, but projects with
-- hardened defaults (or tables created outside the API) don't get it, so we
-- grant explicitly. INSERT only — no SELECT/UPDATE/DELETE grant, which keeps
-- the list unreadable through the publishable key even with the grant in place.
grant insert on public.waitlist to anon, authenticated;

-- INSERT-only for the public. `with check (true)` because there is no
-- per-user ownership concept here — it's an open signup form. Basic
-- shape validation (non-empty, contains '@') happens client-side; add a
-- CHECK constraint or an Edge Function with rate limiting if spam becomes
-- a problem.
drop policy if exists "waitlist public insert" on public.waitlist;
create policy "waitlist public insert"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

-- No SELECT / UPDATE / DELETE policies on purpose: without them RLS denies
-- those operations to anon + authenticated. Only the service role (server
-- side) and dashboard owners can read the list.
