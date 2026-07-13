/**
 * Seed lineups. In production these come from session_lineups + session_boats.
 * For UI-first dev the LineupsPage reads published history from here.
 */
import type { RowingSide } from '@shared/data/types'

export type SeatAssignment = {
  seatNumber: number
  side: RowingSide
  athleteId: string | null
  isCox?: boolean
}

export type BoatLineup = {
  id: string
  name: string
  size: 4 | 8
  label: string
  seats: SeatAssignment[]
}

export type PublishedLineup = {
  id: string
  sessionTitle: string
  date: string
  publishedAt: string
  note?: string
  boats: BoatLineup[]
}

/** Build an empty shell of the given size. Seat 1 = bow, seat N = stroke. */
export function makeEmptyBoat(id: string, name: string, size: 4 | 8): BoatLineup {
  const seats: SeatAssignment[] = []
  seats.push({ seatNumber: 0, side: 'both', athleteId: null, isCox: true })
  for (let i = 1; i <= size; i++) {
    seats.push({
      seatNumber: i,
      side: i % 2 === 1 ? 'starboard' : 'port',
      athleteId: null,
    })
  }
  return { id, name, size, label: `${size}+`, seats }
}

/** A handful of seeded past lineups so the history card isn't empty. */
export const SEED_PUBLISHED_LINEUPS: PublishedLineup[] = [
  {
    id: 'pub-2026-04-14',
    sessionTitle: 'Saturday pieces',
    date: '2026-04-14',
    publishedAt: '2026-04-13T22:00:00Z',
    note: '1V + 2V 8+ — 16 seats assigned',
    boats: [],
  },
  {
    id: 'pub-2026-04-07',
    sessionTitle: 'AM steady state',
    date: '2026-04-07',
    publishedAt: '2026-04-06T22:00:00Z',
    note: '3 boats — full roster',
    boats: [],
  },
  {
    id: 'pub-2026-03-31',
    sessionTitle: '2K race sim',
    date: '2026-03-31',
    publishedAt: '2026-03-30T22:00:00Z',
    note: '1V 8+ race sim + 2V 8+ support',
    boats: [],
  },
]
