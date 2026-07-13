import { motion, AnimatePresence } from 'framer-motion'
import { useRef } from 'react'
import html2canvas from 'html2canvas'
import { THEME } from '@lib/theme'
import { useBehavioralStore } from './useBehavioralStore'
import { AnimatedNumber } from './AnimatedNumber'
import { ShareableCard } from './ShareableCard'

type Stat = {
  label: string
  value: number
  format?: (n: number) => string
  delta: number
  unit?: string
}

const WEEK_STATS: Stat[] = [
  { label: 'Sessions', value: 6, delta: +1 },
  { label: 'Volume', value: 48200, delta: +4200, format: (n) => `${(n / 1000).toFixed(1)}k`, unit: 'm' },
  { label: 'Best erg', value: 404.9, delta: -1.4, format: (n) => `${Math.floor(n / 60)}:${(n - Math.floor(n / 60) * 60).toFixed(1).padStart(4, '0')}` },
  { label: 'Avg recovery', value: 74, delta: +3 },
]

type Props = {
  athleteName: string
}

export function WeeklyDigestModal({ athleteName }: Props) {
  const open = useBehavioralStore((s) => s.digestOpen)
  const close = useBehavioralStore((s) => s.closeDigest)
  const cardRef = useRef<HTMLDivElement>(null)
  const initials = athleteName
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  async function handleShareRecap() {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: null,
      scale: 1,
      useCORS: true,
      logging: false,
    })
    const blob: Blob | null = await new Promise((r) => canvas.toBlob((b) => r(b), 'image/png'))
    if (!blob) return
    const file = new File([blob], `synth-week-recap.png`, { type: 'image/png' })
    const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
    if (typeof nav.share === 'function' && typeof nav.canShare === 'function' && nav.canShare({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: 'My week on synth.' })
        return
      } catch {
        // fall through to download
      }
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={close}
          className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center sm:p-6"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0.6, scale: 1 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[560px] overflow-hidden rounded-t-3xl border-t sm:rounded-3xl sm:border"
            style={{
              background: 'var(--bg-primary)',
              borderColor: THEME.border,
              maxHeight: '92dvh',
            }}
          >
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              className="flex h-full flex-col"
            >
              {/* drag handle (mobile sheet affordance) */}
              <div className="flex justify-center py-2 sm:hidden">
                <div className="h-1 w-10 rounded-full" style={{ background: 'var(--bg-surface-raised)' }} />
              </div>

              <div className="px-6 pb-6 pt-2 sm:p-8">
                <div
                  className="text-[10px] font-semibold uppercase"
                  style={{
                    fontFamily: THEME.fontMono,
                    color: THEME.primary,
                    letterSpacing: '0.18em',
                  }}
                >
                  Weekly digest · Sunday
                </div>
                <h2
                  className="mt-1 text-[26px] font-semibold sm:text-[30px]"
                  style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
                >
                  Your week, {athleteName.split(' ')[0]}
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {WEEK_STATS.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.1, duration: 0.35 }}
                      className="rounded-2xl border p-4"
                      style={{ borderColor: THEME.border, background: 'var(--bg-surface)' }}
                    >
                      <div
                        className="text-[10px] font-semibold uppercase"
                        style={{
                          fontFamily: THEME.fontMono,
                          color: THEME.textMuted,
                          letterSpacing: '0.14em',
                        }}
                      >
                        {stat.label}
                      </div>
                      <div
                        className="mt-2 text-[26px] font-bold leading-none"
                        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
                      >
                        <AnimatedNumber
                          value={stat.value}
                          duration={1100}
                          format={stat.format}
                        />
                        {stat.unit ? (
                          <span
                            className="ml-1 text-[14px] font-semibold"
                            style={{ color: THEME.textMuted }}
                          >
                            {stat.unit}
                          </span>
                        ) : null}
                      </div>
                      <div
                        className="mt-1.5 text-[11px]"
                        style={{
                          color: stat.delta >= 0 ? THEME.primary : THEME.amber,
                          fontFamily: THEME.fontMono,
                        }}
                      >
                        {stat.delta >= 0 ? '↑' : '↓'} {formatDelta(stat)}
                        <span style={{ color: THEME.textMuted }}> vs last week</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.35 }}
                  className="mt-5 rounded-2xl border p-4"
                  style={{
                    background: 'var(--green-subtle)',
                    borderColor: THEME.primary + '44',
                  }}
                >
                  <div
                    className="text-[10px] font-semibold uppercase"
                    style={{ fontFamily: THEME.fontMono, color: THEME.primary, letterSpacing: '0.14em' }}
                  >
                    synth. AI insight
                  </div>
                  <p
                    className="mt-1.5 text-[14px] leading-relaxed"
                    style={{ color: THEME.textPrimary }}
                  >
                    You trained 4 days, your hardest week this month. Steady-state volume up 9%
                    while average recovery still climbed — base is doing its job.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.35 }}
                  className="mt-3 rounded-2xl border p-4"
                  style={{ borderColor: THEME.border, background: 'var(--bg-surface)' }}
                >
                  <div
                    className="text-[10px] font-semibold uppercase"
                    style={{ fontFamily: THEME.fontMono, color: THEME.textMuted, letterSpacing: '0.14em' }}
                  >
                    Top moment
                  </div>
                  <div
                    className="mt-1 text-[15px] font-semibold"
                    style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
                  >
                    2K personal record · 6:44.9
                  </div>
                  <div
                    className="text-[12px]"
                    style={{ color: THEME.textSecondary }}
                  >
                    Mar 16 — clean negative split, last 500 in 1:40.5.
                  </div>
                </motion.div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleShareRecap}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl px-4 text-[12px] font-semibold text-white"
                    style={{
                      background: THEME.primary,
                      fontFamily: THEME.fontMono,
                      letterSpacing: '0.04em',
                    }}
                  >
                    Share recap
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl border px-4 text-[12px] font-semibold"
                    style={{
                      borderColor: THEME.border,
                      color: THEME.textPrimary,
                      background: 'var(--bg-surface)',
                      fontFamily: THEME.fontMono,
                      letterSpacing: '0.04em',
                    }}
                  >
                    See you Monday
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <ShareableCard
            ref={cardRef}
            athleteName={athleteName}
            initials={initials}
            eventLabel="Week recap"
            displayValue="6:44.9"
            date={new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            story
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function formatDelta(stat: Stat): string {
  const abs = Math.abs(stat.delta)
  if (stat.format) return stat.format(abs)
  if (stat.unit) return `${abs}${stat.unit}`
  return abs.toString()
}
