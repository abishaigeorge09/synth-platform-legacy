import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
  position: number
  label: string
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
  raceFor: string
  distance: string
  splits: SplitMarker[]
  splitUnit: 's' | 'ms'
  expectedDurationMs: number
  /** Tag custom presets so the UI can show a "Custom" badge */
  custom?: boolean
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

/**
 * Alternating rig: position 1 = starboard, 2 = port, 3 = starboard, …
 * The user can override per-boat in a future build; for now this is the
 * default and what the container split UI renders against.
 */
export function seatSide(_size: BoatSize, position: number): 'P' | 'S' {
  return position % 2 === 1 ? 'S' : 'P'
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

const DEFAULT_BOAT: Boat = {
  id: 'boat-default',
  name: 'V8',
  size: '8+',
  color: SYNTH.cardSky,
  speed: 1.0,
  seats: makeSeats('8+'),
}

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
  expectedDurationMs: 400_000,
}

type State = {
  boats: Boat[]
  preset: RacePreset
  customPresets: RacePreset[]
  addBoat: (name: string, size: BoatSize) => void
  removeBoat: (id: string) => void
  renameBoat: (id: string, name: string) => void
  setSeatAthlete: (boatId: string, position: number, athleteId: string | null) => void
  /** Multi-fill: assigns athleteIds[i] to seat (startPosition + i), clamped
   * to the boat's seat count. Used by the multi-select picker. */
  setSeatAthletes: (boatId: string, startPosition: number, athleteIds: string[]) => void
  setPreset: (patch: Partial<RacePreset>) => void
  applyPreset: (preset: RacePreset) => void
  addCustomPreset: (preset: RacePreset) => void
  resetDraft: () => void
}

export const useLineupBuilderStore = create<State>()(
  persist(
    (set, get) => ({
      boats: [DEFAULT_BOAT],
      preset: DEFAULT_PRESET,
      customPresets: [],
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
      setSeatAthletes: (boatId, startPosition, athleteIds) => {
        set({
          boats: get().boats.map((b) => {
            if (b.id !== boatId) return b
            const total = SEAT_COUNT[b.size]
            const seats = b.seats.map((s) => {
              const offset = s.position - startPosition
              if (offset < 0 || offset >= athleteIds.length) return s
              if (s.position > total) return s
              return { ...s, athleteId: athleteIds[offset] ?? s.athleteId }
            })
            return { ...b, seats }
          }),
        })
      },
      setPreset: (patch) => {
        set({ preset: { ...get().preset, ...patch } })
      },
      applyPreset: (preset) => {
        set({ preset })
      },
      addCustomPreset: (preset) => {
        set({
          customPresets: [...get().customPresets, { ...preset, custom: true }],
          preset: { ...preset, custom: true },
        })
      },
      resetDraft: () => {
        set({
          boats: [{ ...DEFAULT_BOAT, id: `boat-default-${Date.now()}`, seats: makeSeats('8+') }],
          preset: DEFAULT_PRESET,
        })
      },
    }),
    {
      name: 'synth:app:lineup-builder',
      partialize: (s) => ({ boats: s.boats, preset: s.preset, customPresets: s.customPresets }),
    },
  ),
)
