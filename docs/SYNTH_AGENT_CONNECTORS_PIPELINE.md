# synth. Agent — Connectors & Data Pipeline Build Plan

## The Core Idea

synth. Agent is NOT an extension (yet). It is a connectors hub where coaches and athletes link their existing tools, and synth. reads and writes data through official APIs, AI extraction, and manual input. The extension is coming — show a placeholder. Everything else works today.

---

## WHAT THE SYNTH AGENT PORTAL LOOKS LIKE NOW

When coach clicks "synth. Agent" in the sidebar, a modal opens showing:

### Top Section: Connected Sources

A list of everything currently connected. Each source shows:

- Name + icon (Google Sheets, Concept2, Strava, Apple Health, etc.)
- Status: Connected (green) / Not connected (gray)
- Last sync timestamp
- Data summary: "142 erg scores synced" / "47 gym sessions imported"

### Middle Section: Add Connector

Three tabs:

**Tab 1: Official Connectors**

Grid of available integrations. Each is a card with:

- Tool logo/icon
- Tool name
- What data it provides
- "Connect" button (triggers OAuth or setup flow)
- Available connectors listed below in detail

**Tab 2: AI Import**

Three options:

- Take Photo / Upload Screenshot → Claude Vision extracts data
- Voice Note → Whisper transcribes, Claude structures
- Paste Text → Claude parses raw text into structured data

**Tab 3: Manual Import**

- CSV / Excel file upload with column detection
- Google Sheets URL paste (quick connect)

### Bottom Section: Extension (Coming Soon)

A banner:

```
BROWSER EXTENSION — COMING SOON
Connect any web app. Set a schedule. synth. reads it automatically.
[Join waitlist]
```

Grayed out, not clickable except for the waitlist email capture.

---

## EVERY CONNECTOR — WHAT IT DOES AND HOW IT WORKS

### 1. Google Sheets (TWO-WAY)

**The most important connector. Build this first.**

**Read flow:**

- Coach clicks "Connect Google Sheets"
- OAuth 2.0 popup → coach signs into Google
- synth. shows their Drive → coach selects their rowing folder
- synth. reads all .xlsx, .csv, and Google Sheets files
- Parses erg scores, split times, attendance, any tabular data
- Maps athlete names to the synth. roster (fuzzy matching for spelling variations)
- Data appears on athlete profiles and dashboard within seconds

**Write flow:**

- Coach runs a session in synth. Session Timer → splits recorded
- Coach publishes a lineup in synth. Lineups tool
- Athlete completes a wellness check-in
- synth. writes the data back to the coach's spreadsheet automatically
- Uses `spreadsheets.values.append()` to add rows in the coach's existing format
- Coach opens their Google Sheet → new data is already there
- Their existing formulas, charts, conditional formatting all still work

**Two-way sync:**

- Coach adds data in Google Sheets → synth. picks it up on next poll (every 5 min) or via Apps Script trigger
- Coach adds data in synth. → synth. writes it to Google Sheets immediately
- The spreadsheet and synth. are always in sync
- Coach never has to choose between the two

**Settings for this connector:**

- Which folder to watch
- Which sheets to write back to (coach selects target sheet + column mapping)
- Sync frequency: real-time (Apps Script trigger) or polling (every 5/15/30 min)
- Write-back toggle: on/off per data type (sessions, lineups, wellness)

---

### 2. Concept2 Logbook

**What it gives you:** Every erg score the athlete has ever recorded. 2k, 6k, 10k, 30min tests. Split times, stroke rates, distance, date. Lifetime meters.

**How it works:**

- Athlete clicks "Connect Concept2" in their synth. profile
- OAuth flow to log.concept2.com
- synth. pulls their full workout history
- Maps to their athlete profile
- Polls for new data daily (or on-demand "Sync Now" button)

**Why this matters:** Most serious rowers already log to Concept2 because the erg uploads automatically via USB/Bluetooth. This gives you cleaner erg data than Google Sheets — it's the official source.

---

