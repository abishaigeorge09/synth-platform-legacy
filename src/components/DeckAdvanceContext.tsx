/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react'

const DeckAdvanceContext = createContext<(() => void) | null>(null)

export function DeckAdvanceProvider({ advance, children }: { advance: () => void; children: ReactNode }) {
  return <DeckAdvanceContext.Provider value={advance}>{children}</DeckAdvanceContext.Provider>
}

/** Programmatically advance one slide (e.g. after a timed story beat). */
export function useDeckAdvance(): () => void {
  const fn = useContext(DeckAdvanceContext)
  return fn ?? (() => {})
}
