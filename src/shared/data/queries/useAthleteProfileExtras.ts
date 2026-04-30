import { useStaticQuery } from './useStaticQuery'

export type AthleteProfileSession = {
  id: string
  athleteId: string
  date: string // YYYY-MM-DD
  title: string
  boat: string
  seat: string
  splits: string[] // "1:42.3"
  strokeRates?: number[]
}

export type AthleteProfileLineup = {
  id: string
  athleteId: string
  date: string
  session: string
  boat: string
  seat: string
  side: 'port' | 'starboard'
  changed?: boolean
}

export type AthleteWellnessCheckin = {
  id: string
  athleteId: string
  date: string
  recovery: number
  sleepHours: number
  hrv: number
  restingHr: number
  energy: number
  soreness: number
}

export type CoachNote = {
  id: string
  athleteId: string
  date: string
  text: string
  tags: string[]
  isTranscription?: boolean
}

function hash01(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return (h >>> 0) / 2 ** 32
}

function isoDaysAgo(days: number) {
  const d = new Date(Date.now() - days * 86400000)
  return d.toISOString().slice(0, 10)
}

const SESSION_TYPES = [
  { title: 'Race pace pieces', detail: '5×500m', pieceCount: 5 },
  { title: 'Steady state', detail: '3×18min', pieceCount: 3 },
  { title: 'Starts + high rate', detail: '12 starts', pieceCount: 4 },
  { title: 'UT2 erg', detail: "2×30'", pieceCount: 2 },
  { title: 'Power 10s', detail: '3×20min', pieceCount: 3 },
  { title: 'Rate ladders', detail: '22/24/26/28', pieceCount: 4 },
  { title: 'Technical drills', detail: 'Pause + pick', pieceCount: 2 },
  { title: '2K prep pieces', detail: '4×750m', pieceCount: 4 },
  { title: 'On-water pieces', detail: '8×3min', pieceCount: 8 },
  { title: 'Seat race', detail: '3×5min', pieceCount: 3 },
]

export function useAthleteProfileSessions(athleteId: string) {
  const r = hash01(athleteId)
  const boats = ['1V 8+', '2V 8+', '1V 4+', '2V 4+']
  const sessions: AthleteProfileSession[] = Array.from({ length: 18 }).map((_, i) => {
    const date = isoDaysAgo(3 * (18 - i))
    const boat = boats[Math.floor((r * 1000 + i) % boats.length)]
    const seat = `${1 + (i % 8)}`
    const base = 102 - Math.round(r * 6) - Math.min(6, Math.floor(i / 3))
    const sessionType = SESSION_TYPES[(i + Math.floor(r * 10)) % SESSION_TYPES.length]!
    const splits = Array.from({ length: sessionType.pieceCount }).map((__, j) => {
      const sec = base + (j % 2 === 0 ? 0.2 : 0.6) + (Math.sin((i + j) * 1.2) * 0.3)
      const m = Math.floor(sec / 60)
      const s = (sec - m * 60).toFixed(1).padStart(4, '0')
      return `${m}:${s}`
    })
    const strokeRates = Array.from({ length: sessionType.pieceCount }).map((__, k) => 26 + ((i + k) % 8))
    return {
      id: `aps-${athleteId}-${i}`,
      athleteId,
      date,
      title: sessionType.title,
      boat,
      seat,
      splits,
      strokeRates,
    }
  })
  return useStaticQuery(sessions)
}

export function useAthleteProfileLineups(athleteId: string) {
  const r = hash01(athleteId)
  const boats = ['1V 8+', '2V 8+', '3V 8+', '1V 4+']
  const lineups: AthleteProfileLineup[] = Array.from({ length: 28 }).map((_, i) => {
    const date = isoDaysAgo(2 * (28 - i))
    const boat = boats[Math.floor((r * 1000 + i * 3) % boats.length)]
    const seat = `${1 + (i % 8)}`
    const side = i % 2 === 0 ? 'port' : 'starboard'
    const changed = i % 7 === 0
    return {
      id: `apl-${athleteId}-${i}`,
      athleteId,
      date,
      session: 'Practice',
      boat,
      seat,
      side,
      changed,
    }
  })
  return useStaticQuery(lineups)
}

