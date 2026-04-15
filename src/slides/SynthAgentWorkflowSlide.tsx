import { motion } from 'framer-motion'
import { SynthLayerDashboardMockup } from '../components/SynthLayerDashboardMockup'
import { TopNav } from '../components/TopNav'
import { THEME } from '../lib/theme'
import { DECK_SLIDE_TOTAL } from '../lib/deckTotal'
import { STAGGER, TRANSITIONS } from '../lib/motion'
import { COACH_TOOL_IMAGES, coachToolSrc } from './coachToolImages'

const PAD = 'clamp(20px, 3.2vw, 36px) clamp(18px, 3.2vw, 44px) clamp(16px, 3vw, 28px)'

const ATHLETE_NODE_META: { connectors: string[] }[] = [
  { connectors: ['Training', 'TeamWorks', 'Photos'] },
  { connectors: ['TeamWorks', 'Sheets', 'Events'] },
  { connectors: ['Sleep', 'Strava', 'Forms'] },
  { connectors: ['Sheets', 'Forms', 'Rows'] },
  { connectors: ['Erg', 'CSV', 'Sheets'] },
  { connectors: ['TeamWorks', 'Calendar'] },
  { connectors: ['TeamWorks', 'Compliance'] },
  { connectors: ['Sheets', 'Intervals', 'Bike'] },
]

const COACH_CONNECTOR_STRIP: { label: string; short: string }[] = [
  { label: 'Team / membership', short: 'WHOP' },
  { label: 'Broadcast / video', short: 'TV' },
  { label: 'Calendar', short: 'CAL' },
  { label: 'Email', short: 'MAIL' },
]

const NODE_POS = [
  { x: 7, y: 19 },
  { x: 7, y: 39 },
  { x: 93, y: 19 },
  { x: 93, y: 39 },
  { x: 20, y: 88 },
  { x: 38, y: 91 },
  { x: 62, y: 91 },
  { x: 80, y: 88 },
] as const

const COACH_NODE_POS = [
  { x: 34, y: 11 },
  { x: 43, y: 9 },
  { x: 57, y: 9 },
  { x: 66, y: 11 },
] as const

function hubTargetAthlete(i: number): { x: number; y: number } {
  if (i <= 1) return { x: 40, y: 44 + i * 6 }
  if (i <= 3) return { x: 60, y: 44 + (i - 2) * 6 }
  return { x: 44 + (i - 4) * 4.5, y: 56 }
}

const hubCx = 50
const hubCyAthlete = 47
const hubCyCoach = 36

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: STAGGER.cards, delayChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: TRANSITIONS.smooth },
}

