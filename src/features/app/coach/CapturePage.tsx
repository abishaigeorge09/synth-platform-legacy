import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, Mic, FileText, Mail, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { SYNTH } from '../lib/theme'

const MODES = [
  {
    key: 'voice',
    label: 'Voice memo',
    description: 'Talk to synth — get a typed note + tags',
    cardColor: SYNTH.cardYellow,
    icon: <Mic size={20} strokeWidth={2.4} />,
    action: 'Hold to record',
  },
  {
    key: 'photo',
    label: 'Photo · form',
    description: 'Snap a stroke or a whiteboard, send notes',
    cardColor: SYNTH.cardSky,
    icon: <Camera size={20} strokeWidth={2.4} />,
    action: 'Open camera',
  },
  {
    key: 'note',
    label: 'Quick note',
    description: 'Jot a thought scoped to an athlete',
    cardColor: SYNTH.cardMint,
    icon: <FileText size={20} strokeWidth={2.4} />,
    action: 'New note',
  },
  {
    key: 'email',
    label: 'Email forward',
    description: 'Forward to capture@synth — we ingest it',
    cardColor: SYNTH.cardPink,
    icon: <Mail size={20} strokeWidth={2.4} />,
    action: 'Show address',
  },
]

const RECENT = [
  { kind: 'voice' as const, title: '20s memo · Star Miller', detail: '"watch port shoulder on stbd"', minutesAgo: 34 },
  { kind: 'photo' as const, title: 'Whiteboard · Wednesday plan', detail: '8x500m + 3x10', minutesAgo: 2 * 60 + 12 },
  { kind: 'email' as const, title: 'Forward · TrainingPeaks rec', detail: 'plan from Coach M', minutesAgo: 6 * 60 },
]

export function CapturePage() {
  const navigate = useNavigate()

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[140px]">
      <CoachPageHeader title="Capture" subtitle="Drop anything, synth synthesizes" back="/app/coach/home" />

      <section className="mx-5 mt-2 grid grid-cols-2 gap-3">
        {MODES.map((m, i) => (
          <ModeCard
            key={m.key}
            index={i}
            label={m.label}
            description={m.description}
            cardColor={m.cardColor}
            icon={m.icon}
            action={m.action}
            onClick={() => {
              if (m.key === 'note') navigate('/app/coach/notes')
              // other modes are wired in Phase E proper
            }}
          />
        ))}
      </section>

      <section className="mt-7 px-5">
        <p
          className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Recent captures
        </p>
        <div
          className="overflow-hidden rounded-3xl"
          style={{
            background: SYNTH.inlineCard,
            border: `1px solid ${SYNTH.inlineCardBorder}`,
          }}
        >
          {RECENT.map((r, i) => (
            <button
              key={`${r.kind}-${i}`}
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:opacity-70"
              style={{ borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.inlineCardBorder}` }}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: SYNTH.glass,
                  border: `1px solid ${SYNTH.glassBorder}`,
                  color: SYNTH.inkOnBrand,
                }}
              >
                {r.kind === 'voice' ? <Mic size={14} /> : r.kind === 'photo' ? <Camera size={14} /> : <Mail size={14} />}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[13px] font-semibold"
                  style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                >
                  {r.title}
                </p>
                <p
                  className="truncate text-[11px]"
                  style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                >
                  {r.detail}
                </p>
              </div>
              <span
                className="text-[10px] uppercase tracking-[0.14em]"
                style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
              >
                {r.minutesAgo < 60 ? `${r.minutesAgo}m` : `${Math.floor(r.minutesAgo / 60)}h`}
              </span>
              <ChevronRight size={14} color={SYNTH.inkOnBrandFaint} />
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function ModeCard({
  label,
  description,
  cardColor,
  icon,
  action,
  index,
  onClick,
}: {
  label: string
  description: string
  cardColor: string
  icon: ReactNode
  action: string
  index: number
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col gap-3 rounded-3xl p-4 text-left"
      style={{
        background: cardColor,
        boxShadow: SYNTH.shadow.card,
        minHeight: 156,
        color: SYNTH.ink,
        fontFamily: SYNTH.font,
      }}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-2xl"
        style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand }}
      >
        {icon}
      </span>
      <div className="flex-1">
        <p
          className="text-[15px] font-bold leading-tight tracking-[-0.01em]"
          style={{ color: SYNTH.ink }}
        >
          {label}
        </p>
        <p
          className="mt-1 text-[11px] leading-[1.4]"
          style={{ color: SYNTH.ink, opacity: 0.7 }}
        >
          {description}
        </p>
      </div>
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.ink, opacity: 0.55 }}
      >
        {action} ›
      </span>
    </motion.button>
  )
}
