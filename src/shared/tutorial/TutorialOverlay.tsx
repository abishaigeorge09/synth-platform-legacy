import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { SYNTH } from '@surfaces/pwa/lib/theme'
import { toast } from '@shared/store/useToastStore'
import { useTutorialStore } from '@shared/tutorial/useTutorialStore'
import { getTourById, type Placement, type TourStep } from '@shared/tutorial/tours'
import { useTargetRect, type Rect } from '@shared/tutorial/useTargetRect'

const SPOTLIGHT_PAD = 8
const TOOLTIP_GAP = 14
const TOOLTIP_WIDTH = 280
const TOOLTIP_MARGIN = 12
const POINTER_SIZE = 12

/** Shape of computed tooltip + pointer position. */
type Positioned = {
  top: number
  left: number
  pointerSide: 'top' | 'bottom' | 'left' | 'right'
  pointerOffset: number
}

/**
 * Choose a placement that fits the viewport. Tries the requested placement
 * first, then falls back to the side with the most room.
 */
function position(rect: Rect, placement: Placement, tooltipHeight: number): Positioned {
  const vw = window.innerWidth
  const vh = window.innerHeight

  const wantsAuto = placement === 'auto'
  const tryOrder: Array<Exclude<Placement, 'auto'>> = wantsAuto
    ? ['bottom', 'top', 'right', 'left']
    : [placement, 'bottom', 'top', 'right', 'left'].filter(
        (v, i, arr): v is Exclude<Placement, 'auto'> => v !== 'auto' && arr.indexOf(v) === i,
      )

  for (const side of tryOrder) {
    const pos = compute(rect, side, tooltipHeight, vw, vh)
    if (pos) return pos
  }
  // Last resort: pin at top-left.
  return { top: TOOLTIP_MARGIN, left: TOOLTIP_MARGIN, pointerSide: 'top', pointerOffset: 24 }
}

