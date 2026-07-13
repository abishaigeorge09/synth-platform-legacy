import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { X, ArrowUpRight } from 'lucide-react'
import { SYNTH } from '../lib/theme'

export type AchievementKey = 'twoK' | 'split' | 'load' | 'recovery' | 'risk' | 'data'

type AchievementDef = {
  key: AchievementKey
  kicker: string
  title: string
  metric: string
  unit?: string
  milestones: { date: string; value: string; delta: string }[]
  message: string
  linkLabel: string
  linkTo: string
  accent: string
  Illustration: React.FC
}

const ACHIEVEMENTS: AchievementDef[] = [
  {
    key: 'twoK',
    kicker: 'Personal best',
    title: '2K Erg Time',
    metric: '7:24.3',
    milestones: [
      { date: 'Mar 14', value: '7:24.3', delta: 'PR — −4.8s' },
      { date: 'Feb 01', value: '7:29.1', delta: '−2.3s' },
      { date: 'Jan 10', value: '7:31.4', delta: '−1.2s' },
    ],
    message: '"Every second you take off that piece represents weeks of real work. Keep building."',
    linkLabel: 'View all sessions →',
    linkTo: '/app/athlete/profile',
    accent: SYNTH.cardSky,
    Illustration: TwoKIllustration,
  },
  {
    key: 'split',
    kicker: 'Consistency',
    title: 'Avg Split /500m',
    metric: '1:46.7',
    milestones: [
      { date: 'Apr 29', value: '1:46.7', delta: 'Season best' },
      { date: 'Apr 22', value: '1:47.4', delta: '−0.7s' },
      { date: 'Apr 15', value: '1:48.1', delta: '−0.7s' },
    ],
    message: '"Consistent splits under 1:47 put you in the top tier of your crew. Stay there."',
    linkLabel: 'See split history →',
    linkTo: '/app/athlete/telemetry',
    accent: SYNTH.accentEmerald,
    Illustration: SplitIllustration,
  },
  {
    key: 'load',
    kicker: 'Fitness',
    title: 'Training Load',
    metric: '78',
    unit: 'TSS',
    milestones: [
      { date: 'This week', value: '78 TSS', delta: '+12 vs last' },
      { date: 'Last week', value: '66 TSS', delta: '+8 vs prev' },
      { date: '4 weeks ago', value: '58 TSS', delta: 'Base phase' },
    ],
    message: '"Your CTL is climbing steadily. The work you are putting in now will show at the race."',
    linkLabel: 'View wellness →',
    linkTo: '/app/athlete/profile',
    accent: SYNTH.cardLemon,
    Illustration: LoadIllustration,
  },
  {
    key: 'recovery',
    kicker: 'Readiness',
    title: 'Recovery Score',
    metric: '84',
    unit: '/ 100',
    milestones: [
      { date: 'Today', value: '84', delta: '+5 vs yesterday' },
      { date: 'Yesterday', value: '79', delta: 'Yellow' },
      { date: '2 days ago', value: '91', delta: 'Green' },
    ],
    message: '"84 is a green light. You are adapted and ready to push. Trust the data."',
    linkLabel: 'View wellness →',
    linkTo: '/app/athlete/profile',
    accent: SYNTH.accentEmerald,
    Illustration: RecoveryIllustration,
  },
  {
    key: 'risk',
    kicker: 'Health',
    title: 'Injury Risk',
    metric: 'LOW',
    milestones: [
      { date: 'This week', value: 'LOW', delta: '↓ from MEDIUM' },
      { date: 'Last week', value: 'MEDIUM', delta: 'High load phase' },
      { date: '2 weeks ago', value: 'LOW', delta: 'Recovery week' },
    ],
    message: '"Low risk flag means your body is handling the load well. Keep communicating with your coach."',
    linkLabel: 'View wellness →',
    linkTo: '/app/athlete/profile',
    accent: SYNTH.accentEmerald,
    Illustration: RiskIllustration,
  },
  {
    key: 'data',
    kicker: 'Connectivity',
    title: 'Data Quality',
    metric: '94%',
    milestones: [
      { date: 'Today', value: '5 sources', delta: 'All synced' },
      { date: 'Last week', value: '4 sources', delta: 'WHOOP gap' },
      { date: 'Last month', value: '3 sources', delta: 'Concept2 added' },
    ],
    message: '"94% data quality means synth. has a clear picture of your performance. The more you connect, the sharper the insight."',
    linkLabel: 'View sources →',
    linkTo: '/app/athlete/sources',
    accent: SYNTH.cardMint,
    Illustration: DataIllustration,
  },
]

