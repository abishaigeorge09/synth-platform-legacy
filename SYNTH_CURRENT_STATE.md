# SYNTH_CURRENT_STATE.md

A snapshot of synth-platform as of 2026-05-15, prepared for handoff to the architect designing the new Python + Go backend.

This document is descriptive, not aspirational. It reports what is in the code today. Where the code is silent or contradictory, that is flagged. All file paths are relative to repo root `/Users/abishaigeorgegosula/synth-platform`.

---

## 1. Repo Layout

```
.
├── .claude/                       Claude Code agents + commands + skills (project-local)
├── .github/                       CI workflows
│   └── workflows/
│       ├── ci.yml                 lint + build + test on push/PR to main
│       ├── claude.yml             Claude-PR-review bot
│       └── claude-code-review.yml Claude-PR-review bot
├── .vercel/                       Vercel deploy linkage (project: synth-platform-alt)
├── app/                           ONE FILE ONLY — `app/CLAUDE.md` doc for the /app surface
├── coach_tools_images/            DUPLICATE of public/coach_tools_images — flag to remove
├── docs/                          15 markdown product/schema/RLS docs
├── public/                        PWA icons, mockups, team photos, source-tool screenshots
├── scripts/                       generate-icons.mjs (sharp-based PWA icon build)
├── src/                           application source (see below)
├── supabase/                      4 migrations + 4 edge functions
└── synth-pack/                    UNINTEGRATED multi-agent build scaffold (gitignored)
```

### `src/` (active)

```
src/
├── app/                           routes.tsx (single source of route truth) + routePrefetch.ts
├── assets/                        small image/svg assets
├── components/                    shared chat UI (CoachTeamMessaging, MockTeamChat) +
│                                  layer-dashboard mockup + advance gate
├── features/                      ACTIVE feature trees (see split below)
│   ├── app/                       NEW mobile-first product surface — /app/* routes
│   ├── athlete/                   LEGACY athlete prototype — /athlete/* routes
│   ├── auth/                      Sign in/up + invite-code redemption
│   ├── coach/                     LEGACY coach prototype — /coach/* routes
│   ├── gate/                      AccessGate (segmented passcode lock) — global wrapper
│   ├── landing/                   Public landing + PWA install
│   ├── notFound/                  404
│   └── productDemo/               Public demo surface (/product-demo)
├── lib/                           Cross-cutting libs (see below)
│   ├── ai/                        claude.ts, directClient.ts, ingestionContext.ts, publishedTools.ts, toolGenerateClient.ts
│   ├── ingest/                    sheetsClient.ts, uploadClient.ts, athleteMatch.ts (+ 1 test)
│   ├── stream/                    Stream Chat client + token helpers
│   ├── tools/                     Tool registry, resolver, mockGenerator, ToolRenderer (+ 6 tests)
│   ├── supabaseClient.ts          Single browser Supabase client (canonical)
│   ├── authBridge.ts              Auth listener → useAuthStore
│   ├── sentry.ts                  Scaffold only — no SDK installed
│   └── theme.ts, motion.ts, featureFlags.ts
├── prototype/                     LEGACY — original Pacific Women's prototype, kept as seed source
└── shared/                        Cross-feature primitives
    ├── analytics/                 PostHog wrapper
    ├── components/                Avatar, WritebackConfirmBar, PageTitle, etc.
    ├── data/                      types.ts (canonical) + seeds + query hooks
    ├── illustrations/             custom SVG nav glyphs
    ├── intelligence/              metrics.ts (stubbed) + digestScheduler.ts (placeholder)
    ├── layout/                    CoachLayout, AthleteLayout, Sidebar, MobileSidebarDrawer, AgentModalPortal, RightPanel
    ├── store/                     20 Zustand stores (legacy + cross-cutting)
    └── tutorial/                  Guided-tour state + UI
```

### `supabase/`

```
supabase/
├── functions/
│   ├── claude-chat/index.ts       Anthropic /v1/messages proxy + demo cap
│   ├── ingest/index.ts            File ingestion (parse / confirm)
│   ├── sheets-sync/index.ts       Google Sheets connector (connect / fetch / disconnect)
│   └── tool-generate/index.ts     Vibe-code tool generator (Opus 4.7)
└── migrations/
    ├── 20260505_demo_usage.sql            demo_usage (AI rate-limit counter)
    ├── 20260507_ingestion.sql             source_uploads + ingestion_events + uploads bucket
    ├── 20260507_ingestion_id_text.sql     loosens team_id/athlete_id from uuid → text
    └── 20260513_coach_team_on_signup.sql  handle_new_auth_user trigger + users/teams RLS
```

### Flags (folders that need attention before the rewrite)

| Path | Status | Note |
|---|---|---|
| `synth-pack/` | uncommitted, not in product | Multi-agent build scaffolding dropped at root; gitignored. Belongs in a sibling repo or in `~/.claude`. |
| `coach_tools_images/` | duplicate | Mirrored verbatim under `public/coach_tools_images/`. Root copy is dead weight. |
| `src/prototype/` | legacy, still wired | The original standalone Pacific Women's demo. `src/shared/data/seeds/` imports from it; cannot delete without first re-rooting seeds. |
| `src/features/coach/`, `src/features/athlete/` | legacy prototype | Older `/coach/*` and `/athlete/*` surface. **Still ships.** The new product surface is `/app/coach/*` and `/app/athlete/*` under `src/features/app/`. Every page now exists in two places. |
| Root scratch files | clutter | `STATUS_REPORT.md` (35 KB), `SYNTH_VIBECODE_MASTER_PLAN.md` (26 KB), `SYNTH_VIBECODE_REVIEW_RUBRIC.md`, `SYNTH_MVP_MANUAL_SETUP.md`, `.resume-log.md` (99 KB), `handoff.md`, `PR_BODY.md`, `posthog-setup-report.md`. Some duplicate `docs/`; `SYNTH_MVP_MANUAL_SETUP.md` is the only place the Supabase project ref is recorded. |
| `app/CLAUDE.md` | docs only | The folder contains just a documentation file describing the `/app` surface. Not abandoned — but easy to mistake for a routes folder (Next.js style). |

---

## 2. Frontend Application Map

Three product surfaces ship in one bundle:

- **Legacy `/coach/*`** — desktop-first prototype in `src/features/coach/**`
- **Legacy `/athlete/*`** — desktop-first prototype, every page exported from one file `src/features/athlete/athleteAppPages.tsx`
- **New `/app/coach/*` and `/app/athlete/*`** — mobile-first product surface in `src/features/app/**`. Onboarding lives at `/app/onboarding/*`.

**Live Supabase usage is limited to a small subset of routes.** Live table reads: `users`, `teams`, `ingestion_events`, `source_uploads`, `tool_versions`. Live table writes: `tool_versions` only. Live writes to Storage: the `uploads` bucket (via `AgentModalPortal`). Everything else on screen reads seed or mock data.

### Public routes

| Path | Component | What it does | Reads | Writes | Stores | Edge fns |
|---|---|---|---|---|---|---|
| `/` | `src/features/landing/LandingPage.tsx` | Public marketing landing with hero, step mockups, PWA install prompt. | none | none | none | none |
| `/product-demo` | `src/features/productDemo/ProductDemoPage.tsx` | Static demo page with deep links into coach/athlete surfaces. | none | none | none | none |
| `/login` | `src/features/auth/LoginPage.tsx` | Email/password + Google OAuth sign-in via `supabase.auth.signInWithPassword`/`signInWithOAuth`. | none (auth only) | none | none | none |
| `/signup` | `src/features/auth/SignUpPage.tsx` | Two-step sign-up calling `supabase.auth.signUp`; users row populated server-side via `handle_new_auth_user`. | none (auth only) | none | none | none |
| `/join/:code` | `src/features/auth/JoinWithInvitePage.tsx` | Athlete invite-code entry — fires PostHog event, navigates to `/athlete/home`. **Does not validate the code.** | none | none | none | none |
| `*` | `src/features/notFound/NotFoundPage.tsx` | 404. | none | none | none | none |

### `/coach/*` (legacy — wrapped by `CoachLayout`, which mounts the `AgentModalPortal`)

| Path | Component | What it does | Reads | Writes | Stores | Edge fns |
|---|---|---|---|---|---|---|
| `/coach` | redirect → `/coach/dashboard` | — | — | — | — | — |
| `/coach/dashboard` | `src/features/coach/dashboard/DashboardPage.tsx` | Stats strip, source health, Recharts trends, roster preview, alerts, AI insight. | none (seed) | none | none | none |
| `/coach/athletes` | `src/features/coach/athletes/AthletesPage.tsx` | 46-card roster grid with status overrides. | none (seed) | none | `useRosterOverridesStore`, `useToastStore` | none |
| `/coach/athletes/compare` | `src/features/coach/athletes/AthleteComparePage.tsx` | Side-by-side athlete comparison from `?ids=` param. | none (seed) | none | none | none |
| `/coach/athletes/:athleteId` | `src/features/coach/athletes/AthleteProfilePage.tsx` | YoY chart, sessions/lineups/wellness tabs, coach notes, right-panel chat/compare. | none (seed) | none | `useCoachNotesStore`, `useRightPanelStore`, `useAvatarStore` | none |
| `/coach/athletes/:athleteId/ai` | `src/features/coach/ai/AthleteScopedChatPage.tsx` | Athlete-scoped Claude chat (shared `ChatView`). | `ingestion_events`, `source_uploads` (via `buildIngestionContext`) | none | `useChatStore`, `useTeamStore` | `claude-chat` |
| `/coach/sources` | redirect → `/coach/sources/connectors` | — | — | — | — | — |
| `/coach/sources/connectors` | `src/features/coach/sources/SourcesPage.tsx` | Connector grid + scan history; "Add source" opens the AgentModalPortal. | `source_uploads`, `ingestion_events` | (indirect via AgentModalPortal) | `useUiStore`, `useToastStore` | `ingest`, `sheets-sync` (via AgentModalPortal) |
| `/coach/sources/data-view` | `src/features/coach/sources/ConnectorsDataViewPage.tsx` | Tabbed connector data viewer + AI Import. | none (seed) | none | `useToastStore` | none |
| `/coach/tools/lineups` | `src/features/coach/tools/lineups/LineupsPage.tsx` | dnd-kit boat builder + race-timer + history + insights tabs. | none (seed) | none | `useLineupsStore`, `useSessionTimerStore`, `useToastStore` | none |
| `/coach/tools/session-timer` | `src/features/coach/tools/sessionTimer/SessionTimerPage.tsx` | RAF stopwatch, multi-boat splits, video stub. | none (seed) | none | `useSessionTimerStore` | none |
| `/coach/ai` | `src/features/coach/ai/TeamChatPage.tsx` | Team-wide Claude chat (shared `ChatView`). | `ingestion_events`, `source_uploads` (via `buildIngestionContext`) | none | `useChatStore`, `useTeamStore` | `claude-chat` |
| `/coach/settings` | `src/features/coach/settings/SettingsPage.tsx` | Team metadata + visibility toggles + sync defaults + theme. | none (seed) | none | `useTeamStore`, `useThemeStore`, `useToastStore` | none |

