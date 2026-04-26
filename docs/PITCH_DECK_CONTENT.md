## synth. pitch deck — content inventory

This file inventories **user-visible text** in the pitch deck source at `~/presentations/synth-deck`.

Deck meta (from `presentations/synth-deck/src/lib/theme.ts` + `deckTotal.ts`):

- **Brand**: synth.
- **Tagline**: Every data signal. One platform.
- **Deck name**: Pitch Deck
- **Year**: 2026
- **Main deck slide total**: 19

---

## Slide 1 — Title (`S01_Title`)

- synth.
- Every data signal. One platform.

---

## Slide 2 — Problem (`S02_Problem`)

- Section/page: `01 · PROBLEM` · `2 / 19`
- Coaches are drowning in dispersed data.

Problem carousel (tool cards) (`ProblemInfiniteToolMarquee`):

- Card headings: Tool one, Tool two, Tool three, Tool four, Tool five, Tool six, Tool seven, Tool eight
- Card descriptions (image alts):
  - Team or training app screenshot (×3)
  - Google Sheet for recording erg scores
  - Erg monitor screen
  - TeamWorks calendar
  - TeamWorks compliance
  - Google Sheets: Starboard and Port erg intervals plus Bike watts

---

## Slide 3 — Our Solution cover (`OurSolutionCover`)

- Section/page: `02 · SOLUTION` · `3 / 19`
- Our Solution
- Every data signal. One platform.

---

## Slide 4 — Solution overview (`S03_SolutionOverview`)

- Section/page: `02 · SOLUTION` · `4 / 19`
- The solution
- One roster. Every signal.
- Coaches are stuck doing manual exports and reconciling mismatched athlete IDs across tools. synth. connects sources once, schedules updates, and gives a single, always-current view of the team.

Feature cards:

- Connectors — Connect Sheets, TeamWorks, wearables, and any coach workflow. Keep your existing stack—no rip-and-replace.
- Scheduled sync — Updates happen on a schedule (and on-demand). No more morning spreadsheet cleanup or missed notes.
- Custom tools — Lineups, timers, reports—thin tools on top of the same roster IDs, so everything fits together.

What it solves:

- Dispersed data → unified roster + alerts, with less admin work.
- Read everything. Replace nothing.

---

## Slide 5 — Set up your account (`SetupAccountSlide`)

- Section/page: `02 · SOLUTION` · `5 / 19`
- Set up your account
- Use + Add source for more connectors. Press next (→) to simulate the coach clicking Create account.

Modal:

- 1 · Upload athletes (CSV + emails)
  - cal-athletes-fall2026.csv
  - Ready
- 2 · Select connectors
  - Google Sheets
  - TeamWorks
  - Wearable sync
  - - Add source
- 3 · Set up schedule
  - Cloud scrape + ingest
  - Daily · 6:00 AM PT
- Buttons / states:
  - Create account
  - Creating account…
  - Hey, emails have been sent.

---

## Slide 6 — Solution flow: dashboard (`SF01_DashboardIntro`)

- Section/page: `02 · SOLUTION` · `6 / 19`
- Start from one dashboard.
- Core product is the synth layer — everything funnels here. Custom tools plug in after.

---

## Slide 7 — Solution flow: extension (`SF02_DeployExtension`)

- Section/page: `02 · SOLUTION` · `7 / 19`
- Synth agent = browser extension.
- Press next after the click — the extension is how we stay beside your real tools without another login wall.

Modal:

- Deploy agent
- Connect sources → scheduled sync → roster stays current.
- Sources
  - ● Google Sheets
  - ● TeamWorks
  - ● Wearables
- Scheduled
  - Every day at 6:00am
  - Daily
- Deploy now
- Later

---

## Slide 8 — Workflow (`SynthAgentWorkflowSlide`)

- Section/page: `02 · SOLUTION` · `8 / 19`

Inputs:

- Inputs
- 8 sources
- Athlete signals — Wearables, training logs, and daily context. (WHOOP, Sleep, HRV, RPE)
- Performance data — Erg intervals, splits, and testing history. (Erg, Intervals, Splits)
- Team management — Roster, attendance, and ops. (TeamWorks, Roster, Attendance)
- Calendar & planning — Training plan + schedule changes. (Calendar, Practice, Travel)
- Coach stack — The tools you already run the program on. (TeamWorks, Sheets, Calendar, Video)
- Files & uploads — CSVs, shared drives, and ad-hoc imports. (CSV, Google Sheets, Email)
- Compliance — Eligibility, forms, and status. (Compliance, Forms, Status)
- Interval worksheets — Prescriptions + interval targets. (Sheets, Intervals, Bike)