export function AchievementSheet({
  open,
  achievementKey,
  onClose,
}: {
  open: boolean
  achievementKey: AchievementKey | null
  onClose: () => void
}) {
  const navigate = useNavigate()
  const def = achievementKey ? ACHIEVEMENTS.find((a) => a.key === achievementKey) : null

  return (
    <AnimatePresence>
      {open && def ? (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[28px] px-5 pt-3"
            style={{
              background: SYNTH.canvasInk,
              border: `1px solid ${SYNTH.glassBorder}`,
              borderBottom: 'none',
              paddingBottom: 'max(env(safe-area-inset-bottom), 28px)',
              maxHeight: '90svh',
              overflowY: 'auto',
            }}
          >
            {/* Handle + close */}
            <div className="mb-4 flex items-center justify-between">
              <div
                className="mx-auto h-1 w-10 rounded-full"
                style={{ background: 'rgba(255,255,255,0.22)' }}
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-5 top-4 flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}`, color: SYNTH.inkOnBrand }}
              >
                <X size={14} strokeWidth={2.4} />
              </button>
            </div>

            {/* Illustration */}
            <div className="flex justify-center py-4">
              <def.Illustration />
            </div>

            {/* Kicker + title */}
            <p
              className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: def.accent, fontFamily: SYNTH.font }}
            >
              {def.kicker}
            </p>
            <h2
              className="mt-1 text-center text-[26px] font-bold leading-[1.1] tracking-[-0.01em]"
              style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
            >
              {def.title}
            </h2>

            {/* Big metric */}
            <p
              className="mt-3 text-center text-[52px] font-bold leading-none tracking-[-0.02em]"
              style={{
                color: def.accent,
                fontFamily: SYNTH.font,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {def.metric}
              {def.unit ? (
                <span className="text-[22px]" style={{ color: SYNTH.inkOnBrandMuted }}> {def.unit}</span>
              ) : null}
            </p>

            {/* Milestones */}
            <div
              className="mt-6 rounded-3xl p-4"
              style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}
            >
              <p
                className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
              >
                Milestones
              </p>
              <div className="space-y-2.5">
                {def.milestones.map((m) => (
                  <div key={m.date} className="flex items-center justify-between">
                    <p
                      className="text-[12px] font-medium"
                      style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                    >
                      {m.date}
                    </p>
                    <div className="flex items-center gap-2">
                      <p
                        className="text-[14px] font-bold"
                        style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
                      >
                        {m.value}
                      </p>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: `${def.accent}22`, color: def.accent, fontFamily: SYNTH.font }}
                      >
                        {m.delta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivating message */}
            <p
              className="mt-5 text-center text-[13px] leading-[1.6] italic"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              {def.message}
            </p>

            {/* CTA */}
            <button
              type="button"
              onClick={() => { onClose(); navigate(def.linkTo) }}
              className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-full py-3.5 text-[13px] font-semibold"
              style={{ background: def.accent, color: SYNTH.ink, fontFamily: SYNTH.font }}
            >
              {def.linkLabel}
              <ArrowUpRight size={14} strokeWidth={2.4} />
            </button>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

// ─── Illustrations ────────────────────────────────────────────────────────────

function TwoKIllustration() {
  return (
    <svg width={120} height={120} viewBox="0 0 120 120" fill="none" aria-hidden>
      {/* Water waves */}
      <path d="M10 95 Q25 88 40 95 Q55 102 70 95 Q85 88 110 95" stroke="rgba(99,179,237,0.4)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <path d="M10 102 Q25 95 40 102 Q55 109 70 102 Q85 95 110 102" stroke="rgba(99,179,237,0.25)" strokeWidth={1} fill="none" strokeLinecap="round" />
      {/* Hull side profile */}
      <path d="M20 82 Q60 76 100 82 L96 88 Q60 84 24 88 Z" fill="rgba(255,255,255,0.85)" />
      {/* Seats dots */}
      <circle cx={38} cy={80} r={3} fill={SYNTH.cardSky} />
      <circle cx={52} cy={78} r={3} fill={SYNTH.cardSky} />
      <circle cx={66} cy={78} r={3} fill={SYNTH.cardSky} />
      <circle cx={80} cy={80} r={3} fill={SYNTH.cardSky} />
      {/* Oar starboard */}
      <line x1={38} y1={80} x2={14} y2={92} stroke="rgba(255,255,255,0.7)" strokeWidth={2} strokeLinecap="round" />
      <ellipse cx={12} cy={93} rx={4} ry={2} fill="rgba(255,255,255,0.6)" />
      {/* Oar port */}
      <line x1={80} y1={80} x2={106} y2={92} stroke="rgba(255,255,255,0.7)" strokeWidth={2} strokeLinecap="round" />
      <ellipse cx={108} cy={93} rx={4} ry={2} fill="rgba(255,255,255,0.6)" />
      {/* Finish gate left post */}
      <line x1={16} y1={50} x2={16} y2={82} stroke={SYNTH.accentEmerald} strokeWidth={2} strokeLinecap="round" />
      {/* Finish gate right post */}
      <line x1={104} y1={50} x2={104} y2={82} stroke={SYNTH.accentEmerald} strokeWidth={2} strokeLinecap="round" />
      {/* Finish gate crossbar */}
      <line x1={16} y1={54} x2={104} y2={54} stroke={SYNTH.accentEmerald} strokeWidth={1.5} strokeDasharray="6 4" strokeLinecap="round" />
      {/* Checkered flag */}
      <rect x={100} y={30} width={14} height={12} rx={1} fill="rgba(255,255,255,0.85)" />
      <rect x={100} y={30} width={7} height={6} fill="rgba(0,0,0,0.7)" />
      <rect x={107} y={36} width={7} height={6} fill="rgba(0,0,0,0.7)" />
      <line x1={100} y1={30} x2={100} y2={18} stroke="rgba(255,255,255,0.7)" strokeWidth={1.5} strokeLinecap="round" />
      {/* Timer circle */}
      <circle cx={60} cy={36} r={16} stroke={SYNTH.cardSky} strokeWidth={2} fill="none" />
      <circle cx={60} cy={36} r={2} fill={SYNTH.cardSky} />
      <line x1={60} y1={36} x2={60} y2={24} stroke="rgba(255,255,255,0.8)" strokeWidth={1.8} strokeLinecap="round" />
      <line x1={60} y1={36} x2={70} y2={40} stroke="rgba(255,255,255,0.55)" strokeWidth={1.2} strokeLinecap="round" />
      {/* PR star */}
      <path d="M60 14 L61.5 18.5 L66 18.5 L62.5 21.5 L64 26 L60 23.5 L56 26 L57.5 21.5 L54 18.5 L58.5 18.5 Z"
        fill={SYNTH.accentEmerald} />
    </svg>
  )
}

function SplitIllustration() {
  return (
    <svg width={120} height={120} viewBox="0 0 120 120" fill="none" aria-hidden>
      {/* Stopwatch body */}
      <circle cx={60} cy={68} r={36} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} fill="rgba(255,255,255,0.06)" />
      <circle cx={60} cy={68} r={28} stroke={SYNTH.accentEmerald} strokeWidth={2} fill="none" />
      {/* Tick marks */}
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = (angle * Math.PI) / 180
        const x1 = 60 + 28 * Math.sin(rad)
        const y1 = 68 - 28 * Math.cos(rad)
        const x2 = 60 + 24 * Math.sin(rad)
        const y2 = 68 - 24 * Math.cos(rad)
        return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} strokeLinecap="round" />
      })}
      {/* Center dot */}
      <circle cx={60} cy={68} r={3} fill={SYNTH.accentEmerald} />
      {/* Hands */}
      <line x1={60} y1={68} x2={60} y2={46} stroke="rgba(255,255,255,0.9)" strokeWidth={2} strokeLinecap="round" />
      <line x1={60} y1={68} x2={74} y2={73} stroke="rgba(255,255,255,0.6)" strokeWidth={1.2} strokeLinecap="round" />
      {/* Crown */}
      <rect x={56} y={30} width={8} height={5} rx={2} fill="rgba(255,255,255,0.7)" />
      <rect x={55} y={26} width={4} height={5} rx={1} fill="rgba(255,255,255,0.5)" />
      <rect x={61} y={26} width={4} height={5} rx={1} fill="rgba(255,255,255,0.5)" />
      {/* Water ripples below */}
      <path d="M20 108 Q35 102 50 108 Q65 114 80 108 Q95 102 110 108" stroke="rgba(99,179,237,0.35)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <path d="M30 114 Q45 110 60 114 Q75 118 90 114" stroke="rgba(99,179,237,0.2)" strokeWidth={1} fill="none" strokeLinecap="round" />
      {/* Split speed arrows */}
      <path d="M24 60 L34 55 L34 65 Z" fill={SYNTH.accentEmerald} opacity={0.7} />
      <path d="M14 68 L24 63 L24 73 Z" fill={SYNTH.accentEmerald} opacity={0.4} />
    </svg>
  )
}

function LoadIllustration() {
  return (
    <svg width={120} height={120} viewBox="0 0 120 120" fill="none" aria-hidden>
      {/* Mountain backdrop */}
      <path d="M8 95 L38 45 L54 65 L72 28 L112 95 Z" fill="rgba(99,179,237,0.08)" />
      <path d="M8 95 L38 45 L54 65" stroke="rgba(99,179,237,0.3)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M54 65 L72 28 L112 95" stroke="rgba(16,185,129,0.5)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Summit dot */}
      <circle cx={72} cy={28} r={4} fill={SYNTH.accentEmerald} />
      {/* Barbell bar */}
      <rect x={28} y={72} width={64} height={6} rx={3} fill="rgba(255,255,255,0.7)" />
      {/* Left weight */}
      <rect x={18} y={64} width={12} height={22} rx={4} fill="rgba(255,255,255,0.5)" />
      <rect x={14} y={68} width={6} height={14} rx={2} fill="rgba(255,255,255,0.35)" />
      {/* Right weight */}
      <rect x={90} y={64} width={12} height={22} rx={4} fill="rgba(255,255,255,0.5)" />
      <rect x={100} y={68} width={6} height={14} rx={2} fill="rgba(255,255,255,0.35)" />
      {/* Progress arrow up */}
      <path d="M56 56 L60 46 L64 56" stroke={SYNTH.cardLemon} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1={60} y1={46} x2={60} y2={64} stroke={SYNTH.cardLemon} strokeWidth={2} strokeLinecap="round" />
      {/* TSS label (decorative) */}
      <rect x={46} y={98} width={28} height={14} rx={4} fill={`${SYNTH.cardLemon}33`} />
      <text x={60} y={109} textAnchor="middle" fontSize={8} fontWeight={700} fill={SYNTH.cardLemon} fontFamily="monospace">TSS 78</text>
    </svg>
  )
}

function RecoveryIllustration() {
  return (
    <svg width={120} height={120} viewBox="0 0 120 120" fill="none" aria-hidden>
      {/* Crescent moon */}
      <path d="M70 18 A28 28 0 1 0 70 74 A18 18 0 1 1 70 18 Z" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth={1.2} />
      {/* Stars */}
      <circle cx={90} cy={28} r={1.5} fill="rgba(255,255,255,0.7)" />
      <circle cx={98} cy={42} r={1} fill="rgba(255,255,255,0.5)" />
      <circle cx={86} cy={18} r={1} fill="rgba(255,255,255,0.6)" />
      {/* HRV waveform */}
      <polyline
        points="8,85 18,85 24,65 32,100 40,70 48,90 56,72 64,85 72,85 82,60 90,92 96,75 104,85 112,85"
        stroke={SYNTH.accentEmerald}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Recovery ring arc */}
      <circle cx={60} cy={50} r={24} stroke="rgba(255,255,255,0.15)" strokeWidth={4} fill="none" />
      <path
        d="M60 26 A24 24 0 1 1 38 67"
        stroke={SYNTH.accentEmerald}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      {/* Center label */}
      <text x={60} y={54} textAnchor="middle" fontSize={14} fontWeight={700} fill="white" fontFamily="monospace">84</text>
    </svg>
  )
}

function RiskIllustration() {
  return (
    <svg width={120} height={120} viewBox="0 0 120 120" fill="none" aria-hidden>
      {/* Shield body */}
      <path d="M60 14 L96 28 L96 62 Q96 88 60 106 Q24 88 24 62 L24 28 Z"
        fill="rgba(16,185,129,0.12)"
        stroke={SYNTH.accentEmerald}
        strokeWidth={2}
      />
      {/* Shield inner */}
      <path d="M60 22 L88 34 L88 62 Q88 82 60 96 Q32 82 32 62 L32 34 Z"
        fill="rgba(16,185,129,0.08)"
        stroke="rgba(16,185,129,0.3)"
        strokeWidth={1}
      />
      {/* Checkmark */}
      <path d="M44 62 L55 74 L76 50" stroke={SYNTH.accentEmerald} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Corner pulse dots */}
      <circle cx={24} cy={28} r={3} fill={SYNTH.accentEmerald} opacity={0.5} />
      <circle cx={96} cy={28} r={3} fill={SYNTH.accentEmerald} opacity={0.5} />
      {/* LOW pill */}
      <rect x={44} y={100} width={32} height={14} rx={7} fill={`${SYNTH.accentEmerald}33`} />
      <text x={60} y={111} textAnchor="middle" fontSize={8} fontWeight={700} fill={SYNTH.accentEmerald} fontFamily="monospace">LOW</text>
    </svg>
  )
}

function DataIllustration() {
  return (
    <svg width={120} height={120} viewBox="0 0 120 120" fill="none" aria-hidden>
      {/* Central hub */}
      <circle cx={60} cy={60} r={14} fill={`${SYNTH.cardMint}33`} stroke={SYNTH.cardMint} strokeWidth={2} />
      <circle cx={60} cy={60} r={5} fill={SYNTH.cardMint} />
      {/* Source nodes */}
      <circle cx={20} cy={28} r={9} fill="rgba(255,255,255,0.08)" stroke="rgba(99,179,237,0.6)" strokeWidth={1.5} />
      <circle cx={100} cy={28} r={9} fill="rgba(255,255,255,0.08)" stroke="rgba(245,158,11,0.6)" strokeWidth={1.5} />
      <circle cx={14} cy={80} r={9} fill="rgba(255,255,255,0.08)" stroke="rgba(239,68,68,0.5)" strokeWidth={1.5} />
      <circle cx={106} cy={80} r={9} fill="rgba(255,255,255,0.08)" stroke="rgba(167,139,250,0.6)" strokeWidth={1.5} />
      <circle cx={60} cy={108} r={9} fill="rgba(255,255,255,0.08)" stroke="rgba(16,185,129,0.5)" strokeWidth={1.5} />
      {/* Source labels */}
      <text x={20} y={31} textAnchor="middle" fontSize={6} fontWeight={700} fill="rgba(99,179,237,0.9)" fontFamily="monospace">C2</text>
      <text x={100} y={31} textAnchor="middle" fontSize={6} fontWeight={700} fill="rgba(245,158,11,0.9)" fontFamily="monospace">WP</text>
      <text x={14} y={83} textAnchor="middle" fontSize={5} fontWeight={700} fill="rgba(239,68,68,0.8)" fontFamily="monospace">TP</text>
      <text x={106} y={83} textAnchor="middle" fontSize={5} fontWeight={700} fill="rgba(167,139,250,0.9)" fontFamily="monospace">WH</text>
      <text x={60} y={111} textAnchor="middle" fontSize={5} fontWeight={700} fill="rgba(16,185,129,0.8)" fontFamily="monospace">HC</text>
      {/* Connector lines */}
      <line x1={28} y1={33} x2={50} y2={52} stroke="rgba(99,179,237,0.4)" strokeWidth={1.2} strokeDasharray="3 2" />
      <line x1={92} y1={33} x2={70} y2={52} stroke="rgba(245,158,11,0.4)" strokeWidth={1.2} strokeDasharray="3 2" />
      <line x1={22} y1={76} x2={48} y2={64} stroke="rgba(239,68,68,0.35)" strokeWidth={1.2} strokeDasharray="3 2" />
      <line x1={98} y1={76} x2={72} y2={64} stroke="rgba(167,139,250,0.4)" strokeWidth={1.2} strokeDasharray="3 2" />
      <line x1={60} y1={99} x2={60} y2={74} stroke="rgba(16,185,129,0.4)" strokeWidth={1.2} strokeDasharray="3 2" />
      {/* Signal pulses */}
      <circle cx={39} cy={42} r={2} fill="rgba(99,179,237,0.7)" />
      <circle cx={81} cy={42} r={2} fill="rgba(245,158,11,0.7)" />
      <circle cx={35} cy={70} r={2} fill="rgba(239,68,68,0.6)" />
      <circle cx={85} cy={70} r={2} fill="rgba(167,139,250,0.7)" />
      <circle cx={60} cy={87} r={2} fill="rgba(16,185,129,0.7)" />
    </svg>
  )
}
