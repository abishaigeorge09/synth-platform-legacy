# synth. — Data Intelligence & Algorithms

## How synth. Represents, Correlates, and Thinks About Athlete Data

This document covers three things:

1. How raw data from different sources becomes a unified athlete picture
2. What algorithms and strategies detect patterns, flag risks, and surface insights
3. What the coach actually sees as a result

---

## 1. THE DATA NORMALIZATION PROBLEM

Every source sends data in a different format, at different frequencies, with different naming conventions. Before synth. can do anything intelligent, it has to normalize everything into a common language.

### The Athlete Timeline Model

Every piece of data in synth. is stored as an **event on a timeline**. Regardless of where it came from, it gets the same structure:

```json
{
  "athlete_id": "phelps_001",
  "timestamp": "2026-04-14T06:00:00Z",
  "source": "concept2_logbook",
  "category": "erg",
  "data": {
    "test_type": "2k",
    "split_500m": 92.6,
    "stroke_rate": 32,
    "distance_m": 2000,
    "heart_rate_avg": 178
  },
  "confidence": 0.99,
  "raw": {}
}
```

This means an erg score from Google Sheets, Concept2 Logbook, a voice note, and a screenshot ALL end up as the same normalized event. The coach never thinks about where data came from — they just see the timeline.

### Name Matching Across Sources

The single biggest data quality problem: "Jake Phelps" in Google Sheets is "J. Phelps" in Bridge Athletics is "Phelps, Jacob" in Concept2 is "phelps_jake" in Strava.

**Strategy: fuzzy matching + coach confirmation**

1. When new data arrives, synth. attempts automatic matching:
   - Exact match on full name
   - Last name + first initial
   - Levenshtein distance < 3 (handles typos)
   - Phonetic matching (Soundex/Metaphone for names like "Kristensen" vs "Christensen")

2. If confidence > 90%, auto-match silently
3. If confidence 60-90%, match but flag for coach review: "We matched 'J. Phelps' from Bridge to 'Jake Phelps' in your roster. Correct?"
4. If confidence < 60%, show in an unmatched queue: "We found data for 'Jacob P.' but couldn't match to anyone. Who is this?"
5. Once the coach confirms a match, synth. remembers it forever — that source's name variant is permanently linked to the athlete

### Unit Normalization

Different sources use different units. synth. normalizes everything:

| Data Type | Normalized Unit | Converts From |
|---|---|---|
| Erg splits | Seconds per 500m | "1:38.2" → 98.2s, "44.7 (20)" → 44.7s |
| Distances | Meters | km, miles, yards |
| Weights | Kilograms (stored), displayed in lbs or kg per coach preference | lbs, kg |
| Heart rate | BPM | All sources use BPM already |
| HRV | Milliseconds (rMSSD) | ms, ln(rMSSD) — convert if needed |
| Sleep | Minutes | hours:minutes, decimal hours |
| Stroke rate | Strokes per minute | SPM, s/m — all the same |
| Training load | Normalized 0-10 scale | Calculated from source-specific metrics |

### Handling Conflicting Data

What happens when two sources say different things? Coach logs a 2k split of 1:38.2 in Google Sheets, but Concept2 Logbook shows 1:38.4 for the same date.

**Strategy: source priority + transparency**

1. Assign a priority ranking to each source (coach configurable):
   - Concept2 Logbook: priority 1 (machine-recorded, most accurate)
   - synth. Session Timer: priority 2 (app-recorded)
   - Google Sheets: priority 3 (manually entered)
   - Voice note / photo import: priority 4 (AI-extracted, may have errors)

2. When conflicts exist, synth. uses the highest-priority source but shows both:
   "2k Split: 1:38.4 (from Concept2) — also recorded as 1:38.2 in your spreadsheet"

3. Coach can override: "The spreadsheet is correct, the erg logged wrong" → synth. remembers the override

---

## 2. ALGORITHMS — WHAT SYNTH. CALCULATES

### 2.1 Composite Training Load Score (0-10)

The most valuable number in synth. One score that tells the coach: how hard is this athlete training, across ALL sources?

