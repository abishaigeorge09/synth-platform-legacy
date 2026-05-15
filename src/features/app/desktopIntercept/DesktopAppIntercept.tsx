import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { OnboardingBackground } from '../primitives/OnboardingBackground'
import { SYNTH } from '../lib/theme'
import { WelcomeSlide } from './slides/WelcomeSlide'
import { PhoneDemoSlide } from './slides/PhoneDemoSlide'
import { InstructionsSlide } from './slides/InstructionsSlide'
import { WaitlistSlide } from './slides/WaitlistSlide'

const TOTAL = 4

// Per-slide auto-advance durations (ms). Tuned so the typing on slide 0
// finishes, the phone demo on slide 1 completes one full loop, and slide 3
// gives time to read + (optionally) submit before looping back.
const SLIDE_DURATIONS = [7000, 11000, 9000, 9000]

type Props = {
  onDismiss: () => void
}

/**
 * Full-screen desktop intercept for /app/welcome. Slide-deck of four
 * panels that walks a desktop visitor through installing the synth PWA on
 * their phone, ending with a waitlist signup. Auto-advances on a timer
 * (and loops back to slide 0 from slide 3) so it plays as a continuous
 * attract-loop. Manual nav resets the timer for the new slide.
 *
 * Dismissal flips a session flag so it doesn't reappear during the same
 * browser session.
 */
export function DesktopAppIntercept({ onDismiss }: Props) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const goTo = (next: number) => {
    // Wrap modulo so slide 3 → slide 0.
    const wrapped = ((next % TOTAL) + TOTAL) % TOTAL
    setDirection(wrapped > index || (index === TOTAL - 1 && wrapped === 0) ? 1 : -1)
    setIndex(wrapped)
  }

  // Auto-advance every SLIDE_DURATIONS[index] ms. Resets when index
  // changes (manual nav included), so a click moves the timer forward.
  useEffect(() => {
    const t = setTimeout(() => {
      goTo(index + 1)
    }, SLIDE_DURATIONS[index])
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  // Keyboard nav — arrows + space + esc (dismiss)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        goTo(index + 1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goTo(index - 1)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onDismiss()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
        fontFamily: SYNTH.font,
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      <OnboardingBackground variant="default" />

      {/* Top bar — synth logo + skip */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '24px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontFamily: SYNTH.font,
            fontWeight: 700,
            fontSize: 18,
            color: SYNTH.inkOnBrand,
            letterSpacing: '-0.02em',
          }}
        >
          synth
          <span style={{ color: SYNTH.accentEmerald }}>.</span>
        </span>
        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: SYNTH.inkOnBrandFaint,
            fontFamily: SYNTH.font,
            fontSize: 12,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            padding: '6px 12px',
          }}
        >
          Skip
        </button>
      </header>

      {/* Slides */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          paddingTop: 80,
          paddingBottom: 100,
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'stretch',
        }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: '100%', height: '100%' }}
          >
            {index === 0 ? <WelcomeSlide onNext={() => goTo(1)} /> : null}
            {index === 1 ? <PhoneDemoSlide /> : null}
            {index === 2 ? <InstructionsSlide /> : null}
            {index === 3 ? <WaitlistSlide /> : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer — progress dots + arrows */}
      <footer
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            borderRadius: 9999,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.16)',
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            fontSize: 12,
            cursor: 'pointer',
            backdropFilter: 'blur(20px)',
          }}
        >
          <ArrowLeft size={14} strokeWidth={2.4} />
          Back
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === index ? 28 : 8,
                height: 8,
                borderRadius: 9999,
                background: i === index ? SYNTH.accentEmerald : 'rgba(255,255,255,0.22)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => goTo(index + 1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            borderRadius: 9999,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.16)',
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            fontSize: 12,
            cursor: 'pointer',
            backdropFilter: 'blur(20px)',
          }}
        >
          Next
          <ArrowRight size={14} strokeWidth={2.4} />
        </button>
      </footer>
    </div>
  )
}
