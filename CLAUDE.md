# CLAUDE.md — synth-platform (product prototype)

## What this is

This repo is the **interactive product prototype** for **synth.** (Synth Sports) — a coach-facing platform that unifies fragmented athletic data (spreadsheets, team ops tools, wearables, calendars, email digests) into a single dashboard with AI insight and an optional browser-extension "Synth agent" for capture beside existing workflows.

> Every data signal. One platform.

The prototype renders a click-through demo on **Cal Women's Rowing (2025–26 season, 52 athletes)**. It uses real erg test data parsed from `rowing_women_*.xlsx` workbooks — not lorem ipsum. Coaches can sign in with a demo account and click through the dashboard, sources, athletes, and lineups views.

**Related repos**

- **Pitch deck** — `~/presentations/synth-deck/` (GitHub: `abishaigeorge09/synth-deck`). The 13-slide pitch narrative. Used to live in the same codebase as the prototype; was split out so this repo stays product-only and the deck stays presentation-only.
- **Presentation engine** — `~/presentations/CLAUDE.md`. The shared a16z-style deck framework. Not imported here, but the design language (theme, fonts, motion presets) is inherited.

## Stack

```
React 18 + TypeScript + Vite 5
Tailwind CSS 4 (with @tailwindcss/postcss)
Framer Motion 12
Fonts: JetBrains Mono · Fraunces · Instrument Sans (Google Fonts)
Deploy: Vercel
```

No chart libraries, no UI kits. All components are hand-rolled React + CSS + Framer Motion so the product and the pitch share the same visual DNA.

## Run

```bash
npm install
npm run dev       # vite --port 5174 --strictPort (launched via .claude/launch.json name "synth-platform")
npm run build     # tsc -b && vite build
npm run lint
```

Default port **5174** (5173 is used by the rowiq prototype). Preview tool name: `synth-platform`.

## What the product does (prototype walkthrough)

Entry point: `src/App.tsx` → `src/prototype/ProductPrototypeApp.tsx`. The entire interactive prototype lives under `src/prototype/`.

### 1. Sign-in (`signin` route)

Gradient hero (`primaryDarker` → `primary` → `primaryLight`). Shows a "DEMO IDS" block the coach can read and click **Enter demo dashboard** — no typing, session persisted in localStorage under `PROTO_SESSION_KEY = 'synth_proto_session_v1'`. An optional form below lets you edit fields and hit **Sign in**; password is not checked.

```ts
// src/prototype/womensDemoData.ts
DEMO_LOGIN = {
  email: 'coach@berkeley.edu',
  password: 'demo',
  teamId: 'cal-womens-rowing-demo',
  orgId: 'demo-org-berkeley-athletics',
}
```

### 2. Dashboard (`dashboard` route)

The primary surface. Rendered by `SynthLayerDashboardMockup` (`src/components/SynthLayerDashboardMockup.tsx`). Top-down:

- **Header**: team name, live badge, Synth agent CTA.
- **Left nav (220px)**: logo · team subtitle (`Cal Women's · 52 on roster · Latest erg: 2026-03-16`) · four nav items · sign-out / back-to-deck.
- **Connector chips**: per-source status row (synced / Nm ago / live / digests) driven by `WOMENS_CONNECTORS`.
- **Signal charts**: monthly session bars (`WOMENS_SIGNAL_MONTH_VALUES`) and block/compliance scatter (`WOMENS_SIGNAL_BLOCK_VALUES`).
- **Athlete table**: 8 columns driven by `WOMENS_TABLE_HEADERS`; roster rows from `WOMENS_ATHLETE_ROWS` (→ `ROWIQ_ATHLETE_ROWS`). At-risk rows highlight amber/red.
- **AI insight block**: narrative summary of top performers, improvers, and data-quality notes (`WOMENS_AI_INSIGHT`).

### 3. Sources (`sources` route)

Rendered by `ConnectSourcesPanel` (`src/components/ConnectSourcesPanel.tsx`). Lists the four demo connectors with status badges and detail lines:

| Connector | Status | Detail | Color |
|---|---|---|---|
| Erg workbooks | synced | `rowing_women_* ERGS-2.xlsx (24–25 + 25–26)` | primary |
| TeamWorks | 2m ago | Compliance + calendar | cyan |
| Wearable hub | live | Whoop team rollup | purple |
| Email digests | digests | Daily roster alerts | amber |

