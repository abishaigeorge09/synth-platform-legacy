import posthog from 'posthog-js'

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://us.i.posthog.com'

let initialized = false

/**
 * Boots PostHog if a key is configured. Safe to call repeatedly — second call
 * is a no-op. Reads `?u=<name>` off the URL on first load and identifies the
 * session, so a link like `/?u=alice` shows up as Alice in PostHog → Persons
 * with their full session replay.
 *
 * No-op when VITE_POSTHOG_KEY is unset (local dev without a key, CI, etc.).
 */
export function initAnalytics() {
  if (initialized) return
  if (!KEY) return
  if (typeof window === 'undefined') return

  posthog.init(KEY, {
    api_host: HOST,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: { password: true },
    },
    loaded: (ph) => {
      identifyFromUrl(ph)
    },
  })

  initialized = true
}

function identifyFromUrl(ph: { identify: (id: string, props?: Record<string, unknown>) => void; register: (props: Record<string, unknown>) => void }) {
  try {
    const params = new URLSearchParams(window.location.search)
    const u = params.get('u')
    if (!u) return
    const name = u.trim()
    if (!name) return
    ph.identify(name, { name, share_link: window.location.href })
    ph.register({ share_recipient: name })
  } catch {
    // Ignore — analytics never breaks the app.
  }
}

export { posthog }
