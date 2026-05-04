import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ToolSpec } from '../../../lib/tools/schema'

/**
 * One chat session = one tool being built. Sprint 4 stores the prompt,
 * the generated spec, and a display title locally. Sprint 9 swaps the
 * persistence layer for Supabase chat history; the in-app shape stays
 * the same so consumers don't change.
 */
export type ChatSession = {
  id: string
  title: string
  prompt: string
  spec: ToolSpec
  createdAt: number
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
      getSession: (id) => get().sessions.find((s) => s.id === id),
      getRecent: (limit = 20) => get().sessions.slice(0, limit),
      clearAll: () => set({ sessions: [] }),
    }),
    { name: 'synth:app:chat-sessions', version: 1 },
  ),
)
