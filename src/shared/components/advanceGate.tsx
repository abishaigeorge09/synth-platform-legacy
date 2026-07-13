/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

type AdvanceGate = {
  blocked: boolean
  setBlocked: (blocked: boolean) => void
}

const AdvanceGateContext = createContext<AdvanceGate | null>(null)

export function AdvanceGateProvider({ children }: { children: React.ReactNode }) {
  const [blocked, setBlockedState] = useState(false)
  const setBlocked = useCallback((v: boolean) => setBlockedState(v), [])
  const value = useMemo(() => ({ blocked, setBlocked }), [blocked, setBlocked])
  return <AdvanceGateContext.Provider value={value}>{children}</AdvanceGateContext.Provider>
}

export function useAdvanceGate() {
  const ctx = useContext(AdvanceGateContext)
  if (!ctx) throw new Error('useAdvanceGate must be used within AdvanceGateProvider')
  return ctx
}

