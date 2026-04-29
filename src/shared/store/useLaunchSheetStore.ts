import { create } from 'zustand'

/**
 * Launch action sheet — tracks whether the half-height "what do you want to
 * do?" sheet should auto-open when the coach lands on /app/coach/home.
 *
 * Rules:
 *  - If `disabled` (user explicitly opted out) → never auto-open.
 *  - If they have dismissed the sheet 2 times in a row without engaging →
 *    don't auto-open until they reset from Settings or engage with it
 *    indirectly (e.g. they navigate to /app/coach/capture themselves).
 *  - Engaging with one of the actions resets the dismissal counter.
 *
 * State persists to localStorage so it survives reloads.
 */

const STORAGE_KEY = 'synth:launchSheet:v1'
const DISMISS_LIMIT = 2

type Persisted = {
  disabled: boolean
  consecutiveDismissals: number
}

const DEFAULTS: Persisted = {
  disabled: false,
  consecutiveDismissals: 0,
}

function read(): Persisted {
  if (typeof window === 'undefined') return DEFAULTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw) as Partial<Persisted>
    return {
      disabled: typeof parsed.disabled === 'boolean' ? parsed.disabled : DEFAULTS.disabled,
      consecutiveDismissals:
        typeof parsed.consecutiveDismissals === 'number'
          ? parsed.consecutiveDismissals
          : DEFAULTS.consecutiveDismissals,
    }
  } catch {
    return DEFAULTS
  }
}

function write(state: Persisted) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota / private mode
  }
}

type LaunchSheetState = {
  disabled: boolean
  consecutiveDismissals: number
  /** True iff the sheet is currently open. Pure UI state — not persisted. */
  open: boolean

  /** Should we auto-open the sheet on coach-home mount right now? */
  shouldShow: () => boolean
  /** Open the sheet (auto-open path or manual replay). */
  show: () => void
  /** Close without picking an action — counts as a dismissal. */
  dismiss: () => void
  /** User picked one of the actions — resets the dismissal streak. */
  engage: () => void
  /** "Don't show this again" — disables auto-open until re-enabled. */
  disable: () => void
  /** Re-enable auto-open and clear dismissal counter. */
  enable: () => void
}

export const useLaunchSheetStore = create<LaunchSheetState>((set, get) => {
  const initial = read()
  return {
    disabled: initial.disabled,
    consecutiveDismissals: initial.consecutiveDismissals,
    open: false,

    shouldShow: () => {
      const s = get()
      if (s.disabled) return false
      if (s.consecutiveDismissals >= DISMISS_LIMIT) return false
      return true
    },

    show: () => set({ open: true }),

    dismiss: () => {
      const next = {
        disabled: get().disabled,
        consecutiveDismissals: get().consecutiveDismissals + 1,
      }
      write(next)
      set({ ...next, open: false })
    },

    engage: () => {
      const next = { disabled: get().disabled, consecutiveDismissals: 0 }
      write(next)
      set({ ...next, open: false })
    },

    disable: () => {
      const next = { disabled: true, consecutiveDismissals: 0 }
      write(next)
      set({ ...next, open: false })
    },

    enable: () => {
      const next = { disabled: false, consecutiveDismissals: 0 }
      write(next)
      set({ ...next })
    },
  }
})
