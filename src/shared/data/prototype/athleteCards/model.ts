/** Prototype athlete card model — mirrors v2-athlete-cards shape, backed by RowIQ erg data. */

export type WorkoutCategory = 'steady_state' | 'intervals' | 'threshold' | 'triathlon'

export interface SparklinePoint {
  date: string
  /** 2k-equivalent total seconds (lower = faster) for charting */
  splitSec: number
}

export interface AthleteSessionRow {
  sessionId: string
  date: string
  workoutName: string
  workoutCategory: WorkoutCategory
  side: 'groupA' | 'groupB'
  /** 2k total seconds (synthetic session rollup for prototype) */
  splitSec: number
  spm: number
  rank: number
  of: number
}

export interface CategoryStats {
  sessions: number
  avgSplitSec: number | null
}

export interface SynthAthleteCard {
  id: string
  name: string
  fullName: string
  group: 'A' | 'B'
  rank: number
  /** Latest 316 2k total seconds */
  avgSplitSec: number
  bestSplitSec: number
  bestSplitDate: string
  sessionCount: number
  trend: 'improving' | 'declining' | 'stable'
  /** Negative = faster vs prior season */
  trendDeltaSec: number
  consistency: number
  categoryBreakdown: Record<string, CategoryStats>
  sparklineData: SparklinePoint[]
  sessions: AthleteSessionRow[]
  watts316: number
  rate316: number
  twoKDisplay: string
  note?: string
}
