-- Phase: file ingestion (slice 1 of "make synth. work").
--
-- A coach drops a CSV / PDF / image / XLSX into the synth. Agent modal.
-- The file is stored in the `uploads` bucket; the `ingest` Edge Function
-- parses it, calls Claude with a forced `emit_events` tool to extract
-- structured rows, fuzzy-matches each row to an athlete, and writes
-- preview rows into ingestion_events. The coach reviews, fixes any
-- mis-tagged rows, and confirms — events flip to status='confirmed'
-- and surface in dashboards, athlete profiles, and the AI chat context.
--
-- Auth model for this first slice: per-user RLS only (auth.uid() =
-- uploaded_by). team_id is captured on the row but not enforced via
-- RLS yet — there is no team_members table. When proper team
-- membership lands we'll tighten the policies; until then a coach
-- can only see their own uploads, which is exactly what we want for
-- single-coach onboarding.

-- ─── source_uploads ──────────────────────────────────────────────────
-- One row per file the coach drops, regardless of fate. A row in
-- 'pending' or 'parsing' is in-flight; 'preview' means events are
-- written but unconfirmed; 'confirmed' is the terminal happy state.
-- 'failed' captures parse errors so the coach can retry. The bytes
-- live in storage.objects under storage_path.

create table if not exists public.source_uploads (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  kind text not null check (kind in ('csv','xlsx','pdf','image','paste')),
  status text not null default 'pending'
    check (status in ('pending','parsing','preview','confirmed','failed','cancelled')),
  parse_error text,
  events_extracted integer not null default 0,
  events_confirmed integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists source_uploads_uploader_idx
  on public.source_uploads (uploaded_by, created_at desc);

create index if not exists source_uploads_team_idx
  on public.source_uploads (team_id, created_at desc);

alter table public.source_uploads enable row level security;

drop policy if exists "source_uploads own select" on public.source_uploads;
create policy "source_uploads own select"
  on public.source_uploads
  for select
  using (auth.uid() = uploaded_by);

drop policy if exists "source_uploads own insert" on public.source_uploads;
create policy "source_uploads own insert"
  on public.source_uploads
  for insert
  with check (auth.uid() = uploaded_by);

drop policy if exists "source_uploads own update" on public.source_uploads;
create policy "source_uploads own update"
  on public.source_uploads
  for update
  using (auth.uid() = uploaded_by);

drop policy if exists "source_uploads own delete" on public.source_uploads;
create policy "source_uploads own delete"
  on public.source_uploads
  for delete
  using (auth.uid() = uploaded_by);

-- ─── ingestion_events ────────────────────────────────────────────────
-- The structured rows extracted from a single source_upload. Shape
-- mirrors src/shared/data/types.ts:AthleteTimelineEvent so the seed
-- timeline and ingested events can render through one component.
-- athlete_id is nullable so unmatched rows still persist for the
-- coach to triage in the preview panel. category enum matches
-- TimelineCategory exactly.

create table if not exists public.ingestion_events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null,
  athlete_id uuid,
  source_upload_id uuid not null
    references public.source_uploads(id) on delete cascade,
  occurred_at timestamptz not null,
  category text not null
    check (category in ('erg','gym','wellness','session_note','water','cross_training','sleep','hrv','other')),
  metric text not null,
  value numeric,
  value_text text,
  unit text,
  athlete_name_raw text,             -- what the file said ("Maria S.")
  extraction_confidence numeric,     -- 0..1 from Claude
  match_confidence numeric,          -- 0..1 from athlete fuzzy-match
  raw jsonb,                          -- original parsed row
  status text not null default 'preview'
    check (status in ('preview','confirmed','rejected')),
  created_at timestamptz not null default now()
);

create index if not exists ingestion_events_athlete_idx
  on public.ingestion_events (athlete_id, occurred_at desc)
  where status = 'confirmed';

create index if not exists ingestion_events_team_idx
  on public.ingestion_events (team_id, occurred_at desc)
  where status = 'confirmed';

create index if not exists ingestion_events_upload_idx
  on public.ingestion_events (source_upload_id);

alter table public.ingestion_events enable row level security;

-- RLS on events delegates to source_uploads ownership: a coach can
-- read/write events derived from their own uploads. This keeps the
-- per-user model coherent without duplicating uploaded_by on every
-- event row.
drop policy if exists "ingestion_events via own upload select" on public.ingestion_events;
create policy "ingestion_events via own upload select"
  on public.ingestion_events
  for select
  using (
    exists (
      select 1 from public.source_uploads su
      where su.id = ingestion_events.source_upload_id
        and su.uploaded_by = auth.uid()
    )
  );

drop policy if exists "ingestion_events via own upload insert" on public.ingestion_events;
create policy "ingestion_events via own upload insert"
  on public.ingestion_events
  for insert
  with check (
    exists (
      select 1 from public.source_uploads su
      where su.id = ingestion_events.source_upload_id
        and su.uploaded_by = auth.uid()
    )
  );

drop policy if exists "ingestion_events via own upload update" on public.ingestion_events;
create policy "ingestion_events via own upload update"
  on public.ingestion_events
  for update
  using (
    exists (
      select 1 from public.source_uploads su
      where su.id = ingestion_events.source_upload_id
        and su.uploaded_by = auth.uid()
    )
  );

drop policy if exists "ingestion_events via own upload delete" on public.ingestion_events;
create policy "ingestion_events via own upload delete"
  on public.ingestion_events
  for delete
  using (
    exists (
      select 1 from public.source_uploads su
      where su.id = ingestion_events.source_upload_id
        and su.uploaded_by = auth.uid()
    )
  );

-- ─── Storage bucket: uploads ─────────────────────────────────────────
-- Private bucket. Path convention: `{auth.uid()}/{upload_id}.{ext}`.
-- We key the prefix on auth.uid() (not team_id) so RLS policies on
-- storage.objects can be expressed cleanly: a user can only touch
-- objects whose path starts with their own uid.

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do nothing;

drop policy if exists "uploads own read" on storage.objects;
create policy "uploads own read"
  on storage.objects for select
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "uploads own write" on storage.objects;
create policy "uploads own write"
  on storage.objects for insert
  with check (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "uploads own delete" on storage.objects;
create policy "uploads own delete"
  on storage.objects for delete
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─── updated_at trigger ──────────────────────────────────────────────
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists source_uploads_set_updated_at on public.source_uploads;
create trigger source_uploads_set_updated_at
  before update on public.source_uploads
  for each row execute function public.tg_set_updated_at();
