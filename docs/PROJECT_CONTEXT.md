# synth. — Project Context

## What is synth.?

The platform that connects every coaching tool and lets coaches make decisions from one place.

**Tagline:** Every data signal. One platform.

**The problem:** Collegiate sports coaches use 8-12 separate tools weekly (Google Sheets, Bridge Athletics, TeamWorks, Whoop, Strava, Concept2, TrainingPeaks, etc.). Data quality isn't the issue — synthesis is. Coaches make training decisions based on gut feel instead of complete data. Athletes get overtrained and hurt.

**The solution:** synth. connects all these tools into one platform. It normalizes the data, computes composite scores (training load, recovery readiness, injury risk), and lets coaches operate directly from synth. — building lineups, running session timers, asking AI questions — with every action writing back to their existing tools automatically.

synth. is NOT another standalone app. It is the synthesis layer. Zero switching cost. Zero workflow disruption.

---

## Team

| Name | Role | Background |
|------|------|------------|
| Abishai Gosula | CEO & Technical Founder | CS @ UC Berkeley. Built the entire platform solo. Company: Elsheph Systems India Private Limited. |
| Matthew Waddell | Co-Founder | Silver medalist, 2025 U23 World Championships (NZ). Pacific Men's Rowing. Admitted to Cambridge. |
| Star Miller | Co-Founder (class project) | Pacific Women's Rowing. Rowed for Australia at U23 Worlds. |
| Lily Pember | Co-Founder (class project) | Pacific Women's Rowing. USA Junior World gold medalist. |

Going-forward founding team: Abishai and Matt.

---

## Two Codebases

### 1. Web App (`~/synth/apps/web/`)

**Stack:** React 18 · TypeScript · Vite 5 · Tailwind CSS 4 · React Router 7 · Zustand 5 · Framer Motion 12 · Recharts 3 · @dnd-kit · lucide-react
**Deploy:** Vercel
**Fonts:** JetBrains Mono (data/labels), Fraunces (headlines), Instrument Sans (body)

**Status:** All 13 UI phases complete. Coach dashboard, athletes list, athlete profiles, sources/data view, lineups (5 sub-tabs), session timer, AI chat, settings, landing page, athlete view, PWA install — all built with demo data from TypeScript seed files.

**Current work:** Running rebuild chunks (bug fixes, theme consistency, athlete page improvements, data view creative visualizations, lineup builder redesign).

**File structure:**
```
src/features/
  landing/LandingPage.tsx, Hero3D.tsx
  auth/LoginPage.tsx, SignUpPage.tsx, JoinWithInvitePage.tsx
  productDemo/ProductDemoPage.tsx
  coach/
    dashboard/DashboardPage.tsx + 11 components
    athletes/AthletesPage.tsx, AthleteProfilePage.tsx, AthleteComparePage.tsx + components + data
    tools/lineups/LineupsPage.tsx + components (RosterPanel, BoatCard, SeatSlot, AthleteChip)
    tools/sessionTimer/SessionTimerPage.tsx + components
    sources/SourcesPage.tsx, ConnectorsDataViewPage.tsx + components (WorkflowFlowBoard, SourceCard)
    ai/ChatView.tsx, AthleteScopedChatPage.tsx, TeamChatPage.tsx, cannedResponses.ts
    settings/SettingsPage.tsx
    onboarding/ (4 pages)
  athlete/
    AthleteLayout.tsx, athletePages.tsx, athleteAppPages.tsx
    components/AthleteBottomTabs.tsx, AthleteMoreSheet.tsx
    data/demoAthleteData.ts, demoAthleteDataView.ts
    onboarding/ (4 pages)
    pages/ (being built: TodayPage, ProgressPage, RecordPage, etc.)

src/shared/
  layout/ (Sidebar, CoachLayout, AthleteSidebar, MobileTopBar, etc.)
  components/ (Avatar, Skeleton, OnboardingShell, etc.)
  data/seeds/ (wellness, athleteExtras, trends, lineups, scanLogs, gymSessions, calendar, stravaActivities, coachNotes, sleepHrv, sessions)
  data/rowiqWomensData.ts (real Pacific Women's Rowing erg data)
  data/queries/ (12 TanStack Query hooks — ready for Supabase swap)
  store/ (16 Zustand stores)
  intelligence/metrics.ts (training load, recovery algorithms)

src/lib/
  supabaseClient.ts, authBridge.ts, featureFlags.ts, theme.ts, motion.ts
  ai/claude.ts, prompts.ts, contextBuilders.ts
  stream/client.ts, tokens.ts, channels.ts
```

### 2. iOS Native App (`~/synth-ios/`) — NEW

**Stack:** Swift · SwiftUI · Supabase Swift SDK · Swift Charts · AVFoundation · Lottie
**Target:** iOS 16+, iPhone-first
**Language:** Swift (pure native, not React Native or Capacitor)

