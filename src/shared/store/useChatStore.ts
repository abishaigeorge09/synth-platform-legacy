import { create } from 'zustand'
import type { ChatScope } from '@shared/data/types'

export type ChatMsg = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
  citations?: { label: string; source: string }[]
}

export type ChatKey = string // scope + optional athleteId

export type ArchivedThread = {
  id: string
  key: ChatKey
  preview: string
  messageCount: number
  messages: ChatMsg[]
  archivedAt: number
}

export type ChatState = {
  threads: Record<ChatKey, ChatMsg[]>
  archivedThreads: ArchivedThread[]
  append: (key: ChatKey, msg: ChatMsg) => void
  patchMessage: (key: ChatKey, msgId: string, patch: Partial<ChatMsg>) => void
  reset: (key: ChatKey) => void
  restoreThread: (archivedId: string) => void
}

export const useChatStore = create<ChatState>((set) => ({
  threads: {},
  archivedThreads: [],
  append: (key, msg) =>
    set((state) => ({
      threads: {
        ...state.threads,
        [key]: [...(state.threads[key] ?? []), msg],
      },
    })),
  patchMessage: (key, msgId, patch) =>
    set((state) => ({
      threads: {
        ...state.threads,
        [key]: (state.threads[key] ?? []).map((m) => (m.id === msgId ? { ...m, ...patch } : m)),
      },
    })),
  reset: (key) =>
    set((state) => {
      const rest = { ...state.threads }
      const removed = rest[key]
      delete rest[key]
      const preview = (removed ?? []).find((m) => m.role === 'user' && m.content)?.content
        ?? (removed ?? []).find((m) => m.content)?.content
        ?? 'Empty thread'
      return {
        threads: rest,
        archivedThreads: removed
          ? [
              {
                id: `arch-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                key,
                preview: preview.slice(0, 120),
                messageCount: removed.length,
                messages: removed,
                archivedAt: Date.now(),
              },
              ...state.archivedThreads,
            ]
          : state.archivedThreads,
      }
    }),
  restoreThread: (archivedId) =>
    set((state) => {
      const archived = state.archivedThreads.find((t) => t.id === archivedId)
      if (!archived) return state
      const nextArchived = state.archivedThreads.filter((t) => t.id !== archivedId)
      return {
        threads: { ...state.threads, [archived.key]: archived.messages },
        archivedThreads: nextArchived,
      }
    }),
}))

export function threadKey(scope: ChatScope, scopedAthleteId?: string) {
  return scopedAthleteId ? `${scope}::${scopedAthleteId}` : scope
}
