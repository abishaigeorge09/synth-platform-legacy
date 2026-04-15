import { create } from 'zustand'
import type { ChatScope } from '../data/types'

export type ChatMsg = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
  citations?: { label: string; source: string }[]
}

export type ChatKey = string // scope + optional athleteId

type ChatState = {
  threads: Record<ChatKey, ChatMsg[]>
  append: (key: ChatKey, msg: ChatMsg) => void
  reset: (key: ChatKey) => void
}

export const useChatStore = create<ChatState>((set) => ({
  threads: {},
  append: (key, msg) =>
    set((state) => ({
      threads: {
        ...state.threads,
        [key]: [...(state.threads[key] ?? []), msg],
      },
    })),
  reset: (key) =>
    set((state) => {
      const { [key]: _removed, ...rest } = state.threads
      return { threads: rest }
    }),
}))

export function threadKey(scope: ChatScope, scopedAthleteId?: string) {
  return scopedAthleteId ? `${scope}::${scopedAthleteId}` : scope
}
