import { Home, Bell, Plus, Sparkles, MoreHorizontal } from 'lucide-react'
import { BottomTabBar, type BottomTabItem } from './BottomTabBar'

const COACH_TABS: BottomTabItem[] = [
  {
    key: 'home',
    label: 'Home',
    to: '/app/coach/home',
    match: (p) => p === '/app/coach/home' || p === '/app/coach',
    icon: <Home size={20} strokeWidth={2.2} />,
  },
  {
    key: 'attention',
    label: 'Attention',
    to: '/app/coach/attention',
    match: (p) => p.startsWith('/app/coach/attention') || p.startsWith('/app/coach/athlete'),
    icon: <Bell size={20} strokeWidth={2.2} />,
  },
  {
    key: 'capture',
    label: 'Capture',
    to: '/app/coach/capture',
    match: (p) => p.startsWith('/app/coach/capture'),
    icon: <Plus size={22} strokeWidth={2.6} />,
    primary: true,
  },
  {
    key: 'ai',
    label: 'AI',
    to: '/app/coach/ai',
    match: (p) => p.startsWith('/app/coach/ai'),
    icon: <Sparkles size={20} strokeWidth={2.2} />,
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
    icon: <MoreHorizontal size={20} strokeWidth={2.2} />,
  },
]

const ATHLETE_TABS: BottomTabItem[] = [
  {
    key: 'home',
    label: 'Home',
    to: '/app/athlete/home',
    match: (p) => p === '/app/athlete/home' || p === '/app/athlete',
    icon: <Home size={20} strokeWidth={2.2} />,
  },
  {
    key: 'capture',
    label: 'Capture',
    to: '/app/athlete/capture',
    match: (p) => p.startsWith('/app/athlete/capture'),
    icon: <Plus size={22} strokeWidth={2.6} />,
    primary: true,
  },
  {
    key: 'ai',
    label: 'AI',
    to: '/app/athlete/ai',
    match: (p) => p.startsWith('/app/athlete/ai'),
    icon: <Sparkles size={20} strokeWidth={2.2} />,
  },
  {
    key: 'erg',
    label: 'Erg',
    to: '/app/athlete/erg-pacer',
    match: (p) => p.startsWith('/app/athlete/erg-pacer'),
    icon: <ErgIcon />,
  },
  {
    key: 'more',
    label: 'More',
    to: '/app/athlete/settings',
    match: (p) =>
      p.startsWith('/app/athlete/settings') ||
      p.startsWith('/app/athlete/notes') ||
      p.startsWith('/app/athlete/sources'),
    icon: <MoreHorizontal size={20} strokeWidth={2.2} />,
  },
]

export function CoachTabBar() {
  return <BottomTabBar items={COACH_TABS} />
}

export function AthleteTabBar() {
  return <BottomTabBar items={ATHLETE_TABS} />
}

function ErgIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
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