### `/athlete/*` (legacy — all pages exported from `src/features/athlete/athleteAppPages.tsx`)

| Path | Component | What it does | Reads | Writes | Stores | Edge fns |
|---|---|---|---|---|---|---|
| `/athlete` | redirect → `/athlete/today` | — | — | — | — | — |
| `/athlete/{home,stats,ai,sources}` | redirects to today/progress/chat/sources/connectors respectively | back-compat aliases | — | — | — | — |
| `/athlete/today` | `MyDashboardPage` | Star Miller's Today screen: schedule, status, lineup card, team messages. | none (mock) | none | `useAthleteMediaStore`, `useToastStore`, `useThemeStore`, `useLineupsStore`, `useSessionTimerStore`, `useVisibilitySettings`, internal `useTeamMsgStore` | none |
| `/athlete/progress` | `MyStatsPage` | Personal stats + Recharts erg chart + goals. | none (mock) | none | (shared) | none |
| `/athlete/record` | `MyRecordPage` | Score capture / record-mode UI (camera stub). | none (mock) | none | (shared) | none |
| `/athlete/workbook` | `MyWorkbookPage` | Erg workbook Sheets-style table. | none (mock) | none | (shared) | none |
| `/athlete/sessions` | `MySessionsPage` | Personal session history. | none (mock) | none | (shared) | none |
| `/athlete/lineups` | `MyLineupsPage` | Personal lineup history. | none (mock) | none | `useLineupsStore` | none |
| `/athlete/sources/connectors` | `AthleteSourcesConnectorsPage` | Athlete-owned connector list with localStorage-persisted state. | none (mock) | none | (shared) | none |
| `/athlete/sources/data-view` | `AthleteSourcesDataViewPage` | Connector data tabs (Concept2, Strava, inference log, workflow canvas). | none (mock) | none | (shared) | none |
| `/athlete/chat` | `MyChatPage` | **Canned-response chat — no real AI.** | none | none | (shared) | none |
| `/athlete/settings` | `MySettingsPage` | Theme + visibility. | none (mock) | none | `useThemeStore`, `useVisibilitySettings` | none |

### `/app/*` (new mobile App)

| Path | Component | What it does | Reads | Writes | Stores | Edge fns |
|---|---|---|---|---|---|---|
| `/app` (index) | `src/features/app/AppRoleGate.tsx` | Routes to `/app/welcome` / onboarding / coach home / athlete home based on auth + role. | none | none | `useAppAuthStore` | none |
| `/app/welcome` | `src/features/app/onboarding/WelcomePage.tsx` | Welcome card with three CTAs (Google + email both not wired; demo path). | none | none | `useAppAuthStore` | none |
| `/app/coming-soon` | `src/features/app/onboarding/ComingSoonPage.tsx` | Holding page after waitlist. | none | none | `useAppAuthStore` | none |
| `/app/onboarding/role` | `RolePickPage` | Coach vs athlete; writes role to localStorage. | none | none | `useAppAuthStore` | none |
| `/app/onboarding/sport` | `SportPickPage` | Sport selection. | none | none | `useOnboardingStore` | none |
| `/app/onboarding/team` | `CoachTeamSetupPage` | Coach team name + roster band. | none | none | `useOnboardingStore` | none |
| `/app/onboarding/capabilities` | `CoachCapabilitiesPage` | Coach capability toggles. | none | none | `useOnboardingStore` | none |
| `/app/onboarding/sources/coach` | `CoachConnectorsPage` | Coach connector picker. | none | none | `useOnboardingStore` | none |
| `/app/onboarding/invite-code` | `AthleteInviteCodePage` | Athlete enters code into `useOnboardingStore.inviteCode`. **Does not validate.** | none | none | `useOnboardingStore` | none |
| `/app/onboarding/sources/athlete` | `AthleteConnectorsPage` | Athlete picks own connectors. | none | none | `useOnboardingStore` | none |
| `/app/onboarding/trust` | `TrustCardPage` | Privacy copy card. | none | none | none | none |
| `/app/onboarding/scanning` | `ScanningPage` | Animated "scanning your sources" (mock). | none | none | `useAppAuthStore`, `useOnboardingStore` | none |
| `/app/onboarding/reveal` | `RevealPage` | "synth is ready" summary screen. | none | none | `useAppAuthStore`, `useOnboardingStore` | none |
| `/app/onboarding/tour` | `TourPage` | Marks onboarding complete + starts guided tour. | none | none | `useAppAuthStore`, `useGuidedTourStore` | none |
| `/app/coach` (index) | redirect → `/app/coach/home` | — | — | — | — | — |
| `/app/coach/home` | `src/features/app/coach/HomePage.tsx` | Mobile home: hero panel, calendar strip, quick actions. | none | none | `useUiStore`, `useAppAuthStore` | none |
| `/app/coach/attention` | `AttentionPage` | "Needs attention" list pairing seeded signals with live athletes. | none (seed) | none | `useAttentionItems` (data hook) | none |
| `/app/coach/roster` | `RosterPage` | Mobile roster grid. | none (seed) | none | none | none |
| `/app/coach/athlete/:athleteId` | `AthleteDetailPage` | Mobile athlete detail with 8 tabs. | none (seed) | none | `useToastStore` | none |
| `/app/coach/capture` | `CapturePage` | Capture entrypoint (camera/mic/text/email) + Aurora voice overlay. **Saved items only go to local UI list; not posted to ingest.** | none | none | none | none |
| `/app/coach/ai` | `AIPage` | Coach Claude chat with scope picker, customisation, demo cap. | none | none | `useAppAuthStore`, `useDemoUsage`, `useAIChatCustomization` | `claude-chat` |
| `/app/coach/lineups` | `LineupsPage` | Mobile lineup builder + sessions list. | none (seed) | none | `useLineupBuilderStore`, `useSessionsStore` | none |
| `/app/coach/tools` | `CustomToolsPage` | Tool catalog: installed + community + team-published. | `tool_versions` (`fetchPublishedTeamTools`) | none | `useInstalledToolsStore`, `useCoachContextStore`, `useToastStore` | none |
| `/app/coach/tools/build`, `…/build/:chatId` | `ToolsBuildPage` | Conversational tool-builder via `tool-generate` Edge Function, publishes via `tool_versions` update. | `users` (`useCoachContextStore.hydrate`) | `tool_versions` (publish) | `useChatSessionsStore`, `useInstalledToolsStore`, `useCoachContextStore`, `useToastStore` | `tool-generate`, `claude-chat` |
| `/app/coach/tools/stopwatch` | `StopwatchPage` | Built-in race-recorder with split capture. | none | none | none | none |
| `/app/coach/tools/:slug` | `ToolFullscreenPage` | Generic fullscreen wrapper for an installed tool spec. | none | none | `useInstalledToolsStore`, `useChatSessionsStore` | none |
| `/app/coach/sessions/:id` | `SessionDetailPage` | Session detail with run rows + mark-complete. | none | none | `useSessionsStore` | none |
| `/app/coach/sessions/:id/timer` | `SessionTimerPage` | Live session timer, appends runs. | none | none | `useSessionsStore` | none |
| `/app/coach/notes` | `NotesPage` | Mock coach notes list. | none (mock) | none | none | none |
| `/app/coach/sources` | redirect → `…/connectors` | — | — | — | — | — |
| `/app/coach/sources/connectors` | `SourcesPage` | Mobile connectors list with permissions sheet. **Connect = localStorage flag only — no OAuth.** | none | none (localStorage) | `useSourcesStore` | none |
| `/app/coach/sources/data-view` | `SourcesDataViewPage` | Tabbed mobile data view (Concept2, Strava, Apple Health, Sheets, AI Import…). | none (seed) | none | none | none |
| `/app/coach/settings` | `SettingsPage` | Account, tutorial replay, sign-out. | none | none | `useAppAuthStore`, `useTutorialStore`, `useToastStore` | none |
| `/app/athlete` (index) | redirect → `/app/athlete/home` | — | — | — | — | — |
| `/app/athlete/home` | `HomePage` | Athlete mobile home. | none | none | `useUiStore` | none |
| `/app/athlete/capture` | `CapturePage` | Athlete capture entrypoint. | none | none | none | none |
| `/app/athlete/erg-pacer` | `ErgPacerPage` | Erg pacer with target split + progress viz. | none | none | none | none |
| `/app/athlete/ai` | `AIPage` | Athlete Claude chat with demo cap + customisation. | none | none | `useAppAuthStore`, `useDemoUsage`, `useAIChatCustomization` | `claude-chat` |
| `/app/athlete/notes` | `NotesPage` | Athlete personal notes (mock). | none | none | none | none |
| `/app/athlete/sources` | `SourcesPage` | Athlete connector list (mock). | none | none | none | none |
| `/app/athlete/settings` | `SettingsPage` | Tutorial replay, sign-out. | none | none | `useAppAuthStore`, `useTutorialStore`, `useToastStore` | none |
| `/app/athlete/telemetry` | `TelemetryPage` | Personal telemetry charts (mock). | none | none | `useToastStore` | none |
| `/app/athlete/profile` | `MyProfilePage` | Athlete profile screen. | none | none | `useToastStore` | none |
| `/app/athlete/tools` | `AthleteToolsPage` | Athlete-side tools catalog. | none | none | `useToastStore` | none |
| `/app/athlete/attention` | `AthleteAttentionPage` | Athlete-side attention list (mock). | none | none | none | none |
| `/app/athlete/form-video` | `FormVideoPage` | Form-video recording + review. | none | none | `useToastStore` | none |

