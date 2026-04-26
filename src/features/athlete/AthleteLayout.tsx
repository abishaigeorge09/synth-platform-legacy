import { Outlet, useNavigate } from 'react-router-dom'
import { THEME } from '../../lib/theme'
import { AthleteBottomTabs } from './components/AthleteBottomTabs'
import { CommandPalette } from '../../shared/layout/CommandPalette'
import { AthleteSidebar } from '../../shared/layout/AthleteSidebar'

/**
 * Athlete-side layout. On tablet/desktop (≥ md) shows a horizontal top nav.
 * On mobile (< md) the top nav is replaced by a fixed bottom tab bar.
 */
export function AthleteLayout() {
  const navigate = useNavigate()
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden md:flex-row" style={{ background: 'var(--bg-surface)' }}>
      {/* Phase 20 — skip link for keyboard users (athlete side) */}
      <a
        href="#athlete-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold focus:shadow-lg"
        style={{
          background: 'var(--bg-primary)',
          color: THEME.primary,
          fontFamily: THEME.fontMono,
          outline: `2px solid ${THEME.primary}`,
          outlineOffset: '2px',
        }}
      >
        Skip to content
      </a>

      <AthleteSidebar />

      {/* Mobile brand bar (logo only, no nav) */}
      <header
        className="flex shrink-0 items-center justify-between border-b px-5 py-3 md:hidden"
        style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="synth — go to landing"
          className="text-[20px] font-semibold leading-none"
          style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
        >
          synth<span style={{ color: THEME.accent }}>.</span>
          <span
            className="ml-2 text-[9px] uppercase tracking-[0.18em]"
            style={{ color: THEME.textMuted }}
          >
            Athlete
          </span>
        </button>
      </header>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <main id="athlete-main-content" className="synth-scroll flex-1 overflow-y-auto pb-[86px] md:pb-0">
          <Outlet />
        </main>
      </div>

      <AthleteBottomTabs />

      {/* Phase 22 — command palette (⌘K / Ctrl+K) for athlete surfaces.
          Same infrastructure as the coach palette but scoped to athlete
          navigation + a "Switch to coach view" action. */}
      <CommandPalette mode="athlete" />
    </div>
  )
}
