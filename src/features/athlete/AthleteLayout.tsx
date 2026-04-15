import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { THEME } from '../../lib/theme'

/**
 * Athlete-side layout. A leaner top nav with the athlete's own surfaces.
 * Phase 7 will flesh out every inner page; this is the shell.
 */
export function AthleteLayout() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-dvh flex-col" style={{ background: THEME.light }}>
      <header
        className="flex items-center justify-between border-b px-6 py-3"
        style={{ borderColor: THEME.border, background: THEME.white }}
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-[20px] font-semibold"
          style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
        >
          synth<span style={{ color: THEME.accent }}>.</span>
          <span className="ml-2 text-[10px] uppercase tracking-[0.18em]" style={{ color: THEME.textMuted }}>
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
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
