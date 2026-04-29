import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Camera,
  Play,
  ArrowUpRight,
  Mic,
  Image as ImageIcon,
  ListOrdered,
  Timer,
} from 'lucide-react'
import { SheetShell } from '../primitives/SheetShell'
import { SYNTH } from '../lib/theme'
import { APP_MOCK_TEAM } from '../data/mockTeam'
import { useLaunchSheetStore } from '../../../shared/store/useLaunchSheetStore'

/**
 * Launch sheet — half-height bottom sheet that auto-presents on coach Home.
 * Two big jobs the coach actually opens the app for: capture data, run session.
 *
 * Design notes:
 *  - Ambient orbs in the upper canvas (echoes the cobalt onboarding aesthetic).
 *  - Premium horizontal cards with gradient surfaces + chevron pull.
 *  - "Today's pulse" stat strip fills the lower half so the sheet never reads
 *    as empty — and it ties the launcher to live team context.
 */
export function LaunchActionSheet() {
  const navigate = useNavigate()
  const open = useLaunchSheetStore((s) => s.open)
  const dismiss = useLaunchSheetStore((s) => s.dismiss)
  const engage = useLaunchSheetStore((s) => s.engage)
  const disable = useLaunchSheetStore((s) => s.disable)

  const goCapture = () => {
    engage()
    navigate('/app/coach/capture')
  }
  const goSession = () => {
    engage()
    navigate('/app/coach/lineups')
  }

  return (
    <SheetShell open={open} onClose={dismiss} title="Quick start">
      <div className="relative -mx-5 -mt-2 px-5 pt-1">
        {/* Ambient orbs behind the header — same recipe as onboarding canvas */}
        <AmbientCanvas />

        <div className="relative z-10">
          <h2
            className="text-[26px] font-bold leading-[1.1] tracking-[-0.015em]"
            style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
          >
            What's first, Coach?
          </h2>
          <p
            className="mt-1.5 text-[13px] leading-[1.4]"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
          >
            Two taps to anywhere. Swipe down for today's full dashboard.
          </p>
        </div>

        {/* Premium action cards — full-width, horizontal, gradient surfaces */}
        <div className="relative z-10 mt-5 flex flex-col gap-3">
          <ActionTile
            tone="capture"
            label="Capture data"
            sub="Screenshot, photo, voice — instant sync"
            chips={[
              { icon: <ImageIcon size={11} strokeWidth={2.4} />, label: 'Photo' },
              { icon: <Mic size={11} strokeWidth={2.4} />, label: 'Voice' },
              { icon: <Camera size={11} strokeWidth={2.4} />, label: 'Form' },
            ]}
            heroIcon={<Camera size={26} strokeWidth={2.2} />}
            onClick={goCapture}
          />
          <ActionTile
            tone="session"
            label="Start a session"
            sub="Pick a lineup, run the practice timer"
            chips={[
              { icon: <ListOrdered size={11} strokeWidth={2.4} />, label: 'Lineup' },
              { icon: <Timer size={11} strokeWidth={2.4} />, label: 'Timer' },
            ]}
            heroIcon={<Play size={26} strokeWidth={2.4} />}
            onClick={goSession}
          />
        </div>

        {/* Today's pulse — keeps the sheet grounded in live context */}
        <div className="relative z-10 mt-6">
          <div
            className="flex items-center gap-2 px-1 pb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
          >
            <motion.span
              className="inline-block h-1.5 w-1.5 rounded-full"
              animate={{ opacity: [0.45, 1, 0.45], scale: [1, 1.2, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ background: SYNTH.accentEmerald, boxShadow: `0 0 0 4px ${SYNTH.accentEmerald}26` }}
            />
            Today's pulse
          </div>

          <div className="grid grid-cols-3 gap-2">
            <PulseStat
              value={`${APP_MOCK_TEAM.activeToday}`}
              divisor={`/${APP_MOCK_TEAM.athleteCount}`}
              label="Synced"
            />
            <PulseStat value={`${APP_MOCK_TEAM.attentionCount}`} label="Flagged" tone="amber" />
            <PulseStat value="3" unit="d" label="To race" tone="emerald" />
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-6 flex items-center justify-center gap-3 pb-1 text-[12px] font-semibold"
          style={{ fontFamily: SYNTH.font }}
        >
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full px-3 py-1.5 transition-opacity active:opacity-60"
            style={{ color: SYNTH.inkMuted }}
          >
            Skip for now
          </button>
          <span aria-hidden style={{ color: SYNTH.sheetMuted }}>
            ·
          </span>
          <button
            type="button"
            onClick={disable}
            className="rounded-full px-3 py-1.5 transition-opacity active:opacity-60"
            style={{ color: SYNTH.inkMuted }}
          >
            Don't show again
          </button>
        </div>
      </div>
    </SheetShell>
  )
}

// ─── Ambient backdrop ────────────────────────────────────────────────────────

function AmbientCanvas() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Two soft radial orbs — light and well below the content. */}
      <div
        className="absolute"
        style={{
          top: -120,
          left: -80,
          width: 280,
          height: 280,
          background: `radial-gradient(circle, ${SYNTH.cardSky}60 0%, transparent 65%)`,
          filter: 'blur(10px)',
        }}
      />
      <div
        className="absolute"
        style={{
          top: -60,
          right: -60,
          width: 220,
          height: 220,
          background: `radial-gradient(circle, ${SYNTH.cardYellow}55 0%, transparent 65%)`,
          filter: 'blur(10px)',
        }}
      />
      <div
        className="absolute"
        style={{
          top: 80,
          right: '20%',
          width: 160,
          height: 160,
          background: `radial-gradient(circle, ${SYNTH.cardMint}50 0%, transparent 65%)`,
          filter: 'blur(14px)',
        }}
      />

      {/* A handful of twinkling dots — same trick as onboarding */}
      {STAR_POSITIONS.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            background: SYNTH.ink,
            opacity: 0.18,
          }}
          animate={{ opacity: [0.1, 0.32, 0.1] }}
          transition={{ duration: 2.4 + (i % 3) * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
        />
      ))}
    </div>
  )
}

