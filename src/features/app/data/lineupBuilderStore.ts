import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SYNTH } from '../lib/theme'

export type BoatSize = '1x' | '2x' | '2-' | '4+' | '4-' | '4x' | '8+'

/** Number of ROWER seats in each boat type (cox counted separately). */
export const SEAT_COUNT: Record<BoatSize, number> = {
  '1x': 1,
  '2x': 2,
  '2-': 2,
  '4+': 4,
  '4-': 4,
  '4x': 4,
  '8+': 8,
}

/** Whether the boat type carries a coxswain. */
export const COXED: Record<BoatSize, boolean> = {
  '1x': false,
  '2x': false,
  '2-': false,
  '4+': true,
  '4-': false,
  '4x': false,
  '8+': true,
}

/** Total seats including the cox if applicable. */
export function totalSeats(size: BoatSize): number {
  return SEAT_COUNT[size] + (COXED[size] ? 1 : 0)
}

/** Seat position used for the cox (one past the last rower) when applicable. */
export function coxPosition(size: BoatSize): number | null {
  return COXED[size] ? SEAT_COUNT[size] + 1 : null
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
  /** Stable id for custom presets (so they can be deleted). Built-ins
   * leave this undefined. */
  id?: string
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
  if (COXED[size] && position === total + 1) return 'Cox'
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
 * The cox seat (position SEAT_COUNT[size] + 1 on coxed boats) returns 'X'.
 */
export function seatSide(size: BoatSize, position: number): 'P' | 'S' | 'X' {
  if (COXED[size] && position === SEAT_COUNT[size] + 1) return 'X'
  return position % 2 === 1 ? 'S' : 'P'
}

function makeSeats(size: BoatSize): Seat[] {
  const rowers = SEAT_COUNT[size]
  const all = COXED[size] ? rowers + 1 : rowers
  return Array.from({ length: all }, (_, i) => ({
    position: i + 1,
    label: seatLabel(size, i + 1),
    athleteId: null,
  }))
}

/**
 * Carry as many athletes forward as possible when changing a boat's size.
 * Rower seats map by position (lowest first). The cox carries forward
 * only when both old and new sizes are coxed.
 */
export function migrateSeatsForSize(
  oldSeats: Seat[],
  oldSize: BoatSize,
  newSize: BoatSize,
): Seat[] {
  const next = makeSeats(newSize)
  const minRowers = Math.min(SEAT_COUNT[oldSize], SEAT_COUNT[newSize])
  for (let p = 1; p <= minRowers; p++) {
    const oldSeat = oldSeats.find((s) => s.position === p)
    if (oldSeat?.athleteId) {
      const newSeat = next.find((s) => s.position === p)
      if (newSeat) newSeat.athleteId = oldSeat.athleteId
    }
  }
  if (COXED[oldSize] && COXED[newSize]) {
    const oldCox = oldSeats.find((s) => s.position === SEAT_COUNT[oldSize] + 1)
    const newCox = next.find((s) => s.position === SEAT_COUNT[newSize] + 1)
    if (oldCox?.athleteId && newCox) newCox.athleteId = oldCox.athleteId
  }
  return next
}

function autoBoatName(existing: Boat[], size: BoatSize): string {
  const sameSizeCount = existing.filter((b) => b.size === size).length
  // A..Z then 27, 28, …
  if (sameSizeCount < 26) return `${size} ${String.fromCharCode(65 + sameSizeCount)}`
  return `${size} ${sameSizeCount + 1}`
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

function makeDefaultBoat(): Boat {
  return makeBoat('8+ A', '8+', 0)
}

type State = {
  boats: Boat[]
  preset: RacePreset
  customPresets: RacePreset[]
  addBoat: (name: string, size: BoatSize) => void
  removeBoat: (id: string) => void
  renameBoat: (id: string, name: string) => void
  setBoatSize: (id: string, size: BoatSize) => void
  setSeatAthlete: (boatId: string, position: number, athleteId: string | null) => void
  setSeatAthletes: (boatId: string, startPosition: number, athleteIds: string[]) => void
  setPreset: (patch: Partial<RacePreset>) => void
  applyPreset: (preset: RacePreset) => void
  addCustomPreset: (preset: RacePreset) => void
  removeCustomPreset: (id: string) => void
  resetDraft: () => void
}

export const useLineupBuilderStore = create<State>()(
  persist(
    (set, get) => ({
      boats: [makeDefaultBoat()],
      preset: DEFAULT_PRESET,
      customPresets: [],
      addBoat: (name, size) => {
        const boats = get().boats
        const finalName = name.trim() || autoBoatName(boats, size)
        set({ boats: [...boats, makeBoat(finalName, size, boats.length)] })
      },
      removeBoat: (id) => {
        set({ boats: get().boats.filter((b) => b.id !== id) })
      },
      renameBoat: (id, name) => {
        set({
          boats: get().boats.map((b) => (b.id === id ? { ...b, name } : b)),
        })
      },
      setBoatSize: (id, size) => {
        set({
          boats: get().boats.map((b) =>
            b.id === id
              ? { ...b, size, seats: migrateSeatsForSize(b.seats, b.size, size) }
              : b,
          ),
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
            const limit = totalSeats(b.size)
            const seats = b.seats.map((s) => {
              const offset = s.position - startPosition
              if (offset < 0 || offset >= athleteIds.length) return s
              if (s.position > limit) return s
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
        const stamped: RacePreset = {
          ...preset,
          id: `cp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          custom: true,
        }
        set({
          customPresets: [...get().customPresets, stamped],
          preset: stamped,
        })
      },
      removeCustomPreset: (id) => {
        const state = get()
        const next = state.customPresets.filter((p) => p.id !== id)
        const presetWasRemoved = state.preset.custom && state.preset.id === id
        set({
          customPresets: next,
          preset: presetWasRemoved ? DEFAULT_PRESET : state.preset,
        })
      },
      resetDraft: () => {
        set({
          boats: [makeDefaultBoat()],
          preset: DEFAULT_PRESET,
        })
      },
    }),
    {
      name: 'synth:app:lineup-builder',
      partialize: (s) => ({ boats: s.boats, preset: s.preset, customPresets: s.customPresets }),
      // Backfill cox seats on rehydrate for boats persisted before COXED
      // existed. Keeps athlete assignments intact.
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.boats = state.boats.map((b) => {
          const expected = totalSeats(b.size)
          if (b.seats.length === expected) return b
          return { ...b, seats: migrateSeatsForSize(b.seats, b.size, b.size) }
        })
      },
    },
  ),
)
