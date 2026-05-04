# synth-platform — STATUS REPORT

> Snapshot taken 2026-05-04 against branch `feature/anthropic-wiring`. Authored as a planning input for the upcoming "vibe-code" Custom Tools phase. Not optimistic, not pessimistic — just what is actually in `main`-ish today.

---

## 1. STACK INVENTORY

### Frontend
- **React 18.3.1** + **TypeScript 5.8** + **Vite 5.4** (`package.json`).
- Routing: **react-router-dom 7.14** declarative config in `src/app/routes.tsx` (single source of truth, ~330 lines).
- State: **Zustand 5** — 22 stores in `src/shared/store/` plus `src/features/app/store/` (auth, ui, chat, lineups, session timer, sources, notifications, tutorial, etc.). No Redux.
- Styling: **Tailwind CSS 4** via `@tailwindcss/postcss`. `THEME` const (`src/lib/theme.ts`) is the brand source-of-truth.
- Animation: **Framer Motion 12**. Presets in `src/lib/motion.ts`.
- Charts: **Recharts 3** (only chart library).
- DnD: **@dnd-kit/core 6 + sortable 10** (Lineups builder).
- Diagrams: **@xyflow/react 12** (declared, used in some prototype screens).
- Misc: `lucide-react` icons, `qrcode.react`, `canvas-confetti`, `html2canvas`, `posthog-js` + `@posthog/react`, `stream-chat` + `stream-chat-react`.
- PWA: **vite-plugin-pwa 1.2** generates `dist/sw.js` + `dist/manifest.webmanifest` (config in `vite.config.ts`). Custom icon pipeline `scripts/generate-icons.mjs`.
- Testing: **Vitest 3** (`vitest.config.ts` includes `src/**/*.test.ts` only). One test file in repo: `src/shared/intelligence/metrics.test.ts` — 6 unit tests, Node environment. No React Testing Library, no Playwright, no Cypress.

### Backend / API layer
- **There is no backend in this repo.** No `/api` routes, no Next.js API handlers, no Express. The only server-side code referenced is a Supabase Edge Function called `claude-chat` (URL constructed in `src/lib/ai/claude.ts:42` as `${VITE_SUPABASE_URL}/functions/v1/claude-chat`). The function source itself is **not** in this repo.
- **No `supabase/` directory** with migrations, edge functions, or seed SQL. Confirmed by directory walk.

### Database (Supabase / Postgres)
- **Not provisioned.** Schema lives only as documentation: `docs/SCHEMA.md` (29 KB, fully written DDL for ~30 tables across §1–6 + §9 production extensions). No migrations applied anywhere.
- All UI today reads from hand-rolled seeds in `src/shared/data/seeds/*.ts` via the shim `useStaticQuery` (`src/shared/data/queries/useStaticQuery.ts`).
- **TanStack Query is NOT installed.** `useStaticQuery` is a synchronous `{ data, isLoading: false, isError: false }` shim explicitly designed to be replaced by `useQuery` later (file comment).
- RLS policies: documented as a matrix in `docs/SCHEMA.md` §6 + `docs/SUPABASE_RLS.md` (12 lines, checklist only). **Zero policies actually exist anywhere executable.**

### Auth provider, identity, sessions
- **@supabase/supabase-js 2.49** is installed. Two clients exist:
  - `src/lib/supabaseClient.ts` — used by `/coach` and `/athlete` routes (older shell).
  - `src/features/app/lib/supabase.ts` — used by `/app` routes (newer mobile shell). Includes a `signInWithGoogle()` OAuth helper.
- Both initialize from `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`; if either is missing, the client is `null` and the app silently runs in "demo" mode.
- **Two parallel auth stores** (different surfaces, never reconciled):
  - `src/shared/store/useAuthStore.ts` — pre-seeded with `SEED_COACH` when Supabase isn't configured. `authBridge.ts` hardcodes role `'coach'` and Pacific Women's `teamId` for any Supabase user. `authInit.ts` subscribes to `onAuthStateChange`.
  - `src/features/app/store/useAppAuthStore.ts` — localStorage-backed (`synth:app:role`, `synth:app:demoUser`, `synth:onboarding:done`). Calls `signInAnonymously()` opportunistically so demo users still get a JWT for the Edge Function.
- Login pages: `src/features/auth/LoginPage.tsx` (one-click → demo coach), `SignUpPage.tsx`, `JoinWithInvitePage.tsx` (no real invite verification).
- **No password reset, no MFA, no SSO/SAML, no email verification.** No real session expiry handling beyond what Supabase JS provides natively.

