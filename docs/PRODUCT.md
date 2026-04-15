# synth. — Product Description

**What this is:** the plain-language product spec. Read this to understand what synth. is, who it's for, and how the pieces fit together. For engineering-grade requirements see `SRS-Synth-Platform.md`; for the database contract see `SCHEMA.md`.

---

## One-sentence pitch

**synth.** is a unified data platform for sports coaches that connects every tool they already use — spreadsheets, team ops software, wearables, email, Slack — and synthesizes the fragments into one dashboard both coaches and athletes can act on.

> Every data signal. One platform.

## The problem

A modern collegiate rowing coach uses 8–12 separate tools every week. Erg scores live in a Google Sheet. Gym logs live in Bridge Athletics. Attendance lives in TeamWorks. Wellness logs live in a group chat. Video lives on a hard drive or YouTube. Schedules live in the AD's office. *Every one of those tools works — in isolation.* The cost is the synthesis: pulling numbers across tabs, matching them to athletes, noticing who's at risk, building a lineup that reflects the last 4 weeks of data rather than the last practice.

Coaches don't have a data problem. They have a **dispersion problem**. The thesis of synth. is that AI finally makes data synthesis cheap enough to solve the "Sheets + GroupMe" incumbency at scale — without replacing any of the tools.

## Who it's for

| User | Role | What they need from synth. |
|---|---|---|
| **Head coach** | Decides lineups, sets training load, intervenes on at-risk athletes | A single roster view that tells them who's ready, who's declining, who hasn't logged in days, and *why*. |
| **Assistant coach** | Runs sessions, updates the sheet, checks in with athletes | Fast drill-down into any athlete without leaving the dashboard. Source history they can trust. |
| **Strength / performance staff** | Plans lift blocks, reads wellness | Gym data aligned to erg data. Compliance trends per athlete. |
| **Ops / admin** | Owns the roster, onboards athletes, schedules | CSV + email onboarding. Connector health at a glance. |
| **Athlete** | Logs wellness, does the workout, competes | A personal view of their own data, plus whatever their coach chooses to share. |

synth. starts with **collegiate rowing** because the founders lived this problem there (Cal Men's + Women's pilot). The architecture is sport-agnostic — a rowing team is just the v1 shape of what every program in every sport needs.

## The core value proposition

1. **One surface.** Every signal shows up in one coach dashboard. No more tab-switching.
2. **Provenance.** Every number carries its source and sync time — coaches can trust what they see and audit it.
3. **Connect once, it updates forever.** OAuth or a browser-extension handshake once, then data flows automatically on the schedule the coach sets.
4. **Coach and athlete, same platform.** Athletes join with an invite code and see their own data. Coaches control what's shared.
5. **Calm density.** Data-heavy dashboards that are still scannable. Monospace for metrics, serif for narrative, emerald accents.
6. **Sport-specific custom tools.** Lineups, session timers, practice planners — built into the product, not linked out.

---

## How it works (end-to-end)

```
1. Coach signs up →  creates a team
2. Coach connects sources →  Google Sheets OAuth, extension scan on Bridge, email digest, Slack channel
3. synth. Agent scans →  on schedule or on demand, writes markdown reports, updates canonical data
4. Dashboard renders →  team overview, roster, alerts, activity, charts
5. Coach uses custom tools →  builds lineups, runs session timers — data flows back to the dashboard
6. Coach invites athletes →  CSV upload + email → athletes get an invite code
7. Athletes join →  see their own stats, sessions, lineups, sources
8. synth. AI →  coach + athletes can ask questions scoped to team / individual / self data
```

---

## The five systems

synth. is deliberately modular. Each system is a cohesive surface the user can point at and name.

### System 1 — Landing page
The public face. Marketing site with a **Download** button that triggers a PWA install prompt (`beforeinstallprompt` on Chromium, "Add to Home Screen" instructions on iOS Safari). Nav: Logo · Features · Pricing · Download. Goal: get a coach to try the product from either their laptop or their phone without a native app store.

### System 2 — Coach Dashboard
The coach's home after sign-in. One surface, heavy on synthesis:

- **Team overview** — total athletes, active sessions this week, pending syncs
- **Athlete cards grid** — each card shows name, latest erg split, gym load, wellness score, last session date
- **Alerts panel** — red flags from wellness, overdue syncs, schedule conflicts
- **Activity feed** — latest scans, data pulled, sessions completed
- **Quick stats** — team trend charts (splits over time, attendance, training load)

The sidebar (left, fixed) groups everything:

