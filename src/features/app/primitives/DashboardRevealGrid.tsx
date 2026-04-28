import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { APP_THEME } from '../lib/theme'

export type RevealCard = {
  label: string
  value: string
  unit?: string
  ringPercent: number
  color: string
  icon?: ReactNode
}

type Props = {
  cards: RevealCard[]
}

const RING_RADIUS = 28
const RING_CIRC = 2 * Math.PI * RING_RADIUS

export function DashboardRevealGrid({ cards }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-3 rounded-2xl border p-4"
          style={{ background: APP_THEME.surface, borderColor: APP_THEME.divider }}
        >
          <div className="flex items-center gap-2">
            {card.icon ? (
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: `${card.color}1A` }}
              >
                {card.icon}
              </span>
            ) : null}
            <span
              className="text-[12px] font-semibold uppercase tracking-[0.12em]"
              style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textMuted }}
            >
              {card.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Ring percent={card.ringPercent} color={card.color} />
            <div className="flex flex-1 items-baseline gap-1">
              <span
                className="text-[22px] font-bold leading-none"
                style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.text }}
              >
                {card.value}
              </span>
              {card.unit ? (
                <span
                  className="text-[12px] font-semibold"
                  style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textFaint }}
                >
                  {card.unit}
                </span>
              ) : null}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function Ring({ percent, color }: { percent: number; color: string }) {
  const clamped = Math.max(0, Math.min(100, percent))
  const offset = RING_CIRC * (1 - clamped / 100)
  return (
    <svg width={64} height={64} viewBox="0 0 64 64" className="-rotate-90 shrink-0">
      <circle cx={32} cy={32} r={RING_RADIUS} stroke={APP_THEME.divider} strokeWidth={5} fill="none" />
      <motion.circle
        cx={32}
        cy={32}
        r={RING_RADIUS}
        stroke={color}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={RING_CIRC}
        initial={{ strokeDashoffset: RING_CIRC }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      />
    </svg>
  )
}