### Hosting / deployment
- **Vercel.** `vercel.json` sets `framework: vite`, SPA rewrites, security headers, CSP allowing `*.supabase.co` + PostHog. `.vercel/project.json` exists.
- Project is on branch `feature/anthropic-wiring`. Memory note: every push auto-deploys to `synth-platform-alt.vercel.app`.
- **Two parallel app shells** are deployed at the same domain:
  - `/coach/*`, `/athlete/*` — original desktop-first surface (older codebase).
  - `/app/coach/*`, `/app/athlete/*` — newer mobile-first PWA surface with onboarding flow (`AppShell` + `AppCoachShell` + `AppAthleteShell`).
  - The `/app` shell is what `vite.config.ts` `start_url: '/app'` points the PWA at.

### AI / LLM dependencies
- **NO Anthropic SDK is installed.** `package.json` has no `@anthropic-ai/sdk`, no `@anthropic-ai/claude-code`, no `@anthropic-ai/agent-sdk`, no `openai`, no `@vercel/ai`, no `ai` (Vercel AI SDK).
- All Claude calls are raw `fetch()` against either:
  - `https://api.anthropic.com/v1/messages` directly with `x-api-key: VITE_ANTHROPIC_API_KEY` (browser-side, dev only — `src/lib/ai/directClient.ts`). Vite proxies `/api/anthropic/*` server-side in dev to dodge CORS (`vite.config.ts:73`).
  - The Supabase Edge Function `claude-chat` (`src/lib/ai/claude.ts`).
- Model registry: `ANTHROPIC_MODELS` const (`src/lib/ai/claude.ts:14`) lists `haiku` (`claude-haiku-4-5-20251001`), `sonnet` (`claude-sonnet-4-20250514`), `opus` (`claude-opus-4-6`), `opusStable` (`claude-opus-4-20250514`). `selectModel()` heuristic picks one based on query length / keywords / context size.
- Prompt scaffolding: `src/lib/ai/prompts.ts` (coach + athlete system prompts, embeds seed-derived team summary). Newer adapter `src/features/app/lib/aiClient.ts` adds tone/reference customization, `[c:Source|Subject|Date]` citation markers, and `[chart:Title|...]` chart markers — parsed back out by `aiResponseParser.ts` into structured `ChatPart[]`.
- Streaming: hand-rolled SSE parser. No tool-use, no extended thinking, no prompt caching, no agent loop, no MCP. Single-turn `messages.create` only.

### Code-execution / sandboxing / eval infra
- **None.** No Sandpack, no WebContainer, no Stackblitz SDK, no in-browser TS compiler (no Babel/sucrase/swc-wasm in deps), no Function constructor calls, no `eval()`. Search `grep -RIn "iframe\|new Function\|eval(" src` returns exactly **one** match: `src/features/productDemo/ProductDemoPage.tsx:35` — a static `<iframe>` pointing at a marketing demo HTML page.
- Vibe-code generation requires this infrastructure to be built from zero.

---

## 2. CUSTOM TOOLS PAGE — CURRENT STATE

There are **two** distinct Custom Tools surfaces in the codebase, on the two shells.

### A. `/coach/tools/*` — desktop shell (older)
- Driven by **`src/features/coach/tools/toolRegistry.tsx`** (`COACH_TOOLS: CoachTool[]`). Two entries hard-coded today:
  1. `lineups` → `src/features/coach/tools/lineups/LineupsPage.tsx`
  2. `session-timer` → `src/features/coach/tools/sessionTimer/SessionTimerPage.tsx`
- The registry is consumed in two places: `src/app/routes.tsx:216` (route generation) and `src/shared/layout/Sidebar.tsx` (nav). Adding a tool = one entry + one illustration in `sidebarIllustrations.tsx`.
- A "Request a tool" modal exists at `src/shared/layout/RequestToolModal.tsx`. It's a name + use-case form whose submit handler is `setSubmitted(true) → setTimeout(() => close(), 1400)` — i.e. a fake. Nothing persists, no email is sent, no backend hit.
- Sidebar has a "+ Add tool" entry (`src/shared/illustrations/sidebarIllustrations.tsx → AddToolIllustration`) that opens this modal via `useUiStore.openRequestTool()`.
- **There is no actual "Custom Tools" page on `/coach/*`** — only Lineups and Session Timer rendered as their own routes via the registry.

### B. `/app/coach/tools` — mobile shell (newer)
- File: **`src/features/app/coach/CustomToolsPage.tsx`** (~860 lines, mostly inline UI components).
- Three tabs: **Installed | Coming soon | Request**.
- **Installed catalog** (`INSTALLED: InstalledTool[]`, line 50): exactly one entry — Lineup Builder linking to `/app/coach/lineups`. Each tool has a hardcoded `version` string and `loadMs` chip ("v1.4.2", "84 ms").
- **Coming Soon catalog** (`COMING_SOON`, line 67): 7 hardcoded entries with ETA strings — Stopwatch, Race Recorder, Lineup Compare, Drill Library, Boat Speed Predictor, Heat Sheet Importer, Race Plan Generator. Lock icon, no real gating.
- **Request tab** (`RequestPane`, line 697): a `<textarea>` with 500-char limit, a Submit button, plus 6 suggested-idea chips (`REQUEST_IDEAS`: video coaching review, wellness triage, erg comparator, recovery coach, ranking board, parents digest). Submit handler: `submitRequest(idOrText) → toast('Request received…') → setRequestText('')`. **No persistence anywhere.** No DB row, no email, no Anthropic call, no analytics event beyond the local toast.
- Athlete equivalent at `src/features/app/athlete/AthleteToolsPage.tsx` (Erg Pacer + Form Video installed; Drill Library / Recovery Coach / Goal Tracker etc. coming-soon).

