## synth-platform website/app — content inventory

This file inventories **user-visible copy** found in the synth-platform web app source at `synth-platform/src/`.

Notes:
- This repo is both marketing + app shell; the “website” includes the landing page and the coach/athlete demo flows.
- Seed-driven values (team names, counts, etc.) may render dynamically; where the UI shows template strings, those are included here.

---

## Landing page (`src/features/landing/LandingPage.tsx` + `Hero3D.tsx`)

Top nav:
- synth.
- Features
- Pricing
- Sign in
- Download
- Installed ✓

Hero:
- Coach data · unified
- Every data signal.
- One platform.
- synth. connects every tool your program already uses, scrapes and synthesizes the data, and hands coaches and athletes one surface to act on.
- Enter demo dashboard
- Download app / ✓ Installed
- Stats:
  - Connectors — 4
  - Athletes — 52
  - Custom tools — 2
- scroll

3D hero card microcopy:
- Coach · dashboard
- Cal Women's Rowing
- live
- Roster / Sessions / Alerts
- Signal · monthly
- Ella Wheeler
- port · #01
- 2K / Split / Watts
- Erg workbooks — synced · 2m
- synth. AI
  - Top improver: Madeline Cox −10.3s vs March 2025.
- YoY · 2K
  - −6.9s
  - improvement

Features section:
- What's in the box
- Six surfaces. One source of truth.
- 01 Unified coach dashboard
  - Every athlete, every signal, one surface. Roster health, compliance, wellness, and alerts rolled up from every connector.
- 02 Connect once, it updates forever
  - OAuth Sheets, TeamWorks, Whoop, Slack, or browser-extension scrape. Scheduled scans write clean markdown reports.
- 03 Rank, drill, decide
  - 52-athlete rosters sortable by 2K, watts, side. Click any card to open a full profile with trend charts and scoped AI.
- 04 Sport-specific custom tools
  - Lineups, session timers, practice planners. Drag athletes into boats, publish with one tap, notify the roster.
- 05 Strava-style piece timer
  - Sub-100ms clock per boat, multi-boat swipe, splits that flow back into the dashboard and each athlete profile.
- 06 synth. AI with citations
  - Team-wide, athlete-scoped, or athlete-own. Every answer carries the source rows it drew from. No black-box insights.

Pricing section:
- Pricing
- Flat tiers. Simple to buy.
- Pilot — $0 — free for the first 3 programs
  - Up to 1 team; 3 connectors; Email support
  - Join pilot →
- Club — $199 — per team / month
  - Up to 60 athletes; All connectors; synth. Agent extension; Priority support
  - Start trial →
- Program — $499 — per program / month
  - Multi-team; Custom tools; SSO + audit; Dedicated onboarding
  - Talk to us →

Close CTA:
- Get started
- Stop stitching tabs. Start coaching.
- Download synth. to your laptop or phone and connect your first source in under 60 seconds.
- Download app / ✓ Installed
- Try the demo first

Footer:
- © 2026 synth. — Every data signal. One platform. · synthsports.com

iOS/browser install modal:
- Install on iOS / Install on this browser
- Add synth. to your home screen
- iOS steps:
  - 1. Tap the Share button in Safari's toolbar.
  - 2. Scroll down and tap Add to Home Screen.
  - 3. Tap Add. synth. will appear as a standalone app.
- Non-iOS steps:
  - Your browser doesn't expose the install prompt to us right now. Look for an "Install" option in your browser's address bar or menu.
  - On Chrome/Edge/Brave: click the ⊕ icon in the address bar.
  - On Firefox / Safari desktop: use File → Add to Dock.
- Got it

---

## Auth

### Login (`src/features/auth/LoginPage.tsx`)

- Sign in
- Welcome back to synth.
- Work email
- Password
- Sign in (demo)
- Join with invite code →
- ← Back

### Join with invite (`src/features/auth/JoinWithInvitePage.tsx`)

- Join your team
- Join with an invite code.
- Your coach sent you a code by email. Enter it below and we'll drop you into your team's athlete view.
- Invite code
- Join team (demo)
- ← Back

---

## Coach navigation (sidebar) (`src/shared/layout/Sidebar.tsx`)

Brand:
- synth.

