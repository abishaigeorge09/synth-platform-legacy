# synth. Athlete App — Complete Specification

## The Athlete Experience

The athlete opens synth. and lands on their AI. Not a dashboard, not a stats page — the AI. They type a question or tap a prompt and get an answer that references their actual training data. The app feels like talking to a smart teammate who remembers everything about their season. When they need to log something, they tap "+". When they want stats, they tap "Stats". When they want to see their boat or sessions, they tap "More".

---

## 1. Splash Screen

Same as coach: 2 seconds, "synth." on #050505, JetBrains Mono 600 48px, white text green dot, fade-in 0.4s, crossfade out.

---

## 2. Authentication

Same flow as coach — see `MOBILE_COACH_SPEC.md §2`.

The difference: athletes always arrive via an invite link (`synth.app/invite/ATH-[code]`). The auth screen shows "You've been invited to [Team Name]" when an invite code is present.

If an athlete tries to open the app without an invite link: "Access is by invite only. Ask your coach for an invite link."

---

## 3. Athlete Onboarding (First Time Only)

4 screens, swipeable, progress dots, Skip + Next → on each.

### Screen 1: Welcome
```
You're in.

Welcome to Pacific Women's Rowing on synth.
Your coach has set up your team.

[IMAGE NEEDED: The same "tools converging" illustration as onboarding screen 1 for coaches, but with an athlete twist — instead of coaching tools, the icons represent athlete data sources: Apple Health (pink heart), Strava (orange), Whoop (green), Concept2 (blue), etc. All converging into the synth. node.]

[Next →]
```

### Screen 2: Your Profile
```
Set up your profile

YOUR NAME
[Star Miller                 ]

GRADUATION YEAR
[2026 ▾]

POSITION
[Port ▾]   (Port / Starboard / Cox / Flex)

WEIGHT CLASS
[Lightweight ▾]   (Lightweight / Open)

[Next →]
```

This auto-fills from what the coach has in their roster. Athlete can edit.

### Screen 3: Connect Your Sources

```
Connect your data

The more you connect, the smarter synth. gets.

┌──────────────────────────────────────┐
│ ♥ Apple Health          [Connect →] │
│   Sleep, HRV, resting HR, steps      │
├──────────────────────────────────────┤
│ ⚡ Strava               [Connect →] │
│   Rowing + cross-training            │
├──────────────────────────────────────┤
│ ○ Whoop                [Connect →] │
│   Recovery, strain, sleep stages     │
├──────────────────────────────────────┤
│ ≡ Concept2 Logbook     [Connect →] │
│   All erg records                    │
└──────────────────────────────────────┘

Your data is private to you and your coach.
You control what synth. can see.

[Skip for now]                [Next →]
```

Each "Connect →" opens the respective OAuth flow or native permissions dialog (Apple Health uses HealthKit permissions). Connected sources show a green checkmark and last sync time.

### Screen 4: You're Ready

```
You're set.

Ask synth. anything about your training —
or just see what your coach has planned.

[IMAGE NEEDED: Simple illustration of a phone showing the AI chat interface with a question "How am I trending this week?" and a response that shows recovery score, erg comparison, and a brief text answer. Green accents, dark background. Shows the core value prop: ask → get real answer.]

[Start →]
```

Tapping "Start →" lands them on the AI home screen.

---

## 4. Athlete Home Screen: The AI

**The athlete's default screen is the AI.**

This is not a standard chat interface — it feels more like a personal performance assistant. The athlete sees their current context at the top, then an AI that knows all of it.

### Top Context Strip

A minimal strip at the very top showing today's key numbers:

```
● 82 recovery   6:38.2 last erg   Seat 3, 1V   next: Pacific Invite Sat
```

Tapping any element opens the relevant detail (recovery → wellness detail, last erg → erg history, lineup → current boat, session → session details).

This strip is always visible on the AI screen. It's the ambient awareness layer — the athlete doesn't need to go look for their status, it's always up top.

### AI Welcome State

Below the strip, centered:

```
[◈ synth. avatar — gradient green-purple, 56px]

Good morning, Star.

Your recovery is 82 — solid.
Wheeler is at 78. You're ahead of her today.

────────────────────────────────

Suggested questions:

┌──────────────────────────────────┐
│ How am I trending this month?   │
└──────────────────────────────────┘
┌──────────────────────────────────┐
│ What's my erg PR this season?   │
└──────────────────────────────────┘
┌──────────────────────────────────┐
│ Am I in the 1V lineup?          │
└──────────────────────────────────┘
┌──────────────────────────────────┐
│ What did the coach note about   │
│ my technique last session?      │
└──────────────────────────────────┘
```

