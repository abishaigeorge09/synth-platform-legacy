import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutGrid, Timer, Plus, ChevronRight } from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { SYNTH } from '../lib/theme'

type Tool = {
  id: string
  name: string
  description: string
  to: string
  accent: string
  icon: React.ReactNode
}

const TOOLS: Tool[] = [
  {
    id: 'lineups',
    name: 'Lineup Builder',
    description: 'Build boats · race timer · ratings · publish + history',
    to: '/app/coach/lineups',
    accent: SYNTH.cardSky,
    icon: <LayoutGrid size={20} strokeWidth={2.2} />,
  },
  {
    id: 'stopwatch',
    name: 'Stopwatch',
    description: 'Time anything · tag the session + athletes when done',
    to: '/app/coach/tools/stopwatch',
    accent: SYNTH.cardLemon,
    icon: <Timer size={20} strokeWidth={2.2} />,
  },
]

export function CustomToolsPage() {
  const navigate = useNavigate()

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[140px]">
      <CoachPageHeader title="Tools" />

      <section className="mx-5 mt-2">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Connected tools
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {TOOLS.map((tool, i) => (
            <motion.button
              key={tool.id}
              type="button"
              whileTap={{ scale: 0.99 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.32 }}
              onClick={() => navigate(tool.to)}
              className="flex items-center gap-4 rounded-3xl p-5 text-left active:opacity-90"
              style={{
                background: tool.accent,
                boxShadow: SYNTH.shadow.card,
                color: SYNTH.ink,
              }}
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand }}
              >
                {tool.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="text-[16px] font-bold leading-tight"
                  style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
                >
                  {tool.name}
                </p>
                <p
                  className="mt-1 text-[12px] leading-[1.4]"
                  style={{ color: SYNTH.ink, opacity: 0.65, fontFamily: SYNTH.font }}
                >
                  {tool.description}
                </p>
              </div>
              <ChevronRight size={16} color={SYNTH.ink} />
            </motion.button>
          ))}

          {/* Request a tool */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.99 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.32 }}
            onClick={() => alert("We'll wire up a request flow soon. For now, ping the synth team.")}
            className="flex items-center gap-4 rounded-3xl border-2 border-dashed p-5 text-left"
            style={{
              background: SYNTH.glass,
              backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              borderColor: 'rgba(255,255,255,0.32)',
            }}
          >
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: SYNTH.inkOnBrand,
              }}
            >
              <Plus size={20} strokeWidth={2.4} />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="text-[16px] font-bold leading-tight"
                style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
              >
                Request a tool
              </p>
              <p
                className="mt-1 text-[12px] leading-[1.4]"
                style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
              >
                Want a video review tool? Erg pacer? Tell us — we'll build it.
              </p>
            </div>
          </motion.button>
        </div>
      </section>
    </div>
  )
}
