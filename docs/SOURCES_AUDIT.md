# Sources audit — porting Connectors + Data View into the mobile app

Audit of the web `/coach/sources/*` surfaces and the current state of `/app/coach/sources`, plus the proposed mobile design. **Read-only port** — no write actions, no reconnect/sync/disconnect from the app.

---

## 1. Web — `/coach/sources/connectors`

File: `src/features/coach/sources/SourcesPage.tsx`

**Layout (top → bottom):**
1. `PageHeader` — kicker "Sources", title "Connectors", subtitle "{N healthy} healthy of {N total}"
2. Segmented pill row: **`Connectors`** (active) | divider | `Data View` (link to `/coach/sources/data-view`)
3. Sub-toolbar: "Scan history for the selected connector." caption · "+ Add source" button (opens **synth. Agent modal**)
4. **Source grid** — `md:grid-cols-2 xl:grid-cols-4`. Each tile renders `<SourceCard>` (brand color, name, status, latest scan time, scan count). Tap selects; "View detail" opens `<SourceDetailModal>`.
5. **Scan history split** — sidebar (`xl:w-[320px]`) of `<ScanLogRow>` items for the selected source · main pane `<ScanReportViewer>` rendering the markdown report from the agent run.

**Data:** `useSources()`, `useScanLogs()`, `useScanLogsForSource(id)`, `useLatestScanForSource(id)` — all from `shared/data/queries`, currently backed by seeds.

**Writes:** "+ Add source" only (opens the synth. Agent modal — actual connect happens there).

---

## 2. Web — `/coach/sources/data-view`

File: `src/features/coach/sources/ConnectorsDataViewPage.tsx` (~1,070 lines)

**Layout:**
1. `PageHeader` — "CONNECTORS DATA VIEW · Team-wide raw data workspace with athlete filtering."
2. **Athlete filter row** — select dropdown + free-text search + pill toggle (Connectors | **Data View**). When a non-all athlete is picked a green banner appears under the tab bar with a "✕ clear" button.
3. **Horizontal scrolling tab strip** — 13 tabs, each with a colored dot + label, underline-indicator on the active tab. Tab IDs persist in `?tab=` and `?athlete=` URL params.
4. **Tab content** — one of 13 components below.
5. **Floating "s." AI button** (bottom-right) → opens a side panel with 3 tab-aware suggestions that all route to `/coach/ai`.

**Tab roster** (from `SOURCE_TABS`):

| Tab | Color | Content kind |
|---|---|---|
| Workflow | `#059669` | React Flow board (`WorkflowFlowBoard`) — 12 sources → 3 processing nodes (Name Matching · Normalization · Synthesis) → 6 outputs (Athlete Profiles · Training Load · Recovery · Injury Risk · Dashboard · synth. AI). Below: collapsible **Source health summary** + **Inference log** grid. |
| Google Sheets | `#34A853` | `GoogleSheetsEmbed` — spreadsheet viewer with `highlightAthleteName` row tinting. |
| Concept2 | `#1A1A2E` | Per-athlete erg cards (Time · Split · Watts · SPM grid + 4-bar split sparkline + PR badge). |
| Strava | `#FC4C02` | Status header (stale badge + weekly mileage) + Recharts bar chart of recent distances + activity list cards (badge + HR + effort + HR-zone bar). |
| Apple Health | `#FF2D55` | 14-day Sleep BarChart, HRV LineChart with baseline ref line, Resting HR LineChart. |
| Whoop | `#00F19F` | **Failed-state hero** with red border + "Reconnect Whoop →" CTA + 4-tile blurred snapshot. |
| Bridge | `#4A90D9` | Status header + 3 gym session cards (exercises + sets×reps@lbs + ↑↓→ trend arrow). |
| TrainingPeaks | `#FFD700` | **Pending-state hero** with amber border + "Configure in Connectors →" link + weekly compliance bar + 6-day plan grid + "Once connected, you'll see…" list. |
| Calendar | `#4285F4` | 5-day week grid with colored event blocks + next regatta highlight card. |
| Garmin | `#007CC3` | Empty-state placeholder + "Configure →" link. |
| Oura | `#C0C0C0` | Empty-state placeholder + "Configure →" link. |
| Coach Notes | `#8B5CF6` | Voice-note cards (athlete + tags + transcript + extracted bullets + "▶ Play recording" stub). |
| AI Import | `#8B5CF6` | Extracted record cards (source type · athlete · imported/pending pill). |