function compute(
  rect: Rect,
  side: Exclude<Placement, 'auto'>,
  tooltipHeight: number,
  vw: number,
  vh: number,
): Positioned | null {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  if (side === 'bottom') {
    const top = rect.top + rect.height + SPOTLIGHT_PAD + TOOLTIP_GAP
    if (top + tooltipHeight + TOOLTIP_MARGIN > vh) return null
    const rawLeft = cx - TOOLTIP_WIDTH / 2
    const left = clamp(rawLeft, TOOLTIP_MARGIN, vw - TOOLTIP_WIDTH - TOOLTIP_MARGIN)
    return { top, left, pointerSide: 'top', pointerOffset: clamp(cx - left, 20, TOOLTIP_WIDTH - 20) }
  }
  if (side === 'top') {
    const top = rect.top - SPOTLIGHT_PAD - TOOLTIP_GAP - tooltipHeight
    if (top < TOOLTIP_MARGIN) return null
    const rawLeft = cx - TOOLTIP_WIDTH / 2
    const left = clamp(rawLeft, TOOLTIP_MARGIN, vw - TOOLTIP_WIDTH - TOOLTIP_MARGIN)
    return { top, left, pointerSide: 'bottom', pointerOffset: clamp(cx - left, 20, TOOLTIP_WIDTH - 20) }
  }
  if (side === 'right') {
    const left = rect.left + rect.width + SPOTLIGHT_PAD + TOOLTIP_GAP
    if (left + TOOLTIP_WIDTH + TOOLTIP_MARGIN > vw) return null
    const top = clamp(cy - tooltipHeight / 2, TOOLTIP_MARGIN, vh - tooltipHeight - TOOLTIP_MARGIN)
    return { top, left, pointerSide: 'left', pointerOffset: clamp(cy - top, 20, tooltipHeight - 20) }
  }
  // left
  const left = rect.left - SPOTLIGHT_PAD - TOOLTIP_GAP - TOOLTIP_WIDTH
  if (left < TOOLTIP_MARGIN) return null
  const top = clamp(cy - tooltipHeight / 2, TOOLTIP_MARGIN, vh - tooltipHeight - TOOLTIP_MARGIN)
  return { top, left, pointerSide: 'right', pointerOffset: clamp(cy - top, 20, tooltipHeight - 20) }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

/**
 * Renders the active tour. Pulls active tour + step from useTutorialStore,
 * looks up the target rect, draws spotlight + tooltip in a portal at z-60.
 */
export function TutorialOverlay() {
  const activeTourId = useTutorialStore((s) => s.activeTourId)
  const stepIndex = useTutorialStore((s) => s.stepIndex)
  const next = useTutorialStore((s) => s.next)
  const back = useTutorialStore((s) => s.back)
  const skip = useTutorialStore((s) => s.skip)
  const complete = useTutorialStore((s) => s.complete)
  const abort = useTutorialStore((s) => s.abort)

  const tour = useMemo(() => (activeTourId ? getTourById(activeTourId) : null), [activeTourId])
  const step: TourStep | null = tour && stepIndex < tour.steps.length ? tour.steps[stepIndex] : null
  const isLast = !!tour && stepIndex >= tour.steps.length - 1
  const isFirst = stepIndex === 0

  const { rect } = useTargetRect(step?.anchor ?? null)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [cardHeight, setCardHeight] = useState(120)

  // Track tooltip card height so position() can pick a placement that fits.
  useEffect(() => {
    if (!cardRef.current) return
    const el = cardRef.current
    const measure = () => setCardHeight(el.getBoundingClientRect().height || 120)
    measure()
    const obs = 'ResizeObserver' in window ? new ResizeObserver(measure) : null
    obs?.observe(el)
    return () => obs?.disconnect()
  }, [step?.anchor, step?.title, step?.body])

  // ESC closes (skip).
  useEffect(() => {
    if (!activeTourId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip()
      if (e.key === 'ArrowRight') {
        if (isLast) complete()
        else next()
      }
      if (e.key === 'ArrowLeft' && !isFirst) back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeTourId, isLast, isFirst, skip, next, back, complete])

  // If the target is missing for too long after launch, abort silently.
  const lostFramesRef = useRef(0)
  useEffect(() => {
    if (!activeTourId) {
      lostFramesRef.current = 0
      return
    }
    if (rect) {
      lostFramesRef.current = 0
      return
    }
    lostFramesRef.current++
    if (lostFramesRef.current > 60) {
      // ~1 second of no rect → user navigated away; bail without marking seen.
      abort()
    }
  }, [activeTourId, rect, stepIndex, abort])

  if (!activeTourId || !tour || !step) return null
  if (typeof document === 'undefined') return null

  const positioned = rect ? position(rect, step.placement ?? 'auto', cardHeight) : null

  const handleNext = () => {
    if (isLast) {
      complete()
      toast('Tutorial complete', 'success')
    } else {
      next()
    }
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        key={`${tour.id}-${stepIndex}`}
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: 60 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        {/* Spotlight: a transparent rect with a giant outer box-shadow that dims everything
            outside it. Using box-shadow avoids needing SVG masks and works on Safari. */}
        {rect && (
          <motion.div
            className="pointer-events-none absolute"
            initial={false}
            animate={{
              top: rect.top - SPOTLIGHT_PAD,
              left: rect.left - SPOTLIGHT_PAD,
              width: rect.width + SPOTLIGHT_PAD * 2,
              height: rect.height + SPOTLIGHT_PAD * 2,
            }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              borderRadius: 14,
              boxShadow: `0 0 0 9999px rgba(8,8,40,0.45), 0 0 0 2px ${SYNTH.accentEmerald}`,
            }}
          />
        )}

        {/* Backdrop catches clicks (dismisses to skip). */}
        <button
          type="button"
          aria-label="Skip tutorial"
          onClick={skip}
          className="pointer-events-auto absolute inset-0 cursor-default"
          style={{ background: 'transparent' }}
        />

        {/* Tooltip card */}
        {positioned && (
          <motion.div
            ref={cardRef}
            className="pointer-events-auto absolute"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              top: positioned.top,
              left: positioned.left,
              width: TOOLTIP_WIDTH,
              background: '#FFFFFF',
              borderRadius: 16,
              boxShadow: '0 16px 40px rgba(8,8,40,0.28)',
              padding: '14px 18px 16px',
              fontFamily: SYNTH.font,
              color: SYNTH.ink,
            }}
          >
            {/* Pointer arrow */}
            <span
              aria-hidden
              style={{
                position: 'absolute',
                width: POINTER_SIZE,
                height: POINTER_SIZE,
                background: '#FFFFFF',
                transform: 'rotate(45deg)',
                ...pointerStyle(positioned),
              }}
            />

            <div className="flex items-start justify-between gap-3">
              <div className="text-[15px] font-bold leading-tight" style={{ color: SYNTH.ink }}>
                {step.title}
              </div>
              <button
                type="button"
                onClick={skip}
                aria-label="Skip tutorial"
                className="-m-2 flex h-9 w-9 items-center justify-center rounded-full"
                style={{ color: SYNTH.inkMuted }}
              >
                <X size={16} strokeWidth={2.4} />
              </button>
            </div>

            <p
              className="mt-1.5 text-[13px] leading-[1.5]"
              style={{ color: SYNTH.inkMuted }}
            >
              {step.body}
            </p>

            <div className="mt-4 flex items-center justify-between gap-2">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: SYNTH.inkMuted, fontVariantNumeric: 'tabular-nums' }}
              >
                {stepIndex + 1} of {tour.steps.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={skip}
                  className="rounded-full px-3 py-1.5 text-[11px] font-semibold"
                  style={{ color: SYNTH.inkMuted }}
                >
                  Skip
                </button>
                {!isFirst && (
                  <button
                    type="button"
                    onClick={back}
                    className="rounded-full border px-3 py-1.5 text-[11px] font-semibold"
                    style={{ borderColor: '#E4E4E7', color: SYNTH.ink }}
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em]"
                  style={{ background: SYNTH.accentEmerald, color: SYNTH.inkOnBrand }}
                >
                  {isLast ? 'Got it ✓' : 'Next'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}

function pointerStyle(p: Positioned): React.CSSProperties {
  // Place the rotated square on the side of the card that faces the target.
  if (p.pointerSide === 'top') {
    return { top: -POINTER_SIZE / 2, left: p.pointerOffset - POINTER_SIZE / 2, boxShadow: '-2px -2px 4px rgba(8,8,40,0.04)' }
  }
  if (p.pointerSide === 'bottom') {
    return { bottom: -POINTER_SIZE / 2, left: p.pointerOffset - POINTER_SIZE / 2, boxShadow: '2px 2px 4px rgba(8,8,40,0.06)' }
  }
  if (p.pointerSide === 'left') {
    return { left: -POINTER_SIZE / 2, top: p.pointerOffset - POINTER_SIZE / 2, boxShadow: '-2px 2px 4px rgba(8,8,40,0.04)' }
  }
  // right
  return { right: -POINTER_SIZE / 2, top: p.pointerOffset - POINTER_SIZE / 2, boxShadow: '2px -2px 4px rgba(8,8,40,0.06)' }
}
