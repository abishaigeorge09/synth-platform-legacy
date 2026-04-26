import { describe, expect, it } from 'vitest'
import {
  clamp01,
  computeDataQualityScore,
  computeRecovery0to100,
  computeTrainingLoad01,
  riskTierFromTotal,
  sumRiskWeights,
} from './metrics'

describe('computeTrainingLoad01', () => {
  it('weights water/erg/gym/cross', () => {
    const v = computeTrainingLoad01({
      waterLoad01: 1,
      ergLoad01: 0,
      gymLoad01: 0,
      crossLoad01: 0,
    })
    expect(v).toBeCloseTo(0.35, 5)
  })
})

describe('computeRecovery0to100', () => {
  it('returns 0-100', () => {
    expect(
      computeRecovery0to100({
        sleepScore01: 1,
        wellnessScore01: 1,
        fatigueScore01: 1,
      }),
    ).toBe(100)
  })
})

describe('risk', () => {
  it('sums triggered factors', () => {
    expect(
      sumRiskWeights([
        { id: 'a', weight: 2, triggered: true },
        { id: 'b', weight: 1.5, triggered: false },
      ]),
    ).toBe(2)
  })
  it('tiers', () => {
    expect(riskTierFromTotal(1)).toBe('low')
    expect(riskTierFromTotal(4)).toBe('moderate')
    expect(riskTierFromTotal(7)).toBe('high')
    expect(riskTierFromTotal(10)).toBe('critical')
  })
})

describe('data quality', () => {
  it('caps at 10', () => {
    expect(
      computeDataQualityScore({
        sourcesConnected: 10,
        freshness01: 1,
        completeness01: 1,
      }),
    ).toBe(10)
  })
})

describe('clamp01', () => {
  it('clamps', () => {
    expect(clamp01(-1)).toBe(0)
    expect(clamp01(11)).toBe(10)
  })
})
