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
  /** Most recently installed tool id — drives the one-shot pulse animation
   *  on the Installed tab. Null until the first install fires. */
  lastInstalledId: string | null
  /** Timestamp paired with lastInstalledId. Consumers compare against
   *  Date.now() to decide whether the highlight should still play. */
  lastInstalledAt: number | null
  install: (meta: InstalledToolMeta) => void
  uninstall: (id: string) => void
  isInstalled: (id: string) => boolean
  /** Clears lastInstalledId / lastInstalledAt — call after the install
   *  pulse animation has completed so the highlight doesn't replay on
   *  re-mount of the Installed list. */
  clearLastInstalled: () => void
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
      lastInstalledId: null,
      lastInstalledAt: null,
      install: (meta) =>
        set((s) => {
          const next = s.tools.some((t) => t.id === meta.id)
            ? s.tools
            : [...s.tools, meta]
          return {
            tools: next,
            lastInstalledId: meta.id,
            lastInstalledAt: Date.now(),
          }
        }),
      uninstall: (id) =>
        set((s) => ({ tools: s.tools.filter((t) => t.id !== id) })),
      isInstalled: (id) => get().tools.some((t) => t.id === id),
      clearLastInstalled: () =>
        set({ lastInstalledId: null, lastInstalledAt: null }),
    }),
    { name: 'synth:app:installed-tools', version: 1 },
  ),
)
