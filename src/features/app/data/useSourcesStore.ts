import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { COACH_CONNECTORS } from './mockConnectors'

export type SourceStatus = 'synced' | 'syncing' | 'error'

export type ConnectedSource = {
  id: string
  status: SourceStatus
  /** Human-friendly relative time. Real backend would compute this. */
  lastSync: string
  /** Per-tool toggle state. Tools default to enabled when first connected. */
  enabledTools: Record<string, boolean>
}

type SourcesState = {
  sources: Record<string, ConnectedSource>
  /** Connect a source. All tools start enabled. */
  connect: (id: string) => void
  /** Drop a source. Removes its toggle state too. */
  disconnect: (id: string) => void
  /** Flip a single tool. */
  toggleTool: (sourceId: string, toolId: string) => void
  /** Set every tool to the same value. */
  setAllTools: (sourceId: string, value: boolean) => void
  /** Pause/resume sync (UI affordance only). */
  togglePause: (id: string) => void
}

const SEED_CONNECTED: string[] = ['concept2', 'strava', 'trainingpeaks', 'whoop', 'apple-health', 'garmin', 'gmail', 'sheets']

function seedSources(): Record<string, ConnectedSource> {
  const out: Record<string, ConnectedSource> = {}
  for (const id of SEED_CONNECTED) {
    const meta = COACH_CONNECTORS.find((c) => c.id === id)
    if (!meta) continue
    out[id] = {
      id,
      status: id === 'garmin' ? 'error' : 'synced',
      lastSync: id === 'garmin' ? '2h ago' : id === 'gmail' ? '8m ago' : '4m ago',
      enabledTools: Object.fromEntries(meta.tools.map((t) => [t.id, true])),
    }
  }
  return out
}

export const useSourcesStore = create<SourcesState>()(
  persist(
    (set) => ({
      sources: seedSources(),
      connect: (id) =>
        set((s) => {
          if (s.sources[id]) return s
          const meta = COACH_CONNECTORS.find((c) => c.id === id)
          if (!meta) return s
          return {
            sources: {
              ...s.sources,
              [id]: {
                id,
                status: 'synced',
                lastSync: 'just now',
                enabledTools: Object.fromEntries(meta.tools.map((t) => [t.id, true])),
              },
            },
          }
        }),
      disconnect: (id) =>
        set((s) => {
          const next = { ...s.sources }
          delete next[id]
          return { sources: next }
        }),
      toggleTool: (sourceId, toolId) =>
        set((s) => {
          const src = s.sources[sourceId]
          if (!src) return s
          return {
            sources: {
              ...s.sources,
              [sourceId]: {
                ...src,
                enabledTools: { ...src.enabledTools, [toolId]: !src.enabledTools[toolId] },
              },
            },
          }
        }),
      setAllTools: (sourceId, value) =>
        set((s) => {
          const src = s.sources[sourceId]
          if (!src) return s
          const next: Record<string, boolean> = {}
          for (const k of Object.keys(src.enabledTools)) next[k] = value
          return { sources: { ...s.sources, [sourceId]: { ...src, enabledTools: next } } }
        }),
      togglePause: (id) =>
        set((s) => {
          const src = s.sources[id]
          if (!src) return s
          return {
            sources: {
              ...s.sources,
              [id]: { ...src, status: src.status === 'syncing' ? 'synced' : 'syncing' },
            },
          }
        }),
    }),
    { name: 'synth:app:sources', version: 1 },
  ),
)

/** Count of currently-enabled tools, for the row badge. */
export function enabledToolCount(src: ConnectedSource | undefined): number {
  if (!src) return 0
  return Object.values(src.enabledTools).filter(Boolean).length
}