Output:

- Output
- One Team Overview, always current.
- Team Overview (output)
- Live roster, readiness, notes, and alerts—one surface.

---

## Slide 9 — Custom tools (`CustomToolsShowcaseSlide`)

- Section/page: `02 · SOLUTION` · `9 / 19`
- Custom tools, same IDs.
- Every tool is just another surface on top of the synth layer—lineups, timers, reports—writing back into one roster.

Cards:

- Custom tool → Lineups
  - Build boats on real roster IDs.
- Session timer
  - 12:48
  - Lap 03 · 2:11
  - Laps
  - Saved to athlete IDs
  - Start / Lap / Stop
- Request a tool
  - We’ll ship it in 24 hours.
  - Only 2 live
  - What do you need next?
  - Same roster IDs, same connectors. New tool appears in the sidebar when it’s ready.
  - Travel plan — lineup + vans
  - Seat alerts — risk → swap
  - Compliance — missing data
  - Your request
  - e.g. “Boat seat alerts when sleep < 6.5h + high load”…
  - Response: within 24 hours
  - Request

---

## Slide 10 — Connectors (`S04_Connectors`)

- Section/page: `03 · CONNECTORS` · `10 / 19`
- Connect once. It updates forever.
- OAuth or extension — then scheduled pulls from Sheets, Bridge, TeamWorks, Whoop, and the tools you already pay for.

---

## Slide 11 — Traction (`S05_Traction`)

- Section/page: `04 · TRACTION` · `11 / 19`
- Validation in the Cal ecosystem.
- One surface for every coach workflow: pilots where the pain is highest, validation across multiple sports.

Left card:

- Piloting + validating
- Cal Athletics
- Live pilots
- Pilot — Cal Rowing — Real roster, lineups, fatigue workflow — Rowing
- Validating — Cal Tennis — Roster + session capture — Tennis

Right card:

- In conversations with
- Bracket
- Football, Water Polo, Swimming, Basketball, Soccer, Track & Field, Baseball, Lacrosse

Traction block:

- Traction
- (Replace numbers with your latest)
- Advisory board — —
- Revenue — —
- Customers — —
- Athlete users — —
- Coaches — —

---

## Slide 12 — Why now (`S06_WhyNow`)

- Section/page: `05 · WHY NOW` · `12 / 19`
- Why now
- Olympic prep is becoming data-driven.
- Every program is adding wearables and monitoring—more signals, more tools, more admin overhead. The winners are the teams that can unify it into a workflow coaches actually use.

The trend across sports teams:

- More sensors — Sleep, readiness, load, GPS, wellness
- More tools — Team ops + strength + performance + notes
- Same staff — Coaches can’t babysit exports daily
- Same goal — Availability + selection + winning

Olympic tailwind:

- With LA28 on the horizon, Olympic programs are formalizing monitoring stacks and recovery workflows. Adoption is accelerating—what’s missing is the unifying layer that turns data into decisions.
- Our bet — A synth layer that connects everything and updates on schedule—so coaches spend time coaching, not reconciling.

Footnote:

- (Sources: LA28/Team USA wearable partnership announcements and the broader shift to athlete monitoring stacks.)

---

## Slide 13 — Market (`S07_Market`)

- Section/page: `06 · MARKET` · `13 / 19`
- Start with rowing. Scale to every sport.
- One synthesis engine. Each sport gets a thin base app; we widen the wedge before we blanket collegiate and pro.
- TAM · $4.2B+ — Global programs juggling fragmented performance stacks.
- SAM · $890M — US collegiate: 12K+ programs, 3+ tools each.
- SOM · $24M — US collegiate rowing: high pain, no direct competitor.

---

## Slide 14 — Business model (`S08_BusinessModel`)

- Section/page: `07 · BUSINESS MODEL` · `14 / 19`
- Flat tiers. Simple to buy. Natural to upgrade.

Tier cards:

- Starter — $199/mo
  - Up to 40 athletes; Base app; 1 connector (Sheets); Weekly sync
- Pro — $499/mo
  - Up to 80 athletes; 3 connectors; Daily cloud scraping; AI dashboard
- Elite — $999/mo
  - Unlimited athletes; Unlimited connectors; Real-time sync; Chrome ext + layouts
- Enterprise — Custom
  - Multi-sport deploy; Dedicated connectors; White-label; Custom base apps

Why the upsell is natural:

- Each step unlocks the next job-to-be-done, same product, wider pipes, not a different SKU for its own sake.
- Starter — Daily use → proof the surface saves time
- Pro — More connectors + synthesis → fewer tabs
- Elite — Automation + real-time → staff stops babysitting exports
- Enterprise — Athletics deploys one stack across sports

