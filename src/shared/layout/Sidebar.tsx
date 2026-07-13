import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, type ComponentType, type ReactNode } from 'react'
import { THEME } from '@lib/theme'
import { useAlerts, useActivity } from '@shared/data/queries'
import { useUiStore } from '@shared/store/useUiStore'
import { useNotificationStore } from '@shared/store/useNotificationStore'
import { useTeamStore } from '@shared/store/useTeamStore'
import { COACH_DEMO_SQUADS, SEED_TEAM_CAL_MENS } from '@shared/data/seeds'
import {
  DashboardIllustration,
  AthletesIllustration,
  SourcesIllustration,
  AddToolIllustration,
  SynthAiIllustration,
  SettingsIllustration,
} from '@shared/illustrations/sidebarIllustrations'
import { COACH_TOOLS } from '@surfaces/webapp/coach/tools/toolRegistry'
import { prefetchRoute } from '@app/routePrefetch'

type NavItem = {
  to: string
  label: string
  Glyph: ComponentType<{ size?: number; muted?: boolean }>
}

const PRIMARY_NAV: NavItem[] = [
  { to: '/coach/dashboard', label: 'Dashboard', Glyph: DashboardIllustration },
  { to: '/coach/athletes', label: 'Athletes', Glyph: AthletesIllustration },
]

const SOURCES_NAV: NavItem[] = [
  { to: '/coach/sources/connectors', label: 'Connectors', Glyph: SourcesIllustration },
  { to: '/coach/sources/data-view', label: 'Data View', Glyph: SourcesIllustration },
]

// Phase 16 — Custom Tools nav is derived from the ToolRegistry. Adding a new
// tool is one entry in toolRegistry.tsx + one illustration; the sidebar picks
// it up automatically.
const TOOLS_NAV: NavItem[] = COACH_TOOLS.map((tool) => ({
  to: tool.absolutePath,
  label: tool.label,
  Glyph: tool.Glyph,
}))

/**
 * Desktop-only wrapper around SidebarContent. Hidden below 768 px; on mobile
 * the same SidebarContent is rendered inside MobileSidebarDrawer.
 */
export function Sidebar() {
  return (
    <aside
      aria-label="Coach sidebar"
      className="hidden h-full w-[260px] shrink-0 flex-col border-r md:flex"
      style={{
        background: 'var(--bg-primary, #FFFFFF)',
        borderColor: 'var(--border-default, #E4E4E7)',
        fontFamily: THEME.fontSans,
      }}
    >
      <SidebarContent variant="desktop" />
    </aside>
  )
}

export function NotificationBell() {
  const { data: alerts } = useAlerts()
  const { data: activity } = useActivity()
  const readIds = useNotificationStore((s) => s.readIds)
  const openPanel = useNotificationStore((s) => s.openPanel)

  const allIds = [...(alerts?.map((a) => a.id) ?? []), ...(activity?.map((a) => a.id) ?? [])]
  const unreadCount = allIds.filter((id) => !readIds.has(id)).length
  const hasDanger = alerts?.some((a) => a.severity === 'danger' && !readIds.has(a.id)) ?? false

  return (
    <div className="pointer-events-auto relative">
      <button
        type="button"
        onClick={openPanel}
        aria-label={`Notifications: ${unreadCount} unread`}
        className="flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-colors hover:bg-[var(--bg-surface)]"
        style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textPrimary }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[9px] font-bold"
            style={{
              background: hasDanger ? THEME.red : THEME.amber,
              color: THEME.white,
              fontFamily: THEME.fontMono,
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  )
}

export function CoachTopRightProfileButton() {
  const hideTopRightControls = useUiStore((s) => s.hideTopRightControls)
  const openCoachProfile = useUiStore((s) => s.openCoachProfile)
  if (hideTopRightControls) return null
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[50] hidden items-center gap-2 md:flex">
      <NotificationBell />
      <button
        type="button"
        onClick={openCoachProfile}
        aria-label="Open coach profile"
        className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-colors hover:bg-[var(--bg-surface)]"
        style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textPrimary }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>
    </div>
  )
}

/**
 * The actual navigation content — shared between desktop Sidebar and the
 * mobile drawer. `variant` is only used to namespace the active-indicator
 * layoutId so Framer Motion doesn't see duplicate IDs when both surfaces
 * are mounted at once.
 */
