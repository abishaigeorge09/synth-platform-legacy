# synth. — Database Schema

**Status:** Design-stage spec. The application is being built UI-first with hand-written seed data. No database is provisioned yet. This document is the canonical contract for when backends land so the frontend can swap seed data for live queries without rewriting.

**Authority:** Product spec (coach's full synth. build brief). Cross-referenced with patterns from the rowiq-prototype Supabase schema (teams / profiles / roster_athletes / published_lineups) where they add value.

**Target backend:** Postgres (Supabase). Row-level security (RLS) is assumed everywhere — policies shown per table.

**Naming conventions**

- All tables: `snake_case`, plural (`teams`, `athletes`).
- All columns: `snake_case`.
- Primary keys: `id` (UUID, `gen_random_uuid()`).
- Timestamps: `created_at`, `updated_at` (both `timestamptz`, default `now()`).
- Soft delete: `deleted_at timestamptz null` where reversible.
- JSONB for flexible shapes: `config_json`, `data_json`, `raw_data_json`, etc.
- Foreign keys: `<table_singular>_id` (`team_id`, `athlete_id`).

---

## 1. Identity and team context

### `teams`

One row per coaching program / squad. An athlete or coach belongs to exactly one team at a time in v1 (multi-team support later).

```sql
create table teams (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,                  -- "Cal Women's Rowing"
  sport        text not null,                  -- "rowing" | "soccer" | ...
  invite_code  text not null unique,           -- 6-char, coach can rotate
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on teams (invite_code);
```

### `users`

Coaches and athletes share one identity table. Role determines which experience they see.

```sql
create table users (
  id          uuid primary key default gen_random_uuid(),   -- matches auth.uid() on Supabase
  email       text not null unique,
  name        text not null,
  role        text not null check (role in ('coach', 'athlete', 'staff')),
  team_id     uuid references teams(id) on delete set null,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index on users (team_id);
```

**RLS**: user can read own row; coaches can read all users on their team; athletes can read only themselves and the coach record for their team.

### `athletes`

Sport-specific profile attached to an athlete user. Rowing fields as the v1 concrete example; a `sport_data_json` escape hatch holds sport-specific fields we haven't modeled yet.

```sql
create table athletes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references users(id) on delete cascade,
  team_id         uuid not null references teams(id) on delete cascade,
  side            text check (side in ('port', 'starboard', 'both')),  -- rowing
  weight_lbs      numeric,
  year            text,                                                 -- 'FR' | 'SO' | 'JR' | 'SR' | 'GR'
  status          text not null default 'active' check (status in ('active', 'inactive', 'injured')),
  sport_data_json jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index on athletes (team_id);
```

### `team_settings`

Per-team toggles. Athlete visibility rules live here so coaches can control what their athletes see in System 5 (Athlete View).

```sql
create table team_settings (
  team_id                   uuid primary key references teams(id) on delete cascade,
  athlete_visibility_json   jsonb not null default '{}'::jsonb,
    -- shape: { showTeamStats: bool, showOtherBoats: bool, showCoachNotes: bool,
    --          shareVideos: bool, allowPersonalSources: bool }
  sync_defaults_json        jsonb not null default '{}'::jsonb,
    -- shape: { defaultScanCron: '0 18 * * *', notifyOnStale: true, staleHours: 48 }
  updated_at                timestamptz not null default now()
);
```

### `user_settings`

Per-user preferences (notifications, theme, etc).

```sql
create table user_settings (
  user_id             uuid primary key references users(id) on delete cascade,
  notification_prefs_json jsonb not null default '{}'::jsonb,
  theme               text not null default 'synth',
  updated_at          timestamptz not null default now()
);
```

---

## 2. Sources and syncing (System 3: synth. Agent)

### `sources`

A connected data source — Google Sheet, TeamWorks, Whoop rollup, email digest, manual CSV, or an Extension scan target.

```sql
create table sources (
  id             uuid primary key default gen_random_uuid(),
  team_id        uuid not null references teams(id) on delete cascade,
  created_by     uuid references users(id),
  name           text not null,                              -- "Cal Rowing Google Sheet"
  url            text,                                       -- https://docs.google.com/... or https://app.bridgeathletics.com/...
  type           text not null check (type in (
                    'extension', 'google_sheets', 'google_drive', 'slack',
                    'teamworks', 'wearable', 'email_digest', 'manual_upload'
                  )),
  schedule_cron  text,                                       -- '0 18 * * 1' (Mon 6pm); null = manual/real-time
  last_scan_at   timestamptz,
  status         text not null default 'pending' check (status in (
                    'pending', 'healthy', 'stale', 'failed', 'disconnected'
                  )),
  config_json    jsonb not null default '{}'::jsonb,         -- OAuth tokens (vault-ref), folder ids, channel ids, extension manifest, etc
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index on sources (team_id);
create index on sources (team_id, status);
```

**Provenance rule** (SRS §7.1): every displayed metric must trace back to a `source_id` + `source_data.source_date`. The UI surfaces this via a small "from `<source.name>` · `2m ago`" chip next to every value.

### `scan_logs`

Every scan produces a markdown report and a structured diff summary.

```sql
create table scan_logs (
  id              uuid primary key default gen_random_uuid(),
  source_id       uuid not null references sources(id) on delete cascade,
  scanned_at      timestamptz not null default now(),
  status          text not null check (status in ('success', 'partial', 'failed')),
  duration_ms     integer,
  report_md       text,                                      -- the markdown report
  diff_json       jsonb,                                     -- { added: [], updated: [], removed: [], errors: [] }
  items_added     integer not null default 0,
  items_updated   integer not null default 0,
  items_removed   integer not null default 0
);
create index on scan_logs (source_id, scanned_at desc);
```

### `source_data`

Normalized output from a scan — one row per athlete-tagged datum. This is the canonical store the dashboard reads from.

```sql
create table source_data (
  id            uuid primary key default gen_random_uuid(),
  source_id     uuid not null references sources(id) on delete cascade,
  scan_log_id   uuid references scan_logs(id) on delete set null,
  athlete_id    uuid references athletes(id) on delete cascade,  -- null for team-level data
  data_type     text not null check (data_type in (
                  'erg_score', 'gym_session', 'wellness', 'schedule',
                  'session_result', 'note', 'other'
                )),
  source_date   date not null,                                  -- the date the data describes
  data_json     jsonb not null,                                 -- normalized shape per data_type
  imported_at   timestamptz not null default now()
);
create index on source_data (athlete_id, data_type, source_date desc);
create index on source_data (source_id);
```

**Why not typed tables per data_type?** We keep `source_data.data_json` as a raw stash plus the typed tables below (`erg_scores`, `gym_sessions`, …) for query performance. Scanners write to `source_data` first; a downstream projector fans out into the typed tables. This gives us replayability.

---

## 3. Sessions, lineups, timing (System 4: Custom Tools)

### `sessions`

A practice, race, or erg test. Created by a coach.

```sql
create table sessions (
  id           uuid primary key default gen_random_uuid(),
  team_id      uuid not null references teams(id) on delete cascade,
  coach_id     uuid references users(id),
  date         date not null,
  type         text not null check (type in ('practice', 'race', 'erg_test', 'other')),
  title        text,                                          -- "1V pieces"
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on sessions (team_id, date desc);
```

### `session_boats`

A shell assigned to a session (a session can have multiple boats running pieces in parallel).

```sql
create table session_boats (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions(id) on delete cascade,
  boat_name   text not null,                                  -- "1V", "2V", "Boat A"
  boat_size   integer not null check (boat_size in (1, 2, 4, 8)),
  label       text,                                           -- "8+", "2x", "1x"
  created_at  timestamptz not null default now()
);
create index on session_boats (session_id);
```

### `session_lineups`

Who is in which seat. Published lineups are `is_published = true`; drafts are editable in the Lineups tool.

```sql
create table session_lineups (
  id              uuid primary key default gen_random_uuid(),
  session_boat_id uuid not null references session_boats(id) on delete cascade,
  athlete_id      uuid not null references athletes(id) on delete cascade,
  seat_number     integer not null,                           -- 1 = bow, 8 = stroke in an 8+
  side            text check (side in ('port', 'starboard')),
  is_cox          boolean not null default false,
  is_published    boolean not null default false,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  unique (session_boat_id, seat_number, is_cox)
);
create index on session_lineups (athlete_id);
```

### `session_splits`

Piece times captured by the Session Timer tool.

```sql
create table session_splits (
  id                uuid primary key default gen_random_uuid(),
  session_boat_id   uuid not null references session_boats(id) on delete cascade,
  split_number      integer not null,                         -- 1, 2, 3...
  elapsed_ms        integer not null,                         -- cumulative ms since session start
  interval_ms       integer not null,                         -- ms since previous split
  has_video_marker  boolean not null default false,
  notes             text,
  created_at        timestamptz not null default now()
);
create index on session_splits (session_boat_id, split_number);
```

### `session_media`

Video / audio / photo attachments. `split_markers_json` holds chapter markers so a coach can jump to a specific piece in a long video.

```sql
create table session_media (
  id                 uuid primary key default gen_random_uuid(),
  session_id         uuid not null references sessions(id) on delete cascade,
  session_boat_id    uuid references session_boats(id) on delete cascade,
  file_url           text not null,                           -- storage path
  media_type         text not null check (media_type in ('video', 'audio', 'photo')),
  duration_ms        integer,
  tags_json          jsonb,                                   -- { labels: ['pieces', '2k'] }
  split_markers_json jsonb,                                   -- [{ splitId, tMs, label }]
  created_at         timestamptz not null default now()
);
create index on session_media (session_id);
```

---

## 4. Athlete metric projections

These tables are projections from `source_data` for query-time convenience. The scanner writes once to `source_data`; a projector materializes into these. Querying for "last 10 erg tests by athlete" is one index scan.

### `erg_scores`

```sql
create table erg_scores (
  id            uuid primary key default gen_random_uuid(),
  athlete_id    uuid not null references athletes(id) on delete cascade,
  session_id    uuid references sessions(id),
  source_data_id uuid references source_data(id),
  test_type     text not null check (test_type in ('2k', '6k', '5k', '30min', '60min', 'pieces', 'other')),
  time_seconds  numeric not null,                             -- total elapsed
  split_seconds numeric,                                      -- avg /500m
  spm           integer,                                      -- strokes per minute
  watts         integer,
  distance_m    integer,
  heart_rate    integer,
  date          date not null,
  created_at    timestamptz not null default now()
);
create index on erg_scores (athlete_id, date desc);
create index on erg_scores (athlete_id, test_type, date desc);
```

### `gym_sessions`

```sql
create table gym_sessions (
  id               uuid primary key default gen_random_uuid(),
  athlete_id       uuid not null references athletes(id) on delete cascade,
  source_data_id   uuid references source_data(id),
  session_date     date not null,
  total_sets       integer,
  total_volume_lbs numeric,
  gym_load_score   numeric,                                   -- 0..100 composite
  raw_data_json    jsonb,
  created_at       timestamptz not null default now()
);
create index on gym_sessions (athlete_id, session_date desc);
```

### `gym_exercises`

```sql
create table gym_exercises (
  id              uuid primary key default gen_random_uuid(),
  gym_session_id  uuid not null references gym_sessions(id) on delete cascade,
  exercise_name   text not null,                              -- 'back squat'
  sets            integer,
  reps            integer,
  weight_lbs      numeric,
  notes           text
);
create index on gym_exercises (gym_session_id);
```

### `wellness_checkins`

```sql
create table wellness_checkins (
  id          uuid primary key default gen_random_uuid(),
  athlete_id  uuid not null references athletes(id) on delete cascade,
  date        date not null,
  window      text not null check (window in ('morning', 'post_practice', 'evening')),
  sleep_hours numeric,
  energy      integer check (energy between 1 and 10),
  soreness    integer check (soreness between 1 and 10),
  mood        integer check (mood between 1 and 10),
  hrv         integer,
  recovery    integer check (recovery between 0 and 100),
  notes       text,
  created_at  timestamptz not null default now(),
  unique (athlete_id, date, window)
);
create index on wellness_checkins (athlete_id, date desc);
```

---

## 5. synth. AI (chat history)

### `chat_threads`

A chat is scoped to the whole team (`scope='team'`), a specific athlete (`scope='athlete'`), or an athlete's own data (`scope='self'`).

```sql
create table chat_threads (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references users(id) on delete cascade,
  scope              text not null check (scope in ('team', 'athlete', 'self')),
  scoped_athlete_id  uuid references athletes(id) on delete set null,
  title              text,                                    -- auto-generated from first message
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index on chat_threads (user_id, updated_at desc);
```

### `chat_messages`

```sql
create table chat_messages (
  id          uuid primary key default gen_random_uuid(),
  thread_id   uuid not null references chat_threads(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant', 'system')),
  content     text not null,
  citations_json jsonb,                                        -- [{ source_data_id, excerpt, url }]
  created_at  timestamptz not null default now()
);
create index on chat_messages (thread_id, created_at);
```

---

## 6. Indexes and RLS summary

**Indexes** are declared inline above. Hot query paths covered:

- Dashboard roster load: `athletes (team_id)` + `erg_scores (athlete_id, date desc)` + `wellness_checkins (athlete_id, date desc)`.
- Source health chips: `sources (team_id, status)`.
- Scan history: `scan_logs (source_id, scanned_at desc)`.
- Athlete profile timeline: `sessions (team_id, date desc)` + `session_lineups (athlete_id)` + `erg_scores (athlete_id, test_type, date desc)`.

**RLS policies** (v1 — tighten later):

| Table | Coach (same team) | Athlete (self) | Athlete (teammate) |
|---|---|---|---|
| `teams` | read | read own | — |
| `users` | read + write | read + update self | read (name, avatar) |
| `athletes` | read + write | read self | read per `team_settings.athlete_visibility_json` |
| `sources` | read + write | read if personal; else per settings | — |
| `scan_logs` | read | read own sources | — |
| `source_data` | read | read own | — |
| `sessions` | read + write | read | read |
| `session_boats` | read + write | read | read |
| `session_lineups` | read + write | read self + own boat | read own boat if `showOtherBoats` |
| `session_splits` | read + write | read own boat | read own boat if `showOtherBoats` |
| `session_media` | read + write | read own boat if `shareVideos` | read own boat if `shareVideos` |
| `erg_scores` | read + write | read own | read if `showTeamStats` |
| `gym_sessions` | read + write | read own | — |
| `wellness_checkins` | read + write | read + write own | — |
| `chat_threads` | read + write own | read + write own | — |
| `chat_messages` | read + write own threads | read + write own threads | — |

---

## 7. Seed / demo data mapping

The UI-first build ships with hand-rolled seed data that exactly mirrors this schema. Seed file mapping:

| Table | Seed file | Notes |
|---|---|---|
| `teams` | `src/shared/data/seeds/teams.ts` | Cal Women's Rowing (primary), Cal Men's Rowing (secondary) |
| `users` | `src/shared/data/seeds/users.ts` | coach@berkeley.edu (coach), 52 athlete users |
| `athletes` | `src/shared/data/seeds/athletes.ts` | derived from `rowiqWomensData.ERG_316_2K` |
| `sources` | `src/shared/data/seeds/sources.ts` | 4 connectors from `womensDemoData.WOMENS_CONNECTORS` |
| `scan_logs` | `src/shared/data/seeds/scanLogs.ts` | generated fixtures with realistic `report_md` |
| `source_data` | `src/shared/data/seeds/sourceData.ts` | parsed from the real erg workbooks |
| `erg_scores` | `src/shared/data/seeds/ergScores.ts` | from `ERG_316_2K` + `ERG_317_2K` |
| `sessions` / `session_boats` / `session_lineups` | `src/shared/data/seeds/sessions.ts` | mocked lineup history |
| `wellness_checkins` | `src/shared/data/seeds/wellness.ts` | synthetic 30-day rolling |
| `team_settings`, `user_settings` | `src/shared/data/seeds/settings.ts` | defaults |
| §9 `athlete_timeline_events` (seed) | `src/shared/data/seeds/index.ts` (`SEED_TIMELINE_EVENTS`) | demo timeline rows |
| §9 connector accounts / AI jobs | `src/shared/data/seeds/index.ts` | `SEED_CONNECTOR_ACCOUNTS`, `SEED_AI_IMPORT_JOBS` |

When a backend is wired up, the frontend swaps `src/shared/data/seeds/*` imports for `src/shared/data/queries/*` (TanStack Query hooks hitting Supabase). No component changes required if the TS types in `src/shared/data/types.ts` match this schema.

---

## 8. Open questions

- **Multi-team support**: v1 assumes one team per user. Adding `team_memberships (user_id, team_id, role)` later would enable coaches managing multiple squads.
- **Video storage**: `session_media.file_url` points to object storage (Supabase Storage / S3). Retention and lifecycle policy TBD.
- **Extension auth model**: how the Synth agent (browser extension) authenticates to the backend — scoped service tokens per source is the working assumption; formal threat model open.
- **Data retention / FERPA**: athlete data deletion workflow and audit logging not modeled yet.
- **Bi-directional connectors**: write-back to Google Sheets is in scope for production; see §9 `connector_write_back_queue`.

---

## 9. Ingestion, timeline, and intelligence (production extensions)

This section extends the v1 schema with tables implied by [`docs/DATA_INTELLIGENCE.md`](DATA_INTELLIGENCE.md) and [`docs/SYNTH_AGENT_CONNECTORS_PIPELINE.md`](SYNTH_AGENT_CONNECTORS_PIPELINE.md). Migrations should be added when the Supabase project is provisioned.

### `athlete_timeline_events`

Canonical **event** row: every normalized metric or observation from any connector lands here (see DATA_INTELLIGENCE — Athlete Timeline Model).

```sql
create table athlete_timeline_events (
  id              uuid primary key default gen_random_uuid(),
  team_id         uuid not null references teams(id) on delete cascade,
  athlete_id      uuid not null references athletes(id) on delete cascade,
  occurred_at     timestamptz not null,
  source          text not null,           -- e.g. 'concept2_logbook', 'google_sheets', 'ai_import_photo'
  category        text not null,           -- e.g. 'erg', 'gym', 'wellness', 'session_note'
  data_json       jsonb not null,         -- normalized payload (split_500m in seconds, etc.)
  confidence      numeric not null default 1.0 check (confidence >= 0 and confidence <= 1),
  raw_data_json   jsonb,                 -- original payload for reprocessing
  created_at      timestamptz not null default now()
);
create index on athlete_timeline_events (athlete_id, occurred_at desc);
create index on athlete_timeline_events (team_id, occurred_at desc);
```

### `raw_ingest_payloads`

Immutable blob for AI import or connector pull before normalization.

```sql
create table raw_ingest_payloads (
  id              uuid primary key default gen_random_uuid(),
  team_id         uuid not null references teams(id) on delete cascade,
  kind            text not null check (kind in ('connector_pull', 'ai_photo', 'ai_voice', 'ai_paste', 'manual_csv', 'email_forward')),
  storage_url     text,                    -- object storage pointer when large
  body_preview    text,                   -- truncated text or base64 header
  body_hash       text,                   -- sha256 for dedupe
  status          text not null default 'pending' check (status in ('pending', 'parsed', 'failed')),
  error_message   text,
  created_at      timestamptz not null default now()
);
create index on raw_ingest_payloads (team_id, created_at desc);
```

### `connector_accounts`

OAuth or API credentials metadata per team (secrets **never** in this table — use vault / `auth.users` metadata / Edge Function secrets).

```sql
create table connector_accounts (
  id              uuid primary key default gen_random_uuid(),
  team_id         uuid not null references teams(id) on delete cascade,
  provider        text not null,           -- 'google_sheets', 'google_calendar', 'concept2', 'strava', ...
  external_account_id text,
  display_name    text,
  scopes_granted  text[],
  status          text not null default 'connected' check (status in ('connected', 'expired', 'revoked', 'error')),
  last_sync_at    timestamptz,
  config_json     jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (team_id, provider, external_account_id)
);
```

### `sync_runs`

Per-connector job history (replaces ad-hoc `scan_logs` for unified reporting; `scan_logs` may remain for legacy UI until migrated).

```sql
create table sync_runs (
  id              uuid primary key default gen_random_uuid(),
  team_id         uuid not null references teams(id) on delete cascade,
  connector_account_id uuid references connector_accounts(id) on delete set null,
  source_id       uuid references sources(id) on delete set null,
  started_at      timestamptz not null default now(),
  finished_at     timestamptz,
  status          text not null check (status in ('running', 'success', 'partial', 'failed')),
  stats_json      jsonb,                  -- items_added, items_updated, bytes, etc.
  log_md          text
);
create index on sync_runs (team_id, started_at desc);
```

### `identity_aliases`

Coach-confirmed mapping from an external label to `athlete_id` (DATA_INTELLIGENCE — name matching).

```sql
create table identity_aliases (
  id              uuid primary key default gen_random_uuid(),
  team_id         uuid not null references teams(id) on delete cascade,
  athlete_id      uuid not null references athletes(id) on delete cascade,
  provider        text not null,
  external_label  text not null,
  confidence      numeric,
  confirmed_at    timestamptz not null default now(),
  unique (team_id, provider, external_label)
);
```

### `identity_match_queue`

Unmatched or low-confidence candidates awaiting coach action.

```sql
create table identity_match_queue (
  id              uuid primary key default gen_random_uuid(),
  team_id         uuid not null references teams(id) on delete cascade,
  provider        text not null,
  external_label  text not null,
  suggested_athlete_id uuid references athletes(id) on delete set null,
  confidence      numeric not null,
  status          text not null default 'open' check (status in ('open', 'confirmed', 'dismissed')),
  payload_ref     uuid references raw_ingest_payloads(id) on delete set null,
  created_at      timestamptz not null default now()
);
create index on identity_match_queue (team_id, status, created_at desc);
```

### `source_priority_overrides`

Per-team ordering when two sources conflict (DATA_INTELLIGENCE — source priority).

```sql
create table source_priority_overrides (
  team_id         uuid not null references teams(id) on delete cascade,
  source_key      text not null,
  priority        integer not null check (priority >= 1 and priority <= 99),
  primary key (team_id, source_key)
);
```

### `metric_snapshots`

Materialized scores for dashboard / athlete cards (training load, recovery, risk tier, data quality).

```sql
create table metric_snapshots (
  id              uuid primary key default gen_random_uuid(),
  team_id         uuid not null references teams(id) on delete cascade,
  athlete_id      uuid not null references athletes(id) on delete cascade,
  as_of           timestamptz not null,
  kind            text not null,           -- 'training_load', 'recovery', 'risk', 'data_quality', ...
  value_json      jsonb not null,
  unique (athlete_id, kind, as_of)
);
create index on metric_snapshots (team_id, kind, as_of desc);
```

### `alert_instances`

Generated alerts (may overlap conceptually with existing `alerts` seed; consolidate at migration time).

```sql
create table alert_instances (
  id              uuid primary key default gen_random_uuid(),
  team_id         uuid not null references teams(id) on delete cascade,
  athlete_id      uuid references athletes(id) on delete cascade,
  severity        text not null check (severity in ('info', 'warning', 'danger')),
  kind            text not null,
  title           text not null,
  detail          text not null,
  factor_json     jsonb,
  created_at      timestamptz not null default now(),
  acknowledged_at timestamptz,
  resolved_at     timestamptz
);
create index on alert_instances (team_id, created_at desc);
```

### `extension_waitlist_signups`

Email capture for browser extension (SYNTH_AGENT_CONNECTORS_PIPELINE).

```sql
create table extension_waitlist_signups (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  team_id         uuid references teams(id) on delete set null,
  created_at      timestamptz not null default now(),
  unique (email)
);
```

### `ai_import_jobs`

Tracks AI import pipeline runs (photo / voice / paste) with preview/confirm.

```sql
create table ai_import_jobs (
  id              uuid primary key default gen_random_uuid(),
  team_id         uuid not null references teams(id) on delete cascade,
  kind            text not null check (kind in ('photo', 'voice', 'paste')),
  status          text not null default 'pending' check (status in ('pending', 'preview', 'confirmed', 'failed', 'cancelled')),
  raw_payload_id  uuid references raw_ingest_payloads(id) on delete set null,
  preview_json    jsonb,
  confirmed_at    timestamptz,
  created_at      timestamptz not null default now()
);
```

### `connector_write_back_queue`

Async write-back to Google Sheets or other destinations (sessions, lineups, wellness).

```sql
create table connector_write_back_queue (
  id              uuid primary key default gen_random_uuid(),
  team_id         uuid not null references teams(id) on delete cascade,
  connector_account_id uuid not null references connector_accounts(id) on delete cascade,
  target_ref      text not null,          -- spreadsheet id + range or sheet name
  op              text not null check (op in ('append_row', 'update_cell', 'batch')),
  payload_json    jsonb not null,
  status          text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  error_message   text,
  created_at      timestamptz not null default now(),
  processed_at    timestamptz
);
create index on connector_write_back_queue (team_id, status, created_at);
```

### RLS note

All §9 tables follow the same team boundary as §6: coaches read/write rows where `team_id` matches their team; athletes read rows where `athlete_id` is self when applicable. Lock down `raw_ingest_payloads` and `connector_accounts` to coach/staff roles only.

