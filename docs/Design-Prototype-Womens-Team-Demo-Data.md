# Design / Prototype Document — Synth Dashboard (Women’s Team Demo)

**Version:** 0.1  
**Audience:** Design, frontend prototype, connector QA  
**Data:** Demo only — **Cal Women’s 1V + 2V**, **two seasons** of history ingested from a **master Excel workbook** (structure understood before UI build).

This document ties **demo datasets** to the **live site theme** (colors, type, surfaces) and to **Team Overview** UI regions: chips, charts, roster table, AI insight.

### Interactive prototype — login

1. Run `npm run dev` in `synth-deck`.
2. Open **`http://localhost:5173/#prototype`** (hash must be `#prototype`).
3. Click **Enter demo dashboard** — no typing required (local-only session).
4. Optional: use **Sign in** with the demo IDs below (password is **not** validated).

| Field | Value |
|--------|--------|
| Email | `coach@berkeley.edu` |
| Password | `demo` (any string works) |
| Team ID | `cal-womens-rowing-demo` |
| Org ID | `demo-org-berkeley-athletics` |

If inputs don’t accept keystrokes in a nested browser, use **Enter demo dashboard** or paste into fields; fields use controlled state and `select-text`.

---

## 1. Theme (website) — implementation tokens

Use these for Figma labels and CSS variables so the prototype matches the production deck.


| Role           | Token                                         | Value                                                     |
| -------------- | --------------------------------------------- | --------------------------------------------------------- |
| Primary        | `THEME.primary`                               | `#059669`                                                 |
| Primary dark   | `THEME.primaryDark`                           | `#047857`                                                 |
| Primary deeper | `THEME.primaryDarker`                         | `#065F46`                                                 |
| Accent / dot   | `THEME.accent` / `logoDotColor`               | `#10B981`                                                 |
| Highlight tint | `THEME.primaryLight`                          | `#A7F3D0`                                                 |
| Semantic       | `blue` / `amber` / `red` / `cyan` / `purple`  | `#3B82F6` / `#F59E0B` / `#EF4444` / `#06B6D4` / `#8B5CF6` |
| Text           | `textPrimary` / `textSecondary` / `textMuted` | `#18181B` / `#52525B` / `#A1A1AA`                         |
| Surfaces       | `light` / `dark` / `border`                   | `#FAFAF9` / `#18181B` / `#E4E4E7`                         |


**Typography**


| Use                        | Font            |
| -------------------------- | --------------- |
| Logo, nav, labels, metrics | JetBrains Mono  |
| Headlines (editorial)      | Fraunces        |
| Body, table cell names     | Instrument Sans |


**Tagline (header / meta)**  
Every data signal. One platform.

---

## 2. Prototype scenario


| Field                  | Value                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| Team                   | Cal Women’s Rowing — **1V + 2V**                                                             |
| Athletes on roster     | 18 (dashboard shows key rows in prototype)                                                   |
| Historical window      | **Two years**: **Jan 2024 – Dec 2025** (calendar); season labels **2023–24** and **2024–25** |
| Source of truth (demo) | Excel workbook: `cal_womens_rowing_master.xlsx` (multi-tab, described below)                 |
| Ingestion story        | Sheets connector **synced**; TeamWorks **compliance**; wearable **live** (demo flags)        |


---

## 3. Excel workbook — structure “understood beforehand”

Before the UI was built, the following **tabs and columns** were agreed so connectors map 1:1 to the dashboard.

### Tab: `roster_current`


| Column       | Description                  |
| ------------ | ---------------------------- |
| `athlete_id` | Stable ID                    |
| `name`       | Display name                 |
| `seat`       | Boat + seat (e.g. 1V Stroke) |
| `class_year` | FR / SO / JR / SR            |


### Tab: `erg_tests` (long format)


| Column       | Description |
| ------------ | ----------- |
| `athlete_id` | FK          |
| `test_date`  | ISO date    |
| `erg_2k`     | `MM:SS.d`   |
| `split_500`  | `1:XX.X`    |


### Tab: `s_c_performance` (strength & conditioning)


| Column        | Description                   |
| ------------- | ----------------------------- |
| `athlete_id`  | FK                            |
| `week_start`  | Monday date                   |
| `squat_lb`    | Max or prescribed working max |
| `load_rating` | Low / Med / High              |


### Tab: `wellness_daily`


| Column           | Description   |
| ---------------- | ------------- |
| `athlete_id`     | FK            |
| `date`           |               |
| `sleep_h`        | Decimal hours |
| `compliance_pct` | 0–100         |


### Tab: `team_monthly_rollups` (for charts)


| Column                | Description                                         |
| --------------------- | --------------------------------------------------- |
| `month`               | `YYYY-MM`                                           |
| `source_signal_index` | 0–100 synthetic blend of upload + wearable activity |
| `compliance_team_avg` | Team average %                                      |


---

## 4. Demo data — current roster snapshot (prototype table)

Values below are **representative** of the Excel-derived **latest** test and weekly rollups. Risk flags follow dashboard rules: sleep < 6.5h or compliance < 90% or coach load flag.


