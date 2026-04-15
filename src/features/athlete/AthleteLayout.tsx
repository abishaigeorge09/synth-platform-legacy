import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { THEME } from '../../lib/theme'
import { AthleteBottomTabs } from './components/AthleteBottomTabs'

/**
 * Athlete-side layout. On tablet/desktop (≥ md) shows a horizontal top nav.
 * On mobile (< md) the top nav is replaced by a fixed bottom tab bar.
 */
export function AthleteLayout() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-dvh flex-col" style={{ background: THEME.light }}>
      {/* Mobile brand bar (logo only, no nav) */}
      <header
        className="flex items-center justify-between border-b px-5 py-3 md:hidden"
        style={{ borderColor: THEME.border, background: THEME.white }}
      >
        <button
          type="button"
          onClick={() => navigate('/')}
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

      {/* Desktop/tablet top nav */}
      <header
        className="hidden items-center justify-between border-b px-6 py-3 md:flex"
        style={{ borderColor: THEME.border, background: THEME.white }}
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-[20px] font-semibold"
          style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
        >
          synth<span style={{ color: THEME.accent }}>.</span>
          <span
            className="ml-2 text-[10px] uppercase tracking-[0.18em]"
            style={{ color: THEME.textMuted }}
          >
            Athlete
          </span>
        </button>
        <nav className="flex items-center gap-5 text-[12px]" style={{ fontFamily: THEME.fontMono }}>
          {[
            { to: '/athlete/home', label: 'My Team' },
            { to: '/athlete/stats', label: 'My Stats' },
            { to: '/athlete/sessions', label: 'Sessions' },
            { to: '/athlete/lineups', label: 'Lineups' },
            { to: '/athlete/sources', label: 'Sources' },
            { to: '/athlete/ai', label: 'synth. AI' },
            { to: '/athlete/settings', label: 'Settings' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'font-semibold' : 'opacity-70 transition-opacity hover:opacity-100'
              }
              style={({ isActive }) => ({
                color: isActive ? THEME.primary : THEME.textPrimary,
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 pb-[86px] md:pb-0">
        <Outlet />
      </main>

      <AthleteBottomTabs />
    </div>
  )
}
