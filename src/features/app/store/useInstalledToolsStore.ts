import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Persisted catalog of tools the coach has installed.
 *
 * Sprint 1 — seeded with Lineup Builder. Sprint 4+ will append generated
 * tools as they're produced by the vibe-code generator. The store stays
 * JSON-safe (no React nodes) so it round-trips through localStorage; the
 * Catalog/Installed cards resolve the icon from `iconKey` at render time.
 */
export type InstalledToolMeta = {
  id: string
  name: string
  shortDesc: string
  publisher: string
  category: string
  accent: string
  version: string
  loadMs: number
  to: string
  iconKey: string
}

type InstalledToolsState = {
  tools: InstalledToolMeta[]
  install: (meta: InstalledToolMeta) => void
  uninstall: (id: string) => void
  isInstalled: (id: string) => boolean
}

const SEED_TOOLS: InstalledToolMeta[] = [
  {
    id: 'lineup-builder',
    name: 'Lineup Builder',
    shortDesc:
      'Build, compare, and publish boat lineups. Drag athletes into seats, run a session timer, save history.',
    publisher: 'synth · core',
    category: 'lineups',
    accent: '#A8DBF5',
    version: 'v1.4.2',
    loadMs: 84,
    to: '/app/coach/lineups',
    iconKey: 'lineups',
  },
]

export const useInstalledToolsStore = create<InstalledToolsState>()(
  persist(
    (set, get) => ({
      tools: SEED_TOOLS,
      install: (meta) =>
        set((s) => {
          if (s.tools.some((t) => t.id === meta.id)) return s
          return { tools: [...s.tools, meta] }
        }),
      uninstall: (id) =>
        set((s) => ({ tools: s.tools.filter((t) => t.id !== id) })),
      isInstalled: (id) => get().tools.some((t) => t.id === id),
    }),
    { name: 'synth:app:installed-tools', version: 1 },
  ),
)