### 3. Strava

**What it gives you:** Erg sessions (Concept2 syncs to Strava), running, cycling, cross-training. Heart rate, distance, pace, power, maps.

**How it works:**

- Athlete clicks "Connect Strava"
- OAuth flow
- synth. registers a webhook — Strava pushes new activities to synth. in real-time
- No polling needed — Strava tells synth. when there's new data

**Why this matters:** Athletes who don't use Concept2 Logbook often log ergs on Strava instead. Also captures cross-training that the coach wouldn't otherwise see.

---

### 4. Apple Health / Google Health Connect

**What it gives you:** Sleep duration and quality, HRV, resting heart rate, steps, body measurements, workout data — from ANY wearable the athlete uses (Whoop, Garmin, Apple Watch, Oura, Fitbit). One integration, all devices.

**How it works:**

- Athlete opens synth. on their phone
- Taps "Connect Health Data"
- iOS: HealthKit permission prompt → athlete selects which data types to share
- Android: Health Connect permission prompt → same flow
- synth. reads on app open (or periodic background fetch if PWA supports it)

**Why this matters for coaches:**

This is the FATIGUE DATA the coaches are asking for. They want to see:

- Did this athlete sleep 4 hours before a hard session? Red flag.
- Is their HRV trending down over 2 weeks? Overtraining signal.
- Did their resting heart rate spike? Possible illness.

synth. surfaces this as cards on the coach's dashboard:

- "3 athletes with <6hr sleep last night"
- "Phelps: HRV down 15% over 2 weeks — monitor training load"
- "Gold: resting HR elevated 8bpm above baseline"

---

### 5. Google Calendar

**What it gives you:** Practice schedule, class schedule, exam dates, travel, conflicts.

**How it works:**

- Same Google OAuth as Sheets (add calendar scope)
- synth. reads the team calendar + individual athlete calendars (if shared)
- Surfaces on the synth. dashboard: "Tuesday is a 6+ hour academic day for 8 athletes"

**Why this matters:** Coach can see when athletes have heavy academic loads and adjust training. "Don't schedule a hard erg test the day before midterms."

---

### 6. TrainingPeaks

**What it gives you:** Structured training plans, completed workouts with power/HR/pace, Training Stress Score (TSS), fitness/fatigue/form metrics (CTL/ATL/TSB).

**How it works:**

- Coach or athlete clicks "Connect TrainingPeaks"
- OAuth flow via TrainingPeaks developer API
- synth. pulls completed workouts and planned workouts
- TSB (Training Stress Balance) is essentially the fatigue metric coaches want

**Why this matters:** Programs that use TrainingPeaks for periodization get their planned vs actual training load surfaced in synth. — coach sees if athletes are following the program.

---

### 7. Whoop

**What it gives you:** Recovery score (0-100), strain score, HRV, sleep performance, journal entries.

**How it works:**

- Athlete clicks "Connect Whoop"
- OAuth flow via Whoop API
- synth. pulls daily recovery and strain data
- Surfaces on athlete profile and coach dashboard

**Why this matters:** Whoop's recovery score is the single number coaches most want to see before practice. "Should I push this athlete today?" If recovery is red, ease off.

---

### 8. Garmin Connect

**What it gives you:** GPS tracks, heart rate, sleep, Body Battery, training load, VO2 max estimates, stress level.

**How it works:**

- Athlete connects via Garmin Health API
- Requires Garmin developer partnership approval (apply now, takes 1-2 weeks)
- Push notifications for new data (webhook-based)

---

### 9. Oura Ring

**What it gives you:** Sleep stages, readiness score, HRV, temperature trends, activity.

**How it works:**

- OAuth via Oura API v2
- Daily pull of readiness and sleep data

---

### 10. Slack

**What it gives you:** Messages and files shared in team channels. Coaches often share results, schedule changes, and notes in Slack.

**How it works:**

- Coach installs synth. Slack bot in their workspace
- Bot monitors designated channels
- When coach posts splits or results, Claude parses the message into structured data
- "V8 splits: 1:42, 1:40, 1:39" → parsed into session data automatically

