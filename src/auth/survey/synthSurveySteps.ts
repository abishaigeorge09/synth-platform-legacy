// The synth waitlist survey — a declarative list of steps driving the wizard in
// surveyEngine.tsx. This is the one file to edit to change the questions: the
// engine reads it and needs no changes. Ported in spirit from the student-store
// survey's STEPS pattern, shrunk to a narrow column (no picture grids).
//
// Keys map 1:1 to columns on public.waitlist (see the waitlist_survey migration
// + src/auth/waitlist.ts). Keep them in sync when you add a question.

export type SurveyStep =
  | { type: 'welcome'; title: string; sub?: string; button?: string }
  | {
      type: 'single'
      key: string
      title: string
      sub?: string
      options: string[]
      /** Show a free-text "Other" entry under the options. */
      other?: boolean
    }
  | {
      type: 'multi'
      key: string
      title: string
      sub?: string
      options: string[]
      /** Minimum selections before advancing. */
      min?: number
    }
  | {
      type: 'dropdown'
      key: string
      title: string
      sub?: string
      options: string[]
      placeholder?: string
      other?: boolean
      /** Optional questions can be skipped. */
      optional?: boolean
    }
  | {
      type: 'email'
      key: string
      title: string
      sub?: string
      placeholder?: string
      /** Marks the final step — completing it submits the survey. */
      submit: true
    }

/** A broad, one-tap sport list. "Other" opens a free-text field. */
export const SPORTS = [
  'Rowing',
  'Running',
  'Football (Soccer)',
  'American Football',
  'Basketball',
  'Cricket',
  'Swimming',
  'Cycling',
  'Track & Field',
  'Tennis',
  'Field Hockey',
  'Volleyball',
] as const

/** Indian + global universities, type-to-search, with an Other free-text. */
export const UNIVERSITIES = [
  'SRM Institute of Science and Technology',
  'VIT (Vellore Institute of Technology)',
  'Manipal Academy of Higher Education',
  'Amity University',
  'IIT Bombay',
  'IIT Delhi',
  'IIT Madras',
  'IIT Kharagpur',
  'BITS Pilani',
  'Delhi University',
  'Anna University',
  'Christ University',
  'Ashoka University',
  'University of Mumbai',
  'Jadavpur University',
  'University of California, Berkeley',
  'Stanford University',
  'Harvard University',
  'University of Oxford',
  'University of Cambridge',
  'University of Washington',
  'Yale University',
  'Princeton University',
] as const

export const SYNTH_SURVEY: SurveyStep[] = [
  {
    type: 'welcome',
    title: 'Get early access to synth',
    sub: 'Every signal, one platform. Answer a few quick taps and claim your free Wispr Pro.',
    button: 'Start',
  },
  {
    type: 'single',
    key: 'sport',
    title: 'Which sport is yours?',
    options: [...SPORTS],
    other: true,
  },
  {
    type: 'single',
    key: 'role',
    title: 'You are a…',
    options: ['Athlete', 'Coach', 'Both'],
  },
  {
    type: 'dropdown',
    key: 'university',
    title: 'School or club?',
    sub: 'Optional. Helps us prioritise where to launch.',
    options: [...UNIVERSITIES],
    placeholder: 'Search or type your own',
    other: true,
    optional: true,
  },
  {
    type: 'single',
    key: 'wearable',
    title: 'Do you train with a wearable?',
    options: ['Whoop', 'Garmin', 'Apple Watch', 'Coros', 'No', 'Want one'],
  },
  {
    type: 'multi',
    key: 'tools',
    title: 'What do you use to track today?',
    sub: 'Pick all that apply.',
    options: [
      'Google Sheets or Excel',
      "Coach's spreadsheet",
      'Strava',
      'TrainingPeaks',
      'Concept2 / erg logbook',
      'Notes app',
      'Nothing yet',
    ],
    min: 1,
  },
  {
    type: 'multi',
    key: 'track_wants',
    title: 'What would you love to track?',
    sub: 'Pick all that apply.',
    options: [
      'Performance results',
      'Recovery & sleep',
      'Wellness & soreness',
      'Training load',
      'Injury risk',
      'Lineups / roster',
      'Nutrition',
      'Everything',
    ],
    min: 1,
  },
  {
    type: 'single',
    key: 'dimensionality',
    title: 'How much in one place?',
    options: [
      'Just my key numbers',
      'A few connected signals',
      'Everything, fully synthesized',
    ],
  },
  {
    type: 'email',
    key: 'email',
    title: "You're almost in",
    sub: 'Drop your email to lock your spot and your free Wispr Pro.',
    placeholder: 'you@example.com',
    submit: true,
  },
]
