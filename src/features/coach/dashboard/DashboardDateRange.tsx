/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'
import { THEME } from '../../../lib/theme'

export type DateRangeKey = '7d' | '30d' | '90d' | 'all'

const RANGE_LABELS: Record<DateRangeKey, string> = {
  '7d': '7 days',
  '30d': '30 days',
  '90d': '90 days',
  all: 'All time',
}

const DashboardDateRangeCtx = createContext<DateRangeKey>('all')
const DashboardDateRangeSetCtx = createContext<(k: DateRangeKey) => void>(() => {})

export function useDashboardDateRange() {
  return useContext(DashboardDateRangeCtx)
}

export function useDashboardDateRangeSetter() {
  return useContext(DashboardDateRangeSetCtx)
}

export function filterMonthsByRange<T extends { month: string }>(data: T[], range: DateRangeKey): T[] {
  if (range === 'all') return data
  const keep = range === '90d' ? 3 : 1
  return data.slice(-keep)
}

export function filterByDateRange<T extends Record<string, unknown>>(data: T[], range: DateRangeKey, dateField: keyof T): T[] {
  if (range === 'all') return data
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const cutoff = Date.now() - days * 86400000
  return data.filter((item) => new Date(item[dateField] as string).getTime() >= cutoff)
}

/** Provides the date range value + setter to all descendants. Does not render any UI. */
export function DashboardDateRangeProvider({ children }: { children: ReactNode }) {
  const [range, setRange] = useState<DateRangeKey>('all')

  return (
    <DashboardDateRangeCtx.Provider value={range}>
      <DashboardDateRangeSetCtx.Provider value={setRange}>
        {children}
      </DashboardDateRangeSetCtx.Provider>
    </DashboardDateRangeCtx.Provider>
  )
}

/** Range selector pills — place this adjacent to the charts that it controls. */
export function DashboardDateRangePicker() {
  const range = useDashboardDateRange()
  const setRange = useDashboardDateRangeSetter()

  return (
    <div className="flex items-center gap-3">
      <span
        className="text-[10px] uppercase tracking-[0.16em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        Range
      </span>
      <div
        className="flex overflow-hidden rounded-lg border"
        style={{ borderColor: THEME.border, background: THEME.white }}
      >
        {(Object.keys(RANGE_LABELS) as DateRangeKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setRange(key)}
            className="px-3 py-1.5 text-[11px] transition-colors"
            style={{
              fontFamily: THEME.fontMono,
              color: range === key ? THEME.white : THEME.textSecondary,
              background: range === key ? THEME.primary : 'transparent',
            }}
          >
            {RANGE_LABELS[key]}
          </button>
        ))}
      </div>
    </div>
  )
}
