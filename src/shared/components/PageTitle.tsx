import { useEffect } from 'react'

const BASE_TITLE = 'synth.'

/**
 * Phase 27 — sets `document.title` on mount and restores the base title on
 * unmount. Every route wraps its element in `<PageTitle title="Dashboard">`
 * via `withSuspense` in `routes.tsx`, so every page gets a descriptive
 * browser tab title (e.g. "Dashboard — synth.") without touching individual
 * page components.
 */
export function PageTitle({ title, children }: { title?: string; children: React.ReactNode }) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE_TITLE}` : `${BASE_TITLE} — Every data signal. One platform.`
    return () => {
      document.title = `${BASE_TITLE} — Every data signal. One platform.`
    }
  }, [title])

  return <>{children}</>
}
