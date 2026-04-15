import { motion } from 'framer-motion'
import { ExportPdfButton } from '../components/ExportPdfButton'
import { PixelArt } from '../components/PixelArt'
import { SynthAgentVisual } from '../components/SynthAgentVisual'
import { TopNav } from '../components/TopNav'
import { STAGGER, TRANSITIONS } from '../lib/motion'
import { THEME } from '../lib/theme'

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER.highlights, delayChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: TRANSITIONS.smooth },
}

export function S13_ThankYou() {
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden text-white" style={{ padding: '52px 48px 40px' }}>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <PixelArt pattern="scatter" seed={4} color="#ffffff" opacity={0.06} />
      </div>

      <SynthAgentVisual />

      <TopNav section="THANK YOU" page="17 / 17" tone="dark" />

      <motion.div
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={item}
          className="text-[clamp(44px,6.5vw,80px)] font-bold leading-[0.95] tracking-[-0.05em]"
          style={{ fontFamily: THEME.fontMono }}
        >
          Thank you.
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-8 max-w-[520px] text-[15px] leading-[1.6] text-white/82"
          style={{ fontFamily: THEME.fontSans }}
        >
          Questions welcome, we&apos;d love to keep the conversation going.
        </motion.p>
        <motion.div variants={item} className="mt-10 flex flex-col items-center gap-3">
          <div className="text-[11px] uppercase tracking-[0.16em] text-white/55" style={{ fontFamily: THEME.fontMono }}>
            synthsports.com · supportsynth@gmail.com
          </div>
          <motion.div
            className="mt-2 text-[36px] font-bold leading-none"
            style={{ fontFamily: THEME.logoFont, fontWeight: THEME.logoWeight }}
            animate={{ opacity: [0.92, 1, 0.92] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            synth<span style={{ color: THEME.logoDotColor }}>.</span>
          </motion.div>
        </motion.div>
      </motion.div>

      <ExportPdfButton tone="green" />
    </div>
  )
}
