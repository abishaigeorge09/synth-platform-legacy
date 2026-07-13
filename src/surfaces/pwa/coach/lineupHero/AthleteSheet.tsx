import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Heart } from 'lucide-react'
import { SheetShell } from '../../primitives/SheetShell'
import { SYNTH } from '../../lib/theme'
import { fmtErgTime, type AppMockAthlete } from '../../data/mockTeam'
import { getLatestReading } from '../../data/mockReadings'

type Props = {
  open: boolean
  onClose: () => void
  athlete: AppMockAthlete | null
  seatLabel?: string
}

/**
 * Athlete card sheet — pops when a seat in the boat hero is tapped. Compact
 * snapshot of the athlete plus a "Open profile" CTA.
 */
export function AthleteSheet({ open, onClose, athlete, seatLabel }: Props) {
  const navigate = useNavigate()

  return (
    <SheetShell open={open} onClose={onClose} title={seatLabel ? `Seat ${seatLabel}` : 'Athlete'}>
      {athlete ? (
        <FilledBody athlete={athlete} onOpen={() => {
          onClose()
          navigate(`/app/coach/athlete/${athlete.id}`)
        }} />
      ) : (
        <EmptyBody onClose={onClose} />
      )}
    </SheetShell>
  )
}

// ─── Filled (athlete present) ───────────────────────────────────────────────

function FilledBody({
  athlete,
  onOpen,
}: {
  athlete: AppMockAthlete
  onOpen: () => void
}) {
  const sideColor =
    athlete.side === 'P' ? SYNTH.sidePort : athlete.side === 'S' ? SYNTH.sideStarboard : SYNTH.accentBlack
  const reading = getLatestReading(athlete.id)
  const recoveryColor =
    athlete.recoveryScore >= 75 ? SYNTH.accentEmerald : athlete.recoveryScore >= 55 ? SYNTH.accentAmber : SYNTH.accentRed

  return (
    <>
      {/* Identity */}
      <div className="flex items-center gap-3">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[14px] font-bold"
          style={{
            background: sideColor,
            color: '#FFFFFF',
            fontFamily: SYNTH.font,
            letterSpacing: '0.04em',
          }}
        >
          {athlete.initials}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-[18px] font-bold leading-tight"
            style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
          >
            {athlete.name}
          </p>
          <p
            className="mt-0.5 text-[12px]"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
          >
            {athlete.position} · {sideLabel(athlete.side)}
          </p>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-2">
        <Stat
          label="Recovery"
          value={String(athlete.recoveryScore)}
          accent={recoveryColor}
          icon={<Heart size={11} strokeWidth={2.4} />}
        />
        <Stat label="2K best" value={fmtErgTime(athlete.twoKBestSeconds)} />
        <Stat label="Streak" value={`${athlete.streakDays}d`} />
      </div>

      {/* Latest reading note (if any) */}
      {reading?.note ? (
        <div
          className="rounded-xl px-3 py-2.5"
          style={{
            background: 'rgba(15,23,42,0.04)',
            border: `1px solid ${SYNTH.sheetMuted}`,
          }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
          >
            Latest signal · {reading.source}
          </p>
          <p
            className="mt-1 text-[13px] leading-[1.4]"
            style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
          >
            {reading.note}
          </p>
        </div>
      ) : null}

      {/* Open profile CTA */}
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13px] font-bold"
        style={{
          background: SYNTH.accentBlack,
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
        }}
      >
        Open profile
        <ArrowUpRight size={14} strokeWidth={2.6} />
      </button>
    </>
  )
}

// ─── Empty (seat unfilled) ──────────────────────────────────────────────────

function EmptyBody({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-full text-[20px] font-bold"
        style={{
          background: SYNTH.sheetMuted,
          color: SYNTH.inkMuted,
          fontFamily: SYNTH.font,
        }}
      >
        +
      </span>
      <p
        className="text-[16px] font-bold"
        style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
      >
        Seat is empty
      </p>
      <p
        className="max-w-[260px] text-[12px] leading-[1.4]"
        style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
      >
        Open the lineup builder to fill this seat — synth keeps the hero in sync.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-1 rounded-full px-4 py-2 text-[12px] font-bold"
        style={{
          background: SYNTH.sheetMuted,
          color: SYNTH.ink,
          fontFamily: SYNTH.font,
        }}
      >
        Got it
      </button>
    </div>
  )
}

// ─── Bits ────────────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  accent,
  icon,
}: {
  label: string
  value: string
  accent?: string
  icon?: React.ReactNode
}) {
  return (
    <div
      className="flex flex-col rounded-xl px-2.5 py-2"
      style={{ background: SYNTH.sheetMuted }}
    >
      <span
        className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
      >
        {icon}
        {label}
      </span>
      <span
        className="mt-1 text-[16px] font-bold leading-none"
        style={{
          color: accent ?? SYNTH.ink,
          fontFamily: SYNTH.font,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  )
}

function sideLabel(side: 'P' | 'S' | 'X'): string {
  return side === 'P' ? 'Port' : side === 'S' ? 'Starboard' : 'Cox'
}
