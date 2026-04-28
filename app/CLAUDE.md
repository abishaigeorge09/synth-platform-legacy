# /app — synth. mobile MVP (CLAUDE.md)

## What this is

`/app` is the **mobile-only synth surface** — a separate product layer from the existing `/coach/*` and `/athlete/*` routes that ship in this repo. It lives at:

- Routes: `/app/coach/*` and `/app/athlete/*`
- Code: `src/features/app/`
- Docs: `app/` (this folder, repo-root)

Layout: a single **centered ~390 px column** on desktop, **full-bleed** on mobile. There is no tablet/desktop layout. If you try to make this responsive in the existing `/coach/dashboard` sense, stop — that's the wrong instinct. Mobile is the canonical viewport. Desktop is just "the same column, centered, with a soft surround."

The existing `/coach` and `/athlete` routes stay as they are. `/app` is a parallel surface, not a replacement. They share **only**: `THEME` tokens, `recharts`, the existing seed types in `src/shared/data/types.ts`, and Supabase auth state.

---

## Workflow rule (read this first, every time)

**Before you build, edit, or refactor any page in `/app/*`, you MUST:**

1. Re-open this file (`/app/CLAUDE.md`) in full.
2. Identify whether the page is an **onboarding** surface or an **in-app** surface. They have different design languages — see "Two visual languages" below.
3. Re-open the cited reference image(s):
   - **In-app (coach + athlete post-auth):** `/Users/abishaigeorgegosula/Downloads/goclub-plan-refs/` and `/Users/abishaigeorgegosula/Downloads/goclub-steps-refs/` — these are the primary canon for cobalt canvas, floating glass, and candy cards.
   - **Onboarding:** `/Users/abishaigeorgegosula/Downloads/calai-refs/` — light canvas, Cal AI inheritance.
   - **AI chat surfaces:** `/Users/abishaigeorgegosula/Downloads/claude-refs/Claude iOS Screens 0.png` — restraint baseline.
   - **Voice capture:** `/Users/abishaigeorgegosula/Downloads/arc-refs/` — aurora dissolve choreography.
4. Validate your design against the **Two-stream test** below.

This is not optional. The references are the canon; this doc is the index. Memory of patterns degrades fast — reading them fresh keeps every screen consistent.

## Two visual languages (in-app vs onboarding)

`/app` has **two distinct visual systems** that must not bleed into each other:

### A. In-app surfaces — `/app/coach/*` and `/app/athlete/*`

Translated from GO Club Plan + Steps refs. **Cobalt canvas IS the brand.**

- Full-bleed cobalt gradient (`#2E37F2 → #1F26C9`), edge-to-edge, status bar bleeds onto canvas.
- One typeface throughout — **Geist** (loaded via Google Fonts in `index.html`). No mono. Numerics use `font-variant-numeric: tabular-nums`.
- Solid candy cards (yellow/sky/mint/pink/cream/lemon) for content blocks. No gradients on the cards.
- Inline translucent cards (`rgba(255,255,255,0.10)`) for secondary callouts on the cobalt canvas. **No backdrop-filter** — these read right against the cobalt without blur (perf reserve).
- **Glass = exactly one element per screen**, almost always the floating tab bar. Recipe in §Component primitives.
- **Floating tab bar always visible**, never hides on scroll. Brand silhouette.
- Black solid circle (`#0A0A12`) is reserved for the **primary "Capture" action** — it lives in the right slot of the floating tab bar.
- White paper sheet appears **only as the bottom-pinned detail sheet** on chart drill-ins (Steps anatomy).
- Emerald is a **signal color only** (synced/healthy state, streak indicators). It is **not** the canvas, not a CTA fill, not a gradient.
- All in-app tokens live in `SYNTH` (exported from `src/features/app/lib/theme.ts`).

### B. Onboarding surfaces — `/app/welcome` and `/app/onboarding/*`

Translated from Cal AI refs. **Light canvas, calm restraint.**

- White/cream canvas (`#FAFAF9`).
- Mixed Fraunces (serif headlines) + Instrument Sans (body) + JetBrains Mono (mono labels/CTAs).
- Emerald CTAs and accents.
- Single-question screens, thin progress bar, pinned mono CTA pills.
- Tokens live in `APP_THEME` (also in `src/features/app/lib/theme.ts`).

