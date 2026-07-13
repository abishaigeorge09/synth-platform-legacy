import { create } from 'zustand'
import type { PublishedLineup, BoatLineup } from '@shared/data/seeds/lineups'
import { SEED_PUBLISHED_LINEUPS } from '@shared/data/seeds/lineups'

type LineupsState = {
  published: PublishedLineup[]
  publish: (args: {
    sessionTitle: string
    date: string
    note?: string
    boats: BoatLineup[]
  }) => PublishedLineup
}

export const useLineupsStore = create<LineupsState>((set, get) => ({
  published: SEED_PUBLISHED_LINEUPS,
  publish: ({ sessionTitle, date, note, boats }) => {
    const lineup: PublishedLineup = {
      id: `pub-${Date.now()}`,
      sessionTitle,
      date,
      publishedAt: new Date().toISOString(),
      note,
      boats: boats.map((b) => ({
        ...b,
        seats: b.seats.map((s) => ({ ...s })),
      })),
    }
    set({ published: [lineup, ...get().published] })
    return lineup
  },
}))

