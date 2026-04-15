import { motion } from 'framer-motion'
import { SynthLayerDashboardMockup } from '../components/SynthLayerDashboardMockup'
import { useSlideDeckMeta } from '../components/SlideDeckContext'
import { TopNav } from '../components/TopNav'
import { THEME } from '../lib/theme'
import { COACH_TOOL_IMAGES, coachToolSrc } from './coachToolImages'

const PAD = 'clamp(24px, 3.5vw, 40px) clamp(20px, 3.5vw, 48px) clamp(20px, 3.5vw, 32px)'
const R = 38

/** Coach tools around the synth shell with animated arrows → hub (classic solution diagram). */
export function SolutionDataHubSlide() {
  const { currentIndex, slideCount } = useSlideDeckMeta()
  const n = COACH_TOOL_IMAGES.length

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: THEME.light, padding: PAD }}>
      <TopNav section="APPENDIX · DRAFTS" page={`${currentIndex + 1} / ${slideCount}`} tone="light" />
      <h1
        className="shrink-0 text-[clamp(20px,3vw,30px)] font-bold leading-[1.08] tracking-[-0.04em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
      >
        Every surface points at the same roster layer.
      </h1>
      <p className="mt-1 max-w-[46rem] text-[11px] leading-snug text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
        Arrows are the story: messy tools in the wild normalize into the mini-site — no extra login wall for coaches.
      </p>

      <div className="relative mt-2 min-h-0 flex-1">
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="hub-arrow" markerWidth="4" markerHeight="4" refX="3.2" refY="2" orient="auto">
              <path d="M0,0 L4,2 L0,4 Z" fill={THEME.primary} opacity={0.55} />
            </marker>
          </defs>
          {COACH_TOOL_IMAGES.map((_, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2
            const x1 = 50 + R * Math.cos(angle)
            const y1 = 50 + R * Math.sin(angle)
            return (
              <motion.path
                key={`arr-${i}`}
                d={`M ${x1} ${y1} L 50 50`}
                fill="none"
                stroke={THEME.primary}
                strokeWidth={0.35}
                strokeOpacity={0.45}
                strokeDasharray="1.2 0.9"
                markerEnd="url(#hub-arrow)"
                initial={{ pathLength: 0, opacity: 0.4 }}
                animate={{
                  pathLength: 1,
                  opacity: 1,
                  strokeDashoffset: [0, -2.1],
                }}
                transition={{
                  pathLength: { duration: 1.1, delay: 0.08 * i, ease: 'easeOut' },
                  opacity: { duration: 1.1, delay: 0.08 * i, ease: 'easeOut' },
                  strokeDashoffset: { duration: 2.4, repeat: Infinity, ease: 'linear', delay: 0.9 + 0.06 * i },
                }}
              />
            )
          })}
        </svg>

        {COACH_TOOL_IMAGES.map((img, i) => {
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2
          const x = 50 + R * Math.cos(angle)
          const y = 50 + R * Math.sin(angle)
          return (
            <motion.div
              key={img.file}
              className="absolute w-[min(13vw,104px)]"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.06 * i }}
            >
              <div className="overflow-hidden rounded-xl border bg-white shadow-md" style={{ borderColor: THEME.border }}>
                <div className="aspect-[4/3] w-full bg-zinc-50">
                  <img src={coachToolSrc(img.file)} alt={img.alt} className="h-full w-full object-cover object-center" loading="lazy" />
                </div>
                <p
                  className="line-clamp-2 border-t px-1 py-1 text-[6px] font-medium leading-tight text-zinc-600"
                  style={{ fontFamily: THEME.fontSans, borderColor: THEME.border }}
                >
                  {img.alt}
                </p>
              </div>
            </motion.div>
          )
        })}

        <div
          className="absolute left-1/2 top-1/2 z-10 w-[min(52vw,420px)] -translate-x-1/2 -translate-y-1/2"
          style={{ maxHeight: 'min(58vh, 420px)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="h-full min-h-[240px]"
          >
            <SynthLayerDashboardMockup showSidebarDeploy={false} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
