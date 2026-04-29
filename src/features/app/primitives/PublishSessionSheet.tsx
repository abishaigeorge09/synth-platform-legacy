import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { SheetShell } from './SheetShell'
import { SYNTH } from '../lib/theme'
import { useLineupBuilderStore } from '../data/lineupBuilderStore'
import { useSessionsStore } from '../data/useSessionsStore'

const RACE_TYPES = ['Practice piece', 'Steady state', 'Time trial', 'Seat race', 'Race', 'Other'] as const
type RaceType = typeof RACE_TYPES[number]

type Props = {
  open: boolean
  onClose: () => void
  onPublished: (sessionId: string) => void
}

/**
 * Publish-session sheet. Asked at publish time: "What is this for?"
 * Title (required) + race type pills (with free-form Other) + date +
 * optional notes. Saves a Session record and resets the builder draft.
 */
export function PublishSessionSheet({ open, onClose, onPublished }: Props) {
  const boats = useLineupBuilderStore((s) => s.boats)
  const preset = useLineupBuilderStore((s) => s.preset)
  const resetDraft = useLineupBuilderStore((s) => s.resetDraft)
  const addSession = useSessionsStore((s) => s.addSession)

  const [title, setTitle] = useState('')
  const [raceType, setRaceType] = useState<RaceType>('Steady state')
  const [otherType, setOtherType] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState(() => roundedNowHHmm())
  const [whenOpen, setWhenOpen] = useState<'date' | 'time' | null>(null)
  const [notes, setNotes] = useState('')
  const titleRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!open) return
    setTitle('')
    setRaceType('Steady state')
    setOtherType('')
    setDate(new Date().toISOString().slice(0, 10))
    setTime(roundedNowHHmm())
    setWhenOpen(null)
    setNotes('')
    setTimeout(() => titleRef.current?.focus(), 80)
  }, [open])

  const finalType = raceType === 'Other' ? (otherType.trim() || 'Other') : raceType
  const canPublish =
    title.trim().length > 0 &&
    boats.length > 0 &&
    (raceType !== 'Other' || otherType.trim().length > 0)

  const submit = () => {
    if (!canPublish) return
    const session = addSession({
      name: title.trim(),
      type: finalType,
      date,
      time,
      notes: notes.trim(),
      boats,
      preset,
    })
    resetDraft()
    onPublished(session.id)
    onClose()
  }

  return (
    <SheetShell open={open} onClose={onClose} title="What is this session for?">
      {/* Title */}
      <Field label="Session title">
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Wednesday AM steady state"
          className="w-full rounded-xl border px-3 py-3 text-[14px] outline-none"
          style={{
            background: SYNTH.sheetMuted,
            borderColor: 'transparent',
            color: SYNTH.ink,
            fontFamily: SYNTH.font,
          }}
        />
      </Field>

      {/* Race type */}
      <Field label="Race type">
        <div className="flex flex-wrap gap-1.5">
          {RACE_TYPES.map((t) => {
            const active = raceType === t
            return (
              <button
                key={t}
                type="button"
                onClick={() => setRaceType(t)}
                className="rounded-full px-3 py-1.5 text-[12px] font-semibold"
                style={{
                  background: active ? SYNTH.ink : SYNTH.sheetMuted,
                  color: active ? SYNTH.inkOnBrand : SYNTH.ink,
                  fontFamily: SYNTH.font,
                }}
              >
                {t}
              </button>
            )
          })}
        </div>
        {raceType === 'Other' ? (
          <input
            type="text"
            value={otherType}
            onChange={(e) => setOtherType(e.target.value)}
            placeholder="Type the race kind…"
            className="mt-2 w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none"
            style={{
              background: SYNTH.sheetMuted,
              borderColor: 'transparent',
              color: SYNTH.ink,
              fontFamily: SYNTH.font,
            }}
          />
        ) : null}
      </Field>

      {/* When — Apple-style inline date + time pickers */}
      <Field label="When">
        <div className="grid grid-cols-2 gap-2">
          <PickerTrigger
            icon={<Calendar size={14} strokeWidth={2.4} />}
            label={fmtDateLong(date)}
            active={whenOpen === 'date'}
            onClick={() => setWhenOpen(whenOpen === 'date' ? null : 'date')}
          />
          <PickerTrigger
            icon={<Clock size={14} strokeWidth={2.4} />}
            label={fmtTime12h(time)}
            active={whenOpen === 'time'}
            onClick={() => setWhenOpen(whenOpen === 'time' ? null : 'time')}
          />
        </div>
        <AnimatePresence initial={false}>
          {whenOpen === 'date' ? (
            <motion.div
              key="date-pop"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <AppleCalendar
                value={date}
                onChange={(d) => {
                  setDate(d)
                  setWhenOpen(null)
                }}
              />
            </motion.div>
          ) : null}
          {whenOpen === 'time' ? (
            <motion.div
              key="time-pop"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <AppleTimePicker value={time} onChange={setTime} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Field>

      {/* Notes */}
      <Field label="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Context for the coaches running it…"
          className="w-full resize-none rounded-xl border px-3 py-3 text-[14px] outline-none"
          style={{
            background: SYNTH.sheetMuted,
            borderColor: 'transparent',
            color: SYNTH.ink,
            fontFamily: SYNTH.font,
          }}
        />
      </Field>

      {/* Summary */}
      <div className="rounded-2xl px-4 py-3" style={{ background: SYNTH.sheetMuted }}>
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
        >
          Including
        </p>
        <p
          className="mt-1 text-[13px]"
          style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
        >
          {boats.length} boat{boats.length === 1 ? '' : 's'} · {preset.raceFor} · {preset.distance}
        </p>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!canPublish}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-bold disabled:opacity-40"
        style={{
          background: SYNTH.accentEmerald,
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
        }}
      >
        <Send size={14} strokeWidth={2.8} />
        Publish session
      </button>
    </SheetShell>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
      >
        {label}
      </p>
      {children}
    </div>
  )
}