**Demo data:** `src/features/coach/sources/data/demoConnectorsData.ts` — `TEAM_ROSTER`, `DATA_VIEW_TABS`, `SOURCE_HEALTH`, `INFERENCE_LOG`, `SHEETS_ROWS`, `CONCEPT2_ROWS`, `STRAVA_ACTIVITIES`, `VOICE_NOTES`. Apple Health / Calendar / TrainingPeaks / Bridge / AI Import data live inline in the page.

**Writes:** "Sync now" / "Reconnect" buttons in the Source health summary fire a 1.8s timeout + toast (no real network); "Reconnect Whoop" fires a toast; the floating AI panel routes to `/coach/ai`. Everything else is read.

---

## 3. App — `/app/coach/sources` (current)

File: `src/features/app/coach/SourcesPage.tsx`

**Layout:**
1. `CoachPageHeader` — "Sources · {N} connected" + glass "+ Add" button.
2. **Last-sync hero card** (sky candy card) with "Sync now" pill (1.4s simulated sync).
3. **Connected list** — single rounded inline-card listing `<SourceRow>` items: brand-color avatar, name, category · last sync, status badge (Synced/Syncing/Error).
4. Tap a row → `<SourceDetailSheet>` (Pause / Disconnect actions).
5. "+ Add" → `<AddSourceSheet>` (filters out already-connected from `COACH_CONNECTORS`).

**Seed:** 6 rows (concept2, strava, trainingpeaks, whoop, apple-health, garmin) hardcoded in `SEED_ROWS`.

**Connector catalog:** `src/features/app/data/mockConnectors.ts` — `COACH_CONNECTORS` (8 entries) + `ATHLETE_CONNECTORS` (6 entries).

**Gap vs web:** no Data View at all. No tabs, no per-source content, no athlete filter, no scan history, no workflow board.

**Routes today:**
- `/app/coach/sources` → `SourcesPage` (no segmented switch). No `/app/coach/sources/data-view` route.

---

## 4. Proposed mobile design — read-only Data View

### 4.1 Routes

```
/app/coach/sources              → redirect to /app/coach/sources/connectors
/app/coach/sources/connectors   → SourcesPage (existing, with new segmented switch added)
/app/coach/sources/data-view    → SourcesDataViewPage (new)
```

Both pages share a **segmented-control header** (Connectors · Data View) that lives directly under `CoachPageHeader`, matching the web pill toggle but as a thumb-friendly pill control.

### 4.2 SourcesDataViewPage layout (mobile-native rewrite)

- **Header** — `CoachPageHeader` "Sources · Data View" · back to `/app/coach/home`.
- **Segmented switch** — `Connectors | Data View` (active).
- **Athlete filter chip row** — "All athletes" pill (default) + chip per roster member, horizontal scroll. Tap a chip to filter; tap "All" to clear. Selection persists in `?athlete=`. Avoids the desktop dropdown — chips read better on a 390px screen.
- **Tab strip** — horizontal scrolling, colored-dot + label, underline indicator. Mirrors the web tabs but renders 13 entries with `whitespace-nowrap` + scroll-snap-x.
- **Active-filter banner** — only when athlete ≠ all: emerald banner "Filtered to: {Name}" with a "✕" tap target.
- **Tab content** — one of 13 panels (see below). All scrollable inside the page; the header + segmented + tab strip stay sticky-ish (the tab strip becomes sticky-top while content scrolls).

### 4.3 Tab panels — mobile adaptation

Same 13 tabs, each ported to the cobalt/glass app aesthetic. **All read-only — no buttons fire actions, no inputs, no Reconnect/Sync.** Empty-state and error-state copy is preserved (e.g. "Whoop · Token expired" still shows, but with no Reconnect button — replaced by an info caption "Reconnect from the desktop dashboard.").

