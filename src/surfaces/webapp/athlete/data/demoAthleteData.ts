export const DEMO_LINEUP_PUBLISHED = true

export const DEMO_ATHLETE_PROFILE = {
  name: 'Sloane Carrow',
  team: "Pacific Women's Rowing",
  side: 'Port',
  status: 'Active',
  year: 'Sophomore',
}

export const TODAY_STATUS_SENTENCE =
  "Race day in 2 days. You've trained 23 sessions this month and your splits are trending down. Trust the work."

export const TODAY_META = {
  dateLabel: 'Friday, April 24',
  raceCountdown: {
    title: 'Pacific Invite Regatta',
    date: 'Saturday, Apr 26',
    reportTime: '5:30 AM',
    location: 'Oakland Estuary',
    daysAway: 2,
    boat: 'V8',
    seat: '3',
    side: 'Port',
  },
}

export const TODAY_SCHEDULE = [
  { time: '6:00 AM', title: 'Practice - race pace pieces', type: 'Team' },
  { time: '10:00 AM', title: 'EECS 126', type: 'Classes' },
  { time: '12:00 PM', title: 'MATH 54', type: 'Classes' },
  { time: '2:00 PM', title: 'Midterm - EECS 126', type: 'Exam' },
  { time: '4:30 PM', title: 'Gym - S&C session', type: 'Team' },
]

export const LATEST_COACH_FEEDBACK = {
  date: 'Apr 22',
  quote:
    "Catch timing has improved since we adjusted your footplate. Still slightly late on the drive connection at high rates.",
  focusPoints: [
    { label: 'Catch timing', status: 'improved' as const },
    { label: 'Drive connection at high rates', status: 'work_on' as const },
  ],
}

export const COACH_FEEDBACK_HISTORY = [
  {
    date: 'Apr 22',
    takeaway: 'Catch timing is better; keep sharpening drive connection at high rates.',
    tags: ['Technique', 'Positive'],
    transcription:
      "Star's catch timing has improved since we adjusted her footplate. Still slightly late on the drive connection at high rates.",
  },
  {
    date: 'Apr 15',
    takeaway: 'Bow pair move looked comfortable; match rate changes faster.',
    tags: ['Technique', 'Lineup'],
    transcription:
      "Star moved to bow pair for the V8 today. Looked comfortable. Good blade work but needs to match rate changes faster.",
  },
  {
    date: 'Apr 8',
    takeaway: '2K retest is trending strong; sub-6:44 is realistic.',
    tags: ['Fitness', 'Positive'],
    transcription:
      "Star's 2K retest is looking strong in training. Should target sub 6:44 at Pacific Invite.",
  },
]

export const GOALS = [
  {
    name: '2K Target',
    target: '6:40.0',
    progressLabel: '6:44.9 - 4.9s to go',
    progress: 78,
    insight: "You've dropped 1.7s year-over-year. Sub-6:40 is within reach this block.",
  },
  {
    name: 'Gym Consistency',
    target: '4 sessions/week',
    progressLabel: '3/4 this week',
    progress: 75,
    insight: 'One more lift this week keeps you on pace.',
  },
  {
    name: 'Sleep Average',
    target: '7.5 hrs',
    progressLabel: '7.1 hrs this week',
    progress: 94,
    insight: 'Your best weeks happen when sleep is 7.5+.',
  },
]

export const ERG_PROGRESSION_POINTS = [
  { month: 'Sep', seconds: 412 },
  { month: 'Oct', seconds: 410 },
  { month: 'Nov', seconds: 408 },
  { month: 'Dec', seconds: 407 },
  { month: 'Jan', seconds: 406 },
  { month: 'Feb', seconds: 405 },
  { month: 'Mar', seconds: 404.9, pr: true, milestone: 'PR - 6:44.9, Mar 16' },
]

export const ERG_CHART_SUMMARY =
  '2K improved 1.7s year-over-year. Your fastest consistent block is this month.'

export const MONTH_SUMMARY = [
  { label: 'Sessions', value: '23', detail: 'this month' },
  { label: 'Erg meters', value: '142,800', detail: 'this month' },
  { label: 'Gym sessions', value: '11/16', detail: 'completed' },
  { label: 'Sleep avg', value: '7.1 hrs', detail: 'this week' },
]

