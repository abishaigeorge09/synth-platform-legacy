/**
 * Declarative tour registry. Each tour is bound to one route. A step targets a
 * DOM element by `data-tour="<anchor>"`. Placement is a hint — the overlay will
 * auto-flip if the chosen side would clip the viewport.
 *
 * Adding a new tour:
 *   1. Add a `data-tour="my-anchor"` attribute on the JSX element you want to
 *      point at (additive only — no other change to the page).
 *   2. Add an entry below with `route` matching the React Router path and a
 *      `steps[]` array referencing the anchors you added.
 */

export type Placement = 'top' | 'bottom' | 'left' | 'right' | 'auto'

export type TourStep = {
  anchor: string
  title: string
  body: string
  placement?: Placement
}

export type Tour = {
  id: string
  /** Exact React Router pathname this tour belongs to. Use `routeMatch` for params. */
  route: string
  /** Optional regex/function for routes with params (e.g. /coach/athlete/:id). */
  routeMatch?: (pathname: string) => boolean
  /** Auto-fire on first visit. False = manual replay only. */
  autoStart: boolean
  steps: TourStep[]
}

export const TOURS: Tour[] = [
  // ─── Coach ──────────────────────────────────────────────────────────────
  {
    id: 'coachHome',
    route: '/app/coach/home',
    autoStart: true,
    steps: [
      {
        anchor: 'coach-home-greeting',
        title: 'Your daily snapshot',
        body: "Quick read on the team — recovery, attention, what shipped today. We'll point you to what matters most each morning.",
        placement: 'bottom',
      },
      {
        anchor: 'coach-home-stats-button',
        title: 'Open vital signs',
        body: "Tap to expand: avg recovery, sessions logged, 2K trend, volume. It's your full team dashboard in one tap.",
        placement: 'bottom',
      },
      {
        anchor: 'coach-home-race-countdown',
        title: 'Race countdown',
        body: "Days to your next race, who's in the boat, where to be, when to report.",
        placement: 'top',
      },
      {
        anchor: 'coach-home-schedule',
        title: 'Week at a glance',
        body: 'Drag a session to reschedule. Tap to drill into details and see who attended.',
        placement: 'top',
      },
    ],
  },
  {
    id: 'coachAttention',
    route: '/app/coach/attention',
    autoStart: true,
    steps: [
      {
        anchor: 'coach-attention-row',
        title: 'Flagged athletes',
        body: 'Each row is an athlete whose metric broke baseline — soreness, sleep, HRV, missed practice. Newest flags on top.',
        placement: 'bottom',
      },
      {
        anchor: 'coach-attention-tap',
        title: 'Tap to drill in',
        body: "Open the athlete's full picture — biometrics, notes, lineups, recent sessions — without leaving Attention.",
        placement: 'bottom',
      },
    ],
  },
  {
    id: 'coachRoster',
    route: '/app/coach/roster',
    autoStart: true,
    steps: [
      {
        anchor: 'coach-roster-search',
        title: 'Find anyone fast',
        body: 'Type a name, side (port/starboard), or attribute (rookie, captain). Filters narrow as you type.',
        placement: 'bottom',
      },
      {
        anchor: 'coach-roster-card',
        title: 'Athlete cards',
        body: 'Recovery, latest session, and a quick PR badge. Tap to drill in.',
        placement: 'bottom',
      },
    ],
  },
  {
    id: 'coachAthleteDetail',
    route: '/app/coach/athlete',
    routeMatch: (p) => p.startsWith('/app/coach/athlete/'),
    autoStart: true,
    steps: [
      {
        anchor: 'coach-athlete-tabs',
        title: "Everything about one athlete",
        body: 'Switch between Performance, Wellness, Notes, and Lineups — all on one page.',
        placement: 'bottom',
      },
      {
        anchor: 'coach-athlete-notes',
        title: 'Notes timeline',
        body: 'Voice memos and quick notes you captured land here, attributed by date and source.',
        placement: 'top',
      },
    ],
  },
  {
    id: 'coachCapture',
    route: '/app/coach/capture',
    autoStart: true,
    steps: [
      {
        anchor: 'coach-capture-voice',
        title: 'Voice memo',
        body: 'Hold to record. We transcribe + tag the right athlete automatically.',
        placement: 'top',
      },
      {
        anchor: 'coach-capture-photo',
        title: 'Photo capture',
        body: 'Whiteboard, lineup card, score sheet — snap once and synth pulls the data.',
        placement: 'top',
      },
      {
        anchor: 'coach-capture-note',
        title: 'Quick note',
        body: 'Type a short observation. Mention an athlete with @ to attribute it.',
        placement: 'top',
      },
      {
        anchor: 'coach-capture-recent',
        title: 'Recent captures',
        body: "Everything you've captured today, with transcripts and the athlete it landed against.",
        placement: 'top',
      },
    ],
  },
  {
    id: 'coachAI',
    route: '/app/coach/ai',
    autoStart: true,
    steps: [
      {
        anchor: 'coach-ai-scope',
        title: 'Pick a scope',
        body: "Talk to your team or to one athlete — synth only answers from data inside the scope.",
        placement: 'bottom',
      },
      {
        anchor: 'coach-ai-customize',
        title: 'Tone + context',
        body: 'Race-day, recovery focus, or neutral coach. Decide which signals synth pulls in — lineups, wellness, notes.',
        placement: 'bottom',
      },
      {
        anchor: 'coach-ai-history',
        title: 'Past chats',
        body: 'Every prior thread with synth. for this scope. Pick one up where you left off.',
        placement: 'bottom',
      },
      {
        anchor: 'coach-ai-input',
        title: 'Ask anything',
        body: 'Try: "Who looks tired this week?" or "Draft an email to parents about Saturday\'s race."',
        placement: 'top',
      },
    ],
  },
  {
    id: 'coachNotes',
    route: '/app/coach/notes',
    autoStart: true,
    steps: [
      {
        anchor: 'coach-notes-add',
        title: 'Capture a note',
        body: 'Type or dictate. Mention an athlete with @ — synth attributes it for you.',
        placement: 'bottom',
      },
      {
        anchor: 'coach-notes-row',
        title: 'Every observation, in context',
        body: 'Each card shows the athlete, the moment, and the original recording or text.',
        placement: 'bottom',
      },
    ],
  },
  {
    id: 'coachSources',
    route: '/app/coach/sources',
    autoStart: true,
    steps: [
      {
        anchor: 'coach-sources-card',
        title: 'Connectors',
        body: 'Each tile is a data source synth pulls from. Status dot tells you if it is healthy.',
        placement: 'bottom',
      },
      {
        anchor: 'coach-sources-grant',
        title: 'Grant access',
        body: "Tap to authenticate or re-authenticate a source. Most take less than a minute.",
        placement: 'top',
      },
    ],
  },
  {
    id: 'coachSettings',
    route: '/app/coach/settings',
    autoStart: true,
    steps: [
      {
        anchor: 'coach-settings-invite',
        title: 'Team invite code',
        body: 'Share this with athletes joining your team. Tap to copy.',
        placement: 'bottom',
      },
      {
        anchor: 'coach-settings-notif',
        title: 'Notification prefs',
        body: 'Daily summary, attention alerts — pick what hits your phone vs. lives in the app.',
        placement: 'bottom',
      },
      {
        anchor: 'coach-settings-replay',
        title: 'Replay tutorials',
        body: 'Forgot a feature? Replay any walkthrough or reset them all to fire again on first visit.',
        placement: 'top',
      },
    ],
  },

  // ─── Athlete ────────────────────────────────────────────────────────────
  {
    id: 'athleteHome',
    route: '/app/athlete/home',
    autoStart: true,
    steps: [
      {
        anchor: 'athlete-home-status',
        title: "Today's read",
        body: "Green light, amber, or red — synth combines sleep, HRV, soreness, and your coach's plan into one signal.",
        placement: 'bottom',
      },
      {
        anchor: 'athlete-home-stats-button',
        title: 'Your week',
        body: 'Best 2K, recovery trend, streak — your personal dashboard, one tap away.',
        placement: 'bottom',
      },
      {
        anchor: 'athlete-home-candy-plan',
        title: "Today's plan",
        body: "What coach has scheduled, with target paces and notes attached.",
        placement: 'top',
      },
      {
        anchor: 'athlete-home-candy-pacer',
        title: 'Erg pacer',
        body: 'Pacing target for your next erg piece, calibrated to your recent splits.',
        placement: 'top',
      },
    ],
  },
  {
    id: 'athleteCapture',
    route: '/app/athlete/capture',
    autoStart: true,
    steps: [
      {
        anchor: 'athlete-capture-form-video',
        title: 'Form video',
        body: 'Side-on clip, 10 to 20 seconds. Coach sees it next to your splits.',
        placement: 'top',
      },
      {
        anchor: 'athlete-capture-erg',
        title: 'Log an erg score',
        body: 'Snap the screen — we OCR the split, distance, and watts. Or type it in.',
        placement: 'top',
      },
      {
        anchor: 'athlete-capture-wellness',
        title: 'Daily wellness',
        body: 'Sleep, soreness, stress. Two taps. Coach sees patterns over time.',
        placement: 'top',
      },
    ],
  },
  {
    id: 'athleteErgPacer',
    route: '/app/athlete/erg-pacer',
    autoStart: true,
    steps: [
      {
        anchor: 'athlete-pacer-target',
        title: 'Target pace',
        body: "Calibrated to your last 5 efforts. Adjust if today's plan calls for harder or easier.",
        placement: 'bottom',
      },
      {
        anchor: 'athlete-pacer-chart',
        title: 'Live overlay',
        body: 'Your split vs the target line, refreshed each stroke once you connect the erg.',
        placement: 'top',
      },
    ],
  },
  {
    id: 'athleteAI',
    route: '/app/athlete/ai',
    autoStart: true,
    steps: [
      {
        anchor: 'athlete-ai-customize',
        title: 'Tone + context',
        body: 'Race-day pep talk, recovery check-in, or honest read. Decide what synth sees — lineups, wellness, splits.',
        placement: 'bottom',
      },
      {
        anchor: 'athlete-ai-history',
        title: 'Past chats',
        body: 'Pick up an old conversation right where you left off.',
        placement: 'bottom',
      },
      {
        anchor: 'athlete-ai-input',
        title: 'Ask anything',
        body: 'Try: "How should I taper this week?" or "Why does my catch feel late?"',
        placement: 'top',
      },
    ],
  },
  {
    id: 'athleteNotes',
    route: '/app/athlete/notes',
    autoStart: true,
    steps: [
      {
        anchor: 'athlete-notes-row',
        title: "Notes from your coach",
        body: "Everything coach has shared with you, newest first. Each card carries the moment it was captured.",
        placement: 'bottom',
      },
    ],
  },
  {
    id: 'athleteSources',
    route: '/app/athlete/sources',
    autoStart: true,
    steps: [
      {
        anchor: 'athlete-sources-card',
        title: 'Your data sources',
        body: 'Concept2, Strava, Whoop, Apple Health. Connect them so synth and your coach see one picture.',
        placement: 'bottom',
      },
      {
        anchor: 'athlete-sources-grant',
        title: 'Grant access',
        body: 'One-tap auth. You always control what coach sees in Settings → Privacy.',
        placement: 'top',
      },
    ],
  },
  {
    id: 'athleteSettings',
    route: '/app/athlete/settings',
    autoStart: true,
    steps: [
      {
        anchor: 'athlete-settings-notif',
        title: 'Notifications',
        body: 'Lineup changes, PR alerts, session results — pick what wakes your phone.',
        placement: 'bottom',
      },
      {
        anchor: 'athlete-settings-replay',
        title: 'Replay tutorials',
        body: 'Need a refresher? Replay any walkthrough or reset them all so they auto-fire again.',
        placement: 'top',
      },
    ],
  },
]

/** Find the tour for a given pathname (or null if no tour is bound). */
export function getTourForPath(pathname: string): Tour | null {
  for (const tour of TOURS) {
    if (tour.routeMatch) {
      if (tour.routeMatch(pathname)) return tour
    } else if (tour.route === pathname) {
      return tour
    }
  }
  return null
}

export function getTourById(id: string): Tour | null {
  return TOURS.find((t) => t.id === id) ?? null
}
