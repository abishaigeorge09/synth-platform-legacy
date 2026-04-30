# synth. Coach App — Complete Specification

## The Coach Experience

The coach opens synth. and sees their boat. Not a dashboard, not a list of stats — the boat. They tap seats, fill the lineup, publish, grab the timer, time pieces, and walk away. synth. is the tool they hold in one hand on the dock while holding a megaphone in the other.

---

## 1. Splash Screen

**Duration:** 2 seconds on every app open.

**Design:**
- Background: #050505 (pure dark)
- Center: "synth." in JetBrains Mono 600, 48px. White text, green dot.
- Nothing else. No loading spinner, no tagline, no animation beyond a soft fade-in (opacity 0→1 over 0.4s).
- After 2 seconds: crossfade to the next screen.

**Image needed:** None. Pure text on black.

---

## 2. Authentication

### First Launch (No Account)

After splash, the coach sees the login screen.

**Layout:**
- Top 45%: illustration area
- Center: synth. logo (32px)
- Bottom 45%: auth options

**Top illustration:**
IMAGE NEEDED: An aerial view of a rowing shell cutting through still water at dawn. The water has a slight green tint (synth. green reflected). The boat is sleek, minimal — you can see the oar positions but not individual rowers. It's aspirational and calm. Illustrated style (not a photo), slightly abstract with clean lines. Dark background fading into the water. This sets the tone: synth. is about rowing, precision, and clarity.

Alternative if illustration isn't ready: a dark gradient background (#050505 to #0a1a10) with subtle animated green particle lines that flow diagonally like data streams, converging toward the center. CSS/SVG animation, no image needed.

**Auth options:**
```
Continue with Google          [Google icon]
Continue with email           [Mail icon]
```

Two buttons, white background, rounded (12px radius), full width with 16px horizontal padding. Stacked vertically with 12px gap.

Below the buttons:
```
Want access? Contact us →
```

Tapping "Contact us →" opens a mailto link to abishaigosula@berkeley.edu or a simple form.

**There is NO "Create account" button.** Access is invite-only:
- If someone has an invite link, they tap it → it opens the app → they authenticate with Google or email → account is created automatically with the role pre-assigned from the invite.
- If someone opens the app directly without an invite, they can only log in (if they already have an account) or contact the team for access.

### Invite Link Flow

When the coach receives an invite link (e.g., `synth.app/invite/COACH-abc123`):

