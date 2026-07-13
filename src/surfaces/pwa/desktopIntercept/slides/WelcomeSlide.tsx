import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { SYNTH } from '../../lib/theme'

const LINE_1 = 'synth. is built for your phone.'
const LINE_2 = 'Let me show you how to install it.'
const TYPE_MS = 35

type Props = {
  onNext: () => void
}

export function WelcomeSlide({ onNext }: Props) {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [phase, setPhase] = useState<'line1' | 'pause' | 'line2' | 'done'>('line1')

  // Line 1
  useEffect(() => {
    if (phase !== 'line1') return
    let i = 0
    const t = setInterval(() => {
      i += 1
      setText1(LINE_1.slice(0, i))
      if (i >= LINE_1.length) {
        clearInterval(t)
        setTimeout(() => setPhase('pause'), 240)
      }
    }, TYPE_MS)
    return () => clearInterval(t)
  }, [phase])

  // Pause then Line 2
  useEffect(() => {
    if (phase !== 'pause') return
    const t = setTimeout(() => setPhase('line2'), 320)
    return () => clearTimeout(t)
  }, [phase])

  // Line 2
  useEffect(() => {
    if (phase !== 'line2') return
    let i = 0
    const t = setInterval(() => {
      i += 1
      setText2(LINE_2.slice(0, i))
      if (i >= LINE_2.length) {
        clearInterval(t)
        setTimeout(() => setPhase('done'), 200)
      }
    }, TYPE_MS)
    return () => clearInterval(t)
  }, [phase])

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          fontFamily: SYNTH.font,
          fontWeight: 700,
          fontSize: 'clamp(36px, 4.5vw, 60px)',
          color: SYNTH.inkOnBrand,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          margin: 0,
        }}
      >
        {text1}
        {phase === 'line1' ? <Cursor /> : null}
      </motion.h1>

      <motion.h2
        animate={{ opacity: phase === 'line1' || phase === 'pause' ? 0.4 : 1 }}
        transition={{ duration: 0.3 }}
        style={{
          marginTop: 18,
          fontFamily: SYNTH.font,
          fontWeight: 500,
          fontSize: 'clamp(18px, 2vw, 26px)',
          color: SYNTH.inkOnBrandMuted,
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
        }}
      >
        {text2}
        {phase === 'line2' ? <Cursor /> : null}
      </motion.h2>

      <motion.button
        type="button"
        onClick={onNext}
        initial={{ opacity: 0, y: 8 }}
        animate={{
          opacity: phase === 'done' ? 1 : 0,
          y: phase === 'done' ? 0 : 8,
        }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        style={{
          marginTop: 56,
          padding: '14px 28px',
          borderRadius: 9999,
          background: SYNTH.accentEmerald,
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: '0.02em',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 14px 40px rgba(16,185,129,0.45), 0 0 0 1px rgba(255,255,255,0.16) inset',
        }}
      >
        Show me
        <ArrowRight size={16} strokeWidth={2.6} />
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'done' ? 0.6 : 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        style={{
          marginTop: 18,
          fontFamily: SYNTH.font,
          fontSize: 11,
          color: SYNTH.inkOnBrandFaint,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        Press → or space to continue
      </motion.p>
    </div>
  )
}

function Cursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
      style={{
        display: 'inline-block',
        width: '0.5ch',
        background: SYNTH.accentEmerald,
        marginLeft: '0.06em',
        verticalAlign: 'baseline',
        height: '0.92em',
      }}
    />
  )
}