---

## THE AI IMPORT PIPELINE

This is the universal fallback. Works with ANY tool, ANY data source, zero integration needed.

### Photo / Screenshot Pipeline

**Coach flow:**

1. Coach taps "AI Import" in synth. Agent
2. Takes a photo or uploads a screenshot
3. synth. sends the image to Claude Vision API
4. Claude extracts structured data: athlete names, exercises, sets, reps, weights, dates, splits, whatever is in the image
5. synth. shows a preview: "I found 12 erg scores from this screenshot. Here's what I extracted:"
6. Coach reviews — can edit any field before confirming
7. Coach sees options: "Add to athlete profiles" / "Write to Google Sheet" / "Save as session data"
8. On confirm, data is saved and optionally written back to Google Sheets

**Athlete flow:**

Same but from the athlete's app. Athlete screenshots their Bridge Athletics workout, uploads to synth., confirms the extraction, data appears on their profile.

**What it handles:**

- Screenshots of Bridge Athletics (gym workouts)
- Screenshots of TeamWorks (schedule, messages)
- Photos of whiteboards with splits
- Photos of Concept2 erg screens
- Photos of printed workout sheets
- Photos of handwritten coaching notes
- Literally anything visual

### Voice Note Pipeline

**Coach flow:**

1. Coach taps the microphone icon in synth. (available everywhere — dashboard, athlete profile, session timer)
2. Speaks naturally: "Varsity 8 did three pieces today. Splits were 1:42, 1:40, and 1:39. Phelps looked strong at stroke. Gold's catch was late on the third piece. Water was choppy, headwind from the west."
3. Audio goes to Whisper API → transcription
4. Transcription goes to Claude → structured extraction
5. synth. shows parsed result:

   ```
   Session: Varsity 8, 3 pieces
   Splits: 1:42.0, 1:40.0, 1:39.0
   Notes:
     - Phelps: "looked strong at stroke"
     - Gold: "catch was late on third piece"
   Conditions: choppy water, headwind west
   ```

6. Coach sees action options:
   - "Add splits to Session Timer history" ✓
   - "Add notes to Phelps profile" ✓
   - "Add notes to Gold profile" ✓
   - "Write splits to Google Sheet" ✓
   - "Save conditions as session note" ✓
7. Coach confirms — all data flows to the right places

**Athlete flow:**

Athlete records a voice note: "Did front squats today, 4 sets of 6 at 225. Then Romanian deadlifts 3 sets of 8 at 185. Felt good, back was fine."
→ Parsed into gym session data → added to their profile → coach sees it on the dashboard.

### Paste Text Pipeline

1. Coach or athlete copies text from any source (email, web page, chat message)
2. Pastes into synth.'s text input
3. Claude parses it
4. Preview + confirm + route to the right destination

---

## TWO-WAY FLOW: COACH AND ATHLETE BOTH INPUT

### Coach Inputs

| Input Method | What They Add | Where It Goes |
| --- | --- | --- |
| Session Timer | Piece splits, video + markers | Athlete profiles, Google Sheet, Dashboard |
| Lineup Builder | Boat assignments | Athletes (notification), Google Sheet, Dashboard |
| Voice note | Splits, observations, conditions | Session data, athlete notes, Google Sheet |
| Photo | Whiteboard splits, erg screen photos | Session data, athlete profiles |
| Manual entry | Any data via forms | Wherever coach specifies |
| synth. AI chat | "Add a note on Phelps: catch timing improved" | Athlete profile notes |

### Athlete Inputs

| Input Method | What They Add | Where It Goes |
| --- | --- | --- |
| Screenshot upload | Bridge Athletics workout, any app screenshot | Their gym data, profile |
| Voice note | "Did squats 4x6 at 225 today" | Their gym session, profile |
| Wellness check-in | Sleep, soreness, energy, mood | Coach dashboard, wellness tool |
| CSV upload | Bridge Athletics export | Their gym history |
| Connected apps | Concept2, Strava, Apple Health, Whoop | Automatic — flows to profile |
| Photo | Erg screen, workout sheet | Parsed → profile |

