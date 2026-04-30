/**
 * Seed calendar events for the next 30 days (Apr 25 – May 25, 2026).
 * In production these come from google_calendar connector + manual entries.
 */

export interface CalendarEvent {
  id: string
  date: string // ISO
  endDate?: string
  title: string
  type: 'practice' | 'regatta' | 'travel' | 'rest' | 'meeting' | 'gym'
  location?: string
  notes?: string
}

export const SEED_CALENDAR: CalendarEvent[] = [
  // ── Regatta: Pacific Invite ────────────────────────────────────────────────
  {
    id: 'cal-1',
    date: '2026-04-26T07:00:00Z',
    endDate: '2026-04-26T15:00:00Z',
    title: 'Pacific Invite Regatta',
    type: 'regatta',
    location: 'Briones Reservoir, Orinda CA',
    notes: '1V, 2V, V4+ entries. Call time 5:45 AM.',
  },

  // ── Week of Apr 27 ─────────────────────────────────────────────────────
  {
    id: 'cal-2',
    date: '2026-04-27T00:00:00Z',
    title: 'Rest day',
    type: 'rest',
    notes: 'Post-regatta recovery. Light stretching only.',
  },
  {
    id: 'cal-3',
    date: '2026-04-28T06:00:00Z',
    endDate: '2026-04-28T08:00:00Z',
    title: 'AM practice — steady state',
    type: 'practice',
    location: 'Oakland Estuary',
    notes: '3×20 min SS at 18–20 spm.',
  },
  {
    id: 'cal-4',
    date: '2026-04-29T06:00:00Z',
    endDate: '2026-04-29T08:00:00Z',
    title: 'AM practice — technique focus',
    type: 'practice',
    location: 'Oakland Estuary',
    notes: 'Pause drills + ratio work. Video review after.',
  },
  {
    id: 'cal-5',
    date: '2026-04-29T15:00:00Z',
    endDate: '2026-04-29T16:30:00Z',
    title: 'Gym — upper body & core',
    type: 'gym',
    location: 'Simpson Center, Berkeley',
    notes: 'Bench pull, overhead press, plank series.',
  },
  {
    id: 'cal-6',
    date: '2026-04-30T06:00:00Z',
    endDate: '2026-04-30T08:00:00Z',
    title: 'AM practice — race pieces',
    type: 'practice',
    location: 'Oakland Estuary',
    notes: '4×500m race pace with 3 min rest.',
  },

  // ── Week of May 4 ──────────────────────────────────────────────────────
  {
    id: 'cal-7',
    date: '2026-05-01T06:00:00Z',
    endDate: '2026-05-01T08:00:00Z',
    title: 'AM practice — starts & settling',
    type: 'practice',
    location: 'Oakland Estuary',
    notes: 'Start sequences + settle to race rate.',
  },
  {
    id: 'cal-8',
    date: '2026-05-02T06:00:00Z',
    endDate: '2026-05-02T08:00:00Z',
    title: 'AM practice — steady state',
    type: 'practice',
    location: 'Oakland Estuary',
    notes: '2×30 min UT1. Focus on length.',
  },
  {
    id: 'cal-9',
    date: '2026-05-03T00:00:00Z',
    title: 'Rest day',
    type: 'rest',
    notes: 'Active recovery — optional yoga.',
  },
  {
    id: 'cal-10',
    date: '2026-05-04T06:00:00Z',
    endDate: '2026-05-04T08:00:00Z',
    title: 'AM practice — 6K pieces',
    type: 'practice',
    location: 'Oakland Estuary',
    notes: '1×6K race pace buildup. Last long piece before Pac-12.',
  },
  {
    id: 'cal-11',
    date: '2026-05-05T15:00:00Z',
    endDate: '2026-05-05T16:30:00Z',
    title: 'Gym — legs & posterior chain',
    type: 'gym',
    location: 'Simpson Center, Berkeley',
    notes: 'Trap bar DL, step-ups, hamstring curls.',
  },

  // ── Pac-12 week ────────────────────────────────────────────────────────
  {
    id: 'cal-12',
    date: '2026-05-06T06:00:00Z',
    endDate: '2026-05-06T07:30:00Z',
    title: 'AM practice — shakeout',
    type: 'practice',
    location: 'Oakland Estuary',
    notes: 'Light paddle, race plan walkthrough.',
  },
  {
    id: 'cal-13',
    date: '2026-05-07T06:00:00Z',
    endDate: '2026-05-07T07:30:00Z',
    title: 'AM practice — starts only',
    type: 'practice',
    location: 'Oakland Estuary',
    notes: '6 race starts, pack and load trailer after.',
  },
  {
    id: 'cal-14',
    date: '2026-05-08T00:00:00Z',
    title: 'Staff meeting — Pac-12 logistics',
    type: 'meeting',
    notes: 'Travel roster, heat assignments, hotel check-in.',
  },
  {
    id: 'cal-15',
    date: '2026-05-09T10:00:00Z',
    title: 'Travel day — Gold River',
    type: 'travel',
    location: 'Sacramento / Gold River, CA',
    notes: 'Bus departs Berkeley 10 AM. Course walk 4 PM.',
  },
  {
    id: 'cal-16',
    date: '2026-05-10T07:00:00Z',
    endDate: '2026-05-10T16:00:00Z',
    title: 'Pac-12 Championships',
    type: 'regatta',
    location: 'Lake Natoma, Gold River CA',
    notes: 'Heats 8 AM, Finals 1 PM. Full squad travel.',
  },

  // ── Recovery + IRA build ───────────────────────────────────────────────
  {
    id: 'cal-17',
    date: '2026-05-11T00:00:00Z',
    title: 'Rest day — post Pac-12',
    type: 'rest',
    notes: 'Mandatory rest. Ice baths available 10 AM–2 PM.',
  },
  {
    id: 'cal-18',
    date: '2026-05-23T08:00:00Z',
    title: 'Travel day — IRA',
    type: 'travel',
    location: 'Camden, NJ',
    notes: 'Fly SFO → PHL 8 AM. Boat inspection 5 PM.',
  },
  {
    id: 'cal-19',
    date: '2026-05-24T07:00:00Z',
    endDate: '2026-05-24T17:00:00Z',
    title: 'IRA National Championship',
    type: 'regatta',
    location: 'Cooper River, Camden NJ',
    notes: 'Heats AM, Grands PM. Season finale.',
  },
  {
    id: 'cal-20',
    date: '2026-05-25T06:00:00Z',
    endDate: '2026-05-25T08:00:00Z',
    title: 'AM practice — race pieces',
    type: 'practice',
    location: 'Oakland Estuary',
    notes: '3×750m at target split. Final speed session before IRA travel.',
  },
]