Team badge:
- Active team
- `{team.name}`
- `{team.sport} · {team.inviteCode}`

Groups:
- Overview
  - Dashboard
  - Athletes
  - Sources
- Custom Tools
  - (tool labels from registry, e.g. Lineups, Session Timer)
  - Add tool
- synth. AI
- synth. Agent
  - Connectors · scans · reports
- Settings

---

## Coach — Dashboard (`src/features/coach/dashboard/DashboardPage.tsx`)

Header:
- Kicker: Coach · Dashboard
- Title template: `{team.name} · team overview`
- Subtitle template: `{rosterCount} on roster · latest erg {latestErgDate}`

(Additional dashboard subcomponent copy exists in `src/features/coach/dashboard/components/*`.)

---

## Coach — Athletes

### Athletes roster (`src/features/coach/athletes/AthletesPage.tsx`)

- Kicker: Coach · Athletes
- Title: Full roster
- Subtitle template: `{N} athletes · latest erg 2026-03-16 · sorted by {sort}`

Controls:
- Search
- Placeholder: Type a name…
- Sort:
  - 2K rank
  - Name
  - Watts
- Side:
  - All
  - Port
  - Starboard
- Showing {visible} / {total}

### Athlete profile (`src/features/coach/athletes/AthleteProfilePage.tsx`)

Not found state:
- Not found
- Athlete `{athleteId}` isn't in this roster.
- ← Back to athletes

Profile chrome:
- ← Athletes
- Rank string template: `#{rank} on 2K · {date}`
- Coach · Athlete profile
- synth. AI · scoped
- Ask about {firstName}

Stat tiles:
- 2K test
- Avg split /500
- from current 2K
- Watts
- YoY delta
- vs 2025-03-17
- no prior data

Chart labels:
- Progression · 2K test
- {firstName}'s year-over-year
- Mar 2025
- Mar 2026

Placeholders:
- Sessions · last 30 days
- Workout + piece history
- Phase 6 (Session Timer) feeds real splits + video markers here. Until then this block is a placeholder so the profile layout is already wired for the schema.
- Lineup history
- Boats & seats this season
- Phase 5 (Lineups) writes published boat assignments into session_lineups — this card will render the per-athlete view.
- Wellness · rolling
- Sleep · HRV · recovery
- Backed by wellness_checkins in the schema. The wearable hub connector pushes daily HRV and sleep on a live schedule; email digests fill in subjective energy/soreness/mood. P1 wires real data.

---

## Athlete view pages (`src/features/athlete/athletePages.tsx`)

Shared shell labels:
- Kicker strings like:
  - Athlete · My Team
  - Athlete · My Stats
  - Athlete · Sessions
  - Athlete · Lineups
  - Athlete · My Sources
  - Athlete · Settings

My Team:
- Welcome back, {firstName}
- `{teamName} · {rosterCount} on roster · coach {coachFirstName}`
- My team
- Head coach
- Teammates
- Roster · {N}
- +{N} more
- Latest 2K
- Avg split /500
- YoY progress
- vs. 2025 test
- no prior data
- See my full stats →

My Stats:
- Personal performance
- Scoped to {athleteName}'s data only · 1 YoY test pair / no prior tests
- 2K progression
- Mar 2025 → Mar 2026
- No prior test data yet. Your first 2K will appear here.
- Current 2K
- Avg split /500
- Stroke rate
- strokes per minute

Sessions:
- My session history
- {N} recent sessions · splits and videos your coach shared

Lineups:
- My boat history
- {N} published lineups · boats and seats across the season
- seat {seat}

My Sources:
- Connect your own apps
- Personal data sources — separate from the team feed, only visible to you
- last sync · {date}
- connected / disconnected
- + Connect source
- Screenshots, CSVs, personal Sheets, wearables

Athlete AI (personal):
- synth. AI · personal
- Chat with your own data
- Scoped to your stats only. No team-wide visibility, no teammate data.
- Suggestions:
  - How did my splits trend this month?
  - What's my average gym load?
  - What should I focus on before the 2K test?
  - How do I compare to the team average?

Athlete settings:
- Visibility & notifications
- Control what the team and coach can see about you
- Share my splits with the team
- Show my wellness scores to the coach
- Let the team see my boat/seat history
- Get push notifications on lineup publish

