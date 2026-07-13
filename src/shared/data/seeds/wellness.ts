/**
 * Wellness check-in seed data — 90 days (January 25 – April 24, 2026)
 * for all 46 athletes on the roster.
 *
 * Six athletes have intentional gaps to surface "flagged" wellness states:
 *   - Alex Pearson: 0 check-ins in last 5 days
 *   - Alice Gallo: 2 gaps in last week
 *   - Allegra O'Sullivan: only 1 check-in in last 5 days
 *   - Bonnie Mollee: 2–3 missing days scattered
 *   - Charly Johnson: 2–3 missing days scattered
 *   - Chloe Frushtick: 2–3 missing days scattered
 *
 * Two athletes (Lola Crampin, Giulia Bosio) trend downward in recovery
 * (rising soreness, dropping energy) across the 30-day window.
 */
import type { WellnessCheckin } from '@shared/data/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Deterministic pseudo-random: seed-based so the data is stable across runs. */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(42)

/** Random integer in [lo, hi] inclusive. */
function randInt(lo: number, hi: number): number {
  return Math.floor(rand() * (hi - lo + 1)) + lo
}

/** Random float in [lo, hi], rounded to 1 decimal. */
function randFloat(lo: number, hi: number): number {
  return Math.round((rand() * (hi - lo) + lo) * 10) / 10
}

// ─── Athlete ID helpers (must match seeds/index.ts slugify logic) ─────────

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** All 46 athletes from ERG_316_2K roster order (lastFirst strings). */
const ROSTER_LAST_FIRST = [
  'Wheeler, Ella',
  'Irmler, Julia',
  'Abbott, Lily',
  'Miller, Star',
  'Roth, Olivia',
  'Cox, Madeline',
  'Bouman, Minou',
  'Crampin, Lola',
  'Johnson, Charly',
  'Bosio, Giulia',
  "O'Sullivan, Allegra",
  'Mollee, Bonnie',
  'Jamieson, Pippa',
  'Frushtick, Chloe',
  'Gallo, Alice',
  'Banks, Claire',
  'Hoadley, Zara',
  'Pember, Lily',
  'Pearson, Alex',
  'Curven, Sidney',
  'Spitz, Vivi',
  'Knight, Beatrice',
  'Pastorelli, Vicky',
  'Furtaw, Rachel',
  'Ausfahl, Alexandra',
  'Brown, Annie',
  'Landers, Kylie',
  'Turner, Sophia',
  'Harrington, Kylee',
  'Hill, Charlotte',
  'Bonnem, Lily',
  'Nixon, Kate',
  'Hammerer, Francesca',
  'Barrancotto, Eve',
  'Cheetham, Harri',
  'Jennings, Gabby',
  'Cramer, Frieda',
  'Molloy, Louisa',
  'Nelson, Maile',
  'Furlonger, Amy',
  'Andrews, Ava',
  'Campbell, Amalia',
  'Lovell, Cami',
  'Laddy, Bella',
  'Brooks, Ava',
  'Van Westreenen, Lotta',
] as const

const athleteIds = ROSTER_LAST_FIRST.map((lf) => `athlete-${slugify(lf)}`)

// ─── Date range: 2026-01-25 through 2026-04-24 (90 days) ─────────────────

function dateStr(dayOffset: number): string {
  // Day 0 = 2026-01-25 (90 days before April 24 — full spring season)
  const d = new Date(Date.UTC(2026, 0, 25)) // month is 0-indexed
  d.setUTCDate(d.getUTCDate() + dayOffset)
  return d.toISOString().slice(0, 10)
}

const TOTAL_DAYS = 90 // indices 0..89 → Jan 25..Apr 24

// ─── Gap / flag configuration ─────────────────────────────────────────────

// Index within ROSTER_LAST_FIRST
const IDX_PEARSON = 18 // Alex Pearson — 0 check-ins last 5 days
const IDX_GALLO = 14 // Alice Gallo — 2 gaps in last week
const IDX_OSULLIVAN = 10 // Allegra O'Sullivan — only 1 check-in last 5 days
const IDX_MOLLEE = 11 // Bonnie Mollee — 2-3 missing scattered
const IDX_JOHNSON = 8 // Charly Johnson — 2-3 missing scattered
const IDX_FRUSHTICK = 13 // Chloe Frushtick — 2-3 missing scattered

