import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useAdvanceGate } from '../components/advanceGate'
import { useDeckAdvance } from '../components/DeckAdvanceContext'
import { SynthLayerDashboardMockup } from '../components/SynthLayerDashboardMockup'
import { useSlideDeckMeta } from '../components/SlideDeckContext'
import { TopNav } from '../components/TopNav'
import { THEME } from '../lib/theme'
import { TRANSITIONS } from '../lib/motion'
import { coachToolSrc } from './coachToolImages'

const LOG_LINES = [
  'Sheets · Matthew — 12 interval rows',
  'TeamWorks · Lily — compliance + calendar',
  'Wearable · Star — sleep + HRV window',
  'Sheets · D. Torres — erg + S&C log',
  'TeamWorks · J. Okonkwo — attendance',
  'Bridge · R. Chen — squat progression',
] as const

const CHECK_STEPS = [
  'Provisioning synth agent for roster…',
  'Linking Google Sheets connector…',
  'Linking TeamWorks connector…',
  'Linking wearable pipeline…',
] as const

/** Deploy + ingest animation; blocks manual advance until finished, then auto-advances. */
export function DeployAgentProcessingSlide() {
  const { currentIndex, slideCount } = useSlideDeckMeta()
  const { setBlocked } = useAdvanceGate()
  const advance = useDeckAdvance()
  const [phase, setPhase] = useState<'connectors' | 'scrape' | 'done'>('connectors')
  const [checkIdx, setCheckIdx] = useState(0)
  const [logVisible, setLogVisible] = useState(0)
  const [progress, setProgress] = useState(8)
  const finishedRef = useRef(false)

  useEffect(() => {
    setBlocked(true)
    finishedRef.current = false
    const timers: number[] = []

    let step = 0
    const tick = () => {
      step += 1
      setCheckIdx(step)
      setProgress((p) => Math.min(40, p + 9))
      if (step >= CHECK_STEPS.length) {
        setPhase('scrape')
        LOG_LINES.forEach((_, i) => {
          timers.push(
            window.setTimeout(() => {
              setLogVisible((v) => Math.max(v, i + 1))
              setProgress((p) => Math.min(94, p + 9))
            }, 450 + i * 480),
          )
        })
        timers.push(
          window.setTimeout(() => {
            setProgress(100)
            setPhase('done')
            setBlocked(false)
            if (!finishedRef.current) {
              finishedRef.current = true
              window.setTimeout(() => advance(), 550)
            }
          }, 450 + LOG_LINES.length * 480 + 850),
        )
        return
      }
      timers.push(window.setTimeout(tick, 700))
    }
    timers.push(window.setTimeout(tick, 700))

    return () => {
      timers.forEach((id) => window.clearTimeout(id))
      setBlocked(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot mount sequence
  }, [])

  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{ background: THEME.light, padding: 'clamp(24px, 3.5vw, 40px) clamp(20px, 3.5vw, 48px) clamp(20px, 3.5vw, 32px)' }}
    >
      <TopNav section="APPENDIX · DRAFTS" page={`${currentIndex + 1} / ${slideCount}`} tone="light" />
      <h1
        className="shrink-0 text-[clamp(20px,3vw,30px)] font-bold leading-[1.08] tracking-[-0.04em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
      >
        Deploy agent — pulling every athlete&apos;s tools.
      </h1>
      <p className="mt-1 max-w-[44rem] text-[11px] leading-snug text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
        Same processing rhythm as the live shell: connectors first, then per-athlete scrapes across Sheets, TeamWorks, wearables, and S&amp;C.
      </p>

      <div className="relative mt-3 min-h-0 flex-1">
        <SynthLayerDashboardMockup
          dimMain
          showSidebarDeploy={false}
          showExtensionInToolbar
          scrapeStripSrc={coachToolSrc('google-sheets-rowing-erg-intervals.png')}
          overlay={
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={TRANSITIONS.page}
              className="w-full max-w-[400px] overflow-hidden rounded-2xl border bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
              style={{ borderColor: THEME.border }}
              data-no-advance
            >
              <div className="border-b px-4 py-3" style={{ borderColor: THEME.border, background: `${THEME.primary}08` }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500" style={{ fontFamily: THEME.fontMono }}>
                  {phase === 'done' ? 'Complete' : 'Processing'}
                </p>
                <p className="mt-1 text-[13px] font-bold" style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}>
                  {phase === 'done' ? 'Successfully finished' : 'Deploying synth agent…'}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: phase === 'done' ? THEME.accent : THEME.primary }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <div className="max-h-[220px] overflow-y-auto px-4 py-3">
                <ul className="space-y-2">
                  {CHECK_STEPS.map((label, i) => (
                    <li key={label} className="flex items-start gap-2 text-[10px]" style={{ fontFamily: THEME.fontSans }}>
                      <span
                        className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold"
                        style={{
                          background: i < checkIdx ? THEME.primary : THEME.border,
                          color: i < checkIdx ? '#fff' : THEME.textMuted,
                        }}
                      >
                        {i < checkIdx ? '\u2713' : i + 1}
                      </span>
                      <span className={i < checkIdx ? 'font-medium text-zinc-800' : 'text-zinc-400'}>{label}</span>
                    </li>
                  ))}
                </ul>

                {phase === 'scrape' || phase === 'done' ? (
                  <div className="mt-4 border-t pt-3" style={{ borderColor: THEME.border }}>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
                      Scraped from athlete tools
                    </p>
                    <ul className="mt-2 space-y-1.5 text-[9px] text-zinc-600" style={{ fontFamily: THEME.fontMono }}>
                      <AnimatePresence>
                        {LOG_LINES.slice(0, logVisible).map((line) => (
                          <motion.li
                            key={line}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            <span style={{ color: THEME.primary }}>→</span> {line}
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  </div>
                ) : null}

                {phase === 'done' ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-center text-[10px] font-semibold text-emerald-700"
                    style={{ fontFamily: THEME.fontMono }}
                  >
                    Opening next slide…
                  </motion.p>
                ) : null}
              </div>
            </motion.div>
          }
        />
      </div>
    </div>
  )
}
