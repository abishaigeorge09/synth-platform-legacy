import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import React, { useEffect, useMemo, useRef } from 'react'
import { THEME } from '../lib/theme'
import { TRANSITIONS } from '../lib/motion'
import { useAdvanceGate } from './advanceGate'
import { SlideDeckProvider } from './SlideDeckContext'
import { SETUP_SLIDE_NEXT_EVENT } from '../lib/setupSlideEvents'

export type SlideDef = {
  id: string
  section: string
  title?: string
  component: React.ReactNode
  background?: string
  frame?: 'none' | 'deck'
  showTopNav?: boolean
  showProgress?: boolean
  showNavButtons?: boolean
}

function isTypingInField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const t = target.tagName
  if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return true
  if (target.isContentEditable) return true
  return false
}

export function SlideShell({
  slides,
  index,
  setIndex,
}: {
  slides: SlideDef[]
  index: number
  setIndex: (i: number) => void
}) {
  const { blocked } = useAdvanceGate()
  const slide = slides[index]!

  const canPrev = index > 0
  const canNext = index < slides.length - 1

  const goPrev = () => {
    if (!canPrev) return
    setIndex(index - 1)
  }
  const goNext = () => {
    if (!canNext) return
    if (blocked) return
    /** Setup slide runs a cursor → Create account sim before advancing. */
    if (slide.id === 's02-setup') {
      window.dispatchEvent(new CustomEvent(SETUP_SLIDE_NEXT_EVENT))
      return
    }
    setIndex(index + 1)
  }

  // Keyboard nav (skip when typing in inputs — e.g. deck password, so Backspace edits text)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingInField(e.target)) return
      if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault()
        goPrev()
      }
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, blocked])

  // Tap / click to advance (pointer + mouse); swipe left/right on touch; guard doubles + interactive UI
  const clickGuardRef = useRef(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const suppressNextClickRef = useRef(false)

  const isInteractiveTarget = (el: EventTarget | null) => {
    if (!(el instanceof HTMLElement)) return false
    return !!el.closest(
      'button, a, input, textarea, select, label, [role="dialog"], [data-no-advance]',
    )
  }

  const onBackdropClick = (e: React.MouseEvent) => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false
      return
    }
    if (isInteractiveTarget(e.target)) return
    const now = Date.now()
    if (now - clickGuardRef.current < 150) return
    clickGuardRef.current = now
    goNext()
  }

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    if (!t) return
    touchStartRef.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const t = e.changedTouches[0]
    if (!t) return
    const dx = t.clientX - touchStartRef.current.x
    const dy = t.clientY - touchStartRef.current.y
    touchStartRef.current = null
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)
    if (absX < 48 || absX < absY) return
    suppressNextClickRef.current = true
    if (dx < 0) goNext()
    else goPrev()
  }

  const bg = slide.background ?? THEME.darkDeep
  const lightSurface = bg === THEME.light
  const showTopNav = slide.showTopNav ?? true
  const showProgress = slide.showProgress ?? true
  const showNavButtons = slide.showNavButtons ?? true
  const frame = slide.frame ?? 'deck'

  const progressPct = useMemo(() => {
    if (slides.length <= 1) return 0
    return (index / (slides.length - 1)) * 100
  }, [index, slides.length])

  return (
    <div
      className="h-full min-h-screen min-h-[100dvh] w-full select-none deck-backdrop"
      style={{
        background: `radial-gradient(ellipse 85% 75% at 50% 42%, ${THEME.darkMid} 0%, ${THEME.darkDeep} 48%, #030201 100%)`,
      }}
      onClick={onBackdropClick}
    >
      <div className="h-full min-h-screen min-h-[100dvh] w-full flex items-center justify-center px-2 py-3 sm:px-4 sm:py-6">
        <div
          className="deck-aspect-wrap relative"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {frame === 'deck' ? (
            <div
              className="pointer-events-none absolute inset-0 rounded-[15px] sm:rounded-[16px]"
              style={{
                boxShadow:
                  '0 0 0 1px rgba(255,255,255,0.09), 0 2px 1px rgba(255,255,255,0.04) inset, 0 32px 64px rgba(0,0,0,0.55), 0 12px 28px rgba(0,0,0,0.35)',
              }}
            />
          ) : null}

          {showTopNav ? (
            <div className="absolute left-0 top-0 w-full z-20 pointer-events-none">
              {/* TopNav attaches itself inside slides when needed; kept reserved here */}
            </div>
          ) : null}

          <LayoutGroup id="deck-layout">
            <AnimatePresence mode="sync">
              <motion.div
                key={slide.id}
                className="absolute inset-0 overflow-hidden"
                initial={{ opacity: 0, y: 18, scale: 0.992 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.988 }}
                transition={TRANSITIONS.pageCrossfade}
              >
              <div
                className={
                  frame === 'deck'
                    ? 'absolute inset-2 sm:inset-[14px] rounded-[10px] sm:rounded-[12px] overflow-hidden'
                    : 'absolute inset-0'
                }
              >
                <div className="absolute inset-0" style={{ background: bg }} />
                <SlideDeckProvider value={{ currentIndex: index, slideCount: slides.length }}>
                  {slide.component}
                </SlideDeckProvider>
              </div>
              </motion.div>
            </AnimatePresence>
          </LayoutGroup>

          {showNavButtons ? (
            <div
              className="absolute z-30 flex items-center gap-2 pointer-events-auto"
              style={{
                bottom: 'max(0.75rem, calc(env(safe-area-inset-bottom, 0px) + 0.25rem))',
                right: 'max(1rem, env(safe-area-inset-right, 0px))',
              }}
            >
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
                }}
                disabled={!canPrev}
                className={
                  lightSurface
                    ? 'flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-md sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0 bg-zinc-900/90 hover:bg-zinc-950 disabled:opacity-40 disabled:hover:bg-zinc-900/90 text-white font-medium shadow-[0_4px_20px_rgba(0,0,0,0.25)] border border-zinc-700/50 backdrop-blur-sm transition-colors'
                    : 'flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-md sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0 bg-black/35 hover:bg-black/45 disabled:opacity-40 disabled:hover:bg-black/35 text-white font-medium border border-white/12 shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-md transition-colors'
                }
                style={{ fontFamily: THEME.fontMono }}
              >
                ←
              </button>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
                disabled={!canNext || blocked}
                className={
                  lightSurface
                    ? 'flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-md sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0 bg-zinc-900/90 hover:bg-zinc-950 disabled:opacity-40 disabled:hover:bg-zinc-900/90 text-white font-medium shadow-[0_4px_20px_rgba(0,0,0,0.25)] border border-zinc-700/50 backdrop-blur-sm transition-colors'
                    : 'flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-md sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0 bg-black/35 hover:bg-black/45 disabled:opacity-40 disabled:hover:bg-black/35 text-white font-medium border border-white/12 shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-md transition-colors'
                }
                style={{ fontFamily: THEME.fontMono }}
              >
                →
              </button>
              <div
                className={`ml-1 text-[10px] sm:ml-2 sm:text-[11px] ${lightSurface ? 'text-zinc-600' : 'text-white/70'}`}
                style={{ fontFamily: THEME.fontMono }}
              >
                {index + 1} / {slides.length}
              </div>
            </div>
          ) : null}

          {showProgress ? (
            <div
              className={`absolute left-3 right-3 sm:left-4 sm:right-4 h-[4px] z-30 overflow-hidden rounded-full ${lightSurface ? 'bg-zinc-300/80' : 'bg-white/[0.12]'}`}
              style={{
                bottom: 'max(4px, env(safe-area-inset-bottom, 0px))',
                boxShadow: lightSurface ? 'none' : 'inset 0 1px 2px rgba(0,0,0,0.25)',
              }}
            >
              <div
                className="h-full rounded-full transition-[width] duration-300 ease-out"
                style={{
                  width: `${progressPct}%`,
                  background: `linear-gradient(90deg, ${THEME.primary} 0%, ${THEME.accent} 100%)`,
                  boxShadow: `0 0 14px ${THEME.accent}66`,
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

