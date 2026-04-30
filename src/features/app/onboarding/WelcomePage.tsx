import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { useAppAuthStore } from '../store/useAppAuthStore'

/**
 * Welcome — Perplexity-inspired:
 *   • Top half: cobalt illustration zone (radial glow, abstract synth shapes)
 *   • Bottom half: dark panel rounded at the top corners with the synth
 *     wordmark + sign-in button stack (Google, email, demo).
 */
export function WelcomePage() {
  const navigate = useNavigate()
  const setDemoUser = useAppAuthStore((s) => s.setDemoUser)

  useEffect(() => {
    document.body.setAttribute('data-app-canvas', 'cobalt')
    return () => {
      document.body.removeAttribute('data-app-canvas')
    }
  }, [])

  const onGoogle = () => navigate('/app/coming-soon')

  const onEmail = () => navigate('/app/coming-soon')

  const onDemo = () => {
    setDemoUser({ id: 'demo-user', email: 'demo@synth.local' })
    navigate('/app')
  }

  return (
    <div
      className="flex flex-col"
      style={{
        background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
        fontFamily: SYNTH.font,
        // Lock to the dynamic viewport so iOS Safari's address-bar
        // collapse doesn't make us shorter than expected, and no overflow
        // so the bottom panel can't be dragged off-screen by overscroll.
        height: '100dvh',
        overflow: 'hidden',
        overscrollBehavior: 'none',
      }}
    >
      {/* Illustration zone — abstract synth scene over cobalt. Uses flex-1
          (no min-height) so it always shrinks to whatever's left after the
          dark panel claims its natural size. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-1 items-center justify-center overflow-hidden"
      >
        <SynthIllustration />
      </motion.div>

      {/* Dark panel — wordmark + button stack. shrink-0 so its content
          height is sacred — the illustration above absorbs the slack. */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="flex shrink-0 flex-col gap-4 px-6 pb-[max(env(safe-area-inset-bottom),24px)] pt-8"
        style={{
          background: SYNTH.accentBlack,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          color: SYNTH.inkOnBrand,
        }}
      >
        {/* Wordmark */}
        <div className="flex flex-col items-center gap-1.5">
          <span
            className="text-[36px] font-bold leading-none tracking-[-0.02em]"
            style={{ color: SYNTH.inkOnBrand }}
          >
            synth
            <span style={{ color: SYNTH.accentEmerald }}>.</span>
          </span>
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: SYNTH.inkOnBrandFaint }}
          >
            Every signal · one platform
          </span>
        </div>

        {/* Button stack */}
        <div className="mt-4 flex flex-col gap-2.5">
          <PillButton
            primary
            onClick={onGoogle}
            label="Continue with Google"
            icon={<GoogleGlyph />}
          />
          <PillButton
            onClick={onEmail}
            label="Continue with email"
            icon={<Mail size={16} strokeWidth={2.2} color={SYNTH.ink} />}
          />
          <button
            type="button"
            onClick={onDemo}
            className="mt-1 text-center text-[12px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
          >
            Continue as demo
          </button>
        </div>

        {/* Footer micro-copy */}
        <div className="mt-3 flex justify-center gap-6">
          <FooterLink>Privacy policy</FooterLink>
          <FooterLink>Terms of service</FooterLink>
        </div>
      </motion.div>
    </div>
  )
}

function PillButton({
  primary,
  onClick,
  label,
  icon,
}: {
  primary?: boolean
  onClick: () => void
  label: string
  icon?: React.ReactNode
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2.5 rounded-full py-3.5 text-[14px] font-semibold"
      style={{
        background: primary ? SYNTH.inkOnBrand : 'rgba(255,255,255,0.10)',
        color: primary ? SYNTH.ink : SYNTH.inkOnBrand,
        border: primary ? 'none' : '1px solid rgba(255,255,255,0.18)',
        fontFamily: SYNTH.font,
        letterSpacing: '0.01em',
      }}
    >
      {icon}
      {label}
    </motion.button>
  )
}

function FooterLink({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="text-[11px] font-medium"
      style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
    >
      {children}
    </button>
  )
}

/**
 * SynthIllustration — radial cobalt aurora behind a centered glyph stack.
 * Hand-built (no external asset). Aims for the same vibe as the Perplexity
 * cactus illustration: a quiet world above the dark sign-in panel.
 */
function SynthIllustration() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Soft radial glows */}
      <div
        className="absolute"
        style={{
          top: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 420,
          height: 420,
          background: `radial-gradient(circle, ${SYNTH.accentEmerald}55 0%, transparent 60%)`,
          filter: 'blur(8px)',
        }}
      />
      <div
        className="absolute"
        style={{
          top: '40%',
          left: '-10%',
          width: 320,
          height: 320,
          background: `radial-gradient(circle, ${SYNTH.cardSky}30 0%, transparent 60%)`,
          filter: 'blur(12px)',
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: '5%',
          right: '-8%',
          width: 300,
          height: 300,
          background: `radial-gradient(circle, ${SYNTH.cardPink}30 0%, transparent 60%)`,
          filter: 'blur(12px)',
        }}
      />

      {/* Stars / signal dots */}
      <div className="absolute inset-0">
        {STAR_POSITIONS.map((s, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              background: SYNTH.inkOnBrand,
              opacity: s.opacity,
            }}
            animate={{ opacity: [s.opacity, s.opacity * 0.4, s.opacity] }}
            transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Centered glyph — concentric rings + dot */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <SynthGlyph />
      </motion.div>
    </div>
  )
}

const STAR_POSITIONS = [
  { x: '12%', y: '14%', size: 3, opacity: 0.7 },
  { x: '24%', y: '6%', size: 2, opacity: 0.5 },
  { x: '70%', y: '10%', size: 4, opacity: 0.8 },
  { x: '88%', y: '18%', size: 2.5, opacity: 0.6 },
  { x: '8%', y: '40%', size: 2, opacity: 0.5 },
  { x: '92%', y: '55%', size: 3, opacity: 0.7 },
  { x: '18%', y: '70%', size: 2, opacity: 0.4 },
  { x: '78%', y: '78%', size: 3, opacity: 0.6 },
  { x: '40%', y: '22%', size: 2, opacity: 0.5 },
  { x: '56%', y: '88%', size: 2.5, opacity: 0.5 },
] as const

function SynthGlyph() {
  return (
    <svg width={180} height={180} viewBox="0 0 180 180" aria-hidden>
      <defs>
        <radialGradient id="synth-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={SYNTH.accentEmerald} stopOpacity={0.6} />
          <stop offset="100%" stopColor={SYNTH.accentEmerald} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={90} cy={90} r={84} fill="url(#synth-glow)" />
      {[78, 60, 42, 24].map((r, i) => (
        <circle
          key={r}
          cx={90}
          cy={90}
          r={r}
          fill="none"
          stroke={SYNTH.inkOnBrand}
          strokeWidth={1}
          strokeOpacity={0.18 + i * 0.08}
        />
      ))}
      <circle cx={90} cy={90} r={6} fill={SYNTH.accentEmerald} />
    </svg>
  )
}

function GoogleGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.797 2.717v2.258h2.908c1.702-1.567 2.685-3.874 2.685-6.616z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.346l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
      />
    </svg>
  )
}
