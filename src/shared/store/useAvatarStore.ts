import { create } from 'zustand'

const KEY = 'synth:avatar-overrides'

function read(): Record<string, string> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, string>
  } catch {
    return {}
  }
}

function write(v: Record<string, string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v))
  } catch {
    /* ignore */
  }
}

type AvatarState = {
  overrides: Record<string, string>
  setOverride: (id: string, dataUrl: string) => void
  clearOverride: (id: string) => void
}

export const useAvatarStore = create<AvatarState>((set) => ({
  overrides: typeof window === 'undefined' ? {} : read(),
  setOverride: (id, dataUrl) =>
    set((s) => {
      const next = { ...s.overrides, [id]: dataUrl }
      write(next)
      return { overrides: next }
    }),
  clearOverride: (id) =>
    set((s) => {
      const next = { ...s.overrides }
      delete next[id]
      write(next)
      return { overrides: next }
    }),
}))

