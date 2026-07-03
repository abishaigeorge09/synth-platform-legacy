import { KO } from '../shell/primitives'
import type { SportPageConfig } from '../templates/SportPage'

export const SPORT_CONFIGS: Record<string, SportPageConfig> = {
  /* ─── Running ──────────────────────────────────────────────────────── */
  running: {
    slug: 'running',
    hero: {
      eyebrow: 'for runners who train serious',
      headline: <>Synth for <KO>runners</KO></>,
      subhead: 'Sub-3 marathons, sub-18 5Ks, ultra build-ups. synth pulls every mile, every heart-rate dip, every soreness check-in — and tells you when to push and when to back off.',
      primaryCta: { label: 'start free', to: '/signup' },
      secondaryCta: { label: 'see a real plan', to: '/coach/dashboard' },
      media: {
        kind: 'photo',
        label: 'Amateur runner at dawn — road, trail, or track',
        caption: 'A real photo of a non-pro runner mid-stride. Not a brand-deal influencer.',
      },
    },
    manifesto: {
      eyebrow: 'why synth for running',
      headline: <>The plan you <KO>wrote</KO> vs. the plan you <KO>ran</KO>.</>,
      body: 'Your plan lives in a spreadsheet. Strava tracks the run. synth holds both side-by-side and surfaces the gap. Whoop says you slept badly? Your easy day stays easy. HRV says you\'re ready? Your interval day stays on.',
      media: {
        kind: 'screenshot',
        label: 'Runner dashboard — weekly load, pace history, race countdown',
        caption: 'Screenshot of a runner\'s synth dashboard.',
      },
    },
    capabilities: {
      eyebrow: 'capabilities',
      title: 'What synth does for runners.',
      items: [
        { title: 'Strava + your plan unified', body: 'Every run, every prescription — in one log, normalized to pace, HR zones, and TSS.' },
        { title: 'Race countdown view', body: 'Your goal race, your taper, your peak. synth orchestrates the last 8 weeks.' },
        { title: 'Threshold + zone tracking', body: 'Your tempo pace, your interval pace, your long-run pace — auto-detected from your data.' },
        { title: 'Recovery readiness', body: 'HRV + sleep + soreness. One number that tells you "go hard," "easy," or "rest."' },
        { title: 'Injury history', body: 'IT band, plantar, calf strain — synth tracks the niggle through to return-to-train.' },
        { title: 'Weekly load + ramp', body: 'Acute:chronic ratio applied to running. No more silent overtraining.' },
        { title: 'PR engine', body: 'Every distance, every surface. 5K, 10K, half, marathon, vertical k.' },
        { title: 'Ask synth', body: '"Am I ready for the long run Saturday?" Sourced answer, citing your week.' },
      ],
    },
    closing: {
      headline: <>Train smarter. <KO>race faster.</KO></>,
      body: 'Free during the alpha. $9/mo Athlete, $19/mo Athlete Pro.',
      primary: { label: 'start free', to: '/signup' },
      secondary: { label: 'see pricing', to: '/pricing' },
    },
  },

  /* ─── Cycling ─────────────────────────────────────────────────────── */
  cycling: {
    slug: 'cycling',
    hero: {
      eyebrow: 'for cyclists who train with power',
      headline: <>Synth for <KO>cyclists</KO></>,
      subhead: 'FTP, threshold, VO2 — synth pulls every watt from Strava and Garmin. One dashboard for the rider who wants more than a leaderboard.',
      primaryCta: { label: 'start free', to: '/signup' },
      secondaryCta: { label: 'see the dashboard', to: '/coach/dashboard' },
      media: {
        kind: 'photo',
        label: 'Amateur cyclist on indoor trainer or outdoor ride',
        caption: 'Real cyclist context — trainer setup, gravel ride, or roadie group.',
      },
    },
    manifesto: {
      eyebrow: 'why synth for cycling',
      headline: <>The watts you held. The recovery you <KO>actually got</KO>.</>,
      body: 'Power meters are honest. Recovery is what most riders get wrong. synth holds your power data and your recovery signals in one view so you stop training tired.',
    },
    capabilities: {
      eyebrow: 'capabilities',
      title: 'What synth does for cyclists.',
      items: [
        { title: 'Strava + Garmin unified', body: 'Indoor and outdoor in one log. Power, HR, cadence, elevation, weather.' },
        { title: 'FTP tracking', body: 'Auto-detected from your hardest 20-minute efforts. History over time.' },
        { title: 'Acute:chronic load', body: 'TSS-based load management. Periodize by feel and by math.' },
        { title: 'Plan vs actual side-by-side', body: 'Your prescribed workouts (Sheets or AI Import from any program) vs your actual execution.' },
        { title: 'Recovery readiness', body: 'HRV + sleep before that hard interval set. Worth knowing.' },
        { title: 'Climbing & flat segment analysis', body: 'Track power-to-weight on climbs and W\' on flats.' },
        { title: 'PR engine', body: '1-min, 5-min, 20-min peak power. Best longest ride. Best climb.' },
        { title: 'Ask synth', body: '"Am I fit enough for the Tour Friday?" — sourced answer.' },
      ],
    },
    closing: {
      headline: <>Power data deserves a <KO>better home</KO>.</>,
      primary: { label: 'start free', to: '/signup' },
      secondary: { label: 'see pricing', to: '/pricing' },
    },
  },

  /* ─── Swimming ────────────────────────────────────────────────────── */
  swimming: {
    slug: 'swimming',
    hero: {
      eyebrow: 'for swimmers — pool and open water',
      headline: <>Synth for <KO>swimmers</KO></>,
      subhead: 'Pool sets, open-water swims, dry-land work, and the recovery in between. synth pulls every set from Apple Watch, Garmin, and your coach\'s set sheet — in one log.',
      primaryCta: { label: 'start free', to: '/signup' },
      secondaryCta: { label: 'see the dashboard', to: '/coach/dashboard' },
      media: {
        kind: 'photo',
        label: 'Amateur swimmer — lap pool or open water training',
        caption: 'A real masters / amateur swimmer mid-set. Not Olympic broadcast.',
      },
    },
    manifesto: {
      eyebrow: 'why synth for swimming',
      headline: <>Every interval. Every <KO>send-off</KO>.</>,
      body: 'Most swim apps stop at the lap timer. synth holds the full picture: the set your coach wrote, the splits you actually hit, the heart-rate response, the recovery the next morning.',
    },
    capabilities: {
      eyebrow: 'capabilities',
      title: 'What synth does for swimmers.',
      items: [
        { title: 'Pool + open water unified', body: 'Apple Watch + Garmin + Apple Health — synth reads them all into one log.' },
        { title: 'Set & interval planning', body: 'Coach writes the set. synth pushes it to your watch. You execute. Splits come back.' },
        { title: 'Recovery readiness', body: 'Especially important for swimmers — shoulder soreness, sleep, training-week stress.' },
        { title: 'Dry-land + pool combined', body: 'Lifting, mobility, S&C — all in the same log as your meters.' },
        { title: 'PR engine', body: 'Every distance, every stroke, every meet. Course-corrected over time.' },
        { title: 'Meet countdown & taper view', body: 'Your taper, two weeks out, in one panel.' },
        { title: 'Soreness mapping', body: 'Shoulder, lower back, hip. A body-map that the next training day reads.' },
        { title: 'Ask synth', body: '"Is my taper landing this week?" — sourced answer.' },
      ],
    },
    closing: {
      headline: <>Train every set. <KO>own every meet.</KO></>,
      primary: { label: 'start free', to: '/signup' },
      secondary: { label: 'see pricing', to: '/pricing' },
    },
  },

  /* ─── Rowing ──────────────────────────────────────────────────────── */
  rowing: {
    slug: 'rowing',
    hero: {
      eyebrow: 'built by rowers, for rowers',
      headline: <>Synth for <KO>rowing</KO></>,
      subhead: 'The platform synth was born in. 2K erg PRs, on-water sessions, Concept2 Logbook, video review, lineup builds, race-week tapers. From masters program to D1 varsity, synth knows rowing.',
      primaryCta: { label: 'start free', to: '/signup' },
      secondaryCta: { label: 'see a team demo', to: '/coach/dashboard' },
      media: {
        kind: 'photo',
        label: 'Amateur rowing — erg row, on-water single, club practice',
        caption: 'A real amateur rower context: dawn launch, ergs in a basement, club shed.',
      },
    },
    manifesto: {
      eyebrow: 'why synth for rowing',
      headline: <>Every <KO>2K</KO>. Every <KO>seat race</KO>. Every <KO>lineup</KO>.</>,
      body: 'Concept2 Logbook + the on-water session + the coach\'s spreadsheet + the wellness check-in + the video review. Five tools, one screen — and a lineup builder that writes back to your boat sheet.',
      media: {
        kind: 'screenshot',
        label: 'Rowing dashboard — 2K PRs, lineups, seat-race view',
        caption: 'Pacific Women\'s-style dashboard screenshot.',
      },
    },
    capabilities: {
      eyebrow: 'capabilities',
      title: 'What synth does for rowing.',
      items: [
        { title: 'Concept2 Logbook sync', body: 'Every erg piece, every steady state, every test. Auto-pulled, normalized.' },
        { title: '2K test tracking', body: 'Splits, stroke rates, watts, predicted-2K — over months and years.' },
        { title: 'Seat-race view', body: 'A/B seats over multiple pieces, with body-weight and rate normalization.' },
        { title: 'Lineup builder', body: 'Drag-and-drop with 2K, body weight, wellness in view. Writes to Google Sheets.' },
        { title: 'On-water session timer', body: 'Race-day stopwatch with splits per 500. Exports back to the team sheet.' },
        { title: 'Video form review', body: 'Side-by-side video with timestamps tied to the session log.', hint: 'coming Q3 2026' },
        { title: 'Race-week taper view', body: 'Plan for IRA, Eastern Sprints, Henley. Visible to the boat.' },
        { title: 'Recovery & wellness', body: 'Daily check-in. Coach sees the day\'s availability at a glance.' },
      ],
    },
    quote: {
      quote: 'synth flagged my HRV drop a week before I would have. We pulled back load that Tuesday — race weekend was still on.',
      attribution: 'Star Miller',
      role: 'Cal Women\'s Rowing · AUS U23',
    },
    closing: {
      headline: <>Built by rowers. <KO>for rowers.</KO></>,
      body: 'Free for athletes during the alpha. Teams start at $199/mo.',
      primary: { label: 'start free', to: '/signup' },
      secondary: { label: 'team demo', to: '/coach/dashboard' },
    },
  },

  /* ─── Lifting / Strength ─────────────────────────────────────────── */
  lifting: {
    slug: 'lifting',
    hero: {
      eyebrow: 'for the gym athlete',
      headline: <>Synth for <KO>lifters</KO></>,
      subhead: 'Powerlifters, Olympic lifters, CrossFit boxes, hybrid athletes. synth pulls every set from your Notion log, your training spreadsheet, or a photo of your paper logbook — and tracks PRs across every modality.',
      primaryCta: { label: 'start free', to: '/signup' },
      secondaryCta: { label: 'see the dashboard', to: '/coach/dashboard' },
      media: {
        kind: 'photo',
        label: 'Amateur lifter in a regular gym',
        caption: 'Real gym context — barbell on the floor, plates, chalk. Not a glossy editorial.',
      },
    },
    manifesto: {
      eyebrow: 'why synth for lifting',
      headline: <>Every <KO>PR</KO>. Every <KO>cycle</KO>.</>,
      body: 'Lifting apps are great at counting sets. They\'re bad at telling you whether the volume you ran in March produced the PRs you hit in May. synth holds the long arc — cycles, peaks, deloads — and connects it to your recovery and your sleep.',
    },
    capabilities: {
      eyebrow: 'capabilities',
      title: 'What synth does for lifters.',
      items: [
        { title: 'Spreadsheet + AI Import', body: 'Your cycle lives in Sheets or a photo of paper. synth reads either, parses sets, and writes execution back.' },
        { title: 'Big-three PR engine', body: 'Squat, bench, deadlift — across every program you\'ve ever run.' },
        { title: 'Olympic lift tracking', body: 'Snatch, C&J, complexes — with technical-quality notes.' },
        { title: 'Cycle / peak / deload visualization', body: 'See your last 12 months as one arc, not 30 separate sessions.' },
        { title: 'Volume × intensity dashboard', body: 'Tonnage, average intensity, sets at RPE 8+. The numbers your coach actually reads.' },
        { title: 'Recovery readiness', body: 'Bar speed dropping at the same weight? synth catches it before the missed lift.' },
        { title: 'Form video log', body: 'Drop a lift video, sync it to the set in synth. Self-review later.' },
        { title: 'Hybrid athlete view', body: 'Combine lifting load with run miles or ride watts. Useful for hybrid programs.' },
      ],
    },
    closing: {
      headline: <>Build the cycle. <KO>own the PR.</KO></>,
      primary: { label: 'start free', to: '/signup' },
      secondary: { label: 'see pricing', to: '/pricing' },
    },
  },

  /* ─── Teams ──────────────────────────────────────────────────────── */
  teams: {
    slug: 'teams',
    hero: {
      eyebrow: 'for clubs, schools, and programs',
      headline: <>Synth for <KO>teams</KO></>,
      subhead: 'For coaches running 5 to 500 athletes. Lineups, scheduling, attendance, two-way sync to your existing tools, and athlete-level visibility into every signal — without the enterprise price tag or the migration nightmare.',
      primaryCta: { label: 'talk to us', to: 'https://cal.com/abishai-gosula-oilvxc/book-a-call' },
      secondaryCta: { label: 'see a team demo', to: '/coach/dashboard' },
      media: {
        kind: 'photo',
        label: 'Coach with team — practice context',
        caption: 'Coach on a tablet with athletes around. Practice, not stadium broadcast.',
      },
    },
    manifesto: {
      eyebrow: 'how synth lands into a team',
      headline: <>Zero <KO>migration</KO>. Zero <KO>rip-and-replace</KO>.</>,
      body: 'Most programs use 4–7 tools and a whiteboard. synth reads from them, writes back to them, and never asks anyone to migrate. Your assistant coaches keep their spreadsheets. Your athletes keep their wearables. You get one screen.',
      media: {
        kind: 'screenshot',
        label: 'Coach dashboard — roster + wellness + lineups + alerts',
        caption: 'The current /coach/dashboard surface.',
      },
    },
    capabilities: {
      eyebrow: 'capabilities',
      title: 'Run the program from one screen.',
      items: [
        { title: 'Full roster sync', body: 'Every athlete, contact, position, eligibility. Two-way sync to your roster spreadsheet.' },
        { title: 'Lineup builder', body: 'Drag-and-drop with PR + wellness + attendance in view. Writes back to Sheets.' },
        { title: 'Session timer', body: 'Race-day stopwatch with splits. Exports back to your spreadsheet.' },
        { title: 'Daily wellness check-in', body: '15-second form on every athlete\'s phone. Coach sees the team in one glance.' },
        { title: 'Calendar across squads', body: 'JV, varsity, masters group — all color-coded on one calendar.' },
        { title: 'Compliance & eligibility', body: 'GPA, registration, age-bracket. Surfaced in the roster.' },
        { title: 'Assistant-coach permissions', body: 'Per-athlete, per-metric visibility. You decide who sees what.' },
        { title: 'Athlete-facing app', body: 'Athletes see only what you allow. Schedules, lineups, feedback, their own data.' },
      ],
    },
    closing: {
      headline: <>Programs of any size. <KO>One tier per stage.</KO></>,
      body: '$199/mo Team for ≤30 athletes. $499/mo Team+ for ≤100. Collegiate from $15K/year.',
      primary: { label: 'talk to us', to: 'https://cal.com/abishai-gosula-oilvxc/book-a-call' },
      secondary: { label: 'see pricing', to: '/pricing' },
    },
  },
}
