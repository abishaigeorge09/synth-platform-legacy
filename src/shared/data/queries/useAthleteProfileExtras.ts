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

export function useAthleteProfileSessions(athleteId: string) {
  const r = hash01(athleteId)
  const boats = ['1V 8+', '2V 8+', '1V 4+', '2V 4+']
  const sessions: AthleteProfileSession[] = Array.from({ length: 18 }).map((_, i) => {
    const date = isoDaysAgo(3 * (18 - i))
    const boat = boats[Math.floor((r * 1000 + i) % boats.length)]
    const seat = `${1 + (i % 8)}`
    const base = 102 - Math.round(r * 6) - Math.min(6, Math.floor(i / 3))
    const splits = Array.from({ length: 5 }).map((__, j) => {
      const sec = base + (j % 2 === 0 ? 0.2 : 0.6) + (Math.sin((i + j) * 1.2) * 0.3)
      const m = Math.floor(sec / 60)
      const s = (sec - m * 60).toFixed(1).padStart(4, '0')
      return `${m}:${s}`
    })
    const strokeRates = Array.from({ length: 6 }).map((__, k) => 26 + ((i + k) % 8))
    return { id: `aps-${athleteId}-${i}`, athleteId, date, title: 'Pieces', boat, seat, splits, strokeRates }
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

export function useAthleteCoachNotes(athleteId: string) {
  const notes: CoachNote[] = [
    {
      id: `note-${athleteId}-1`,
      athleteId,
      date: isoDaysAgo(12),
      text: 'Responds well to high-rate work. Watch recovery after long travel.',
      tags: ['Positive'],
    },
    {
      id: `note-${athleteId}-2`,
      athleteId,
      date: isoDaysAgo(4),
      text: 'Seat race week: keep sleep consistent; low soreness trend is good.',
      tags: ['Flag'],
      isTranscription: true,
    },
  ]
  return useStaticQuery(notes)
}

export function getAthleteRecovery(athleteId: string, _name?: string) {
  const r = hash01(athleteId)
  return Math.round(45 + r * 50)
}

export function isAthleteFlagged(athleteId: string, _name?: string) {
  const r = hash01(athleteId)
  return r > 0.82
}