---

## 3. Supabase Schema

### Tables fully defined in repo migrations

#### `public.demo_usage` (`20260505_demo_usage.sql`)
- Columns: `user_id uuid NOT NULL`, `date date NOT NULL`, `message_count integer NOT NULL DEFAULT 0`, `updated_at timestamptz NOT NULL DEFAULT now()`
- Primary key: composite `(user_id, date)`
- Foreign keys: `user_id → auth.users(id) ON DELETE CASCADE`
- RLS (3 policies, no delete by design): `auth.uid() = user_id` on SELECT/INSERT/UPDATE
- Indexes: none extra (PK is the lookup index)
- Triggers: none
- Frontend writes: **none directly** — only the `claude-chat` Edge Function reads/writes this table.
- Row volume: ~1 row per (anonymous user, UTC day). Tiny.

#### `public.source_uploads` (`20260507_ingestion.sql`, mutated by `20260507_ingestion_id_text.sql`)
- Columns: `id uuid PK`, `team_id text NOT NULL` *(originally uuid, loosened)*, `uploaded_by uuid NOT NULL`, `storage_path text`, `filename text`, `mime_type text`, `size_bytes bigint`, `kind text CHECK ('csv','xlsx','pdf','image','paste')`, `status text DEFAULT 'pending' CHECK ('pending','parsing','preview','confirmed','failed','cancelled')`, `parse_error text`, `events_extracted int`, `events_confirmed int`, `created_at`, `updated_at`
- Foreign keys: `uploaded_by → auth.users(id) ON DELETE CASCADE`
- RLS (4 policies): `auth.uid() = uploaded_by` on SELECT/INSERT/UPDATE/DELETE
- Indexes: `(uploaded_by, created_at DESC)`, `(team_id, created_at DESC)`
- Triggers: `source_uploads_set_updated_at` BEFORE UPDATE → `tg_set_updated_at()`
- Frontend writes: `src/shared/data/queries/useIngestionQueries.ts`, `src/lib/ai/ingestionContext.ts`
- Row volume: low. Tied to coach manual file drops + Google Sheets exports.

#### `public.ingestion_events` (`20260507_ingestion.sql`, mutated by `20260507_ingestion_id_text.sql`)
- Columns: `id uuid PK`, `team_id text`, `athlete_id text` *(nullable; not a real FK after loosening)*, `source_upload_id uuid NOT NULL`, `occurred_at timestamptz`, `category text CHECK ('erg','gym','wellness','session_note','water','cross_training','sleep','hrv','other')`, `metric text`, `value numeric`, `value_text text`, `unit text`, `athlete_name_raw text`, `extraction_confidence numeric`, `match_confidence numeric`, `raw jsonb`, `status text DEFAULT 'preview' CHECK ('preview','confirmed','rejected')`, `created_at`
- Foreign keys: `source_upload_id → public.source_uploads(id) ON DELETE CASCADE`
- RLS (4 policies): all delegate via `EXISTS (SELECT 1 FROM source_uploads su WHERE su.id = ingestion_events.source_upload_id AND su.uploaded_by = auth.uid())`
- Indexes (partial, status='confirmed'): `(athlete_id, occurred_at DESC)`, `(team_id, occurred_at DESC)`, plus full `(source_upload_id)`
- Frontend writes: `src/shared/data/queries/useIngestionQueries.ts`, `src/lib/ai/ingestionContext.ts`
- Row volume: depends on adoption — one row per extracted line item. Indexed for typical "athlete timeline" + "team timeline" queries.

### Database functions + triggers

- **`public.tg_set_updated_at()`** — plpgsql, sets `NEW.updated_at = now()`. Attached as `source_uploads_set_updated_at` BEFORE UPDATE on `public.source_uploads`.
- **`public.handle_new_auth_user()`** — plpgsql `SECURITY DEFINER` (defined in `20260513_coach_team_on_signup.sql`). Branches on `new.is_anonymous`:
  1. Anonymous → inserts `users(role='head_coach', team_id='da7025df-4c74-4b48-bd86-89e0e0a8f34e')` *(hard-coded shared demo team)*.
  2. Real coach (`meta.role='head_coach'`) → creates a new `teams` row with an 8-char uppercase hex `invite_code`, then inserts `users(role='head_coach', team_id=new_team_id)`.
  3. Real athlete → inserts `users(role)` **with no `team_id`** (the comment says "they'll get a team_id when they redeem an invite code" — that redemption code does not exist).
- **CRITICAL GAP:** the `CREATE TRIGGER ... AFTER INSERT ON auth.users` binding is missing from the migrations folder. The function is `CREATE OR REPLACE`d, but no `CREATE TRIGGER` statement attaches it. The trigger must be bound in an untracked baseline migration or via the Supabase dashboard.

### Tables referenced by code but NOT defined in repo migrations

These tables are read/written by the frontend or edge functions but have no `CREATE TABLE` in any of the four migration files. They likely exist from a baseline migration that isn't checked in, or were created manually in the Supabase dashboard.

#### `public.users` — RLS added in 20260513, table itself not defined here
Inferred shape (from the trigger function and frontend reads):
- `id uuid PK` (matches `auth.users.id`)
- `email text`, `name text`
- `role text` (seen values: `'head_coach'`, `'assistant_coach'`, `'athlete'`)
- `team_id uuid` nullable, FK to `public.teams.id`
- RLS: `"users own select"` USING `id = auth.uid()`; `"users own update"` USING `id = auth.uid()`
- Frontend uses: `useCoachContext.ts`, `useTeamStore.ts`, `authBridge.ts`; sheets-sync and tool-generate edge functions also read `team_id` + `role`.

#### `public.teams` — RLS added in 20260513, table not defined here
Inferred shape:
- `id uuid PK` (default `gen_random_uuid()`)
- `name text`, `sport text` (default `'rowing'`), `invite_code text` (8-char uppercase hex)
- RLS: `"teams own select"` via `EXISTS (users.team_id = teams.id)`; `"teams coach update"` via same plus `role='head_coach'`.
- Frontend uses: `useTeamStore.ts`.
- Hard-coded demo team UUID: `da7025df-4c74-4b48-bd86-89e0e0a8f34e`.

#### `public.connector_accounts` — NOT IN ANY MIGRATION
Inferred from `sheets-sync` and `tool-generate`:
- Columns: `id`, `team_id`, `provider text`, `external_account_id text`, `display_name text`, `scopes_granted jsonb`, `status text` (`'connected' | 'revoked'`), `config_json jsonb`, `last_sync_at timestamptz`
- Effective uniqueness on `(team_id, provider)` — sheets-sync defensively does select-then-upsert.
- Frontend uses: **none directly**. All access goes through `sheets-sync`.
- **This table will fail at runtime if it doesn't exist in production. Verify with the live project.**

#### `public.tool_requests` — NOT IN ANY MIGRATION
Inferred from `tool-generate`:
- `id uuid`, `user_id uuid`, `team_id uuid`, `description text`, `role text`, `status text`
- Frontend uses: none directly. Inserted by `tool-generate`.

#### `public.tool_versions` — NOT IN ANY MIGRATION
Inferred from `tool-generate` + `lib/ai/publishedTools.ts`:
- `id uuid`, `tool_request_id uuid`, `team_id uuid`, `spec_json jsonb`, `schema_version int`, `turn_number int`, `prompt text`, `summary text`, `unmet_connectors jsonb`, `kind text` (`'spec' | 'clarification' | 'declined'`), `created_by uuid`, `published bool`, `published_at timestamptz`, `published_by uuid`
- Frontend uses: `src/lib/ai/publishedTools.ts` (publish/unpublish/fetch).

#### `public.athletes` — NOT IN ANY MIGRATION
Inferred from `ingest/index.ts` (`loadRoster`):
- Reads `id, name` filtered by `team_id` + `status='active'`. The ingest function wraps the query in try/catch and falls back to an empty roster if the table doesn't exist.
- Frontend uses: none directly.

### Storage buckets

#### `uploads` — defined in `20260507_ingestion.sql`
- **Private** (`public: false`)
- Path convention: `{auth.uid()}/{upload_id}.{ext}`. The first path segment must equal the caller's UUID. Enforced both server-side in `ingest` (403 if mismatch) and via Storage RLS using `(storage.foldername(name))[1] = auth.uid()::text`.
- RLS on `storage.objects` (SELECT/INSERT/DELETE; no UPDATE — `ingest` never updates bytes, new versions get new keys).
- Contents: coach manual file drops from the synth. Agent modal (CSV, XLSX, PDF, image), plus Google Sheets CSV exports written server-side by `sheets-sync`.

### Edge Functions

#### `claude-chat` (`supabase/functions/claude-chat/index.ts`, 201 lines)
- **Purpose:** Server-side proxy to Anthropic `/v1/messages`. Restricts `model` to a hardcoded allowlist, clamps `max_tokens ≤ 4096`, forwards `tools` + `tool_choice` for function-calling, supports SSE streaming pass-through. Enforces a 30-message-per-UTC-day cap on anonymous (`is_anonymous`) users via `public.demo_usage`. Real users are uncapped.
- **POST body:** `{ messages: any[], model?: string, max_tokens?: number, stream?: boolean, system?, temperature?, tools?, tool_choice? }`
- **Model allowlist (May 2026):** `claude-haiku-4-5-20251001`, `claude-sonnet-4-6`, `claude-opus-4-7` (plus three legacy IDs).
- **External APIs:** Anthropic `POST https://api.anthropic.com/v1/messages` (header `anthropic-version: 2023-06-01`).
- **Secrets:** `ANTHROPIC_API_KEY` (required), `SUPABASE_URL`, `SUPABASE_ANON_KEY` (cap check; fails open if missing).
- **verify_jwt:** ON (comment in code; no `supabase/config.toml` exists to confirm declaratively).
- **Frontend callers:** `src/lib/ai/claude.ts` (`streamClaudeMessages`); used by `src/features/app/lib/aiClient.ts`, both `/app/{coach,athlete}/ai`, the legacy `/coach/ai` and `/coach/athletes/:id/ai`.

