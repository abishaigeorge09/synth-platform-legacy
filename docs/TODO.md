# synth. — Production Readiness To-Do List

> Last updated: 2026-04-17
>
> Current state: fully built frontend shell (all 13 UI phases) running on seed data. Zero backend, zero real integrations, zero tests beyond 6 unit tests.

---

## 1. Backend Foundation

> Nothing works without this. Every other tier depends on it.

- **Provision Supabase project** — Create tables from `docs/SCHEMA.md` (DDL already written). Set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in `.env`
- **Run schema migrations** — All tables: `teams`, `users`, `athletes`, `erg_scores`, `sources`, `scan_logs`, `source_data`, `sessions`, `session_boats`, `session_lineups`, `session_splits`, `session_media`, `wellness_checkins`, `gym_sessions`, `gym_exercises`, `chat_threads`, `chat_messages`, `athlete_timeline_events`, `raw_ingest_payloads`, `connector_accounts`, `sync_runs`, `metric_snapshots`, `alert_instances`, `team_settings`, `user_settings`
- **RLS policies** — Implement from `docs/SUPABASE_RLS.md`. Coaches see their team, athletes see only own data, settings scoped by user
- **Swap seeds for real queries** — Install `@tanstack/react-query`, add `<QueryClientProvider>` to `App.tsx`, replace every `useStaticQuery(SEED_*)` with `supabase.from('table').select()`. Hook shape already matches — feature components don't change
- **Persist settings** — Coach + athlete settings currently reset on page reload (Zustand in-memory only). Wire to `team_settings` / `user_settings` tables

---

## 2. Authentication & Onboarding

> Currently: any email/password → instant demo login. No sessions, no tokens, no real accounts.

- **Enable Supabase Auth** — Email/password + magic link. Fix `authBridge.ts` to map `auth.uid()` → `users` table (currently hardcodes `role: 'coach'` and `teamId`)
- **Real sign-up flow** — Coach creates account → creates team → gets invite codes for athletes
- **Real invite flow** — `/join/:code` creates athlete account, links to team, seeds initial profile. Currently accepts any code and navigates to demo
- **Session management** — Token refresh, logout, expired session handling
- **Password reset / forgot password** — Not implemented
- **Coach onboarding wizard** — First-run experience: create team → connect first source → invite athletes. Currently none
- **Athlete onboarding** — First-run after invite: confirm profile, set visibility preferences. Currently none
- **OAuth social login** — Google, Apple sign-in (optional, but expected by users)

---

## 3. Connectors & Data Ingestion

> Currently: `connectConnector()` does `setTimeout(400ms)` → `{ ok: true }`. `syncConnector()` does `setTimeout(300ms)` → demo payload. Zero real API calls.

### 3a. Official Connectors (OAuth + API)

Each connector needs: OAuth flow (Edge Function holding client secrets), data parser, schema mapping, sync runner, error handling.

- **Google Sheets** — #1 priority. Read erg workbook → parse → write to `erg_scores`. Cal Women's data lives here. Bi-directional write-back planned for later
- **Concept2 Logbook** — Rowing machine data (2k times, steady state)
- **Strava** — Activity/workout sync via webhooks
- **Apple Health / Google Health Connect** — Sleep, HRV, steps, heart rate
- **Whoop** — Recovery, strain, sleep scores
- **Garmin Connect** — Multi-sport device data
- **Oura Ring** — Sleep quality, readiness scores
- **Google Calendar** — Practice schedule sync
- **TrainingPeaks** — Workout planning data
- **Slack** — Team communication integration
- **TeamWorks** — Attendance, availability, team ops

### 3b. AI Import Pipelines (Universal Fallback)

- **Photo / screenshot import** — Camera/upload → Claude Vision → extract structured data → coach confirms → write to DB. UI buttons exist in Agent modal but do nothing
- **Voice note import** — Record audio → Whisper transcription → Claude parses splits/observations → coach confirms. Not started
- **Paste text import** — Paste any text → Claude parses into structured data → coach confirms. Not started

### 3c. Manual & File Import

- **CSV / Excel upload** — File upload → parse → map columns → insert. Simplest "get data in" path
- **Manual entry forms** — Coach types split times, wellness checks, notes directly. Write to DB

### 3d. Sync Infrastructure

