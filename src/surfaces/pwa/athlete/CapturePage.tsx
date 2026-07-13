import { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Heart, FileText, FileUp, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import {
  JournalSheet,
  FileUploadSheet,
} from '../primitives/CaptureSheets'
import { AuroraVoiceOverlay } from '../primitives/AuroraVoiceOverlay'
import { SYNTH } from '../lib/theme'

type ModeKey = 'erg-log' | 'wellness' | 'journal' | 'upload'
type LogTab = 'all' | 'uploads' | 'journal'

type RecentItem = {
  kind: 'erg-log' | 'wellness' | 'upload' | 'journal'
  title: string
  detail: string
  minutesAgo: number
}

const SEED_RECENT: RecentItem[] = [
  { kind: 'erg-log', title: '2K · 7:08.2', detail: 'logged this morning · 22 spm', minutesAgo: 35 },
  { kind: 'wellness', title: 'Wellness · 7/10', detail: '6h sleep, 3/10 soreness', minutesAgo: 6 * 60 },
  { kind: 'upload', title: 'erg-april.csv', detail: 'Erg session log · 4 sessions', minutesAgo: 2 * 24 * 60 },
  { kind: 'journal', title: 'Journal entry', detail: 'Felt tight in the catch today…', minutesAgo: 24 * 60 },
]

type SeedUpload = { filename: string; kind: string; date: string }
const SEED_UPLOADS: SeedUpload[] = [
  { filename: 'erg-april.csv', kind: 'Erg session log', date: 'Apr 28' },
  { filename: 'wellness-week.pdf', kind: 'Wellness export', date: 'Apr 25' },
]

type SeedJournalEntry = { excerpt: string; date: string }
const SEED_JOURNAL_LOG: SeedJournalEntry[] = [
  { excerpt: 'Felt tight in the catch today. Legs were heavy from Monday\'s weights session.', date: 'Apr 29' },
  { excerpt: 'Good water session. Coach had us do pause drills and my sequencing finally clicked.', date: 'Apr 28' },
  { excerpt: 'Race pieces today. First 500 was aggressive, held on for a 7:02 predicted 2K.', date: 'Apr 26' },
]

const cardColor: Record<ModeKey, string> = {
  'erg-log': SYNTH.cardYellow,
  wellness: SYNTH.cardMint,
  journal: SYNTH.cardPink,
  upload: SYNTH.cardLavender,
}

const MODES: { key: ModeKey; label: string; description: string; icon: ReactNode; action: string }[] = [
  {
    key: 'erg-log',
    label: 'Erg log',
    description: 'Time, distance, splits — voice it in',
    icon: <Activity size={20} strokeWidth={2.4} />,
    action: 'Log session',
  },
  {
    key: 'wellness',
    label: 'Wellness check',
    description: 'Sleep · soreness · stress',
    icon: <Heart size={20} strokeWidth={2.4} />,
    action: 'Quick check-in',
  },
  {
    key: 'journal',
    label: 'Journal',
    description: 'Log your thoughts, feelings, intentions',
    icon: <FileText size={20} strokeWidth={2.4} />,
    action: 'Open journal',
  },
  {
    key: 'upload',
    label: 'Upload data',
    description: 'Import CSV, PDF, or erg data',
    icon: <FileUp size={20} strokeWidth={2.4} />,
    action: 'Upload file',
  },
]

export function CapturePage() {
  const [openMode, setOpenMode] = useState<ModeKey | null>(null)
  const [recent, setRecent] = useState<RecentItem[]>(SEED_RECENT)
  const [logTab, setLogTab] = useState<LogTab>('all')

  const close = () => setOpenMode(null)

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

  const onJournalSave = (text: string) => {
    setRecent((r) => [{ kind: 'journal', title: 'Journal entry', detail: text.slice(0, 60), minutesAgo: 0 }, ...r])
  }

  const onUploadSave = (filename: string, kind: string) => {
    setRecent((r) => [{ kind: 'upload', title: filename, detail: kind, minutesAgo: 0 }, ...r])
  }

  const visibleRecent =
    logTab === 'all'
      ? recent
      : logTab === 'uploads'
      ? recent.filter((r) => r.kind === 'upload')
      : recent.filter((r) => r.kind === 'journal')

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto" style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom), 16px) + 88px)' }}>
      <CoachPageHeader title="Log it" subtitle="Drop anything, synth synthesizes" back="/app/athlete/home" />

      <section className="mx-5 mt-2 grid grid-cols-2 gap-3">
        {MODES.map((m, i) => {
          const tourAnchor =
            m.key === 'erg-log'
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
                cardColor={cardColor[m.key]}
                icon={m.icon}
                action={m.action}
                onClick={() => setOpenMode(m.key)}
              />
            </div>
          )
        })}
      </section>

      <section className="mt-7 px-5">
        <div className="mb-3 flex items-center gap-2">
          {(['all', 'uploads', 'journal'] as LogTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setLogTab(tab)}
              className="rounded-full px-3 py-1 text-[11px] font-semibold capitalize tracking-[0.10em]"
              style={{
                background: logTab === tab ? SYNTH.accentBlack : SYNTH.glass,
                color: logTab === tab ? SYNTH.inkOnBrand : SYNTH.inkOnBrandMuted,
                border: logTab === tab ? 'none' : `1px solid ${SYNTH.glassBorder}`,
                fontFamily: SYNTH.font,
              }}
            >
              {tab === 'all' ? 'All logs' : tab === 'uploads' ? 'Uploads' : 'Journal'}
            </button>
          ))}
        </div>

        {logTab === 'uploads' ? (
          <div
            className="overflow-hidden rounded-3xl"
            style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}
          >
            {SEED_UPLOADS.map((u, i) => (
              <div
                key={u.filename}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.inlineCardBorder}` }}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}`, color: SYNTH.inkOnBrand }}
                >
                  <FileUp size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                    {u.filename}
                  </p>
                  <p className="truncate text-[11px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                    {u.kind}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}>
                  {u.date}
                </span>
              </div>
            ))}
          </div>
        ) : logTab === 'journal' ? (
          <div
            className="overflow-hidden rounded-3xl"
            style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}
          >
            {SEED_JOURNAL_LOG.map((j, i) => (
              <div
                key={j.date}
                className="px-4 py-3.5"
                style={{ borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.inlineCardBorder}` }}
              >
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}>
                  {j.date}
                </p>
                <p className="line-clamp-2 text-[13px] leading-[1.5]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                  {j.excerpt}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="overflow-hidden rounded-3xl"
            style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}
          >
            {visibleRecent.map((r, i) => (
              <div
                key={`${r.kind}-${i}-${r.minutesAgo}`}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                style={{ borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.inlineCardBorder}` }}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}`, color: SYNTH.inkOnBrand }}
                >
                  {r.kind === 'erg-log' ? (
                    <Activity size={14} />
                  ) : r.kind === 'wellness' ? (
                    <Heart size={14} />
                  ) : r.kind === 'upload' ? (
                    <FileUp size={14} />
                  ) : (
                    <FileText size={14} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                    {r.title}
                  </p>
                  <p className="truncate text-[11px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
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
        )}
      </section>

      <AuroraVoiceOverlay
        open={openMode === 'erg-log'}
        onClose={close}
        onSave={onErgLogSave}
        scopeLabel="your erg session"
      />
      <AuroraVoiceOverlay
        open={openMode === 'wellness'}
        onClose={close}
        onSave={onWellnessSave}
        scopeLabel="wellness check-in"
      />
      <JournalSheet open={openMode === 'journal'} onClose={close} onSave={onJournalSave} />
      <FileUploadSheet open={openMode === 'upload'} onClose={close} onSave={onUploadSave} />
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
        width: '100%',
      }}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-2xl"
        style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand }}
      >
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-[15px] font-bold leading-tight tracking-[-0.01em]" style={{ color: SYNTH.ink }}>
          {label}
        </p>
        <p className="mt-1 text-[11px] leading-[1.4]" style={{ color: SYNTH.ink, opacity: 0.7 }}>
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