#### `ingest` (`supabase/functions/ingest/index.ts`, 802 lines)
- **Purpose:** File ingestion pipeline. Two `action`s: `parse` (download from storage, dispatch parser, force Claude `emit_events` tool, fuzzy-match athletes with inline Levenshtein, persist `source_uploads` + `ingestion_events` rows in `'preview'` status) and `confirm` (apply per-row overrides, flip preview rows to `'confirmed'`, bump upload counts).
- **POST body (parse):** `{ action: 'parse', storage_path, filename, mime_type, kind: 'csv'|'xlsx'|'pdf'|'image'|'paste', team_id }`
- **POST body (confirm):** `{ action: 'confirm', source_upload_id, overrides?: Array<{event_id, athlete_id?, reject?}> }`
- **Model:** `claude-sonnet-4-6` with forced `tool_choice: {type:'tool', name:'emit_events'}`.
- **External APIs:** Anthropic.
- **Secrets:** `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- **verify_jwt:** ON.
- **Frontend callers:** `src/lib/ingest/uploadClient.ts` (legacy coach surface only — the AgentModalPortal flow).

#### `sheets-sync` (`supabase/functions/sheets-sync/index.ts`, 550 lines)
- **Purpose:** Google Sheets connector. Three `action`s: `connect` (persist OAuth tokens into `connector_accounts.config_json`), `fetch` (refresh token if needed, read Sheets API metadata + values, format as RFC-4180 CSV, upload to `uploads` bucket, stamp `last_sync_at`), `disconnect` (zero out `config_json`, flip status to `'revoked'`). All gated by `users.team_id` + `users.role IN ('head_coach','assistant_coach')`.
- **External APIs:** `sheets.googleapis.com/v4/spreadsheets/{id}` (read metadata + values), `oauth2.googleapis.com/token` (refresh). **Read-only — no write-back to Google.**
- **Secrets:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- **verify_jwt:** ON.
- **Frontend callers:** `src/lib/ingest/sheetsClient.ts`.

#### `tool-generate` (`supabase/functions/tool-generate/index.ts`, 773 lines)
- **Purpose:** Vibe-code tool generator. Inserts/reuses `tool_requests`, loads team's `connector_accounts` to know what's wired, replays prior `tool_versions` as chat history, calls Claude with three function-calling tools (`emit_spec`, `request_clarification`, `decline_request`), validates the spec against schema_version + enums + supported elements (auto-converts to a decline on second validation failure), persists a `tool_versions` row.
- **Model:** `claude-opus-4-7` (max_tokens 3072) — comment says "Opus 4.7 because its declines / capability gating are tighter than Sonnet's."
- **POST body:** `{ description: string (3..2000), role, team_id (uuid), tool_request_id? }`
- **Response:** varies by `kind` (`spec | clarification | declined`).
- **External APIs:** Anthropic.
- **Secrets:** `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- **verify_jwt:** ON.
- **Frontend callers:** `src/lib/ai/toolGenerateClient.ts` (`/app/coach/tools/build` only).

---

## 4. Auth Flow

### Two coach signup surfaces, neither fully wired

**Surface A — `/signup` (legacy `src/features/auth/SignUpPage.tsx`):** Two-step form. On submit calls
```
supabase.auth.signUp({
  email, password,
  options: { emailRedirectTo: `${origin}/coach/dashboard`,
             data: { full_name, role: 'head_coach', team_name, sport } }
})
```
The `handle_new_auth_user` trigger fires server-side, which creates the `teams` row + `users` row. Google OAuth on this page cannot inject `user_metadata` pre-redirect, so Google signups land with the default `role='athlete'` — the source explicitly notes this needs manual promotion.

**Surface B — `/app/onboarding/role` etc. (new mobile shell):** `WelcomePage` has three CTAs; "Google" and "Email" both route to `/app/coming-soon` (not wired). "Continue as demo" calls `setDemoUser()` + `supabase.auth.signInAnonymously()`. None of the onboarding pages call `supabase.auth.signUp`. Role is written to `localStorage['synth:app:role']` by `RolePickPage`. Team info collected by `CoachTeamSetupPage` sits in `useOnboardingStore` (volatile, no persist, no upload).

### Athlete signup

There is no real athlete signup path. Three entry points:
- `/join/:code` (`JoinWithInvitePage.tsx`): fires a PostHog `athlete_joined_via_invite` event, navigates to `/athlete/home`. The submit handler **never calls Supabase**. Button label literally reads "Join team (demo)".
- `/app/onboarding/invite-code`: writes the code into `useOnboardingStore.inviteCode`, navigates on. **No validation, no DB write.**
- Google OAuth without `team_name` in metadata → trigger inserts `users(role='athlete', team_id=NULL)`.

### Invite-code flow

- **Generation** (line 55 of `20260513_coach_team_on_signup.sql`):
  ```sql
  new_invite_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  ```
  Stored on `public.teams.invite_code`.
- **Validation:** **none.** No SQL function, RPC, edge function, or client code looks up `teams` by `invite_code`. `JoinWithInvitePage` accepts any string.
- **Redemption:** **stubbed.** Nothing updates `users.team_id` post-redemption. PostHog gets the event; no DB mutation.
- Seed strings like `PAC-WR-2026` are **not** real generated codes — they're demo placeholders.

### Session management

- `src/lib/supabaseClient.ts` creates one client with `persistSession: true`, `autoRefreshToken: true`, `detectSessionInUrl: true`. Session lives in localStorage under the default `sb-<ref>-auth-token` key.
- `useAppAuthStore.hydrate()` deliberately avoids calling `getSession()` synchronously (cites a v2 SDK hang on stale refresh tokens). Registers `onAuthStateChange` and lets the SDK fire `INITIAL_SESSION`.
- Demo users: `setDemoUser` writes `synth:app:demoUser` + fires `supabase.auth.signInAnonymously()`. So demo users hold a real anonymous JWT that the edge functions accept.
- **`signOutFromSupabase`** uses `scope: 'local'` instead of the default `'global'` because the global path has been seen to hang. Wrapped in a 1500 ms `Promise.race` as a fallback. `useAppAuthStore.signOut()` clears 3 localStorage keys BEFORE the Supabase call, with inline commentary on three documented race conditions this ordering defends against.

### Role detection

Two completely different mechanisms.

**`/app/*` surface:** pure localStorage. `useAppAuthStore` reads role from `localStorage['synth:app:role']` (`'coach' | 'athlete'`). Set during `RolePickPage`. **Never compared to the DB.** A user could flip role by editing localStorage.

**Legacy `/coach/*` and `/athlete/*`:** no enforced gate. `LoginPage` and `SignUpPage` hard-code the destination to `/coach/dashboard` except for `star@synth.app` → `/athlete/today`.

**DB source of truth:** `public.users.role`. Values seen: `'head_coach'`, `'athlete'`, `'assistant_coach'`. **Nothing in the React app currently reads `users.role` to gate routes.** Only `sheets-sync` checks it server-side.

### Access gate (`src/features/gate/AccessGate.tsx`)

Global soft wrapper around the whole app.
- **Passcode:** `'98962005'`, hardcoded. Comment: "the passcode lives in the bundle; anyone with DevTools can grep it."
- **Persistence:** `localStorage['synth:access-gate:unlocked'] = '1'`.
- **Protected prefixes:** `/coach`, `/athlete`, `/app`. Landing / login / signup / `/join/:code` / `/product-demo` bypass.
- **Viewport rule:** gate fires only below 1024 px viewport width. Desktop ≥1024 always passes through, even on protected routes. Resizing flips it live.
- **UX:** children stay mounted under a blur scrim + `pointer-events:none`. `PasscodeInput` is an 8-cell segmented numeric input with auto-advance, paste, OTP autofill, shake on wrong code.

### Every `auth.uid()`-bound RLS policy

| # | Table | Policy | Operation | Predicate |
|---|---|---|---|---|
| 1 | `demo_usage` | demo usage own select | SELECT | `auth.uid() = user_id` |
| 2 | `demo_usage` | demo usage own insert | INSERT | `auth.uid() = user_id` |
| 3 | `demo_usage` | demo usage own update | UPDATE | `auth.uid() = user_id` |
| 4 | `source_uploads` | source_uploads own select | SELECT | `auth.uid() = uploaded_by` |
| 5 | `source_uploads` | source_uploads own insert | INSERT | `auth.uid() = uploaded_by` |
| 6 | `source_uploads` | source_uploads own update | UPDATE | `auth.uid() = uploaded_by` |
| 7 | `source_uploads` | source_uploads own delete | DELETE | `auth.uid() = uploaded_by` |
| 8-11 | `ingestion_events` | via own upload {select/insert/update/delete} | — | `EXISTS (SELECT 1 FROM source_uploads su WHERE su.id = ingestion_events.source_upload_id AND su.uploaded_by = auth.uid())` |
| 12-14 | `storage.objects` | uploads own {read/write/delete} | — | `bucket_id='uploads' AND (storage.foldername(name))[1] = auth.uid()::text` |
| 15 | `teams` | teams own select | SELECT | `EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.team_id = teams.id)` |
| 16 | `teams` | teams coach update | UPDATE | same + `u.role = 'head_coach'` |
| 17 | `users` | users own select | SELECT | `id = auth.uid()` |
| 18 | `users` | users own update | UPDATE | `id = auth.uid()` |

Note: **no `team_members` table exists** — RLS is per-user only. Teammates cannot cross-permit each other today. The ingestion migration's header comment acknowledges this is intentional for slice 1.

---

## 5. Zustand Stores