**Status:** Starting from scratch. Project structure planned, not yet created.

**Design direction:**
- Athlete app first (coach app later)
- Home screen = synth. AI chat (Sana AI style)
- Floating bottom nav with raised "+" button
- Semi-circle tool carousel on long-press "+"
- Profile drawer from avatar (top right)
- Splash screen: synth. logo on black (CREME style)
- Login: Perplexity style (data streams illustration + Google/email auth)
- Invite-only access (no direct account creation)
- Production mode from day one (no demo flag — empty states when no data)

---

## Data Architecture

**Seed data (demo/development):**
- 52 athletes from real Pacific Women's Rowing 2025-26 erg workbooks
- 316 2K erg scores with parsed times and splits
- 2 teams: Pacific Women's Rowing + Pacific Men's Rowing
- 30 days wellness check-ins, 14 days sleep/HRV, 10 coach notes, 5 lineups, 4 sessions
- Demo coach: coach@berkeley.edu
- Demo athlete: Star Miller

**Production path:** Swap seed imports for Supabase queries. Feature layer stays unchanged. Schema in `docs/SCHEMA.md` defines 23 tables.

**Key data model: JSONB events table.** Every data point from every source stored as a normalized timeline event. Sport-agnostic by design.

---

## Design Language

**Brand:**
- Name: synth. (always lowercase, always with the period)
- Primary: #059669 emerald (CTA, brand)
- Accent: #10B981 green (logo dot, checkmarks, live badges)
- Background: #050505 (splash, login — always dark)
- App surfaces: light mode default, dark mode optional

**Light mode:**
```
--bg-primary: #FFFFFF
--bg-surface: #F7F7F8
--text-primary: #111111
--text-secondary: #6B7280
--green-primary: #059669
```

**Dark mode:**
```
--bg-primary: #050505
--bg-surface: #111111
--text-primary: #ffffff
--text-secondary: #a1a1aa
--green-primary: #10B981
```

**Typography:** JetBrains Mono 600 (logo, data, labels), system sans (body)
**Icons:** lucide-react (web), SF Symbols (iOS)
**Animation:** Framer Motion (web), SwiftUI animations (iOS)

---

## App Structure

### Coach App (Web — Desktop Primary)

**Home:** Boat on animated background. Swipe between boats. Tap seats to fill. Publish.
**Bottom nav:** Boats | Team | (+) | AI | More
**Profile drawer:** Team management, invite athletes/coaches, sources, settings, support

### Athlete App (iOS Native — Phone Primary)

**Home:** synth. AI chat. Gradient avatar with glow. Contextual prompts. Photo/voice input.
**Bottom nav:** Home/AI | Stats | (+) | Team | You
**"+" tap:** Full tool tray page (Record Form, Log Score, Wellness, Erg Pacer, Race Sim, Props, Journal)
**"+" long press:** Semi-circle carousel of tool icons fanning upward
**Profile drawer:** Connected apps, settings, support, sign out

---

## Auth System

- Invite-only access. No "Create account" button.
- "Want access? Contact us" for non-invited users.
- Coach generates invite links for athletes AND assistant coaches.
- Invite links have role pre-assigned (athlete/coach/cox).
- Auth methods: Google + email (6-digit code). Apple if easy.
- If email exists in database → logged in.
- If email + valid invite → account created with pre-assigned role.
- If email doesn't exist + no invite → "No account found."

---

## Connectors (Planned)

| Priority | Source | Method | Status |
|----------|--------|--------|--------|
| 1 | Google Sheets | OAuth + API (two-way sync) | Build first |
| 2 | Concept2 Logbook | OAuth | Planned |
| 3 | Strava | OAuth + webhooks | Planned |
| 4 | Apple Health | HealthKit (iOS native) | Planned |
| 5 | Whoop | OAuth | Planned |
| 6 | Garmin Connect | OAuth | Planned |
| 7 | TrainingPeaks | OAuth | Planned |
| 8 | Bridge Athletics | Scraping (Firecrawl) | Planned |
| 9 | Google Calendar | OAuth | Planned |
| 10 | Oura Ring | OAuth | Planned |

Plus AI Import pipeline: photo → Claude Vision → structured data, voice → Whisper → Claude → structured data.

---

## Algorithms

- **Training Load (0-10):** Composite of water, erg, gym, cross-training. Sport-configurable weights.
- **Recovery Readiness (0-100):** Sleep + HRV + wellness + fatigue. Green 75+, Amber 50-74, Red <50.
- **Injury Risk:** Multi-signal detection (load spike >30%, declining HRV, poor sleep, high soreness).
- **Performance Trend:** 7/14/30 day rolling averages + linear regression.
- **Lineup Optimization:** Historical seat performance × pair compatibility × current form × recovery.
- **Data Quality Score (0-10):** Sources connected + freshness + completeness.

---

## Revenue

