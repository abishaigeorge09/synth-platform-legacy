import { create } from 'zustand'
import { SYNTH } from '../lib/theme'

export type BoatSize = '1x' | '2x' | '2-' | '4+' | '4-' | '4x' | '8+'

export const SEAT_COUNT: Record<BoatSize, number> = {
  '1x': 1,
  '2x': 2,
  '2-': 2,
  '4+': 4,
  '4-': 4,
  '4x': 4,
  '8+': 8,
}

export const BOAT_SIZE_LABEL: Record<BoatSize, string> = {
  '1x': 'Single sculler',
  '2x': 'Double sculler',
  '2-': 'Coxless pair',
  '4+': 'Coxed four',
  '4-': 'Coxless four',
  '4x': 'Quadruple sculler',
  '8+': 'Eight (coxed)',
}

export type Seat = {
  position: number // 1 = stroke for sweep, 1 = bow-side for sculls
  label: string // "Stroke" / "Bow" / "5 seat"
  athleteId: string | null
}

export type Boat = {
  id: string
  name: string
  size: BoatSize
  color: string
  /** Per-boat speed multiplier for the racing animation */
  speed: number
  seats: Seat[]
}

export type SplitMarker = { label: string; position: number }

export type RacePreset = {
  raceFor: string // "Race-pace pieces" / "Time trial" / "Seat race" / "Practice"
  distance: string // "2K" / "6K" / "30s × 8"
  splits: SplitMarker[]
  splitUnit: 's' | 'ms'
  expectedDurationMs: number
}

const COLORS = [SYNTH.cardSky, SYNTH.cardPink, SYNTH.cardLemon, SYNTH.cardMint, SYNTH.cardCream] as const

function seatLabel(size: BoatSize, position: number): string {
  const total = SEAT_COUNT[size]
  if (size === '1x') return 'Sculler'
  if (size === '8+') {
    if (position === 1) return 'Stroke'
    if (position === 8) return 'Bow'
    return `${9 - position} seat`
  }
  if (size === '4+' || size === '4-' || size === '4x') {
    if (position === 1) return 'Stroke'
    if (position === total) return 'Bow'
    return `${total + 1 - position} seat`
  }
  if (size === '2-' || size === '2x') {
    return position === 1 ? 'Stroke' : 'Bow'
  }
  return `Seat ${position}`
}

function makeSeats(size: BoatSize): Seat[] {
  const total = SEAT_COUNT[size]
  return Array.from({ length: total }, (_, i) => ({
    position: i + 1,
    label: seatLabel(size, i + 1),
    athleteId: null,
  }))
}

export function makeBoat(name: string, size: BoatSize, colorIdx: number): Boat {
  return {
    id: `boat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    size,
    color: COLORS[colorIdx % COLORS.length],
    speed: 1.0 + (colorIdx * 0.012 - 0.024),
    seats: makeSeats(size),
  }
}

const DEFAULT_BOATS: Boat[] = [
  {
    id: 'boat-v8a',
    name: 'V8 A',
    size: '8+',
    color: SYNTH.cardSky,
    speed: 1.02,
    seats: [
      { position: 1, label: 'Stroke', athleteId: 'a-juno-okafor' },
      { position: 2, label: '7 seat', athleteId: 'a-isla-park' },
      { position: 3, label: '6 seat', athleteId: 'a-noor-haidari' },
      { position: 4, label: '5 seat', athleteId: 'a-star-miller' },
      { position: 5, label: '4 seat', athleteId: 'a-coral-mendez' },
      { position: 6, label: '3 seat', athleteId: 'a-rae-akhtar' },
      { position: 7, label: '2 seat', athleteId: 'a-noor-haidari' },
      { position: 8, label: 'Bow', athleteId: 'a-star-miller' },
    ],
  },
  {
    id: 'boat-v8b',
    name: 'V8 B',
    size: '8+',
    color: SYNTH.cardPink,
    speed: 0.99,
    seats: makeSeats('8+'),
  },
  {
    id: 'boat-v4',
    name: 'V4 A',
    size: '4+',
    color: SYNTH.cardLemon,
    speed: 0.97,
    seats: makeSeats('4+'),
  },
]

const DEFAULT_PRESET: RacePreset = {
  raceFor: 'Race-pace pieces',
  distance: '2K · 4 × 500m',
  splits: [
    { label: '500m', position: 0.25 },
    { label: '1000m', position: 0.5 },
    { label: '1500m', position: 0.75 },
    { label: '2000m', position: 1.0 },
  ],
  splitUnit: 's',
  expectedDurationMs: 400_000, // ~6:40
}

export type SessionMeta = {
  name: string
  type: string
  date: string // YYYY-MM-DD
  notes: string
}

const SESSION_TYPES = [
  'Practice piece',
  'Steady state',
  'Time trial',
  'Seat race',
  'Race',
  'Open',
] as const
export const SESSION_TYPE_OPTIONS: readonly string[] = SESSION_TYPES

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

type State = {
  boats: Boat[]
  preset: RacePreset
  meta: SessionMeta
  addBoat: (name: string, size: BoatSize) => void
  removeBoat: (id: string) => void
  renameBoat: (id: string, name: string) => void
  setSeatAthlete: (boatId: string, position: number, athleteId: string | null) => void
  setPreset: (patch: Partial<RacePreset>) => void
  setMeta: (patch: Partial<SessionMeta>) => void
  resetDraft: () => void
}

const DEFAULT_META: SessionMeta = {
  name: '',
  type: 'Steady state',
  date: todayIso(),
  notes: '',
}

export const useLineupBuilderStore = create<State>((set, get) => ({
  boats: DEFAULT_BOATS,
  preset: DEFAULT_PRESET,
  meta: DEFAULT_META,
  addBoat: (name, size) => {
    const boats = get().boats
    set({ boats: [...boats, makeBoat(name, size, boats.length)] })
  },
  removeBoat: (id) => {
    set({ boats: get().boats.filter((b) => b.id !== id) })
  },
  renameBoat: (id, name) => {
    set({
      boats: get().boats.map((b) => (b.id === id ? { ...b, name } : b)),
    })
  },
  setSeatAthlete: (boatId, position, athleteId) => {
    set({
      boats: get().boats.map((b) =>
        b.id === boatId
          ? {
              ...b,
              seats: b.seats.map((s) =>
                s.position === position ? { ...s, athleteId } : s,
              ),
            }
          : b,
      ),
    })
  },
  setPreset: (patch) => {
    set({ preset: { ...get().preset, ...patch } })
  },
  setMeta: (patch) => {
    set({ meta: { ...get().meta, ...patch } })
  },
  resetDraft: () => {
    set({ boats: DEFAULT_BOATS, preset: DEFAULT_PRESET, meta: { ...DEFAULT_META, date: todayIso() } })
  },
}))
