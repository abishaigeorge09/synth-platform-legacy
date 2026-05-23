import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from 'framer-motion'
import { BG, FG, MUTED, DIM, HAIR, GREEN, GREEN_2, DRUK, MONO, BODY } from './tokens'
import { SectionLabel, Hairlines, Crosshairs, Chevron } from './primitives'

/**
 * Scroll-pinned multi-scene panel. Replaces the "stack N billboard
 * sections vertically" pattern with one pinned section whose inner
 * row cross-fades between scenes as the user scrolls.
 *
 * Mechanics:
 *   - The outer container is (N + 1) viewport heights tall (where N
 *     is scene count). For 3 scenes that means the user scrolls
 *     ~300vh while the inner sticky child stays pinned at the top of
 *     the viewport. Each scene "owns" 1/N of the scroll progress.
 *   - useScroll() on the outer + offset ['start start', 'end start']
 *     gives a clean progress 0 → 1 across the entire pinned interval.
 *   - For each scene we derive an opacity + small y-shift motion value
 *     tied to that scene's slice of the progress, with a short cross-
 *     fade margin so adjacent scenes briefly overlap.
 *   - Top tab strip shows all scene labels; the active one has an
 *     emerald 1-px underline whose scaleX is driven by the local
 *     progress within that scene's range.
 *   - Bottom progress bar fills horizontally with total progress.
 *
 * Reduced-motion fallback: render scenes as a plain vertical stack
 * (same content, no pinning, no cross-fade). prefers-reduced-motion
 * users get the old "billboard" feel without the scroll hijack.
 *
 * Mobile note: on narrow viewports the 2-col grid collapses to 1-col
 * (text on top, visual underneath). The pinning + cross-fade still
 * run; on small screens the visual sits below the text and both
 * cycle together. Acceptable for V1 — can be tuned later.
 */

export type Scene = {
  id: string
  num: string
  label: string
  word: string
  sub: string
  body: string
  detail: string[]
  cta: { label: string; to: string }
  Visual: ReactNode
}