Revenue projections:

- 1 (pilot) — 5 — 3S + 2P — $19K
- 2 — 20 — 8S+8P+4E — $115K
- 3 — 50 — 15S+20P+10E+5Ent — $400K+
- 4 — 100+ — Multi-sport — $800K–1.2M

Steady-state ARR mix:

- Starter 12%
- Pro 28%
- Elite 38%
- Enterprise 22%
- Illustrative mix once programs mature, Elite and Pro carry most recurring volume; Starter seeds the wedge.

Footer:

- Less than a set of oars to start. Scales to a university-wide deployment.

---

## Slide 15 — Competition (`S09_Competition`)

- Section/page: `08 · COMPETITION` · `15 / 19`
- No one connects it all.

Table headers:

- Competitor
- Sport-specific
- Connects tools
- One view
- Auto-updates

Rows:

- synth. — Purpose-built synthesis — ✓ ✓ ✓ ✓
- TeamWorks — Team communication & scheduling
- Hudl — Video analysis (football, basketball)
- Bridge Athletics — Gym & strength tracking
- TrainingPeaks — Endurance training plans
- Catapult / STATSports — GPS wearables for team sports
- Sheets + GroupMe — The actual incumbent

Differentiators:

- 01 Built for the sport — synth. is sport-specific. Everyone else is generic or built for football.
- 02 Connects all tools — synth. reads data from ANY tool via connectors. Nobody else does this.
- 03 One athlete view — Gym + water + schedule + compliance in one profile. Elsewhere: 4 apps.
- 04 Automated updates — Cloud scraping on schedule. Everything else requires manual entry.

Footer:

- The switching cost is low because there is nothing to switch from.

---

## Slide 16 — Team (`S10_Team`)

- Section/page: `09 · TEAM` · `16 / 19`

Members:

- Abishai Gosula — Co-founder
  - Fractional founder of Elsheph Systems
  - SAP Scholarship Holder ’26
  - ISF Scholarship holder ’25
  - ISF Dubai Tech Summit winner
- Star Rose — Co-founder
  - Cal Women’s Rowing
  - Australian U23 Women’s Eight · 2024 World Rowing U23 Championships
  - St. Catharines, Canada · Sydney Rowing Club
- Lily Pember — Co-founder
  - Cal Women’s Rowing
  - Gold medalist · Junior World Rowing Championships (USA)
  - Competed at the highest junior international level
- Matthew Waddell — Co-founder
  - Cal Men’s Rowing
  - Silver medalist · U23 World Rowing Championships (New Zealand)
  - Competed at the highest U23 international level

Footer:

- We’ve lived the problem. Now we’re building the solution.

---

## Slide 17 — Vision (`S11_Vision`)

- Section/page: `VISION` · `17 / 19`
- 10 · VISION
- Roadmap → Vision

Revenue card:

- Revenue
- $—
- (replace with current)

Steps:

- What we were doing — Proving the pain
  - Manual exports
  - Mismatched athlete IDs
  - Too many tools
- What we are doing — Pilot + validate (Rowing → Tennis)
  - Roster + lineups + session timer
  - Scheduled sync
  - Daily coach workflow
- Where we’re going — One synth layer for every program
  - More sports = thin base apps
  - Same roster IDs underneath
  - Partners ship tools on top

Vision callout:

- Custom base apps. One synth layer. Every program.
- What we want to be — The default roster + signal layer that powers every coach tool.

---

## Slide 18 — Close (`S12_Close`)

- Section/page: `CLOSE` · `18 / 19`
- Our ask
- Three ways to plug in

Rows:

- 01 Partners & pilots — Coaches and programs still split across disconnected tools, help us shape the base app for your sport.
- 02 $100k seed — Raising $100k to turn live traction into repeatable growth, clear use of funds, no mystery.
  - Use of funds: Brand & marketing; AI & compute credits; Ops & infrastructure
- 03 GTM / sales — A network into collegiate athletics, AD offices, coaching trees, conferences, to open doors while we ship.

Footer:

- Built for rowing. Built to synthesize everything.
- synthsports.com · [supportsynth@gmail.com](mailto:supportsynth@gmail.com)

---

## Slide 19 — Thank you (`S13_ThankYou`)

- Section/page: `THANK YOU` · `19 / 19`
- Thank you.
- Questions welcome, we'd love to keep the conversation going.
- synthsports.com · [supportsynth@gmail.com](mailto:supportsynth@gmail.com)
- synth.