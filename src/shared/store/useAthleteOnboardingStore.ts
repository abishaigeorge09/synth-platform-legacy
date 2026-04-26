import { create } from 'zustand'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

const KEY = 'synth:athlete-onboarding'

export type AthleteOnboardingState = {
  inviteCode: string | null
  confirmed: boolean
  profileName: string
  setInviteCode: (code: string) => void
  setConfirmed: (v: boolean) => void
  setProfileName: (name: string) => void
  reset: () => void
}

function read(): Pick<AthleteOnboardingState, 'inviteCode' | 'confirmed' | 'profileName'> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      if (isSupabaseConfigured()) return { inviteCode: null, confirmed: false, profileName: '' }
      return { inviteCode: 'CAL-WR-2026', confirmed: true, profileName: 'Athlete' }
    }
    const v = JSON.parse(raw) as { inviteCode?: string | null; confirmed?: boolean; profileName?: string }
    return { inviteCode: v.inviteCode ?? null, confirmed: !!v.confirmed, profileName: v.profileName ?? '' }
  } catch {
    return { inviteCode: 'CAL-WR-2026', confirmed: true, profileName: 'Athlete' }
  }
}

function write(v: Pick<AthleteOnboardingState, 'inviteCode' | 'confirmed' | 'profileName'>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v))
  } catch {
    /* ignore */
  }
}

export const useAthleteOnboardingStore = create<AthleteOnboardingState>((set) => {
  const initial = typeof window === 'undefined' ? { inviteCode: null, confirmed: false, profileName: '' } : read()

  const commit = (next: Partial<Pick<AthleteOnboardingState, 'inviteCode' | 'confirmed' | 'profileName'>>) =>
    set((s) => {
      const merged = {
        inviteCode: next.inviteCode ?? s.inviteCode,
        confirmed: next.confirmed ?? s.confirmed,
        profileName: next.profileName ?? s.profileName,
      }
      write(merged)
      return merged
    })

  return {
    ...initial,
    setInviteCode: (code) => commit({ inviteCode: code }),
    setConfirmed: (v) => commit({ confirmed: v }),
    setProfileName: (name) => commit({ profileName: name }),
    reset: () => {
      try {
        localStorage.removeItem(KEY)
      } catch {
        /* ignore */
      }
      set({ inviteCode: null, confirmed: false, profileName: '' })
    },
  }
})

export function isAthleteOnboardingComplete(s: Pick<AthleteOnboardingState, 'inviteCode' | 'confirmed'>) {
  return !!s.inviteCode && s.confirmed
}