```
[synth. logo]               ← click → landing page

DASHBOARD                   ← default
ATHLETES                    ← full roster → individual profiles
SOURCES                     ← connected tools, sync status, logs

CUSTOM TOOLS
  ├── Lineups
  ├── Session Timer
  └── [+ Add Tool]

SYNTH AI                    ← chatbot

──
SETTINGS
```

**Clicking an athlete card** opens their full profile: session timeline, performance trends, lineup history, wellness. Top of the profile has a **synth. AI** button that opens a chat scoped to just that athlete — "Is Phelps ready for Saturday?", "Compare October vs November splits".

### System 3 — synth. Agent (connector & scraping engine)
The place where sources live. Opens as a **modal portal overlay** (not a new page or tab) so coaches never lose dashboard context. Inside the portal:

- **Connected sources list** — name, URL, type (Extension / Sheets / Drive / Slack / Manual), schedule (cron-like), last scan timestamp, status chip, "Scan Now" button
- **Scan history & reports** — chronological markdown reports generated on every scan (what was found, what changed, what was new). Click any report to view the full MD.
- **+ Connect Source** — three tabs:
  - **Extension** — enter a URL to scan (e.g., `https://app.bridgeathletics.com/team/dashboard`), install the Chrome extension if needed, set the schedule
  - **Connectors** — pre-built OAuth flows for Google Sheets, Google Drive, Slack, TeamWorks (more over time)
  - **Manual Import** — drag-and-drop CSV, Excel, screenshots — synth. parses and previews before commit

### System 4 — Custom Tools (sport-specific internal apps)
Full-screen internal apps that live inside synth. Data flows back into the dashboard and athlete profiles. Two shipped at launch for rowing:

**Lineups tool** — drag-and-drop boat builder. Configurable between 4-seat and 8-seat shells. Port/starboard seat labels. Publish pushes a notification to athletes. Lineup history browsable by date. Seat assignments feed into athlete profiles.

**Session Timer tool** — Strava-style piece timer. Large elapsed clock center screen. Split button records piece times. Multi-boat support: swipeable cards, each boat has its own stopwatch. Video recording with chapter markers on split taps. Post-session auto-generates a report per boat. Splits flow back into dashboards.

**Extensibility** — the sidebar "Custom Tools" group is fed by a tool registry. Future tools (wellness check-ins, team announcements, practice planner) register themselves; the sidebar renders them automatically.

### System 5 — Athlete view
A separate experience for athletes. Invite flow:
1. Coach uploads a roster Excel
2. synth. generates a unique invite code per team
3. Each athlete gets an email with the code + join link
4. Athlete enters the code, is added to the team, sees their dashboard

Athlete dashboard surfaces:
- **My Team** — name, coach, teammates
- **My Stats** — personal erg splits, session history, trends
- **My Sessions** — every session timeline, splits, videos (if shared), notes
- **My Lineups** — boat / seat history
- **My Sources** — athletes can connect their own tools (Google Sheets, screenshots, CSVs, personal app exports)
- **synth. AI (personal)** — scoped to their own data

**Visibility rules** (enforced by `team_settings.athlete_visibility_json`):
- Athletes see ONLY their own data by default
- Athletes see their boat's session splits and videos only if the coach chooses to share
- Athletes never see other athletes' profiles or team-wide analytics
- Coach controls all toggles in Settings

### System 6 — synth. AI (chatbot)
Available in three places:

1. **Team-wide chat** from the sidebar — full context of team data. "Which athletes improved most this month?", "What's the team's average 2k split?", "Who hasn't logged gym data in 7 days?"
2. **Athlete-scoped chat** from any athlete profile — context of that athlete only. "Compare October vs November", "What's his load trend?"
3. **Athlete's own chat** — from the athlete view — scoped to their personal data. "How did my splits trend this month?", "What should I focus on before the 2k test?"

Every response cites the `source_data` rows it drew from (see `SCHEMA.md §5`). In v1 this is a canned-response engine; real LLM calls land once the backend is wired.

---

## Core user journeys

### 1. First-time coach setup
1. Head coach lands on `synth.com`, clicks Download — installs the PWA on their laptop
2. Signs up with email — becomes a coach account on a new team
3. Uploads a roster CSV — athletes get invite emails
4. Opens synth. Agent → + Connect Source → picks Google Sheets OAuth → selects the erg folder
5. synth. Agent does the first scan — produces an MD report showing the 52 athletes it found
6. Dashboard fills in. Coach sees roster, signal charts, alerts panel (empty on day 1)