**Inputs:**

- Water session volume: total minutes on water this week, intensity of pieces
- Erg volume: total meters, average split intensity relative to personal best
- Gym load: total sets × reps × weight, normalized by bodyweight
- Cross-training: Strava activities (running, cycling, other)
- Session frequency: how many total sessions this week

**Calculation:**

```
water_load = (water_minutes × intensity_factor) / athlete_max_water_load
erg_load = (erg_meters × (personal_best_split / actual_split)) / athlete_max_erg_load
gym_load = (total_volume_lbs / bodyweight) / athlete_max_gym_load
cross_load = cross_training_minutes / athlete_max_cross_load

raw_score = (water_load × 0.35) + (erg_load × 0.30) + (gym_load × 0.25) + (cross_load × 0.10)
training_load = normalize(raw_score, 0, 10)
```

**Weights are sport-configurable.** For rowing, water and erg dominate. For track, gym and running would be weighted differently. The coach can adjust weights in settings.

**What the coach sees:**

- Per-athlete training load on their profile card
- Team-wide training load distribution (histogram)
- Week-over-week trend: is load increasing, steady, or dropping?
- Alert: "Manton's training load jumped from 5.2 to 8.9 this week — 71% increase"

---

### 2.2 Recovery Readiness Score (0-100)

The inverse of training load. How ready is this athlete to train hard today?

**Inputs:**

- Sleep duration (from Apple Health / Whoop / self-report)
- Sleep quality / HRV (from wearables)
- Self-reported soreness and energy (from wellness check-ins)
- Training load over last 48 hours
- Days since last rest day
- Hydration and nutrition (if self-reported)

**Calculation:**

```
sleep_score = (actual_sleep_hours / target_sleep_hours) × hrv_modifier
  where hrv_modifier = current_hrv / 30_day_avg_hrv (1.0 = normal, <0.85 = flag)

wellness_score = (10 - soreness + energy + mood) / 30  // normalized from check-in ratings

fatigue_score = 1 - (training_load_48hr / max_sustainable_load)

recovery_readiness = (sleep_score × 0.35) + (wellness_score × 0.30) + (fatigue_score × 0.35) × 100
```

**What the coach sees:**

- Green (75-100): Good to go. Full training.
- Yellow (50-74): Monitor. Moderate training recommended.
- Red (0-49): Flag. Consider rest or reduced load.

- "Phelps: Recovery 42/100 — low HRV + high training load + 5hr sleep. Recommend light session."
- "Gold: Recovery 88/100 — well rested, low load this week. Ready for intensity."

---

### 2.3 Performance Trend Detection

Is this athlete getting faster, plateauing, or declining? And is the answer different for different metrics?

**Strategy: rolling averages + regression**

For each measurable metric (erg split, piece time, gym weight, stroke rate):

1. Calculate 7-day, 14-day, and 30-day rolling averages
2. Fit a linear regression over the last 30 days
3. Classify the trend:
   - **Improving:** slope is negative (splits getting faster) or positive (weights getting heavier) beyond a significance threshold
   - **Plateau:** slope is near zero (within ±1% of mean)
   - **Declining:** slope is moving the wrong direction beyond threshold
   - **Inconsistent:** high variance (R² < 0.3) — athlete's performance is erratic

**What the coach sees:**

- Arrow indicators on athlete cards: ↑ improving, → plateau, ↓ declining
- "Phelps: erg split improved 1.8s over 30 days (1:40.1 → 1:38.3)"
- "Baroni: gym volume declining 12% over 3 weeks — is this intentional?"
- "Kristensen: inconsistent — splits vary 3.2s between sessions. Check technique or conditions."

---

### 2.4 Overtraining / Injury Risk Detection

The algorithm coaches want most. Flag athletes at risk BEFORE they get injured.

**Inputs (the more sources connected, the better this gets):**