- **Scheduled syncs** — Supabase cron or Edge Function that re-pulls on coach's configured schedule
- **Idempotent sync** — Cursor per source in `sync_runs` / connector metadata, so re-runs don't duplicate
- **Dedupe layer** — `raw_ingest_payloads.body_hash` check before reprocessing
- **Dead-letter queue** — Failed syncs get `failed` status with retry backoff, not silently dropped
- **Real scan logs** — Replace handwritten markdown reports in `seeds/scanLogs.ts` with actual scan output

### 3e. Write-Back

- **Write-back queue** — `useWritebackStore.confirmAll()` currently just logs to console and clears queue. Wire to real backend write API
- **Sheets write-back** — Lineup changes, session data flow back to coach's Google Sheet
- **Conflict resolution** — Source priority weighting exists in `src/shared/data/ingestion/conflicts.ts` but isn't wired to anything

---

## 4. AI & Intelligence

> Currently: `cannedResponses.ts` does `if (input.includes('2k'))` → hardcoded string. Zero LLM calls.

### 4a. Chat

- **Wire Claude API** — Backend RPC (Edge Function) that takes messages + context (athlete data, scores, alerts) and calls Claude. Response contract `{ content: string, citations: Citation[] }` already defined
- **Context injection** — Feed relevant athlete data, erg scores, alerts, timeline into Claude prompt. Not just raw chat
- **Streaming responses** — SSE or WebSocket streaming for real-time typing. Currently shows response after 420ms fake delay
- **Citation grounding** — Claude responses cite specific data points (source name, sync time, value). Contract exists but needs real implementation
- **Athlete guardrails** — Athlete-scoped chat should only see their own data, never other athletes'
- **Chat persistence** — `useChatStore` is in-memory only. Wire to `chat_threads` / `chat_messages` tables
- **Conversation history** — Previous chat threads loadable from DB, not lost on page refresh

### 4b. Intelligence Algorithms

Algorithms are documented in `docs/DATA_INTELLIGENCE.md`. Core functions exist in `src/shared/intelligence/metrics.ts` with unit tests, but nothing feeds them real data.

- **Training Load Score (0-10)** — Weighted sum of water/erg/gym/cross loads. Function exists, needs real inputs
- **Recovery Readiness (0-100)** — Sleep + HRV + wellness + fatigue. Function exists, needs real inputs
- **Performance Trend Detection** — Rolling averages + regression on splits, weights, times
- **Overtraining / Injury Risk** — Flag athletes with load spikes + declining HRV + poor sleep + high soreness
- **Lineup Optimization Suggestions** — Recommend boat assignments based on form + pair history + recovery
- **Athlete Comparison Engine** — Side-by-side analysis across all sources
- **Missing Data Detection** — Flag when expected data isn't present (e.g., no wellness check in 4 days)
- **Anomaly Detection** — Statistical outlier detection per athlete per metric
- **Periodization Awareness** — Adjust thresholds based on season phase (pre-season, taper, race prep)
- **Weekly Synthesis Report / Digest** — Monday email: headline metrics, top performers, flags, team trends, data quality. `digestScheduler.ts` is a placeholder string

---

## 5. Landing Page & Public-Facing

> Currently: hero + features grid + pricing + CTAs. No video, no FAQ, no real waitlist backend.

### 5a. Content

- **Product demo video** — Record or create a walkthrough video for the landing page. Currently links to `/product-demo` (an embedded HTML mockup), but no actual video
- **FAQ / Help section** — Accordion with common questions (What data sources? Is my data safe? How does pricing work? What sports?). Not implemented anywhere
- **Help center / documentation** — In-app help for coaches and athletes. No help page exists
- **Testimonials / case studies** — Cal Women's Rowing pilot story. Landing page has no social proof section
- **Blog / content hub** — Optional but expected for SEO and credibility
- **Contact form** — Only reference is `supportsynth@gmail.com` in pitch deck. No actual contact page or form

### 5b. Pricing & Payments

Landing page shows 3 tiers (Pilot $0, Club $199/mo, Program $499/mo) but:

- **Stripe integration** — No payment processing. Pricing CTAs link to `/product-demo` or `/login`
- **Plan management** — No way to upgrade/downgrade, view billing, cancel
- **Feature gating by plan** — No enforcement of plan limits (3 connectors on Pilot, 60 athletes on Club, etc.)
- **Free trial flow** — Pilot tier says "free for 3 programs" but no trial mechanics exist

### 5c. Waitlist & Early Access

