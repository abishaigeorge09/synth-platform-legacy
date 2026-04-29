import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { SheetShell } from './SheetShell'
import { SYNTH } from '../lib/theme'
import type { RaceBoat, Split } from './RaceRecorder'
import { fmtElapsed } from './RaceRecorder'

export type RaceRating = {
  boatId: string
  technique: number // 1-5
  power: number // 1-5
  sync: number // 1-5
}

export type SaveRaceResult = {
  name: string
  description: string
  raceType: string
  ratings: RaceRating[]
  ratedByCoach: string
  privateNotes: string
  visibility: 'team' | 'coaches' | 'private'
}

const RACE_TYPES = ['Practice piece', 'Time trial', 'Seat race', 'Regatta', 'Other'] as const
const COACHES = ['Coach Geri', 'Coach Mike', 'Coach Asha', 'Assistant Coach Lin'] as const

type Props = {
  open: boolean
  onClose: () => void
  boats: RaceBoat[]
  elapsedMs: number
  splits: Split[]
  /** True for stopwatch (single boat / lap mode) — hides rating UI */
  lapMode?: boolean
  onSave: (result: SaveRaceResult) => void
  /** Optional — when present, shows a "Save without rating" CTA that
   * lets the coach skip rating now and rate later. */
  onSkip?: () => void
}

/**
 * Strava's "Save Activity" form translated for boat racing. After the
 * RaceRecorder finishes, this sheet captures the qualitative pieces:
 * race name, narrative, type, per-boat ratings, the coach who's making
 * the rating (so it shows up tagged in history), private notes, and
 * visibility scope.
 */