### 4. Athletes (`athletes` route)

Card grid (`src/prototype/athleteCards/SynthAthleteCardsView.tsx`). One card per athlete built from `buildRowiqAthletes.ts` (which joins `ERG_316_2K` + `ERG_317_2K` by name). Each card shows: rank stripe (gold/silver/bronze then primary shades), name, group, YoY delta trend, 2K / avg split / watts, sparkline, form pills. Click to open a profile modal.

### 5. Lineups (`lineups` route)

Boat builder scaffold (`src/components/LineupBoardMockup.tsx`). Shell cards (8+, 4+, 2x) with port/starboard seat slots. Drag-to-assign is visual only — it's a mockup, not a scheduler.

## Demo data contract

Data flows from two ground-truth files into the UI:

```
rowIQ/rowIQ_women_dashboard/WOMENS_DATA.md       (source of truth, coach-supplied)
           ↓ parsed → hand-typed
src/prototype/rowiqWomensData.ts                 (ROWIQ_* constants)
           ↓ aliased via
src/prototype/womensDemoData.ts                  (WOMENS_* exports + DEMO_LOGIN + connectors)
           ↓ imported by
src/prototype/ProductPrototypeApp.tsx            (renders dashboard + athletes)
```

Key constants in `rowiqWomensData.ts`:

- `ROWIQ_ROSTER_COUNT_2526 = 52` · `ROWIQ_SESSIONS_2425 = 19` · `ROWIQ_SESSIONS_2526 = 13`
- `ROWIQ_SHEET_316_DATE = '2026-03-16'` — primary roster snapshot (erg 2K)
- `ROWIQ_SHEET_317_DATE = '2025-03-17'` — YoY compare (erg 2K)
- `ERG_316_2K: Erg2k316Row[]` — 51 athletes with `{ lastFirst, time, avgSplit, rate, watts }` (e.g. Wheeler Ella 6:35.6 / 362W, Pember Lily 7:03.8 / 294W)
- `ROWIQ_ATHLETE_ROWS`, `ROWIQ_AI_INSIGHT`, `ROWIQ_SIGNAL_*`, `ROWIQ_SOURCES_INGEST`, `ROWIQ_TABLE_HEADERS`, `ROWIQ_TEAM_SUBTITLE`

When adding or editing athletes, edit `rowiqWomensData.ts` — `womensDemoData.ts` is a re-export shim.

## Design system

Single source of truth: `src/lib/theme.ts` (`THEME` const). Do not hardcode colors or fonts in components — always reference `THEME.*`. Animation presets live in `src/lib/motion.ts` (`TRANSITIONS`, `STAGGER`, `VARIANTS`).

### Colors

| Token | Hex | Used for |
|---|---|---|
| `primary` | `#059669` | CTA, brand, bars, sparklines |
| `primaryDark` / `primaryDarker` | `#047857` / `#065F46` | Gradients, hover |
| `primaryLight` | `#A7F3D0` | Gradient tail, subtle fills |
| `accent` | `#10B981` | Logo dot, checkmarks, live badge |
| `blue` / `cyan` / `purple` / `amber` / `red` | `#3B82F6` / `#06B6D4` / `#8B5CF6` / `#F59E0B` / `#EF4444` | Connector families + semantic states |
| `dark` / `darkDeep` / `darkMid` | `#18181B` / `#0C0A09` / `#27272A` | Dark surfaces |
| `light` / `white` | `#FAFAF9` / `#FFFFFF` | Light surfaces |
| `textPrimary` / `textSecondary` / `textMuted` / `border` | `#18181B` / `#52525B` / `#A1A1AA` / `#E4E4E7` | Text + borders |

### Typography

- `fontMono: 'JetBrains Mono'` — nav, data, headlines, labels
- `fontSerif: 'Fraunces'` — narrative headlines, taglines
- `fontSans: 'Instrument Sans'` — body, form inputs
- Loaded once via `THEME.fontImport` in `index.html` / `index.css`.

### UX principles (from SRS §7)

1. **One surface** — primary action is understanding the team; deep-link to sources only when correction is needed.
2. **Provenance** — always show *where* a number came from (connector + sync time).
3. **Coach vs athlete streams** — educate in onboarding/workflow views; collapse to unified table in steady state.
4. **Calm density** — data-heavy but scannable; mono for metrics, serif for narrative headlines.

## File map