- **Email capture backend** — Extension "Coming Soon" has a waitlist input in Agent modal, but it doesn't persist anywhere
- **Landing page CTA backend** — "Download" triggers PWA install prompt, but "Get started" type flows need account creation

---

## 6. Coach Features — Gaps in Existing UI

> The UI exists for all of these, but critical pieces are fake or missing.

### 6a. Dashboard

- **Real stats** — TeamOverviewStrip shows hardcoded numbers (athlete count, active sessions, pending syncs). Wire to live DB counts
- **Real charts** — TeamTrendsChart uses seed data. Wire Recharts to real `erg_scores` / `metric_snapshots`
- **Real alerts** — AlertsPanel shows seed alerts. Wire to `alert_instances` table with real threshold triggers
- **Real activity feed** — ActivityFeed shows seed activity. Wire to `athlete_timeline_events`
- **AI insight block** — AiInsightBlock shows canned text. Wire to real Claude-generated weekly insight

### 6b. Athletes

- **Real athlete data** — Grid and profiles read from `SEED_ATHLETES`. Swap for DB query
- **Athlete profile — sessions card** — Placeholder waiting for Session Timer to write real splits. Comment: "Phase 6 feeds real splits + video markers here"
- **Athlete profile — lineup history** — Placeholder waiting for Lineups to write published assignments. Comment: "Phase 5 writes published boat assignments"
- **Athlete profile — wellness card** — Shows "Sleep / HRV / recovery" placeholder. Needs wearable connector data
- **Athlete profile — YoY chart** — Uses `SEED_ATHLETE_YOY`. Wire to real historical erg data
- **Athlete profile — 14-day timeline** — Uses seed timeline events. Wire to `athlete_timeline_events`

### 6c. Sources

- **Real connector status** — SourcesPage shows 4 seed sources with fake sync timestamps. Wire to `sources` + `sync_runs` tables
- **Real scan history** — Scan logs are handwritten markdown in `seeds/scanLogs.ts`. Replace with actual sync output
- **Add source flow** — "Connect" buttons call stub service. Wire to real OAuth flows

### 6d. Lineups

- **Persist lineups** — Drag/drop works but lineup assignments are in-memory only. Wire to `session_lineups` table
- **Publish + notify** — "Publish" button exists but doesn't persist or notify athletes
- **Lineup history** — Browsable by date in UI, but data is in-memory. Wire to DB

### 6e. Session Timer

- **Persist sessions** — Timer runs with RAF but splits/times don't write to DB. Wire to `sessions` / `session_splits`
- **Video recording** — "Start video recording" button is a stub. Need MediaRecorder API + object storage for video files
- **Post-session report** — Planned auto-generation of markdown report with piece times, intervals, video chapters, deltas vs previous. Not implemented
- **Wake Lock** — Implemented and working (one of the few real features)

### 6f. Settings

- **Persist preferences** — All toggles (visibility, sync defaults, notifications) are Zustand in-memory. Reset on refresh. Wire to `team_settings` / `user_settings`
- **Email digest config** — Toggle exists, `digestScheduler.ts` returns a placeholder string. Need real cron + email sending
- **Notification preferences** — UI exists but no notification backend

---

## 7. Athlete Features — Gaps

> 7 pages exist, all running on seed data for demo athlete "Star Miller".

- **Real athlete dashboard** — My Team page uses seed data. Wire to real team/roster queries
- **Real personal stats** — My Stats uses `SEED_ERG_SCORES`. Wire to athlete's own `erg_scores`
- **Real session history** — My Sessions uses seed. Wire to `sessions` filtered by athlete
- **Real lineup history** — My Lineups uses seed. Wire to `session_lineups` filtered by athlete
- **Athlete source uploads** — My Sources page exists but upload doesn't persist. Wire to `sources` + file upload
- **Athlete AI chat** — Uses canned responses scoped to "self". Wire to real Claude with athlete-only data context
- **Athlete settings persistence** — Privacy toggles don't persist. Wire to `user_settings`

---

## 8. Notifications & Communication

> Zero notification infrastructure exists.

- **In-app notifications** — Bell icon, notification center, unread counts. Not built
- **Push notifications** — PWA push for mobile. Not built
- **Email notifications** — Lineup published, alert triggered, weekly digest. No email provider configured
- **Alert engine** — Define thresholds (e.g., HRV drop > 15%), trigger `alert_instances`, notify coach. AlertsPanel shows seed data only
- **Lineup publish notifications** — When coach publishes lineup, athletes in that boat get notified. Button exists, does nothing

