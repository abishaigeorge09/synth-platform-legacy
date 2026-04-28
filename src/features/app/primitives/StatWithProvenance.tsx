import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { APP_THEME } from '../lib/theme'

type Props = {
  value: string
  unit?: string
  label: string
  source: string
  syncedAgo: string
  accent?: string
  delta?: { direction: 'up' | 'down' | 'flat'; value: string }
  icon?: ReactNode
}

export function StatWithProvenance({
  value,
  unit,
  label,
  source,
  syncedAgo,
  accent = APP_THEME.brand,
  delta,
  icon,
}: Props) {
  const DeltaIcon = delta?.direction === 'up' ? ArrowUp : delta?.direction === 'down' ? ArrowDown : Minus
  const deltaColor =
    delta?.direction === 'up' ? '#10B981' : delta?.direction === 'down' ? '#EF4444' : APP_THEME.textFaint

  return (
    <div
      className="flex flex-col gap-2 rounded-2xl border p-4"
      style={{ background: APP_THEME.surface, borderColor: APP_THEME.divider }}
    >
      <div className="flex items-center gap-2">
        {icon ? (
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: `${accent}1A` }}
          >
            {icon}
          </span>
        ) : null}
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textMuted }}
        >
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className="text-[26px] font-bold leading-none"
          style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.text }}
        >
          {value}
        </span>
        {unit ? (
          <span
            className="text-[12px] font-semibold"
            style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textFaint }}
          >
            {unit}
          </span>
        ) : null}
        {delta ? (
          <span
            className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold"
            style={{ fontFamily: APP_THEME.fontMono, color: deltaColor }}
          >
            <DeltaIcon size={12} strokeWidth={2.6} />
            {delta.value}
          </span>
        ) : null}
      </div>
      <p
        className="mt-1 text-[10px] uppercase tracking-[0.12em]"
        style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textFaint }}
      >
        {source} · synced {syncedAgo}
      </p>
    </div>
  )
}
