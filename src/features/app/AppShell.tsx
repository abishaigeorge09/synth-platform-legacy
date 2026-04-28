import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAppAuthStore } from './store/useAppAuthStore'
import { APP_THEME } from './lib/theme'

export function AppShell() {
  const hydrate = useAppAuthStore((s) => s.hydrate)
  const isReady = useAppAuthStore((s) => s.isReady)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useEffect(() => {
    document.body.setAttribute('data-surface', 'app')
    return () => {
      document.body.removeAttribute('data-surface')
    }
  }, [])

  return (
    <div className="app-shell-root">
      <div className="app-shell-frame">
        {isReady ? <Outlet /> : <AppShellSplash />}
      </div>
    </div>
  )
}

function AppShellSplash() {
  return (
    <div
      className="flex flex-1 items-center justify-center"
      style={{ background: APP_THEME.canvas }}
    >
      <span
        className="text-[20px] font-semibold"
        style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textFaint }}
      >
        synth<span style={{ color: APP_THEME.brand }}>.</span>
      </span>
    </div>
  )
}