export const FORM_VIDEOS = [
  { id: 'v1', date: 'Apr 22', title: '2K test', duration: '0:47', notes: 2 },
  { id: 'v2', date: 'Apr 18', title: 'SS r18', duration: '0:32', notes: 0 },
  { id: 'v3', date: 'Apr 10', title: 'Drills', duration: '1:05', notes: 3 },
]

export const SCORE_CAPTURE_PREVIEW = {
  testType: '2K',
  time: '6:44.9',
  split: '1:41.2',
  strokeRate: '35',
  watts: '337',
  date: 'Apr 24, 2026',
}

export const CHAT_PROMPT_CARDS = [
  'Race day is Saturday - want a race prep checklist?',
  'Your 2K dropped 1.7s this year - see the breakdown?',
  'Midterm Monday - want study + training tips?',
  'How to improve your drive connection (video)',
]

export const CHAT_DEMO_THREADS = {
  raceChecklist:
    `Here's your race day plan for Saturday:

FRIDAY NIGHT
• Pasta or rice dinner — nothing new or spicy
• Pack your bag: uni, water bottle, snacks, sunscreen
• 500ml water before bed
• Lights out by 9:30pm — aim for 8+ hours

SATURDAY MORNING (4:00 AM)
• Toast with peanut butter + banana
• Small coffee if you normally drink it
• Sip water, don't chug

AT THE VENUE
• Report: 5:30 AM, Oakland Estuary
• Your boat: V8, Seat 3 (Port)
• Warm up at 6:15, race at 7:00

You've done the work. Your last 5 pieces averaged 1:41.2. Trust it. 🚣`,
  progress:
    `Yeah — here's the proof.

Your 2K went from 6:46.6 to 6:44.9 this year. That's 1.7 seconds in 12 months.

The biggest improvement was January to March when you were doing consistent 6K base work + increasing gym volume.

Your coach says you're showing the cleanest technique in the bow four right now. If you hold this trajectory and hit your gym consistency goal (4/week), sub-6:40 by fall is realistic.

Want to set 6:40 as your official goal?`,
  midterm:
    `Midterm Monday — here's how to handle it:

SUNDAY (day before)
• Use rest day for focused study — no training guilt
• Front-load your hardest material in the morning
• Take a 30-min walk in the afternoon to reset
• Sleep by 10pm — memory consolidation happens in deep sleep

MONDAY
• Morning practice is at 6:00 — coach may go lighter (exam week)
• EECS 126 midterm at 2:00 PM
• Eat a real lunch by 12:30 — brain needs fuel
• No coffee after 1pm if you struggle with exam nerves

You've balanced this all season. You got this.`,
  driveConnection:
    `Your coach mentioned drive connection at high rates as your current focus area. Here are two resources:

🎬 Rowing Australia — Drive Connection Drill (3:12)
https://youtube.com/watch?v=example
Focus on the first 2 minutes — the drill at rate 18 is exactly what you need.

📄 "Connecting the Catch to the Drive" — Row2K
Short read on sequencing through the leg drive.

What coach means by "late on the drive connection at high rates": at rate 30+, your legs are initiating but your latch on the water is delayed by about 50ms. At rate 18, you have time to compensate. At race rate, that gap costs you run on the boat.

Try the drill from the video at rate 20, then 24, then 28. Film yourself and compare.`,
}

export const CONTENT_RECOMMENDATION = {
  title: 'Rowing Australia - Drive Connection Drill',
  length: '3:12',
  url: 'https://www.youtube.com/watch?v=Q0h4fT8E9nA',
  summary: 'Focus on the first 2 minutes; the low-rate connection drill matches your current focus.',
  thumbnail: 'Technique video',
}

