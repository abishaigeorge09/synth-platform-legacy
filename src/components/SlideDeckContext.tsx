/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react'

export type SlideDeckMeta = {
  /** Zero-based index in the current deck (main or appendix). */
  currentIndex: number
  slideCount: number
}

const SlideDeckContext = createContext<SlideDeckMeta | null>(null)

export function SlideDeckProvider({ value, children }: { value: SlideDeckMeta; children: ReactNode }) {
  return <SlideDeckContext.Provider value={value}>{children}</SlideDeckContext.Provider>
}

/** Page counter for TopNav — matches footer “n / total”. */
export function useSlideDeckMeta(): SlideDeckMeta {
  const ctx = useContext(SlideDeckContext)
  if (!ctx) {
    return { currentIndex: 0, slideCount: 1 }
  }
  return ctx
}
