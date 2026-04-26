import { useSyncExternalStore } from 'react'

type VisibilitySettings = {
  showTeamStats: boolean
  showOtherBoats: boolean
  showCoachNotes: boolean
  shareVideos: boolean
  allowPersonalSources: boolean
  showErgRankings: boolean
  showSessionMedia: boolean
  allowScheduleOptIn: boolean
}

const DEFAULTS: VisibilitySettings = {
  showTeamStats: true,
  showOtherBoats: false,
  showCoachNotes: false,
  shareVideos: true,
  allowPersonalSources: true,
  showErgRankings: true,
  showSessionMedia: false,
  allowScheduleOptIn: true,
}

function readSettings(): VisibilitySettings {
  try {
    const raw = localStorage.getItem('synth:settings')
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw)
    const vis = parsed.visibility ?? {}
    return { ...DEFAULTS, ...vis }
  } catch {
    return DEFAULTS
  }
}

export function useVisibilitySettings(): VisibilitySettings {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('storage', cb)
      return () => window.removeEventListener('storage', cb)
    },
    readSettings,
    () => DEFAULTS,
  )
}
