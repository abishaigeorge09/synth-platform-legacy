import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ToolSpec } from '../../../lib/tools/schema'
import {
  STROKE_RATE_LOGGER,
  LINEUP_COMPARE,
  WELLNESS_SUMMARY,
  LAP_COUNTER,
  RACE_PLAN,
  PACIFIC_BOAT_RACE,
} from '../../../lib/tools/examples'

/**
 * One chat session = one tool being built. Sprint 4 stores the prompt,
 * the generated spec, and a display title locally. Sprint 9 swaps the
 * persistence layer for Supabase chat history; the in-app shape stays
 * the same so consumers don't change.
 *
 * Sprint 5.5 — adds SEEDED_EXAMPLES (in-module constants) so first-time
 * users see what builds look like in the sidebar. Seeded sessions are
 * NOT persisted; they're constants alongside the store. The new
 * `seeded?` field lets the UI render a small badge on those rows.
 */
export type ChatSession = {
  id: string
  title: string
  prompt: string
  spec: ToolSpec
  createdAt: number
  /** True for SEEDED_EXAMPLES; undefined for real user sessions. */
  seeded?: boolean
}

type ChatSessionsState = {
  sessions: ChatSession[]
  createSession: (prompt: string, spec: ToolSpec) => string
  getSession: (id: string) => ChatSession | undefined
  getRecent: (limit?: number) => ChatSession[]
  clearAll: () => void
}

function makeTitle(prompt: string): string {
  const trimmed = prompt.trim()
  if (trimmed.length <= 40) return trimmed
  return trimmed.slice(0, 40).trimEnd() + '…'
}

// ─── Seeded examples (in-module constants, never persisted) ───────────────

const SEEDED_EXAMPLES: ChatSession[] = [
  {
    id: 'seed-stroke-rate-logger',
    title: STROKE_RATE_LOGGER.name,
    prompt: 'Track stroke rate from Concept2 for the selected athlete.',
    spec: STROKE_RATE_LOGGER,
    createdAt: 0,
    seeded: true,
  },
  {
    id: 'seed-lineup-compare',
    title: LINEUP_COMPARE.name,
    prompt: 'Compare two boats with per-seat erg deltas.',
    spec: LINEUP_COMPARE,
    createdAt: 0,
    seeded: true,
  },
  {
    id: 'seed-wellness-summary',
    title: WELLNESS_SUMMARY.name,
    prompt: 'Daily team wellness rollup with energy / sleep / soreness.',
    spec: WELLNESS_SUMMARY,
    createdAt: 0,
    seeded: true,
  },
  {
    id: 'seed-lap-counter',
    title: LAP_COUNTER.name,
    prompt: 'Tap-to-log lap counter with elapsed and split times.',
    spec: LAP_COUNTER,
    createdAt: 0,
    seeded: true,
  },
  {
    id: 'seed-race-plan',
    title: RACE_PLAN.name,
    prompt: 'Per-piece race plan with predicted splits.',
    spec: RACE_PLAN,
    createdAt: 0,
    seeded: true,
  },
  {
    id: 'seed-pacific-boat-race',
    title: PACIFIC_BOAT_RACE.name,
    prompt: 'Animated 2K race replay across six varsity boats.',
    spec: PACIFIC_BOAT_RACE,
    createdAt: 0,
    seeded: true,
  },
]

export const useChatSessionsStore = create<ChatSessionsState>()(
  persist(
    (set, get) => ({
      sessions: [],
      createSession: (prompt, spec) => {
        const id =
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const session: ChatSession = {
          id,
          title: makeTitle(prompt),
          prompt,
          spec,
          createdAt: Date.now(),
        }
        // Newest-first order so getRecent returns the freshest sessions
        // without callers needing to sort.
        set((s) => ({ sessions: [session, ...s.sessions] }))
        return id
      },
      // Searches both real sessions and SEEDED_EXAMPLES so the Build
      // workspace can load a seeded session by id.
      getSession: (id) => {
        const real = get().sessions.find((s) => s.id === id)
        if (real) return real
        return SEEDED_EXAMPLES.find((s) => s.id === id)
      },
      // `limit` applies to USER sessions only. Seeded examples are
      // ALWAYS appended after — they're a fixed footer set, not subject
      // to the recency cap.
      getRecent: (limit = 20) => [
        ...get().sessions.slice(0, limit),
        ...SEEDED_EXAMPLES,
      ],
      clearAll: () => set({ sessions: [] }),
    }),
    { name: 'synth:app:chat-sessions', version: 1 },
  ),
)
