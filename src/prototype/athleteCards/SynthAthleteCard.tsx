import { motion } from 'framer-motion'
import { THEME } from '../../lib/theme'
import { TRANSITIONS } from '../../lib/motion'
import type { SynthAthleteCard as AthleteT } from './model'
import { formatDate, formatSecAs2k, formatTrend } from './formatters'
import { SynthAthleteSparkline } from './SynthAthleteSparkline'

function rankStripe(rank: number): string {
  if (rank === 1) return `linear-gradient(90deg, ${THEME.amber}, #FBBF24)`
  if (rank === 2) return `linear-gradient(90deg, #94A3B8, #CBD5E1)`
  if (rank === 3) return `linear-gradient(90deg, #B45309, ${THEME.amber})`
  if (rank <= 10) return `linear-gradient(90deg, ${THEME.primary}, ${THEME.primaryDark})`
  return `linear-gradient(90deg, ${THEME.primaryDarker}, ${THEME.dark})`
}

function rankBadgeBg(rank: number): string {
  if (rank <= 3) return `${THEME.amber}22`
  return `${THEME.primary}12`
}

function TrendRow({ trend, delta }: { trend: AthleteT['trend']; delta: number }) {
  const col =
    trend === 'improving' ? THEME.primary : trend === 'declining' ? THEME.red : THEME.textMuted
  return (
    <p className="text-[11px] font-medium" style={{ fontFamily: THEME.fontMono, color: col }}>
      {formatTrend(delta)}
    </p>
  )
}

type Props = {
  athlete: AthleteT
  onClick: () => void
  compareMode?: boolean
  selected?: boolean
  onToggle?: () => void
}

export function SynthAthleteCard({ athlete, onClick, compareMode, selected, onToggle }: Props) {
  const lastSession = athlete.sessions[athlete.sessions.length - 1]
  const recent = athlete.sessions.slice(-3)
  const recentForm = recent.map((sess, i) => {
    const prev = i > 0 ? recent[i - 1] : athlete.sessions[athlete.sessions.length - 4] ?? recent[0]
    const improved = prev ? sess.splitSec < prev.splitSec : false
    return { splitSec: sess.splitSec, improved }
  })

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={TRANSITIONS.smooth}
      className="relative cursor-pointer overflow-hidden rounded-xl border transition-shadow hover:shadow-lg"
      style={{
        borderColor: selected ? THEME.primary : THEME.border,
        background: THEME.white,
        boxShadow: selected ? `0 0 0 1px ${THEME.primary}44` : undefined,
      }}
      onClick={compareMode ? onToggle : onClick}
    >
      <div className="h-1.5 w-full" style={{ background: rankStripe(athlete.rank) }} />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold"
            style={{
              fontFamily: THEME.fontMono,
              background: rankBadgeBg(athlete.rank),
              color: athlete.rank <= 3 ? THEME.amber : THEME.textMuted,
            }}
          >
            {athlete.rank}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-bold text-zinc-900" style={{ fontFamily: THEME.fontSans }}>
                {athlete.name}
              </h3>
              <span
                className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{
                  fontFamily: THEME.fontMono,
                  background: `${THEME.primary}18`,
                  color: THEME.primaryDark,
                }}
              >
                {athlete.group === 'A' ? 'A' : 'B'}
              </span>
            </div>
            <TrendRow trend={athlete.trend} delta={athlete.trendDeltaSec} />
          </div>
          {compareMode ? (
            <div
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2"
              style={{
                borderColor: selected ? THEME.primary : THEME.border,
                background: selected ? THEME.primary : 'transparent',
              }}
            >
              {selected ? (
                <span className="text-[10px] font-bold text-white" style={{ fontFamily: THEME.fontMono }}>
                  ✓
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xl font-bold tabular-nums text-zinc-900" style={{ fontFamily: THEME.fontMono }}>
              {formatSecAs2k(athlete.avgSplitSec)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
              2k
            </div>
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums" style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>
              {formatSecAs2k(athlete.bestSplitSec)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
              Best
            </div>
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-zinc-900" style={{ fontFamily: THEME.fontMono }}>
              {athlete.sessionCount}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
              Sessions
            </div>
          </div>
        </div>

        <SynthAthleteSparkline data={athlete.sparklineData} />

        <div className="flex gap-1.5">
          {recentForm.map((f, i) => (
            <div
              key={i}
              className="flex flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-1 text-[11px]"
              style={{
                fontFamily: THEME.fontMono,
                background: f.improved ? `${THEME.primary}12` : `${THEME.red}0f`,
                border: `1px solid ${f.improved ? `${THEME.primary}33` : `${THEME.red}33`}`,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: f.improved ? THEME.primary : THEME.red }} />
              <span className="tabular-nums text-zinc-600">{formatSecAs2k(f.splitSec)}</span>
            </div>
          ))}
        </div>

        <div
          className="flex items-center justify-between border-t border-zinc-100 pt-1"
          style={{ borderColor: THEME.border }}
        >
          <span className="text-xs font-semibold" style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>
            View profile →
          </span>
          <span className="text-[10px] text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
            Last: {lastSession ? formatDate(lastSession.date) : '—'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
