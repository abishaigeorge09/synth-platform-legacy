import { Component, type ErrorInfo, type ReactNode } from 'react'
import { THEME } from '../../lib/theme'

/**
 * Phase 14 — route-level error boundary. Any render error inside a lazy
 * route chunk bubbles here instead of blank-screening the whole app. The
 * fallback is synth-themed (light canvas, serif headline, mono labels) and
 * gives the user two recovery paths: retry the current route, or go home.
 *
 * React requires error boundaries to be class components, so this file is
 * the only class component in the repo. All styling still reads from THEME
 * tokens to stay consistent with the rest of the surface.
 */

type Props = {
  children: ReactNode
  /** Shown in the fallback as a short hint about *where* the crash happened. */
  label?: string
}

type State = {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In a real backend this would ship to Sentry / Logflare. For now the
    // coach can at least see the trace in the browser console.
    console.error('[synth] route error', { error, info, label: this.props.label })
  }

  private handleRetry = () => {
    this.setState({ error: null })
  }

  private handleGoHome = () => {
    // Full navigation rather than react-router navigate() — this resets
    // Suspense / store state on the way out, which is the safer default
    // when something has already gone wrong in the current tree.
    window.location.assign('/')
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div
        className="flex min-h-[60vh] w-full items-center justify-center px-6 py-12"
        style={{ backgroundColor: THEME.light }}
      >
        <div
          className="w-full max-w-[440px] rounded-2xl border p-8 shadow-sm"
          style={{ background: 'var(--bg-primary)', borderColor: THEME.border }}
        >
          <div
            className="mb-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: THEME.red }}
            />
            {this.props.label ?? 'Route error'}
          </div>
          <h1
            className="mb-3 text-[26px] font-semibold leading-tight"
            style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
          >
            Something broke loading this view.
          </h1>
          <p
            className="mb-6 text-[13px] leading-relaxed"
            style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary }}
          >
            synth. caught the crash before it took the whole app down. You can
            retry this page, or head back to the landing surface and try again
            from there.
          </p>
          <pre
            className="mb-6 max-h-[140px] overflow-auto rounded-lg border px-3 py-2 text-[11px] leading-snug"
            style={{
              fontFamily: THEME.fontMono,
              color: THEME.textSecondary,
              borderColor: THEME.border,
              background: THEME.light,
            }}
          >
            {error.message || String(error)}
          </pre>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="flex-1 rounded-full py-2.5 text-[12px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.01]"
              style={{
                background: THEME.primary,
                color: THEME.white,
                fontFamily: THEME.fontMono,
              }}
            >
              Retry
            </button>
            <button
              type="button"
              onClick={this.handleGoHome}
              className="flex-1 rounded-full border py-2.5 text-[12px] font-semibold uppercase tracking-wider transition-colors"
              style={{
                borderColor: THEME.border,
                color: THEME.textPrimary,
                fontFamily: THEME.fontMono,
                background: 'var(--bg-primary)',
              }}
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    )
  }
}