28 Zustand stores total, plus 2 store-style files that are NOT Zustand (kept here for completeness):
- `src/shared/store/useVisibilitySettings.ts` — `useSyncExternalStore` + localStorage (`synth:settings`)
- `src/features/app/data/useAttentionItems.ts` — plain `useMemo` hook

### Summary table (sorted by consumer count desc)

| Store | Persistence | Consumers | Notes |
|---|---|---:|---|
| `useToastStore` | none | 25 | Toast helper used everywhere; renderer comment says "proper ToastContainer can subscribe later" |
| `useAppAuthStore` | both (localStorage + Supabase auth) | 18 | `/app` auth — race-aware sign-out, anonymous sign-in for demo |
| `useUiStore` | none | 15 | Grab-bag UI flags: sidebar, modals, command palette, agent overlay |
| `useTeamStore` | Supabase (read: users, teams) | 8 | Hydrates from `users.team_id → teams.*` via auth listener; falls back to seed |
| `useOnboardingStore` | none | 8 | Shared coach + athlete onboarding — refresh resets all state |
| `useSessionsStore` | localStorage (`synth:app:sessions:v2`) | 7 | `/app` flow; seedIfEmpty injects V8A/V4A/V8B demo sessions |
| `useLineupBuilderStore` | localStorage (`synth:app:lineup-builder`) | 5 | Has `onRehydrateStorage` cox-seat migration |
| `useRightPanelStore` | none | 4 | Pure UI for chat/compare right panel |
| `useLineupsStore` | none (seeded) | 3 | Legacy `/coach/tools/lineups` — superseded by `useLineupBuilderStore` |
| `useAuthStore` | Supabase (auth bridge only) | 3 | Legacy auth — superseded by `useAppAuthStore` for `/app` |
| `useInstalledToolsStore` | localStorage (`synth:app:installed-tools`) | 3 | Seeded with Lineup Builder |
| `useAthleteOnboardingStore` | localStorage (`synth:athlete-onboarding`) | 2 | Demo-bypass auto-seeds when Supabase off |
| `useCoachOnboardingStore` | localStorage (`synth:coach-onboarding`) | 2 | Demo-bypass auto-seeds when Supabase off |
| `useAvatarStore` | localStorage (`synth:avatar-overrides`) | 2 | Stores raw data URLs — quota risk |
| `useRosterOverridesStore` | localStorage (`synth:roster-overrides`) | 2 | Layers CSV imports + status changes over seeds |
| `useSessionTimerStore` | none | 2 | Legacy `/coach/tools/session-timer` |
| `useThemeStore` | localStorage (`synth:theme`) | 2 | Binds `prefers-color-scheme` listener; mutates `document.documentElement` |
| `useAIChatCustomization` | localStorage (`synth:ai:customization`) | 2 | Per-scope chat customization; has unit tests |
| `useCoachContextStore` | Supabase (read: users) | 2 | Gates live `tool-generate` Edge Function path |
| `useDemoUsage` | localStorage (`synth:app:demo-usage`) | 2 | Client-side soft cap (30 msg/day UTC); real enforcement in Edge Function |
| `useSourcesStore` | localStorage (`synth:app:sources`) | 2 | `/app` connectors — seeded with 8, `garmin` seeded as `error` |
| `useChatSessionsStore` | localStorage (`synth:app:chat-sessions`) | 2 | Tool-builder sessions + 6 in-module seeded examples (not persisted) |
| `useAthleteMediaStore` | none | 1 | Athlete form-video saves; volatile |
| `useChatStore` | none | 1 | Coach AI threads + soft-delete archive; refresh wipes history |
| `useCoachNotesStore` | none | 1 | Add-only, no edit/delete |
| `useConnectorConnectionsStore` | localStorage (`synth:connector-connections`) | 1 | Legacy version of `useSourcesStore` — only AgentModalPortal reads it |
| `useLaunchSheetStore` | localStorage (`synth:launchSheet:v1`) | 1 | Two-dismissal auto-suppress |
| `useNotificationStore` | localStorage (`synth:notifications-read`) | 1 | Stores only the read-set; list lives elsewhere |
| `useWritebackStore` | none | 1 | `confirmAll` is a stub — clears the queue, no actual writeback |

No orphan stores — every Zustand store has at least one consumer.

### Patterns worth flagging for the architect

- **Legacy ↔ new duplication.** Four store-pairs do the same job for different surfaces:
  - `useAuthStore` (legacy) vs `useAppAuthStore` (new)
  - `useLineupsStore` (legacy) vs `useLineupBuilderStore` + `useSessionsStore` (new)
  - `useSessionTimerStore` (legacy) vs `useSessionsStore`-with-runs (new)
  - `useConnectorConnectionsStore` (legacy) vs `useSourcesStore` (new)

  The new versions consistently have more consumers and more documented race-condition handling. Legacy stores are prime consolidation candidates.

- **Two persistence styles in one repo.** `shared/store/` uses hand-rolled `read`/`write` helpers around `localStorage`. `features/app/store/` uses Zustand's `persist` middleware. The new code is consistent; the legacy code is not.

- **Four stores reinstall `supabase.auth.onAuthStateChange` listeners at module-scope** (`useAuthStore`, `useTeamStore`, `useAppAuthStore`, `useCoachContextStore`). All four independently reimplement the same 1.5 s race recovery against the SDK's `getSession()` hang. This is a strong "extract one shared bridge" signal for the rewrite.

- **`useToastStore` (25) and `useUiStore` (15) together account for the bulk of all consumer counts.** They are effectively cross-cutting UI infrastructure; the rest of the store surface is narrowly scoped.

- **`useChatStore` and the `/app/*/ai` thread state both have zero server-side persistence.** Chat history dies on refresh. There is no `messages` table in any migration.

---

## 6. External Integrations (outside Supabase)

| Service | Purpose | Credentials | Wired in |
|---|---|---|---|
| **Supabase** (`@supabase/supabase-js`) | Auth (incl. anonymous demo), Storage, Edge Function gateway, DB | Browser: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Edge: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (injected). | `src/lib/supabaseClient.ts`, `src/features/app/lib/supabase.ts` (re-export only), every `Deno.env.get` in edge functions |
| **Anthropic (Claude)** | LLM for chat, ingest extraction, tool generation | Server: `ANTHROPIC_API_KEY` (Supabase Edge secret). Dev-only browser: `VITE_ANTHROPIC_API_KEY` via Vite `/api/anthropic` proxy. | `supabase/functions/{claude-chat,ingest,tool-generate}/index.ts`; `src/lib/ai/{claude.ts,directClient.ts,toolGenerateClient.ts}` |
| **Google OAuth (via Supabase Auth)** | OAuth for Google Sheets connector + optional sign-in | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (Supabase Edge secrets, for refresh-token rotation). | `supabase/functions/sheets-sync/index.ts`; `src/lib/ingest/sheetsClient.ts` |
| **PostHog** (`@posthog/react`, `posthog-js`) | Per-person analytics + session replay; events `signed_in`, `signed_up`, `waitlist_joined`, `athlete_joined_via_invite`, `desktop_intercept_dismissed` | `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` (default `https://us.i.posthog.com`) | `src/shared/analytics/posthog.ts`, `src/main.tsx`, `src/features/auth/{LoginPage,SignUpPage}.tsx` |
| **Stream Chat** (`stream-chat`, `stream-chat-react`) | Coach-side team messaging surface; server-side token mint helpers exist client-side, not edge-deployed | `VITE_STREAM_API_KEY` (**not listed in `.env.example`** — only documented in `STATUS_REPORT.md`) | `src/components/chat/CoachTeamMessaging.tsx`, `src/lib/stream/{client,tokens,env}.ts`. Falls back to `MockTeamChat.tsx` |
| **Sentry** | **Scaffold only — no SDK installed.** | `VITE_SENTRY_DSN` (read but no-op) | `src/lib/sentry.ts`, `src/features/app/coach/ToolsBuildPage.tsx` (`captureError` stub). CSP whitelists `*.ingest.sentry.io`. |
| **Sharp** (dev) | Build-time PWA PNG icon generation from the green SVG logo | n/a (local Node script) | `scripts/generate-icons.mjs` |
| **html2canvas** | Off-screen DOM→PNG for shareable card / PR celebration / weekly digest | n/a (browser lib) | `src/features/athlete/behavioral/{ShareableCard,PRCelebration,WeeklyDigestModal}.tsx` |
| **canvas-confetti** | PR celebration burst | n/a | `src/features/athlete/behavioral/PRCelebration.tsx` |
| **qrcode.react** | "Scan to continue on phone" QR on the desktop intercept | n/a | `src/features/app/desktopIntercept/slides/InstructionsSlide.tsx` |
| **Vercel Analytics** | **Not installed.** Hosting platform only. | — | — |
| **Datadog** | **Not installed.** | — | — |

Env files at repo root: `.env` (gitignored), `.env.example` (tracked, 1047 bytes), `.env.local` (exists locally — not read).

---

## 7. Connector Status

Two parallel "Sources" UIs exist:
- **Legacy** `/coach/sources` (`src/features/coach/sources/`, drives the synth. Agent modal in `src/shared/layout/AgentModalPortal.tsx`).
- **New** `/app/coach/sources` (`src/features/app/coach/SourcesPage.tsx`) backed by `src/features/app/data/mockConnectors.ts` + `useConnectorConnectionsStore` (localStorage-only).

Neither path stores tokens in a `connector_accounts` table from the React side. The Sheets path is the only one that calls an edge function that touches `connector_accounts` — and that table itself is undefined in the repo migrations.

