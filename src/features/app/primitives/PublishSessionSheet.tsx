import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
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
  const [notes, setNotes] = useState('')
  const titleRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!open) return
    setTitle('')
    setRaceType('Steady state')
    setOtherType('')
    setDate(new Date().toISOString().slice(0, 10))
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

      {/* Date */}
      <Field label="Date">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border px-3 py-3 text-[14px] outline-none"
          style={{
            background: SYNTH.sheetMuted,
            borderColor: 'transparent',
            color: SYNTH.ink,
            fontFamily: SYNTH.font,
          }}
        />
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
