import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ComponentType } from 'react'
import { THEME } from '@lib/theme'
import { prefetchRoute } from '@app/routePrefetch'
import {
  AthletesIllustration,
  DashboardIllustration,
  LineupsIllustration,
  SessionTimerIllustration,
  SettingsIllustration,
  SourcesIllustration,
  SynthAiIllustration,
} from '@shared/illustrations/sidebarIllustrations'
import { DEMO_ATHLETE_PROFILE, TODAY_META } from '@surfaces/webapp/athlete/data/demoAthleteData'

type NavItem = {
  to: string
  label: string
  Glyph: ComponentType<{ size?: number; muted?: boolean }>
  badge?: string
}

const OVERVIEW_NAV: NavItem[] = [
  { to: '/athlete/today', label: 'Today', Glyph: DashboardIllustration },
  { to: '/athlete/progress', label: 'My Progress', Glyph: AthletesIllustration },
  { to: '/athlete/record', label: 'Record', Glyph: SessionTimerIllustration },
  { to: '/athlete/workbook', label: 'Erg Workbook', Glyph: DashboardIllustration },
]

const SOURCES_NAV: NavItem[] = [
  { to: '/athlete/sources/connectors', label: 'Connectors', Glyph: SourcesIllustration },
  { to: '/athlete/sources/data-view', label: 'Data View', Glyph: SourcesIllustration },
]

const TOOLS_NAV: NavItem[] = [
  { to: '/athlete/sessions', label: 'Sessions', Glyph: SessionTimerIllustration },
  { to: '/athlete/lineups', label: 'Lineups', Glyph: LineupsIllustration, badge: 'New' },
]

export function AthleteSidebar() {
  return (
    <aside
      aria-label="Athlete sidebar"
      className="relative hidden h-full w-[280px] shrink-0 flex-col border-r md:flex"
      style={{
        background: THEME.darkDeep,
        borderColor: 'rgba(255,255,255,0.06)',
        fontFamily: THEME.fontSans,
      }}
    >
      <AthleteSidebarContent />
      {/* Subtle gradient right-edge to soften the dark/light cut */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 1,
          background: 'linear-gradient(to bottom, rgba(16,185,129,0.3), rgba(16,185,129,0.05), transparent)',
          pointerEvents: 'none',
        }}
      />
    </aside>
  )
}

function AthleteSidebarContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const sourcesActive = location.pathname.startsWith('/athlete/sources')

  const goLanding = () => navigate('/')

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <button
        type="button"
        onClick={goLanding}
        className="flex items-center gap-2 px-6 py-5 text-left transition-opacity hover:opacity-80"
      >
        <span className="text-[18px] font-semibold leading-none" style={{ fontFamily: THEME.fontMono, color: THEME.white }}>
          synth<span style={{ color: THEME.accent }}>.</span>
        </span>
        <span
          className="text-[9px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: THEME.fontMono, color: 'rgba(228,228,231,0.7)' }}
        >
          Athlete
        </span>
      </button>

      {/* synth AI entry */}
      <div className="px-4">
        <NavLink
          to="/athlete/chat"
          onMouseEnter={() => prefetchRoute('/athlete/chat')}
          onFocus={() => prefetchRoute('/athlete/chat')}
          className={({ isActive }) =>
            `relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
              isActive ? '' : 'hover:bg-white/5'
            }`
          }
          style={({ isActive }) => ({
            color: isActive ? THEME.white : 'rgba(228,228,231,0.78)',
          })}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="athlete-sidebar-active"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.35)' }}
                  transition={{ type: 'spring', stiffness: 520, damping: 34 }}
                />
              )}
              <span className="relative">
                <SynthAiIllustration size={22} muted={!isActive} />
              </span>
              <span className="relative flex items-center gap-2 text-[12px] font-semibold" style={{ fontFamily: THEME.fontMono }}>
                synth. AI
                <span className="h-2 w-2 rounded-full" style={{ background: THEME.accent }} />
              </span>
            </>
          )}
        </NavLink>
      </div>

      {/* Team card */}
      <div
        className="mx-4 mt-4 rounded-2xl border px-4 py-3"
        style={{
          borderColor: 'rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.03)',
        }}
      >
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: 'rgba(228,228,231,0.6)' }}>
          {DEMO_ATHLETE_PROFILE.team}
        </div>
        <div className="mt-1 text-[15px] font-bold" style={{ color: THEME.white }}>
          {DEMO_ATHLETE_PROFILE.name}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[12px]" style={{ fontFamily: THEME.fontMono, color: 'rgba(228,228,231,0.7)' }}>
          {DEMO_ATHLETE_PROFILE.year} • {DEMO_ATHLETE_PROFILE.side}
          <span style={{ color: 'rgba(228,228,231,0.5)' }}> • </span>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: THEME.accent }} />
          Last sync: {TODAY_META.dateLabel}
        </div>
      </div>

      {/* Nav groups */}
      <div className="mt-5 flex-1 overflow-auto px-4 pb-4">
        <NavGroup title="Overview" items={OVERVIEW_NAV} />
        <div className="mt-5">
          <NavGroup title="Sources" items={SOURCES_NAV} defaultOpen={sourcesActive} />
        </div>
        <div className="mt-5">
          <NavGroup title="Custom Tools" items={TOOLS_NAV} />
        </div>
      </div>

      {/* Settings pinned bottom */}
      <div className="px-4 pb-5 pt-3">
        <NavLink
          to="/athlete/settings"
          onMouseEnter={() => prefetchRoute('/athlete/settings')}
          onFocus={() => prefetchRoute('/athlete/settings')}
          className={({ isActive }) =>
            `relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
              isActive ? '' : 'hover:bg-white/5'
            }`
          }
          style={({ isActive }) => ({
            color: isActive ? THEME.white : 'rgba(228,228,231,0.78)',
          })}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="athlete-sidebar-active"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.35)' }}
                  transition={{ type: 'spring', stiffness: 520, damping: 34 }}
                />
              )}
              <span className="relative">
                <SettingsIllustration size={22} muted={!isActive} />
              </span>
              <span className="relative text-[12px] font-semibold" style={{ fontFamily: THEME.fontMono }}>
                Settings
              </span>
            </>
          )}
        </NavLink>
      </div>
    </div>
  )
}

function NavGroup({
  title,
  items,
}: {
  title: string
  items: NavItem[]
  defaultOpen?: boolean
}) {
  return (
    <div>
      <div
        className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: 'rgba(228,228,231,0.45)' }}
      >
        {title}
      </div>
      <div className="mt-2 flex flex-col gap-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            onMouseEnter={() => prefetchRoute(it.to)}
            onFocus={() => prefetchRoute(it.to)}
            className={({ isActive }) =>
              `relative flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                isActive ? '' : 'hover:bg-white/5'
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? THEME.white : 'rgba(228,228,231,0.72)',
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="athlete-sidebar-active"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.35)' }}
                    transition={{ type: 'spring', stiffness: 520, damping: 34 }}
                  />
                )}
                <span className="relative flex items-center gap-3">
                  <it.Glyph size={22} muted={!isActive} />
                  <span className="text-[12px] font-semibold" style={{ fontFamily: THEME.fontMono }}>
                    {it.label}
                  </span>
                </span>
                {it.badge && (
                  <span
                    className="relative rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em]"
                    style={{
                      borderColor: 'rgba(16,185,129,0.35)',
                      color: THEME.accent,
                      background: 'rgba(16,185,129,0.08)',
                      fontFamily: THEME.fontMono,
                    }}
                  >
                    {it.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