The transition from onboarding light → in-app cobalt happens at `/app/onboarding/reveal` → coach/athlete home. The reveal is the door; cobalt is the room.

### Two-stream test

Every screen must answer both:

- **Coach:** does this serve a coach scanning 30 athletes at 6 a.m. on their phone, before the team meeting?
- **Athlete:** does this serve an athlete who just walked off the water, sweaty, and has 30 seconds before they hit the showers?

If a screen only works for one side, mark it side-scoped explicitly. If it works for neither, redesign.

---

## Design DNA — synth principles first

Before any reference pattern is applied, anchor on what is non-negotiable.

### 1. Provenance-first

Every number names its source. A stat without provenance is a bug. Cite source + sync time as a small caption beneath the value. This is unique to synth — none of the references do this, because none are data-platforms in the same sense.

In-app, provenance lines render in `provenanceOnBrand` (white at 55% alpha) on cobalt or `provenanceOnSheet` (`#9A9AAB`) on the white detail sheet. They are uppercase, tracked tight, and use `font-variant-numeric: tabular-nums`.

### 2. Calm density

Data-heavy but scannable. Generous line-height, dashed/translucent dividers, restrained palette per screen. The data feel comes from layout, tabular numerics, and provenance lines — not from a separate mono typeface.

### 3. Two-stream

Coach view ≠ athlete view. They are **different products** sharing a brand. A coach sees aggregates, attention rows, and writes notes. An athlete sees their own data, captures, and reads notes. Don't try to unify them with theme switches.

### 4. Athletes don't see synthesized scores by default

Coaches control share toggles. Athletes see raw data they already produced (their own ergs, their own wellness check-ins, lineups they were placed in). Synthesized analytical scores ("readiness 7.2/10", "peak form likelihood 64%") stay coach-side until explicitly shared. This is a product principle, not a UI choice.

### 5. Brand canvas, not brand accent (in-app)

For in-app surfaces, **cobalt IS the canvas**. The brand wash carries the entire scroll. Saturation comes from a small palette of solid candy cards plus exactly one element of real glass per screen.

For onboarding, the canvas is light and emerald is the accent — that is the Cal AI inheritance.

Emerald never appears as the in-app canvas. It is reserved for **signal states** (synced/healthy/streak active).

---

## Reference apps — what each one gives us

| Reference | Role in `/app` |
|---|---|
| **Claude iOS** | Calm-canvas baseline. AI chat surface. Empty-state restraint. Two voice affordances (mic = transcribe, waveform = live voice). |
| **Arc Search** | Voice capture choreography. Aurora overlay on dimmed prior screen. Transcript replaces greeting in-place. Show-the-work result screen. |
| **Cal AI** | Onboarding flow shape. Single-question screens, wheel pickers, sliders, trust cards, scanning loader, dashboard reveal. Linear progress affordance. |
| **GO Club** | Data-screen vocabulary. Mono numerals at scale. Two-pane chart-on-top + sheet-on-bottom. Per-metric color system. Trend list patterns. Settings card stack. |

---

## Visual system

### Color

| Token | Hex | Used for |
|---|---|---|
| `app.canvas` | `#FAFAF9` | Default page background (athlete and coach data screens) |
| `app.surface` | `#FFFFFF` | Cards on canvas |
| `app.brand` | `#059669` | Primary accent, selected state, CTA fill |
| `app.brandDeep` | `#047857` | Hover/active, full-bleed gradients |
| `app.brandWash` | `#A7F3D0` | Subtle backgrounds (selected pill, success card) |
| `app.text` | `#18181B` | Primary text |
| `app.textMuted` | `#52525B` | Secondary text |
| `app.textFaint` | `#A1A1AA` | Captions, provenance, helper |
| `app.divider` | `#E4E4E7` | Dashed dividers, hairlines |
| `app.dark` | `#0C0A09` | Full-bleed surfaces (welcome, voice, celebration) |

