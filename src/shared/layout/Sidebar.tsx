import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { THEME } from '../../lib/theme'
import { useUiStore } from '../store/useUiStore'
import { useTeamStore } from '../store/useTeamStore'
import {
  DashboardIllustration,
  AthletesIllustration,
  SourcesIllustration,
  LineupsIllustration,
  SessionTimerIllustration,
  AddToolIllustration,
  SynthAiIllustration,
  SettingsIllustration,
} from '../illustrations/sidebarIllustrations'
import type { ComponentType } from 'react'

type NavItem = {
  to: string
  label: string
  Glyph: ComponentType<{ size?: number; muted?: boolean }>
}

const PRIMARY_NAV: NavItem[] = [
  { to: '/coach/dashboard', label: 'Dashboard', Glyph: DashboardIllustration },
  { to: '/coach/athletes', label: 'Athletes', Glyph: AthletesIllustration },
  { to: '/coach/sources', label: 'Sources', Glyph: SourcesIllustration },
]

const TOOLS_NAV: NavItem[] = [
  { to: '/coach/tools/lineups', label: 'Lineups', Glyph: LineupsIllustration },
  { to: '/coach/tools/session-timer', label: 'Session Timer', Glyph: SessionTimerIllustration },
]

export function Sidebar() {
  const navigate = useNavigate()
  const openAgent = useUiStore((s) => s.openAgentModal)
  const team = useTeamStore((s) => s.activeTeam)

  return (
    <aside
      className="flex h-full w-[260px] shrink-0 flex-col border-r"
      style={{
        background: THEME.white,
        borderColor: THEME.border,
        fontFamily: THEME.fontSans,
      }}
    >
      {/* Logo → landing */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-6 py-5 text-left transition-opacity hover:opacity-80"
      >
        <span
          className="text-[22px] font-semibold leading-none"
          style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
        >
          synth
          <span style={{ color: THEME.accent }}>.</span>
        </span>
      </button>

      {/* Team badge */}
      <div className="mx-4 mb-4 rounded-lg border px-3 py-2" style={{ borderColor: THEME.border, background: THEME.light }}>
        <div className="text-[9px] uppercase tracking-[0.16em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          Active team
        </div>
        <div className="mt-0.5 text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
          {team.name}
        </div>
        <div className="text-[10px]" style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}>
          {team.sport} · {team.inviteCode}
        </div>
      </div>

      <NavGroup label="Overview" items={PRIMARY_NAV} />

      <NavGroup
        label="Custom Tools"
        items={TOOLS_NAV}
        footer={
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-zinc-100"
            style={{ color: THEME.textSecondary }}
          >
            <AddToolIllustration size={22} muted />
            <span className="text-[13px]">Add tool</span>
          </button>
        }
      />

      {/* synth. AI */}
      <div className="mt-2 px-4">
        <NavRow
          to="/coach/ai"
          label="synth. AI"
          Glyph={SynthAiIllustration}
          accent
        />
      </div>

      {/* synth. Agent — modal trigger */}
      <div className="mt-2 px-4">
        <button
          type="button"
          onClick={openAgent}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all"
          style={{
            background: THEME.primaryDarker,
            color: THEME.white,
            boxShadow: '0 1px 0 rgba(255,255,255,0.12) inset, 0 4px 20px rgba(4,120,87,0.25)',
          }}
        >
          <AgentPulseGlyph />
          <div className="flex-1">
            <div className="text-[13px] font-semibold">synth. Agent</div>
            <div className="text-[10px] opacity-80" style={{ fontFamily: THEME.fontMono }}>
              Connectors · scans · reports
            </div>
          </div>
        </button>
      </div>

      <div className="mt-auto border-t" style={{ borderColor: THEME.border }}>
        <div className="p-4">
          <NavRow to="/coach/settings" label="Settings" Glyph={SettingsIllustration} />
        </div>
      </div>
    </aside>
  )
}

function NavGroup({ label, items, footer }: { label: string; items: NavItem[]; footer?: React.ReactNode }) {
  return (
    <div className="mt-3 px-4">
      <div
        className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        {label}
      </div>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavRow key={item.to} {...item} />
        ))}
        {footer}
      </div>
    </div>
  )
}

function NavRow({ to, label, Glyph, accent }: NavItem & { accent?: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors',
          isActive
            ? 'font-semibold'
            : 'font-medium hover:bg-zinc-100',
        ].join(' ')
      }
      style={({ isActive }) => ({
        color: isActive ? THEME.primary : accent ? THEME.primary : THEME.textPrimary,
        background: isActive ? 'rgba(5,150,105,0.08)' : 'transparent',
      })}
    >
      {({ isActive }) => (
        <>
          <Glyph size={22} muted={!isActive && !accent} />
          <span>{label}</span>
          {isActive && (
            <motion.span
              layoutId="nav-active-bar"
              className="ml-auto h-4 w-0.5 rounded-full"
              style={{ background: THEME.primary }}
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            />
          )}
        </>
      )}
    </NavLink>
  )
}

function AgentPulseGlyph() {
  return (
    <div className="relative">
      <motion.span
        animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        className="absolute inset-0 rounded-full"
        style={{ background: THEME.accent }}
      />
      <span
        className="relative block h-2.5 w-2.5 rounded-full"
        style={{ background: THEME.accent }}
      />
    </div>
  )
}