### 2. Monday morning dashboard scan
1. Coach opens the PWA on their phone
2. Dashboard: 52 athletes, 2 at-risk chips (one with 5-day gym gap, one with low recovery score), 3 new scans completed overnight
3. Activity feed: "TeamWorks compliance updated — 2 athletes flagged"
4. Coach taps the first at-risk athlete — profile opens with a 14-day timeline showing the decline
5. Coach taps "synth. AI" on the profile — "Why is this athlete at risk?"
6. AI replies with citations: poor recovery scores, missed last two practices, gym compliance down 30% vs. 30-day average

### 3. Building Saturday's lineup
1. Coach opens Custom Tools → Lineups
2. Drags athletes from the roster panel into seats on the 1V 8+ and 2V 8+
3. System highlights seat conflicts (athlete already in another boat) and side mismatches (port athlete in a starboard seat)
4. Coach clicks Publish — athletes receive push notifications
5. Lineup is saved to history; each athlete's profile gets updated with the new boat/seat assignment

### 4. Running a session with the timer
1. Coach opens Custom Tools → Session Timer
2. Selects two boats from the latest lineup
3. Taps Start on both
4. Uses Split to record piece times across a 5×500m workout
5. Video recording captures the session; chapter markers land on each split
6. After session, synth. auto-generates a report per boat. Splits flow back to the dashboard and each athlete's profile

### 5. Athlete joins and checks their stats
1. Athlete gets email with invite code
2. Installs PWA on their phone
3. Enters invite code, sees their team and profile
4. Taps My Stats — sees last 6 weeks of 2k splits trending down (improving)
5. Asks synth. AI: "How does my split compare to the team average?"
6. AI replies with a chart and 2 data points: their split vs. team average vs. top boat average

---

## Design principles

(From SRS §7.1)

1. **One surface** — primary action is understanding the team. Drill into sources only when correction is needed.
2. **Provenance** — every number carries source + sync time. If you can't explain where a number came from, it doesn't belong in the UI.
3. **Coach vs. athlete streams** — educate this distinction in onboarding; collapse them into a unified table in steady state.
4. **Calm density** — data-heavy but scannable. Monospace for metrics, serif for narrative, generous whitespace.

**Visual language** — emerald primary (`#059669`) + bright accent (`#10B981`), JetBrains Mono for data, Fraunces for narrative headlines, Instrument Sans for body. Dark surfaces (`#18181B`, `#0C0A09`) where data needs to recede; light surfaces (`#FAFAF9`) as the default canvas. Inherits the a16z State of Crypto 2023 aesthetic rules from the sibling pitch deck (`~/presentations/synth-deck/CLAUDE.md`).

---

## Competitive positioning

The pitch deck's competition slide makes the claim: **no one connects it all**.

- **Bridge Athletics / TeamBuildr** — gym data only
- **TeamWorks** — ops and calendar, no performance data
- **Whoop / Oura** — wellness only, no coach surface
- **Smartabase** — expensive enterprise, per-sport rebuilds, slow to evolve
- **Google Sheets** — the incumbent; fragmented by nature

synth. is the unifier. It doesn't replace any of the above — it ingests them and synthesizes across. The advantage compounds: the more tools a coach connects, the more valuable the dashboard becomes.

---

## Phased roadmap

| Phase | What ships |
|---|---|
| **P0 — UI-first prototype (now)** | All five systems as UI with seeded mock data. Cal Women's Rowing (52 athletes, real erg data) as the demo team. No backend; auth mocked; AI responses canned. |
| **P1 — Backend MVP** | Supabase (auth, tables per `SCHEMA.md`, RLS). Google Sheets + manual CSV connectors live. Real invite-code onboarding. Session Timer writes real data. |
| **P2 — Agent + more connectors** | Chrome extension (Manifest v3). TeamWorks, Bridge, Slack connectors. Scheduled scans, real scan reports. |
| **P3 — synth. AI** | Real LLM calls (Claude) with citation-backed responses. Streaming. Athlete-scoped guardrails. |
| **P4 — Multi-sport + enterprise** | Sport-agnostic fields via `athletes.sport_data_json`. Multi-team memberships. SSO. Admin roles. FERPA-compliant audit trail. |

---

## Current state (what's actually built)

See `CLAUDE.md` for the engineering-side state. As of this commit:

- Feature branch `build/full-app` on `synth-platform`
- Folder structure staged for all 5 systems
- Cal Women's Rowing seed data (real erg data from 2026-03-16 sheet) imported from the rowIQ prototypes
- Sidebar shell, routing, and Phase 2 (Coach Dashboard) are the next build milestones

Everything is UI-first — when backends land, we swap `src/shared/data/seeds/*` for live Supabase queries and the rest of the app keeps working unchanged.
