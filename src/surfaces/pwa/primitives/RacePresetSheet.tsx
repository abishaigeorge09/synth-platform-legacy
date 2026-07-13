import { useState } from 'react'
import { Plus, Check, X as XIcon } from 'lucide-react'
import { SheetShell } from './SheetShell'
import { SYNTH } from '../lib/theme'
import { useLineupBuilderStore, type RacePreset } from '../data/lineupBuilderStore'

type PresetTemplate = RacePreset

const TEMPLATES: PresetTemplate[] = [
  {
    raceFor: 'Race-pace pieces',
    distance: '2K · 4 × 500m',
    splits: [
      { label: '500m', position: 0.25 },
      { label: '1000m', position: 0.5 },
      { label: '1500m', position: 0.75 },
      { label: '2000m', position: 1 },
    ],
    splitUnit: 's',
    expectedDurationMs: 400_000,
  },
  {
    raceFor: 'Time trial',
    distance: '6K · 6 × 1000m',
    splits: [
      { label: '1000m', position: 1 / 6 },
      { label: '2000m', position: 2 / 6 },
      { label: '3000m', position: 3 / 6 },
      { label: '4000m', position: 4 / 6 },
      { label: '5000m', position: 5 / 6 },
      { label: '6000m', position: 1 },
    ],
    splitUnit: 's',
    expectedDurationMs: 1_320_000,
  },
  {
    raceFor: 'Seat race',
    distance: '500m · 1 piece',
    splits: [{ label: 'Finish', position: 1 }],
    splitUnit: 'ms',
    expectedDurationMs: 100_000,
  },
  {
    raceFor: 'Starts',
    distance: '8 × 30s',
    splits: Array.from({ length: 8 }, (_, i) => ({
      label: `Start ${i + 1}`,
      position: (i + 1) / 8,
    })),
    splitUnit: 'ms',
    expectedDurationMs: 240_000,
  },
  {
    raceFor: 'Practice',
    distance: 'Open',
    splits: Array.from({ length: 10 }, (_, i) => ({
      label: `Lap ${i + 1}`,
      position: (i + 1) / 10,
    })),
    splitUnit: 's',
    expectedDurationMs: 600_000,
  },
]

type Props = {
  open: boolean
  onClose: () => void
}

export function RacePresetSheet({ open, onClose }: Props) {
  const preset = useLineupBuilderStore((s) => s.preset)
  const customPresets = useLineupBuilderStore((s) => s.customPresets)
  const applyPreset = useLineupBuilderStore((s) => s.applyPreset)
  const setPreset = useLineupBuilderStore((s) => s.setPreset)
  const addCustomPreset = useLineupBuilderStore((s) => s.addCustomPreset)
  const removeCustomPreset = useLineupBuilderStore((s) => s.removeCustomPreset)

  const [creating, setCreating] = useState(false)

  const apply = (t: PresetTemplate) => {
    applyPreset(t)
    onClose()
  }

  const all: PresetTemplate[] = [...customPresets, ...TEMPLATES]

  return (
    <SheetShell open={open} onClose={onClose} title="Configure session">
      <p className="text-[13px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
        Pick a template, build your own, and pick the unit each split is timed in.
      </p>

      <div className="flex flex-col gap-2">
        {all.map((t, i) => {
          const isActive = preset.raceFor === t.raceFor && preset.distance === t.distance
          return (
            <div
              key={`${t.raceFor}-${t.distance}-${i}`}
              className="relative rounded-2xl"
              style={{
                background: isActive ? `${SYNTH.accentEmerald}26` : SYNTH.sheetMuted,
                border: `1px solid ${isActive ? SYNTH.accentEmerald : 'transparent'}`,
              }}
            >
              <button
                type="button"
                onClick={() => apply(t)}
                className="flex w-full flex-col gap-1.5 px-4 py-3.5 pr-12 text-left active:opacity-80"
              >
                <div className="flex items-center gap-2">
                  <p
                    className="text-[14px] font-bold"
                    style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
                  >
                    {t.raceFor}
                  </p>
                  {t.custom ? (
                    <span
                      className="rounded-full px-1.5 py-px text-[8px] font-bold uppercase tracking-[0.12em]"
                      style={{
                        background: SYNTH.accentEmerald,
                        color: SYNTH.inkOnBrand,
                        fontFamily: SYNTH.font,
                      }}
                    >
                      Custom
                    </span>
                  ) : null}
                  <span
                    className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                    style={{
                      background: SYNTH.ink,
                      color: SYNTH.inkOnBrand,
                      fontFamily: SYNTH.font,
                    }}
                  >
                    {t.splits.length} split{t.splits.length === 1 ? '' : 's'}
                  </span>
                </div>
                <p
                  className="text-[12px]"
                  style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
                >
                  {t.distance} · timing in{' '}
                  <span style={{ color: SYNTH.ink, fontWeight: 700 }}>
                    {t.splitUnit === 'ms' ? 'milliseconds' : 'seconds'}
                  </span>
                </p>
              </button>
              {/* Delete custom preset */}
              {t.custom && t.id ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (
                      typeof window !== 'undefined' &&
                      !window.confirm(`Delete "${t.raceFor}"?`)
                    )
                      return
                    removeCustomPreset(t.id!)
                  }}
                  aria-label="Delete custom preset"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full"
                  style={{
                    background: 'rgba(0,0,0,0.06)',
                    color: SYNTH.inkMuted,
                  }}
                >
                  <XIcon size={13} strokeWidth={2.4} />
                </button>
              ) : null}
            </div>
          )
        })}

        {/* Custom preset creator */}
        {creating ? (
          <CustomPresetForm
            onCancel={() => setCreating(false)}
            onSave={(p) => {
              addCustomPreset(p)
              setCreating(false)
              onClose()
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed py-3 text-[12px] font-bold uppercase tracking-[0.14em]"
            style={{
              borderColor: 'rgba(0,0,0,0.18)',
              color: SYNTH.inkMuted,
              fontFamily: SYNTH.font,
            }}
          >
            <Plus size={14} strokeWidth={2.6} />
            Create custom preset
          </button>
        )}
      </div>

      {/* Manual unit toggle */}
      <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: SYNTH.sheetMuted }}>
        <div>
          <p
            className="text-[12px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
          >
            Split unit
          </p>
          <p
            className="mt-0.5 text-[13px]"
            style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
          >
            Currently <strong>{preset.splitUnit === 'ms' ? 'milliseconds' : 'seconds'}</strong>
          </p>
        </div>
        <div className="flex gap-1 rounded-full p-1" style={{ background: '#FFFFFF' }}>
          {(['s', 'ms'] as const).map((u) => {
            const active = preset.splitUnit === u
            return (
              <button
                key={u}
                type="button"
                onClick={() => setPreset({ splitUnit: u })}
                className="rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{
                  background: active ? SYNTH.ink : 'transparent',
                  color: active ? SYNTH.inkOnBrand : SYNTH.inkMuted,
                  fontFamily: SYNTH.font,
                }}
              >
                {u === 's' ? 'sec' : 'ms'}
              </button>
            )
          })}
        </div>
      </div>
    </SheetShell>
  )
}

function CustomPresetForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void
  onSave: (preset: RacePreset) => void
}) {
  const [name, setName] = useState('')
  const [splitsCount, setSplitsCount] = useState(4)
  const [unit, setUnit] = useState<'s' | 'ms'>('s')
  const [durationMin, setDurationMin] = useState(6)
  const [durationSec, setDurationSec] = useState(40)

  const save = () => {
    if (!name.trim()) return
    const splits = Array.from({ length: splitsCount }, (_, i) => ({
      label: `Split ${i + 1}`,
      position: (i + 1) / splitsCount,
    }))
    onSave({
      raceFor: name.trim(),
      distance: `${splitsCount} × split`,
      splits,
      splitUnit: unit,
      expectedDurationMs: (durationMin * 60 + durationSec) * 1000,
    })
  }

  return (
    <div
      className="flex flex-col gap-2.5 rounded-2xl p-3"
      style={{ background: SYNTH.sheetMuted, border: `1px solid ${SYNTH.accentEmerald}55` }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{ color: SYNTH.accentEmerald, fontFamily: SYNTH.font }}
      >
        New custom preset
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Preset name (e.g. 4×750m race-pace)"
        className="w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none"
        style={{
          background: '#FFFFFF',
          borderColor: 'rgba(0,0,0,0.10)',
          color: SYNTH.ink,
          fontFamily: SYNTH.font,
        }}
      />
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
          >
            Splits
          </span>
          <input
            type="number"
            min={1}
            max={20}
            value={splitsCount}
            onChange={(e) => setSplitsCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            className="rounded-xl border px-3 py-2 text-[13px] outline-none"
            style={{
              background: '#FFFFFF',
              borderColor: 'rgba(0,0,0,0.10)',
              color: SYNTH.ink,
              fontFamily: SYNTH.font,
            }}
          />
        </label>
        <div className="flex flex-col gap-1">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
          >
            Unit
          </span>
          <div
            className="flex gap-1 rounded-xl p-1"
            style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.10)' }}
          >
            {(['s', 'ms'] as const).map((u) => {
              const active = unit === u
              return (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className="flex-1 rounded-lg py-1.5 text-[11px] font-bold uppercase tracking-[0.12em]"
                  style={{
                    background: active ? SYNTH.ink : 'transparent',
                    color: active ? SYNTH.inkOnBrand : SYNTH.inkMuted,
                    fontFamily: SYNTH.font,
                  }}
                >
                  {u === 's' ? 'sec' : 'ms'}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
          >
            Expected min
          </span>
          <input
            type="number"
            min={0}
            value={durationMin}
            onChange={(e) => setDurationMin(Math.max(0, Number(e.target.value) || 0))}
            className="rounded-xl border px-3 py-2 text-[13px] outline-none"
            style={{
              background: '#FFFFFF',
              borderColor: 'rgba(0,0,0,0.10)',
              color: SYNTH.ink,
              fontFamily: SYNTH.font,
            }}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
          >
            Expected sec
          </span>
          <input
            type="number"
            min={0}
            max={59}
            value={durationSec}
            onChange={(e) => setDurationSec(Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
            className="rounded-xl border px-3 py-2 text-[13px] outline-none"
            style={{
              background: '#FFFFFF',
              borderColor: 'rgba(0,0,0,0.10)',
              color: SYNTH.ink,
              fontFamily: SYNTH.font,
            }}
          />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!name.trim()}
          className="ml-auto flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] disabled:opacity-40"
          style={{
            background: SYNTH.accentEmerald,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
          }}
        >
          <Check size={12} strokeWidth={2.8} />
          Save preset
        </button>
      </div>
    </div>
  )
}