The suggested questions update based on context:
- If there's a race this week: "What's the lineup for Pacific Invite?"
- If their recovery just dropped: "My recovery dropped 15 points — why?"
- If they PR'd recently: "Break down my new 2K"
- After a session: "How did today's session compare to last week?"

The opening message from the AI is personalized and references real data. It's not "Hello! How can I help you today?" — it's "Your recovery is 82. Wheeler is at 78. You're ahead of her today."

### AI Chat State

Once the athlete sends a message:

```
┌────────────────────────────────────────────┐
│ [◈]  Star, your 2K trend this month       │
│      shows improvement in the second       │
│      500m split (+1.2s/500m avg). Your     │
│      best piece was Nov 12: 6:34.8.        │
│                                            │
│      Your technique flags from last        │
│      practice: Coach noted "blade depth    │
│      at the catch, 3 seat."               │
│                                            │
│      ─────────────────────────────────    │
│      Want me to pull your last 10 ergs?   │
└────────────────────────────────────────────┘

                    How am I trending? ┐
                                       │
```

- Athlete messages: right-aligned, green background
- AI messages: left-aligned, dark surface with avatar
- AI responses reference real data with specific numbers and dates
- Responses can include inline mini-charts (a tiny sparkline for erg trend)
- At the bottom of each AI response: a follow-up suggestion chip

### Input Bar

Fixed at the bottom, always visible:

```
┌─────────────────────────────────────┐
│  [mic] Ask about your training...  [→]│
└─────────────────────────────────────┘
```

Pill shape, 52px tall. Mic icon on the left (tap for voice input), send arrow on the right.

Placeholder rotates contextually:
- "How's my recovery trend?"
- "What's the lineup this week?"
- "Compare me to last month"
- "When's the next session?"

---

## 5. Athlete Bottom Navigation

```
                      ┌───┐
                      │ + │   ← raised green circle
                      └───┘
┌────────────────────────────────────────┐
│   AI      Stats    ·    Team   More  │
└────────────────────────────────────────┘
```

Same floating pill design as the coach app.

- **AI** (◈ icon) — the AI home (default tab)
- **Stats** (BarChart2 icon) — personal stats + history
- **+** (Plus icon) — raised green circle, tap for log tray
- **Team** (Users icon) — team feed + lineups
- **More** (Menu icon) — sessions, sources, settings

### "+" Log Tray (Athlete)

**Tap:** Full-screen log tray slides up:
```
LOG

TRAINING
[Log Erg]  [Log Workout]  [Log Cross-training]

WELLNESS
[Morning Check-in]  [Sleep Note]  [Injury Flag]

MEDIA
[Photo]  [Video clip]  [Voice note]

────────────────────────
Suggest a feature →
```

**Long press:** Semi-circle fans out:
```
    [Erg] [Wellness] [Note] [Photo] [Flag]
                    ┌───┐
                    │ + │
                    └───┘
```

---

## 6. Athlete Stats Page

Personal performance stats, organized as a vertical scroll with sections.

### Header

```
Star Miller · Port · 1V
Season: Fall 2025 · Spring 2026

  [All Time ▾]   [Port ▾]   [2K ▾]
```

Three filter pills: time range, position filter, test type.

### Personal Bests

```
PERSONAL BESTS

2000m           6:34.8    Nov 12, 2025  ↑ PR
6000m          22:14.2    Oct 3, 2025
30' (meters)   8,642      Sep 28, 2025
500m            1:36.1    Dec 2, 2025
```

Each row: test name, time/score, date, PR badge if applicable.

### Season Trend Chart

A line chart showing their 2K equivalent scores over the season. Simple, clean — one line, no noise. Below it:

```
+4.2s improvement vs. season start
Trend: improving (last 6 pieces)
```

### Recovery

```
RECOVERY (WHOOP / APPLE HEALTH)

Today          82   ●────────────────
7-day avg      79
30-day avg     76

[7-day recovery chart — green when above 70, amber 50-70, red below 50]
```

### Erg History

A paginated table:

```
DATE        TEST    TIME      SPLIT    WATTS   RATE
Dec 2       500m    1:36.1    1:36.1   312     28
Nov 28      2K      6:35.2    1:38.8   290     26
Nov 21      6K      22:15.1   1:51.3   243     24
...
```

Scroll down for more. Filter by test type. Tap a row → full piece detail.

### Comparisons

```
TEAM COMPARISON

Your 2K vs. team average:
You: 6:35.2    Team avg: 6:42.1    +6.9s ahead

vs. Wheeler (same position):
You: 6:35.2    Wheeler: 6:35.6    +0.4s ahead

vs. your rank: 3rd of 12 port seats
```

