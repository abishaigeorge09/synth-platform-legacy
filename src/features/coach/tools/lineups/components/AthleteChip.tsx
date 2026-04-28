import { useDraggable } from '@dnd-kit/core'
import { THEME } from '../../../../../lib/theme'
import type { Athlete, ErgScore } from '../../../../../shared/data/types'

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

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

function fmt2k(seconds?: number) {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = (seconds - m * 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

export function AthleteChip({
  athlete,
  erg,
  compact,
  onRemove,
}: {
  athlete: Athlete
  erg?: ErgScore
  compact?: boolean
  onRemove?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: athlete.id,
  })

  const color = AVATAR_COLORS[athlete.avatarColorIndex ?? 0]
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.35 : 1,
    background: 'var(--bg-primary)',
    border: `1px solid ${THEME.border}`,
    borderLeft: `3px solid ${color}`,
    cursor: 'grab',
  }

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        className="group flex items-center gap-2 rounded-md px-2 py-1.5"
      >
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold"
          style={{ background: `${color}20`, color, fontFamily: THEME.fontMono }}
        >
          {initials(athlete.name)}
        </span>
        <span
          className="truncate text-[11px] font-semibold"
          style={{ color: THEME.textPrimary }}
        >
          {athlete.name}
        </span>
        {onRemove && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="ml-auto text-[11px] opacity-40 transition-opacity hover:opacity-100"
            style={{ color: THEME.textSecondary }}
            aria-label="Remove"
          >
            ✕
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="group flex items-center gap-3 rounded-lg px-3 py-2"
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
        style={{ background: `${color}20`, color, fontFamily: THEME.fontMono }}
      >
        {initials(athlete.name)}
      </span>
      <div className="min-w-0 flex-1">
        <div
          className="truncate text-[12px] font-semibold"
          style={{ color: THEME.textPrimary }}
        >
          {athlete.name}
        </div>
        <div
          className="text-[10px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          {athlete.side} · {fmt2k(erg?.timeSeconds)}
        </div>
      </div>
    </div>
  )
}