### Data model for "tools"
- `CoachTool` type in `toolRegistry.tsx:22` is purely client-side (`{ id, label, description, path, absolutePath, Glyph, routeLabel, Component }`). It is NOT a database row — components are statically `lazy()`-imported.
- `ToolBase` / `InstalledTool` / `ComingSoonTool` types in `CustomToolsPage.tsx:28-48` are local-file-only shapes, also static.
- **There is no `tools`, `tool_requests`, or similar table** in `docs/SCHEMA.md`. The vibe-code feature would require new schema.

### User flow today
1. Coach opens `/app/coach/tools` (or sidebar → Tools on `/coach`).
2. Browses static Installed list (1 tool) and Coming-Soon list (7 stubs).
3. Optionally clicks Request, types into a textarea or picks a chip, hits Submit.
4. A toast says "Request received — we'll keep you posted on '<text>'". The text vanishes.
5. **End.** No coach has ever caused a tool to be generated, queued, scheduled, reviewed, or shipped through this UI.

### Placeholders / TODOs in this surface
- `CustomToolsPage.tsx:608`: `toast(\`${tool.name} settings — wire-up coming soon\`)`.
- `CustomToolsPage.tsx:292`: footer literally says `synth · tools · v0.4 · build {ISO date}`.
- `RequestToolModal.tsx:99`: subtitle copy "Describe a tool your program needs — we'll evaluate for the registry." (manual evaluation implied).

---

## 3. CONNECTORS LAYER

### Connectors visible in product UI (catalog)
`src/features/app/data/mockConnectors.ts` defines `COACH_CONNECTORS: ConnectorMock[]` — **11 entries** with display metadata + per-tool permission lists:

| Connector | Category | OAuth state |
|---|---|---|
| Concept2 Logbook | Erg | **mocked** |
| Strava | Outdoor | **mocked** |
| TrainingPeaks | Planning | **mocked** |
| WHOOP | Recovery | **mocked** |
| Apple Health | Wearable | **mocked** |
| Garmin | Wearable | **mocked** |
| Gmail | Comms | **mocked** |
| Google Sheets | Spreadsheet | **mocked** |
| Oura | Recovery | **mocked** |
| Bridge Athletics | S&C | **mocked** |
| Google Calendar | Planning | **mocked** |

`ATHLETE_CONNECTORS` is a subset (Concept2, Strava, WHOOP, Apple Health, Garmin, Oura).

`SourceType` in `src/shared/data/types.ts:49` is the older taxonomy: `extension | google_sheets | google_drive | slack | teamworks | wearable | email_digest | manual_upload`. `ConnectorProvider` (line 305) is the §9 schema's richer set: `google_sheets | google_calendar | concept2_logbook | strava | apple_health | health_connect | whoop | garmin | oura | trainingpeaks | slack`.

### Real OAuth wired
- **Zero.** Every "connect" path goes through `src/shared/data/connectors/connectorService.ts`:
  ```ts
  export async function connectConnector(provider) {
    log.info('connector.connect (stub)', provider)
    await new Promise((r) => setTimeout(r, 400))
    return { ok: true, message: `${provider} connected (demo — wire OAuth on the server).` }
  }
  ```
  `syncConnector` is the same with a 300 ms delay. Both functions return `ok: true` unconditionally.
- The only real OAuth call anywhere in `src` is `signInWithGoogle()` for Supabase **user** auth — not for any data connector.

### Where connector data lives
- In seeds only:
  - `SEED_SOURCES` (`src/shared/data/seeds/index.ts:121`) — 4 hardcoded `Source` rows (Erg workbooks, TeamWorks, Wearable hub, Email digests) tagged to Pacific Women's Rowing team.
  - `SEED_CONNECTOR_ACCOUNTS` (line 299) — 4 mock `ConnectorAccount` rows (google_sheets, google_calendar, concept2_logbook, strava).
  - `SEED_TIMELINE_EVENTS` (line 276) — 2 events.
  - `SEED_AI_IMPORT_JOBS` (line 334) — 1 row, status `preview`.
