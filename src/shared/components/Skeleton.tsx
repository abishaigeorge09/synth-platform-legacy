import { THEME } from '@lib/theme'

/**
 * Phase 24 — reusable skeleton primitives for loading states.
 *
 * These render CSS-animated pulse placeholders that match the synth.
 * design language. When `useStaticQuery` is swapped for real async
 * queries, components can show these while `isLoading` is true.
 *
 * All shapes use a subtle pulse animation via Tailwind's `animate-pulse`
 * and read from THEME tokens — no hardcoded colors.
 */

const BASE = 'animate-pulse rounded'
const BG = THEME.border // #E4E4E7 — light gray that pulses naturally

/** Rectangular block placeholder. */
export function SkeletonBlock({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`${BASE} ${className}`}
      style={{ backgroundColor: BG, ...style }}
    />
  )
}

/** Single line of text placeholder. */
export function SkeletonLine({
  width = '100%',
  height = 12,
  className = '',
}: {
  width?: string | number
  height?: number
  className?: string
}) {
  return (
    <div
      className={`${BASE} ${className}`}
      style={{ backgroundColor: BG, width, height, borderRadius: 4 }}
    />
  )
}

/** Circle placeholder (avatars, dots). */
export function SkeletonCircle({
  size = 40,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <div
      className={`${BASE} shrink-0 ${className}`}
      style={{
        backgroundColor: BG,
        width: size,
        height: size,
        borderRadius: '50%',
      }}
    />
  )
}

/* ── Composite skeletons for common patterns ─────────────────────── */

/** Stat tile skeleton matching TeamOverviewStrip layout. */
export function SkeletonStatTile() {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: 'var(--bg-primary)',
        borderColor: THEME.border,
        borderLeft: `3px solid ${THEME.border}`,
      }}
    >
      <SkeletonLine width={60} height={8} />
      <SkeletonLine width={80} height={28} className="mt-3" />
      <SkeletonLine width={120} height={10} className="mt-2" />
    </div>
  )
}

/** Card skeleton matching AthleteCard / SourceCard layout. */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border p-4 ${className}`}
      style={{ background: 'var(--bg-primary)', borderColor: THEME.border }}
    >
      <div className="flex items-center gap-3">
        <SkeletonCircle size={36} />
        <div className="flex flex-1 flex-col gap-1.5">
          <SkeletonLine width="60%" height={12} />
          <SkeletonLine width="40%" height={10} />
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        <SkeletonLine width="90%" height={10} />
        <SkeletonLine width="70%" height={10} />
      </div>
    </div>
  )
}

/** Chart area skeleton matching the dashboard chart cards. */
export function SkeletonChart({ height = 200 }: { height?: number }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: 'var(--bg-primary)', borderColor: THEME.border }}
    >
      <SkeletonLine width={120} height={10} />
      <SkeletonBlock
        className="mt-3 w-full"
        style={{ height, borderRadius: 8 }}
      />
    </div>
  )
}

/** Table skeleton with N rows. */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--bg-primary)', borderColor: THEME.border }}
    >
      {/* Header row */}
      <div
        className="flex gap-4 px-4 py-3 border-b"
        style={{ borderColor: THEME.border }}
      >
        {[80, 120, 60, 80].map((w, i) => (
          <SkeletonLine key={i} width={w} height={10} />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0"
          style={{ borderColor: THEME.border }}
        >
          <SkeletonCircle size={28} />
          <SkeletonLine width="30%" height={10} />
          <SkeletonLine width="15%" height={10} />
          <SkeletonLine width="20%" height={10} />
        </div>
      ))}
    </div>
  )
}