| # | Connector | Status | Evidence |
|---|---|---|---|
| 1 | **Google Sheets** | **partial — OAuth + read working; ingest reuses /ingest** | `src/lib/ingest/sheetsClient.ts` initiates `signInWithOAuth({provider:'google', scopes:'spreadsheets.readonly'})`; `sheets-sync` Edge Function implements `connect`/`fetch`/`disconnect`. Pulls CSV to the `uploads` bucket and defers to `/ingest`. Caveat: expects `connector_accounts` table that no migration creates. |
| 2 | **Concept2 (Logbook)** | **mock only** | Listed in `COACH_CONNECTORS` (`mockConnectors.ts:18`); `CONCEPT2_ROWS` seed; `SourcesDataViewPage` shows a styled stub. Stroke-rate tool snapshot references "future Sprint 12: live Concept2 OAuth" (`src/lib/tools/resolver.ts:18`). No OAuth client. |
| 3 | **Strava** | **mock only** | `STRAVA_ACTIVITIES` seed; styled tab; connector card. No OAuth code path. |
| 4 | **Apple Health** | **mock only** | Connector card + tab. No HealthKit bridge (would require an iOS companion). |
| 5 | **Google Calendar** | **mock only** | `mockConnectors.ts:155`. The `AppleCalendar` primitive is a styled mock unrelated to Google. No OAuth wiring. |
| 6 | **TrainingPeaks** | **mock only** | Connector card + tab showing pending status. Purely UI. |
| 7 | **Whoop** | **mock only** | Connector card; `WhoopTab` hard-codes `status='failed'`. No OAuth. |
| 8 | **Garmin** | **mock only** | Connector card; `EmptyTab`. Seeded as `error` status in `useSourcesStore`. |
| 9 | **Oura** | **mock only** | Connector card; `EmptyTab`. |
| 10 | **Slack** | **not started for new app; mock card on legacy** | Defined in `ConnectorProvider` type (`src/shared/data/types.ts:53,316`) and `AgentModalPortal.tsx:44`. **Absent from `mockConnectors.ts`** — the new app surface does not list it. |

### AI Import pipeline

#### Photo → upload → OCR
**Working end-to-end via Claude vision — but only from the legacy surface.**

Flow: coach taps Photo in `src/features/app/coach/CapturePage.tsx` → `PhotoCaptureSheet` in `CaptureSheets.tsx` captures via `<input type="file" accept="image/*" capture="environment">` → upload to Supabase Storage `uploads/{userId}/...` via `src/lib/ingest/uploadClient.ts` → `/functions/v1/ingest` action=`parse` → `parseImage` base64s the blob → Claude `sonnet-4-6` with forced tool `emit_events` + team roster in the system prompt → fuzzy-matches names via inline Levenshtein → writes rows to `ingestion_events` (status=preview) → coach confirms via `action=confirm`.

**Caveat:** in the **new** `CapturePage.tsx`, the "Send to coach" CTA only prepends to a local recent-items list (`onPhotoSave`, line 85). It does NOT call `uploadToStorage`. The full upload path is currently only wired from the legacy synth. Agent / Sources surface (the AgentModalPortal).

#### Voice → transcription → structured rows
**Browser Web Speech API only — no third-party transcription.**

`src/features/app/primitives/AuroraVoiceOverlay.tsx` uses `window.SpeechRecognition ?? window.webkitSpeechRecognition` (Chrome/Safari only), plus an `AudioContext` analyser for the bar viz. The transcript is handed back via `onSave`. **No AssemblyAI / Whisper / Deepgram references anywhere.**

**The transcript is never posted to `/ingest`.** In coach `CapturePage.tsx:79`, `onVoiceSave` just prepends a recent-items entry. So the voice path is "speech-to-text in the browser, then dropped on the floor" — never reaches Claude or `ingestion_events`.

#### Paste → text → structured rows
**Schema and types exist; no UI in the new app shell.**

`SourceUploadKind` includes `'paste'`. The migration check constraint allows it. The `/ingest` function's parser dispatch has no `paste` branch — it falls through to `parsed = { kind: 'text', text: await blob.text() }` which works iff a paste is uploaded as a text blob.

**No coach-facing component creates that blob.** `CapturePage.tsx` has no paste mode. The TourPage marketing copy mentions "paste-text any data point" — the surface to do it is not built.

---

## 8. Synthesis Engine Status

The "intelligence" layer is essentially a stub. `src/shared/intelligence/metrics.ts` contains 5 deterministic helper functions that aren't called from any production code — only from `metrics.test.ts`. All headline metrics on coach/athlete pages read from seed objects (`src/features/coach/athletes/data/demoData.ts`) or hand-built signal templates (`useAttentionItems.ts`).

| Signal | Status | Location | Runs | Persistence | Notes |
|---|---|---|---|---|---|
| **Training load** | stubbed | `src/shared/intelligence/metrics.ts` → `computeTrainingLoad01` (weighted blend: water 0.35, erg 0.30, gym 0.25, cross 0.10); demo values hardcoded in `src/features/coach/athletes/data/demoData.ts` lines 220, 249 | client-side | not persisted | Helper exists but isn't wired into UI. UI reads `demo.headline.trainingLoad.value` directly. |
| **Recovery readiness** | stubbed | `metrics.ts` → `computeRecovery0to100` (sleep 0.35 + wellness 0.30 + fatigue 0.35, ×100); seed in `demoData.ts:221,250` | client-side | not persisted | The 90-day timeline derives recovery from training load via `92 - trainingLoad*4.1 + jitter`. |
| **Injury risk** | stubbed | `metrics.ts` → `sumRiskWeights` + `riskTierFromTotal` (≤2 low, ≤5 moderate, ≤8 high, else critical); seed in `demoData.ts:115` (hardcoded `{level:'LOW', score:2, factors:[…]}`) | client-side | not persisted | Three factor strings are static seed text, not computed from source rows. |
| **Performance trend** | stubbed | No dedicated function. `useAttentionItems.ts:24-95` ships 10 hand-authored signal templates ("2K split slipped 7.2s vs 4-week avg"). `demoData.ts:251` synthesises a 90-day erg split via `100.8 - (i/90)*1.9 + jitter` | client-side | not persisted; recomputed on render via `useMemo` | No real trend detection — strings are pre-written and paired round-robin with `useAthletes()` output. |
| **Lineup optimization** | not started | — | n/a | n/a | `LineupsPage` has @dnd-kit drag/drop and a static `InsightsTab` with one hardcoded recommendation. No scoring function. |
| **Anomaly detection** | not started | — | n/a | n/a | Searched for `anomaly`, `outlier`, `zscore`, `baseline` — only narrative copy mentions baselines. HRV/RHR deltas in `AthleteOverview.tsx:352-353` compute a `%` against a static `baselineMs` field. |
| **Data quality score** | partial | `metrics.ts` → `computeDataQualityScore` (sources capped at 5 + freshness×3 + completeness×2, capped at 10); seed in `demoData.ts:116,222` | client-side | not persisted; UI reads `demo.headline.dataQuality.value = '9.4/10'` from seed | Algorithm shape defined; inputs not wired to anything real. |

Also notable: `src/shared/intelligence/digestScheduler.ts` is a placeholder that just returns the string `'Weekly digest: configure server cron → email coach (not running in static SPA).'`.

**No table for derived metrics exists in any migration.** No materialized view, no Postgres function for synthesis (only the auth trigger), no edge function that computes and writes back. Everything on screen is a static seed value or a procedurally generated demo timeline.

---

## 9. synth. AI Chat

### Working chat surfaces

| Surface | File | Source of truth | Live API |
|---|---|---|---|
| `/app/coach/ai` | `src/features/app/coach/AIPage.tsx` | Team-scope by default; `?athlete=<id>` drills in | yes (`claude-chat`) |
| `/app/athlete/ai` | `src/features/app/athlete/AIPage.tsx` | Self-scoped to `APP_MOCK_ATHLETES[0]` (Star Miller) | yes (`claude-chat`) |
| `/coach/ai` (legacy) | `src/features/coach/ai/TeamChatPage.tsx` → `ChatView` | Uses live API for the synth. AI tab via `streamCompletion` | yes (`claude-chat`) |
| `/coach/athletes/:id/ai` (legacy) | `src/features/coach/ai/AthleteScopedChatPage.tsx` | Shares `ChatView` | yes (`claude-chat`) |
| `/athlete/chat` (legacy) | `MyChatPage` in `athleteAppPages.tsx` | **Canned responses only** (`cannedResponses.ts`) | no |

### Model selection

`selectModel(query, context)` in `src/lib/ai/claude.ts:170` picks a tier:
- `opus` if query contains `predict`, `forecast`, `strategy`, `plan for the`, OR `context > 30000` chars
- `haiku` if query is short (<80 chars) or starts with greetings (`hi|hey|hello|thanks…`)
- `sonnet` otherwise (workhorse default)

`modelChainForTier` expands a tier to a fallback chain. Haiku-tier → Haiku → Sonnet → Opus. Sonnet-tier → Sonnet → Opus. Opus-tier → Opus only. `streamClaudeMessages` walks the chain on non-hard errors (401/403/429 escape immediately).

Recent commit on this branch: `fix(ai): trim model chain to only allowlist-matching IDs` — earlier the chain held dozens of legacy IDs that all 400'd and stacked false starts.

Model overrides: coach AIPage forces `'sonnet'` when an image is attached (text-only Haiku would 400). Server-side hard cap `MAX_TOKENS_CEILING = 4096`, default 1024; the streaming client requests 2048.

### Two API paths

**Dev — Direct browser → Vite proxy → Anthropic** (`src/lib/ai/directClient.ts`).
Activates when `import.meta.env.DEV && VITE_ANTHROPIC_API_KEY`. Vite proxies `/api/anthropic/*` → `api.anthropic.com`. Sends `anthropic-dangerous-direct-browser-access: true`. `getDirectKey()` returns empty string outside DEV so the key cannot leak in a production bundle. Bypasses the edge function's model allowlist + demo cap.

**Production — Client → Supabase Edge `claude-chat` → Anthropic** (`src/lib/ai/claude.ts:streamClaudeMessages`).
The function holds `ANTHROPIC_API_KEY` as a Supabase secret. Caller sends the Supabase JWT as `Authorization: Bearer`. SSE streaming pass-through (`text/event-stream`). Enforces the 30-message/UTC-day demo cap for anonymous users via `public.demo_usage`.

### Context sent on every turn