const STAR_POSITIONS: Array<{ top: string; left: string; size: number }> = [
  { top: '12%', left: '38%', size: 3 },
  { top: '20%', left: '70%', size: 2 },
  { top: '8%', left: '85%', size: 2 },
  { top: '24%', left: '12%', size: 3 },
  { top: '14%', left: '55%', size: 2 },
]

// ─── Action tile ─────────────────────────────────────────────────────────────

type Tone = 'capture' | 'session'

function ActionTile({
  tone,
  label,
  sub,
  chips,
  heroIcon,
  onClick,
}: {
  tone: Tone
  label: string
  sub: string
  chips: Array<{ icon: React.ReactNode; label: string }>
  heroIcon: React.ReactNode
  onClick: () => void
}) {
  const isCapture = tone === 'capture'
  const surface = isCapture
    ? `linear-gradient(135deg, ${SYNTH.cardYellow} 0%, #FFF6B8 100%)`
    : `linear-gradient(135deg, ${SYNTH.cardMint} 0%, #D4F4DF 100%)`
  const ringColor = isCapture ? '#E0D700' : '#7FCFA0'

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="relative flex items-center gap-4 overflow-hidden rounded-[24px] p-4 text-left"
      style={{
        background: surface,
        color: SYNTH.ink,
        fontFamily: SYNTH.font,
        boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 12px 28px -12px rgba(8,8,40,0.25)',
        border: `1px solid ${ringColor}55`,
      }}
    >
      {/* Hero icon medallion */}
      <span
        className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
        style={{
          background: SYNTH.accentBlack,
          color: SYNTH.inkOnBrand,
          boxShadow: '0 6px 16px -4px rgba(8,8,40,0.45)',
        }}
      >
        {heroIcon}
      </span>

      <div className="relative z-10 min-w-0 flex-1">
        <div className="text-[17px] font-bold leading-tight tracking-[-0.01em]">
          {label}
        </div>
        <div className="mt-0.5 text-[12px] leading-[1.35]" style={{ opacity: 0.72 }}>
          {sub}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((c, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
              style={{
                background: 'rgba(255,255,255,0.55)',
                color: SYNTH.ink,
                border: `1px solid rgba(8,8,40,0.08)`,
              }}
            >
              {c.icon}
              {c.label}
            </span>
          ))}
        </div>
      </div>

      <ArrowUpRight
        size={18}
        color={SYNTH.ink}
        strokeWidth={2.2}
        className="relative z-10 shrink-0"
        style={{ opacity: 0.5 }}
      />
    </motion.button>
  )
}

// ─── Pulse stat ──────────────────────────────────────────────────────────────

function PulseStat({
  value,
  divisor,
  unit,
  label,
  tone = 'neutral',
}: {
  value: string
  divisor?: string
  unit?: string
  label: string
  tone?: 'neutral' | 'amber' | 'emerald'
}) {
  const accentColor =
    tone === 'amber' ? SYNTH.accentAmber : tone === 'emerald' ? SYNTH.accentEmerald : SYNTH.ink
  return (
    <div
      className="flex flex-col rounded-2xl px-3 py-2.5"
      style={{
        background: SYNTH.sheetMuted,
        border: `1px solid rgba(8,8,40,0.06)`,
      }}
    >
      <div className="flex items-baseline gap-0.5">
        <span
          className="text-[20px] font-bold leading-none tracking-[-0.01em]"
          style={{
            color: accentColor,
            fontFamily: SYNTH.font,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
        {divisor ? (
          <span
            className="text-[12px] font-semibold leading-none"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
          >
            {divisor}
          </span>
        ) : null}
        {unit ? (
          <span
            className="text-[12px] font-bold leading-none"
            style={{ color: accentColor, fontFamily: SYNTH.font }}
          >
            {unit}
          </span>
        ) : null}
      </div>
      <span
        className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
      >
        {label}
      </span>
    </div>
  )
}
