import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ComponentType } from 'react'
import { THEME } from '../../../lib/theme'
import { prefetchRoute } from '../../../app/routePrefetch'
import {
  DashboardIllustration,
  AthletesIllustration,
  SessionTimerIllustration,
  SynthAiIllustration,
  LineupsIllustration,
  SourcesIllustration,
  SettingsIllustration,
} from '../../../shared/illustrations/sidebarIllustrations'
import { AthleteMoreSheet } from './AthleteMoreSheet'

type TabItem = {
  to: string
  label: string
  Glyph: ComponentType<{ size?: number; muted?: boolean }>
}

const PRIMARY_TABS: TabItem[] = [
  { to: '/athlete/today', label: 'Today', Glyph: DashboardIllustration },
  { to: '/athlete/progress', label: 'Progress', Glyph: AthletesIllustration },
  { to: '/athlete/record', label: 'Record', Glyph: SessionTimerIllustration },
  { to: '/athlete/chat', label: 'AI', Glyph: SynthAiIllustration },
]

const MORE_TABS: TabItem[] = [
  { to: '/athlete/sessions', label: 'Sessions', Glyph: SessionTimerIllustration },
  { to: '/athlete/lineups', label: 'Lineups', Glyph: LineupsIllustration },
  { to: '/athlete/workbook', label: 'Erg Workbook', Glyph: DashboardIllustration },
  { to: '/athlete/sources/connectors', label: 'Connectors', Glyph: SourcesIllustration },
  { to: '/athlete/sources/data-view', label: 'Data View', Glyph: SourcesIllustration },
  { to: '/athlete/settings', label: 'Settings', Glyph: SettingsIllustration },
]

export function AthleteBottomTabs() {
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()
  const moreActive = MORE_TABS.some((t) => location.pathname.startsWith(t.to))

  return (
    <>
      <nav
        aria-label="Athlete tabs"
        className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t md:hidden"
        style={{
          background: THEME.white,
          borderColor: THEME.border,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxShadow: '0 -10px 30px -18px rgba(24,24,27,0.25)',
        }}
      >
        {PRIMARY_TABS.map((t) => (
          <TabLink key={t.to} item={t} />
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-label="More — Lineups, Sources, Settings"
          aria-expanded={moreOpen}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5"
          style={{
            color: moreActive ? THEME.primary : THEME.textSecondary,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            <circle cx="6" cy="12" r="1.8" fill={moreActive ? THEME.primary : THEME.textMuted} />
            <circle cx="12" cy="12" r="1.8" fill={moreActive ? THEME.primary : THEME.textMuted} />
            <circle cx="18" cy="12" r="1.8" fill={moreActive ? THEME.primary : THEME.textMuted} />
          </svg>
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.1em]"
            style={{ fontFamily: THEME.fontMono }}
          >
            More
          </span>
        </button>
      </nav>

      <AthleteMoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        items={MORE_TABS}
      />
    </>
  )
}

function TabLink({ item }: { item: TabItem }) {
  return (
    <NavLink
      to={item.to}
      onMouseEnter={() => prefetchRoute(item.to)}
      onFocus={() => prefetchRoute(item.to)}
      className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5"
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="athlete-tab-active"
              className="absolute left-4 right-4 top-0 h-0.5 rounded-full"
              style={{ background: THEME.primary }}
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            />
          )}
          <item.Glyph size={22} muted={!isActive} />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.1em]"
            style={{
              fontFamily: THEME.fontMono,
              color: isActive ? THEME.primary : THEME.textSecondary,
            }}
          >
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  )
}