---

## 9. Browser Extension

> "COMING SOON" banner in Agent modal. Email waitlist capture exists but doesn't persist.

- **Manifest V3 extension** — Chrome extension for in-context data capture from external websites
- **Extension auth model** — Scoped service tokens (working assumption per SCHEMA.md). Formal threat model not finalized
- **Extension ↔ platform bridge** — How extension sends scraped data back to synth. backend
- **Extension store listing** — Chrome Web Store submission

---

## 10. Testing

> Current coverage: 1 test file (`metrics.test.ts`) with 6 unit tests. That's it.

- **Component tests** — React Testing Library for all major components (Dashboard, Athletes grid, Profile, Sources, Lineups, Timer, Chat, Settings)
- **Integration tests** — Auth flow, connector flow, data query flow
- **E2E tests** — Playwright or Cypress for critical user journeys (login → dashboard → view athlete → ask AI)
- **API tests** — Edge Function connector endpoints, chat RPC, auth flows
- **Accessibility tests** — Automated a11y checks (axe-core). Current ARIA coverage is partial (modals, command palette have it; most components don't)
- **CI pipeline** — GitHub Actions for lint + type check + test on PR. `.github/` directory exists but contents not verified

---

## 11. Production Hardening

### 11a. Security

- **Secrets management** — No client-side secrets beyond Supabase anon key. OAuth client secrets in Edge Functions only
- **Input validation** — Validate at system boundaries (user input, API responses, file uploads)
- **Rate limiting** — Chat API, connector sync, file uploads
- **CORS configuration** — Supabase + Edge Functions

### 11b. Compliance

- **FERPA compliance** — Student athlete data protection. Audit logging, data retention, deletion workflows
- **Athlete consent** — Health data consent flow before wearable connectors (Whoop, Apple Health, etc.)
- **Data export / deletion** — "Download my data" + "Delete my account" for athletes. Schema requirement, not implemented
- **Privacy policy + terms of service** — Not written. Required before any real user signs up

### 11c. Observability

- **Error tracking** — Sentry or similar. Current: `console.error('[synth]', ...)` in custom logger
- **Structured logging** — Server-side JSON logs for sync jobs, AI imports, write-backs
- **Performance monitoring** — Core Web Vitals, API latency
- **Usage analytics** — Which features coaches actually use (optional, privacy-respecting)

### 11d. Infrastructure

- **Staging environment** — Separate Vercel project + Supabase project for staging vs production
- **CI/CD pipeline** — Automated deploy on merge to main, preview deploys on PR
- **Database backups** — Supabase handles this, but verify schedule + test restore
- **CDN + asset optimization** — Verify Vercel edge caching, image optimization
- **Uptime monitoring** — Health check endpoint, alert on downtime

---

## 12. Future Scale

> Not needed for launch but documented in product vision.

- **Multi-sport support** — UI hardcoded to rowing. Schema has `sport_data_json` for extensibility
- **Multi-team per user** — v1 assumes one team per user. `team_memberships` join table planned
- **SSO / SAML** — Enterprise tier feature (Program plan). Supabase supports it
- **Admin roles** — Head coach, assistant coach, team manager permissions
- **Custom tool builder** — Tool registry pattern exists. Allow coaches to request/configure sport-specific tools
- **Internationalization (i18n)** — All text hardcoded in English. No language infrastructure
- **Offline-first** — PWA service worker exists but no offline data strategy (IndexedDB sync queue)

---

## Shortest Path to a Working Demo

The minimum to show real value to a coach:


| Step | What                                     | Unblocks                                |
| ---- | ---------------------------------------- | --------------------------------------- |
| 1    | Supabase project + schema + RLS + auth   | Everything                              |
| 2    | Swap seed queries → real DB queries      | Real data on every page                 |
| 3    | Google Sheets connector (OAuth + parser) | Actual erg data flowing in              |
| 4    | Claude API wired to chat                 | AI that answers real questions          |
| 5    | Persist settings + lineups + sessions    | Data survives page refresh              |
| 6    | Product demo video on landing page       | Visitors understand the product         |
| 7    | FAQ section on landing page              | Visitors get answers without signing up |


After steps 1-5, a coach can log in for real, connect their erg spreadsheet, see real athlete data, build lineups that persist, and ask AI real questions about their team.