export function SynthAgentWorkflowSlide() {
  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{
        background: `radial-gradient(ellipse 115% 92% at 50% 36%, ${THEME.primary} 0%, ${THEME.primaryDark} 48%, ${THEME.primaryDarker} 100%)`,
        padding: PAD,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/[0.07] via-transparent to-black/[0.24]"
        aria-hidden
      />

      <TopNav section="02 · SOLUTION" page={`5 / ${DECK_SLIDE_TOTAL}`} tone="dark" />

      <motion.div
        className="relative z-10 mx-auto w-full max-w-[52rem] shrink-0 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.p
          variants={itemVariants}
          className="text-[9px] font-bold uppercase tracking-[0.42em] text-emerald-100/88 sm:text-[10px]"
          style={{ fontFamily: THEME.fontMono, textShadow: '0 1px 16px rgba(0,0,0,0.35)' }}
        >
          Synth agent workflow
        </motion.p>
        <motion.h1
          variants={itemVariants}
          className="mt-1.5 text-[clamp(16px,2.5vw,22px)] font-bold leading-[1.2] tracking-[-0.02em] text-white sm:mt-2"
          style={{ fontFamily: THEME.fontSans, textShadow: '0 2px 22px rgba(0,0,0,0.42)' }}
        >
          Athlete devices + connectors → coach stack → dashboard
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="mx-auto mt-1.5 max-w-[42rem] text-[9px] leading-relaxed text-emerald-50/95 sm:text-[10px]"
          style={{ fontFamily: THEME.fontSans, textShadow: '0 1px 10px rgba(0,0,0,0.28)' }}
        >
          Left and bottom: each athlete&apos;s device and their connectors. Top: coach connectors (your systems). All streams merge
          into the Team Overview below.
        </motion.p>
        <motion.div
          variants={itemVariants}
          className="mx-auto mt-2 flex flex-wrap items-center justify-center gap-2"
          style={{ fontFamily: THEME.fontMono }}
        >
          <span className="rounded-md border border-emerald-400/35 bg-emerald-950/40 px-2 py-0.5 text-[6px] font-bold uppercase tracking-[0.12em] text-emerald-100 shadow-sm backdrop-blur-sm sm:text-[7px]">
            Athlete layer
          </span>
          <span className="text-white/40">·</span>
          <span className="rounded-md border border-amber-300/40 bg-amber-950/35 px-2 py-0.5 text-[6px] font-bold uppercase tracking-[0.12em] text-amber-50 shadow-sm backdrop-blur-sm sm:text-[7px]">
            Coach layer
          </span>
        </motion.div>
      </motion.div>

      <div className="relative z-[1] mt-1 min-h-0 flex-1">
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <marker id="wf-arrow-coach" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
              <path d="M0,0 L4,2 L0,4 Z" fill="#facc15" />
            </marker>
          </defs>

          {NODE_POS.map((p, i) => {
            const t = hubTargetAthlete(i)
            const mx = (t.x + hubCx) / 2
            const my = (t.y + hubCyAthlete) / 2
            const d = `M ${p.x} ${p.y} Q ${mx} ${my} ${hubCx} ${hubCyAthlete}`
            return (
              <motion.path
                key={`ath-road-${i}`}
                d={d}
                fill="none"
                stroke="#0a0a0a"
                strokeWidth={2.35}
                strokeOpacity={0.88}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="5.5 4.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.05, delay: 0.22 + 0.04 * i, ease: 'easeOut' }}
              />
            )
          })}
          {NODE_POS.map((_, i) => (
            <motion.path
              key={`ath-flow-${i}`}
              d={`M ${NODE_POS[i].x} ${NODE_POS[i].y} Q ${(hubTargetAthlete(i).x + hubCx) / 2} ${(hubTargetAthlete(i).y + hubCyAthlete) / 2} ${hubCx} ${hubCyAthlete}`}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={0.45}
              strokeDasharray="3 4"
              strokeLinecap="round"
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: -14 }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', delay: i * 0.1 }}
            />
          ))}

          {COACH_NODE_POS.map((p, i) => {
            const mx = (p.x + hubCx) / 2
            const my = (p.y + hubCyCoach) / 2
            const d = `M ${p.x} ${p.y} Q ${mx} ${my} ${hubCx} ${hubCyCoach}`
            return (
              <motion.path
                key={`co-${i}`}
                d={d}
                fill="none"
                stroke="#fde047"
                strokeWidth={0.62}
                strokeOpacity={0.94}
                strokeLinecap="round"
                markerEnd="url(#wf-arrow-coach)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, delay: 0.5 + 0.05 * i, ease: 'easeOut' }}
              />
            )
          })}
        </svg>

        {NODE_POS.map((p, i) => {
          const t = hubTargetAthlete(i)
          return (
            <motion.div
              key={`pkt-ath-${i}`}
              className="pointer-events-none absolute z-[5] h-2 w-2 rounded-full border border-black/35 shadow-[0_0_12px_rgba(250,204,21,0.6)]"
              style={{
                background: '#fbbf24',
                left: `${p.x}%`,
                top: `${p.y}%`,
                marginLeft: -4,
                marginTop: -4,
              }}
              animate={{
                left: [`${p.x}%`, `${t.x}%`, `${hubCx}%`],
                top: [`${p.y}%`, `${t.y}%`, `${hubCyAthlete}%`],
                opacity: [0.35, 1, 0.45],
                scale: [0.85, 1.05, 0.9],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            />
          )
        })}

        {COACH_NODE_POS.map((p, i) => (
          <motion.div
            key={`pkt-co-${i}`}
            className="pointer-events-none absolute z-[5] h-1.5 w-1.5 rounded-full border border-amber-100/70 shadow-sm"
            style={{
              background: '#fef9c3',
              left: `${p.x}%`,
              top: `${p.y}%`,
              marginLeft: -3,
              marginTop: -3,
            }}
            animate={{
              left: [`${p.x}%`, `${hubCx}%`],
              top: [`${p.y}%`, `${hubCyCoach}%`],
              opacity: [0.5, 1, 0.55],
            }}
            transition={{
              duration: 2.1,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.45 + i * 0.17,
            }}
          />
        ))}

        <div className="pointer-events-none absolute inset-x-0 z-[18]" style={{ top: 'clamp(7%, 8vh, 11%)' }}>
          {COACH_CONNECTOR_STRIP.map((c, i) => {
            const p = COACH_NODE_POS[i]
            if (!p) return null
            return (
              <motion.div
                key={c.label}
                className="absolute flex flex-col items-center"
                style={{ left: `${p.x}%`, transform: 'translateX(-50%)' }}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.06, ...TRANSITIONS.smooth }}
              >
                <span
                  className="mb-0.5 whitespace-nowrap rounded-md border border-amber-200/50 bg-gradient-to-b from-amber-200 to-amber-300 px-2 py-1 text-[7px] font-bold uppercase tracking-wide text-amber-950 shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                  style={{ fontFamily: THEME.fontMono }}
                >
                  {c.short}
                </span>
                <span
                  className="max-w-[4.8rem] text-center text-[5px] font-medium leading-tight text-emerald-50/92"
                  style={{ fontFamily: THEME.fontSans }}
                >
                  {c.label}
                </span>
              </motion.div>
            )
          })}
        </div>

        {COACH_TOOL_IMAGES.map((img, i) => {
          const p = NODE_POS[i]
          const meta = ATHLETE_NODE_META[i]
          if (!p || !meta) return null
          return (
            <motion.div
              key={img.file}
              className="absolute z-[15] w-[min(10.5vw,90px)] sm:w-[min(11vw,96px)]"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.28 + 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
            >
              <p
                className="mb-0.5 text-center text-[6px] font-bold uppercase tracking-wider text-amber-50"
                style={{ fontFamily: THEME.fontMono }}
              >
                Athlete {i + 1}
              </p>
              <div
                className="mb-0.5 rounded border border-amber-400/35 bg-black/25 px-1 py-0.5 text-center text-[5px] font-bold uppercase tracking-wider text-amber-50/95"
                style={{ fontFamily: THEME.fontMono }}
              >
                Device
              </div>
              <div className="relative">
                <div className="overflow-hidden rounded-lg border-2 border-black/45 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.38)] ring-1 ring-white/10">
                  <div className="aspect-[4/3] w-full bg-zinc-100">
                    <img src={coachToolSrc(img.file)} alt="" className="h-full w-full object-cover object-center" loading="lazy" />
                  </div>
                </div>
                <span className="pointer-events-none absolute -left-0.5 -top-0.5 h-1.5 w-1.5 border-l border-t border-amber-200/65" />
                <span className="pointer-events-none absolute -right-0.5 -top-0.5 h-1.5 w-1.5 border-r border-t border-amber-200/65" />
                <span className="pointer-events-none absolute -bottom-0.5 -left-0.5 h-1.5 w-1.5 border-b border-l border-amber-200/65" />
                <span className="pointer-events-none absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 border-b border-r border-amber-200/65" />
              </div>
              <div
                className="mt-1 rounded-md border border-emerald-800/50 bg-emerald-950/45 px-1 py-1 shadow-inner"
                style={{ fontFamily: THEME.fontMono }}
              >
                <p className="text-center text-[5px] font-bold uppercase tracking-wider text-emerald-50/95">Tools / connectors</p>
                <div className="mt-0.5 flex flex-wrap justify-center gap-0.5">
                  {meta.connectors.map((name) => (
                    <span
                      key={name}
                      className="rounded border border-emerald-400/35 bg-emerald-500 px-1 py-px text-[5px] font-semibold text-white shadow-sm"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}

        <div
          className="absolute left-1/2 top-[50%] z-20 w-[min(55vw,448px)] -translate-x-1/2 -translate-y-1/2"
          style={{ maxHeight: 'min(56vh, 420px)' }}
        >
          <motion.div
            className="mb-1 flex flex-wrap items-end justify-between gap-1.5 px-0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.4 }}
          >
            <p
              className="text-[7px] font-bold uppercase tracking-[0.2em] text-white sm:text-[8px]"
              style={{ fontFamily: THEME.fontMono, textShadow: '0 1px 14px rgba(0,0,0,0.45)' }}
            >
              Coach dashboard
            </p>
            <p className="max-w-[13rem] text-[5px] font-medium leading-snug text-emerald-50/88 sm:text-[6px]" style={{ fontFamily: THEME.fontSans }}>
              Field data + coach stack → unified roster
            </p>
          </motion.div>

          <motion.div
            layoutId="synth-dashboard-hero"
            className="h-full min-h-[220px] w-full overflow-hidden rounded-xl shadow-[0_28px_64px_rgba(0,0,0,0.48)] ring-1 ring-white/18"
            transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.85 }}
          >
            <SynthLayerDashboardMockup
              showSidebarDeploy={false}
              showCoachProfile
              workflowDetail
              sourcesIngestSuffix="8 athlete bundles + coach roster stack"
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
