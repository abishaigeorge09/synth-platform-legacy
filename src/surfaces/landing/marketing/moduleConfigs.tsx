import { KO } from '../shell/primitives'
import type { ModulePageConfig } from '../templates/ModulePage'

/** Eight platform modules — synth's mapping of Kitman's offerings, rewritten
 *  for amateur athletes first, with team voice on the Team Operations module. */

export const MODULE_CONFIGS: Record<string, ModulePageConfig> = {
  /* ─── synth Core — the foundational data layer ─────────────────────── */
  'synth-core': {
    slug: 'synth-core',
    active: 'platform',
    hero: {
      eyebrow: 'foundational data layer',
      headline: <>Synth <KO>Core</KO></>,
      subhead: 'The connective tissue underneath every other module. One codebase, one data model, one calendar across every signal your training generates — synced, normalized, and ready to read.',
      primaryCta: { label: 'start free', to: '/signup' },
      secondaryCta: { label: 'watch a demo', to: '/coach/dashboard' },
      media: {
        kind: 'illustration',
        label: 'Architecture diagram: 12 sources → synth Core → modules',
        caption: 'Replace with the data-layer architecture diagram or a stylized "OS" graphic.',
      },
    },
    valueBridge: {
      eyebrow: 'one platform. by design',
      headline: <>Built as <KO>one system</KO>, not stitched from acquisitions.</>,
      body: 'Most "operating systems" in this category were assembled by acquisition — separate calendars, separate databases, separate logins, rebadged as one product. You become the glue. synth Core is built differently: one codebase, one data model, one calendar across every signal you track.',
      media: {
        kind: 'screenshot',
        label: 'synth Core — calendar + filters panel',
        caption: 'Product screenshot of the unified roster + calendar view.',
      },
    },
    capabilities: {
      eyebrow: 'solution capabilities',
      title: 'Everything every module shares.',
      coreCapabilities: [
        { title: 'Self-service reporting', body: 'Build any report from any signal — without writing a query. Save it. Share it. Schedule it.' },
        { title: 'Centralized calendar', body: 'Every workout, race, meeting, and check-in in one place. Sync to Google Calendar in one click.' },
        { title: 'Daily status', body: 'A single morning glance: who is ready, who is tired, what changed overnight.' },
        { title: 'Mobile engagement', body: 'Your athletes complete check-ins on their phone in 15 seconds. PWA, no app store.' },
        { title: 'Forms & data collection', body: 'Build any form — wellness, RPE, soreness, mental load. Goes into the same warehouse as everything else.' },
        { title: 'Seamless data integration', body: '12+ direct integrations live. OAuth in 60 seconds. AI Import for anything without an API.' },
      ],
    },
    closing: {
      headline: <>The <KO>data layer</KO> is free.</>,
      body: 'synth Core powers every module above. It is free during the alpha and stays free for the foundational tier.',
      primary: { label: 'get started', to: '/signup' },
      secondary: { label: 'see the platform', to: '/platform' },
    },
  },

  /* ─── Recovery & Health ────────────────────────────────────────────── */
  'recovery-health': {
    slug: 'recovery-health',
    active: 'platform',
    hero: {
      eyebrow: 'more than a recovery tracker',
      headline: <>Recovery & <KO>Health</KO></>,
      subhead: 'A single view of every recovery signal you produce — HRV, sleep, soreness, training stress, injury history — synthesized into one readiness score, every morning.',
      primaryCta: { label: 'start free', to: '/signup' },
      secondaryCta: { label: 'see the dashboard', to: '/coach/dashboard' },
      media: {
        kind: 'photo',
        label: 'Athlete recovering — early morning, simple, calm',
        caption: 'A real photo of an amateur athlete stretching at sunrise, foam-rolling, or sitting with coffee + training log. Not a stock pro.',
      },
    },
    valueBridge: {
      eyebrow: 'why this matters',
      headline: <>Less risk. Fewer gaps. <KO>more time training</KO>.</>,
      body: 'A single low HRV night is a bad data point. Three in a row is a signal. synth watches every signal at once and tells you when the pattern shifts — before you feel it in your legs.',
      media: {
        kind: 'screenshot',
        label: 'Recovery dashboard mock — readiness score + 14-day trend',
        caption: 'Product screenshot of the recovery module: readiness number, sparkline, color-coded flags.',
      },
    },
    capabilities: {
      eyebrow: 'solution capabilities',
      title: 'Everything in one screen.',
      coreCapabilities: [
        { title: 'Recovery readiness score', body: 'A single 0–100 number that blends HRV, sleep, soreness, RPE, and load history. Citation-backed.' },
        { title: 'Injury history & lifecycle', body: 'Log a niggle. synth tracks it through onset, treatment, return-to-train. No spreadsheet.' },
        { title: 'Training-stress balance', body: 'Acute vs chronic load. The same number elite sport scientists watch — now in your pocket.' },
        { title: 'Sleep + HRV unified', body: 'Whoop / Oura / Apple Health / Garmin — all in one trend. No more switching apps.' },
        { title: 'Soreness & wellness check-ins', body: '15-second daily form on your phone. RPE, mood, soreness map. Writes back to your team\'s tool if you have one.' },
        { title: 'Risk flags', body: 'When recovery patterns drift away from your baseline, synth surfaces it — early.', hint: '+ guide: how synth flags risk early' },
        { title: 'Return-to-train planning', body: 'A structured ramp after illness, injury, or a hard race. Auto-generated, adjustable, athlete-visible.' },
        { title: 'Therapeutic-use exemption (TUE) tracking', body: 'For competitive athletes — keep your TUE documentation organized with your medical record.', hint: 'team plan' },
      ],
    },
    quote: {
      quote: 'synth flagged my HRV drop a week before I would have. I pulled back load that Tuesday — race weekend was still on.',
      attribution: 'Star Miller',
      role: 'Athlete advisor · Cal Women\'s Rowing · AUS U23',
    },
    closing: {
      headline: <>Train more. <KO>break less.</KO></>,
      body: 'synth Recovery is included in every paid tier. Free for athletes during the alpha.',
      primary: { label: 'start free', to: '/signup' },
      secondary: { label: 'see the dashboard', to: '/coach/dashboard' },
    },
  },

  /* ─── Training & Load ──────────────────────────────────────────────── */
  'training-load': {
    slug: 'training-load',
    active: 'platform',
    hero: {
      eyebrow: 'more than a training log',
      headline: <>Training & <KO>Load</KO></>,
      subhead: 'Every session, every interval, every wattage tick — captured from Strava, Concept2, or your own spreadsheet. synth normalizes it all and tells you what the week actually cost you.',
      primaryCta: { label: 'start free', to: '/signup' },
      secondaryCta: { label: 'see a real plan', to: '/coach/dashboard' },
      media: {
        kind: 'photo',
        label: 'Amateur athlete mid-session: erg, road, pool, lift',
        caption: 'A real amateur athlete training — sweat, focus, regular gym. Not pro broadcast footage.',
      },
    },
    valueBridge: {
      eyebrow: 'why this matters',
      headline: <>The plan you wrote vs. the plan you <KO>actually did</KO>.</>,
      body: 'Most apps either plan or track — never both. synth holds both side by side: what your coach (or you) wrote, and what your body actually executed. The gap is where the next decision lives.',
      media: {
        kind: 'screenshot',
        label: 'Planned vs actual weekly view',
        caption: 'Screenshot showing plan rows vs actual rows, with deviations highlighted.',
      },
    },
    capabilities: {
      eyebrow: 'solution capabilities',
      title: 'Every signal in one log.',
      coreCapabilities: [
        { title: 'Acute & chronic training load', body: 'The TSS framework, applied across every sport. Spot when you\'re building, peaking, or risking.' },
        { title: 'Session planning & prescription', body: 'Write the week. synth pushes it to your calendar and reminds you on race-week.' },
        { title: 'Periodization view', body: 'Quarter, season, year. See how this week fits the arc — without rebuilding a spreadsheet.' },
        { title: 'RPE & wellness logging', body: '15 seconds after the session. Combined with HRV, the cheapest reliable load signal you can buy.' },
        { title: 'GPS & power data', body: 'Pulled from Strava, Garmin, Apple Health — normalized to one schema.' },
        { title: 'Growth & maturation tracking', body: 'For junior and developing athletes — peak-height-velocity-aware planning.', hint: 'team plan' },
        { title: 'Performance benchmarking', body: 'Your 5K, your 2K, your back-squat — vs your own history, your age group, or your team.' },
        { title: 'Best-week detection', body: 'synth surfaces your highest-quality weeks so you can repeat what worked.', hint: '+ ai chat: "what was my best week?"' },
      ],
    },
    closing: {
      headline: <>Plan smarter. <KO>execute honestly.</KO></>,
      body: 'Free during the alpha. $9/mo Athlete, $19/mo Athlete Pro.',
      primary: { label: 'start free', to: '/signup' },
      secondary: { label: 'see pricing', to: '/pricing' },
    },
  },

  /* ─── Progress & Development ───────────────────────────────────────── */
  'progress-development': {
    slug: 'progress-development',
    active: 'platform',
    hero: {
      eyebrow: 'more than a PR tracker',
      headline: <>Progress & <KO>Development</KO></>,
      subhead: 'Long-term progression for athletes who are in it for the season — not the workout. PR engine, trend detection, goal pacing, and the gap analysis no spreadsheet does for you.',
      primaryCta: { label: 'start free', to: '/signup' },
      secondaryCta: { label: 'see the trend engine', to: '/coach/dashboard' },
      media: {
        kind: 'illustration',
        label: 'Progress arc: PR curve over 12 months with milestones',
        caption: 'A clean illustration of an athlete\'s 12-month PR arc with synth annotations.',
      },
    },
    valueBridge: {
      eyebrow: 'why this matters',
      headline: <>Find your <KO>formula for the season</KO>.</>,
      body: 'The signals that produced your last PR are buried in three apps and a notes file. synth pulls them forward, finds the pattern, and tells you what to repeat.',
      media: {
        kind: 'screenshot',
        label: 'Athlete development view — PRs, trends, goal pacing',
        caption: 'Screenshot of the progress dashboard.',
      },
    },
    capabilities: {
      eyebrow: 'solution capabilities',
      title: 'A season-long view of you.',
      coreCapabilities: [
        { title: 'Individual development plan', body: 'A 4–12-week structured plan from your goal. Adjusts to your recovery and load history.' },
        { title: 'PR engine', body: 'Tracks every personal record across every modality. 5K, 2K, deadlift, FTP, threshold mile.' },
        { title: 'Trend detection', body: 'Improving / plateau / declining — at a metric, not vibes-level.' },
        { title: 'Goal pacing', body: 'Sub-4 marathon, sub-7 2K, bodyweight bench. synth shows you whether you\'re on track this week.' },
        { title: 'Best-pattern surfacing', body: 'The conditions that produced your highest weeks. Reproducible.' },
        { title: 'Coach diary', body: 'Notes, feedback, video review timestamps — attached to the session they\'re about.', hint: 'team plan' },
        { title: 'Drill & session library', body: 'Save what worked. Re-use it. Share it with training partners.' },
        { title: 'Participation management', body: 'For team coaches: training availability, attendance, and progression in one screen.', hint: 'team plan' },
      ],
    },
    closing: {
      headline: <>One season. <KO>one screen.</KO></>,
      primary: { label: 'start free', to: '/signup' },
      secondary: { label: 'see pricing', to: '/pricing' },
    },
  },

  /* ─── Team Operations — coach voice on this one ────────────────────── */
  'team-operations': {
    slug: 'team-operations',
    active: 'platform',
    hero: {
      eyebrow: 'for clubs, schools, and programs',
      headline: <>Team <KO>Operations</KO></>,
      subhead: 'For coaches running rosters of 5 to 500. Lineups, scheduling, attendance, two-way sync to Google Sheets, and athlete-level visibility into every signal your program tracks — without the enterprise price tag.',
      primaryCta: { label: 'talk to us', to: 'mailto:supportsynth@gmail.com' },
      secondaryCta: { label: 'see a team demo', to: '/coach/dashboard' },
      media: {
        kind: 'photo',
        label: 'Coach + team in pre-practice huddle',
        caption: 'Coach on a tablet with athletes around — practice context, not stadium.',
      },
    },
    valueBridge: {
      eyebrow: 'why this matters',
      headline: <>Eliminate silos. Convert data into <KO>decisions</KO>.</>,
      body: 'Most programs juggle four to seven tools and a whiteboard. synth Team Operations pulls them into one surface, writes lineup changes and timer splits back to wherever you store them, and never asks anyone to migrate.',
      media: {
        kind: 'screenshot',
        label: 'Coach dashboard — roster, wellness, alerts, lineups',
        caption: 'The current /coach/dashboard surface, with annotations.',
      },
    },
    capabilities: {
      eyebrow: 'solution capabilities',
      title: 'Run the team from one screen.',
      coreCapabilities: [
        { title: 'Roster management', body: 'Every athlete, every contact, every position. Two-way sync to your team\'s spreadsheet.' },
        { title: 'Lineup builder', body: 'Drag-and-drop with PR + wellness + attendance in view. Writes back to Google Sheets.' },
        { title: 'Session timer', body: 'Race-day-grade stopwatch with splits, comparison, and an export back to your spreadsheet.' },
        { title: 'Attendance & participation', body: 'Daily roll-call on a phone in three taps. No more "did Anna make practice?"' },
        { title: 'Eligibility & compliance', body: 'For school programs: GPA, age-bracket, registration status — surfaced in the roster.', hint: 'collegiate tier' },
        { title: 'Discipline & sanctions', body: 'Document and track team rules. Per-athlete history, audit-ready.' },
        { title: 'Calendar across teams', body: 'JV, varsity, recovery group — all on one calendar, color-coded by squad.' },
        { title: 'Coach-private notes', body: 'What you write about an athlete stays private until you choose to share it.' },
      ],
    },
    closing: {
      headline: <>Programs of any size. <KO>One tier per stage.</KO></>,
      body: '$199/mo Team for ≤30 athletes. $499/mo Team+ for ≤100. Collegiate and program tiers from $15K/year.',
      primary: { label: 'talk to us', to: 'mailto:supportsynth@gmail.com' },
      secondary: { label: 'see pricing', to: '/pricing' },
    },
  },

  /* ─── Custom Analytics ─────────────────────────────────────────────── */
  'custom-analytics': {
    slug: 'custom-analytics',
    active: 'platform',
    hero: {
      eyebrow: 'beyond a sports analytics company',
      headline: <>Custom <KO>Analytics</KO></>,
      subhead: 'When the dashboard isn\'t enough — a synth team partners with you on the bespoke project. Data health audits, success-landscape mapping, injury reviews, head-coach selection support.',
      primaryCta: { label: 'talk to us', to: 'mailto:supportsynth@gmail.com' },
      secondaryCta: { label: 'see how it works', to: '/#pillars' },
      media: {
        kind: 'illustration',
        label: 'Bespoke analytics diagram — question → data → answer → action',
        caption: 'A clean diagram of a custom-analytics engagement arc.',
      },
    },
    valueBridge: {
      eyebrow: 'when to use this',
      headline: <>Bespoke is for <KO>specific questions</KO>, not vague ones.</>,
      body: 'If you can phrase the question in one sentence — "is our acute:chronic ratio mis-calibrated for masters athletes?" — we can build the answer. Engagements run 4 to 12 weeks. Deliverable is a model, a report, or a custom dashboard in your synth tenant.',
    },
    capabilities: {
      eyebrow: 'engagement types',
      title: 'Five ways we go bespoke.',
      coreCapabilities: [
        { title: 'Data health audit', body: 'Tell us what you collect. We tell you what it\'s worth, what\'s missing, and what to clean.' },
        { title: 'Success-landscape mapping', body: 'For programs: what signals correlated with your best seasons. What didn\'t.' },
        { title: 'Injury review', body: 'Retrospective on a specific injury cluster. Pattern detection. Prevention plan.' },
        { title: 'Head-coach / manager selection support', body: 'Decision-support analytics for hiring or evaluation moments.' },
        { title: 'Bespoke research projects', body: 'You bring the question. We bring the modeling. Output ships into your synth tenant.' },
      ],
    },
    closing: {
      headline: <>Have a <KO>specific question</KO>?</>,
      body: 'Send us a one-line description of the problem. We\'ll come back with a scope and a timeline.',
      primary: { label: 'email us', to: 'mailto:supportsynth@gmail.com' },
      secondary: { label: 'see the platform', to: '/platform' },
    },
  },

  /* ─── Integrations directory ───────────────────────────────────────── */
  'integrations': {
    slug: 'integrations',
    active: 'platform',
    hero: {
      eyebrow: 'every tool you already use',
      headline: <>12+ <KO>integrations</KO> and counting</>,
      subhead: 'Wearables, training apps, team tools, spreadsheets. If it has an API, synth connects. If it doesn\'t, our AI Import pipeline reads photos, voice notes, and pasted text.',
      primaryCta: { label: 'start free', to: '/signup' },
      secondaryCta: { label: 'request an integration', to: 'mailto:supportsynth@gmail.com' },
      media: {
        kind: 'illustration',
        label: '12-logo grid hub-and-spoke into synth',
        caption: 'Replace with a logo grid + lines converging on the synth mark.',
      },
    },
    valueBridge: {
      eyebrow: 'how integrations work',
      headline: <>OAuth in <KO>60 seconds</KO>. Then it just keeps syncing.</>,
      body: 'Click connect. Approve. Done. synth runs a nightly sync and a live sync for high-frequency signals. You stay in your existing tools and you never see "import error" — we surface every sync state in the sources panel.',
    },
    capabilities: {
      eyebrow: 'connectors',
      title: 'The full ecosystem.',
      coreCapabilities: [
        { title: 'Wearables', body: 'Whoop, Garmin, Oura, Apple Health, Google Health Connect, Fitbit.' },
        { title: 'Activity & training apps', body: 'Strava, Concept2 Logbook.' },
        { title: 'Spreadsheets & docs', body: 'Google Sheets (priority), Excel, Google Calendar, Notion — read AND write.' },
        { title: 'AI Import — photos', body: 'Snap any chart, paper log, screenshot. Claude Vision turns it into structured data.' },
        { title: 'AI Import — voice', body: 'Post-session voice memo. Whisper → Claude → structured data in your log.' },
        { title: 'AI Import — pasted text', body: 'Paste an email from your coach, a Reddit comment, a forum thread. synth structures it.' },
        { title: 'Manual upload', body: 'CSV, PDF, image. Drag, drop, mapped to your schema in seconds.' },
      ],
    },
    closing: {
      headline: <>If you use it, <KO>synth connects to it</KO>.</>,
      body: 'Missing an integration you need? Email us — we add common requests within two weeks.',
      primary: { label: 'start free', to: '/signup' },
      secondary: { label: 'request an integration', to: 'mailto:supportsynth@gmail.com' },
    },
  },

  /* ─── API ──────────────────────────────────────────────────────────── */
  'api': {
    slug: 'api',
    active: 'platform',
    hero: {
      eyebrow: 'for developers and researchers',
      headline: <>API <KO>for synth</KO></>,
      subhead: 'A RESTful API into your synth tenant. Pull every athlete, every session, every recovery score. Push your own data. Build custom dashboards, research models, or sport-specific integrations.',
      primaryCta: { label: 'request access', to: 'mailto:supportsynth@gmail.com' },
      secondaryCta: { label: 'see all integrations', to: '/platform/integrations' },
      media: {
        kind: 'illustration',
        label: 'API illustration — endpoints, code snippet, response',
        caption: 'A "developer-style" graphic with terminal code and example payload.',
      },
    },
    valueBridge: {
      eyebrow: 'why we built this',
      headline: <>Your data, on your terms — <KO>including programmatically</KO>.</>,
      body: 'Most platforms lock your data in. synth ships an API so you can read, write, export, and build on top of your tenant. Auth via API key, scoped to your athletes, rate-limited generously.',
    },
    capabilities: {
      eyebrow: 'endpoints',
      title: 'What you can do.',
      coreCapabilities: [
        { title: 'Auth & scopes', body: 'Per-tenant API key, scoped permissions, audit log. Athletes can issue read-only keys.' },
        { title: 'Athlete reads', body: 'Full athlete profile, current readiness, recent sessions, PR history.' },
        { title: 'Session reads', body: 'Every session synth has on file, normalized to one schema across every connector.' },
        { title: 'Writes', body: 'POST a workout, a check-in, a custom metric. Goes into the same warehouse as native data.' },
        { title: 'Webhooks', body: 'Subscribe to events: new flag, new PR, sync completed. We push, you react.' },
        { title: 'Research export', body: 'Anonymized batch export for IRB-approved research. CSV, Parquet, or JSON.' },
        { title: 'Rate limits', body: 'Generous: 1,000 req/min default. Higher tiers on request.' },
      ],
    },
    closing: {
      headline: <>Build on <KO>your own data</KO>.</>,
      body: 'API access is included in Athlete Pro and all Team tiers. Request a key and we\'ll send you the docs.',
      primary: { label: 'request access', to: 'mailto:supportsynth@gmail.com' },
      secondary: { label: 'see the platform', to: '/platform' },
    },
  },
}