// "Trending down" athletes — soreness rises, energy drops over the 30 days
const IDX_CRAMPIN = 7 // Lola Crampin
const IDX_BOSIO = 9 // Giulia Bosio

/** Returns true if the given athlete/day combo should be SKIPPED (no entry). */
function shouldSkip(athleteIdx: number, dayIdx: number): boolean {
  // Last 5 days = dayIdx 85..89, last 7 days = dayIdx 83..89

  if (athleteIdx === IDX_PEARSON) {
    // 0 check-ins in last 5 days
    if (dayIdx >= 85) return true
  }

  if (athleteIdx === IDX_GALLO) {
    // 2 gaps in last week (days 83..89)
    if (dayIdx === 84 || dayIdx === 87) return true
  }

  if (athleteIdx === IDX_OSULLIVAN) {
    // Only 1 check-in in last 5 days → skip 4 of 5
    if (dayIdx >= 85 && dayIdx !== 87) return true
  }

  if (athleteIdx === IDX_MOLLEE) {
    // scattered gaps throughout season
    if (dayIdx % 23 === 5 || dayIdx % 31 === 14) return true
  }

  if (athleteIdx === IDX_JOHNSON) {
    // scattered gaps throughout season
    if (dayIdx % 17 === 8 || dayIdx % 29 === 19) return true
  }

  if (athleteIdx === IDX_FRUSHTICK) {
    // scattered gaps throughout season
    if (dayIdx % 19 === 3 || dayIdx % 37 === 16) return true
  }

  return false
}

// ─── Notes pool ───────────────────────────────────────────────────────────

const NOTES_POOL = [
  'Felt sluggish in morning erg.',
  'Great sleep, no alarm.',
  'Upper back tightness from yesterday.',
  'Slight headache, hydration issue.',
  'Foam rolled before practice, felt better.',
  'Travel day — sleep disrupted.',
  'Rest day, legs feel fresh.',
  'Knee soreness flared up on the water.',
  'Hit a PR on steady state, feeling strong.',
  'Midterms stress, hard to wind down.',
  'Ate late, sleep was light.',
  'Good day overall, no complaints.',
  'Left hip flexor tight after erg.',
  'Solid 8 hours, ready to go.',
  'Feeling a bit under the weather.',
]

// ─── Generate entries ─────────────────────────────────────────────────────

const entries: WellnessCheckin[] = []
let counter = 0

for (let aIdx = 0; aIdx < athleteIds.length; aIdx++) {
  const athleteId = athleteIds[aIdx]!

  // Per-athlete baseline — gives each person a slightly different "normal"
  const baseSoreness = randInt(2, 5)
  const baseEnergy = randInt(5, 8)
  const baseMood = randInt(5, 8)
  const baseSleepH = randFloat(6.5, 8.0)

  for (let d = 0; d < TOTAL_DAYS; d++) {
    if (shouldSkip(aIdx, d)) continue

    // Trending-down athletes: shift soreness up and energy down over time
    let soreShift = 0
    let energyShift = 0
    if (aIdx === IDX_CRAMPIN || aIdx === IDX_BOSIO) {
      const progress = d / TOTAL_DAYS // 0 → 1
      soreShift = Math.round(progress * 3) // +0 to +3
      energyShift = -Math.round(progress * 3) // -0 to -3
    }

    const soreness = Math.min(10, Math.max(1, baseSoreness + randInt(-1, 2) + soreShift))
    const energy = Math.min(10, Math.max(1, baseEnergy + randInt(-2, 1) + energyShift))
    const mood = Math.min(10, Math.max(1, baseMood + randInt(-1, 1)))
    const sleepHours = Math.min(9, Math.max(5, baseSleepH + randFloat(-1.0, 1.0)))

    // recovery score — loosely derived from sleep + energy + inverse soreness
    const recovery = Math.min(10, Math.max(1, Math.round((energy + (10 - soreness) + mood) / 3) + randInt(-1, 1)))

    const hasNote = rand() < 0.2
    const note = hasNote ? NOTES_POOL[randInt(0, NOTES_POOL.length - 1)] : undefined

    counter++
    entries.push({
      id: `wellness-${counter}`,
      athleteId,
      date: dateStr(d),
      window: 'morning',
      sleepHours,
      energy,
      soreness,
      mood,
      recovery,
      notes: note,
    })
  }
}

export const SEED_WELLNESS: WellnessCheckin[] = entries