| Athlete      | Seat      | Erg 2K | Split  | Squat | Load | Sleep | Comply | Status      |
| ------------ | --------- | ------ | ------ | ----- | ---- | ----- | ------ | ----------- |
| E. Nakamura  | 1V Stroke | 6:58.2 | 1:44.1 | 235   | Med  | 7.4h  | 98%    | OK          |
| M. Okonkwo   | 1V 7-seat | 7:02.8 | 1:45.6 | 225   | Low  | 8.0h  | 100%   | OK          |
| S. Reyes     | 1V 5-seat | 7:01.1 | 1:45.0 | 230   | Med  | 7.9h  | 97%    | OK          |
| A. Lindstrom | 1V 3-seat | 7:08.4 | 1:47.2 | 210   | Med  | 6.3h  | 92%    | OK          |
| K. Osei      | 1V Bow    | 7:12.0 | 1:48.3 | 205   | High | 5.9h  | 89%    | **AT RISK** |
| T. Brooks    | 2V Stroke | 7:05.6 | 1:46.4 | 220   | Med  | 7.1h  | 94%    | OK          |
| J. Park      | 2V 5-seat | 7:09.9 | 1:47.8 | 215   | Med  | 6.6h  | 90%    | OK          |
| R. Fernández | 2V 3-seat | 7:14.2 | 1:49.0 | 200   | High | 5.5h  | 87%    | **AT RISK** |


---

## 5. Demo data — two years of team rollups (monthly)

**2024**


| Month   | Source signal index | Team compliance avg % |
| ------- | ------------------- | --------------------- |
| 2024-01 | 68                  | 91                    |
| 2024-02 | 72                  | 93                    |
| 2024-03 | 78                  | 94                    |
| 2024-04 | 81                  | 95                    |
| 2024-05 | 76                  | 92                    |
| 2024-06 | 74                  | 90                    |
| 2024-07 | 70                  | 88                    |
| 2024-08 | 79                  | 94                    |
| 2024-09 | 84                  | 96                    |
| 2024-10 | 86                  | 97                    |
| 2024-11 | 83                  | 96                    |
| 2024-12 | 80                  | 95                    |


**2025**


| Month   | Source signal index | Team compliance avg % |
| ------- | ------------------- | --------------------- |
| 2025-01 | 82                  | 96                    |
| 2025-02 | 85                  | 97                    |
| 2025-03 | 88                  | 98                    |
| 2025-04 | 87                  | 97                    |
| 2025-05 | 84                  | 95                    |
| 2025-06 | 81                  | 93                    |
| 2025-07 | 78                  | 91                    |
| 2025-08 | 86                  | 96                    |
| 2025-09 | 89                  | 98                    |
| 2025-10 | 90                  | 99                    |
| 2025-11 | 88                  | 98                    |
| 2025-12 | 86                  | 97                    |


**Chart mapping (UI)**  

- **Source signal** micro-bars: use the 7 monthly values for the **last 7 labels** ending current month (e.g. `M T W T F S S` or last 7 months — prototype uses **Jul–Jan** rolling window in dev).  
- **Compliance vs. load** bars: one bar per **spot athlete** in table (6–8); height encodes risk band (use `red` / `accent` per theme).

---

## 6. Season summaries (end of season) — Excel-derived aggregates


| Season  | Avg team 2K (seconds) | Avg compliance | Notes                                    |
| ------- | --------------------- | -------------- | ---------------------------------------- |
| 2023–24 | 425.8 (~7:05.8)       | 93.2%          | Baseline year; summer dip in Jul         |
| 2024–25 | 422.4 (~7:02.4)       | 95.8%          | Wearable coverage + Sheets discipline up |


---

## 7. Connector strip (prototype copy)

Aligned to **chips** on Team Overview (mono labels, semantic colors).


| Connector | Demo state | Theme color |
| --------- | ---------- | ----------- |
| Sheets    | synced     | `primary`   |
| TeamWorks | 2m ago     | `cyan`      |
| Wearable  | live       | `purple`    |


---

## 8. AI insight block (prototype)

**Tone:** Instrument Sans body, mono **AI INSIGHT** label, `amber` callout surface (`#F59E0B` at ~8% fill, border ~35%).

**Sample text (women’s demo):**

> **AI INSIGHT** — Osei: 1:48.3 split trend + High load block + sleep 5.9h three nights. **Fatigue risk flagged.** Fernández: compliance 87% with rising load; **monitor closely.** Ingest matched rows from Sheets erg log + TeamWorks attendance.

---

## 9. Screen map — where demo data lands


| UI region                 | Data source (this doc)                      |
| ------------------------- | ------------------------------------------- |
| Subtitle                  | §2 (18 athletes, 1V+2V)                     |
| Status chips              | §7                                          |
| Source signal chart       | §5 (rolling 7 from monthly or weekly slice) |
| Compliance vs. load chart | §4 (risk per athlete)                       |
| Roster table              | §4                                          |
| AI insight                | §8                                          |
| Top nav / URL             | `app.synthsports.com/dashboard` (prototype) |


---

## 10. Figma / build checklist

- Page background `THEME.light`; sidebar `#FAFAF9`; chrome `THEME.darkDeep`.
- All metrics monospace; athlete names sans.
- Status **AT RISK** uses `THEME.red` on pill; **OK** uses `THEME.accent`.
- Charts use `THEME.primary` / `THEME.blue` for dual source signal; compliance bars use risk logic above.
- No real athlete PII in exports — this file is **fictional demo** aligned to structure only.

---

*End of design/prototype document.*