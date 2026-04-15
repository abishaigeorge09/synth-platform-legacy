import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useDeckAdvance } from '../components/DeckAdvanceContext'
import { SynthLayerDashboardMockup } from '../components/SynthLayerDashboardMockup'
import { TopNav } from '../components/TopNav'
import { THEME } from '../lib/theme'
import { DECK_SLIDE_TOTAL } from '../lib/deckTotal'
import { SETUP_SLIDE_NEXT_EVENT } from '../lib/setupSlideEvents'
import { STAGGER, VARIANTS } from '../lib/motion'

const DEFAULT_SOURCES = ['Google Sheets', 'TeamWorks', 'Wearable sync'] as const

type Phase = 'idle' | 'pointing' | 'loading' | 'done'

function SetupAccountModal({
  sources,
  onAddSource,
  phase,
  cursorTarget,
  buttonRef,
  modalRootRef,
  onCreateClick,
}: {
  sources: string[]
  onAddSource: () => void
  phase: Phase
  cursorTarget: { x: number; y: number } | null
  buttonRef: React.RefObject<HTMLButtonElement | null>
  modalRootRef: React.RefObject<HTMLDivElement | null>
  onCreateClick: () => void
}) {
  const showCursor = phase === 'pointing' && cursorTarget !== null

  return (
    <div ref={modalRootRef} className="relative w-full max-w-[440px]" data-no-advance>
      {showCursor ? (
        <motion.div
          className="pointer-events-none absolute z-[60]"
          initial={{ left: '8%', top: '11%' }}
          animate={{ left: `${cursorTarget!.x}%`, top: `${cursorTarget!.y}%` }}
          transition={{ duration: 0.88, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ marginLeft: -5, marginTop: -5 }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
            <path
              d="M5 3v14l4.5-4.5L13 20l2-1-3.2-7.2L17 11.5 5 3z"
              fill="#18181B"
              stroke="#fff"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
          </svg>
          {phase === 'pointing' ? (
            <motion.span
              className="absolute left-3 top-4 block h-2 w-2 rounded-full border border-white"
              style={{ background: THEME.primary }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.55, repeat: Infinity }}
            />
          ) : null}
        </motion.div>
      ) : null}

      <motion.div
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: STAGGER.cards } } }}
        className="w-full rounded-2xl border bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
        style={{ borderColor: THEME.border }}
      >
        <motion.div variants={VARIANTS.fadeUp} className="border-b pb-4" style={{ borderColor: THEME.border }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
            1 · Upload athletes (CSV + emails)
          </p>
          <div
            className="mt-2 flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
            style={{ borderColor: `${THEME.primary}40`, background: `${THEME.primary}08` }}
          >
            <span className="truncate text-[11px] font-semibold text-zinc-700" style={{ fontFamily: THEME.fontMono }}>
              cal-athletes-fall2026.csv
            </span>
            <span className="shrink-0 text-[9px] font-bold uppercase text-emerald-700" style={{ fontFamily: THEME.fontMono }}>
              Ready
            </span>
          </div>
        </motion.div>

        <motion.div variants={VARIANTS.fadeUp} className="mt-4 border-b pb-4" style={{ borderColor: THEME.border }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
            2 · Select connectors
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {sources.map((c, i) => (
              <span
                key={`${i}-${c}`}
                className="rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                style={{
                  fontFamily: THEME.fontMono,
                  borderColor: `${THEME.primary}55`,
                  background: `${THEME.primary}14`,
                  color: THEME.primaryDark,
                }}
              >
                {c}
              </span>
            ))}
            <button
              type="button"
              disabled={phase !== 'idle'}
              className="rounded-full border border-dashed px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide disabled:opacity-50"
              style={{
                fontFamily: THEME.fontMono,
                borderColor: `${THEME.primary}55`,
                color: THEME.primary,
                background: `${THEME.primary}06`,
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onAddSource()
              }}
            >
              + Add source
            </button>
          </div>
        </motion.div>

        <motion.div variants={VARIANTS.fadeUp} className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
            3 · Set up schedule
          </p>
          <div
            className="mt-2 flex items-center justify-between rounded-lg border px-3 py-2"
            style={{ borderColor: THEME.border, background: '#FAFAF9' }}
          >
            <span className="text-[11px] font-medium text-zinc-700" style={{ fontFamily: THEME.fontSans }}>
              Cloud scrape + ingest
            </span>
            <span className="text-[10px] font-semibold text-zinc-500" style={{ fontFamily: THEME.fontMono }}>
              Daily · 6:00 AM PT
            </span>
          </div>
        </motion.div>

        <motion.div variants={VARIANTS.fadeUp} className="mt-5">
          <button
            ref={buttonRef}
            type="button"
            disabled={phase !== 'idle'}
            className="relative w-full rounded-lg py-2.5 text-[11px] font-bold uppercase tracking-wide text-white disabled:opacity-95"
            style={{
              fontFamily: THEME.fontMono,
              background: phase === 'loading' ? THEME.textMuted : THEME.primary,
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              if (phase === 'idle') onCreateClick()
            }}
          >
            {phase === 'loading' ? (
              <span className="inline-flex items-center justify-center gap-2">
                <motion.span
                  className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/30"
                  style={{ borderTopColor: '#fff' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
                />
                Creating account…
              </span>
            ) : (
              'Create account'
            )}
          </button>
        </motion.div>

        {phase === 'done' ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-lg border px-3 py-3 text-center"
            style={{ borderColor: `${THEME.accent}50`, background: `${THEME.accent}12` }}
            role="status"
          >
            <p className="text-[12px] font-semibold text-zinc-800" style={{ fontFamily: THEME.fontSans }}>
              Hey, emails have been sent.
            </p>
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  )
}

/** Deck “next” triggers a cursor → Create account → loading → one line toast → auto-advance. */
export function SetupAccountSlide() {
  const advance = useDeckAdvance()
  const [sources, setSources] = useState<string[]>(() => [...DEFAULT_SOURCES])
  const [phase, setPhase] = useState<Phase>('idle')
  const [cursorTarget, setCursorTarget] = useState<{ x: number; y: number } | null>(null)

  const modalRootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const runningRef = useRef(false)
  const advancedRef = useRef(false)
  const timersRef = useRef<number[]>([])

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }

  const safeAdvance = useCallback(() => {
    if (advancedRef.current) return
    advancedRef.current = true
    advance()
  }, [advance])

  const runSequence = useCallback(() => {
    if (runningRef.current) return
    runningRef.current = true
    clearTimers()
    setPhase('pointing')
    setCursorTarget(null)

    requestAnimationFrame(() => {
      const root = modalRootRef.current
      const btn = buttonRef.current
      if (!root || !btn) {
        runningRef.current = false
        return
      }
      const rr = root.getBoundingClientRect()
      const br = btn.getBoundingClientRect()
      const t = {
        x: ((br.left + br.width / 2 - rr.left) / rr.width) * 100,
        y: ((br.top + br.height / 2 - rr.top) / rr.height) * 100,
      }
      setCursorTarget(t)

      const t1 = window.setTimeout(() => setPhase('loading'), 900)
      const t2 = window.setTimeout(() => {
        setPhase('done')
        setCursorTarget(null)
      }, 1900)
      const t3 = window.setTimeout(() => {
        runningRef.current = false
        safeAdvance()
      }, 3000)
      timersRef.current = [t1, t2, t3]
    })
  }, [safeAdvance])

  useEffect(() => () => clearTimers(), [])

  useEffect(() => {
    const onNext = () => {
      if (phase === 'done') {
        safeAdvance()
        return
      }
      runSequence()
    }
    window.addEventListener(SETUP_SLIDE_NEXT_EVENT, onNext)
    return () => window.removeEventListener(SETUP_SLIDE_NEXT_EVENT, onNext)
  }, [phase, runSequence, safeAdvance])

  const onAddSource = useCallback(() => {
    if (phase !== 'idle') return
    setSources((s) => [...s, `Source ${s.length + 1}`])
  }, [phase])

  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{ background: THEME.light, padding: 'clamp(24px, 3.5vw, 40px) clamp(20px, 3.5vw, 48px) clamp(20px, 3.5vw, 32px)' }}
    >
      <TopNav section="02 · SOLUTION" page={`4 / ${DECK_SLIDE_TOTAL}`} tone="light" />
      <h1
        className="shrink-0 text-[clamp(20px,3vw,30px)] font-bold leading-[1.08] tracking-[-0.04em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
      >
        Set up your account
      </h1>
      <p className="mt-1 max-w-[42rem] text-[11px] leading-snug text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
        Use <strong className="font-semibold text-zinc-600">+ Add source</strong> for more connectors. Press next (→) to simulate the coach clicking{' '}
        <strong className="font-semibold text-zinc-600">Create account</strong>.
      </p>

      <motion.div
        layoutId="synth-dashboard-hero"
        className="relative mt-3 min-h-0 flex-1 overflow-hidden rounded-xl"
        transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.85 }}
      >
        <SynthLayerDashboardMockup
          navMode="coach-setup"
          dimMain
          hideTopCharts
          showCoachProfile
          agentHighlight
          showSidebarDeploy={false}
          overlay={
            <SetupAccountModal
              sources={sources}
              onAddSource={onAddSource}
              phase={phase}
              cursorTarget={cursorTarget}
              buttonRef={buttonRef}
              modalRootRef={modalRootRef}
              onCreateClick={runSequence}
            />
          }
        />
      </motion.div>
    </div>
  )
}
