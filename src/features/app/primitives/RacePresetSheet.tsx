import { SheetShell } from './SheetShell'
import { SYNTH } from '../lib/theme'
import { useLineupBuilderStore, type RacePreset } from '../data/lineupBuilderStore'

type PresetTemplate = {
  raceFor: string
  distance: string
  splits: { label: string; position: number }[]
  splitUnit: 's' | 'ms'
  expectedDurationMs: number
}

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
  const setPreset = useLineupBuilderStore((s) => s.setPreset)

  const apply = (t: PresetTemplate) => {
    setPreset(t)
    onClose()
  }

  return (
    <SheetShell open={open} onClose={onClose} title="Configure session">
      <p className="text-[13px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
        What is this session for? Splits, distances, and timing units come from the template — the
        boats animate to match while you build.
      </p>

      <div className="flex flex-col gap-2">
        {TEMPLATES.map((t) => {
          const isActive = preset.raceFor === t.raceFor && preset.distance === t.distance
          return (
            <button
              key={`${t.raceFor}-${t.distance}`}
              type="button"
              onClick={() => apply(t)}
              className="flex flex-col gap-1.5 rounded-2xl px-4 py-3.5 text-left active:opacity-80"
              style={{
                background: isActive ? `${SYNTH.accentEmerald}26` : SYNTH.sheetMuted,
                border: `1px solid ${isActive ? SYNTH.accentEmerald : 'transparent'}`,
              }}
            >
              <div className="flex items-center justify-between">
                <p
                  className="text-[14px] font-bold"
                  style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
                >
                  {t.raceFor}
                </p>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
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
          )
        })}
      </div>

      {/* Manual unit toggle (lets the user override) */}
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
                onClick={() => setPreset({ splitUnit: u } as Partial<RacePreset>)}
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
