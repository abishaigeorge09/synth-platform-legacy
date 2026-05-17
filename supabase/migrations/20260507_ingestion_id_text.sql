-- Loosen team_id and athlete_id from uuid → text on the ingestion
-- tables. Slice 1 of "make synth. work" predates a real team_members
-- table, so the coach surface still uses seed-string IDs like
-- 'team-cal-womens-rowing' and 'athlete-wheeler-ella'. Those would
-- fail the original uuid-typed columns.
--
-- This is a strictly looser change: every existing UUID is also a
-- valid text value. When we tighten back to uuid-with-FK after
-- team_members lands, we'll either backfill the rows or truncate
-- the tables (slice-1 data is preview/demo).

drop index if exists ingestion_events_athlete_idx;
drop index if exists ingestion_events_team_idx;
drop index if exists source_uploads_team_idx;

alter table public.source_uploads
  alter column team_id type text using team_id::text;

alter table public.ingestion_events
  alter column team_id type text using team_id::text;

alter table public.ingestion_events
  alter column athlete_id type text using athlete_id::text;

create index if not exists ingestion_events_athlete_idx
  on public.ingestion_events (athlete_id, occurred_at desc)
  where status = 'confirmed';

create index if not exists ingestion_events_team_idx
  on public.ingestion_events (team_id, occurred_at desc)
  where status = 'confirmed';

create index if not exists source_uploads_team_idx
  on public.source_uploads (team_id, created_at desc);