1. Link opens the app (or web if app isn't installed)
2. Splash screen
3. Auth screen shows: "You've been invited to synth." above the auth buttons
4. Coach authenticates with Google or email
5. Account is created with role=coach, linked to the team from the invite
6. Goes to onboarding

### Returning Coach

Splash → auto-login from stored session → main app (boat home screen). No login screen.

### Email Auth Flow

"Continue with email" expands inline (no page change):
- Email input field appears
- Coach enters email → "Send code" button
- 6-digit code sent to email
- Code input field appears → coach enters code → authenticated
- If the email exists in the database → logged in
- If the email doesn't exist AND they came from an invite link → account created
- If the email doesn't exist AND no invite → "No account found. Contact us for access."

---

## 3. Coach Onboarding (First Time Only)

5 screens, swipeable with progress dots at the bottom. Each screen has a "Skip" option and a "Next →" button.

### Screen 1: Welcome
```
Welcome to synth.

The platform that connects every coaching tool
and lets you make decisions from one place.

[IMAGE NEEDED: A minimal illustration showing 6-8 app icons (representing coaching tools) with dotted lines converging into a single synth. node. Think: scattered → unified. Dark background, icons use their real brand colors (Google green, Strava orange, Apple pink, Whoop green, etc.), the synth. node glows green. Illustrated flat style.]

[Next →]
```

### Screen 2: Your Team
```
Set up your team

TEAM NAME
[Pacific Women's Rowing          ]

SCHOOL
[UC Berkeley                 ]

SPORT
[Rowing ▾]

YOUR ROLE
[Head Coach ▾]   (Head Coach / Assistant Coach / Volunteer)

[Next →]
```

Creates the organization + team records. Generates an invite code.

### Screen 3: Connect Your Workbook

```
Connect your erg workbook

Paste your Google Sheets URL and we'll pull your
team's erg data automatically.

[https://docs.google.com/spreadsheets/d/...    ]

[Connect Google Sheets →]

[IMAGE NEEDED: A small illustration of a Google Sheets icon transforming into synth. data cards — showing the sheet on the left with an arrow flowing to athlete profile cards on the right. Shows the transformation from spreadsheet to synthesized view.]

We'll sync your sheet every 6 hours.
Your data stays in your sheet — synth. reads it.

[Skip for now]                          [Next →]
```

When "Connect Google Sheets →" is tapped:
- Opens Google OAuth popup
- Coach signs into Google, grants Sheets read/write access
- Popup closes
- The pasted URL is validated (is it a real Google Sheets URL?)
- If valid: "Connected ✓ · Reading your data..." message
- Immediately start pulling data from the sheet in the background
- The loading happens async — don't block the onboarding flow
- If the sheet has recognizable columns (Athlete, 2K, Split, etc.), auto-map them. If not, ask the coach to identify which columns are what (on a later screen or in settings).

For demo/pilot: if no Google credentials are configured in .env, show "Connected ✓ (demo data loaded)" and use the TypeScript demo data.

### Screen 4: Invite Your Team

```
Invite your athletes

Share this link with your team. Athletes sign up
and join automatically.

┌─────────────────────────────────────────┐
│  synth.app/invite/PAC-WR-2026    [Copy] │
└─────────────────────────────────────────┘

Or send invites by email:

[athlete1@berkeley.edu, athlete2@berkeley... ]

[Send invites →]

[IMAGE NEEDED: Simple illustration of a phone with a notification "You've been invited to Pacific Women's Rowing" — showing what the athlete sees when they receive the invite. Dark background, the notification card glows slightly green.]

You can also invite assistant coaches:

[Send coach invite →]

This generates a separate invite link with role=coach pre-assigned.

[Next →]
```

"Send invites →" sends an email to each address with the invite link. Uses SendGrid (or mock in demo). The email contains: "Coach Demo invited you to Pacific Women's Rowing on synth. Tap to join: [link]"

"Send coach invite →" generates an invite link with role=coach. The coach can share this with assistant coaches.

### Screen 5: Quick Tour (Interactive Demo)

```
Let's take a quick look

[Interactive demo of the app with highlighted areas]
```

This is a 4-step tooltip tour overlaid on the actual app:

Step 1: "This is your boat" — highlights the lineup/boat area. "Tap a seat to add an athlete. Swipe for more boats."
Step 2: "Tap + for your tools" — highlights the "+" button. "Timer, voice notes, and more."
Step 3: "Ask synth. anything" — highlights the AI tab. "Questions about your team, powered by all your data."
Step 4: "Your profile" — highlights the avatar. "Settings, sources, and support."

Each step: a translucent dark overlay with a spotlight cutout on the highlighted area. Tooltip bubble pointing to the area. "Next" button and step counter (1/4, 2/4, etc.).

After step 4: "You're ready. Let's build a lineup." → dismisses the tour, lands on the boat home screen.

---

## 4. Coach Home Screen: The Boat

**This is the heart of the coach app.**

The coach opens synth. and sees their boat on water.

### Background

IMAGE NEEDED: An animated water surface. Options (in order of preference):
1. CSS animation: subtle horizontal wave pattern using gradients. Dark blue-green (#0a1a1a) with lighter ripple lines (#1a3a3a) that slowly move left-to-right. Very subtle — the boat and seats are the focus, the water is ambient.
2. SVG animated waves: two or three sine-wave paths with slow oscillation, opacity 0.1-0.2
3. If neither works visually: a static dark gradient (#050505 to #0a1a10) with a very faint grid pattern that suggests water without animating.

The water covers the background of the entire home screen. The boat sits on top.

### Boat Visualization

The current lineup's first boat is rendered as the main element:

```
┌─────────────────────────────────────────────┐
│                                             │
│          1V 8+  ✏ (editable)               │
│          8/9 seats filled                   │
│                                             │
│    ┌─────────────────────────────────┐      │
│    │ COX    Charly Johnson          │      │
│    └─────────────────────────────────┘      │
│                                             │
│    ● STBD                   PORT ●          │
│                                             │
│    ┌────────┐  STR  ┌────────┐             │
│    │ Crampin│       │Bauman  │             │
│    │ ● 84   │       │ ● 91   │             │
│    └────────┘       └────────┘             │
│                                             │
│    ┌────────┐       ┌────────┐             │
│    │Wheeler │       │Irmler  │             │
│    │ ● 78   │       │ ● 85   │             │
│    └────────┘       └────────┘             │
│    ...                                      │
│                                             │
│    ┌────────┐  BOW  ┌────────┐             │
│    │Van W.  │       │ Roth   │             │
│    │ ● 88   │       │ ● 88   │             │
│    └────────┘       └────────┘             │
│                                             │
└─────────────────────────────────────────────┘
```

Each seat shows: athlete last name + recovery dot with score. Empty seats show "tap to add" with a dashed border.

### Swipe Between Boats

Swipe left → 2V 8+ appears
Swipe left again → V4+ (or "+ Add Boat" card)
Swipe right from 1V → nothing (or a summary card showing "3 boats · 27 athletes · Ready to publish")

Use horizontal scroll snap:
```css
scroll-snap-type: x mandatory;
scroll-snap-align: center;
```

Each boat is a full-width card. Dots at the bottom indicate which boat is active (like iOS page dots).

### Boat Interaction

**Tap an empty seat:** Opens the Add Athlete modal (bottom sheet). Shows athletes filtered by that seat's side. Search, recovery dots, erg times. Tap to assign.

**Tap a filled seat:** Opens a popover: "Swap" (opens athlete picker to replace), "Remove" (sends back to roster), "View Profile →" (navigates to athlete profile).

**Tap the boat name:** Inline edit. Keyboard opens, coach types new name, tap elsewhere to save.

### Publish Button

Floating above the boat, top-right:
```
[PUBLISH →]  (green pill button)
```

When tapped:
1. Validates all boats
2. Shows confirmation: "Publish 2 boats? Athletes will be notified."
3. On confirm: success animation (the boat briefly glows green, a checkmark appears), then a banner: "Published ✓ · 18 athletes notified via email"
4. The published lineup saves to history

### Info Strip Below the Boat

A minimal horizontal strip below the boat showing today's key info:

```
3 flagged · Pacific Invite Sat · 47/52 checked in · ● synth. agent active
```

Tapping any item navigates: "3 flagged" → athletes list filtered to flagged, "Pacific Invite Sat" → session details, "47/52 checked in" → wellness compliance view.

---

## 5. Coach Bottom Navigation

```
                      ┌───┐
                      │ + │   ← raised green circle
                      └───┘
┌────────────────────────────────────────┐
│   Boats    Team    ·    AI    More    │
└────────────────────────────────────────┘
```

Floating, rounded corners (28px radius), backdrop blur, dark semi-transparent background.

- **Boats** (Anchor icon) — the boat home screen
- **Team** (Users icon) — athletes list → tap into profiles
- **+** (Plus icon) — raised green circle, tap for tool tray, long-press for semi-circle
- **AI** (MessageCircle icon) — synth. AI coach chat
- **More** (Menu icon) — full dashboard, data view, connectors, history

### "+" Tool Tray (Coach)

**Tap:** Full-screen tool tray slides up:
```
TOOLS

LINEUP & TIMING
[Lineup Builder]  [Session Timer]  [Race Timer]

DATA INPUT
[Record Note]  [Photo Import]  [Screenshot Import]

SESSION MANAGEMENT
[Create Session]  [Publish Lineup]  [Session History]

────────────────────────
Request a tool →
```

**Long press:** Semi-circle fans out:
```
    [Lineups] [Timer] [Note] [Session] [Publish]
                    ┌───┐
                    │ + │
                    └───┘
```

---

## 6. Coach Team Page

The athletes list from the current app, optimized for phone:

- Search bar at top (sticky)
- Filter: Port | Stbd | Cox | Flagged (horizontal scroll pills)
- Sort: Recovery (default) | 2K | Name
- Full-width athlete cards:

```
┌─────────────────────────────────────────────┐
│ [EW] Ella Wheeler              6:35.6      │
│      Port · Active              ● 78       │
│                                    ✦ Ask   │
└─────────────────────────────────────────────┘
```

- Tap card → athlete profile (full 7-tab profile from the web app, adapted for phone)
- Flagged athletes have amber/red left border
- Recovery dot is the most prominent color element on each card
- ✦ Ask (small, top-right) opens AI scoped to that athlete

---

## 7. Coach AI Page

Full-screen synth. AI chat.

**Welcome state:**
- synth. AI avatar (gradient green-purple circle, ◈, 48px) centered
- "Ask about your team" subtitle
- 4 prompt cards:
  - "Who should I watch today?"
  - "Compare the 1V from last week"
  - "Is anyone overtraining?"
  - "Wheeler's trend this month"
- Input bar at bottom: pill shape, placeholder "Ask about your team...", mic icon + send icon

**Chat state:**
- Coach messages right (green bg), AI messages left (surface bg with avatar)
- Typing indicator (bouncing dots)
- Rich responses with bold athlete names, inline numbers, suggestions

---

## 8. Coach "More" Page

A simple list page for everything that doesn't need its own tab:

```
MORE

OVERVIEW
→ Full Dashboard (stats, trends, charts)
→ Team Trends
→ Alerts & Flags

DATA
→ Connectors (source management)
→ Data View (workflow, source tabs)
→ Sync Status

HISTORY
→ Published Lineups
→ Session History
→ Voice Notes

SETTINGS
→ (same as profile drawer)
```

Each item navigates to the full page from the web app, adapted for mobile viewport.

---

## 9. Coach Profile Drawer

Tap avatar (top-right) → drawer slides from right:

```
Coach Demo
Pacific Women's Rowing
Head Coach

────────────────
Team Management
  Switch team (Women's/Men's)
  Invite athletes [→ sends email with invite link]
  Invite a coach [→ generates coach invite link]
  Team code: PAC-WR-2026 [Copy]

Personal Tools
  My connected sources
  My API keys (Concept2, Strava, etc.)
  My preferences

Team-Wide Tools
  Google Sheets sync settings
  Whoop team account
  Bridge Athletics team
  (tools that apply to the whole team)

Settings
  Theme: Light / Dark / System
  Notifications
  Athlete visibility controls

Support
  Help Center
  Contact synth. team
  Report a bug
  Feature request
  What's new (changelog)

────────────────
Sign out
```

**Personal vs Team-Wide Tools distinction:**
- "Personal Tools" = sources the coach connects from their own accounts (their Concept2, their Strava)
- "Team-Wide Tools" = sources that apply to the whole team (the team Google Sheet, team Whoop account, team Bridge account). These were set up during onboarding or in settings.

---

## 10. Coach Invite System

The coach can invite people from two places:
1. Onboarding (Screen 4)
2. Profile drawer → "Invite athletes" or "Invite a coach"

### Inviting Athletes
- Coach enters email addresses (comma-separated or one at a time)
- "Send invites →" sends an email to each address via SendGrid
- The email contains: subject "Join Pacific Women's Rowing on synth." + the invite link + coach name
- The invite link: `synth.app/invite/ATH-[unique-code]` with role=athlete pre-assigned
- When the athlete taps the link → app opens → auth → account created with role=athlete → athlete onboarding

### Inviting Coaches
- "Invite a coach" generates a link: `synth.app/invite/COACH-[unique-code]` with role=coach
- Coach copies and shares this link (via text, email, whatever)
- When the assistant coach taps the link → auth → account created with role=coach for the same team

### Invite Code Sharing
The team also has a generic invite code (PAC-WR-2026) that athletes can enter manually if they don't have the link. This is shown in the profile drawer and on onboarding.

---

## 11. Production Mode (Not Demo)

Build everything with production in mind. No `isDemo` flag. No mock data as the default.

**How it works when there's no data yet:**
- Empty states on every page: "No lineups yet. Tap a seat to start building." / "No sessions recorded." / "Connect Google Sheets to see erg data."
- The app is functional even without data — the coach can still build lineups manually, run the timer, record voice notes.
- When Google Sheets is connected, data starts flowing in. When athletes join and connect Apple Health, their sleep data appears.

**For the pilot (Pacific Rowing):**
- Real Google Sheets connection pulling real erg data
- Real Concept2 Logbook connection (if API access is available)
- Real Apple Health data from athlete phones
- Real lineups published to real athletes
- Demo data is ONLY used if no real data exists AND for testing purposes (a toggle in settings: "Load demo data for testing")

---

## 12. Images & Illustrations Needed (Summary)

| Where | What | Description |
|-------|------|-------------|
| Login background | Rowing shell on water at dawn | Aerial view of a shell cutting through still water with green tint. Illustrated style, dark background. |
| Onboarding Screen 1 | Tools converging | 6-8 app icons (real brand colors) with lines converging into synth. node. Scattered → unified. |
| Onboarding Screen 3 | Sheet to cards | Google Sheets icon transforming into synth. athlete profile cards via flowing arrow. |
| Onboarding Screen 4 | Phone notification | Phone showing "You've been invited" notification card with green glow. |
| Home background | Animated water | CSS/SVG animated water ripples. Dark blue-green with subtle wave motion. |
| Empty states | Various | Minimal line illustrations for empty states: empty boat, no data, no sessions. Thin lines, green accent. |

---

## 13. Animations Summary

| Element | Animation | Type |
|---------|-----------|------|
| Splash logo | Fade in 0→1 over 0.4s | CSS opacity |
| Splash exit | Crossfade over 0.3s | CSS opacity |
| Login buttons | Slide up with stagger (50ms each) | Framer Motion |
| Onboarding screens | Swipe left/right with spring | Framer Motion |
| Boat seats fill | Scale from 0 to 1 when athlete assigned | Framer Motion spring |
| Publish success | Boat glows green briefly, checkmark appears | Framer Motion + CSS |
| Bottom nav | Subtle scale on tap (1→0.95→1) | CSS transform |
| "+" semi-circle | Icons fan out with staggered spring (40ms delay) | Framer Motion |
| Tool tray | Slide up from bottom with spring | Framer Motion |
| Profile drawer | Slide from right with spring | Framer Motion |
| Water background | Horizontal wave oscillation, continuous | CSS animation |
| Page transitions | Fade + slight slide (20px) | Framer Motion AnimatePresence |
| Tooltip tour | Spotlight cutout with pulse on highlighted area | CSS + Framer Motion |