export const CONNECTED_APPS = [
  {
    name: 'Concept2 Logbook',
    status: 'connected' as const,
    detail: 'Auto-syncing erg scores. 1,204 scores imported.',
  },
  {
    name: 'Strava',
    status: 'connected' as const,
    detail: 'Tracking cross-training. 4 activities this month.',
  },
  {
    name: 'Apple Health',
    status: 'connected' as const,
    detail: 'Sleep, HRV, heart rate. Updated 6h ago.',
  },
  {
    name: 'Whoop',
    status: 'available' as const,
    detail: 'Recovery and strain scores.',
  },
  {
    name: 'Garmin Connect',
    status: 'available' as const,
    detail: 'Body Battery, stress, VO2 max.',
  },
  {
    name: 'Oura Ring',
    status: 'available' as const,
    detail: 'Sleep stages, readiness, temperature.',
  },
]

export const WORKBOOK_COLUMNS = ['Side', 'Athlete', '2K', 'Avg Split', 'Watts', 'SPM']

export const WORKBOOK_SHEETS = {
  'Erg Log': [
    ['Port', 'Sloane Carrow', '6:44.9', '1:41.2', '337', '35'],
    ['Starboard', 'Freya Birchwood', '6:42.8', '1:40.7', '342', '35'],
    ['Port', 'Marnie Rothmore', '6:43.5', '1:40.9', '340', '35'],
    ['Starboard', 'Brielle Whitcombe', '6:45.1', '1:41.3', '336', '34'],
    ['Port', 'Larkin Tremaine', '6:46.3', '1:41.6', '333', '34'],
    ['Starboard', 'Delphine Brambleton', '6:47.2', '1:41.8', '331', '34'],
    ['Port', 'Odette Oakden', '6:47.8', '1:41.9', '329', '34'],
    ['Starboard', 'Marisol Ulverton', '6:48.1', '1:42.0', '328', '33'],
    ['Port', 'Maya Johnson', '6:48.4', '1:42.1', '327', '33'],
    ['Starboard', 'Ava Wright', '6:48.9', '1:42.2', '326', '33'],
    ['Port', 'Nora Patel', '6:49.2', '1:42.3', '325', '33'],
    ['Starboard', 'Sophia Lee', '6:49.8', '1:42.5', '323', '33'],
    ['Port', 'Emma Davis', '6:50.1', '1:42.6', '322', '33'],
    ['Starboard', 'Chloe Kim', '6:50.5', '1:42.7', '321', '33'],
    ['Port', 'Isabella Park', '6:51.2', '1:42.9', '319', '32'],
    ['Starboard', 'Grace Lin', '6:51.9', '1:43.0', '318', '32'],
    ['Port', 'Amelia Wong', '6:52.3', '1:43.1', '317', '32'],
    ['Starboard', 'Harper Reed', '6:53.0', '1:43.3', '315', '32'],
    ['Port', 'Zoe Turner', '6:53.7', '1:43.4', '314', '32'],
    ['Starboard', 'Hannah Scott', '6:54.4', '1:43.6', '313', '32'],
  ],
  "8.25 30'": [
    ['Port', 'Sloane Carrow', "7912", '1:53.8', '211', '20'],
    ['Starboard', 'Freya Birchwood', '8026', '1:52.2', '218', '20'],
    ['Port', 'Marnie Rothmore', '7991', '1:52.7', '216', '20'],
    ['Starboard', 'Brielle Whitcombe', '7933', '1:53.5', '212', '20'],
    ['Port', 'Larkin Tremaine', '7882', '1:54.2', '208', '20'],
    ['Starboard', 'Delphine Brambleton', '7859', '1:54.6', '206', '20'],
  ],
  "8.28 3x15'": [
    ['Port', 'Sloane Carrow', '1:49.8', '1:49.2', '1:48.9', '26'],
    ['Starboard', 'Freya Birchwood', '1:48.7', '1:48.3', '1:47.9', '27'],
    ['Port', 'Marnie Rothmore', '1:49.0', '1:48.6', '1:48.2', '27'],
    ['Starboard', 'Brielle Whitcombe', '1:49.7', '1:49.1', '1:48.8', '26'],
    ['Port', 'Larkin Tremaine', '1:50.1', '1:49.6', '1:49.2', '26'],
    ['Starboard', 'Delphine Brambleton', '1:50.3', '1:49.8', '1:49.5', '26'],
  ],
} as const

