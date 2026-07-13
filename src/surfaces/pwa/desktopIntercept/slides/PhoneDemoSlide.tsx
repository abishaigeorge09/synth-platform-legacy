import { motion } from 'framer-motion'
import { Share, Plus } from 'lucide-react'
import { PhoneFrame } from '../PhoneFrame'
import { SafariMockup } from '../SafariMockup'
import { SYNTH } from '../../lib/theme'

export function PhoneDemoSlide() {
  return (
    <div className="grid h-full w-full grid-cols-2 items-center px-12 gap-10">
      {/* Left — caption */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-start"
      >
        <span
          style={{
            fontFamily: SYNTH.font,
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: SYNTH.inkOnBrandFaint,
          }}
        >
          Step by step
        </span>
        <h2
          style={{
            marginTop: 12,
            fontFamily: SYNTH.font,
            fontSize: 'clamp(36px, 3.6vw, 52px)',
            fontWeight: 700,
            color: SYNTH.inkOnBrand,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
          }}
        >
          On Safari, tap{' '}
          <InlineIcon>
            <Share size={18} color={SYNTH.inkOnBrand} strokeWidth={2.4} />
          </InlineIcon>{' '}
          Share, then{' '}
          <span style={{ whiteSpace: 'nowrap' }}>
            <InlineIcon>
              <Plus size={18} color={SYNTH.inkOnBrand} strokeWidth={2.6} />
            </InlineIcon>{' '}
            Add to Home Screen.
          </span>
        </h2>
        <p
          style={{
            marginTop: 22,
            fontFamily: SYNTH.font,
            fontSize: 16,
            color: SYNTH.inkOnBrandMuted,
            lineHeight: 1.5,
            maxWidth: 460,
          }}
        >
          synth opens fullscreen, hides Safari's chrome, and runs offline once
          installed.
        </p>
        <p
          style={{
            marginTop: 18,
            fontFamily: SYNTH.font,
            fontSize: 13,
            color: SYNTH.inkOnBrandFaint,
            letterSpacing: '0.04em',
          }}
        >
          On Android: tap ⋮ → Add to Home Screen.
        </p>
      </motion.div>

      {/* Right — phone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
        animate={{
          opacity: 1,
          scale: 1,
          rotateY: -6,
          y: [0, -8, 0],
        }}
        transition={{
          opacity: { duration: 0.6 },
          scale: { duration: 0.6 },
          rotateY: { duration: 0.6 },
          y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          perspective: 1200,
          transformStyle: 'preserve-3d',
        }}
      >
        <PhoneFrame width={300}>
          <SafariMockup />
        </PhoneFrame>
      </motion.div>
    </div>
  )
}

function InlineIcon({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 10,
        background: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.22)',
        verticalAlign: 'middle',
        margin: '0 4px',
      }}
    >
      {children}
    </span>
  )
}