export function ScrollScenes({
  scenes,
  anchorId,
  eyebrow,
}: {
  scenes: Scene[]
  anchorId?: string
  eyebrow?: string
}) {
  const outerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end start'],
  })

  const total = scenes.length

  // The outer container is `(total + 1) * 100vh` tall: `total * 100vh` of
  // scroll happens while the sticky child is pinned, then one extra
  // viewport-height of scroll lets the section glide out. That means
  // useful "sticky time" runs from progress 0 → total/(total+1), and the
  // last 1/(total+1) of progress is the section scrolling out of view.
  //
  // Before this remap, the last scene (e.g. Act) only got ~4% of total
  // progress because its 1/N slice (0.667–1.0) straddled the unstick
  // point at 0.75. After the remap, each scene cleanly owns 1/N of the
  // sticky time and the unstick gap is invisible to the per-scene math.
  const progress = useTransform(
    scrollYProgress,
    [0, total / (total + 1)],
    [0, 1],
    { clamp: true },
  )

  if (reducedMotion) {
    return (
      <section id={anchorId} className="relative" style={{ background: BG, color: FG }}>
        {eyebrow && <SectionLabel>{eyebrow}</SectionLabel>}
        {scenes.map((s, i) => (
          <PlainScene key={s.id} scene={s} flip={i % 2 === 1} />
        ))}
      </section>
    )
  }

  return (
    <section
      ref={outerRef}
      id={anchorId}
      className="relative"
      style={{ background: BG, color: FG, height: `${(total + 1) * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <Hairlines />
        <Crosshairs count={3} opacity={0.4} />

        {/* Eyebrow + tab strip */}
        <div className="relative z-10 border-b" style={{ borderColor: HAIR }}>
          {eyebrow && (
            <div className="px-5 pt-6 sm:px-10">
              <SectionLabel>{eyebrow}</SectionLabel>
            </div>
          )}
          <div className="mx-auto flex w-full max-w-[1280px] items-center gap-6 overflow-x-auto px-5 py-4 sm:gap-10 sm:px-10">
            {scenes.map((s, i) => (
              <TabItem key={s.id} scene={s} index={i} total={total} progress={progress} />
            ))}
          </div>
        </div>

        {/* Cross-fading content row — text left, visual right */}
        <div className="relative z-10 flex-1 overflow-hidden">
          <div className="mx-auto grid h-full w-full max-w-[1280px] gap-8 px-5 sm:px-10 sm:gap-12 lg:grid-cols-2 lg:items-center">
            <div className="relative">
              {scenes.map((s, i) => (
                <SceneText
                  key={s.id}
                  scene={s}
                  index={i}
                  total={total}
                  progress={progress}
                />
              ))}
            </div>
            <div className="relative h-full min-h-[280px]">
              {scenes.map((s, i) => (
                <SceneVisual
                  key={s.id}
                  scene={s}
                  index={i}
                  total={total}
                  progress={progress}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom progress bar — driven by the remapped `progress` so it
            reaches 100% exactly when the last scene's range ends, instead
            of the literal end of the outer container (which is past the
            unstick point). */}
        <div
          className="relative z-10 h-px w-full"
          style={{ background: HAIR }}
        >
          <motion.div
            className="h-full origin-left"
            style={{ background: GREEN, scaleX: progress }}
          />
        </div>
      </div>
    </section>
  )
}

/* ─── Scene text block (cross-faded inside the pinned row) ───────────── */

function SceneText({
  scene,
  index,
  total,
  progress,
}: {
  scene: Scene
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const start = index / total
  const end = (index + 1) / total
  const fadeIn = 0.04 / total
  const fadeOut = 0.04 / total

  const opacity = useTransform(
    progress,
    [
      Math.max(0, start - fadeIn),
      start + fadeIn,
      end - fadeOut,
      Math.min(1, end + fadeOut),
    ],
    [index === 0 ? 1 : 0, 1, 1, index === total - 1 ? 1 : 0],
  )
  const y = useTransform(progress, [start, end], [12, -12])

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col justify-center"
    >
      <div
        className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em]"
        style={{ fontFamily: MONO, color: GREEN }}
      >
        <span>// pillar {scene.num}</span>
        <span className="h-px w-12" style={{ background: GREEN_2 }} />
      </div>

      <h3
        className="mt-5 tracking-[-0.02em]"
        style={{
          fontFamily: DRUK,
          fontSize: 'clamp(48px, 8vw, 120px)',
          textTransform: 'uppercase',
          lineHeight: 0.95,
        }}
      >
        {scene.word}
        <span style={{ color: GREEN }}>.</span>
      </h3>

      <div
        className="mt-4 text-[12px] uppercase tracking-[0.3em]"
        style={{ fontFamily: MONO, color: MUTED }}
      >
        {scene.sub}
      </div>

      <p
        className="mt-5 max-w-[460px] text-[15px] leading-relaxed"
        style={{ fontFamily: BODY, color: FG }}
      >
        {scene.body}
      </p>

      <ul className="mt-5 space-y-2" style={{ fontFamily: MONO }}>
        {scene.detail.map((d) => (
          <li
            key={d}
            className="flex items-start gap-3 text-[12px]"
            style={{ color: MUTED }}
          >
            <span
              className="mt-2 inline-block h-px w-3 shrink-0"
              style={{ background: GREEN }}
            />
            <span>{d}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Chevron to={scene.cta.to}>{scene.cta.label}</Chevron>
      </div>
    </motion.div>
  )
}

/* ─── Scene visual (cross-faded) ─────────────────────────────────────── */

function SceneVisual({
  scene,
  index,
  total,
  progress,
}: {
  scene: Scene
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const start = index / total
  const end = (index + 1) / total
  const fadeIn = 0.04 / total
  const fadeOut = 0.04 / total

  const opacity = useTransform(
    progress,
    [
      Math.max(0, start - fadeIn),
      start + fadeIn,
      end - fadeOut,
      Math.min(1, end + fadeOut),
    ],
    [index === 0 ? 1 : 0, 1, 1, index === total - 1 ? 1 : 0],
  )
  const y = useTransform(progress, [start, end], [16, -16])

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex items-center justify-center"
      aria-hidden={index !== 0 || undefined}
    >
      {scene.Visual}
    </motion.div>
  )
}

/* ─── Top tab strip item ─────────────────────────────────────────────── */

function TabItem({
  scene,
  index,
  total,
  progress,
}: {
  scene: Scene
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const start = index / total
  const end = (index + 1) / total

  // Underline scaleX driven by local progress within this tab's range
  const scaleX = useTransform(progress, [start, end], [0, 1], {
    clamp: true,
  })
  // Underline opacity: fades in as the tab becomes active, out when next
  const underlineOpacity = useTransform(
    progress,
    [Math.max(0, start - 0.04), start, end, Math.min(1, end + 0.04)],
    [index === 0 ? 1 : 0, 1, 1, index === total - 1 ? 1 : 0],
  )
  // Tab label color brighter while active
  const labelColor = useTransform(progress, (p) =>
    p >= start - 0.02 && p <= end + 0.02 ? '#ffffff' : MUTED,
  )

  return (
    <div className="relative whitespace-nowrap pb-1">
      <motion.span
        className="text-[11px] uppercase tracking-[0.28em]"
        style={{ fontFamily: MONO, color: labelColor }}
      >
        // {scene.num} {scene.label}
      </motion.span>
      <motion.span
        className="absolute bottom-0 left-0 right-0 h-px origin-left"
        style={{ background: GREEN, scaleX, opacity: underlineOpacity }}
      />
    </div>
  )
}

/* ─── Reduced-motion fallback: plain stacked scenes ──────────────────── */

function PlainScene({ scene, flip }: { scene: Scene; flip: boolean }) {
  return (
    <div className="relative overflow-hidden px-5 py-24 sm:px-10 sm:py-32">
      <Hairlines />
      <Crosshairs count={3} opacity={0.4} />

      <div
        className={`relative z-10 mx-auto grid w-full max-w-[1280px] gap-12 lg:grid-cols-2 lg:items-center ${
          flip ? 'lg:[&>*:first-child]:order-2' : ''
        }`}
      >
        <div>
          <div
            className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em]"
            style={{ fontFamily: MONO, color: GREEN }}
          >
            <span>// pillar {scene.num}</span>
            <span className="h-px w-12" style={{ background: GREEN_2 }} />
          </div>

          <h3
            className="mt-5 tracking-[-0.02em]"
            style={{
              fontFamily: DRUK,
              fontSize: 'clamp(56px, 10vw, 140px)',
              textTransform: 'uppercase',
              lineHeight: 0.95,
            }}
          >
            {scene.word}
            <span style={{ color: GREEN }}>.</span>
          </h3>

          <div
            className="mt-5 text-[12px] uppercase tracking-[0.3em]"
            style={{ fontFamily: MONO, color: MUTED }}
          >
            {scene.sub}
          </div>

          <p
            className="mt-6 max-w-[460px] text-[16px] leading-relaxed"
            style={{ fontFamily: BODY, color: FG }}
          >
            {scene.body}
          </p>

          <ul className="mt-6 space-y-2" style={{ fontFamily: MONO }}>
            {scene.detail.map((d) => (
              <li
                key={d}
                className="flex items-start gap-3 text-[12px]"
                style={{ color: DIM }}
              >
                <span
                  className="mt-2 inline-block h-px w-3 shrink-0"
                  style={{ background: GREEN }}
                />
                <span>{d}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7">
            <Chevron to={scene.cta.to}>{scene.cta.label}</Chevron>
          </div>
        </div>

        <div className="flex items-center justify-center">{scene.Visual}</div>
      </div>
    </div>
  )
}
