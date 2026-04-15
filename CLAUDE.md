# CLAUDE.md — synth-platform (full application)

## What this is

This repo is the **full synth. application** — the product itself. Not a prototype, not a demo slide. A coach/athlete data platform where programs connect every tool they already use, synth. scrapes and synthesizes the data, and both coaches and athletes see a unified view.

The build is **UI-first**: every surface is shipping as React/TypeScript against hand-rolled seed data. Auth, extensions, and the database come later — but the TypeScript types and folder structure already match `docs/SCHEMA.md`, so when a backend lands we swap `src/shared/data/seeds/*` for query hooks and nothing in the feature layer changes.

> synth.  — Every data signal. One platform.

**Read these in order before touching code:**

1. `docs/PRODUCT.md` — plain-language product spec. Who it's for, what the five systems are, core user journeys.
2. `docs/SRS-Synth-Platform.md` — functional requirements (FR-AUTH, FR-DASH, FR-CONN, FR-AGENT, FR-FLOW).
3. `docs/SCHEMA.md` — canonical database contract. Every seed file and TS type matches this.
4. `docs/Design-Prototype-Womens-Team-Demo-Data.md` — the Cal Women's Rowing demo data schema.
5. This file — where the code actually lives.

**Related repos**

- **Pitch deck** — `~/presentations/synth-deck/` ([abishaigeorge09/synth-deck](https://github.com/abishaigeorge09/synth-deck)). The 13-slide pitch. Shares brand DNA (theme tokens, motion presets) but is a separate codebase.
- **rowIQ prototypes** — `~/rowIQ/` + `~/rowiq-prototype/`. Reference material only. We port Lineups, Session Timer, and Athlete Profile patterns from there during Phases 5–7.

## Architecture — five systems

synth. is deliberately modular:

1. **Landing page** (`src/features/landing/`) — public marketing + PWA install. Phase 10.
2. **Coach Dashboard** (`src/features/coach/`) — the coach's home. Dashboard, Athletes, Sources, Custom Tools, synth. AI, Settings, synth. Agent modal portal. Phases 2–9.
3. **synth. Agent** (`src/shared/layout/AgentModalPortal.tsx` + `src/features/coach/agent/`) — the connector/scraping engine as a modal overlay. Phase 4.
4. **Custom Tools** (`src/features/coach/tools/`) — sport-specific internal apps. Lineups (Phase 5) + Session Timer (Phase 6) ship for rowing; the ToolRegistry pattern keeps the sidebar extensible.
5. **Athlete view** (`src/features/athlete/`) — separate experience for athletes who join via invite code. Phase 7.

## Stack

```
React 18 + TypeScript + Vite 5
React Router 7                    — SPA routing, nested layouts
Zustand 5                         — client state (auth, team, UI)
Tailwind CSS 4 (via @tailwindcss/postcss)
Framer Motion 12                  — all animation
@dnd-kit/core + sortable          — Lineups drag/drop
Recharts 3                        — dashboard charts
lucide-react                      — secondary icons (primary nav uses custom SVG illustrations)
vite-plugin-pwa                   — PWA install for landing
Fonts: JetBrains Mono · Fraunces · Instrument Sans (Google Fonts)
Deploy: Vercel
```

No chart libraries beyond Recharts. No UI kit. Every primary nav glyph is a hand-rolled custom SVG illustration in `src/shared/illustrations/sidebarIllustrations.tsx` — see the "Sidebar nav illustrations" section below.

## Run

```bash
npm install
npm run dev       # vite --port 5174 --strictPort
npm run build     # tsc -b && vite build
npm run lint
```

Default port **5174**. Preview tool name: `synth-platform`.

## Routes

React Router 7 configuration in `src/app/routes.tsx`.

| Path | Component | Purpose |
|---|---|---|
| `/` | `LandingPage` | Public marketing + PWA install button |
| `/login` | `LoginPage` | Coach sign-in (demo: one-click → `/coach/dashboard`) |
| `/join/:code` | `JoinWithInvitePage` | Athlete invite-code entry (demo: → `/athlete/home`) |
| `/coach` | `CoachLayout` (with sidebar + modal portal slot) | |
| `/coach/dashboard` | `DashboardPage` | Phase 2 — team overview |
| `/coach/athletes` | `AthletesPage` | Phase 3 — roster grid |
| `/coach/athletes/:athleteId` | `AthleteProfilePage` | Phase 3 — profile + athlete-scoped AI |
| `/coach/sources` | `SourcesPage` | Phase 4 — connectors, sync status, scan logs |
| `/coach/tools/lineups` | `LineupsPage` | Phase 5 — boat builder |
| `/coach/tools/session-timer` | `SessionTimerPage` | Phase 6 — Strava-style piece timer |
| `/coach/ai` | `TeamChatPage` | Phase 8 — team-wide chat |
| `/coach/settings` | `SettingsPage` | Phase 9 — team + visibility + sync defaults |
| `/athlete` | `AthleteLayout` (with top nav) | |
| `/athlete/home` | `MyDashboardPage` | Phase 7 — my team |
| `/athlete/stats` | `MyStatsPage` | Phase 7 — personal stats |
| `/athlete/sessions` | `MySessionsPage` | Phase 7 — personal session history |
| `/athlete/lineups` | `MyLineupsPage` | Phase 7 — personal lineup history |
| `/athlete/sources` | `MySourcesPage` | Phase 7 — personal source uploads |
| `/athlete/ai` | `MyChatPage` | Phase 8 — athlete-own chat |
| `/athlete/settings` | `AthleteSettingsPage` | Phase 9 — athlete preferences |
| `*` | → `/` | fallback |

The **synth. Agent** doesn't have a route — it opens as a modal overlay on top of any `/coach/*` page via `useUiStore.openAgentModal()`. The button in the sidebar triggers it.

## Folder structure

```
src/
├── main.tsx                      # React root + StrictMode
├── App.tsx                       # BrowserRouter → <AppRoutes/>
├── index.css                     # Tailwind + base body + scrollbar helper
├── app/
│   └── routes.tsx                # Route config (single source of truth)
├── shared/
│   ├── layout/
│   │   ├── CoachLayout.tsx       # Sidebar + <Outlet/> + AgentModalPortal
│   │   ├── Sidebar.tsx           # Fixed left sidebar with illustrations
│   │   ├── AgentModalPortal.tsx  # Modal portal driven by useUiStore
│   │   └── PlaceholderPage.tsx   # Kicker + serif headline + phase chip (used by every stub)
│   ├── store/
│   │   ├── useUiStore.ts         # sidebarCollapsed, agentModalOpen
│   │   ├── useAuthStore.ts       # Stubbed, pre-seeded as SEED_COACH
│   │   └── useTeamStore.ts       # activeTeam (Cal Women's Rowing)
│   ├── data/
│   │   ├── types.ts              # TS types matching docs/SCHEMA.md
│   │   └── seeds/
│   │       └── index.ts          # All Phase 0 seed exports
│   ├── illustrations/
│   │   └── sidebarIllustrations.tsx   # Custom SVG glyphs for every sidebar item
│   └── components/               # Shared primitives (grows during Phases 2+)
├── features/
│   ├── landing/
│   │   └── LandingPage.tsx
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── JoinWithInvitePage.tsx
│   ├── coach/
│   │   ├── dashboard/DashboardPage.tsx
│   │   ├── athletes/AthletesPage.tsx
│   │   ├── sources/SourcesPage.tsx
│   │   ├── tools/
│   │   │   ├── lineups/LineupsPage.tsx
│   │   │   └── sessionTimer/SessionTimerPage.tsx
│   │   ├── ai/TeamChatPage.tsx
│   │   └── settings/SettingsPage.tsx
│   └── athlete/
│       ├── AthleteLayout.tsx
│       └── athletePages.tsx      # All athlete stubs in one file
├── prototype/                    # LEGACY — Cal Women's mock dashboard
│   ├── ProductPrototypeApp.tsx   # Phase 2 absorbs this into the new Dashboard route
│   ├── RowiqWomensCharts.tsx
│   ├── rowiqWomensData.ts        # Real erg data (used by seeds)
│   ├── womensDemoData.ts
│   └── athleteCards/             # SynthAthleteCard*, SynthAthleteProfile, etc.
├── components/
│   ├── SynthLayerDashboardMockup.tsx  # Current dashboard mockup (Phase 2 input)
│   └── advanceGate.tsx                # AdvanceGateProvider (no-op wrapper)
└── lib/
    ├── theme.ts                  # THEME — single source of truth for colors/fonts
    └── motion.ts                 # TRANSITIONS, STAGGER, VARIANTS

docs/
├── PRODUCT.md                    # Plain-language product spec
├── SCHEMA.md                     # Canonical DB contract
├── SRS-Synth-Platform.md
└── Design-Prototype-Womens-Team-Demo-Data.md
```

## Data flow — UI-first

```
src/prototype/rowiqWomensData.ts          (real Cal Women's erg data)
       │
       ├──→ src/shared/data/seeds/index.ts
       │          │
       │          ├─ SEED_TEAM_CAL_WOMENS · SEED_COACH · SEED_ATHLETES
       │          ├─ SEED_ERG_SCORES · SEED_SOURCES · SEED_ALERTS
       │          └─ SEED_ACTIVITY · SEED_SESSIONS · SEED_TEAM_STATS
       │
       └──→ src/shared/data/types.ts       (TS types matching docs/SCHEMA.md)
                  │
                  ▼
         feature components read from seeds
                  │
  (later) ──► swap seeds/* for queries/* (TanStack Query hooks on Supabase)
```

When a backend lands, the **feature layer stays unchanged**. The seeds module becomes query hooks; the TS types are already correct.

## Design language

Single source of truth: `src/lib/theme.ts` (`THEME` const). **Every component reads from `THEME.*` — do not hardcode colors or fonts.** Animation presets in `src/lib/motion.ts`.

### Colors

| Token | Hex | Used for |
|---|---|---|
| `primary` | `#059669` | CTA, brand, charts, active nav |
| `primaryDark` / `primaryDarker` | `#047857` / `#065F46` | Gradients, synth. Agent button, hover |
| `primaryLight` | `#A7F3D0` | Gradient tail |
| `accent` | `#10B981` | Logo dot, checkmarks, live badges, pulse |
| `blue` / `cyan` / `purple` / `amber` / `red` | `#3B82F6` / `#06B6D4` / `#8B5CF6` / `#F59E0B` / `#EF4444` | Connector families + semantic states |
| `dark` / `darkDeep` / `darkMid` | `#18181B` / `#0C0A09` / `#27272A` | Dark surfaces |
| `light` / `white` | `#FAFAF9` / `#FFFFFF` | Canvas + cards |
| text tokens | `#18181B` / `#52525B` / `#A1A1AA` / `#E4E4E7` | Hierarchy |

### Typography

- `fontMono: 'JetBrains Mono'` — labels, data, nav, logo, stat numbers
- `fontSerif: 'Fraunces'` — page headlines, narrative
- `fontSans: 'Instrument Sans'` — body, form inputs

### Visual principles (from SRS §7.1)

1. **One surface** — the primary action is understanding the team.
2. **Provenance** — every displayed number carries its source + sync time.
3. **Coach vs. athlete streams** — collapse to unified table in steady state.
4. **Calm density** — data-heavy but scannable.

## Sidebar nav illustrations

All sidebar glyphs are **hand-rolled custom SVGs** in `src/shared/illustrations/sidebarIllustrations.tsx`. Each is 24×24, stroked with `THEME.primary` (active) or `THEME.textMuted` (inactive), with emerald accents on key nodes. They're intentionally simple so they read at small sizes and match synth's monospace/architectural aesthetic rather than a generic icon set.

| Nav item | Illustration |
|---|---|
| Dashboard | 4-tile grid with a small trend line |
| Athletes | Two athlete silhouettes (staggered) |
| Sources | 3 nodes on the left converging to 1 node on the right |
| Lineups | Top-down boat hull with 6 seat dots |
| Session Timer | Stopwatch face with hands |
| Add tool | Dashed rounded rectangle with a plus |
| synth. AI | Speech/brain blob with synapse sparkle |
| Settings | Gear + dashed orbit |

**When adding a new Custom Tool:** add a matching illustration to `sidebarIllustrations.tsx` and register it in the tool list.

## Working conventions

- **Theme is fixed.** Do not change `THEME` or swap to a dark-default layout. New tools, modals, and pages must fit the current synth emerald/light palette. Dark surfaces are used for accent (stat cards, synth. Agent button) — the canvas is `THEME.light`.
- **UI-first, always.** Build the whole surface against seed data before wiring any backend. Types in `src/shared/data/types.ts` are the contract.
- **Routes belong in `src/app/routes.tsx`.** Don't add `<Route>` inline anywhere else.
- **Sidebar modifications go through `src/shared/layout/Sidebar.tsx` + `sidebarIllustrations.tsx`.** Every nav item must have an illustration.
- **The synth. Agent is always a modal portal**, never its own route. It opens over any `/coach/*` page via `useUiStore.openAgentModal()`.
- **Framer Motion for every animation.** No CSS transitions for meaningful motion. Use presets from `src/lib/motion.ts`.
- **No hardcoded colors or fonts in components** — reference `THEME.*`.
- **Demo data stays shape-accurate to `docs/SCHEMA.md`.** When the backend lands, swap in place.

## Current build state

- **Branch:** `build/full-app` (off `main`, not yet merged)
- **Phase 0 (Foundation) — complete.** Deps installed (React Router 7, Zustand, @dnd-kit, Recharts, lucide-react, vite-plugin-pwa). Legacy deck code removed. `docs/SCHEMA.md` and `docs/PRODUCT.md` written. Folder structure staged for all five systems.
- **Phase 1 (Sidebar + routing shell) — complete.** Coach sidebar with custom SVG illustrations, active-state motion indicator, synth. Agent modal portal, landing page, login + invite flow, athlete top-nav layout, all stub routes linked through `src/app/routes.tsx`.
- **Phase 2 (Coach Dashboard) — next.** Absorb Cal Women's mock dashboard into `/coach/dashboard`, add alerts panel + activity feed + Recharts team trends.

## Critical rules

1. This repo is the **full synth. application** — not a prototype. Build everything production-shaped from the start.
2. Keep the current synth theme. Do not switch to a dark default or redefine brand tokens.
3. Every sidebar nav item has a custom SVG illustration in `sidebarIllustrations.tsx`.
4. `docs/SCHEMA.md` is the DB contract. Seeds and types must match.
5. synth. Agent is always a modal portal, never a standalone route.
6. Target viewport: 1440×900 on the coach side, responsive down to 375px on athlete/landing.