export const WORKBOOK_TABS = Object.keys(WORKBOOK_SHEETS) as Array<keyof typeof WORKBOOK_SHEETS>

export const SESSION_ENTRIES = [
  { id: 's1', date: 'Apr 24', title: 'AM race pace pieces', detail: '5x500m', splits: ['1:42.3', '1:41.8', '1:40.9', '1:41.2', '1:40.5'], notes: 'Negative split progression. Felt strong on pieces 3-5. Rate built from 32 to 36.' },
  { id: 's2', date: 'Apr 22', title: 'Steady state', detail: '3x18min', splits: ['1:50.3', '1:49.8', '1:49.1'], notes: 'Comfortable aerobic block. Focused on long drive sequencing.' },
  { id: 's3', date: 'Apr 20', title: 'Starts + high rate', detail: '12 starts', splits: ['1:39.8', '1:39.6', '1:39.4'], notes: 'Explosive first 10 strokes. Coach wanted cleaner catches in set 3.' },
  { id: 's4', date: 'Apr 18', title: 'UT2 erg', detail: "2x30'", splits: ['1:56.2', '1:55.7'], notes: 'Held target HR zone and stayed relaxed through finish.' },
  { id: 's5', date: 'Apr 16', title: 'Power 10s', detail: '3x20min', splits: ['1:48.9', '1:48.5', '1:48.2'], notes: 'Good pressure in middle ten of each piece.' },
  { id: 's6', date: 'Apr 14', title: 'Rate ladders', detail: '22/24/26/28', splits: ['1:50.8', '1:49.9', '1:49.0', '1:48.4'], notes: 'Best rhythm at 26. Late connection at 28 started to show.' },
  { id: 's7', date: 'Apr 12', title: 'Technical drills', detail: 'Pause + pick', splits: ['1:57.2', '1:56.8'], notes: 'Improved body prep timing from frontstops.' },
  { id: 's8', date: 'Apr 10', title: '2K prep pieces', detail: '4x750m', splits: ['1:43.2', '1:42.8', '1:42.4', '1:41.9'], notes: 'Last two pieces were the cleanest. Race cadence felt controlled.' },
]

export const LINEUP_ENTRIES = [
  {
    id: 'l1',
    date: 'Apr 26',
    title: 'V8 — Pacific Invite Regatta',
    athleteSummary: "You're in Seat 3 (Port) — same seat as last week",
    seats: [
      { seat: 'Bow', side: 'Port', name: 'Marnie Rothmore' },
      { seat: '2', side: 'Stbd', name: 'Brielle Whitcombe' },
      { seat: '3', side: 'Port', name: '★ Sloane Carrow', highlight: true },
      { seat: '4', side: 'Stbd', name: 'Freya Birchwood' },
      { seat: '5', side: 'Port', name: 'Larkin Tremaine' },
      { seat: '6', side: 'Stbd', name: 'Delphine Brambleton' },
      { seat: '7', side: 'Port', name: 'Odette Oakden' },
      { seat: 'Str', side: 'Stbd', name: 'Marisol Ulverton' },
      { seat: 'Cox', side: '—', name: 'Odile Ashcombe' },
    ],
  },
  {
    id: 'l2',
    date: 'Apr 19',
    title: 'V8 — Saturday pieces',
    athleteSummary: 'Seat change from 4 to 3 this week',
    seats: [
      { seat: 'Bow', side: 'Port', name: 'Marnie Rothmore' },
      { seat: '2', side: 'Stbd', name: 'Brielle Whitcombe' },
      { seat: '3', side: 'Port', name: '★ Sloane Carrow', highlight: true },
      { seat: '4', side: 'Stbd', name: 'Freya Birchwood' },
      { seat: '5', side: 'Port', name: 'Larkin Tremaine' },
      { seat: '6', side: 'Stbd', name: 'Delphine Brambleton' },
      { seat: '7', side: 'Port', name: 'Odette Oakden' },
      { seat: 'Str', side: 'Stbd', name: 'Marisol Ulverton' },
      { seat: 'Cox', side: '—', name: 'Odile Ashcombe' },
    ],
  },
]