```
src/
├── App.tsx                        # renders ProductPrototypeApp inside AdvanceGateProvider
├── main.tsx
├── index.css
├── lib/
│   ├── theme.ts                   # THEME — single source of truth for colors/fonts
│   ├── motion.ts                  # TRANSITIONS / STAGGER / VARIANTS
│   ├── deckTotal.ts               # (legacy from deck — not used by prototype)
│   └── setupSlideEvents.ts        # (legacy from deck — not used by prototype)
├── components/
│   ├── SynthLayerDashboardMockup.tsx   # core dashboard UI + DashboardAthleteRow type
│   ├── ConnectSourcesPanel.tsx         # Sources route
│   ├── LineupBoardMockup.tsx           # Lineups route
│   ├── SynthDemoCursor.tsx             # animated cursor used in demo flows
│   └── advanceGate.tsx                 # AdvanceGateProvider (no-op for prototype)
└── prototype/
    ├── ProductPrototypeApp.tsx    # the entire product — routing, auth, layout
    ├── womensDemoData.ts          # WOMENS_* exports + DEMO_LOGIN + connectors
    ├── rowiqWomensData.ts         # ROWIQ_* — ground-truth erg data (52 athletes)
    ├── RowiqWomensCharts.tsx      # signal charts
    └── athleteCards/
        ├── SynthAthleteCardsView.tsx    # grid layout for Athletes route
        ├── SynthAthleteCard.tsx         # individual card
        ├── SynthAthleteProfile.tsx      # click-through modal
        ├── SynthAthleteRoster.tsx
        ├── SynthAthleteSparkline.tsx
        ├── SynthLineChart.tsx
        ├── SynthQuickCompare.tsx
        ├── SynthScatterChart.tsx
        ├── buildRowiqAthletes.ts        # ERG_316 + ERG_317 → Athlete[]
        ├── calculations.ts
        ├── formatters.ts
        └── model.ts
```

Files under `src/slides/`, `src/appendix/`, `src/components/SlideShell.tsx`, `TopNav.tsx`, `DeckBlurLock.tsx`, `PixelArt.tsx`, etc. are **legacy deck code** left in place from the split. They aren't imported by the prototype and can be deleted when the repo is pruned.

## Functional requirements reference

Authoritative spec: `docs/SRS-Synth-Platform.md`. Key requirements the prototype demonstrates (or should, as features are built):

- **FR-AUTH-1/2** — coach profile bound to a team; team scope shown in header.
- **FR-DASH-1..6** — team overview with connector chips, signal charts, athlete table, AI insight, and nav placeholders.
- **FR-CONN-1..4** — configurable connectors with last-sync status and onboarding via CSV + email list.
- **FR-AGENT-1..3** — Synth agent (browser extension) deployed from the dashboard, operates in coach's browser context.
- **FR-FLOW-1/2** — conceptually separate athlete-layer and coach-layer streams; merge into the same UI model.

See `docs/Design-Prototype-Womens-Team-Demo-Data.md` for the demo-data schema (columns, athlete roster, metric definitions).

## Working conventions

- **No hardcoded colors or fonts in components** — always reference `THEME.*`. If you need a new color, add it to `theme.ts`.
- **No chart libraries** — continue the hand-rolled Framer Motion chart pattern (`RowiqWomensCharts`, `SynthLineChart`, `SynthScatterChart`).
- **Demo data stays parse-shaped** — if the shape of `ERG_316_2K` changes, update `buildRowiqAthletes.ts` and `SynthLayerDashboardMockup`'s `DashboardAthleteRow` type together.
- **Mocked auth** — the prototype has no backend. `PROTO_SESSION_KEY` in localStorage is the only state. Don't introduce real auth here; it belongs in the production app.
- **Product ≠ deck** — if a change is purely narrative/pitch-facing, it belongs in `~/presentations/synth-deck/`, not here.

## Critical rules

1. This repo is **product-only**. The pitch deck lives in `synth-deck`.
2. `src/prototype/` is the entry to the live demo. `src/App.tsx` must stay minimal — just `<AdvanceGateProvider><ProductPrototypeApp /></AdvanceGateProvider>`.
3. Real data comes from real rowing workbooks. Names, times, and splits are authentic — do not replace with lorem.
4. Every number in the UI should have provenance (source connector + sync time) per SRS §7.1.
5. Target viewport: 1440×900. Responsive down to tablet.
