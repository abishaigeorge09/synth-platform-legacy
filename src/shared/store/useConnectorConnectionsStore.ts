import { create } from 'zustand'
import type { ConnectorProvider } from '@shared/data/types'

const KEY = 'synth:connector-connections'

export type ConnectorConnectionsState = {
  connectedByTeam: Record<string, ConnectorProvider[]>
  isConnected: (teamId: string, provider: ConnectorProvider) => boolean
  connect: (teamId: string, provider: ConnectorProvider) => void
  disconnect: (teamId: string, provider: ConnectorProvider) => void
  resetTeam: (teamId: string) => void
}

function read(): Record<string, ConnectorProvider[]> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const v = JSON.parse(raw) as Record<string, ConnectorProvider[]>
    return v && typeof v === 'object' ? v : {}
  } catch {
    return {}
  }
}

function write(v: Record<string, ConnectorProvider[]>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v))
  } catch {
    /* ignore */
  }
}

export const useConnectorConnectionsStore = create<ConnectorConnectionsState>((set, get) => ({
  connectedByTeam: typeof window === 'undefined' ? {} : read(),
  isConnected: (teamId, provider) => (get().connectedByTeam[teamId] ?? []).includes(provider),
  connect: (teamId, provider) => {
    const cur = get().connectedByTeam
    const list = cur[teamId] ?? []
    if (list.includes(provider)) return
    const next = { ...cur, [teamId]: [...list, provider] }
    write(next)
    set({ connectedByTeam: next })
  },
  disconnect: (teamId, provider) => {
    const cur = get().connectedByTeam
    const next = { ...cur, [teamId]: (cur[teamId] ?? []).filter((p) => p !== provider) }
    write(next)
    set({ connectedByTeam: next })
  },
  resetTeam: (teamId) => {
    const next = { ...get().connectedByTeam }
    delete next[teamId]
    write(next)
    set({ connectedByTeam: next })
  },
}))
