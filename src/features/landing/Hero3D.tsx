import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { THEME } from '../../lib/theme'

/**
 * Full-viewport hero section. Text block on the left, a 3D parallax card
 * stack on the right that tilts with the cursor. Dependency-free — pure CSS
 * 3D transforms + Framer Motion springs.
 */
export function Hero3D({
  onDownload,
  downloadLabel,
}: {
  onDownload: () => void
  downloadLabel: string
}) {
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const sprX = useSpring(mouseX, { stiffness: 140, damping: 18, mass: 0.4 })
  const sprY = useSpring(mouseY, { stiffness: 140, damping: 18, mass: 0.4 })

  const rotateY = useTransform(sprX, [0, 1], [10, -10])
  const rotateX = useTransform(sprY, [0, 1], [-8, 8])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }

  function handleMouseLeave() {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0]
    if (!touch) return
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((touch.clientX - rect.left) / rect.width)
    mouseY.set((touch.clientY - rect.top) / rect.height)
  }

  function handleTouchEnd() {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative flex min-h-dvh items-center overflow-hidden"
      style={{
        background: `linear-gradient(165deg, ${THEME.primaryDarker} 0%, ${THEME.primary} 45%, ${THEME.primaryLight} 180%)`,
        color: THEME.white,
        touchAction: 'pan-y',
      }}
    >
      {/* Ambient grid lines */}
      <GridBackdrop />

      <div className="relative z-10 grid w-full gap-12 px-5 pt-24 pb-16 sm:px-10 sm:pt-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Left — text column */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex flex-col justify-center"
        >
          <div
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] backdrop-blur"
            style={{ fontFamily: THEME.fontMono, color: 'rgba(255,255,255,0.9)' }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: THEME.accent }} />
            Coach data · unified
          </div>
          <h1
            className="text-[clamp(52px,7.5vw,108px)] font-semibold leading-[0.9] tracking-[-0.035em]"
            style={{ fontFamily: THEME.fontMono }}
          >
            Every data signal.
            <br />
            <span className="relative inline-block">
              One platform<span style={{ color: THEME.primaryLight }}>.</span>
            </span>
          </h1>
          <p
            className="mt-7 max-w-[560px] text-[clamp(15px,1.4vw,19px)] leading-relaxed opacity-95"
            style={{ fontFamily: THEME.fontSerif }}
          >
            synth. connects every tool your program already uses, scrapes and synthesizes the data, and hands
            coaches and athletes one surface to act on.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/coach/dashboard"
              className="rounded-full px-6 py-3 text-[13px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.03]"
              style={{
                background: THEME.white,
                color: THEME.primaryDarker,
                fontFamily: THEME.fontMono,
                boxShadow: '0 20px 60px -20px rgba(4,120,87,0.7)',
              }}
            >
              Enter demo dashboard
            </Link>
            <button
              type="button"
              onClick={onDownload}
              className="rounded-full border px-6 py-3 text-[13px] font-semibold uppercase tracking-wider transition-all hover:bg-white/10"
              style={{
                borderColor: 'rgba(255,255,255,0.45)',
                color: THEME.white,
                fontFamily: THEME.fontMono,
                background: 'transparent',
              }}
            >
              {downloadLabel}
            </button>
          </div>

          {/* Stats row */}
          <div className="mt-12 grid max-w-[520px] grid-cols-3 gap-6">
            <Stat label="Connectors" value="4" />
            <Stat label="Athletes" value="52" />
            <Stat label="Custom tools" value="2" />
          </div>
        </motion.div>

        {/* Right — 3D card stack */}
        <div
          className="relative flex min-h-[420px] items-center justify-center sm:min-h-[540px]"
          style={{ perspective: 1400 }}
        >
          <motion.div
            className="relative h-[420px] w-full max-w-[420px] sm:h-[540px] sm:max-w-[640px]"
            style={{
              transformStyle: 'preserve-3d',
              rotateX,
              rotateY,
              willChange: 'transform',
            }}
          >
            <DashboardCard x={sprX} y={sprY} />
            <AthleteCard x={sprX} y={sprY} />
            <ConnectorChip x={sprX} y={sprY} />
            <AiBubble x={sprX} y={sprY} />
            <StatTile x={sprX} y={sprY} />
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.8 }}
      >
        <span
          className="text-[9px] font-semibold uppercase tracking-[0.3em] opacity-70"
          style={{ fontFamily: THEME.fontMono }}
        >
          scroll
        </span>
        <motion.span
          animate={{ y: [0, 6, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="h-5 w-px"
          style={{ background: 'rgba(255,255,255,0.8)' }}
        />
      </motion.div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="text-[36px] font-bold leading-none"
        style={{ fontFamily: THEME.fontMono }}
      >
        {value}
      </div>
      <div
        className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70"
        style={{ fontFamily: THEME.fontMono }}
      >
        {label}
      </div>
    </div>
  )
}

/* ─── 3D cards ─────────────────────────────────────────────────────────── */

type CardProps = { x: MotionValue<number>; y: MotionValue<number> }

function useFloat(amount: number, delay: number) {
  return {
    animate: { y: [0, -amount, 0] },
    transition: {
      duration: 6 + delay * 0.3,
      repeat: Infinity,
      ease: 'easeInOut' as const,
      delay,
    },
  }
}

function cardShadow(depth: number) {
  return `0 ${30 + depth * 4}px ${60 + depth * 6}px -20px rgba(4,47,30,0.55), 0 1px 0 rgba(255,255,255,0.08) inset`
}

function DashboardCard({ x, y }: CardProps) {
  const tx = useTransform(x, [0, 1], [-14, 14])
  const ty = useTransform(y, [0, 1], [-10, 10])
  return (
    <motion.div
      {...useFloat(8, 0)}
      style={{
        x: tx,
        y: ty,
        transform: 'translateZ(0px)',
        transformStyle: 'preserve-3d',
      }}
      className="absolute left-[8%] top-[10%] w-[78%]"
    >
      <div
        className="overflow-hidden rounded-2xl border"
        style={{
          background: THEME.white,
          borderColor: 'rgba(255,255,255,0.5)',
          boxShadow: cardShadow(0),
        }}
      >
        <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: THEME.border }}>
          <div>
            <div
              className="text-[8px] font-semibold uppercase tracking-[0.18em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              Coach · dashboard
            </div>
            <div className="mt-0.5 text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>
              Cal Women's Rowing
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: THEME.accent }} />
            <span
              className="text-[9px] font-semibold uppercase tracking-wider"
              style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
            >
              live
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 border-b p-5" style={{ borderColor: THEME.border }}>
          {[
            { k: 'Roster', v: '52', c: THEME.primary },
            { k: 'Sessions', v: '13', c: THEME.cyan },
            { k: 'Alerts', v: '3', c: THEME.amber },
          ].map((t) => (
            <div
              key={t.k}
              className="rounded-lg border p-2.5"
              style={{ borderColor: THEME.border, borderLeft: `2px solid ${t.c}`, background: THEME.light }}
            >
              <div
                className="text-[7px] font-semibold uppercase tracking-[0.16em]"
                style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
              >
                {t.k}
              </div>
              <div
                className="mt-1 text-[18px] font-bold leading-none"
                style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
              >
                {t.v}
              </div>
            </div>
          ))}
        </div>
        <div className="p-5">
          <div
            className="text-[8px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            Signal · monthly
          </div>
          <div className="mt-2 flex h-[64px] items-end gap-1.5">
            {[38, 58, 68, 42, 72, 82, 88, 62].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                className="flex-1 rounded-t-md"
                style={{ background: `linear-gradient(180deg, ${THEME.primary}, ${THEME.primaryDark})` }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function AthleteCard({ x, y }: CardProps) {
  const tx = useTransform(x, [0, 1], [26, -26])
  const ty = useTransform(y, [0, 1], [-18, 18])
  return (
    <motion.div
      {...useFloat(10, 0.8)}
      style={{
        x: tx,
        y: ty,
        transform: 'translateZ(110px)',
      }}
      className="absolute right-[4%] top-[40%] w-[220px]"
    >
      <div
        className="overflow-hidden rounded-xl border"
        style={{
          background: THEME.white,
          borderColor: 'rgba(255,255,255,0.55)',
          boxShadow: cardShadow(2),
        }}
      >
        <div
          className="h-1.5 w-full"
          style={{ background: 'linear-gradient(90deg, #FBBF24, #F59E0B)' }}
        />
        <div className="flex items-center gap-3 p-4">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-semibold"
            style={{
              background: `${THEME.primary}22`,
              color: THEME.primary,
              fontFamily: THEME.fontMono,
            }}
          >
            EW
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold" style={{ color: THEME.textPrimary }}>
              Ella Wheeler
            </div>
            <div
              className="text-[9px] uppercase tracking-[0.14em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              port · #01
            </div>
          </div>
        </div>
        <div
          className="grid grid-cols-3 border-t text-center"
          style={{ borderColor: THEME.border, background: THEME.light }}
        >
          <Metric label="2K" value="6:35.6" accent={THEME.primary} />
          <Metric label="Split" value="1:38.9" />
          <Metric label="Watts" value="362" />
        </div>
      </div>
    </motion.div>
  )
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="py-2">
      <div
        className="text-[7px] font-semibold uppercase tracking-[0.16em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        {label}
      </div>
      <div
        className="mt-0.5 text-[11px] font-semibold"
        style={{ fontFamily: THEME.fontMono, color: accent ?? THEME.textPrimary }}
      >
        {value}
      </div>
    </div>
  )
}

function ConnectorChip({ x, y }: CardProps) {
  const tx = useTransform(x, [0, 1], [-30, 30])
  const ty = useTransform(y, [0, 1], [-24, 24])
  return (
    <motion.div
      {...useFloat(6, 1.6)}
      style={{
        x: tx,
        y: ty,
        transform: 'translateZ(140px)',
      }}
      className="absolute right-[10%] top-[4%]"
    >
      <div
        className="flex items-center gap-2 rounded-full border px-4 py-2.5"
        style={{
          background: THEME.white,
          borderColor: 'rgba(255,255,255,0.55)',
          boxShadow: cardShadow(3),
        }}
      >
        <span className="h-2 w-2 rounded-full" style={{ background: THEME.primary }} />
        <span
          className="text-[11px] font-semibold"
          style={{ color: THEME.textPrimary }}
        >
          Erg workbooks
        </span>
        <span
          className="text-[9px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          synced · 2m
        </span>
      </div>
    </motion.div>
  )
}

function AiBubble({ x, y }: CardProps) {
  const tx = useTransform(x, [0, 1], [-34, 34])
  const ty = useTransform(y, [0, 1], [22, -22])
  return (
    <motion.div
      {...useFloat(9, 2.2)}
      style={{
        x: tx,
        y: ty,
        transform: 'translateZ(130px)',
      }}
      className="absolute bottom-[6%] left-[6%] max-w-[260px]"
    >
      <div
        className="rounded-2xl rounded-bl-sm border p-4"
        style={{
          background: THEME.white,
          borderColor: 'rgba(255,255,255,0.55)',
          boxShadow: cardShadow(3),
        }}
      >
        <div
          className="text-[8px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
        >
          synth. AI
        </div>
        <div
          className="mt-1 text-[12px] leading-snug"
          style={{ color: THEME.textPrimary }}
        >
          Top improver: <span style={{ fontWeight: 600 }}>Madeline Cox</span>{' '}
          <span style={{ color: THEME.primary }}>−10.3s</span> vs March 2025.
        </div>
      </div>
    </motion.div>
  )
}

function StatTile({ x, y }: CardProps) {
  const tx = useTransform(x, [0, 1], [24, -24])
  const ty = useTransform(y, [0, 1], [14, -14])
  return (
    <motion.div
      {...useFloat(7, 1.2)}
      style={{
        x: tx,
        y: ty,
        transform: 'translateZ(95px)',
      }}
      className="absolute left-[-2%] top-[32%]"
    >
      <div
        className="rounded-xl border p-4"
        style={{
          background: THEME.darkDeep,
          borderColor: 'rgba(255,255,255,0.1)',
          color: THEME.white,
          boxShadow: cardShadow(2),
        }}
      >
        <div
          className="text-[7px] font-semibold uppercase tracking-[0.2em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.accent }}
        >
          YoY · 2K
        </div>
        <div
          className="mt-1 text-[26px] font-bold leading-none tabular-nums"
          style={{ fontFamily: THEME.fontMono }}
        >
          −6.9s
        </div>
        <div
          className="mt-1 text-[9px]"
          style={{ fontFamily: THEME.fontMono, color: 'rgba(255,255,255,0.6)' }}
        >
          improvement
        </div>
      </div>
    </motion.div>
  )
}

function GridBackdrop() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.6" />
        </pattern>
        <radialGradient id="hero-grid-fade" cx="50%" cy="40%" r="75%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="hero-grid-mask">
          <rect width="100%" height="100%" fill="url(#hero-grid-fade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-grid)" mask="url(#hero-grid-mask)" />
    </svg>
  )
}
