/**
 * Seed coach notes. In production these come from the coach_notes table
 * with optional audio transcriptions from the AI voice import pipeline.
 */

export interface CoachNote {
  id: string
  athleteId: string
  coachName: string
  date: string
  text: string
  tags: ('technique' | 'recovery' | 'mental' | 'logistics')[]
  hasAudio: boolean
  transcription?: string
}

export const SEED_COACH_NOTES: CoachNote[] = [
  {
    id: 'cnote-1',
    athleteId: 'athlete-wheeler-ella',
    coachName: 'Demo Coach',
    date: '2026-04-22T14:30:00Z',
    text: 'Ella has been rushing the slide on the recovery — blade is entering early and she loses connection at the catch. Worked on pause drills at bodies-over today. Should see improvement if she stays disciplined this week.',
    tags: ['technique'],
    hasAudio: true,
    transcription: 'Ella has been rushing the slide on the recovery. The blade is entering early and she loses connection at the catch. We worked on pause drills at bodies over today. Should see improvement if she stays disciplined this week.',
  },
  {
    id: 'cnote-2',
    athleteId: 'athlete-miller-star',
    coachName: 'Demo Coach',
    date: '2026-04-21T09:15:00Z',
    text: 'Star mentioned knee soreness after Monday steady state. No swelling visible. Referred to AT for evaluation — cleared for water but pulled from gym lower body this week. Monitor Wednesday.',
    tags: ['recovery'],
    hasAudio: false,
  },
  {
    id: 'cnote-3',
    athleteId: 'athlete-johnson-maya',
    coachName: 'Demo Coach',
    date: '2026-04-20T16:00:00Z',
    text: 'Maya is anxious about Pac-12 selection. Had a 1-on-1 after practice — reassured her that seat racing results are strong and she is firmly in the 1V conversation. Need to keep her focused on process, not outcome.',
    tags: ['mental'],
    hasAudio: false,
  },
  {
    id: 'cnote-4',
    athleteId: 'athlete-chen-lily',
    coachName: 'Demo Coach',
    date: '2026-04-19T11:00:00Z',
    text: 'Lily will miss April 28 practice — finals conflict (Chem 3B). She asked to do erg makeup the evening before. Approved. Log in TeamWorks.',
    tags: ['logistics'],
    hasAudio: false,
  },
  {
    id: 'cnote-5',
    athleteId: 'athlete-garcia-sofia',
    coachName: 'Demo Coach',
    date: '2026-04-18T15:45:00Z',
    text: 'Sofia is pulling 1:42 500m splits consistently now — up from 1:44 six weeks ago. Watts trending well on the erg too. She could challenge for 6-seat in 1V if she maintains this trajectory through seat racing.',
    tags: ['technique'],
    hasAudio: true,
    transcription: 'Sofia is pulling one forty two splits consistently now, up from one forty four six weeks ago. Watts trending well on the erg too. She could challenge for six seat in first varsity if she maintains this trajectory through seat racing.',
  },
  {
    id: 'cnote-6',
    athleteId: 'athlete-patel-ananya',
    coachName: 'Demo Coach',
    date: '2026-04-17T08:30:00Z',
    text: 'Ananya reported poor sleep (4 hrs) and low energy at check-in. HRV was 38 — well below her baseline of 55. Kept her in the 2V for an easy paddle and pulled her from the afternoon piece. Will check wellness data again tomorrow.',
    tags: ['recovery'],
    hasAudio: false,
  },
  {
    id: 'cnote-7',
    athleteId: 'athlete-thompson-grace',
    coachName: 'Demo Coach',
    date: '2026-04-16T17:00:00Z',
    text: 'Grace has been coxing the 1V all week and the calls are noticeably sharper. She is reading the race plan well and her move calls are more decisive. Confirmed her as 1V cox for Pacific Invite.',
    tags: ['technique', 'mental'],
    hasAudio: true,
    transcription: 'Grace has been coxing the first varsity all week and the calls are noticeably sharper. She is reading the race plan well and her move calls are more decisive. Confirmed her as first varsity cox for Pacific Invite.',
  },
  {
    id: 'cnote-8',
    athleteId: 'athlete-kim-hannah',
    coachName: 'Demo Coach',
    date: '2026-04-15T10:00:00Z',
    text: 'Hannah needs to fly home May 2–3 for a family event. Will miss Saturday practice. Not ideal timing with Pac-12 two weeks out, but she has been consistent all season. Approved the absence — she will do a makeup erg session Sunday.',
    tags: ['logistics'],
    hasAudio: false,
  },
  {
    id: 'cnote-9',
    athleteId: 'athlete-davis-emma',
    coachName: 'Demo Coach',
    date: '2026-04-14T13:20:00Z',
    text: 'Emma dropped 3 seconds on her 2K from the February test — now sub-7:00. Huge confidence boost. She was emotional after seeing the split. Channel this energy into the boat — she has the fitness, just needs to trust the group swing.',
    tags: ['mental', 'technique'],
    hasAudio: false,
  },
  {
    id: 'cnote-10',
    athleteId: 'athlete-rodriguez-isabel',
    coachName: 'Demo Coach',
    date: '2026-04-13T07:45:00Z',
    text: 'Isabel has been dealing with a blister on her left hand that keeps reopening. Taped it for today but if it does not improve by Wednesday, we should consider moving her to port side temporarily so the pressure point shifts.',
    tags: ['recovery', 'technique'],
    hasAudio: false,
  },
]
