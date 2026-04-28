import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { ComingSoonSheet } from '../primitives/SettingsSheets'
import { APP_MOCK_ATHLETES, APP_MOCK_TEAM } from '../data/mockTeam'
import { SYNTH } from '../lib/theme'

const TODAY_LINEUP = [
  { seat: 'S', label: 'Stroke', athleteId: 'a-juno-okafor', side: 'S' as const },
  { seat: '7', label: '7 seat', athleteId: 'a-isla-park', side: 'S' as const },
  { seat: '6', label: '6 seat', athleteId: 'a-noor-haidari', side: 'P' as const },
  { seat: '5', label: '5 seat', athleteId: 'a-star-miller', side: 'P' as const },
  { seat: '4', label: '4 seat', athleteId: 'a-coral-mendez', side: 'S' as const },
  { seat: '3', label: '3 seat', athleteId: 'a-rae-akhtar', side: 'P' as const },
  { seat: '2', label: '2 seat', athleteId: 'a-noor-haidari', side: 'S' as const },
  { seat: 'B', label: 'Bow', athleteId: 'a-star-miller', side: 'P' as const },
]

export function LineupsPage() {
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [shareToast, setShareToast] = useState<string | null>(null)

  const onShare = async () => {
    const text = `${APP_MOCK_TEAM.name} · V8 — Wednesday AM\n8 × 500m at 22 spm — water at 06:30.`
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Today’s lineup', text })
        return
      } catch {
        /* user cancelled or share unavailable — fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(text)
      setShareToast('Lineup copied')
      setTimeout(() => setShareToast(null), 1800)
    } catch {
      setShareToast('Sharing not available')
      setTimeout(() => setShareToast(null), 1800)
    }
  }

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[140px]">
      <CoachPageHeader
        title="V8 — Wednesday AM"
        subtitle="Today's lineup"
        back="/app/coach/home"
      />

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="mx-5 mt-2 rounded-3xl p-5"
        style={{
          background: SYNTH.cardMint,
          boxShadow: SYNTH.shadow.card,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-1.5 w-1.5 rounded-full"
            style={{ background: SYNTH.ink }}
          />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.ink, opacity: 0.7, fontFamily: SYNTH.font }}
          >
            Published 06:42 · Steady state
          </span>
        </div>
        <p
          className="mt-2 text-[20px] font-bold leading-[1.2] tracking-[-0.01em]"
          style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
        >
          8 × 500m at 22 spm — water at 06:30.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="rounded-full px-4 py-2 text-[12px] font-semibold"
            style={{
              background: SYNTH.accentBlack,
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
              letterSpacing: '0.02em',
            }}
          >
            Edit lineup
          </button>
          <button
            type="button"
            onClick={onShare}
            className="rounded-full border px-4 py-2 text-[12px] font-semibold"
            style={{
              background: 'transparent',
              borderColor: SYNTH.ink,
              color: SYNTH.ink,
              fontFamily: SYNTH.font,
              letterSpacing: '0.02em',
            }}
          >
            Share
          </button>
          {shareToast ? (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="ml-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: SYNTH.ink, opacity: 0.55, fontFamily: SYNTH.font }}
            >
              {shareToast}
            </motion.span>
          ) : null}
        </div>
      </motion.section>

      <ComingSoonSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Lineup builder"
        body="Drag-and-drop seat editing on mobile lands next sprint. For now, edit on the desktop coach surface and the change syncs here automatically."
      />

      <BoatVisual />

      <section className="mt-6 px-5">
        <p
          className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Roster
        </p>
        <div
          className="overflow-hidden rounded-3xl"
          style={{
            background: SYNTH.inlineCard,
            border: `1px solid ${SYNTH.inlineCardBorder}`,
          }}
        >
          {TODAY_LINEUP.map((seat, i) => {
            const a = APP_MOCK_ATHLETES.find((x) => x.id === seat.athleteId)
            if (!a) return null
            return (
              <button
                key={`${seat.seat}-${i}`}
                type="button"
                onClick={() => navigate(`/app/coach/athlete/${a.id}`)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left active:opacity-70"
                style={{ borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.inlineCardBorder}` }}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: seat.side === 'P' ? `${SYNTH.cardSky}DD` : `${SYNTH.cardYellow}DD`,
                    color: SYNTH.ink,
                    fontFamily: SYNTH.font,
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  {seat.seat}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-[14px] font-semibold"
                    style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                  >
                    {a.name}
                  </p>
                  <p
                    className="text-[11px] uppercase tracking-[0.12em]"
                    style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {seat.label} · {seat.side === 'P' ? 'Port' : 'Stbd'}
                  </p>
                </div>
                <span
                  className="text-[10px] uppercase tracking-[0.14em]"
                  style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
                >
                  {a.weeklyVolumeMeters / 1000}k
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function BoatVisual() {
  // Horizontal V8: bow on right, cox on left. 8 rower seats alternating P/S
  return (
    <div className="px-5 pt-5">
      <svg width="100%" viewBox="0 0 760 180" className="block">
        <defs>
          <linearGradient id="hullGrad" x1="0" x2="1">
            <stop offset="0" stopColor="rgba(255,255,255,0.16)" />
            <stop offset="1" stopColor="rgba(255,255,255,0.10)" />
          </linearGradient>
        </defs>
        <path
          d="M 60,90 Q 40,60 90,55 L 670,55 Q 720,55 740,90 Q 720,125 670,125 L 90,125 Q 40,120 60,90 Z"
          fill="url(#hullGrad)"
          stroke="rgba(255,255,255,0.32)"
          strokeWidth="1.5"
        />
        <line x1="80" y1="90" x2="720" y2="90" stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeDasharray="4 6" />
        {/* Cox compartment */}
        <rect x="92" y="76" width="42" height="28" rx="6" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.32)" />
        <text x="113" y="94" textAnchor="middle" fill={SYNTH.inkOnBrandMuted} fontSize="9" fontWeight="700" fontFamily="Geist, Inter, sans-serif">COX</text>

        {/* Seats */}
        {[
          { x: 180, side: 'S', n: 'S' },
          { x: 250, side: 'P', n: '7' },
          { x: 320, side: 'S', n: '6' },
          { x: 390, side: 'P', n: '5' },
          { x: 460, side: 'S', n: '4' },
          { x: 530, side: 'P', n: '3' },
          { x: 600, side: 'S', n: '2' },
          { x: 670, side: 'P', n: 'B' },
        ].map((seat) => (
          <g key={seat.n}>
            {/* Rigger */}
            <line
              x1={seat.x}
              y1={seat.side === 'P' ? 90 : 90}
              x2={seat.x}
              y2={seat.side === 'P' ? 60 : 120}
              stroke={seat.side === 'P' ? SYNTH.cardSky : SYNTH.cardYellow}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Seat dot */}
            <circle cx={seat.x} cy="90" r="11" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.40)" />
            <text x={seat.x} y="93" textAnchor="middle" fill={SYNTH.inkOnBrand} fontSize="9" fontWeight="800" fontFamily="Geist, Inter, sans-serif">
              {seat.n}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-center gap-4">
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: SYNTH.cardSky }} />
          Port
        </span>
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: SYNTH.cardYellow }} />
          Starboard
        </span>
      </div>
    </div>
  )
}
