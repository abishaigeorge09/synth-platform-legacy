import { useState } from 'react'
import { motion } from 'framer-motion'
import { Video, Activity, Heart, FileText, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import {
  VideoCaptureSheet,
  QuickNoteSheet,
} from '../primitives/CaptureSheets'
import { AuroraVoiceOverlay } from '../primitives/AuroraVoiceOverlay'
import { SYNTH } from '../lib/theme'

type ModeKey = 'form-video' | 'erg-log' | 'wellness' | 'note'

type RecentItem = {
  kind: 'erg-log' | 'wellness' | 'form-video' | 'note'
  title: string
  detail: string
  minutesAgo: number
}

const SEED_RECENT: RecentItem[] = [
  { kind: 'erg-log', title: '2K · 7:08.2', detail: 'logged this morning · 22 spm', minutesAgo: 35 },
  { kind: 'wellness', title: 'Wellness · 7/10', detail: '6h sleep, 3/10 soreness', minutesAgo: 6 * 60 },
  { kind: 'form-video', title: 'Form video · drive phase', detail: 'sent to Coach Geri', minutesAgo: 24 * 60 },
]

const MODES: { key: ModeKey; label: string; description: string; cardColor: string; icon: ReactNode; action: string }[] = [
  {
    key: 'form-video',
    label: 'Form video',
    description: 'Send your stroke to the coach',
    cardColor: SYNTH.cardSky,
    icon: <Video size={20} strokeWidth={2.4} />,
    action: 'Open camera',
  },
  {
    key: 'erg-log',
    label: 'Erg log',
    description: 'Time, distance, splits — voice it in',
    cardColor: SYNTH.cardYellow,
    icon: <Activity size={20} strokeWidth={2.4} />,
    action: 'Log session',
  },
  {
    key: 'wellness',
    label: 'Wellness check',
    description: 'Sleep · soreness · stress',
    cardColor: SYNTH.cardMint,
    icon: <Heart size={20} strokeWidth={2.4} />,
    action: 'Quick check-in',
  },
  {
    key: 'note',
    label: 'Quick note',
    description: 'Anything you want synth to remember',
    cardColor: SYNTH.cardPink,
    icon: <FileText size={20} strokeWidth={2.4} />,
    action: 'Write note',
  },
]

export function CapturePage() {
  const [openMode, setOpenMode] = useState<ModeKey | null>(null)
  const [recent, setRecent] = useState<RecentItem[]>(SEED_RECENT)

  const close = () => setOpenMode(null)

  const onVideoSave = (file: File) => {
    setRecent((r) => [
      { kind: 'form-video', title: 'Form video', detail: file.name || 'captured', minutesAgo: 0 },
      ...r,
    ])
  }

  const onErgLogSave = (transcript: string) => {
    if (!transcript) return
    const t = transcript.length > 60 ? `${transcript.slice(0, 60)}…` : transcript
    setRecent((r) => [{ kind: 'erg-log', title: 'Erg log · voice', detail: `"${t}"`, minutesAgo: 0 }, ...r])
  }

  const onWellnessSave = (text: string) => {
    setRecent((r) => [
      { kind: 'wellness', title: 'Wellness check-in', detail: text.slice(0, 60), minutesAgo: 0 },
      ...r,
    ])
  }

  const onNoteSave = (text: string) => {
    setRecent((r) => [{ kind: 'note', title: 'Note', detail: text.slice(0, 60), minutesAgo: 0 }, ...r])
  }

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[140px]">
      <CoachPageHeader title="Log it" subtitle="Drop anything, synth synthesizes" back="/app/athlete/home" />

      <section className="mx-5 mt-2 grid grid-cols-2 gap-3">
        {MODES.map((m, i) => {
          const tourAnchor =
            m.key === 'form-video'
              ? 'athlete-capture-form-video'
              : m.key === 'erg-log'
                ? 'athlete-capture-erg'
                : m.key === 'wellness'
                  ? 'athlete-capture-wellness'
                  : undefined
          return (
            <div key={m.key} {...(tourAnchor ? { 'data-tour': tourAnchor } : {})}>
              <ModeCard
                index={i}
                label={m.label}
                description={m.description}
                cardColor={m.cardColor}
                icon={m.icon}
                action={m.action}
                onClick={() => setOpenMode(m.key)}
              />
            </div>
          )
        })}
      </section>

      <section className="mt-7 px-5">
        <p
          className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Recent logs
        </p>
        <div
          className="overflow-hidden rounded-3xl"
          style={{
            background: SYNTH.inlineCard,
            border: `1px solid ${SYNTH.inlineCardBorder}`,
          }}
        >
          {recent.map((r, i) => (
            <div
              key={`${r.kind}-${i}-${r.minutesAgo}`}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
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
                {r.kind === 'erg-log' ? (
                  <Activity size={14} />
                ) : r.kind === 'wellness' ? (
                  <Heart size={14} />
                ) : r.kind === 'form-video' ? (
                  <Video size={14} />
                ) : (
                  <FileText size={14} />
                )}
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
                {r.minutesAgo === 0 ? 'just now' : r.minutesAgo < 60 ? `${r.minutesAgo}m` : `${Math.floor(r.minutesAgo / 60)}h`}
              </span>
              <ChevronRight size={14} color={SYNTH.inkOnBrandFaint} />
            </div>
          ))}
        </div>
      </section>

      <VideoCaptureSheet open={openMode === 'form-video'} onClose={close} onSave={onVideoSave} />
      <AuroraVoiceOverlay
        open={openMode === 'erg-log'}
        onClose={close}
        onSave={onErgLogSave}
        scopeLabel="your erg session"
      />
      <QuickNoteSheet
        open={openMode === 'wellness'}
        onClose={close}
        onSave={onWellnessSave}
        placeholder="How did you sleep? Soreness, stress, anything synth should know…"
      />
      <QuickNoteSheet open={openMode === 'note'} onClose={close} onSave={onNoteSave} />
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