| Tab | Mobile rendering |
|---|---|
| Workflow | Replace the React Flow board with a **vertical stacked diagram**: 3 column "rails" (Sources / Processing / Outputs) rendered as labeled cards with thin connector lines between groups. The full graph isn't browseable on mobile — a vertical summary works better. **Source health** + **Inference log** below, stacked instead of side-by-side. |
| Google Sheets | Read-only sheet rows as a list of compact cards: athlete · date · session · type · note. Athlete filter highlights matching rows; non-matching dim. (No iframe embed on mobile.) |
| Concept2 | Per-athlete cards: 4-metric inline grid (Time · Split · Watts · SPM) + the 4-bar split sparkline. PR badge inline. |
| Strava | Status header card + horizontally-tighter activity cards (badge + name + distance + HR pill + HR zone bar). Drop the bar chart on mobile (it's redundant with the cards). |
| Apple Health | Three stacked Recharts (Sleep · HRV · Resting HR), each at ~120px height. ResponsiveContainer handles width. |
| Whoop | Failed-state hero (red border) + blurred 4-metric snapshot. **No Reconnect button** — replace with caption "Reconnect from the desktop dashboard." |
| Bridge | Status header + gym session cards (exercise list + trend arrows). |
| TrainingPeaks | Pending-state hero (amber border) + weekly compliance bar + 6-day plan grid (2 cols × 3 rows on mobile). **No Configure link** — caption only. |
| Calendar | 5-day grid → swap for a vertical day list (Mon Apr 21 → Fri Apr 25) with event chips per day. Cal Invite "next regatta" card stays. |
| Garmin / Oura | Empty-state caption "Connect from the desktop dashboard to view {name} data here." |
| Coach Notes | Voice-note cards (transcript + extracted bullets + tags). **No Play button** (would need real audio). |
| AI Import | Extracted-record cards (source type · extracted summary · imported/pending pill). |

### 4.4 Data sources

Reuse the web demo data verbatim from `src/features/coach/sources/data/demoConnectorsData.ts` — that file has no React deps, so importing into `app/` is free. Inline data (Apple Health arrays, Calendar events, TrainingPeaks plan, AI imports) get extracted into the same file so both surfaces stay in sync.

`src/features/app/data/mockConnectors.ts` keeps describing **which connectors the team has**; `demoConnectorsData.ts` keeps describing **what the data actually looks like**. No overlap, no duplication.

### 4.5 What we explicitly skip (read-only)

- No Reconnect / Sync now / Configure CTAs.
- No "+ Add source" on the Data View page.
- No Pause / Disconnect.
- No floating "s." AI panel for now (the floating tab bar already has `/app/coach/ai`).
- No write to `?tab=` URL state — use local `useState` (deep linking can come later).

### 4.6 Files to add / change

```
NEW   src/features/app/coach/SourcesDataViewPage.tsx
NEW   src/features/app/primitives/DataViewTabStrip.tsx
NEW   src/features/app/primitives/SourcesSegmentedSwitch.tsx
NEW   src/features/app/primitives/dataViewPanels/   (13 panel components or one file)
EDIT  src/features/app/coach/SourcesPage.tsx       (add segmented switch under header)
EDIT  src/app/routes.tsx                           (add /sources/data-view + redirect)
MOVE  inline arrays from ConnectorsDataViewPage → demoConnectorsData.ts (so app + web share)
```

Estimated weight: ~600 LOC across 5 new files, +~30 LOC of edits.

---

## 5. Open questions for sign-off

1. **Workflow tab** on mobile — is the vertical-stacked summary OK, or do you want to drop the Workflow tab entirely on mobile?
2. **Athlete filter** — chip row vs the desktop-style dropdown? Chip row recommended for mobile.
3. **Tab order / removal** — keep all 13, or trim (e.g. drop Garmin / Oura since they're empty placeholders)?
4. **Floating AI button** — port it to mobile too (could open a sheet of 3 suggestions), or skip?
5. **Deep linking** — local state vs `?tab=` URL params? Local state is simpler; URL params let you share a link to "data view, Strava tab, filtered to Star".

After sign-off I'll build the page and panels, hook the segmented switch into `/app/coach/sources/connectors`, and verify in the dev server.