`buildSystemPrompt` in `src/features/app/lib/aiClient.ts:164` assembles a multi-line prompt with:
- "You are synth, an AI assistant for a rowing coach/athlete data platform. You answer from the data the user has connected. Never invent metrics."
- Current scope (athlete name + role) + `JSON.stringify(scopeData, null, 2)`
- Writing rules (plain words, no em-dashes, short sentences, prose budget)
- Conversation rules (greetings → chit-chat; data questions → structured response)
- Structured-output block recipes for `[c:source|…]`, `[chart:…]`, `[table:…]`, `[callout:…]`, `[illustration:…]`, `[suggest:…]`
- Per-scenario recipes (TEAM STATUS / ATHLETE DEEP-DIVE / COMPARISON / WELLNESS / RACE DAY / LINEUP)
- Tone (coach / raceday / recovery / normal)
- Optional appended sections: image-attached special handling, coach custom instructions, reference materials, always/never-reference toggles

**Scope data shape:**
- Athlete scope: `{ athlete: <APP_MOCK_ATHLETES entry>, attention: <filtered APP_MOCK_ATTENTION>, ergHistory: <14d from buildErgHistory> }`
- Team scope: `{ team: APP_MOCK_TEAM, flagged: APP_MOCK_ATTENTION, roster: <id,name,position,recovery,twoKBest,streakDays>[] }`

**All values come from `src/features/app/data/mockTeam.ts` — no real ingested data is fed in even when ingestion is wired.** The prompt's "Never invent metrics" instruction is enforced against curated mock data.

**Conversation history:** full thread is sent on every turn. `apiMessages = [...history, {role:'user', content: userContent}]`. History maps prior assistant `ChatPart[]` back to stringified text fragments.

**Images:** `parseImageDataUrl` strips the data URL prefix; `buildUserContent` constructs `[{type:'image', source:{…}}, {type:'text', text}]`. Vision model forced via `model: 'sonnet'`.

### Where chat history is stored

**Mostly in React component state.** Lost on navigation.

- `useChatSessionsStore` (`features/app/store/`) — NOT chat history. Stores **tool-builder** sessions. Persisted to `synth:app:chat-sessions`.
- `useAIChatCustomization` — per-scope customization (tone, instructions, reference list). Persisted to `synth:ai:customization`. **Not message history — settings only.**
- `useChatStore` (`shared/store/`) — in-memory only, no `persist`. Used by the **legacy** `/coach/ai`. Tracks `threads: Record<ChatKey, ChatMsg[]>` + `archivedThreads`. **Lost on reload.**
- In `AIPage.tsx` (coach + athlete): the live thread sits in `useState<ChatMessage[]>([])`. A `SEED_HISTORY` constant feeds the ChatHistorySheet, but selecting one calls `setMessages([])` — the history sheet is a visual stub.

**There is no Supabase `messages` table.** None of the four migrations reference chat or message persistence. The only AI-related table is `demo_usage` (counter only).

---

## 10. Two-Way Sync

**No write-back to any external tool exists today. This is fully greenfield.**

Searches performed:
- `grep -rE "(values\.update|values\.append|valuesBatchUpdate|spreadsheets\.values|spreadsheets:batchUpdate)"` over `src/` and `supabase/`: zero matches.
- `grep -rE "(strava\.com.*POST|whoop\.|garmin\.|teamworks\.|polar\.)"` for outbound POSTs: only seed-data URL strings used as display links, no fetch calls.
- All `method: 'POST'/'PUT'/'PATCH'/'DELETE'` calls under `src/lib/ingest/` go to our own `/functions/v1/sheets-sync` and `/functions/v1/ingest`, not third parties.
- All `fetch(` calls inside edge functions target either `api.anthropic.com/v1/messages`, `sheets.googleapis.com/v4/spreadsheets` (read-only — `GET /metadata` + `GET /values/{range}`), or `oauth2.googleapis.com/token` (refresh).

**`sheets-sync` is pull-only.** Three actions: `connect` (store tokens), `fetch` (GET sheet → CSV → upload to `uploads` bucket), `disconnect` (clear tokens). **No PUT/POST back to Google.**

The closest thing to write-back infrastructure is `src/shared/store/useWritebackStore.ts`:

```ts
confirmAll: () => {
  const q = get().queue
  log.info('writeback.confirmAll (stub)', q.length)
  set({ queue: [] })
}
```

It logs and clears. `WritebackConfirmBar.tsx` is the only consumer. The comment in the file is literally `'writeback.confirmAll (stub)'`.

**synth. today has inbound ingestion only.** File upload + Google Sheets pull → `uploads` bucket → `ingest` edge function → Claude extracts → `ingestion_events`. No path emits a write into any coach/athlete external system.

---

## 11. Deployment & Environments

### Frontend — Vercel

- Project: `synth-platform-alt`
- `.vercel/project.json`: `{"projectId":"prj_Hok33AUiSwGHcDfTxPUcCUB7lDtA","orgId":"team_gbBiqgTktOYto5eu84aDKCT3"}`
- `vercel.json`:
  - framework `vite`, output `dist`
  - SPA rewrite to `/index.html`
  - host-based redirects from `synth-platform-alt.vercel.app` and `synthplatform.vercel.app` → `https://synthsports.co/$1` (`permanent: false`)
  - Security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (camera/mic/geo disabled for cross-origin frames), tight `CSP` (script-src 'self' only) allow-listing `*.supabase.co`, PostHog, Sentry
- Production URL: `https://synthsports.co`

### Supabase

- Project ref: `xdxyqhqlaiwucvlfzsfa`, project name `synth_platform`, region `us-east-2` (per `SYNTH_MVP_MANUAL_SETUP.md`)
- 4 edge functions deployed: `claude-chat`, `ingest`, `sheets-sync`, `tool-generate`
- 4 migrations checked in (see Section 3)
- No `supabase/config.toml` in the repo

### Environments

**No formal staging.** Only one Vercel project (`synth-platform-alt`). Both `.vercel.app` hosts in `vercel.json` redirect to `synthsports.co`. There is only one Supabase project ref anywhere in the repo. Branch deploys on Vercel are implicit (Vercel default), but there is no `synth-platform-staging` project, no per-env Supabase ref. Memory notes confirm: every push auto-deploys to `synth-platform-alt.vercel.app`.

### Env vars referenced

**Browser (`import.meta.env.VITE_*`):**
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — `src/lib/supabaseClient.ts`, `src/lib/ingest/sheetsClient.ts`, `src/lib/ingest/uploadClient.ts`, `src/lib/ai/claude.ts`, `src/lib/ai/toolGenerateClient.ts`
- `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` — `src/shared/analytics/posthog.ts`
- `VITE_STREAM_API_KEY` — `src/lib/stream/{client,env}.ts`, `src/components/chat/CoachTeamMessaging.tsx`
- `VITE_SENTRY_DSN` — `src/lib/sentry.ts` (no-op; no SDK installed)
- `VITE_ANTHROPIC_API_KEY` — `src/lib/ai/directClient.ts` (dev only, via Vite proxy)
- `VITE_FEATURE_SHEETS_WRITEBACK`, `VITE_FEATURE_AI_IMPORT`, `VITE_LOG_LEVEL` — `src/lib/featureFlags.ts`

**Edge runtime (`Deno.env.get`):**
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — all four functions
- `ANTHROPIC_API_KEY` — `claude-chat`, `ingest`, `tool-generate`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — `sheets-sync` only

### CI/CD

`.github/workflows/ci.yml` on push/PR to `main`: Node 22, `npm ci`, `npm run lint`, `npm run build` (`tsc -b && vite build`), `npm run test` (Vitest).

Two additional workflows are Claude-PR-review bots: `claude.yml`, `claude-code-review.yml`.

**No edge-function deploy step.** Supabase functions are deployed manually (per `SYNTH_MVP_MANUAL_SETUP.md` referencing `supabase secrets set ... --project-ref xdxyqhqlaiwucvlfzsfa`). **Vercel deploys are managed entirely outside the repo** (default Git integration).

---

## 12. Known Pain Points

### Architecture / scaling

- **Hard-coded demo team UUID in the signup trigger** (`supabase/migrations/20260513_coach_team_on_signup.sql:22`: `da7025df-4c74-4b48-bd86-89e0e0a8f34e`) pins every anonymous demo user to one tenant. **Multi-tenant data leak between demo users.**
- **`team_id` and `athlete_id` loosened from uuid → text** (`20260507_ingestion_id_text.sql`) to accommodate seed strings like `team-cal-womens-rowing`. No FK from ingestion rows to `teams`/`athletes`. Tightening back will require backfill or truncate (migration header admits this). Two different tenants could collide on the same human-readable string.
- **Two routing surfaces for the entire product.** Legacy `/coach/*` + `/athlete/*` and new `/app/coach/*` + `/app/athlete/*` both ship to production. All wired in `src/app/routes.tsx`. Every fix has to be applied twice; agents will edit the wrong tree.
- **Two Supabase client modules.** `src/lib/supabaseClient.ts` is canonical; `src/features/app/lib/supabase.ts` is a re-export. The docstring admits an earlier dual-`createClient` bug. The re-export is a guard rail that should be removed once call sites migrate.
- **Connector "connect" persists to localStorage only.** `src/shared/store/useConnectorConnectionsStore.ts` flips `localStorage['synth:connector-connections']`. Every "connect Strava" / "connect Whoop" button in the new app shell is a UI flag — no OAuth handshake, no token stored, no server state. Sources stay "connected" across coach logins on the same device.
- **Voice capture is a dead end.** `AuroraVoiceOverlay` produces a transcript; `CapturePage.onVoiceSave` discards it into a UI list. The "voice-note any data point" marketing promise has no implementation.
- **CapturePage's photo path doesn't reach the ingest pipeline.** Only the legacy AgentModalPortal flow actually uploads photos to `uploads/` + invokes `/ingest`. The new mobile Capture surface saves to a local recent-items list and never hits the backend.

### Schema drift between code and tracked migrations

