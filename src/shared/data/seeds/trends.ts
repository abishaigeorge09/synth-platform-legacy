/**
 * Synthetic monthly time-series for the dashboard charts. Not in the DB
 * schema as a discrete table — these are views/aggregations the real backend
 * will compute from source_data + erg_scores + wellness_checkins.
 */

export type MonthlyPoint = {
  month: string // 'Oct' | 'Nov' | ...
  sessions: number
  avg2kSec: number
  compliancePct: number
  loadIndex: number
}

export const MONTHLY_TRENDS: MonthlyPoint[] = [
  { month: 'Sep', sessions: 12, avg2kSec: 432, compliancePct: 78, loadIndex: 54 },
  { month: 'Oct', sessions: 19, avg2kSec: 430, compliancePct: 84, loadIndex: 62 },
  { month: 'Nov', sessions: 22, avg2kSec: 427, compliancePct: 88, loadIndex: 68 },
  { month: 'Dec', sessions: 15, avg2kSec: 428, compliancePct: 81, loadIndex: 59 },
  { month: 'Jan', sessions: 24, avg2kSec: 425, compliancePct: 90, loadIndex: 71 },
  { month: 'Feb', sessions: 26, avg2kSec: 423, compliancePct: 92, loadIndex: 74 },
  { month: 'Mar', sessions: 28, avg2kSec: 421, compliancePct: 91, loadIndex: 77 },
  { month: 'Apr', sessions: 21, avg2kSec: 420, compliancePct: 89, loadIndex: 73 },
]

export const AI_INSIGHT_MARKDOWN = `**This week**, 7 athletes posted personal-best 2K splits — led by **Rothmore, Marnie** at 6:35.6 (–2.8s vs. March). Compliance held at **89%** across 4 connectors; two athletes flagged for a 5-day gym-log gap (see Alerts). Average team split trend remains downward (faster) for the 5th consecutive month.

Data quality: erg workbooks synced at 18:00 daily; TeamWorks on a 15-minute cadence; wearable hub is live. No stale sources.`
