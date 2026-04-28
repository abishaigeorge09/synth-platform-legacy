import { useNavigate } from 'react-router-dom'
import { THEME } from '../../lib/theme'
import { useUiStore } from '../store/useUiStore'
import { useTeamStore } from '../store/useTeamStore'
import { NotificationBell } from './Sidebar'

/**
 * Mobile-only 56 px top bar: hamburger on the left, brand wordmark center,
 * active team label right. Only visible below md (768 px). Always mounted
 * inside CoachLayout — the desktop sidebar replaces it at wider widths.
 */
export function MobileTopBar() {
  const navigate = useNavigate()
  const openDrawer = useUiStore((s) => s.openMobileDrawer)
  const team = useTeamStore((s) => s.activeTeam)

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between border-b px-3 md:hidden"
      style={{
        background: 'var(--bg-primary)',
        borderColor: THEME.border,
        fontFamily: THEME.fontSans,
      }}
    >
      {/* Hamburger */}
      <button
        type="button"
        onClick={openDrawer}
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-surface-raised)]"
        style={{ color: THEME.textPrimary }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      {/* Brand */}
      <button
        type="button"
        onClick={() => navigate('/coach/dashboard')}
        aria-label="synth — go to dashboard"
        className="text-[18px] font-semibold leading-none"
        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
      >
        synth<span style={{ color: THEME.accent }}>.</span>
      </button>

      {/* Right cluster — notifications + team short label */}
      <div className="flex items-center gap-2">
        <NotificationBell />
        <div className="max-w-[100px] text-right">
          <div
            className="truncate text-[10px] font-semibold uppercase tracking-[0.12em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            {team.name.split(' ')[0]}
          </div>
          <div
            className="truncate text-[9px]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
          >
            {team.sport}
          </div>
        </div>
      </div>
    </header>
  )
}
