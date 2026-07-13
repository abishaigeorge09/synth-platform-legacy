import { create } from 'zustand'
import type { WritebackDestination, WritebackIntent } from '@shared/data/types'
import { log } from '@lib/observability'

let _id = 0
function nextId() {
  _id += 1
  return `wb-${_id}`
}

type WritebackState = {
  queue: WritebackIntent[]
  enqueue: (input: {
    label: string
    destination: WritebackDestination
    payloadSummary: string
  }) => void
  confirmAll: () => void
  dismiss: (id: string) => void
}

export const useWritebackStore = create<WritebackState>((set, get) => ({
  queue: [],
  enqueue: (input) =>
    set((s) => ({
      queue: [
        ...s.queue,
        {
          id: nextId(),
          label: input.label,
          destination: input.destination,
          payloadSummary: input.payloadSummary,
          confirmed: false,
        },
      ],
    })),
  confirmAll: () => {
    const q = get().queue
    log.info('writeback.confirmAll (stub)', q.length)
    set({ queue: [] })
  },
  dismiss: (id) => set((s) => ({ queue: s.queue.filter((x) => x.id !== id) })),
}))