export function SaveRaceSheet({ open, onClose, boats, elapsedMs, splits, lapMode = false, onSave, onSkip }: Props) {
  const [name, setName] = useState(`Race · ${new Date().toLocaleDateString()}`)
  const [description, setDescription] = useState('')
  const [raceType, setRaceType] = useState<string>(RACE_TYPES[0])
  const [ratedBy, setRatedBy] = useState<string>(COACHES[0])
  const [ratings, setRatings] = useState<Record<string, { technique: number; power: number; sync: number }>>(
    Object.fromEntries(boats.map((b) => [b.id, { technique: 4, power: 4, sync: 4 }])),
  )
  const [privateNotes, setPrivateNotes] = useState('')
  const [visibility, setVisibility] = useState<'team' | 'coaches' | 'private'>('team')

  const updateRating = (boatId: string, key: 'technique' | 'power' | 'sync', value: number) => {
    setRatings((prev) => ({
      ...prev,
      [boatId]: { ...prev[boatId], [key]: value },
    }))
  }

  const submit = () => {
    onSave({
      name: name.trim() || 'Untitled race',
      description: description.trim(),
      raceType,
      ratings: boats.map((b) => ({ boatId: b.id, ...(ratings[b.id] ?? { technique: 4, power: 4, sync: 4 }) })),
      ratedByCoach: ratedBy,
      privateNotes: privateNotes.trim(),
      visibility,
    })
    onClose()
  }

  return (
    <SheetShell open={open} onClose={onClose} title="Save race">
      {/* Time + split count summary */}
      <div className="grid grid-cols-3 gap-2">
        <SummaryStat label="Time" value={fmtElapsed(elapsedMs)} />
        <SummaryStat label="Boats" value={`${boats.length}`} />
        <SummaryStat label={lapMode ? 'Laps' : 'Splits'} value={`${splits.length}`} />
      </div>

      {/* Race name */}
      <Field label="Race name">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border px-3 py-3 text-[14px] outline-none"
          style={{
            background: SYNTH.sheetMuted,
            borderColor: 'transparent',
            color: SYNTH.ink,
            fontFamily: SYNTH.font,
          }}
        />
      </Field>

      {/* How did it go? */}
      <Field label="How did it go?">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Race notes, conditions, technique cues…"
          className="w-full resize-none rounded-xl border px-3 py-3 text-[14px] outline-none placeholder:text-zinc-400"
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
        <DropdownChip
          value={raceType}
          options={RACE_TYPES.map((t) => t)}
          onChange={(v) => setRaceType(v)}
        />
      </Field>

      {/* Per-boat ratings (only for race mode, not lap-mode stopwatch) */}
      {!lapMode ? (
        <Field label="Rate each boat">
          <div className="flex flex-col gap-3">
            {boats.map((b) => {
              const r = ratings[b.id] ?? { technique: 4, power: 4, sync: 4 }
              return (
                <div
                  key={b.id}
                  className="rounded-xl px-3 py-3"
                  style={{ background: SYNTH.sheetMuted }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                      style={{ background: b.color, color: SYNTH.inkOnBrand }}
                    />
                    <p
                      className="text-[13px] font-bold"
                      style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
                    >
                      {b.name}
                    </p>
                  </div>
                  <RatingRow label="Technique" value={r.technique} onChange={(v) => updateRating(b.id, 'technique', v)} />
                  <RatingRow label="Power" value={r.power} onChange={(v) => updateRating(b.id, 'power', v)} />
                  <RatingRow label="Sync" value={r.sync} onChange={(v) => updateRating(b.id, 'sync', v)} />
                </div>
              )
            })}
          </div>
        </Field>
      ) : null}

      {/* Rated by which coach (visible in history) */}
      {!lapMode ? (
        <Field label="Rated by">
          <DropdownChip
            value={ratedBy}
            options={COACHES.map((c) => c)}
            onChange={(v) => setRatedBy(v)}
          />
        </Field>
      ) : null}

      {/* Private notes */}
      <Field label="Private notes">
        <textarea
          value={privateNotes}
          onChange={(e) => setPrivateNotes(e.target.value)}
          rows={2}
          placeholder="Only you can see these"
          className="w-full resize-none rounded-xl border px-3 py-3 text-[13px] outline-none placeholder:text-zinc-400"
          style={{
            background: SYNTH.sheetMuted,
            borderColor: 'transparent',
            color: SYNTH.ink,
            fontFamily: SYNTH.font,
          }}
        />
      </Field>

      {/* Visibility */}
      <Field label="Visibility">
        <div className="grid grid-cols-3 gap-2">
          {(['team', 'coaches', 'private'] as const).map((v) => {
            const active = visibility === v
            return (
              <button
                key={v}
                type="button"
                onClick={() => setVisibility(v)}
                className="rounded-full px-3 py-2 text-[12px] font-semibold capitalize transition-colors"
                style={{
                  background: active ? SYNTH.ink : SYNTH.sheetMuted,
                  color: active ? SYNTH.inkOnBrand : SYNTH.ink,
                  fontFamily: SYNTH.font,
                }}
              >
                {v}
              </button>
            )
          })}
        </div>
      </Field>

      {/* Save */}
      <button
        type="button"
        onClick={submit}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-semibold"
        style={{
          background: SYNTH.accentEmerald,
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
        }}
      >
        <Check size={14} strokeWidth={2.6} />
        Save with ratings
      </button>

      {/* Skip rating — saves the run without ratings; session lands in
          'needs-rating' so the coach can add them later. */}
      {onSkip ? (
        <button
          type="button"
          onClick={() => {
            onSkip()
            onClose()
          }}
          className="text-[13px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
        >
          Save without rating · rate later
        </button>
      ) : null}
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

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl px-3 py-2" style={{ background: SYNTH.sheetMuted }}>
      <p
        className="text-[9px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
      >
        {label}
      </p>
      <p
        className="mt-0.5 text-[16px] font-bold"
        style={{ color: SYNTH.ink, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </p>
    </div>
  )
}

function RatingRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <span
        className="w-[68px] text-[11px] font-semibold"
        style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
      >
        {label}
      </span>
      <div className="flex flex-1 items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => onChange(n)}
            className="h-7 flex-1 rounded-md transition-colors"
            style={{
              background: n <= value ? SYNTH.accentEmerald : 'rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          />
        ))}
      </div>
      <span
        className="w-5 text-right text-[11px] font-bold"
        style={{ color: SYNTH.ink, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </span>
    </div>
  )
}

function DropdownChip({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border px-3 py-3 text-[14px] outline-none"
        style={{
          background: SYNTH.sheetMuted,
          borderColor: 'transparent',
          color: SYNTH.ink,
          fontFamily: SYNTH.font,
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        color={SYNTH.inkMuted}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
      />
    </div>
  )
}