- A persisted client-side store (`src/features/app/data/useSourcesStore.ts`) seeds 8 "connected" sources into localStorage on first load — this is the toggle state for the Sources page on the `/app` shell, **not** a real connection.

### Normalized data shape
- Documented in `docs/SCHEMA.md` §2 `source_data` (typed JSONB per `data_type`) and §9 `athlete_timeline_events` (canonical event row, `data_json` payload + `confidence` + `raw_data_json`).
- TypeScript projection in `src/shared/data/types.ts`: `Source`, `ScanLog`, `ErgScore`, `GymSession`, `WellnessCheckin`, `StravaActivity`, `SleepHrvEntry`, `AthleteTimelineEvent`, `ConnectorAccount`, `AiImportJob`, `MetricSnapshot`, `WritebackIntent`.
- Conflict resolution scaffolding: `src/shared/data/ingestion/conflicts.ts`, `units.ts`, `timeline.ts` — small (<1 KB each), not wired to anything beyond exports.

---

## 4. CORE PRODUCT SURFACES — STATE OF EACH

| Surface | File(s) | State |
|---|---|---|
| **Coach Dashboard** (`/coach/dashboard`) | `src/features/coach/dashboard/DashboardPage.tsx` (+ `components/`) | **Functional on seed data.** Stats strip, trend charts (Recharts), roster table, alerts, activity feed, AI insight block. Every value is hardcoded or seed-derived. |
| **Coach Home** (`/app/coach/home`) | `src/features/app/coach/HomePage.tsx` (~17 KB) | **Functional on seed data.** Mobile-first hero swiper. Lineup hero panel `lineupHero/`. |
| **Athletes grid** (`/coach/athletes`) | `src/features/coach/athletes/AthletesPage.tsx` | **Functional on seed data.** 46 cards from `SEED_ATHLETES`. Search, filter. |
| **Athlete profile (coach view)** (`/coach/athletes/:id`) | `src/features/coach/athletes/AthleteProfilePage.tsx` (~45 KB) | **Functional on seed data.** YoY chart, sessions/lineups/wellness/notes tabs all read from `useAthleteProfileExtras` hooks. Sessions card is a placeholder waiting for Session Timer to write real splits per `docs/TODO.md` §6b. |
| **Athlete profile (mobile)** (`/app/coach/athlete/:id`) | `src/features/app/coach/AthleteDetailPage.tsx` (~56 KB) | **Functional on seed data.** Largest single component in the repo. |
| **Lineup builder** (`/coach/tools/lineups`) | `src/features/coach/tools/lineups/LineupsPage.tsx` + `components/` | **Functional, not persisted.** Drag/drop boat builder via @dnd-kit. Publish button writes only to `useLineupsStore` (Zustand, not persisted to localStorage). History tab reads from same store. |
| **Lineup builder (mobile)** | `src/features/app/coach/LineupsPage.tsx` + `lineupHero/` | **Functional, store-backed.** Uses `lineupBuilderStore.ts`. |
| **Session Timer** (`/coach/tools/session-timer`) | `src/features/coach/tools/sessionTimer/SessionTimerPage.tsx` | **Functional on session.** RAF stopwatch via `useStopwatch`. Wake Lock acquired (`navigator.wakeLock.request('screen')`). Multi-boat splits. Video recording is a `setRecording(true)` stub — no MediaRecorder, no upload. State in `useSessionTimerStore` (in-memory). |
| **Session Timer (mobile)** | `src/features/app/coach/SessionTimerPage.tsx` (~29 KB) | **Functional on session.** Same architecture. |
| **Race Recorder (mobile)** | `src/features/app/primitives/RaceRecorder.tsx` (~26 KB) | **Functional UI.** Recording is still stubbed at the storage layer. |
| **Wellness check-ins** | `src/shared/data/seeds/wellness.ts` (`SEED_WELLNESS`) | **Read-only seed.** Surfaced inside athlete profile cards and mobile attention items. **No coach-facing or athlete-facing form to submit a check-in exists.** |
| **Sources page** (`/coach/sources/connectors`) | `src/features/coach/sources/SourcesPage.tsx` + `ConnectorsDataViewPage.tsx` (57 KB) | **Functional on seeds.** Renders `SEED_SOURCES`. "Add source" opens AgentModalPortal (which itself talks to the stub `connectConnector`). Scan history is `SEED_SCAN_LOGS` with handwritten markdown reports. |
| **synth. Agent (modal)** | `src/shared/layout/AgentModalPortal.tsx` (~32 KB) | **Functional on seeds.** Three tabs (Sources / Scans / Add). Connect buttons hit the stub. Scan reports render as MD. |
| **synth. AI chat — Coach (`/coach/ai`)** | `src/features/coach/ai/TeamChatPage.tsx`, `ChatView.tsx`, `cannedResponses.ts` | **Functional with real Claude OR canned fallback.** When Claude is configured, streams from Edge Function or direct browser path; otherwise `generateCannedReply()` keyword-matches against seeds. Chat threads are in-memory (`useChatStore` Zustand, not persisted). |
| **synth. AI chat — Mobile** | `src/features/app/coach/AIPage.tsx` (~23 KB), `src/features/app/primitives/AIChat.tsx` (~39 KB) | **Functional with real Claude.** Richer parser (`aiResponseParser.ts`) for `[c:...]` citations and `[chart:...]` line charts. |
| **Athlete view (`/athlete/*`)** | `src/features/athlete/athletePages.tsx` (~25 KB), `athleteAppPages.tsx` (~149 KB) | **Functional on seed athlete "Star Miller".** All 7 sub-routes render. No live data. |
| **Onboarding** (`/app/onboarding/*`) | `src/features/app/onboarding/*.tsx` (12 pages) | **Functional UI flow.** Welcome → role → sport → team setup → capabilities → connectors → trust → scanning → reveal → tour. Persistence is `useCoachOnboardingStore` / `useAthleteOnboardingStore` (Zustand). No backend writes. |
| **Landing page** (`/`) | `src/features/landing/LandingPage.tsx` (~30 KB), `Hero3D.tsx`, `StepMockups.tsx` | **Functional.** PWA install prompt (`useInstallPrompt.ts`). No video, no FAQ, no real waitlist backend. |
| **Notes (coach + athlete)** | `src/features/app/coach/NotesPage.tsx`, `athlete/NotesPage.tsx` | **Functional UI on seeds.** `useCoachNotesStore` + `SEED_COACH_NOTES`. |
| **Stream chat (team messaging)** | `src/components/chat/CoachTeamMessaging.tsx` | **Mounted, requires `VITE_STREAM_API_KEY`.** Uses `stream-chat` + `stream-chat-react`. Token issuance helpers in `src/lib/stream/tokens.ts`. Not visible to me whether a real Stream app id is provisioned in production. |

