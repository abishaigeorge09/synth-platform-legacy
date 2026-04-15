import { motion } from 'framer-motion'
import { THEME } from '../lib/theme'
import { TRANSITIONS } from '../lib/motion'
import {
  ERG_2K_YOY,
  ROWIQ_SESSIONS_2526,
  ROWIQ_SESSIONS_BY_MONTH_SEP_MAR,
  ROWIQ_SIGNAL_MONTH_LABELS,
} from './rowiqWomensData'

function parseErg(t: string): number {
  const [m, s] = t.split(':')
  return parseInt(m, 10) * 60 + parseFloat(s)
}

/** Two detail charts driven by WOMENS_DATA.md aggregates (prototype dashboard). */
export function RowiqWomensCharts() {
  const monthCounts = [...ROWIQ_SESSIONS_BY_MONTH_SEP_MAR]
  const maxSessions = Math.max(...monthCounts, 1)
  const yoyMax = Math.max(...ERG_2K_YOY.map((r) => Math.max(parseErg(r.y2025), parseErg(r.y2026))))

  return (
    <div className="mt-4 grid min-w-0 max-w-full gap-4 lg:grid-cols-2">
      <div className="rounded-xl border bg-white p-4 shadow-sm" style={{ borderColor: THEME.border }}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
          2025–26 season · erg sessions by month
        </p>
        <p className="mt-1 text-[12px] leading-snug text-zinc-600" style={{ fontFamily: THEME.fontSans }}>
          {ROWIQ_SESSIONS_2526} dated sessions in workbook — counts shown as bar height (Sep–Mar).
        </p>
        <div className="mt-4 flex h-40 items-end gap-1.5">
          {monthCounts.map((v, i) => {
            const h = v === 0 ? 4 : Math.max(10, Math.round((v / maxSessions) * 120))
            return (
              <div key={ROWIQ_SIGNAL_MONTH_LABELS[i]} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <motion.div
                  className="w-full max-w-[3rem] rounded-t"
                  initial={{ height: 0 }}
                  animate={{ height: h }}
                  transition={{ ...TRANSITIONS.smooth, delay: i * 0.05 }}
                  style={{ background: v === 0 ? `${THEME.border}` : THEME.primary, maxHeight: 120 }}
                  title={`${ROWIQ_SIGNAL_MONTH_LABELS[i]}: ${v} session(s)`}
                />
                <span
                  className="text-[9px] font-medium text-zinc-500"
                  style={{ fontFamily: THEME.fontMono }}
                >
                  {ROWIQ_SIGNAL_MONTH_LABELS[i]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm" style={{ borderColor: THEME.border }}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
          YoY 2K · 317 2K (2025) vs 316 2k (2026)
        </p>
        <p className="mt-1 text-[12px] leading-snug text-zinc-600" style={{ fontFamily: THEME.fontSans }}>
          Paired athletes present in both tests — bar length = erg time (shorter is faster).
        </p>
        <div className="mt-4 space-y-2">
          {ERG_2K_YOY.map((row, i) => {
            const w = 2025
            const e = 2026
            const sec25 = parseErg(row.y2025)
            const sec26 = parseErg(row.y2026)
            const w25 = Math.round((sec25 / yoyMax) * 100)
            const w26 = Math.round((sec26 / yoyMax) * 100)
            return (
              <div key={row.short} className="grid grid-cols-[minmax(0,5.5rem)_1fr] items-center gap-2">
                <span className="truncate text-[11px] font-semibold text-zinc-800" style={{ fontFamily: THEME.fontSans }}>
                  {row.short}
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-8 shrink-0 text-[9px] text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
                      {w}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded bg-zinc-100">
                      <motion.div
                        className="h-full rounded"
                        initial={{ width: 0 }}
                        animate={{ width: `${w25}%` }}
                        transition={{ ...TRANSITIONS.smooth, delay: 0.04 * i }}
                        style={{ background: `${THEME.blue}99` }}
                      />
                    </div>
                    <span className="w-14 shrink-0 text-right text-[9px] tabular-nums text-zinc-600" style={{ fontFamily: THEME.fontMono }}>
                      {row.y2025}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-8 shrink-0 text-[9px] text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
                      {e}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded bg-zinc-100">
                      <motion.div
                        className="h-full rounded"
                        initial={{ width: 0 }}
                        animate={{ width: `${w26}%` }}
                        transition={{ ...TRANSITIONS.smooth, delay: 0.04 * i + 0.02 }}
                        style={{ background: THEME.primary }}
                      />
                    </div>
                    <span className="w-14 shrink-0 text-right text-[9px] tabular-nums text-zinc-600" style={{ fontFamily: THEME.fontMono }}>
                      {row.y2026}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-[10px] text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
          Negative deltas (faster 2026): Wheeler −6.9s, Irmler −7.9s, Cox −10.3s vs 317 2K baseline.
        </p>
      </div>
    </div>
  )
}
