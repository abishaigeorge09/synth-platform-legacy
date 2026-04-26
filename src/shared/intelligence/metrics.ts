/**
 * DATA_INTELLIGENCE — simplified deterministic metrics for the UI-first seed layer.
 * Full multi-source load uses water/erg/gym/cross when those series exist in DB.
 */

export type TrainingLoadInputs = {
  waterLoad01: number
  ergLoad01: number
  gymLoad01: number
  crossLoad01: number
}

const W_WATER = 0.35
const W_ERG = 0.3
const W_GYM = 0.25
const W_CROSS = 0.1

export function computeTrainingLoad01(i: TrainingLoadInputs): number {
  const raw =
    i.waterLoad01 * W_WATER +
    i.ergLoad01 * W_ERG +
    i.gymLoad01 * W_GYM +
    i.crossLoad01 * W_CROSS
  return clamp01(raw)
}

export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(10, n))
}

export type RecoveryInputs = {
  sleepScore01: number
  wellnessScore01: number
  fatigueScore01: number
}

export function computeRecovery0to100(i: RecoveryInputs): number {
  const v =
    i.sleepScore01 * 0.35 + i.wellnessScore01 * 0.3 + i.fatigueScore01 * 0.35
  return Math.round(clamp01(v) * 100)
}

export type RiskFactor = {
  id: string
  weight: number
  triggered: boolean
}

export function sumRiskWeights(factors: RiskFactor[]): number {
  return factors.filter((f) => f.triggered).reduce((s, f) => s + f.weight, 0)
}

export function riskTierFromTotal(total: number): 'low' | 'moderate' | 'high' | 'critical' {
  if (total <= 2) return 'low'
  if (total <= 5) return 'moderate'
  if (total <= 8) return 'high'
  return 'critical'
}

export function computeDataQualityScore(parts: {
  sourcesConnected: number
  freshness01: number
  completeness01: number
}): number {
  const sources = Math.min(5, parts.sourcesConnected) * 1
  const fresh = parts.freshness01 * 3
  const complete = parts.completeness01 * 2
  return Math.min(10, sources + fresh + complete)
}
