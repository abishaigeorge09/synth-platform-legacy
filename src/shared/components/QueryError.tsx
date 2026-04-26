import { THEME } from '../../lib/theme'

/**
 * Phase 25 — inline error state for query hook consumers.
 *
 * Shown when a query hook returns `isError: true`. Provides a
 * synth-themed error card with a retry button. Unlike ErrorBoundary
 * (which catches render crashes), this handles *data fetch* failures
 * gracefully without unmounting the component tree.
 *
 * Today `useStaticQuery` never returns `isError: true`, so this
 * component is dormant. When TanStack Query lands, any failed
 * Supabase fetch will surface this card automatically.
 */
export function QueryError({
  label,
  error,
  onRetry,
}: {
  /** Short context — e.g. "Dashboard", "Athletes" */
  label?: string
  /** The error object from the query hook */
  error?: Error | null
  /** Called when the user clicks Retry. Typically triggers a refetch. */
  onRetry?: () => void
}) {
  return (
    <div
      className="flex w-full items-center justify-center px-5 py-12"
      style={{ background: THEME.light }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-6"
        style={{
          background: 'var(--bg-primary)',
          borderColor: THEME.border,
          boxShadow:
            '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.18)',
        }}
      >
        {/* Kicker */}
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: THEME.red }}
          />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.red }}
          >
            {label ? `${label} · data error` : 'Data error'}
          </span>
        </div>

        {/* Headline */}
        <h2
          className="mt-2 text-[20px] font-semibold leading-snug"
          style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
        >
          Something went wrong loading this data.
        </h2>

        {/* Copy */}
        <p
          className="mt-2 text-[13px] leading-relaxed"
          style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary }}
        >
          This usually means a network issue or a temporary problem with the
          data source. You can retry, or come back later.
        </p>

        {/* Error detail (if available) */}
        {error?.message && (
          <pre
            className="mt-3 max-h-[80px] overflow-auto rounded-lg border p-3 text-[11px]"
            style={{
              fontFamily: THEME.fontMono,
              color: THEME.textMuted,
              borderColor: THEME.border,
              background: THEME.light,
            }}
          >
            {error.message}
          </pre>
        )}

        {/* Actions */}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02]"
            style={{
              fontFamily: THEME.fontMono,
              background: THEME.primary,
              color: THEME.white,
              boxShadow: '0 8px 20px -10px rgba(5,150,105,0.4)',
            }}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  )
}