- Training load trend: sudden spikes (>30% week-over-week increase)
- Recovery readiness trend: declining over 5+ days
- HRV trend: consistently below personal baseline for 3+ days
- Sleep trend: averaging <6 hours for 3+ nights
- Self-reported soreness: consistently >7/10
- Session frequency: no rest days in 10+ days
- Performance trend: declining despite high training load (worst signal — training hard but getting slower)
- Missed check-ins: athlete stops reporting wellness (avoidance behavior)

**Risk scoring:**

Each risk factor contributes to a cumulative risk score:

```
risk_factors = {
  load_spike: training_load_change > 30% → +2
  declining_hrv: hrv_trend < -10% over 7 days → +2
  poor_sleep: avg_sleep < 6hr for 3+ nights → +1.5
  high_soreness: avg_soreness > 7/10 for 3+ days → +1.5
  no_rest_day: consecutive_training_days > 10 → +1
  declining_performance: trend = declining AND load = high → +3 (strongest signal)
  missed_checkins: missed > 2 in a week → +1
  low_recovery: recovery_readiness < 50 for 3+ days → +2
}

total_risk = sum(triggered_factors)

LOW (0-2): No action needed
MODERATE (3-5): Coach notification — "Monitor this athlete"
HIGH (6-8): Urgent flag — "Consider reducing load"
CRITICAL (9+): Red alert — "This athlete needs a conversation"
```

**What the coach sees:**

```
⚠ HIGH RISK — Manton
  Training load spiked 45% this week
  HRV down 18% from baseline
  Self-reported soreness 8/10 for 4 consecutive days
  Performance declining despite increased volume
  
  Recommendation: Reduce to light erg only for 2-3 days.
  Monitor HRV for recovery signal before resuming full training.
```

**The key insight:** No single data point triggers this alert. It's the COMBINATION of high load + declining HRV + high soreness + declining performance that makes it urgent. This is exactly what synth. can do that no single tool can — because no single tool sees all four signals.

---

### 2.5 Lineup Optimization Suggestions

Uses historical data to suggest which athletes should row together.

**Inputs:**