**Production-ready: 0.** **Functional on seed/mock: ~all of the above.** **Mocked at the data boundary: every source / every chat scope when Anthropic key is absent / every persistence layer except `useSourcesStore`.**

---

## 5. SCHEMA + AUTH SUMMARY

### Postgres tables (per `docs/SCHEMA.md` — none provisioned)

**§1 Identity**: `teams`, `users`, `athletes`, `team_settings`, `user_settings`.
**§2 Sources & syncing**: `sources`, `scan_logs`, `source_data`.
**§3 Sessions**: `sessions`, `session_boats`, `session_lineups`, `session_splits`, `session_media`.
**§4 Athlete metric projections**: `erg_scores`, `gym_sessions`, `gym_exercises`, `wellness_checkins`.
**§5 synth. AI**: `chat_threads`, `chat_messages`.
**§9 Production extensions**: `athlete_timeline_events`, `raw_ingest_payloads`, `connector_accounts`, `sync_runs`, `identity_aliases`, `identity_match_queue`, `source_priority_overrides`, `metric_snapshots`, `alert_instances`, `extension_waitlist_signups`, `ai_import_jobs`, `connector_write_back_queue`.

Total: ~30 tables documented. **None exist in any Supabase project that's wired to this repo.** Migrations folder absent.

### RLS policies in place
- **Zero policies executable.** Documented matrix only (`docs/SCHEMA.md` §6). `docs/SUPABASE_RLS.md` is a 12-line checklist instructing future-self to enable RLS, follow the matrix, never expose `service_role`, lock down `raw_ingest_payloads` / `connector_accounts` / `connector_write_back_queue` to coach/staff.

