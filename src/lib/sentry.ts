/**
 * Sprint 13 — error-tracking harness.
 *
 * The official @sentry/react SDK isn't installed (avoiding bundle bloat
 * pre-MVP). When AG drops a Sentry DSN in `VITE_SENTRY_DSN` and runs
 * `npm i @sentry/react`, the import below can switch to the real client
 * with no other code change. Today this is a structured console.error
 * harness — all the call-sites are in place, the wire is just unwired.
 *
 * Why it lives here: every error path in the tools layer
 * (toolGenerateClient, publishedTools, capability validation) calls
 * `captureError(err, context)` so failures in production are at least
 * visible in browser logs even before Sentry comes online.
 */

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined

export type ErrorContext = {
  /** Surface or feature where the error happened. e.g. 'tool-generate'. */
  area: string
  /** Free-form key-value tags. Avoid PII. */
  tags?: Record<string, string | number | boolean | null>
}

export function isSentryConfigured(): boolean {
  return Boolean(DSN && DSN.length > 0)
}

/**
 * Capture an error. No-op when @sentry/react isn't installed; falls back
 * to a structured console.error so the failure is visible in the
 * browser dev tools regardless.
 */
export function captureError(error: unknown, context: ErrorContext): void {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Unknown error'

  // Structured console output — Sentry replacement reads the same shape.
  if (typeof console !== 'undefined') {
    console.error(`[${context.area}] ${message}`, {
      error,
      tags: context.tags,
      sentry_configured: isSentryConfigured(),
    })
  }

  // When @sentry/react is installed in a future PR, replace with:
  //   import * as Sentry from '@sentry/react'
  //   Sentry.captureException(error, { tags: { area: context.area, ...context.tags } })
}
