import { motion } from 'framer-motion'
import { SYNTH } from '../lib/theme'

type Variant = 'default' | 'role' | 'sport' | 'team' | 'capabilities' | 'connectors' | 'trust' | 'scanning' | 'reveal'

type Orb = { x: string; y: string; size: number; color: string; delay: number; drift: number }
type Star = { x: string; y: string; size: number; opacity: number; period: number }

/**
 * Ambient background for every onboarding screen — large drifting colored
 * orbs (heavily blurred) + twinkling stars + a gentle grain layer behind
 * a subtle vignette. Sits absolutely positioned with pointer-events: none
 * so it never steals taps. Variants tint the orb palette so each step
 * has its own personality without breaking visual consistency.
 */
export function OnboardingBackground({ variant = 'default' }: { variant?: Variant }) {
  const orbs = ORBS_BY_VARIANT[variant] ?? ORBS_BY_VARIANT.default

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Drifting orbs — soft glows that move slowly */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color}66 0%, ${orb.color}00 60%)`,
            filter: 'blur(40px)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            x: [0, orb.drift, -orb.drift * 0.6, 0],
            y: [0, -orb.drift * 0.4, orb.drift * 0.6, 0],
          }}
          transition={{
            duration: 18 + i * 2,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Twinkling stars across the whole canvas */}
      {STARS.map((star, i) => (
        <motion.span
          key={`s-${i}`}
          className="absolute rounded-full"
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            background: SYNTH.inkOnBrand,
            opacity: star.opacity,
            boxShadow: `0 0 ${star.size * 1.5}px ${SYNTH.inkOnBrand}55`,
          }}
          animate={{ opacity: [star.opacity, star.opacity * 0.25, star.opacity] }}
          transition={{
            duration: star.period,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.07,
          }}
        />
      ))}

      {/* Subtle vignette so content stays readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, transparent 55%, rgba(15, 18, 80, 0.35) 100%)',
        }}
      />
    </div>
  )
}

// ─── Orb palettes per variant ───────────────────────────────────────────────

const ORBS_BY_VARIANT: Record<Variant, Orb[]> = {
  default: [
    { x: '20%', y: '20%', size: 380, color: SYNTH.accentEmerald, delay: 0, drift: 30 },
    { x: '85%', y: '30%', size: 320, color: SYNTH.cardSky, delay: 1.5, drift: 24 },
    { x: '15%', y: '75%', size: 360, color: SYNTH.cardPink, delay: 3, drift: 28 },
    { x: '78%', y: '82%', size: 300, color: SYNTH.cardLemon, delay: 4.5, drift: 22 },
  ],
  role: [
    { x: '22%', y: '18%', size: 400, color: SYNTH.accentEmerald, delay: 0, drift: 32 },
    { x: '82%', y: '24%', size: 320, color: SYNTH.cardSky, delay: 2, drift: 24 },
    { x: '50%', y: '85%', size: 360, color: SYNTH.cardPink, delay: 4, drift: 26 },
  ],
  sport: [
    // sky-leaning palette — water / outdoor feel
    { x: '25%', y: '20%', size: 380, color: SYNTH.cardSky, delay: 0, drift: 30 },
    { x: '80%', y: '25%', size: 320, color: SYNTH.accentEmerald, delay: 2, drift: 22 },
    { x: '40%', y: '85%', size: 360, color: SYNTH.cardSky, delay: 4, drift: 28 },
    { x: '90%', y: '80%', size: 280, color: SYNTH.cardMint, delay: 6, drift: 20 },
  ],
  team: [
    // pink + emerald — warm, communal
    { x: '20%', y: '22%', size: 380, color: SYNTH.cardPink, delay: 0, drift: 30 },
    { x: '85%', y: '28%', size: 320, color: SYNTH.accentEmerald, delay: 2, drift: 24 },
    { x: '60%', y: '88%', size: 340, color: SYNTH.cardCream, delay: 4, drift: 26 },
  ],
  capabilities: [
    // lemon + emerald — energetic
    { x: '18%', y: '18%', size: 380, color: SYNTH.cardLemon, delay: 0, drift: 30 },
    { x: '82%', y: '30%', size: 320, color: SYNTH.accentEmerald, delay: 1.5, drift: 24 },
    { x: '50%', y: '85%', size: 360, color: SYNTH.cardLemon, delay: 3, drift: 28 },
  ],
  connectors: [
    // all four — diverse signals coming in
    { x: '15%', y: '15%', size: 320, color: SYNTH.accentEmerald, delay: 0, drift: 24 },
    { x: '85%', y: '20%', size: 300, color: SYNTH.cardSky, delay: 1.5, drift: 22 },
    { x: '10%', y: '70%', size: 320, color: SYNTH.cardPink, delay: 3, drift: 24 },
    { x: '88%', y: '78%', size: 300, color: SYNTH.cardLemon, delay: 4.5, drift: 22 },
    { x: '50%', y: '50%', size: 260, color: SYNTH.cardMint, delay: 6, drift: 18 },
  ],
  trust: [
    // emerald-heavy — calm, safe
    { x: '50%', y: '20%', size: 460, color: SYNTH.accentEmerald, delay: 0, drift: 32 },
    { x: '15%', y: '70%', size: 340, color: SYNTH.accentEmerald, delay: 2, drift: 26 },
    { x: '85%', y: '78%', size: 320, color: SYNTH.cardMint, delay: 4, drift: 22 },
  ],
  scanning: [
    // faster drift to feel alive while scanning
    { x: '20%', y: '20%', size: 360, color: SYNTH.accentEmerald, delay: 0, drift: 50 },
    { x: '82%', y: '28%', size: 320, color: SYNTH.cardSky, delay: 1, drift: 44 },
    { x: '20%', y: '78%', size: 340, color: SYNTH.cardLemon, delay: 2, drift: 48 },
    { x: '82%', y: '82%', size: 300, color: SYNTH.cardPink, delay: 3, drift: 40 },
  ],
  reveal: [
    // celebratory all-color spread
    { x: '15%', y: '15%', size: 360, color: SYNTH.cardLemon, delay: 0, drift: 28 },
    { x: '85%', y: '20%', size: 340, color: SYNTH.cardPink, delay: 1.5, drift: 26 },
    { x: '20%', y: '80%', size: 360, color: SYNTH.accentEmerald, delay: 3, drift: 28 },
    { x: '82%', y: '82%', size: 320, color: SYNTH.cardSky, delay: 4.5, drift: 24 },
  ],
}

// ─── Star field — same on every screen ──────────────────────────────────────

const STARS: Star[] = [
  { x: '8%', y: '10%', size: 2.5, opacity: 0.7, period: 3.2 },
  { x: '18%', y: '6%', size: 1.5, opacity: 0.5, period: 4.0 },
  { x: '28%', y: '14%', size: 3, opacity: 0.6, period: 3.6 },
  { x: '40%', y: '8%', size: 1.5, opacity: 0.45, period: 5.0 },
  { x: '56%', y: '12%', size: 2.5, opacity: 0.55, period: 4.4 },
  { x: '72%', y: '6%', size: 2, opacity: 0.7, period: 3.8 },
  { x: '88%', y: '14%', size: 3, opacity: 0.6, period: 4.2 },
  { x: '5%', y: '38%', size: 2, opacity: 0.4, period: 4.6 },
  { x: '94%', y: '40%', size: 2.5, opacity: 0.55, period: 3.4 },
  { x: '12%', y: '52%', size: 1.5, opacity: 0.45, period: 5.2 },
  { x: '90%', y: '58%', size: 2, opacity: 0.5, period: 4.0 },
  { x: '8%', y: '88%', size: 2, opacity: 0.5, period: 3.8 },
  { x: '24%', y: '92%', size: 1.5, opacity: 0.4, period: 5.4 },
  { x: '42%', y: '88%', size: 2.5, opacity: 0.55, period: 4.2 },
  { x: '62%', y: '92%', size: 1.5, opacity: 0.4, period: 5.0 },
  { x: '82%', y: '88%', size: 3, opacity: 0.6, period: 3.6 },
  { x: '36%', y: '32%', size: 1.5, opacity: 0.4, period: 4.8 },
  { x: '64%', y: '36%', size: 2, opacity: 0.5, period: 4.2 },
  { x: '50%', y: '70%', size: 1.5, opacity: 0.4, period: 5.6 },
  { x: '76%', y: '66%', size: 2, opacity: 0.5, period: 4.0 },
]
