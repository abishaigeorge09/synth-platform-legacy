import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Home, Boxes, Plus, Sparkles, MoreHorizontal, Activity } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { useUiStore } from '../../../shared/store/useUiStore'

export type FloatingTabItem = {
  key: string
  label: string
  /** Either `to` (route) or `onClick` (custom action). */
  to?: string
  onClick?: () => void
  match: (pathname: string) => boolean
  icon: ReactNode
}

type Props = {
  tabs: FloatingTabItem[]
  capture: { to: string; ariaLabel: string }
}

export function FloatingTabBar({ tabs, capture }: Props) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-center"
      style={{ bottom: 'max(env(safe-area-inset-bottom), 16px)' }}
    >
      <GlassCapsule>
        <ul className="flex items-center gap-1.5">
          {tabs.map((tab, i) => {
            // Capture is inserted between tab[1] and tab[2] (visually centered)
            const showCapture = i === Math.floor(tabs.length / 2)
            return (
              <span key={tab.key} className="contents">
                {showCapture ? <CaptureCell key="capture" capture={capture} /> : null}
                <TabCell tab={tab} />
              </span>
            )
          })}
        </ul>
      </GlassCapsule>
    </div>
  )
}

function GlassCapsule({ children }: { children: ReactNode }) {
  return (
    <div
      className="pointer-events-auto"
      style={{
        height: 64,
        padding: 8,
        borderRadius: SYNTH.radius.capsule,
        // Dark navy-gray glass overlay so the bar reads against any backdrop —
        // cobalt canvas, white sheet, or candy card.
        background: 'rgba(15, 18, 42, 0.62)',
        backdropFilter: 'blur(28px) saturate(160%)',
        WebkitBackdropFilter: 'blur(28px) saturate(160%)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow:
          '0 14px 36px rgba(8,8,40,0.35), 0 2px 6px rgba(8,8,40,0.18), inset 0 1px 0 rgba(255,255,255,0.20)',
      }}
    >
      {children}
    </div>
  )
}

function TabCell({ tab }: { tab: FloatingTabItem }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const active = tab.match(pathname)

  const handle = () => {
    if (tab.onClick) tab.onClick()
    else if (tab.to) navigate(tab.to)
  }

  return (
    <li>
      <button
        type="button"
        onClick={handle}
        aria-label={tab.label}
        aria-current={active ? 'page' : undefined}
        className="relative flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          background: active ? 'rgba(255,255,255,0.16)' : 'transparent',
          border: active ? '1px solid rgba(255,255,255,0.22)' : '1px solid transparent',
          color: active ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
        }}
      >
        <motion.span whileTap={{ scale: 0.92 }} className="flex items-center justify-center">
          {tab.icon}
        </motion.span>
      </button>
    </li>
  )
}

function CaptureCell({ capture }: { capture: Props['capture'] }) {
  const navigate = useNavigate()
  return (
    <li>
      <motion.button
        type="button"
        onClick={() => navigate(capture.to)}
        aria-label={capture.ariaLabel}
        whileTap={{ scale: 0.93 }}
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          background: SYNTH.accentBlack,
          boxShadow: `${SYNTH.shadow.actionCircle}, inset 0 1px 0 rgba(255,255,255,0.08)`,
          color: SYNTH.inkOnBrand,
        }}
      >
        <Plus size={20} strokeWidth={2.6} />
      </motion.button>
    </li>
  )
}

function buildCoachTabs(onMoreClick: () => void, onHomeClick: () => void): FloatingTabItem[] {
  return [
    {
      key: 'home',
      label: 'Home',
      onClick: onHomeClick,
      match: (p) => p === '/app/coach/home' || p === '/app/coach',
      icon: <Home size={18} strokeWidth={2.2} />,
    },
    {
      key: 'tools',
      label: 'Tools',
      to: '/app/coach/tools',
      match: (p) => p.startsWith('/app/coach/tools') || p.startsWith('/app/coach/lineups'),
      icon: <Boxes size={18} strokeWidth={2.2} />,
    },
    {
      key: 'ai',
      label: 'AI',
      to: '/app/coach/ai',
      match: (p) => p.startsWith('/app/coach/ai'),
      icon: <Sparkles size={18} strokeWidth={2.2} />,
    },
    {
      key: 'more',
      label: 'More',
      onClick: onMoreClick,
      // Treat the secondary surfaces (roster/attention/sources/settings)
      // as "More-active" so the dot highlights when the user is on one.
      match: (p) =>
        p.startsWith('/app/coach/roster') ||
        p.startsWith('/app/coach/attention') ||
        p.startsWith('/app/coach/sources') ||
        p.startsWith('/app/coach/settings') ||
        p.startsWith('/app/coach/notes'),
      icon: <MoreHorizontal size={18} strokeWidth={2.2} />,
    },
  ]
}

const ATHLETE_TABS_INTERNAL: FloatingTabItem[] = [
  {
    key: 'home',
    label: 'Home',
    to: '/app/athlete/home',
    match: (p) => p === '/app/athlete/home' || p === '/app/athlete',
    icon: <Home size={18} strokeWidth={2.2} />,
  },
  {
    key: 'erg',
    label: 'Erg',
    to: '/app/athlete/erg-pacer',
    match: (p) => p.startsWith('/app/athlete/erg-pacer'),
    icon: <ErgIcon />,
  },
  {
    key: 'telemetry',
    label: 'Data',
    to: '/app/athlete/telemetry',
    match: (p) => p.startsWith('/app/athlete/telemetry'),
    icon: <Activity size={18} strokeWidth={2.2} />,
  },
  {
    key: 'ai',
    label: 'AI',
    to: '/app/athlete/ai',
    match: (p) => p.startsWith('/app/athlete/ai'),
    icon: <Sparkles size={18} strokeWidth={2.2} />,
  },
  {
    key: 'more',
    label: 'More',
    to: '/app/athlete/settings',
    match: (p) =>
      p.startsWith('/app/athlete/settings') ||
      p.startsWith('/app/athlete/notes') ||
      p.startsWith('/app/athlete/sources') ||
      p.startsWith('/app/athlete/profile'),
    icon: <MoreHorizontal size={18} strokeWidth={2.2} />,
  },
]

export function CoachFloatingTabBar({ onMoreClick }: { onMoreClick: () => void }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const setHomePanelRequest = useUiStore((s) => s.setHomePanelRequest)

  const onHomeClick = () => {
    // Always request the dashboard panel (page 1) when Home is pressed
    setHomePanelRequest(1)
    if (pathname !== '/app/coach/home' && pathname !== '/app/coach') {
      navigate('/app/coach/home')
    }
  }

  return (
    <FloatingTabBar
      tabs={buildCoachTabs(onMoreClick, onHomeClick)}
      capture={{ to: '/app/coach/capture', ariaLabel: 'Capture' }}
    />
  )
}

export function AthleteFloatingTabBar() {
  return (
    <FloatingTabBar
      tabs={ATHLETE_TABS_INTERNAL}
      capture={{ to: '/app/athlete/capture', ariaLabel: 'Capture' }}
    />
  )
}

function ErgIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx={7} cy={12} r={3.4} stroke="currentColor" strokeWidth={2} />
      <path
        d="M10.4 12h7.4l-2 5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 6.5l4 2.4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}
