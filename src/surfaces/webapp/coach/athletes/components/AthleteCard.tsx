import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { THEME } from '@lib/theme'
import type { Athlete, ErgScore } from '@shared/data/types'
import { useRightPanelStore } from '@shared/store/useRightPanelStore'

function fmt2k(seconds?: number) {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = (seconds - m * 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

/** 0-100 erg performance pct relative to team range (~6:35 best, ~7:35 worst) */
function ergPct(seconds: number): number {
  const best = 395
  const worst = 460
  return Math.max(3, Math.min(100, Math.round(((worst - seconds) / (worst - best)) * 100)))
}

const AVATAR_COLORS = [
  THEME.primary,
  THEME.cyan,
  THEME.purple,
  THEME.amber,
  THEME.blue,
  '#EC4899',
  '#14B8A6',
  '#F97316',
]

function recoveryAccent(recovery: number): string {
  if (recovery >= 75) return THEME.primary
  if (recovery >= 50) return THEME.amber
  return THEME.red
}

export function AthleteCard({
  athlete,
  erg,
  rank,
  recovery,
  flagged,
  selectMode,
  isSelected,
  onToggleSelect,
}: {
  athlete: Athlete
  erg?: ErgScore
  rank: number
  recovery?: number
  flagged?: boolean
  selectMode?: boolean
  isSelected?: boolean
  onToggleSelect?: () => void
}) {
  const avatarColor = AVATAR_COLORS[athlete.avatarColorIndex ?? 0]
  const openChat = useRightPanelStore((s) => s.openChat)

  const flagColor =
    flagged && recovery !== undefined
      ? recovery < 50
        ? THEME.red
        : THEME.amber
      : undefined

  const pct = erg ? ergPct(erg.timeSeconds) : null

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden rounded-xl border flex flex-col"
      style={{
        background: 'var(--bg-primary)',
        borderColor: THEME.border,
        borderLeft: flagColor ? `3px solid ${flagColor}` : undefined,
        boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 16px 32px -24px rgba(24,24,27,0.18)',
      }}
    >
      <Link
        to={selectMode ? '#' : `/coach/athletes/${athlete.id}`}
        onClick={(e) => {
          if (!selectMode) return
          e.preventDefault()
          onToggleSelect?.()
        }}
        className="block relative flex-1"
      >
        {selectMode ? (
          <div
            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border"
            style={{
              borderColor: isSelected ? THEME.primary : THEME.border,
              background: isSelected ? `${THEME.primary}14` : 'var(--bg-primary)',
              color: isSelected ? THEME.primary : THEME.textMuted,
            }}
            aria-hidden
          >
            {isSelected ? '✓' : ''}
          </div>
        ) : null}

        {/* Rank stripe */}
        <div
          className="h-1.5 w-full"
          style={{
            background:
              rank === 1
                ? 'linear-gradient(90deg, #FBBF24, #F59E0B)'
                : rank === 2
                ? 'linear-gradient(90deg, #D4D4D8, #A1A1AA)'
                : rank === 3
                ? 'linear-gradient(90deg, #C2703A, #92400E)'
                : THEME.border,
          }}
        />

        {/* Avatar + name */}
        <div className="flex items-start gap-3 p-4 pb-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold"
            style={{
              background: `${avatarColor}18`,
              color: avatarColor,
              fontFamily: THEME.fontMono,
            }}
          >
            {initials(athlete.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div
                  className="truncate text-[14px] font-semibold leading-tight"
                  style={{ color: THEME.textPrimary }}
                >
                  {athlete.name}
                </div>
                <div
                  className="mt-0.5 text-[10px] uppercase tracking-[0.14em]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                >
                  {athlete.side} · {athlete.status}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {flagged ? (
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                    style={{
                      background: `${flagColor ?? THEME.red}14`,
                      color: flagColor ?? THEME.red,
                      fontFamily: THEME.fontMono,
                      border: `1px solid ${flagColor ?? THEME.red}55`,
                    }}
                  >
                    Flag
                  </span>
                ) : null}
                <div
                  className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                  style={{
                    background: THEME.light,
                    color: THEME.textSecondary,
                    fontFamily: THEME.fontMono,
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  #{String(rank).padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Erg performance bar */}
        {pct !== null && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 overflow-hidden rounded-full" style={{ background: THEME.border }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: pct >= 70
                      ? `linear-gradient(90deg, ${THEME.primary}, ${THEME.accent})`
                      : pct >= 40
                      ? `linear-gradient(90deg, ${THEME.amber}, #FBBF24)`
                      : `linear-gradient(90deg, ${THEME.red}, #F87171)`,
                  }}
                />
              </div>
              <span className="text-[8px] shrink-0" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                {fmt2k(erg?.timeSeconds)}
              </span>
            </div>
          </div>
        )}

        {/* Metrics strip */}
        <div
          className="grid grid-cols-3 border-t"
          style={{ borderColor: THEME.border, background: THEME.light }}
        >
          <Metric label="2K" value={fmt2k(erg?.timeSeconds)} accent={THEME.primary} />
          <Metric label="Split" value={fmt2k(erg?.splitSeconds)} />
          <RecoveryMetric recovery={recovery} />
        </div>
      </Link>

      {/* Ask synth button — outside Link so it doesn't navigate */}
      {!selectMode && (
        <button
          type="button"
          onClick={() => openChat({ athleteId: athlete.id })}
          className="w-full py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-colors hover:opacity-90"
          style={{
            background: THEME.primary,
            color: THEME.white,
            fontFamily: THEME.fontMono,
            borderTop: `1px solid ${THEME.primaryDark}`,
          }}
        >
          Ask synth. →
        </button>
      )}
    </motion.div>
  )
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="flex flex-col items-center py-2.5">
      <div
        className="text-[8px] font-semibold uppercase tracking-[0.16em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        {label}
      </div>
      <div
        className="text-[13px] font-semibold"
        style={{ fontFamily: THEME.fontMono, color: accent ?? THEME.textPrimary }}
      >
        {value}
      </div>
    </div>
  )
}

function RecoveryMetric({ recovery }: { recovery?: number }) {
  const accent = recovery !== undefined ? recoveryAccent(recovery) : THEME.textMuted
  const value = recovery !== undefined ? `${recovery}%` : '—'

  return (
    <div className="flex flex-col items-center py-2">
      <div
        className="text-[8px] font-semibold uppercase tracking-[0.16em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        Recovery
      </div>
      <span
        className="mt-0.5 inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-semibold"
        style={{
          fontFamily: THEME.fontMono,
          background: `${accent}18`,
          color: accent,
        }}
      >
        {value}
      </span>
    </div>
  )
}
