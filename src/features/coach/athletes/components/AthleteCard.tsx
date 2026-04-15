import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { THEME } from '../../../../lib/theme'
import type { Athlete, ErgScore } from '../../../../shared/data/types'

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

export function AthleteCard({
  athlete,
  erg,
  rank,
}: {
  athlete: Athlete
  erg?: ErgScore
  rank: number
}) {
  const avatarColor = AVATAR_COLORS[athlete.avatarColorIndex ?? 0]

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden rounded-xl border"
      style={{
        background: THEME.white,
        borderColor: THEME.border,
        boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 16px 32px -24px rgba(24,24,27,0.18)',
      }}
    >
      <Link to={`/coach/athletes/${athlete.id}`} className="block">
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
        <div className="flex items-start gap-3 p-4">
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
              <div
                className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
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
        <div
          className="grid grid-cols-3 border-t"
          style={{ borderColor: THEME.border, background: THEME.light }}
        >
          <Metric label="2K" value={fmt2k(erg?.timeSeconds)} accent={THEME.primary} />
          <Metric label="Split" value={fmt2k(erg?.splitSeconds)} />
          <Metric label="Watts" value={erg?.watts ? String(erg.watts) : '—'} />
        </div>
      </Link>
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
