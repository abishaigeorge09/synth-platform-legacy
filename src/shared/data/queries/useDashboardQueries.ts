/**
 * Dashboard-specific aggregated queries (trends, AI insight).
 * These are computed views in production — swap for server-side aggregation.
 */
import { useStaticQuery } from './useStaticQuery'
import { MONTHLY_TRENDS, AI_INSIGHT_MARKDOWN } from '../seeds/trends'

export function useMonthlyTrends() {
  return useStaticQuery(MONTHLY_TRENDS)
}

export function useAiInsight() {
  return useStaticQuery(AI_INSIGHT_MARKDOWN)
}
