import { create } from 'zustand'

export type NudgeKind =
  | 'wellness_reminder'
  | 'recovery_alert'
  | 'sleep_nudge'
  | 'streak_risk'
  | 'engagement'

export type NudgePayload = {
  kind: NudgeKind
  title: string
  body: string
  cta: string
  ctaHref?: string
  onCta?: () => void
}

const NUDGE_PRIORITY: Record<NudgeKind, number> = {
  streak_risk: 5,
  recovery_alert: 4,
  wellness_reminder: 3,
  sleep_nudge: 2,
  engagement: 1,
}

export type PRPayload = {
  eventLabel: string
  /** Display value (e.g. "6:34.9" or "315"). */
  displayValue: string
  /** Numeric counter target (used by the count-up). For time PRs pass total seconds, for lifts pass the kg/lb number. */
  numericTarget: number
  /** How to format the counter value while it counts up. */
  format?: 'time' | 'number'
  date?: string
}

export type BehavioralState = {
  // streak
  streak: number
  longestStreak: number
  /** ISO date strings (YYYY-MM-DD) of the last 90 days that were checked in. */
  checkInDays: string[]
  lastCheckIn: string | null
  flamePulseAt: number | null

  // recovery
  recovery: number
  recoveryStatus: 'ready' | 'light' | 'rest'

  // mini stats
  prCount: number
  sessionsLogged: number
  daysActive: number

  // PR celebration
  activePR: PRPayload | null

  // nudges
  activeNudge: NudgePayload | null
  dismissedNudges: NudgeKind[]

  // weekly digest
  digestOpen: boolean

  // actions
  checkIn: () => void
  incrementStreak: () => void
  resetStreak: () => void
  triggerPR: (pr: PRPayload) => void
  dismissPR: () => void
  showNudge: (n: NudgePayload) => void
  dismissNudge: () => void
  setRecovery: (n: number) => void
  openDigest: () => void
  closeDigest: () => void
}

function todayISO(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - offsetDays)
  return d.toISOString().slice(0, 10)
}

/** Seed the last N days of check-ins so the heatmap looks lived-in. */
function seedCheckInDays(streak: number): string[] {
  const days: string[] = []
  // Recent streak (consecutive backwards from today).
  for (let i = 0; i < streak; i++) days.push(todayISO(i))
  // Sprinkle older history (skip days, pre-streak block) to give the heatmap texture.
  const olderPattern = [16, 17, 19, 20, 22, 25, 27, 28, 30, 31, 33, 36, 38, 41, 42, 44, 47, 51, 54, 58, 60, 65, 68, 72, 76, 80, 84]
  for (const offset of olderPattern) days.push(todayISO(offset))
  return Array.from(new Set(days))
}

const SEED_STREAK = 13
const SEED_RECOVERY = 72

export const useBehavioralStore = create<BehavioralState>((set, get) => ({
  streak: SEED_STREAK,
  longestStreak: 21,
  checkInDays: seedCheckInDays(SEED_STREAK),
  lastCheckIn: todayISO(1),
  flamePulseAt: null,

  recovery: SEED_RECOVERY,
  recoveryStatus: 'light',

  prCount: 4,
  sessionsLogged: 23,
  daysActive: 47,

  activePR: null,
  activeNudge: null,
  dismissedNudges: [],

  digestOpen: false,

  checkIn: () => {
    const { streak, longestStreak, checkInDays, lastCheckIn } = get()
    const today = todayISO()
    if (lastCheckIn === today) return
    const next = streak + 1
    set({
      streak: next,
      longestStreak: Math.max(longestStreak, next),
      checkInDays: Array.from(new Set([today, ...checkInDays])),
      lastCheckIn: today,
      flamePulseAt: Date.now(),
    })
  },

  incrementStreak: () => {
    const { streak, longestStreak, checkInDays } = get()
    const next = streak + 1
    const today = todayISO()
    set({
      streak: next,
      longestStreak: Math.max(longestStreak, next),
      checkInDays: Array.from(new Set([today, ...checkInDays])),
      lastCheckIn: today,
      flamePulseAt: Date.now(),
    })
  },

  resetStreak: () => {
    set({ streak: 0, flamePulseAt: Date.now() })
  },

  triggerPR: (pr) => {
    set((s) => ({ activePR: pr, prCount: s.prCount + 1 }))
  },

  dismissPR: () => set({ activePR: null }),

  showNudge: (n) => {
    const current = get().activeNudge
    if (current && NUDGE_PRIORITY[current.kind] >= NUDGE_PRIORITY[n.kind]) return
    set({ activeNudge: n })
  },

  dismissNudge: () => {
    const current = get().activeNudge
    if (!current) return
    set((s) => ({
      activeNudge: null,
      dismissedNudges: [...s.dismissedNudges, current.kind],
    }))
  },

  setRecovery: (n) => {
    const status: BehavioralState['recoveryStatus'] = n >= 80 ? 'ready' : n >= 60 ? 'light' : 'rest'
    set({ recovery: n, recoveryStatus: status })
  },

  openDigest: () => set({ digestOpen: true }),
  closeDigest: () => set({ digestOpen: false }),
}))

export function statusLabel(status: BehavioralState['recoveryStatus']): string {
  switch (status) {
    case 'ready':
      return 'Ready to send'
    case 'light':
      return 'Light day suggested'
    case 'rest':
      return 'Recover and rest'
  }
}

export function recoveryColor(score: number): string {
  if (score >= 80) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

/** YYYY-MM-DD for `offset` days ago. Exposed for the heatmap. */
export function isoForOffset(offset: number): string {
  return todayISO(offset)
}
