import { create } from 'zustand'

export type CoachNote = {
  id: string
  athleteId: string
  date: string
  content: string
  tags: string[]
  coachName: string
}

export const useCoachNotesStore = create<{
  notes: CoachNote[]
  add: (note: Omit<CoachNote, 'id'>) => void
}>((set) => ({
  notes: [],
  add: (note) =>
    set((s) => ({
      notes: [{ ...note, id: `note-${Date.now()}` }, ...s.notes],
    })),
}))
