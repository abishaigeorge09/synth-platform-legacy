import { useNavigate } from 'react-router-dom'
import { Timer } from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { SYNTH } from '../lib/theme'

/**
 * Stub for the stopwatch tool. Next pass: large running clock, lap
 * captures, then on stop a sheet asking "What was this for?" + athlete
 * picker so the timing gets attributed to a session.
 */
export function StopwatchPage() {
  const navigate = useNavigate()

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[140px]">
      <CoachPageHeader title="Stopwatch" back="/app/coach/tools" />

      <section className="mx-5 mt-2 flex flex-col items-center gap-6 rounded-3xl p-8"
        style={{
          background: SYNTH.inlineCard,
          border: `1px solid ${SYNTH.inlineCardBorder}`,
        }}
      >
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background: SYNTH.glass,
            border: `1px solid ${SYNTH.glassBorder}`,
            color: SYNTH.inkOnBrand,
          }}
        >
          <Timer size={26} strokeWidth={2.2} />
        </span>
        <div className="text-center">
          <p
            className="text-[18px] font-bold"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            Stopwatch — coming next
          </p>
          <p
            className="mt-2 text-[13px] leading-[1.5]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            Large running clock with lap capture. On stop, pick what the
            timer was for and tag the athletes who ran it — the result
            attaches to the session log.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/app/coach/tools')}
          className="rounded-full px-5 py-2.5 text-[13px] font-semibold"
          style={{
            background: SYNTH.inkOnBrand,
            color: SYNTH.ink,
            fontFamily: SYNTH.font,
          }}
        >
          Back to tools
        </button>
      </section>
    </div>
  )
}
