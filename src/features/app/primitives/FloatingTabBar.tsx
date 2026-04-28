import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Home, Bell, Plus, Sparkles, MoreHorizontal } from 'lucide-react'
import { SYNTH } from '../lib/theme'

export type FloatingTabItem = {
  key: string
  label: string
  to: string
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
        background: SYNTH.glass,
        backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        border: `1px solid ${SYNTH.glassBorder}`,
        boxShadow: `${SYNTH.shadow.glass}, inset 0 1px 0 ${SYNTH.glassInset}`,
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

  return (
    <li>
      <button
        type="button"
        onClick={() => navigate(tab.to)}
        aria-label={tab.label}
        aria-current={active ? 'page' : undefined}
        className="relative flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          background: active ? SYNTH.glassActive : 'transparent',
          border: active ? `1px solid ${SYNTH.glassBorder}` : '1px solid transparent',
          color: active ? SYNTH.inkOnBrand : SYNTH.inkOnBrandMuted,
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

const COACH_TABS_INTERNAL: FloatingTabItem[] = [
  {
    key: 'home',
    label: 'Home',
    to: '/app/coach/home',
    match: (p) => p === '/app/coach/home' || p === '/app/coach',
    icon: <Home size={18} strokeWidth={2.2} />,
  },
  {
    key: 'attention',
    label: 'Attention',
    to: '/app/coach/attention',
    match: (p) => p.startsWith('/app/coach/attention') || p.startsWith('/app/coach/athlete'),
    icon: <Bell size={18} strokeWidth={2.2} />,
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
    to: '/app/coach/settings',
    match: (p) =>
      p.startsWith('/app/coach/settings') ||
      p.startsWith('/app/coach/lineups') ||
      p.startsWith('/app/coach/notes') ||
      p.startsWith('/app/coach/sources'),
    icon: <MoreHorizontal size={18} strokeWidth={2.2} />,
  },
]

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
      p.startsWith('/app/athlete/sources'),
    icon: <MoreHorizontal size={18} strokeWidth={2.2} />,
  },
]

export function CoachFloatingTabBar() {
  return (
    <FloatingTabBar
      tabs={COACH_TABS_INTERNAL}
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