**Per-metric color system** (borrowed from GO Club, adapted to synth's palette). Each metric gets a fixed accent that follows it across every screen:

| Metric | Accent | Hex |
|---|---|---|
| 2K erg / training load | emerald | `#059669` |
| Recovery | amber | `#F59E0B` |
| Streak | orange | `#F97316` |
| Sleep | indigo | `#6366F1` |
| HR / cardio | red | `#EF4444` |
| Volume / distance | blue | `#3B82F6` |
| Calories / energy | cyan | `#06B6D4` |
| Lineup / boat | violet | `#8B5CF6` |

If you introduce a new metric, add it to this table — don't pick an ad-hoc color.

### Typography

Reuse the existing synth fonts; the role assignment changes for `/app`.

| Family | Used for |
|---|---|
| `JetBrains Mono` | All numerics, all UI labels, captions, provenance, nav, buttons |
| `Fraunces` (serif) | Page headlines on hero/welcome/celebration screens; greeting in AI chat empty state |
| `Instrument Sans` | Body copy, helper text, AI chat message body, long-form notes |

**Two-tone display headlines** (borrowed from GO Club, applied with restraint). Split a phrase across two colors of the same weight — e.g. "every / signal / counts" with `signal` in emerald. Use **only on**: welcome screen, role pick, post-onboarding reveal, share cards, weekly digest hero. Never on data screens. Never lowercase by default — sentence-case reads more credibly for a coach platform.

**Type scale (mobile column = 390 px):**

| Role | Size | Weight | Family |
|---|---|---|---|
| Display (welcome hero) | 44 / 48 line | 700 | Fraunces |
| Headline (page title) | 28 / 32 | 600 | Fraunces |
| Stat hero (e.g. "2,583") | 64 / 64 | 700 | JetBrains Mono |
| Stat large | 32 / 36 | 600 | JetBrains Mono |
| Stat row | 20 / 24 | 600 | JetBrains Mono |
| Body | 15 / 22 | 400 | Instrument Sans |
| Label / nav | 12 / 14 | 600 | JetBrains Mono (uppercase, 0.08em tracking) |
| Caption / provenance | 11 / 14 | 500 | JetBrains Mono |

### Motion

All motion via `framer-motion`. Reference cues:

- **Page transitions** — horizontal push (Cal AI). 320ms, `[0.22, 1, 0.36, 1]` ease.
- **Bottom sheet drag** — Vaul with spring on release.
- **Voice aurora dissolve** — radial gradient that breathes (`scale [1, 1.04, 1]` on a 6s loop) while listening, then fades up and dissolves on utterance end (Arc).
- **Stat count-up** — RAF-driven, easeOutCubic, 600–1200ms (existing `AnimatedNumber` pattern from `src/features/athlete/behavioral/`).
- **Celebration scale-in** — overshoot `[0.5, 1.1, 1.0]` over 700ms (existing PR celebration pattern).
- **Carousel** — momentum-paged horizontal scroll with snap, peek of next card (~16 px) — GO Club pattern.

**Never** use CSS transitions for meaningful motion. CSS is fine for hover/focus state changes only.

### Iconography

- **Primary action glyphs** — keep the existing custom SVG illustrations (`src/shared/illustrations/sidebarIllustrations.tsx`) for any nav or hero-tier glyph. Don't replace them with lucide.
- **Secondary icons** — `lucide-react` (already in repo).
- **Connector brand glyphs** — colored mini-icons inside rounded squares (Cal AI [5, 21], GO Club connector pages). Use real brand colors for the glyph fill (Concept2 red, Strava orange, TrainingPeaks blue, Garmin black, etc.); the surrounding square is `app.surface`.
- **Empty-state illustrations** — borrow GO Club's signature illustration tier (translucent water bottle, runner with shoe-sole, golden-hour dial). For synth, commission/build equivalents: a stylized boat hull, a dashed sync line, an erg flywheel. These are illustration tasks — not lucide swaps.

---

## Component primitives

These are the atomic building blocks. Every screen is a composition of these. Build them first; build screens second.

### `<StatWithProvenance>`

The most-used primitive in `/app`. Big mono number, label, and a caption that names the source and sync time.

```
2,583            ← mono, 32–64pt depending on context
Calories left    ← uppercase mono label, textFaint
Apple Health · synced 4 min ago    ← caption, textFaint, dot separator
```

Props: `value`, `label`, `source`, `syncedAt`, `unit?`, `delta?` (with up/down/flat arrow), `accent?` (defaults to `metric.color` lookup).

### `<ScopedAIInput>`

Floating input pill at the bottom of any AI surface. Echoes Claude's empty-state input bar.

- Single rounded-rectangle card, ~56 px tall.
- Placeholder: `Ask synth. about <scope>` where scope = athlete name, team name, or "yourself".
- Bottom-left: `+` (attach photo / voice memo / file).
- Bottom-right: mic icon (transcribe to field).
- Far bottom-right: filled circular button with waveform glyph (live voice mode → opens Arc-style aurora overlay).

Props: `scope` (athlete | team | self), `onSubmit`, `onVoiceMode`.

### `<CaptureModePicker>`

The 4-mode grid that opens when a coach or athlete taps "Capture." Square tiles with icon + label.

| Coach modes | Athlete modes |
|---|---|
| Photo | Form video |
| Voice memo | Erg log |
| Text note | Wellness check-in |
| Email forward | Quick note |

Each tile leads to a mode-specific surface. The picker is a bottom sheet (Vaul), not a full screen.

### `<CoachAttentionRow>`

The row primitive in the coach attention list. Borrowed from GO Club's trend modal `[52, 53]` with provenance bolted on.

```
Star Miller      ← name, body weight
2K erg slipped 4.3s vs 4-week avg    ← signal, mono
Concept2 · synced 12m ago    ← provenance caption, textFaint
```

Tap → `/app/coach/athlete/:id`. Dashed divider between rows. No chevron — the whole row is the affordance.

### `<ConnectorChip>`

Multi-select row for source connectors. Cal AI [5, 21] pattern.

- Brand glyph in rounded square (left).
- Connector name + status (mid).
- Selection indicator (right): emerald check when on, hairline circle when off.
- Selected = emerald hairline border + light emerald wash background.

### `<SingleQuestionScreen>` (onboarding shell)

The Cal AI single-question shell, applied across role pick, sport pick, capability multi-select, etc.

- Top: back arrow (circular, hairline border) + thin progress bar (4 px, no "X of Y" text).
- Title (Fraunces 28pt) + helper (Instrument Sans 15pt, textMuted) — 2 lines max.
- Body: stack of 2–6 full-width pill rows OR wheel picker OR slider OR multi-select chips.
- Bottom: full-width primary CTA pill, pinned ~24 px above the home indicator. Disabled (grey) until valid input.

Selected pill row = solid emerald fill + white text. Unselected = `app.surface` fill + `app.text` text + hairline border.

### `<TwoPaneChartSheet>`

GO Club's signature `[13–16, 89, 90]` two-pane layout for athlete drill-ins and session detail.

- Top pane (~55% viewport height): full-bleed canvas (light or emerald depending on mode), recharts bar/line, header with "X.Xs slipped vs avg" and small D/W/M segmented toggle.
- Bottom pane: white sheet rounded-top, anchored at bottom. Hosts the day's stats: huge mono headline number + sub-stats grid (3-up). Drag handle at top. Scrolls if content overflows.

### `<SettingsCardStack>`

GO Club `[84–87]`. White rounded cards stacked vertically on canvas. Each card = a section ("Account", "Sync", "Privacy"). Rows inside card have label-left + value-right (or chevron). Section titles = mono uppercase 12pt label above each card.

### `<TrustCard>`

Cal AI [20]. Centered illustration on pastel halo + 1-line privacy headline + 1-paragraph copy. Used between flow segments to slow the user down before any data ask. Borrow the structure; replace Cal AI's pastel halo with a soft emerald wash (`brandWash` → transparent radial).

### `<ScanningLoader>`

Cal AI [29]. Big % numeral, headline, gradient progress bar (emerald → emerald-light traveling fill), and a checklist of artifacts being computed. Used immediately after the user kicks off the synth Agent's first scan.

### `<DashboardRevealGrid>`

Cal AI [30]. 2×2 grid of mini-cards, each with a small ring gauge + metric value + label. Used as the post-onboarding "your synth is ready" moment. Tap any card → that page.

### `<AuroraVoiceOverlay>`

Arc [0–2]. Full-screen overlay on dimmed-blurred prior context. Multi-hue radial gradient blob (emerald → violet → cyan), white serif greeting "Hi! How can I help?" that morphs into the live transcript in-place. Waveform pill (animated bars) below. No mic button — the gesture (long-press the AI input) is the affordance. On utterance end: aurora dissolves up, result screen fades in with "Reading X sources" + opacity-ramped citation list.

### `<ShareCard>`

Existing pattern from `src/features/athlete/behavioral/ShareableCard.tsx`. Renders off-screen at 1080×1080 (square) or 1080×1920 (story), rasterized via `html2canvas`. GO Club [21–23] gave us the trading-card composition language; keep ours quieter and more data-forward.

---

## Screen ↔ reference mapping

The canonical table. **Re-read the cited references before building any row.**

### Onboarding & auth (shared)

| Screen | Pattern | Reference |
|---|---|---|
| Splash | Skip — drop straight into Welcome | (Cal AI [0] is what we deliberately don't do) |
| Welcome | Hero illustration + serif two-tone display + stacked OAuth pills | Cal AI [1], GO Club [1] |
| Sign in (Google OAuth) | Apple-Health-style OS sheet on dimmed canvas | Cal AI [26] |
| Role pick (Coach / Athlete) | `<SingleQuestionScreen>` with 2 pill rows | Cal AI [2–3] |
| Sport pick (rowing for now) | `<SingleQuestionScreen>` with chip grid | Cal AI [4] |
| Coach: team setup | `<SingleQuestionScreen>` text input + helper | Cal AI [27] |
| Coach: capability multi-select | `<SingleQuestionScreen>` + connector chips | Cal AI [18] |
| Coach: connect sources | `<ConnectorChip>` multi-select + network illustration | Cal AI [21] |
| Athlete: invite-code entry | `<SingleQuestionScreen>` with text input | Cal AI [27] |
| Athlete: connect own sources | `<ConnectorChip>` rows | Cal AI [5] |
| Trust card | `<TrustCard>` | Cal AI [20] |
| Scanning loader | `<ScanningLoader>` | Cal AI [29] |
| Reveal | `<DashboardRevealGrid>` + serif headline | Cal AI [30] |

### Coach `/app/coach/*`

| Screen | Pattern | Reference |
|---|---|---|
| Coach home | Greeting + horizontal carousel of attention cards + stat-tile grid + recent activity | GO Club [12, 24, 25] |
| Attention list | List of `<CoachAttentionRow>` on canvas, dashed dividers | GO Club [52, 53] |
| Athlete drill-in | `<TwoPaneChartSheet>` with athlete name + sport stat + sub-stats | GO Club [13–16, 89, 90] |
| Athlete AI chat (scoped) | `<ScopedAIInput>` with athlete-scoped placeholder, message thread above | Claude [0] |
| Capture (4-mode) | `<CaptureModePicker>` bottom sheet | New synthesis |
| Capture: photo | Native camera + `react-easy-crop` review screen | New |
| Capture: voice memo | `<AuroraVoiceOverlay>`-style listening, then save sheet | Arc [0–2] |
| Capture: text note | Single textarea, big serif placeholder, attach button | Claude [0] (calm restraint) |
| Capture: email forward | Forward-to address card + recent forwards list | New |
| Lineup builder | Port from `/coach/tools/lineups`, touch-adapted | None (existing) |
| Coach notes | Note list rows on canvas + composer sheet | GO Club [18] hydration list |
| Connectors | `<ConnectorChip>` list with sync status + last sync caption | GO Club connector page family + provenance principle |
| Settings | `<SettingsCardStack>` | GO Club [84–87] |

### Athlete `/app/athlete/*`

| Screen | Pattern | Reference |
|---|---|---|
| Athlete home | Living athlete card hero + horizontal feature carousel + stat tile grid | GO Club [12] + existing `AthleteCard` |
| Athlete AI chat (self-scoped) | `<ScopedAIInput>` with self-scoped placeholder | Claude [0] |
| Capture (4-mode) | `<CaptureModePicker>` | New |
| Capture: form video | Native camera record + review | New |
| Capture: erg log | Wheel picker for time + distance + split (Cal AI [8–11]) | Cal AI [8–11] |
| Capture: wellness check-in | Mood emoji slider + 2×3 stat-tile grid | GO Club [45, 46] |
| Erg pacer (sport tool) | Full-bleed mono timer, single-accent UI | GO Club [13] + existing session timer |
| Athlete notes (read-only) | List with provenance line ("from Coach Sarah · Tue") | New (provenance-first principle) |
| Athlete connectors | Same as coach but personal-scope | Cal AI [5] |
| Settings | `<SettingsCardStack>` | GO Club [84–87] |

### Cross-cutting overlays

| Screen | Pattern | Reference |
|---|---|---|
| PR celebration | Full-screen confetti + overshoot scale-in + count-up | Existing `PRCelebration` |
| Weekly digest | Bottom sheet with 4 stats, AI insight, top moment, share recap | Existing `WeeklyDigestModal` + Cal AI [30] |
| Share card render | Off-screen 1080×1080 / 1080×1920 via html2canvas | Existing `ShareableCard` + GO Club [21–23] |
| Toast | `sonner` bottom toast | New (no reference; keep minimal) |

---

## Architecture

### Routes

Add to `src/app/routes.tsx`:

```
/app                   → AppShell (auth gate)
/app/welcome           → AppWelcomePage
/app/onboarding/*      → AppOnboardingFlow (linear)
/app/coach/home        → AppCoachHome
/app/coach/attention   → AppCoachAttention
/app/coach/athlete/:id → AppCoachAthleteDetail
/app/coach/capture     → AppCoachCapture
/app/coach/ai          → AppCoachAI
/app/coach/lineups     → AppCoachLineups
/app/coach/notes       → AppCoachNotes
/app/coach/sources     → AppCoachSources
/app/coach/settings    → AppCoachSettings
/app/athlete/home      → AppAthleteHome
/app/athlete/capture   → AppAthleteCapture
/app/athlete/erg-pacer → AppAthleteErgPacer
/app/athlete/ai        → AppAthleteAI
/app/athlete/notes     → AppAthleteNotes
/app/athlete/sources   → AppAthleteSources
/app/athlete/settings  → AppAthleteSettings
```

### Layout shells

- `AppShell` — top-level layout. Auth gate (redirect to `/app/welcome` if no Supabase session). Centered ~390 px column on desktop with soft surround. Full-bleed mobile.
- `AppRoleGate` — after auth, reads role from `app_profiles.role`. Routes coach to `/app/coach/home`, athlete to `/app/athlete/home`. Shows role pick if unset.
- `AppOnboardingShell` — linear flow shell with progress bar + back arrow. Hosts `<SingleQuestionScreen>` children.
- `AppCoachShell` — bottom tab bar (Home / Attention / Capture / AI / More).
- `AppAthleteShell` — bottom tab bar (Home / Capture / AI / Tools / More).

### Auth (Supabase Google OAuth)

- Supabase client at `src/features/app/lib/supabase.ts`.
- Provider: Google. Scopes: `openid email profile`.
- On first sign-in, create `app_profiles` row keyed by Supabase user id with `role = null`.
- After role pick, write `role = 'coach' | 'athlete'`.
- `useAppAuth()` hook exposes `{ user, profile, isLoading, signIn, signOut }`.

### File structure

```
src/features/app/
├── AppShell.tsx
├── AppRoleGate.tsx
├── lib/
│   ├── supabase.ts
│   ├── ai.ts                 # Anthropic SDK wrapper, scoped prompts
│   ├── voice.ts              # Web Speech + Web Audio analyser
│   └── share.ts              # html2canvas wrappers
├── primitives/
│   ├── StatWithProvenance.tsx
│   ├── ScopedAIInput.tsx
│   ├── CaptureModePicker.tsx
│   ├── CoachAttentionRow.tsx
│   ├── ConnectorChip.tsx
│   ├── SingleQuestionScreen.tsx
│   ├── TwoPaneChartSheet.tsx
│   ├── SettingsCardStack.tsx
│   ├── TrustCard.tsx
│   ├── ScanningLoader.tsx
│   ├── DashboardRevealGrid.tsx
│   ├── AuroraVoiceOverlay.tsx
│   └── BottomTabBar.tsx
├── onboarding/
│   ├── AppOnboardingShell.tsx
│   ├── WelcomePage.tsx
│   ├── RolePickPage.tsx
│   ├── SportPickPage.tsx
│   ├── CoachTeamSetupPage.tsx
│   ├── CoachCapabilitiesPage.tsx
│   ├── CoachConnectorsPage.tsx
│   ├── AthleteInviteCodePage.tsx
│   ├── AthleteConnectorsPage.tsx
│   ├── TrustCardPage.tsx
│   ├── ScanningPage.tsx
│   └── RevealPage.tsx
├── coach/
│   ├── AppCoachShell.tsx
│   ├── HomePage.tsx
│   ├── AttentionPage.tsx
│   ├── AthleteDetailPage.tsx
│   ├── CapturePage.tsx
│   ├── AIPage.tsx
│   ├── LineupsPage.tsx
│   ├── NotesPage.tsx
│   ├── SourcesPage.tsx
│   └── SettingsPage.tsx
├── athlete/
│   ├── AppAthleteShell.tsx
│   ├── HomePage.tsx
│   ├── CapturePage.tsx
│   ├── ErgPacerPage.tsx
│   ├── AIPage.tsx
│   ├── NotesPage.tsx
│   ├── SourcesPage.tsx
│   └── SettingsPage.tsx
├── data/
│   ├── mockTeam.ts           # mock data shaped to docs/SCHEMA.md
│   ├── mockAthletes.ts
│   ├── mockSessions.ts
│   ├── mockNotes.ts
│   └── mockConnectors.ts
└── store/
    ├── useAppStore.ts        # role, active scope, capture mode
    └── useAppAuthStore.ts    # Supabase session
```

### Data

Mock-first. Mock files in `src/features/app/data/` shaped to `docs/SCHEMA.md` so backend swap is mechanical. **Do not import from `src/shared/data/seeds/`** — `/app` has its own mocks because the existing seeds are tuned for the desktop/coach surface.

When the backend lands, replace `mock*.ts` with TanStack Query hooks against Supabase tables. Component layer doesn't change.

---

## Library stack

Only `recharts` carries from the parent app. Everything else is picked specifically to replicate the references.

| Lib | Why | Replicates |
|---|---|---|
| `framer-motion` | Already in repo; best motion engine for the references | Page push, aurora, sheet drag, count-up |
| `vaul` | iOS-feel bottom sheets with native drag physics | Cal AI sheets, capture picker, weekly digest |
| `sonner` | Minimal toast lib | Sync confirmations, capture success |
| `@use-gesture/react` | Pull-to-refresh, carousel swipe | GO Club horizontal carousel |
| `react-mobile-picker` | iOS wheel picker | Cal AI [8–11], erg log time/split |
| `react-easy-crop` | Photo capture review | Coach photo capture |
| `@radix-ui/react-slider`, `@radix-ui/react-switch`, `@radix-ui/react-select` | Accessible primitives | Cal AI sliders, toggles |
| `recharts` | Existing | GO Club two-pane chart top |
| `@anthropic-ai/sdk` | Claude API for chat | AI chat surface |
| `react-markdown` + `remark-gfm` | Render AI responses | AI chat message body |
| Web Speech API + Web Audio | Browser-native voice | Arc voice capture, mic transcribe |
| `canvas-confetti` | Already installed | PR celebration |
| `html2canvas` | Already installed | Share card rasterization |
| `date-fns` | Date math | DOB picker, schedule formatting |
| `lucide-react` | Already installed | Secondary icons |
| `@supabase/supabase-js` | Already installed | Google OAuth + future data layer |

**Forbidden carryovers from the parent app:** `@dnd-kit/*` (lineup builder will be touch-only, not desktop drag), the full `src/shared/layout/*` tree, the existing `Sidebar.tsx`, anything from `src/prototype/`. If you find yourself importing from `src/shared/layout/` or `src/features/coach/` into `src/features/app/`, stop and reconsider — `/app` is its own product.

**One exception** worth calling out: behavioral primitives in `src/features/athlete/behavioral/` (`AnimatedNumber`, `PRCelebration`, `WeeklyDigestModal`, `ShareableCard`, `useBehavioralStore`) are good and portable. You may **copy** (not import) them into `src/features/app/` and adapt. Don't import — `/app` should be deletable as one folder without breaking the parent app.

---

## Build order

Vertical slice. Build a thin path through the whole product before going deep on any one screen.

### Phase A — Foundation
1. Supabase client + Google OAuth
2. `AppShell` + `AppRoleGate`
3. Routes wired into `src/app/routes.tsx`
4. Theme tokens + per-metric color map exported from `src/features/app/lib/theme.ts`

### Phase B — Onboarding (Cal AI)
5. `<SingleQuestionScreen>` primitive
6. Welcome + role pick + sport pick
7. Coach team setup + capabilities + connectors
8. Athlete invite-code + connectors
9. `<TrustCard>` + `<ScanningLoader>` + `<DashboardRevealGrid>`

### Phase C — Coach vertical slice
10. `AppCoachShell` + bottom tab bar
11. Coach home (carousel + attention preview)
12. Attention list (`<CoachAttentionRow>`)
13. Athlete drill-in (`<TwoPaneChartSheet>`)
14. Coach AI chat (`<ScopedAIInput>` empty state + thread + response)

### Phase D — Athlete vertical slice
15. `AppAthleteShell`
16. Athlete home (living card + carousel)
17. Erg log capture (wheel pickers)
18. Wellness check-in (mood slider + tile grid)
19. Athlete AI chat (self-scoped)

### Phase E — Capture & voice
20. `<CaptureModePicker>` (both sides)
21. Voice memo with `<AuroraVoiceOverlay>`
22. Photo capture with `react-easy-crop`
23. Form video capture
24. Text + email forward modes

### Phase F — Polish & remaining stubs
25. Lineup builder mobile port
26. Notes (coach composer + athlete read-only)
27. Settings card stack (both sides)
28. Sources/connector status views
29. PR celebration + weekly digest wired to `/app` data
30. Share cards adapted to mobile column

Each phase ends with: `tsc -b` clean, `npm run lint` clean, manual walk on iPhone (375px) + iPad (768px) + desktop (≥1024px centered column).

---

## Critical rules

1. **Mobile is canonical.** Design at 390 px first. Desktop is the same column centered, never a different layout.
2. **Re-read this file before every page.** No exceptions. The Workflow rule above is load-bearing.
3. **Reference Claude empty-state on every page.** It's the calm-canvas baseline. Even non-AI pages should pass the "would Claude's empty state feel at home next to this?" test.
4. **Provenance on every number.** No bare stats.
5. **Two-stream test.** Coach scanning at 6am AND athlete walking off the water in 30s. Both, or scope explicitly.
6. **Athletes don't see synthesized scores by default.** Coach controls share toggles.
7. **Don't import from the parent app** beyond `THEME`, `recharts`, `src/shared/data/types.ts`, and Supabase client config. `/app` is a separable surface.
8. **No CSS transitions for meaningful motion.** All motion via `framer-motion`.
9. **Brand emerald is an accent, not a wash.** Full-bleed emerald only on welcome / OAuth / role pick / reveal / celebration. Data screens are `app.canvas` light.
10. **Don't add a chart library beyond recharts.** Don't add a UI kit. Don't add another animation library. The stack above is the stack.
11. **Sentence-case headlines.** Reserve lowercase two-tone display for marketing surfaces only.
12. **Mock data shaped to `docs/SCHEMA.md`.** Backend swap is mechanical.

---

## What this doc isn't

- It's not a copy of the parent `CLAUDE.md`. The parent governs the existing site; this governs `/app`. They overlap in brand tokens and TS types only.
- It's not a sprint plan. Phases A–F are an order, not a schedule.
- It's not a final API contract. Component prop shapes will evolve as primitives get built — keep this doc updated when they do.

---

## Maintenance

When you add a new screen, primitive, or library:

1. Add the screen to the **Screen ↔ reference mapping** table with its reference cite.
2. Add the primitive to **Component primitives** with its prop shape.
3. Add the lib to **Library stack** with one-line rationale.
4. If the new pattern conflicts with anything in **Critical rules**, the rules win — find a different pattern.

Last updated: this is the initial author. Phases A–F are pending.