export function useAthleteWellness(athleteId: string) {
  const r = hash01(athleteId)
  const checkins: AthleteWellnessCheckin[] = Array.from({ length: 45 }).map((_, i) => {
    const date = isoDaysAgo(45 - i)
    const recovery = Math.round(55 + 25 * Math.sin((i + r * 10) / 4))
    const sleepHours = Math.round((6.5 + 1.1 * Math.sin((i + 2) / 6) + r * 0.6) * 10) / 10
    const hrv = Math.round(55 + 18 * Math.sin((i + r * 5) / 5))
    const restingHr = Math.round(52 + 6 * Math.sin((i + 1) / 7) + r * 3)
    const energy = Math.max(1, Math.min(10, Math.round(6 + 2 * Math.sin((i + r) / 6))))
    const soreness = Math.max(1, Math.min(10, Math.round(4 + 3 * Math.sin((i + 3) / 5))))
    return { id: `awc-${athleteId}-${i}`, athleteId, date, recovery, sleepHours, hrv, restingHr, energy, soreness }
  })
  return useStaticQuery(checkins)
}

const NOTE_POOL: Array<{ text: string; tags: string[]; daysAgo: number; isTranscription?: boolean }> = [
  { text: 'Catch timing is clicking — best technical session in weeks. Keep footplate adjustment from yesterday.', tags: ['Technique', 'Positive'], daysAgo: 2 },
  { text: 'Drive connection at high rates is still the focus area. Try pause-at-finish drill at rate 22 tomorrow.', tags: ['Technique'], daysAgo: 5 },
  { text: 'Recovery score was 38 this morning — reduce intensity by 20%. No hard pieces until score is back above 65.', tags: ['Flag', 'Recovery'], daysAgo: 8 },
  { text: 'Moved to bow pair for the V8 in today\'s seat race. Looked comfortable — blade work solid. Match rate changes faster off the start.', tags: ['Lineup', 'Technique'], daysAgo: 12, isTranscription: true },
  { text: '2K retest is trending strong based on 5K splits. Sub-6:44 at Pacific Invite is realistic if sleep stays consistent.', tags: ['Fitness', 'Positive'], daysAgo: 15 },
  { text: 'Gym compliance was 11/16 this month. That\'s just below target. One more lift on Thursday closes the gap.', tags: ['Fitness'], daysAgo: 19 },
  { text: 'Best race strategy: go out at 1:41, hold through 750, move at 1250, empty the tank in last 250.', tags: ['Race', 'Positive'], daysAgo: 22, isTranscription: true },
  { text: 'Excellent focus during starts. Blade timing off the catch improved by about 50ms vs last week.', tags: ['Technique', 'Positive'], daysAgo: 28 },
]

export function useAthleteCoachNotes(athleteId: string) {
  const r = hash01(athleteId)
  const count = 3 + Math.round(r * 3) // 3–6 notes per athlete
  const notes: CoachNote[] = Array.from({ length: count }).map((_, i) => {
    const pool = NOTE_POOL[(Math.floor(r * NOTE_POOL.length) + i) % NOTE_POOL.length]!
    return {
      id: `note-${athleteId}-${i}`,
      athleteId,
      date: isoDaysAgo(pool.daysAgo),
      text: pool.text,
      tags: pool.tags,
      isTranscription: pool.isTranscription,
    }
  })
  return useStaticQuery(notes)
}

export function getAthleteRecovery(athleteId: string) {
  const r = hash01(athleteId)
  return Math.round(45 + r * 50)
}

export function isAthleteFlagged(athleteId: string) {
  const r = hash01(athleteId)
  return r > 0.82
}

