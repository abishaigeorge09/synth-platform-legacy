import { Star, Calendar, User } from 'lucide-react'
import { SheetShell } from './SheetShell'
import { SYNTH } from '../lib/theme'
import type { MockSession } from '../data/mockSessions'

export function SessionDetailSheet({
  open,
  onClose,
  session,
}: {
  open: boolean
  onClose: () => void
  session: MockSession | null
}) {
  if (!session) return null

  return (
    <SheetShell open={open} onClose={onClose} title="Session detail">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5">
          <Calendar size={12} color={SYNTH.inkMuted} />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
          >
            {session.date} · {session.type}
          </span>
        </div>
        <p
          className="mt-1 text-[18px] font-bold leading-tight"
          style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
        >
          {session.title}
        </p>
        <p
          className="mt-2 text-[36px] font-bold leading-none tracking-[-0.02em]"
          style={{
            color: SYNTH.ink,
            fontFamily: SYNTH.font,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {session.duration}
        </p>
      </div>

      {/* Per-boat splits */}
      <div className="flex flex-col gap-3">
        {session.boats.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl px-3 py-3"
            style={{ background: SYNTH.sheetMuted }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: b.color }}
                />
                <p
                  className="text-[13px] font-bold"
                  style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
                >
                  {b.name}
                </p>
              </div>
              <span className="flex items-center gap-1">
                <Star size={11} color={SYNTH.accentEmerald} fill={SYNTH.accentEmerald} />
                <span
                  className="text-[11px] font-bold"
                  style={{
                    color: SYNTH.ink,
                    fontFamily: SYNTH.font,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {b.rating.toFixed(1)}
                </span>
              </span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {b.splits.map((split, i) => (
                <div
                  key={i}
                  className="rounded-md px-2 py-1.5 text-center"
                  style={{ background: '#FFFFFF' }}
                >
                  <p
                    className="text-[8px] font-semibold uppercase tracking-[0.1em]"
                    style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
                  >
                    {(i + 1) * 500}m
                  </p>
                  <p
                    className="mt-0.5 text-[12px] font-bold"
                    style={{
                      color: SYNTH.ink,
                      fontFamily: SYNTH.font,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {split}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      <div
        className="rounded-2xl px-3 py-3"
        style={{ background: SYNTH.sheetMuted }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
        >
          Notes
        </p>
        <p
          className="mt-1 text-[13px] leading-[1.5]"
          style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
        >
          {session.description}
        </p>
      </div>

      {/* Rated by */}
      <div className="flex items-center gap-2 px-1">
        <User size={12} color={SYNTH.inkMuted} />
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
        >
          Rated by {session.ratedByCoach}
        </span>
      </div>
    </SheetShell>
  )
}