### The Agentic Part

When coach or athlete inputs data via voice/photo/text, synth. doesn't just save it blindly. It asks:

```
Coach says: "Phelps pulled a 1:38.2 on his 2k test today"

synth. responds:
  ✓ Add to Phelps' erg history (1:38.2, 2k test, today's date)
  ✓ Write to Google Sheet row in "2k Tests" tab
  ✓ Update athlete profile card
  ? Flag: This is a 2.4 second PR — highlight on dashboard?

  [Confirm All]  [Edit]  [Cancel]
```

synth. understands context, suggests the right actions, and lets the coach confirm with one tap. That's the agentic behavior — it doesn't just record, it routes and acts.

---

## SCRAPING SURVEYS AND WELLNESS DATA FROM EXISTING TOOLS

This is the scenario where coaches already collect wellness/survey data through Bridge Athletics or TeamWorks, and we need to get that data into synth.

### Bridge Athletics Wellness/Surveys

Bridge doesn't have an API. But coaches already use it for surveys. Options:

**Option A — Screenshot pipeline (immediate)**

- Coach opens Bridge, screenshots the survey results page
- Uploads to synth. AI Import
- Claude Vision reads the table: athlete names, survey responses, dates
- Preview → confirm → data added to wellness tool and athlete profiles
- Takes 30 seconds per screenshot, handles any format Bridge uses

**Option B — CSV export (immediate)**

- Bridge allows CSV export of survey data
- Coach exports → uploads to synth.
- Parser detects wellness-related columns (sleep rating, soreness, energy, mood)
- Maps to synth. wellness check-ins per athlete
- Deduplication prevents double-counting if they export the same date range twice

**Option C — Email forwarding (1 week to build)**

- Bridge sends daily survey summary emails to the coach
- Coach sets up auto-forward to `import@synth.app`
- synth. receives the email, Claude parses the body
- Extracts athlete responses automatically
- Coach never has to do anything after the initial forward rule setup

**Option D — Firecrawl (if coach gives session credentials)**

- Coach provides their Bridge login (stored encrypted)
- synth. backend uses Firecrawl to load the Bridge survey results page
- Claude reads the page content and extracts structured data
- Runs on a schedule (daily)
- This is essentially what the extension would do, but server-side
- Risk: Bridge could change their UI and break the scraper

### TeamWorks Surveys/Compliance

Same approach as Bridge — TeamWorks also has no public API. Options:

**Option A — Screenshot pipeline** (same as above)

**Option B — Email forwarding** (TeamWorks sends completion emails)

**Option C — Firecrawl** (server-side page reading)

**Option D — Copy-paste** (coach copies the compliance form results → pastes into synth.)

### What the Coach Sees

Regardless of how the data comes in, the coach's dashboard shows:

**Fatigue & Wellness Panel:**

```
┌───────────────────────────────────────────────┐
│ WELLNESS OVERVIEW          Last updated: 6:00 AM│
│                                                 │
│ 🟢 48 athletes — good                          │
│ 🟡 12 athletes — monitor                       │
│ 🔴  4 athletes — flag                          │
│                                                 │
│ FLAGS:                                          │
│ ⚠ Phelps — HRV down 15% over 2 weeks          │
│ ⚠ Gold — <5hr sleep 3 of last 5 nights         │
│ ⚠ Baroni — self-reported soreness 8/10         │
│ ⚠ Furrer — missed 2 wellness check-ins         │
│                                                 │
│ TRAINING LOAD:                                  │
│ ▓▓▓▓▓▓▓░░░ Team avg: 7.2/10                   │
│ Peak: Manton (9.1) — heavy gym + water week     │
│ Low: Holt (3.4) — returning from injury         │
└───────────────────────────────────────────────┘
```

This panel synthesizes data from:

