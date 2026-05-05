/**
 * Vibe-code motion presets for the Custom Tools surface.
 *
 * These are mobile-shell-only (`/app/coach/tools/*`). The desktop shell
 * has its own `src/lib/motion.ts` we deliberately do not touch — keeping
 * the Sprint 5 scope inside the Phase A allowlist.
 *
 * Presets are plain objects spread into Framer Motion props at the call
 * site. We intentionally don't wrap them in helper components so the
 * primitives stay composable.
 *
 * Note: keyframe arrays are intentionally NOT `as const` — Framer Motion
 * expects mutable arrays, and `as const` makes them readonly.
 */

const EASE_OUT_BACK: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

/**
 * Per-element entrance for `<ToolRenderer>`. Spread on each element's
 * `motion.div` with `custom={index}` and `variants={TOOL_STAGGER}`. Fires
 * once per session because the parent keys on `session.id`.
 */
export const TOOL_STAGGER = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.32,
      ease: EASE_OUT_BACK,
    },
  }),
}

/**
 * One-shot install pulse — applied to a freshly-installed tool's card
 * via `motion.div` `animate` prop, keyed on `lastInstalledAt` so the
 * animation re-runs on each install rather than persisting. Approximate
 * duration: ~1.6 s. Card returns to rest state cleanly.
 */
export const INSTALL_PULSE = {
  initial: { scale: 1, boxShadow: '0 12px 28px -12px rgba(8,8,40,0.45)' },
  animate: {
    scale: [1, 1.025, 1],
    boxShadow: [
      '0 12px 28px -12px rgba(8,8,40,0.45)',
      '0 12px 36px -8px rgba(16,185,129,0.55), 0 0 0 1px rgba(16,185,129,0.45)',
      '0 12px 28px -12px rgba(8,8,40,0.45)',
    ],
  },
  transition: { duration: 1.6, ease: EASE_OUT_BACK },
}

/**
 * Thinking-dot pulse. Each dot uses the same `animate` config; the
 * staggered effect comes from per-dot `transition.delay` set at the
 * call site (0 / 0.2 / 0.4 s).
 */
export const THINKING_DOT = {
  animate: { scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] },
  transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const },
}

/**
 * Page-canvas entrance. Used by the top-level main canvas of
 * `CustomToolsPage` and `ToolsBuildPage` so route swaps fade in
 * smoothly instead of cutting.
 */
export const CANVAS_ENTER = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.24, ease: 'easeOut' as const },
}