- Every past lineup and its session result (time)
- Individual athlete erg scores (baseline fitness)
- Pair history (which port/starboard combinations have been fast)
- Seat history (which athletes performed best in which seats)
- Current recovery readiness (don't put a fatigued athlete in a key seat)

**Strategy: combination scoring**

For a requested boat (e.g., Varsity 8):

1. Score each athlete's current form: recent erg performance × recovery readiness
2. For each possible seat assignment, calculate a predicted boat speed based on:
   - Historical seat performance for each athlete
   - Pair compatibility scores (from past sessions where these athletes rowed together)
   - Side correctness (starboard athlete in starboard seat)
3. Rank the top 5 lineup combinations
4. Present to coach as suggestions, not directives

**What the coach sees:**

```
SUGGESTED LINEUP — Varsity 8

Based on current form, pair history, and recovery status:

Bow  PORT  Baroni      (form: 8.2, recovery: 82)
2    STBD  Beale       (form: 7.9, recovery: 91)
3    PORT  Kristensen  (form: 8.5, recovery: 78)
4    STBD  Phelps      (form: 9.4, recovery: 85)
5    PORT  Gold        (form: 8.1, recovery: 88)
6    STBD  Manton      (form: 8.8, recovery: 62) ⚠ low recovery
7    PORT  Furrer      (form: 7.7, recovery: 94)
Str  STBD  Pfautsch    (form: 7.6, recovery: 90)

⚠ Manton at 62 recovery — consider swapping with Wolfaardt (recovery: 91)

[Use this lineup]  [Modify]  [Ignore]
```

---

### 2.6 Athlete Comparison Engine

Coach asks: "Compare Phelps and Manton over the last month."

**What synth. generates:**

Side-by-side comparison across every data source:

```
                    PHELPS              MANTON
Erg (2k best)      1:38.2              1:39.0
Erg trend          ↑ -1.8s/month       → plateau
Gym load/week      7.2                 8.1
Gym trend          → steady            ↑ increasing
Training load      6.8/10              8.9/10 ⚠
Recovery           85/100              62/100 ⚠
Sleep avg          7.2 hrs             5.8 hrs ⚠
HRV trend          → stable            ↓ declining
Sessions/week      5                   7
Rest days/month    8                   3 ⚠

INSIGHT: Manton is training harder but recovering worse.
His erg performance has plateaued despite increased volume.
Classic overtraining pattern. Consider reducing load.
```

---

### 2.7 Missing Data Detection

synth. knows what data SHOULD exist and flags when it doesn't.

**Strategy: expected cadence per source**

Each connected source has an expected data frequency:

- Wellness check-ins: daily (morning at minimum)
- Erg scores: 2-3 per week during training
- Gym sessions: 3-4 per week
- Sleep/HRV: daily (from wearables)
- Session participation: matches published lineup

**Flags:**

- "Gold hasn't logged a wellness check-in in 4 days"
- "Baroni's Bridge Athletics data hasn't updated in 12 days — ask them to re-upload"
- "No erg data for 6 athletes this week — was there a test scheduled?"
- "Furrer was in the published lineup but has no session data — did they row?"

**Why this matters:** Missing data is itself a signal. An athlete who stops reporting wellness may be avoiding it because they feel bad. An athlete whose gym data goes stale may have stopped going. synth. treats silence as information.

---

### 2.8 Anomaly Detection

Catches data points that don't make sense — either data entry errors or genuine outliers worth investigating.

**Strategy: statistical outlier detection per athlete**

For each athlete, synth. maintains a rolling distribution of their metrics. Any new data point that falls outside 2.5 standard deviations from their personal mean gets flagged.

**Examples:**

- "Phelps logged a 2:15.0 erg split — this is 37 seconds slower than his average. Possible data entry error?"
- "Gold's gym session shows 500lb squat — this is 275lbs above his previous max. Verify?"
- "Kristensen's HRV jumped from 45ms to 120ms overnight — possible measurement error from Whoop?"
- "Baroni recorded 12 gym sessions this week — typically does 3-4. Did he upload a full month by accident?"

**Coach action:** Confirm (it's real), Correct (fix the value), or Dismiss (ignore it).

Confirmed anomalies become notable events: "Phelps PR'd his 2k by 4 seconds" or "Gold's squat jumped 30lbs after his training cycle."

---

### 2.9 Periodization Awareness

synth. understands where the team is in their training cycle and adjusts all thresholds accordingly.

**Strategy: season phase detection**

The coach sets their season phases in settings:

```
Pre-season (Aug-Sep): Base building. High volume, low intensity.
Fall season (Oct-Nov): Race prep. Volume drops, intensity rises.
Winter training (Dec-Feb): Peak volume. Heavy erg and gym.
Spring racing (Mar-May): Taper. Volume drops, sharpness increases.
Off-season (Jun-Jul): Recovery. Low everything.
```

**How this changes the algorithms:**

- In pre-season, a training load of 8/10 is EXPECTED and shouldn't trigger overtraining alerts
- In taper (2 weeks before a race), a training load of 8/10 IS a problem — the athlete should be at 4-5
- Erg performance trends matter more in winter training than in off-season
- Recovery thresholds are stricter during racing season (athletes need to be sharp)

**What the coach sees:**

"Spring Racing Phase — Week 3 of 8. Team average load should be decreasing. Currently: 6.8 (target: 5.0). Consider reducing volume for 4 athletes above 7.5."

---

### 2.10 Weekly Synthesis Report

Every Monday at 6 AM, the coach gets an automated digest that no human could compile manually.

**Contents:**

```
SYNTH. WEEKLY DIGEST — Pacific Rowing
Week of April 7-13, 2026

HEADLINE
Team training load averaged 6.4/10, down from 7.1 last week.
3 athletes flagged for monitoring. 1 PR recorded.
Spring racing phase — Week 3. On track for taper.

TOP PERFORMERS
• Phelps: 2k PR at 1:38.2 — 2.4s improvement from October test
• Kristensen: Erg trend up 1.2s over 30 days, most consistent port rower
• Beale: 100% attendance, all wellness green, training load steady at 6.0

FLAGS
• Manton: HIGH RISK — load spike + declining HRV + poor sleep (see details)
• Gold: Missed 3 wellness check-ins — follow up
• Furrer: Gym data stale (last update 9 days ago)

TEAM TRENDS
• Median erg split improved 0.8s from previous month
• Sleep average: 6.9 hours (target: 7.5) — 8 athletes below target
• Gym compliance: 78% of athletes logged 3+ sessions (target: 85%)

DATA QUALITY
• 12/64 athletes have <3 connected sources — limited synthesis
• Bridge Athletics data is 5 days old for 8 athletes
• Concept2 Logbook connected for 41/64 athletes (64%)

NEXT WEEK
• Wednesday: scheduled 2k test (from Google Calendar)
• Recommend: reduce Tuesday load for athletes racing Wednesday
• 4 athletes returning from injury — monitor first full sessions
```

This report is the product. Everything else is plumbing to make this possible.

---

## 3. DATA QUALITY SCORING

synth. rates the quality of data it has per athlete. More connected sources = higher quality = better insights.

**Per-athlete data quality score:**

```
sources_connected: 0-5 points (1 point per active source)
data_freshness: 0-3 points (all sources updated within 48hrs = 3)
data_completeness: 0-2 points (has erg + gym + wellness + sleep = 2)

quality_score = sources + freshness + completeness (out of 10)
```

**What the coach sees:**

- Each athlete card shows a small quality indicator
- "Phelps: Data Quality 9/10 — 4 sources, all current, full coverage"
- "Holt: Data Quality 3/10 — only Google Sheets connected, last update 6 days ago"
- Dashboard shows: "32 athletes with quality >7 (good), 20 athletes 4-6 (partial), 12 athletes <4 (limited)"
- Prompt: "Connect Apple Health for 23 athletes to unlock recovery insights"

This creates a natural upgrade loop: the more sources connected, the better the insights, the more the coach relies on synth.

---

## 4. HOW INSIGHTS ARE SURFACED

All of these algorithms run in the background. The coach never thinks about them. They just see:

### Dashboard Cards

- Recovery Readiness panel (green/yellow/red per athlete)
- Training Load distribution (team histogram)
- Flags panel (athletes needing attention, ranked by urgency)
- Weekly trend arrows (team-wide erg, gym, attendance, sleep)

### Athlete Profile

- Performance trend chart with trend arrows
- Training load over time (line chart)
- Recovery score over time (line chart with thresholds)
- Data quality indicator
- Cross-source timeline (all events from all sources in one feed)

### synth. AI Chat

- Coach asks natural language questions
- AI has full context of all synthesized data
- "Is Phelps ready for Saturday?" → checks recovery, training load, recent performance, sleep
- "Which athletes improved most this month?" → runs trend analysis across all athletes
- "Compare the V8 lineup from last week vs this week" → side-by-side with predicted impact

### Push Notifications

- Immediate: critical risk alerts
- Daily: morning readiness summary
- Weekly: Monday synthesis digest

### Google Sheets Write-Back

- All calculated metrics (training load, recovery, trends) can be written back to the coach's sheet
- Coach's existing formulas and charts automatically reflect the new data
- Coaches who live in spreadsheets get synth.'s intelligence without leaving their workflow

---

## 5. WHAT MAKES THIS DEFENSIBLE

Any tool can show erg scores. Any tool can show gym data. The defensive moat is the SYNTHESIS — the cross-source algorithms that only work when you have all the data in one place.

- **Training load** requires erg + gym + water + cross-training data
- **Recovery readiness** requires sleep + HRV + wellness + training load
- **Overtraining detection** requires training load + recovery + performance trend (3 sources minimum)
- **Lineup optimization** requires erg performance + pair history + recovery status
- **The weekly digest** requires literally everything

The more sources an athlete connects, the better the insights. The better the insights, the more the coach relies on synth. The more the coach relies on synth., the more athletes connect sources. Flywheel.

No competitor has this because no competitor is tool-agnostic. Bridge only sees gym data. Strava only sees activities. Whoop only sees recovery. synth. sees all of it, and the value is in the connections between them.
