import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Daily-cap store for demo accounts.
 *
 * Demo users are anonymous Supabase sessions. Without a cap, a single
 * curious tester (or scraper) can chew through Anthropic billing.
 * This store tracks message count per UTC day in localStorage and
 * blocks further sends once the cap is hit, surfacing a clear UI
 * banner instead.
 *
 * Hard caveat: this is the client-side soft defence. It's trivially
 * bypassable via DevTools (clear localStorage, decrement the counter,
 * etc.). The matching server-side enforcement lives in
 * supabase/functions/claude-chat (when deployed) — that's the real
 * cap. This store is purely UX: it lets the demo user know what's
 * up and discourages incidental over-use.
 *
 * Limits are conservative; a coach who's actually evaluating synth
 * shouldn't run into them.
 */

export const DEMO_DAILY_AI_LIMIT = 30

type DemoUsageState = {
  /** UTC date in YYYY-MM-DD format. The counter resets when this rolls. */
  date: string
  /** Number of AI messages sent today. */
  count: number
  /** Increment the counter for today (or roll the date + start at 1). */
  recordMessage: () => void
  /** True when today's count has hit DEMO_DAILY_AI_LIMIT. */
  isOverLimit: () => boolean
  /** Number of messages remaining today. Never negative. */
  remaining: () => number
  /** Reset the counter — used after a real sign-up upgrades the user
   *  out of demo mode, or for tests. */
  reset: () => void
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10)
}

export const useDemoUsage = create<DemoUsageState>()(
  persist(
    (set, get) => ({
      date: todayUtc(),
      count: 0,
      recordMessage: () =>
        set((s) => {
          const now = todayUtc()
          if (s.date !== now) return { date: now, count: 1 }
          return { date: s.date, count: s.count + 1 }
        }),
      isOverLimit: () => {
        const s = get()
        // Guard: if the persisted date is stale, treat as fresh-day
        // and report under-limit. The first recordMessage call in
        // the new UTC day will roll the counter.
        if (s.date !== todayUtc()) return false
        return s.count >= DEMO_DAILY_AI_LIMIT
      },
      remaining: () => {
        const s = get()
        if (s.date !== todayUtc()) return DEMO_DAILY_AI_LIMIT
        return Math.max(0, DEMO_DAILY_AI_LIMIT - s.count)
      },
      reset: () => set({ date: todayUtc(), count: 0 }),
    }),
    {
      name: 'synth:app:demo-usage',
      version: 1,
      partialize: (s) => ({ date: s.date, count: s.count }),
    },
  ),
)