- Wellness check-ins (from synth. wellness tool)
- Apple Health / Whoop (HRV, sleep, recovery)
- Bridge Athletics surveys (imported via screenshot/CSV/email)
- Session Timer (training volume this week)
- Google Sheets (erg test load)
- Gym data (imported via any method)

That's the synthesis. No single tool has this view. Only synth. does because only synth. sees all the data.

---

## THE EXTENSION PLACEHOLDER

In the synth. Agent modal, the Extension tab shows:

```
┌───────────────────────────────────────────────┐
│                                                 │
│  ◈  BROWSER EXTENSION                          │
│                                                 │
│  Coming soon. Connect any web app.              │
│  Set a schedule. synth. reads it automatically. │
│                                                 │
│  We're building an extension that works like    │
│  Claude's browser tool — scan Bridge Athletics, │
│  TeamWorks, or any coaching app with one click. │
│  Set it to watch, and synth. syncs on schedule. │
│                                                 │
│  In the meantime, use AI Import — take a        │
│  screenshot of any app and synth. reads it      │
│  instantly.                                     │
│                                                 │
│  [Get notified when it launches]                │
│                                                 │
│  ─────────────────────────────────────────────    │
│  147 coaches on the waitlist                    │
│                                                 │
└───────────────────────────────────────────────┘
```

This captures demand (email waitlist) while directing users to the AI Import pipeline which does 90% of what the extension would do.

---

## BUILD ORDER

### Sprint 1 — Foundation (Week 1-2)

1. synth. Agent modal with three tabs (Connectors / AI Import / Manual)
2. Extension tab with "Coming Soon" placeholder + email waitlist
3. Google Sheets OAuth (read + write) — the core two-way sync
4. Google Calendar read — practice schedule
5. Photo upload → Claude Vision → preview → confirm → save flow
6. Voice note → Whisper → Claude → preview → confirm → save flow
7. Paste text → Claude → preview → confirm → save flow

### Sprint 2 — Athlete Connectors (Week 3)

8. Concept2 Logbook API
9. Strava API with webhooks
10. Apple HealthKit / Google Health Connect
11. CSV/Excel upload with flexible parser

### Sprint 3 — Wearables & Wellness (Week 4)

12. Whoop API
13. Garmin Connect API (if approved)
14. Oura API
15. Wellness dashboard panel with fatigue flags
16. Training load calculation (cross-source: erg + gym + water + sleep)

### Sprint 4 — Survey Scraping & Write-Back (Week 5)

17. Email forwarding parser (import@synth.app)
18. Firecrawl integration for Bridge/TeamWorks page reading
19. Google Sheets write-back (sessions, lineups, wellness)
20. Slack bot for channel monitoring

### Sprint 5 — Polish & Agentic Behavior (Week 6)

21. Smart routing: voice/photo input → synth. suggests where to save + asks coach to confirm
22. "Write to Google Sheet?" option on every data input
23. Fatigue correlation engine: cross-reference wellness + training load + sleep + HRV
24. Automated alerts: "3 athletes flagged — view details"
25. Weekly digest email to coach with synthesized summary

---

## HOW THIS CHANGES THE PITCH

**Before:** "We have an extension that scrapes any web app on schedule."

**After:** "We have 10+ official connectors — Google Sheets, Concept2, Strava, Apple Health, Whoop, TrainingPeaks — plus an AI pipeline that reads any screenshot, voice note, or text. Take a photo of anything. synth. reads it. And everything writes back to your Google Sheet automatically."

The second version is more honest, more impressive, and already works.

---

## Related docs

- [`DATA_INTELLIGENCE.md`](./DATA_INTELLIGENCE.md) — normalization, scores, risk, synthesis (what the pipeline feeds)
- [`PRODUCT.md`](./PRODUCT.md) — product spec
- [`SCHEMA.md`](./SCHEMA.md) — data contract
- [`SRS-Synth-Platform.md`](./SRS-Synth-Platform.md) — functional requirements (connectors, agent)