- **`users`, `teams`** — RLS policies exist in the migration but the `CREATE TABLE` does not. They live in a baseline migration that isn't checked in.
- **`connector_accounts`** — `sheets-sync` reads/writes it; no migration creates it. **Will fail at runtime** if the table doesn't exist in the live project.
- **`tool_requests`, `tool_versions`** — `tool-generate` (773 lines) and the frontend's publish path both depend on them; no migration creates them.
- **`athletes`** — `ingest` reads it via `loadRoster()`; no migration. The function defensively try/catches.
- **No `CREATE TRIGGER ... ON auth.users` for `handle_new_auth_user`** in any tracked migration. The function is `CREATE OR REPLACE`d, but the trigger binding lives somewhere outside the repo.

The storage layer for most of the application is implicit. Only ingestion + demo_usage + (the RLS for) teams/users are tracked here.

### RLS gaps

- **`ingestion_events.team_id` is text after the loosening migration, with no policy that pins it to the caller's team.** Write paths are safe (chained through `source_uploads.uploaded_by = auth.uid()`), but a future query that filters by `team_id` cannot enforce tenancy.
- **No `team_members` table** — every policy is per-user. Teammates cannot cross-permit each other today. The slice 1 comment in the ingestion migration acknowledges this is intentional, but it's a hard ceiling on multi-coach teams.
- **CSP has no `report-uri`** — when something is blocked, you won't know.

### Inconsistencies

- **`synthsports.com` vs `synthsports.co`.** The landing page (`LandingPage.tsx:40,47,54,61,68`) and the dashboard mockup (`SynthLayerDashboardMockup.tsx:236,304`) show `synthsports.com` browser-chrome URLs. The vercel.json redirects to `synthsports.co`. Either domain redirect needs to be added or the mockup strings updated.
- **CLAUDE.md describes only the legacy `/coach/*` routes.** The new `/app/coach/*` shell (50+ files in `src/features/app/`) is absent from the architectural overview. Agents and humans following the spec will edit the wrong tree.
- **Connector model fragmented across at least three places**: `src/features/app/data/mockConnectors.ts` (10 connectors, Slack missing), `src/features/coach/sources/components/SourceCard.tsx` (legacy labels including Slack), `src/shared/data/types.ts` `ConnectorProvider` union (including Slack). Adding a connector requires editing all three.
- **`assistant_coach` role is referenced in `sheets-sync` but never produced by the signup trigger.** No code path lands a user in that role.

### Files that should not exist (at repo root)

- `synth-pack/` — multi-agent build scaffold, gitignored, dropped at root.
- `coach_tools_images/` — duplicate of `public/coach_tools_images/`.
- `src/prototype/` — older standalone Pacific Women's prototype, still imported by `src/shared/data/seeds/`.
- Root scratch files: `STATUS_REPORT.md` (35 KB), `SYNTH_VIBECODE_MASTER_PLAN.md` (26 KB), `SYNTH_VIBECODE_REVIEW_RUBRIC.md`, `SYNTH_MVP_MANUAL_SETUP.md`, `.resume-log.md` (99 KB), `handoff.md`, `PR_BODY.md`, `posthog-setup-report.md`.

### Test coverage

13 `*.test.ts` files total — all unit-level. Coverage by load-bearing area:
- **Auth:** 0 tests. No tests of `useAuthStore`, `useAppAuthStore`, the SignUp flow, the trigger SQL, or anonymous sign-in race recovery.
- **Ingest:** 1 test (`athleteMatch.test.ts` — Levenshtein scorer). No tests of the edge function, the upload client, the confirm flow, or RLS.
- **AI:** `claude.test.ts`, `aiResponseParser.test.ts` (streaming markdown/chart/citation parser), `useAIChatCustomization.test.ts`. No tests of the `claude-chat` edge function, `tool-generate`, or model-selection logic.
- **Tools:** 6 tests under `src/lib/tools/` — the strongest area (schema, registry, resolver, mockGenerator, capabilities, ToolRenderer).

**No e2e / integration tests anywhere.** No Playwright, no Cypress, no Vitest against an emulated Supabase. CI runs `npm run test` (plain Vitest unit) only.

### Implementation-style observations

- **Stream Chat ships its own CSS** (`stream-chat-react/dist/css/index.css` imported in `CoachTeamMessaging.tsx:4`). CLAUDE.md says "no UI kit" — minor doc contradiction.
- **`useAvatarStore` writes raw data URLs to localStorage** — quota risk for large uploads.
- **The "TODO" backlog is not grep-able.** Only two non-trivial TODOs in source. Most "future sprint" intent is buried in long comments inside the edge functions and tool resolver (e.g. `resolver.ts:18` "Sprint 12: live Concept2 OAuth"). The architect should walk the comments, not the TODO/FIXME markers.
- **Four stores reinstall their own `supabase.auth.onAuthStateChange` listener** and independently reimplement a 1.5 s race recovery against the SDK's `getSession()` hang. Strong "one shared auth bridge" signal for the rewrite.

---

## 13. Open Questions

Group by section. These are the things the code alone cannot answer.

### Schema (Section 3)

- **Where do `users`, `teams`, `connector_accounts`, `tool_requests`, `tool_versions`, `athletes` get created?** No migration in the repo defines them. Get a `pg_dump --schema-only` from the live Supabase project so the rewrite's schema is comprehensive.
- **Where is the `CREATE TRIGGER` binding for `handle_new_auth_user` on `auth.users`?** Not in any tracked migration. Verify in the Supabase dashboard.
- **Authoritative shape of `connector_accounts`?** What are its real column types, indexes, and uniqueness constraints? `sheets-sync` and `tool-generate` both touch it but disagree slightly on inferred shape.
- **Is `athletes` an actual table or just code aspirational?** The `ingest` function defensively try/catches its read. Confirm whether it exists, what its shape is, and what populates it.
- **What is the `assistant_coach` role for?** Referenced in `sheets-sync` permissions check but never produced by the signup trigger. Is there a planned UI for inviting assistant coaches? Where does the role get set today?

### Auth + multi-tenancy (Section 4)

- **Is the hard-coded demo team UUID (`da7025df-…`) intentional shared tenancy for demos, or an artifact of the slice-1 trigger?** What's the plan for real demo isolation?
- **What's the planned invite-code redemption path?** The migration comment says "they'll get a team_id when they redeem" but no code path implements it. Server RPC? Edge function? Manual claim button?
- **What is the planned `team_members` model?** Today every RLS is per-user. Does the rewrite want a `team_members(team_id, user_id, role)` join table? Should assistant_coach + athlete both be `team_members` rows with role flags?
- **`/app/onboarding` collects sport + team_name + capabilities + connectors into `useOnboardingStore` but never calls `signUp`.** What is the intended end-state — should the onboarding flow culminate in a real account, or is it a demo-only walkthrough?

### Frontend (Section 2)

- **Which surface lives?** `/coach/*` + `/athlete/*` (legacy) vs `/app/coach/*` + `/app/athlete/*` (new). Both ship today. The plan is presumably to retire the legacy — confirm and on what timeline.
- **The athlete-side AI page** (`/athlete/chat` and `MyChatPage`) **uses canned responses, not the live API.** Is that intentional during the rewrite window, or a TODO?

### Stores (Section 5)

- **The four parallel auth-listener installations** (`useAuthStore`, `useTeamStore`, `useAppAuthStore`, `useCoachContextStore`) — each reimplements the same SDK race. Does the new architecture want a single shared bridge?

### Connectors (Section 7)

- **What's the intended OAuth provider stack?** Today Supabase does the OAuth handshake for Google (cleanly). For Strava / Whoop / Garmin etc., is the plan to do OAuth in-house, route through a third-party (Vital, Terra), or use the Supabase OAuth bridge?
- **Is the `connector_accounts` `(team_id, provider)` uniqueness real?** The `sheets-sync` defensive select-then-upsert suggests it's not enforced.

### AI (Section 9)

- **Should `ingestion_events` actually feed into the AI prompt?** Today the prompt's "Never invent metrics" instruction is enforced against curated mock data. The scope-data builder reads `APP_MOCK_*`, not the real `ingestion_events` table.
- **Where should chat history persist?** Nothing today does — the legacy `useChatStore` is in-memory; the new `AIPage`s use `useState`. Is the plan a `messages` table, an `ai_threads` table, a Stream-Chat-style sidecar, or stateless-by-design?
- **Demo cap (30/UTC day) is anonymous-only.** Does the new architecture want a paid-tier limit, a per-team-quota model, or something else?

### Two-way sync (Section 10)

- **Is two-way sync even a near-term goal?** Today it's fully greenfield. The `useWritebackStore` stub suggests it's been considered. Knowing the target connectors (Sheets writeback? Strava activity push? Whoop comment?) shapes the queue/idempotency design.
- **What's the consistency model?** Ingest is at-least-once today (parse → preview → coach confirms). Writeback presumably wants similar — does the architect need an outbox table or can Postgres LISTEN/NOTIFY drive it?

### Synthesis engine (Section 8)

- **Where should derived metrics live?** Today computed client-side from seed data with no persistence. The architect's options are: (a) materialized views / triggers in Postgres, (b) Python/Go workers writing to a `signals` table, (c) edge functions on demand. Which fits the rewrite's read patterns?
- **Algorithm provenance — is the published research already chosen?** `synth-pack/.claude/agents/algo-builder.md` says "cite sources" and "test against published research" — does the team already have an ACWR / Banister / Kalman-filter reference in mind, or is the rewrite expected to pick?

### Deployment (Section 11)

- **Will the rewrite keep Supabase, or move auth/DB/storage to a self-managed Postgres + S3 + custom auth?** The new Python + Go backend mention suggests a possible move; if Supabase stays, the storage RLS / edge-function migration plan is significantly smaller.
- **Edge functions are deployed manually** — should CI gain a deploy step before the rewrite begins, or is the rewrite going to replace edge functions wholesale with Python/Go services?
- **No staging environment exists.** Does the architect want one provisioned before they start, or will branch-deploys + a separate Supabase project be the rewrite-time setup?

### Files (Section 1, Section 12)

- **Can `synth-pack/`, `coach_tools_images/`, `src/prototype/`, and the 7 root scratch markdown files be deleted before the rewrite begins?** They're load-bearing only via the prototype-seed import; that one is solvable. Cleaning them up first will sharpen the new codebase's signal-to-noise.

---

Inventory complete. Ready for handoff.