| Tier | Price | Who |
|------|-------|-----|
| synth. Coach | $499/mo per sport | Individual coaching staff |
| synth. Department | $4,999/mo per AD | Athletic directors (all sports) |
| synth. Conference | TBD | Conference-level benchmarking |

Projection: $150K Y1 → $450K Y2 → $1.35M Y3 → $4M Y4 → $16M Y5 → $108M Y6.

---

## Traction

- Validated with Pacific Men's and Women's Crew (#2 and #8 nationally)
- 120 elite athletes, including Olympians
- 4 coaches engaged
- 250 pre-launch signups

---

## Assets

15 assets generated and organized in `synth_assets/` with `ASSET_REFERENCE.md`:

| # | File | Usage |
|---|------|-------|
| 01 | coach_rowing_aerial.png | Marketing, pitch deck (NOT login — sport-specific) |
| 02 | athlete_firstperson_rowing.png | Athlete onboarding welcome (rowing OK at that point) |
| 03 | app_icon_dot.png | PRIMARY app icon (green dot on black) |
| 04 | app_icon_s_dot.png | Splash screen logo ("s" + green dot) |
| 05 | onboarding_sheet_to_cards.png | Coach onboarding "connect workbook" |
| 06 | onboarding_goal_path.png | Athlete onboarding "set a goal" |
| 07 | login_bg_streams_clean.png | LOGIN BACKGROUND (both apps, sport-neutral) |
| 08 | login_bg_streams_dense.png | Coach home background / alt login |
| 09 | water_loop_bg.mp4 | Alternative ambient background |
| 10 | onboarding_phone_invite.png | Coach onboarding "invite athletes" |
| 11 | empty_state_boat.png | Empty lineups page |
| 12 | empty_state_chart.png | Empty stats page |
| 13 | empty_state_mic.png | Empty coach notes |
| 14 | bg_texture_particles.png | Subtle app-wide background texture |
| 15 | confetti_burst.mp4 | PR celebration overlay |

Still needed: tools converging illustration (6-8 icons → green node, 800×600px).

---

## Feature Categories (Planned)

### Athlete Tools (9)
Video Comparison, Erg Pacer, Technique Journal, Travel Planner, Nutrition Logging, Injury Reporting, Coxswain Toolkit, Weight Room Spotter, Seat Racing Calculator

### AI Intelligence (15)
Contextual Prompts, Pre-Practice Briefing, Recovery Recommendations, "If I Were You" Card, Sleep Coaching, Academic Balance, Teammate Pairing, Boat Chemistry, Post-Race Debrief, Injury Recovery Companion, Study Buddy Mode, Parent Mode, Performance Story, Race Day Mode, "What's Working" Correlations

### Nudges & Engagement (16)
PR Celebrations, Streaks, PR Wall, "This Time Last Year", Dark Horse Alert, Rest Day Affirmation, Weekly Win, Comeback Celebration, Consistency Percentile, Goal Milestones, Improvement Rank, RPE Quick Log, Props, Team Challenges, Pulse Survey, Race Simulation

### Shareable Content (25+)
Season Wrapped, PR Card, Race Day/Result Cards, Weekly Stats, Leaderboard Snapshot, Goal Achievement, Boat Card, Season Progression Video, Coach Quote Card, Recruiting One-Pager, Milestone Timeline, Team Photo Card, All-Time Stats Card, Parent Update Report, NIL Portfolio, Team Season Recap

---

## Current Priorities

1. **iOS native app (athlete)** — build in Swift/SwiftUI, starting now
2. **Web app polish** — run remaining rebuild chunks (bug fixes, chunk 2, chunk 3)
3. **Supabase auth + database** — real login, real data persistence
4. **Google Sheets connector** — first real data integration
5. **Claude AI wiring** — replace canned responses with live API calls
6. **YC Summer 2026 application** — deadline May 4
7. **Install on athlete phones** — TestFlight or direct Xcode install
8. **First paying customers** — target Q2

---

## Monthly Infrastructure Cost (Pilot)

| Service | Cost |
|---------|------|
| Supabase Pro | $25 |
| Anthropic (AI chat + vision) | $8-15 |
| Groq Whisper (voice) | $0 (free tier) |
| Google Cloud (Sheets/Calendar) | $0 |
| Supabase Realtime (team chat) | $0 (included) |
| SendGrid (email) | $0 (free tier) |
| Apple Developer (TestFlight) | $8.25 ($99/yr) |
| **Total** | **~$35-50/month** |

---

## Key Conventions

- `THEME.*` for all colors — no hardcoded values
- synth. always lowercase with period
- JetBrains Mono for all data and labels
- Erg times always in mm:ss.s format (never raw seconds)
- Recovery dots: green (75+), amber (50-74), red (<50)
- No emojis in professional UI — use icons
- Production mode by default — empty states with CTAs when no data
- Commit after every chunk/feature completion
