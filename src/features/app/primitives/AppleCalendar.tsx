/* eslint-disable react-refresh/only-export-components */
// Primitive module: exports both components and shared constants/helpers.
// Splitting them across files would scatter cohesive UI logic; trade-off
// is full HMR reload on edits to this file.
import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SYNTH } from '../lib/theme'

const APPLE_BLUE = '#0A84FF'
const APPLE_RED = '#FF3B30'
const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export type AppleCalendarProps = {
  /** ISO date string YYYY-MM-DD */
  value: string
  onChange: (iso: string) => void
  /** Optional list of ISO dates that should render a small dot under the day,
   *  e.g. dates that have a scheduled session. */
  markedDates?: string[]
  /** Override the bundled mt-2 spacer (set to '' to remove). */
  className?: string
}

/**
 * Apple-Calendar-style month picker. White card on a dim/transparent
 * surface — works on both light sheet bodies and the cobalt /app surface
 * because it brings its own background.
 */
export function AppleCalendar({ value, onChange, markedDates, className = 'mt-2' }: AppleCalendarProps) {
  const initial = useMemo(() => {
    const [y, m] = value.split('-').map(Number)
    if (y && m) return new Date(y, m - 1, 1)
    const d = new Date()
    d.setDate(1)
    return d
  }, [value])
  const [view, setView] = useState<Date>(initial)

  const todayIso = isoFromDate(new Date())
  const markedSet = useMemo(() => new Set(markedDates ?? []), [markedDates])

  // 6×7 grid: starts from the Sunday on or before the 1st of the viewed month.
  const cells = useMemo(() => {
    const start = new Date(view.getFullYear(), view.getMonth(), 1)
    start.setDate(start.getDate() - start.getDay())
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [view])

  const monthLabel = view.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  const stepMonth = (dir: 1 | -1) => {
    const next = new Date(view)
    next.setMonth(next.getMonth() + dir)
    setView(next)
  }

  return (
    <div
      className={`${className} rounded-2xl p-3`}
      style={{
        background: '#FFFFFF',
        border: `1px solid ${SYNTH.sheetMuted}`,
        boxShadow: '0 16px 36px -16px rgba(8,8,40,0.32)',
        color: SYNTH.ink,
        fontFamily: SYNTH.font,
      }}
    >
      <div className="flex items-center justify-between px-1 pb-2">
        <span className="text-[15px] font-bold" style={{ color: SYNTH.ink }}>
          {monthLabel}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => stepMonth(-1)}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ color: APPLE_BLUE }}
          >
            <ChevronLeft size={18} strokeWidth={2.6} />
          </button>
          <button
            type="button"
            onClick={() => stepMonth(1)}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ color: APPLE_BLUE }}
          >
            <ChevronRight size={18} strokeWidth={2.6} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 px-0.5 pb-1.5">
        {WEEKDAY_LETTERS.map((d, i) => (
          <span
            key={i}
            className="text-center text-[10px] font-semibold uppercase tracking-[0.06em]"
            style={{ color: SYNTH.inkMuted }}
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5 px-0.5">
        {cells.map((d) => {
          const iso = isoFromDate(d)
          const inMonth = d.getMonth() === view.getMonth()
          const isToday = iso === todayIso
          const isSelected = iso === value
          const isMarked = markedSet.has(iso)
          const dayColor = !inMonth
            ? '#C7C7CC'
            : isSelected
              ? '#FFFFFF'
              : isToday
                ? APPLE_RED
                : SYNTH.ink

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onChange(iso)}
              className="flex h-9 w-full flex-col items-center justify-center"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-[14px]"
                style={{
                  background: isSelected ? APPLE_BLUE : 'transparent',
                  color: dayColor,
                  fontWeight: isToday || isSelected ? 700 : 500,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {d.getDate()}
              </span>
              {isMarked ? (
                <span
                  aria-hidden
                  className="mt-px inline-block h-1 w-1 rounded-full"
                  style={{
                    background: isSelected ? '#FFFFFF' : APPLE_BLUE,
                  }}
                />
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="mt-2 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => {
            const t = new Date()
            t.setDate(1)
            setView(t)
            onChange(todayIso)
          }}
          className="rounded-full px-2.5 py-1 text-[12px] font-semibold"
          style={{ color: APPLE_BLUE }}
        >
          Today
        </button>
        <span
          className="text-[10px] uppercase tracking-[0.14em]"
          style={{ color: SYNTH.inkMuted }}
        >
          Tap a day to pick
        </span>
      </div>
    </div>
  )
}

export function isoFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