This section is controlled by the coach's visibility settings. If the coach has hidden peer comparisons, this section doesn't appear (or shows "Comparisons hidden by coach").

---

## 7. Athlete Team Page

The team from the athlete's perspective.

### Lineup View (Default)

```
CURRENT LINEUP · 1V 8+

Published Nov 28 · Pacific Invite Sat

    ┌─────────────────┐
    │ COX  Charly J. │
    └─────────────────┘
    ...
    ┌──────────┐  ┌──────────┐
    │ ● YOU    │  │ Bauman   │
    │ SEAT 3   │  │ SEAT 4   │
    └──────────┘  └──────────┘
    ...
```

The athlete's seat is highlighted ("YOU" badge, slightly brighter). If they're not in the lineup, their card is shown separately: "You're not in the 1V lineup. Tap → to see where you are."

Swipe left → 2V lineup → etc.

### Team Feed

Pull down from the top → Team Feed view:

```
TEAM

Nov 28  Coach published 1V lineup →
Nov 27  Session recap: "Solid day. Focus on..."
Nov 25  New PR: Wheeler 6:34.2 🎉
Nov 24  Upcoming: Pacific Invite this Saturday
Nov 22  Session recap: "We need more...
```

A simple reverse-chronological feed of coach posts, published lineups, session recaps, and team-wide milestones. No likes, no comments — informational only.

### Team Roster (Secondary View)

A pill tab at the top: [Lineups] [Feed] [Roster]

Roster view shows all athletes with their public stats (controlled by coach visibility settings):

```
ROSTER — 26 athletes

[AJ] Amelia Jensen    Port    ● 88    6:32.1
[EW] Ella Wheeler     Port    ● 78    6:35.6
[SM] Star Miller ← You Port  ● 82    6:35.2
...
```

The athlete's own row is always visible regardless of visibility settings.

---

## 8. Athlete "More" Page

```
MORE

MY DATA
→ My Sessions
→ My Lineups History
→ My Wellness Log
→ My Connected Sources

TEAM
→ Team Dashboard (read-only)
→ Season Calendar
→ Announcements

ACCOUNT
→ Profile & Photo
→ Privacy Settings
→ Notification Preferences

SUPPORT
→ Help Center
→ Contact synth. team
→ Report a bug

────────────────
Sign out
```

---

## 9. Athlete Profile Drawer

Tap avatar (top-right, or via More → Profile):

```
Star Miller
Pacific Women's Rowing · Port
#3 · 1V 8+

────────────────
Performance
  Season bests →
  Year-over-year →
  Team rank →

My Sources
  ♥ Apple Health     ● synced 2h ago
  ⚡ Strava          ● synced 1h ago
  ○ Whoop            ● synced 3h ago
  ≡ Concept2         ○ not connected  [Connect]
  + Add source

Privacy
  What my coach can see →
  What teammates can see →

Settings
  Notifications
  Theme: Light / Dark / System
  Units: Imperial / Metric

────────────────
Sign out
```

**Privacy settings detail (tapping "What my coach can see →"):**

```
COACH VISIBILITY

Your coach can always see:
✓ Erg scores and test results
✓ Session attendance
✓ Lineup history

You control:
● Sleep data          [ON / OFF]
● HRV / recovery      [ON / OFF]
● Body metrics        [ON / OFF]
● Cross-training      [ON / OFF]
● Non-team Strava     [ON / OFF]
```

Default: sleep, HRV, recovery are ON; body metrics and non-team Strava are OFF (opt-in).

---

## 10. Athlete Notifications

Push notifications the athlete receives:

| Event | Notification |
|-------|-------------|
| Lineup published | "Your 1V lineup is up. Seat 3, Port. →" |
| New session scheduled | "Practice Friday 6am. 12 boats." |
| Coach message | "Coach: See you on the water tomorrow." |
| Session recap available | "Recap: Today's practice — 3 pieces, 6K." |
| Team announcement | "Pacific Invite confirmed — depart 5:30am Sat" |
| Weekly summary (optional) | "Your week: 3 sessions, 18K, recovery avg 79" |
| Streak milestone (optional) | "7-day check-in streak 🔥" |

Notification preferences are controlled from the profile drawer.

---

## 11. Athlete Log Flows

### Morning Check-in

Tapping "Morning Check-in" from the log tray:

```
Morning check-in

SLEEP
How'd you sleep?  [1] [2] [3] [4] [5]
                  ↑ bad         great ↑

SORENESS
Any soreness?    [None] [Mild] [Moderate] [High]

WHERE? (if soreness)
[  Legs  ] [  Back  ] [  Arms  ] [ + Add  ]

ENERGY
Energy level?    [1] [2] [3] [4] [5]

NOTES (optional)
[Feeling a bit tired, shoulder tight    ]

[Submit check-in →]
```