### Identity flow
1. **Demo mode (no Supabase env):** `useAuthStore` is pre-seeded with `SEED_COACH` (id `user-coach-cal-womens`, team `team-cal-womens-rowing`). `useAppAuthStore` reads localStorage.
2. **Supabase mode:** `initAuth()` (`src/shared/store/authInit.ts`) calls `subscribeSupabaseAuth()` which hits `supabase.auth.getSession()` + `onAuthStateChange()`, then maps the Supabase user to the app's `User` shape via `mapSupabaseUserToUser()` in `src/lib/authBridge.ts:8`. **That mapper hardcodes `role: 'coach'` and `teamId: SEED_COACH.teamId`** — no DB lookup, no `users` row read.
3. The newer `useAppAuthStore.setDemoUser()` (`src/features/app/store/useAppAuthStore.ts:62`) calls `supabase.auth.signInAnonymously()` opportunistically so demo users still get a JWT to invoke the `claude-chat` Edge Function.
4. The Edge Function presumably verifies the JWT before calling Anthropic (claim made in `src/lib/ai/claude.ts:1-8`; the function source isn't in this repo so I cannot verify).

### OAuth scopes per connector
- **Not implemented.** The only OAuth scope string in code: `scopes: 'openid email profile'` in `src/features/app/lib/supabase.ts:36` for Google **user** sign-in.
- `mockConnectors.ts` enumerates aspirational tool/permission lists per connector ("Read recovery score", "Read HRV", "Read kudos") but these are display labels, not OAuth scopes.

---

## 6. ENVIRONMENT

### `.env` keys (names only — values redacted)
From `.env.example`, `.env`, and `.env.local` (the latter has live values for the dev box; not reproduced):

| Key | Purpose | Where read |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | `supabaseClient.ts`, `app/lib/supabase.ts`, `lib/ai/claude.ts` |
| `VITE_SUPABASE_ANON_KEY` | Public anon key | same |
| `VITE_ANTHROPIC_API_KEY` | **DEV-ONLY** browser key for direct Claude path | `src/lib/ai/directClient.ts`, `env.ts` |
| `VITE_STREAM_API_KEY` | Stream Chat public key | `src/lib/stream/client.ts`, `env.ts` |
| `VITE_FEATURE_SHEETS_WRITEBACK` | Feature flag (default true) | `src/lib/featureFlags.ts` |
| `VITE_FEATURE_AI_IMPORT` | Feature flag (default true) | same |
| `VITE_LOG_LEVEL` | `debug \| info \| warn \| error` | same |
| `VITE_POSTHOG_KEY` | PostHog project key | `src/shared/analytics/posthog.ts` |
| `VITE_POSTHOG_HOST` | Defaults to `https://us.i.posthog.com` | same |

`.env` (committed-feeling) contains a PostHog key. `.env.local` (in `.gitignore` via `*.local`) has the working Supabase + Stream + Anthropic + PostHog values.

> **Important caveat:** every `VITE_*` var is **inlined into the public JS bundle** (Vite behavior, called out in `.env.local`). The `VITE_ANTHROPIC_API_KEY` shipped in any production build of this code would be readable by anyone. The codebase is aware of this — direct path is gated for dev only and the Edge Function is the production path.

### External services connected
- **Supabase** — auth + Edge Function (`claude-chat`). DB tables not provisioned.
- **Anthropic** — directly or via Edge Function.
- **Vercel** — hosting.
- **PostHog** — analytics + session replay (`autocapture: true`, `session_recording.maskAllInputs: false`).
- **Stream Chat** — wired (lib + component) but only active when `VITE_STREAM_API_KEY` is set.
- **Stripe** — **not integrated.** No `stripe`/`@stripe/*` in `package.json`. Pricing page is decorative.
- **Sentry** — **not integrated.** Single reference in `src/shared/layout/ErrorBoundary.tsx:33` is a comment ("In a real backend this would ship to Sentry / Logflare").

### CI/CD
- `.github/workflows/ci.yml` — Node 22 + `npm ci` → `npm run lint` → `npm run build` (tsc + Vite) → `npm run test` on PR + push to `main`. No staging/preview job, no deploy job (Vercel handles deploys via its GitHub integration directly).
- `.github/workflows/claude-code-review.yml` — runs Anthropic's `code-review` plugin on PR open/sync via `claude-code-action@v1`, requires `CLAUDE_CODE_OAUTH_TOKEN` secret.
- `.github/workflows/claude.yml` — `@claude` mention bot for issues / PR comments.

### Test coverage state
- One file: `src/shared/intelligence/metrics.test.ts` (1.5 KB, ~6 unit tests on the deterministic metric helpers).
- No component tests, no integration tests, no E2E, no a11y tests, no API contract tests.
- Coverage % effectively zero against the application surface.

---

## 7. KNOWN GAPS + TODOS

The repo's own `docs/TODO.md` (303 lines, last updated 2026-04-17 per file header) is the authoritative gap list. Highlights blocking the vibe-code feature today:

### From `docs/TODO.md`
- §1 Backend Foundation: Supabase project not provisioned; no migrations applied; RLS not implemented; TanStack Query not installed; settings don't persist.
- §2 Auth & Onboarding: `authBridge.ts` hardcodes role + team; no real invite flow; no password reset; no MFA/SSO.
- §3 Connectors: every connector is a stub; no AI photo/voice/paste pipeline; CSV upload absent; write-back queue prints to console.
- §4 AI: chat persistence is in-memory; canned responses still active for `scope === 'self'`; no citation grounding to real `source_data_id`; no streaming athlete guardrails (athlete chat could in theory see whatever is fed to it).
- §6f Settings: every toggle resets on refresh.
- §10 Testing: 6 unit tests, nothing else.
- §11 Production hardening: no error tracking, no rate limiting, no FERPA workflow, no privacy policy / ToS, no staging environment.

### Code-level TODOs
A `grep` for `TODO|FIXME|XXX` in `src/**/*.{ts,tsx}` returns **zero matches** — the team uses long block comments and `(stub)` log-tags rather than `// TODO:` markers. Real placeholders to find them by:
- `connectorService.ts` literal `(stub)` markers + 400 ms `setTimeout`.
- `useStaticQuery.ts` comment "Replace this file with a re-export of `useQuery`".
- `cannedResponses.ts` whole module description: "Swap this module for a real LLM call when the backend lands".
- `RequestToolModal.tsx` `setTimeout(() => close(), 1400)` simulating success.
- `CustomToolsPage.tsx:608` `toast('… settings — wire-up coming soon')`.
- `digestScheduler.ts` is documented in TODO §4b as a placeholder string.

### Half-finished things to flag
- **Two parallel app shells** (`/coach`+`/athlete` vs `/app/coach`+`/app/athlete`). They have separate auth stores, separate sources stores, separate AI clients, separate routes. There is no documented merger plan in `docs/`.
- **`scanLogs.ts`** seed contains hand-written markdown reports rendered as if they were real scan output. Easy to confuse with live data when reviewing.
- **`SEED_AI_IMPORT_JOBS`** (one row, status `preview`) implies an AI import preview UI — `useAiImportJobs.ts` exists but there is no actual import-then-confirm flow wired anywhere.
- **Stream chat** is in `package.json` and has client/token plumbing but I see no UI route that actually mounts `CoachTeamMessaging`.

### Things that would block shipping a vibe-code feature today
1. No persistence layer for tool requests, generated artifacts, or run history.
2. No code-execution or sandbox infrastructure of any kind.
3. No server (no Edge Function, no `/api`, no Worker) that can hold a v0 API key or Claude Agent SDK key. The single `claude-chat` Edge Function is a thin proxy and its source isn't in this repo.
4. No TS compilation pipeline for arbitrary user code (Vite is build-time only).
5. No file storage (no Supabase Storage bucket referenced in code; `session_media.file_url` referenced in schema but unused).
6. No isolation between athlete-scoped data and arbitrary code that might be generated under coach scope (no RLS).
7. No tooling to evaluate generated code (no linter wired to runtime, no type-check sub-process, no schema-conformance check).
8. No component library a generated tool could compose against — the codebase has many bespoke UI primitives in `src/features/app/primitives/` and `src/shared/components/` but nothing extracted as a stable, documented, type-safe API.

---

## 8. WHAT'S MISSING TO ADD VIBE-CODE GENERATION

### (a) v0 Platform API integration
What it would need:
- A server-side caller. `vercel.json` is SPA-only; there's no Next.js API or Vercel Function. Either: (i) add a Vercel Edge Function alongside this repo, (ii) deploy the `claude-chat` Edge Function pattern again as `v0-generate`, or (iii) introduce a Next.js App Router migration. **None exist today.**
- Secret storage for the v0 API key. Cannot live in `VITE_*` (would ship to bundle).
- A request schema persisting tool intent → v0 job id → polling/SSE consumer in the browser.
- Persistence: a `tool_requests` table (not in `docs/SCHEMA.md`), with statuses `draft | generating | review | published | failed | rejected`.
- A diff/preview UI to show what v0 produced before adopting it. None exists.
- Authoring conventions to map v0's React+Tailwind+shadcn output onto synth's `THEME` tokens, JetBrains Mono / Fraunces / Instrument Sans typography stack, Framer Motion presets, custom SVG illustrations, and existing primitives.

### (b) Claude Agent SDK integration
What it would need:
- The `@anthropic-ai/sdk` (or `@anthropic-ai/claude-agent-sdk`) package — **neither is installed.** Today the app calls Anthropic via raw fetch.
- Server-side runtime — the Agent SDK is Node-side; cannot run in the browser. Same hosting gap as (a).
- Tool-use schema: a registry of synth-aware tools the agent can call (`query_athlete(id)`, `query_sessions(filters)`, `connector_health()`, `register_tool(spec)`). None defined.
- A multi-turn agent loop with checkpoint persistence. The current `streamCompletion` adapter (`src/features/app/lib/aiClient.ts`) is single-turn, no tool use, no thinking blocks, no MCP hookup, no extended thinking, no batched messages, no prompt caching.
- A safe context-loading strategy. Today system prompts inject seed-derived team summaries via JSON.stringify (`buildSystemPrompt`), with a hardcoded ~10 KB ceiling for context size signaling in `selectModel()`. A vibe-code agent will need much larger, more structured context.

### (c) Validation pipeline that gates generated code
Need to build from zero:
- **TypeScript compile check** — no in-process TS compiler exists. Options: ship a wasm `tsc` (~6 MB), call a server-side `tsc` job, or run via `esbuild` (also not installed). All three need new infra.
- **Schema compliance** — no runtime schema validator (`zod` / `valibot` / `arktype`) is installed. Generated code that touches `athlete_id`, `team_id`, `session_id`, etc. needs to be checked against `docs/SCHEMA.md` types — and the types in `src/shared/data/types.ts` aren't exported as a single canonical contract a generator can consume.
- **Auth-scope check** — RLS doesn't exist; there's no programmatic way to assert that generated SQL or generated `supabase.from(...)` calls only read data the executing role is allowed to see.
- **Sandbox security** — no iframe sandbox, no `Worker` isolation, no CSP-narrowed sub-origin (current CSP allows `*.supabase.co`, `posthog.com`; nothing more locked down). For untrusted compiled code: would need a `sandbox=""` iframe on a separate origin (Vercel doesn't make that trivial) or a heavily audited CSP per tool.
- **Static analysis** — eslint runs in CI on the human codebase but isn't wired as a runtime check. Nothing prevents generated code from importing arbitrary npm modules.

### (d) Sport-specific component library to pre-load as context
What exists today (would need to be packaged into a generator-readable shape):
- Theme tokens: `THEME` (`src/lib/theme.ts`), `SYNTH` (`src/features/app/lib/theme.ts`), CSS variables.
- Motion presets: `src/lib/motion.ts`.
- Custom illustrations: `src/shared/illustrations/sidebarIllustrations.tsx`.
- Mobile primitives: 49 files in `src/features/app/primitives/` (BoatLineupCard, ConnectorLogo, AthletePickerSheet, RaceRecorder, AIChat, SheetShell, FloatingTabBar, etc.). Most are large bespoke components without isolated prop documentation.
- Shared primitives: `src/shared/components/` (Avatar, Skeleton, QueryError, OnboardingShell, PageTitle, AuthIllustrations, WritebackConfirmBar) — small set, easy to expose.
- Data types: `src/shared/data/types.ts` (one file, ~360 lines, well-documented).
- Query hooks: `src/shared/data/queries/index.ts` (15 hooks across team, athletes, sources, lineups, timeline, connectors, AI imports).

What does NOT exist:
- No Storybook, no extracted design-system package, no MDX docs per primitive, no JSON manifest of "tools available to a generated component". Building this catalog is itself a 1–3 week task.

### (e) Runtime that renders generated tools as native synth components
Need to build:
- A registration mechanism: today `COACH_TOOLS: CoachTool[]` is a static array — would need to become DB-backed, fetched per team, with stable lazy-loadable component pointers.
- A loader that takes either (i) a built JS bundle URL, (ii) a TSX source string + compile pipeline, or (iii) a JSON-spec → React-renderer (lowest blast radius).
- A route mounter that adds `/coach/tools/:slug` dynamically. React Router 7 supports nested routing config but `routes.tsx` is currently a static const — would need to rebuild as a runtime config or use `useRoutes()` over a fetched list.
- A permissions / scope wrapper so a generated tool can only access the team's scoped data via an injected client (today every page just imports seeds directly).
- A telemetry harness to track usage, errors, and bind to PostHog / Sentry equivalents. None exists for "tool"-shaped events today.

---

## 9. ONE-PARAGRAPH HONEST SUMMARY

synth-platform is, today, a richly-built **frontend prototype** of a B2B coaching platform — two parallel app shells (desktop `/coach`+`/athlete` and mobile-first `/app/*`), ~50 routes, 49 mobile primitives, a fully-rendered onboarding flow, a Lineups builder with @dnd-kit, a Session Timer with Wake Lock, and a working Claude-streaming chat — all running entirely on hand-rolled seed data with **zero provisioned database, zero working OAuth, zero persistence beyond Zustand and a few localStorage keys, and zero code-execution / sandboxing infrastructure**. The Custom Tools pages are static catalogs; the Request flow is a `setTimeout`-and-toast. Auth is a hardcoded role mapper. Connectors are `setTimeout(400)` returning `{ ok: true }`. The only real backend touchpoint is a single `claude-chat` Supabase Edge Function (whose source isn't in this repo) used as a thin Anthropic proxy via raw `fetch` — no Anthropic SDK, no Agent SDK, no tool-use, no MCP. To ship a vibe-code feature in **8–14 weeks** is achievable **only if scope is held tight**: pick one generation engine (v0 OR Agent SDK, not both in sequence), pick the safest renderer (JSON-spec → component, not arbitrary TSX), accept that "validation" v1 is type-checking the spec rather than compiling user code, build the new schema (`tool_requests`, `tool_versions`, `tool_runs`), stand up *one* server-side runtime to hold the generation key (a second Supabase Edge Function is the path of least resistance given everything else here), and freeze the design-system surface that the generator targets. Expect 4 weeks of foundational backend + auth + RLS work the existing `docs/TODO.md` already calls out as blocking, *then* 4–8 weeks of vibe-code-specific work on top. Sliding to TSX-string compilation, multi-tenant code execution, or v0-and-Agent-SDK in tandem pushes it past 14 weeks comfortably.

---