export function SidebarContent({
  variant,
  onNavigate,
}: {
  variant: 'desktop' | 'drawer'
  onNavigate?: () => void
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const openAgent = useUiStore((s) => s.openAgentModal)
  const openCommandPalette = useUiStore((s) => s.openCommandPalette)
  const openRequestTool = useUiStore((s) => s.openRequestTool)
  const closeMobileDrawer = useUiStore((s) => s.closeMobileDrawer)
  const team = useTeamStore((s) => s.activeTeam)
  const setActiveTeam = useTeamStore((s) => s.setActiveTeam)
  const sourcesActive = location.pathname.startsWith('/coach/sources')
  // Open by default when on a Sources route, and auto-open whenever the
  // user navigates *into* one. After that the user owns the toggle — they
  // can collapse it even while viewing /coach/sources/*. Uses the React
  // "adjust state during render" pattern (compare prev to current) instead
  // of a syncing effect.
  const [sourcesOpen, setSourcesOpen] = useState(sourcesActive)
  const [prevSourcesActive, setPrevSourcesActive] = useState(sourcesActive)
  if (sourcesActive !== prevSourcesActive) {
    setPrevSourcesActive(sourcesActive)
    if (sourcesActive) setSourcesOpen(true)
  }

  const afterNavigate = () => {
    onNavigate?.()
    if (variant === 'drawer') closeMobileDrawer()
  }

  const handleAgent = () => {
    openAgent()
    afterNavigate()
  }

  // Phase 17 — "Add tool" now opens the global command palette filtered to
  // the Custom Tools section (plus "coming soon" placeholders for sport-
  // specific tools that haven't shipped yet). The palette itself also
  // listens for Cmd+K / Ctrl+K from anywhere in the coach surface.
  const handleAddTool = () => {
    openCommandPalette()
    afterNavigate()
  }

  const handleRequestTool = () => {
    openRequestTool()
    afterNavigate()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo → landing */}
      <button
        type="button"
        onClick={() => {
          navigate('/')
          afterNavigate()
        }}
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
      <div
        className="mx-4 mb-4 rounded-lg border px-3 py-2"
        style={{ borderColor: THEME.border, background: THEME.light }}
      >
        <div
          className="text-[9px] uppercase tracking-[0.16em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          Active team
        </div>
        <div className="mt-0.5 text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
          {team.name}
        </div>
        <div
          className="text-[10px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
        >
          {team.sport} — {team.inviteCode}
        </div>
        <div
          className="mt-2.5 flex gap-0.5 rounded-lg p-0.5"
          style={{ background: THEME.border }}
          role="group"
          aria-label="Switch demo squad"
        >
          {COACH_DEMO_SQUADS.map((squad) => {
            const active = squad.id === team.id
            return (
              <button
                key={squad.id}
                type="button"
                onClick={() => {
                  if (active) return
                  setActiveTeam(squad)
                  // Avoid stranding the user on a route that's scoped to the
                  // previous team (e.g. /coach/athletes/<old-team-athlete-id>).
                  navigate('/coach/dashboard')
                  afterNavigate()
                }}
                className="min-w-0 flex-1 rounded-md px-2 py-1.5 text-center text-[11px] font-semibold transition-colors"
                style={{
                  fontFamily: THEME.fontMono,
                  background: active ? 'var(--bg-primary)' : 'transparent',
                  color: active ? THEME.primary : THEME.textSecondary,
                  boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : undefined,
                }}
              >
                {squad.id === SEED_TEAM_CAL_MENS.id ? "Men's" : "Women's"}
              </button>
            )
          })}
        </div>
      </div>

      <nav aria-label="Coach navigation">
        <NavGroup
          label="Overview"
          items={PRIMARY_NAV}
          variant={variant}
          afterNavigate={afterNavigate}
          footer={
            <SourcesParentRow
              variant={variant}
              active={sourcesActive}
              open={sourcesOpen}
              onToggle={() => {
                if (!sourcesOpen) {
                  setSourcesOpen(true)
                  navigate('/coach/sources/connectors')
                  afterNavigate()
                  return
                }
                setSourcesOpen(false)
              }}
              afterNavigate={afterNavigate}
            />
          }
        />

        <NavGroup
          label="Custom Tools"
          items={TOOLS_NAV}
          variant={variant}
          afterNavigate={afterNavigate}
          footer={
            <div className="grid gap-1">
              <button
                type="button"
                onClick={handleAddTool}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--bg-surface-raised)]"
                style={{ color: THEME.textSecondary }}
              >
                <AddToolIllustration size={22} muted />
                <span className="text-[13px]">Add tool</span>
                <span
                  className="ml-auto rounded border px-1.5 py-0.5 text-[9px] font-semibold"
                  style={{
                    borderColor: THEME.border,
                    color: THEME.textMuted,
                    fontFamily: THEME.fontMono,
                  }}
                >
                  ⌘K
                </span>
              </button>

              <button
                type="button"
                onClick={handleRequestTool}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--bg-surface-raised)]"
                style={{ color: THEME.textSecondary }}
              >
                <AddToolIllustration size={22} muted />
                <span className="text-[13px]">Request a tool</span>
              </button>
            </div>
          }
        />
      </nav>

      {/* Bottom pinned section (synth. Agent above Settings) */}
      <div className="mt-auto">
        <div className="px-4 pb-2">
          <NavRow
            to="/coach/ai"
            label="synth. AI"
            Glyph={SynthAiIllustration}
            variant={variant}
            afterNavigate={afterNavigate}
            accent
          />
        </div>

        {/* synth. Agent — modal trigger (pinned near bottom) */}
        <div className="px-4 pb-3">
          <button
            type="button"
            onClick={handleAgent}
            aria-label="Open synth Agent"
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all"
            style={{
              background: THEME.primaryDarker,
              color: THEME.white,
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.12) inset, 0 4px 20px rgba(4,120,87,0.25)',
            }}
          >
            <AgentPulseGlyph />
            <div className="flex-1">
              <div className="text-[13px] font-semibold">synth. Agent</div>
              <div className="text-[10px] opacity-80" style={{ fontFamily: THEME.fontMono }}>
                Connectors & sync
              </div>
            </div>
          </button>
        </div>

        <div className="border-t" style={{ borderColor: THEME.border }}>
          <div className="p-4">
            <NavRow
              to="/coach/settings"
              label="Settings"
              Glyph={SettingsIllustration}
              variant={variant}
              afterNavigate={afterNavigate}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function SourcesParentRow({
  variant,
  active,
  open,
  onToggle,
  afterNavigate,
}: {
  variant: 'desktop' | 'drawer'
  active: boolean
  open: boolean
  onToggle: () => void
  afterNavigate: () => void
}) {
  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors hover:bg-[var(--bg-surface-raised)]"
        style={{
          color: active ? THEME.primary : THEME.textPrimary,
          background: active ? 'rgba(5,150,105,0.08)' : 'transparent',
          borderLeft: `2px solid ${active ? THEME.primary : 'transparent'}`,
        }}
      >
        <SourcesIllustration size={22} muted={!active} />
        <span>Sources</span>
        <span className="ml-auto text-[10px]" style={{ fontFamily: THEME.fontMono }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div className="mt-1 grid gap-0.5 border-l pl-2 ml-5" style={{ borderColor: THEME.border }}>
          {SOURCES_NAV.map((item) => (
            <NavRow key={item.to} {...item} variant={variant} afterNavigate={afterNavigate} />
          ))}
        </div>
      )}
    </div>
  )
}

function NavGroup({
  label,
  items,
  footer,
  variant,
  afterNavigate,
}: {
  label: string
  items: NavItem[]
  footer?: ReactNode
  variant: 'desktop' | 'drawer'
  afterNavigate: () => void
}) {
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
          <NavRow key={item.to} {...item} variant={variant} afterNavigate={afterNavigate} />
        ))}
        {footer}
      </div>
    </div>
  )
}

function NavRow({
  to,
  label,
  Glyph,
  accent,
  variant,
  afterNavigate,
}: NavItem & {
  accent?: boolean
  variant: 'desktop' | 'drawer'
  afterNavigate: () => void
}) {
  const activeLayoutId = `nav-active-bar-${variant}`
  const handlePrefetch = () => prefetchRoute(to)
  return (
    <NavLink
      to={to}
      onClick={afterNavigate}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors',
          isActive ? 'font-semibold' : 'font-medium hover:bg-[var(--bg-surface-raised)]',
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
              layoutId={activeLayoutId}
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