Takes ~10 seconds to complete. After submitting: "Checked in ✓" with a brief green pulse animation.

### Log Erg

```
Log erg piece

TEST TYPE
[2000m ▾]   (500m / 1000m / 2000m / 4000m / 6000m / 30' / 60')

TIME  (for fixed-distance)
[ 6 ] : [ 35 ] . [ 2 ]
  min    sec     tenth

RATE
[ 26 ] spm

DATE
[ Today ▾]

MACHINE
[ Concept2 Model D ▾]

NOTES (optional)
[                               ]

[Save erg →]
```

After saving: "Saved ✓" and the new result appears at the top of their erg history.

### Injury Flag

```
Flag something

TYPE
● Minor soreness  ○ Pain  ○ Injury

LOCATION
[  Shoulder  ] [  Back  ] [  Knee  ] [ + ]

DESCRIPTION
[                               ]

NOTIFY COACH
[ ] Send this flag to my coach

[Submit →]
```

If "Notify coach" is checked, the coach sees it in their alerts panel.

---

## 12. Athlete Sharing

Athletes can share their personal stats externally:

On the Stats page, top-right: [Share ↑] button.

Tap → a share card is generated:

```
┌─────────────────────────────────────────┐
│          synth.                         │
│                                         │
│  Star Miller · Pacific Women's Rowing       │
│                                         │
│  2K     6:34.8    ↑ Season PR          │
│  Recovery   82                          │
│  Streak   7 days                        │
│                                         │
│  Fall 2025 Season                       │
└─────────────────────────────────────────┘
```

Dark background, green accents. Uses the iOS share sheet / Android share intent. The athlete can share to Instagram, text, etc.

Only their own data appears on the share card — no team comparisons, no coach notes.

---

## 13. Production Mode

Same philosophy as coach app — no demo flags, no mock defaults.

**Empty states for athletes:**

- No erg data connected: "Connect Concept2 Logbook to see your erg history. Or log manually with +."
- No recovery data: "Connect Apple Health or Whoop to see your recovery scores."
- No lineup yet: "Your coach hasn't published a lineup yet. Check back soon."
- No sessions: "No sessions recorded yet. Your first session will appear here."

**The AI works even with no data:**
- If the athlete has no connected sources: "I don't have your data yet — connect a source to get personalized insights. For now, ask me anything about rowing generally."
- As data flows in, the AI gets more specific.

---

## 14. Images & Illustrations Needed

| Where | What | Description |
|-------|------|-------------|
| Onboarding Screen 1 | Athlete data sources converging | Apple Health, Strava, Whoop, Concept2 icons converging into synth. node. |
| Onboarding Screen 4 | AI chat preview | Phone showing AI screen with real question/answer. Green accents, dark bg. |
| AI empty state | AI avatar + context | The ◈ avatar with "Ask about your training" — clean, minimal. |
| Empty lineup | Empty boat | Minimal line illustration of a rowing shell with empty seats (dashed outlines). |
| Empty stats | No data yet | Simple illustration of an empty chart with a "+" — inviting the athlete to connect. |
| Share card | Personal stats card | Auto-generated dark card with athlete name, key stats, synth. branding. |

---

## 15. Animations Summary

| Element | Animation | Type |
|---------|-----------|------|
| Splash logo | Fade in 0→1 over 0.4s | CSS opacity |
| Splash exit | Crossfade over 0.3s | CSS opacity |
| AI welcome | Staggered fade-in for prompt cards (50ms each) | Framer Motion |
| Message send | Slide up from input, settle into chat | Framer Motion spring |
| AI typing indicator | Bouncing dots (scale 0→1→0, staggered 100ms) | Framer Motion |
| Check-in submit | Brief green pulse + scale (1→1.05→1) | Framer Motion |
| Lineup seat (you) | Soft pulse glow on load | CSS animation |
| Boat swipe | Horizontal scroll snap with momentum | CSS scroll-snap |
| Stats sections | Fade in on scroll (IntersectionObserver) | Framer Motion |
| Log tray | Slide up from bottom with spring | Framer Motion |
| Profile drawer | Slide from right with spring | Framer Motion |
| Streak milestone | Brief shake + pulse on the number | CSS animation |
| Page transitions | Fade + slide (20px) | Framer Motion AnimatePresence |
| Share button | Scale pulse (1→1.1→1) on generate | CSS transform |
| Recovery ring | Draw animation (stroke-dashoffset) | SVG + CSS |
| Bottom nav tap | Scale 1→0.93→1, 100ms | CSS transform |
