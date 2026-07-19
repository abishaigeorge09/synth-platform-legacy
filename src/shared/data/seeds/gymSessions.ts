/**
 * Seed gym sessions for the first 5 athletes (2 sessions each).
 * Exercises are rowing-relevant strength work with realistic weights
 * for college women rowers.
 */
import type { GymSession } from '@shared/data/types'

export const SEED_GYM_SESSIONS: GymSession[] = [
  // ── Marnie Rothmore (athlete-wheeler-ella) ──────────────────────────────────
  {
    id: 'gym-wheeler-ella-0418',
    athleteId: 'athlete-wheeler-ella',
    sessionDate: '2026-04-18',
    durationMin: 60,
    exercises: [
      { name: 'Back Squat', sets: 4, reps: 5, weight: 185 },
      { name: 'Romanian Deadlift', sets: 3, reps: 8, weight: 155 },
      { name: 'Bent-Over Row', sets: 3, reps: 10, weight: 95 },
      { name: 'Hanging Leg Raise', sets: 3, reps: 12, weight: 0 },
    ],
    notes: 'Felt strong on squats, added 5 lbs from last week.',
    totalSets: 13,
    totalVolumeLbs: 8870,
  },
  {
    id: 'gym-wheeler-ella-0421',
    athleteId: 'athlete-wheeler-ella',
    sessionDate: '2026-04-21',
    durationMin: 55,
    exercises: [
      { name: 'Trap Bar Deadlift', sets: 4, reps: 4, weight: 225 },
      { name: 'Single-Leg Press', sets: 3, reps: 8, weight: 140 },
      { name: 'Pull-Ups', sets: 4, reps: 6, weight: 0 },
      { name: 'Pallof Press', sets: 3, reps: 10, weight: 30 },
    ],
    notes: 'Upper back fatigue from AM water session.',
    totalSets: 14,
    totalVolumeLbs: 7500,
  },

  // ── Brielle Whitcombe (athlete-irmler-julia) ──────────────────────────────────
  {
    id: 'gym-irmler-julia-0417',
    athleteId: 'athlete-irmler-julia',
    sessionDate: '2026-04-17',
    durationMin: 65,
    exercises: [
      { name: 'Front Squat', sets: 4, reps: 5, weight: 155 },
      { name: 'Barbell Hip Thrust', sets: 3, reps: 10, weight: 185 },
      { name: 'Dumbbell Bench Row', sets: 3, reps: 10, weight: 45 },
      { name: 'Ab Wheel Rollout', sets: 3, reps: 10, weight: 0 },
    ],
    notes: 'Good tempo on hip thrusts.',
    totalSets: 13,
    totalVolumeLbs: 9200,
  },
  {
    id: 'gym-irmler-julia-0422',
    athleteId: 'athlete-irmler-julia',
    sessionDate: '2026-04-22',
    durationMin: 50,
    exercises: [
      { name: 'Sumo Deadlift', sets: 4, reps: 4, weight: 205 },
      { name: 'Bulgarian Split Squat', sets: 3, reps: 8, weight: 50 },
      { name: 'Lat Pulldown', sets: 3, reps: 10, weight: 100 },
      { name: 'Side Plank', sets: 3, reps: 1, weight: 0 },
    ],
    notes: 'Short session — race week taper.',
    totalSets: 13,
    totalVolumeLbs: 6480,
  },

  // ── Freya Birchwood (athlete-abbott-lily) ────────────────────────────────────
  {
    id: 'gym-abbott-lily-0418',
    athleteId: 'athlete-abbott-lily',
    sessionDate: '2026-04-18',
    durationMin: 70,
    exercises: [
      { name: 'Back Squat', sets: 5, reps: 5, weight: 165 },
      { name: 'Pendlay Row', sets: 4, reps: 6, weight: 95 },
      { name: 'Dumbbell Bench Press', sets: 3, reps: 10, weight: 40 },
      { name: 'Weighted Plank', sets: 3, reps: 1, weight: 25 },
    ],
    notes: 'Back squat PR — 5x5 @ 165.',
    totalSets: 15,
    totalVolumeLbs: 8475,
  },
  {
    id: 'gym-abbott-lily-0423',
    athleteId: 'athlete-abbott-lily',
    sessionDate: '2026-04-23',
    durationMin: 60,
    exercises: [
      { name: 'Hex Bar Deadlift', sets: 4, reps: 5, weight: 195 },
      { name: 'Step-Ups', sets: 3, reps: 8, weight: 55 },
      { name: 'Cable Row', sets: 3, reps: 12, weight: 80 },
      { name: 'Dead Bug', sets: 3, reps: 12, weight: 0 },
    ],
    notes: 'Solid session, no complaints.',
    totalSets: 13,
    totalVolumeLbs: 7540,
  },

  // ── Sloane Carrow (athlete-miller-star) ────────────────────────────────────
  {
    id: 'gym-miller-star-0416',
    athleteId: 'athlete-miller-star',
    sessionDate: '2026-04-16',
    durationMin: 45,
    exercises: [
      { name: 'Back Squat', sets: 3, reps: 5, weight: 155 },
      { name: 'Kettlebell Swing', sets: 3, reps: 15, weight: 44 },
      { name: 'Pull-Ups', sets: 3, reps: 5, weight: 0 },
    ],
    notes: 'Cut short — low energy, skipping accessory work.',
    totalSets: 9,
    totalVolumeLbs: 4305,
  },
  {
    id: 'gym-miller-star-0421',
    athleteId: 'athlete-miller-star',
    sessionDate: '2026-04-21',
    durationMin: 50,
    exercises: [
      { name: 'Romanian Deadlift', sets: 3, reps: 8, weight: 135 },
      { name: 'Seated Cable Row', sets: 3, reps: 10, weight: 85 },
      { name: 'Goblet Squat', sets: 3, reps: 10, weight: 50 },
      { name: 'Farmer Carry', sets: 3, reps: 1, weight: 55 },
    ],
    notes: 'Feeling sluggish. Sleep has been off.',
    totalSets: 12,
    totalVolumeLbs: 6285,
  },

  // ── Larkin Tremaine (athlete-roth-olivia) ────────────────────────────────────
  {
    id: 'gym-roth-olivia-0419',
    athleteId: 'athlete-roth-olivia',
    sessionDate: '2026-04-19',
    durationMin: 75,
    exercises: [
      { name: 'Trap Bar Deadlift', sets: 5, reps: 3, weight: 235 },
      { name: 'Front Squat', sets: 4, reps: 5, weight: 145 },
      { name: 'Bent-Over Row', sets: 4, reps: 8, weight: 95 },
      { name: 'Hanging Knee Raise', sets: 3, reps: 15, weight: 0 },
      { name: 'Single-Arm DB Press', sets: 3, reps: 8, weight: 35 },
    ],
    notes: 'Heavy pull day — deadlift working up to competition.',
    totalSets: 19,
    totalVolumeLbs: 10235,
  },
  {
    id: 'gym-roth-olivia-0424',
    athleteId: 'athlete-roth-olivia',
    sessionDate: '2026-04-24',
    durationMin: 55,
    exercises: [
      { name: 'Back Squat', sets: 4, reps: 5, weight: 175 },
      { name: 'Dumbbell Bench Row', sets: 3, reps: 10, weight: 50 },
      { name: 'Lat Pulldown', sets: 3, reps: 10, weight: 90 },
      { name: 'Copenhagen Plank', sets: 3, reps: 1, weight: 0 },
    ],
    notes: 'Deload week — keeping intensity moderate.',
    totalSets: 13,
    totalVolumeLbs: 6700,
  },
]