// ─── Date / time helpers ─────────────────────────────────────────────────────

function roundedNowHHmm(): string {
  // Snap to the next 15-minute mark — feels right for a session start time.
  const d = new Date()
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15)
  d.setSeconds(0)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function fmtDateLong(iso: string): string {
  // "Wed, Apr 29"
  const [y, m, d] = iso.split('-').map(Number)
  if (!y) return 'Pick a date'
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function fmtTime12h(hhmm: string): string {
  // "6:30 AM"
  const [hStr, mStr] = hhmm.split(':')
  const h = Number(hStr)
  if (Number.isNaN(h)) return 'Pick a time'
  const meridiem = h >= 12 ? 'PM' : 'AM'
  const display = h % 12 === 0 ? 12 : h % 12
  return `${display}:${mStr ?? '00'} ${meridiem}`
}

function isoFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Picker trigger ──────────────────────────────────────────────────────────

function PickerTrigger({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex h-12 w-full items-center gap-2 rounded-xl px-3 text-left"
      style={{
        background: active ? '#FFFFFF' : SYNTH.sheetMuted,
        border: `1px solid ${active ? '#1E40FF' : 'transparent'}`,
        color: SYNTH.ink,
        fontFamily: SYNTH.font,
        boxShadow: active ? '0 1px 0 rgba(30,64,255,0.10) inset, 0 4px 14px -8px rgba(30,64,255,0.4)' : 'none',
      }}
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ background: active ? '#1E40FF' : '#FFFFFF', color: active ? '#FFFFFF' : SYNTH.inkMuted }}
      >
        {icon}
      </span>
      <span className="truncate text-[13px] font-bold">{label}</span>
    </motion.button>
  )
}

// ─── Apple-style calendar ────────────────────────────────────────────────────

