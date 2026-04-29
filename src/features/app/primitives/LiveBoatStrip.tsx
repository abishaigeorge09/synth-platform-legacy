import { motion } from 'framer-motion'
import { SYNTH } from '../lib/theme'
import { fmtClock } from './RaceRecorder'

export type StripBoat = {
  id: string
  name: string
  color: string
  status: 'idle' | 'running' | 'paused' | 'finished'
  elapsedMs: number
}

type Props = {
  boats: StripBoat[]
  raceGroups: string[][] // arrays of boat IDs grouped together
  focusedId?: string
  onTap?: (id: string) => void
}

const STATUS_COLOR = {
  idle: 'rgba(255,255,255,0.30)',
  running: SYNTH.accentEmerald,
  paused: SYNTH.accentAmber,
  finished: SYNTH.inkOnBrand,
} as const

const STATUS_LABEL = {
  idle: 'Ready',
  running: 'Live',
  paused: 'Paused',
  finished: 'Done',
} as const

/**
 * Live overview row of every boat in the active run. Boats that share a
 * race group sit adjacent and are wrapped in a tinted bracket so the
 * coach can see "these two are racing each other" at a glance. Solo
 * boats sit on their own without a bracket.
 *
 * Tapping a card surfaces the per-boat detail page (handled by the
 * parent's onTap).
 */
export function LiveBoatStrip({ boats, raceGroups, focusedId, onTap }: Props) {
  // Order: race groups first (largest first), then any solo boats not in groups
  const grouped = new Set<string>()
  raceGroups.forEach((g) => g.forEach((id) => grouped.add(id)))
  const soloBoats = boats.filter((b) => !grouped.has(b.id))

  return (
    <div
      className="synth-scroll flex gap-2 overflow-x-auto px-5 py-3"
      style={{ scrollbarWidth: 'none' }}
    >
      {raceGroups.map((groupIds, gi) => {
        const groupBoats = groupIds
          .map((id) => boats.find((b) => b.id === id))
          .filter((b): b is StripBoat => Boolean(b))
        if (groupBoats.length === 0) return null
        const accentColor = groupBoats[0]!.color
        return (
          <div
            key={`g-${gi}`}
            className="relative flex shrink-0 items-stretch gap-1.5 rounded-2xl px-2 py-2"
            style={{
              background: `${accentColor}1F`,
              border: `1px solid ${accentColor}66`,
            }}
          >
            <span
              className="absolute -top-2 left-3 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.18em]"
              style={{
                background: accentColor,
                color: SYNTH.ink,
                fontFamily: SYNTH.font,
              }}
            >
              Racing
            </span>
            {groupBoats.map((b) => (
              <BoatChip key={b.id} boat={b} focused={b.id === focusedId} onTap={onTap} />
            ))}
          </div>
        )
      })}
      {soloBoats.map((b) => (
        <BoatChip key={b.id} boat={b} focused={b.id === focusedId} onTap={onTap} solo />
      ))}
    </div>
  )
}

function BoatChip({
  boat,
  focused,
  onTap,
  solo,
}: {
  boat: StripBoat
  focused: boolean
  onTap?: (id: string) => void
  solo?: boolean
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={() => onTap?.(boat.id)}
      className="flex shrink-0 flex-col items-start gap-1 rounded-xl border px-3 py-2 text-left"
      style={{
        background: focused ? `${boat.color}33` : 'rgba(255,255,255,0.08)',
        borderColor: focused ? boat.color : SYNTH.glassBorder,
        minWidth: 110,
      }}
    >
      <div className="flex w-full items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ background: boat.color }} />
        <span
          className="truncate text-[11px] font-bold"
          style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
        >
          {boat.name}
        </span>
        {solo ? (
          <span
            className="ml-auto text-[8px] font-bold uppercase tracking-[0.14em]"
            style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
          >
            Solo
          </span>
        ) : null}
      </div>
      <span
        className="text-[16px] font-bold leading-none"
        style={{
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {fmtClock(boat.elapsedMs)}
      </span>
      <span
        className="rounded-full px-1.5 py-px text-[8px] font-bold uppercase tracking-[0.14em]"
        style={{
          background: STATUS_COLOR[boat.status],
          color: boat.status === 'finished' ? SYNTH.ink : SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
        }}
      >
        {STATUS_LABEL[boat.status]}
      </span>
    </motion.button>
  )
}