const APPLE_BLUE = '#0A84FF'
const APPLE_RED = '#FF3B30'
const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function AppleCalendar({
  value,
  onChange,
}: {
  value: string
  onChange: (iso: string) => void
}) {
  const initial = useMemo(() => {
    const [y, m] = value.split('-').map(Number)
    if (y && m) return new Date(y, m - 1, 1)
    const d = new Date()
    d.setDate(1)
    return d
  }, [value])
  const [view, setView] = useState<Date>(initial)

  const todayIso = isoFromDate(new Date())

  // Build the 6×7 grid: starts from the Sunday on or before the 1st of the
  // viewed month, runs 42 days forward.
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
      className="mt-2 rounded-2xl p-3"
      style={{
        background: '#FFFFFF',
        border: `1px solid ${SYNTH.sheetMuted}`,
        boxShadow: '0 12px 32px -16px rgba(8,8,40,0.18)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-2">
        <span
          className="text-[15px] font-bold"
          style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
        >
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

      {/* Weekday letters */}
      <div className="grid grid-cols-7 px-0.5 pb-1.5">
        {WEEKDAY_LETTERS.map((d, i) => (
          <span
            key={i}
            className="text-center text-[10px] font-semibold uppercase tracking-[0.06em]"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
          >
            {d}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5 px-0.5">
        {cells.map((d) => {
          const iso = isoFromDate(d)
          const inMonth = d.getMonth() === view.getMonth()
          const isToday = iso === todayIso
          const isSelected = iso === value
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
              className="flex h-9 w-full items-center justify-center"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-[14px]"
                style={{
                  background: isSelected ? APPLE_BLUE : 'transparent',
                  color: dayColor,
                  fontFamily: SYNTH.font,
                  fontWeight: isToday || isSelected ? 700 : 500,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {d.getDate()}
              </span>
            </button>
          )
        })}
      </div>

      {/* Footer — Today shortcut */}
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
          style={{ color: APPLE_BLUE, fontFamily: SYNTH.font }}
        >
          Today
        </button>
        <span
          className="text-[10px] uppercase tracking-[0.14em]"
          style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
        >
          Tap a day to pick
        </span>
      </div>
    </div>
  )
}

// ─── Apple-style time picker ─────────────────────────────────────────────────

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1) // 1..12
const MINUTES_5 = Array.from({ length: 12 }, (_, i) => i * 5) // 0,5,...,55

function AppleTimePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (hhmm: string) => void
}) {
  const [hStr, mStr] = value.split(':')
  const hour24 = Number(hStr) || 0
  const minute = Number(mStr) || 0
  const meridiem: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12

  const setHour = (h12: number) => {
    const h24 = meridiem === 'AM' ? (h12 === 12 ? 0 : h12) : h12 === 12 ? 12 : h12 + 12
    onChange(`${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
  }
  const setMinute = (m: number) => {
    onChange(`${String(hour24).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
  const setMeridiem = (next: 'AM' | 'PM') => {
    if (next === meridiem) return
    const newH24 = next === 'AM' ? hour24 - 12 : hour24 + 12
    const safeH = ((newH24 % 24) + 24) % 24
    onChange(`${String(safeH).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
  }

  return (
    <div
      className="mt-2 rounded-2xl p-3"
      style={{
        background: '#FFFFFF',
        border: `1px solid ${SYNTH.sheetMuted}`,
        boxShadow: '0 12px 32px -16px rgba(8,8,40,0.18)',
      }}
    >
      <div className="flex items-center justify-between px-1 pb-2.5">
        <span
          className="text-[15px] font-bold"
          style={{
            color: SYNTH.ink,
            fontFamily: SYNTH.font,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {fmtTime12h(value)}
        </span>
        {/* AM / PM toggle */}
        <div
          className="flex rounded-full p-0.5"
          style={{ background: SYNTH.sheetMuted }}
        >
          {(['AM', 'PM'] as const).map((m) => {
            const active = m === meridiem
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMeridiem(m)}
                className="rounded-full px-3 py-1 text-[11px] font-bold"
                style={{
                  background: active ? APPLE_BLUE : 'transparent',
                  color: active ? '#FFFFFF' : SYNTH.inkMuted,
                  fontFamily: SYNTH.font,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {m}
              </button>
            )
          })}
        </div>
      </div>

      {/* Hour row */}
      <PillRow
        label="Hour"
        items={HOURS_12.map((h) => ({ key: String(h), label: String(h), active: h === hour12, onPress: () => setHour(h) }))}
      />

      {/* Minute row */}
      <div className="mt-2.5">
        <PillRow
          label="Min"
          items={MINUTES_5.map((m) => ({
            key: String(m),
            label: String(m).padStart(2, '0'),
            active: m === minute,
            onPress: () => setMinute(m),
          }))}
        />
      </div>
    </div>
  )
}

function PillRow({
  label,
  items,
}: {
  label: string
  items: Array<{ key: string; label: string; active: boolean; onPress: () => void }>
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-9 shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
      >
        {label}
      </span>
      <div
        className="synth-scroll flex flex-1 gap-1 overflow-x-auto py-0.5"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((it) => (
          <button
            key={it.key}
            type="button"
            onClick={it.onPress}
            className="flex h-9 min-w-[36px] shrink-0 items-center justify-center rounded-full px-2 text-[13px]"
            style={{
              background: it.active ? APPLE_BLUE : SYNTH.sheetMuted,
              color: it.active ? '#FFFFFF' : SYNTH.ink,
              fontFamily: SYNTH.font,
              fontWeight: it.active ? 700 : 500,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  )
}
