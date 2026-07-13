# synth. — Mobile Coach UI Reference

A complete, copy-able reference for the **dark-blue (cobalt) mobile coach experience**: the floating bottom navbar, the bottom-up sheet animation, and the Sources / Data view / Settings / Attention / Dashboard surfaces.

Everything lives under `src/features/app/`.

---

## How the animations work (read this first)

There are **three** distinct "comes up from the bottom" motions:

1. **The bottom navbar** (`FloatingTabBar`) is a *fixed* glass pill — it doesn't animate in/out, it just sits at `bottom: max(env(safe-area-inset-bottom), 16px)`. The only motion is `whileTap={{ scale: 0.92 }}` on each icon. Tapping **+** (center black circle) navigates; tapping **•••** (More) calls `onMoreClick()`.

2. **The "comes up from the bottom" container** is `SheetShell` — a portal-rendered bottom sheet. The whole effect is these four lines of Framer Motion:
   ```tsx
   initial={{ y: 800 }}
   animate={{ y: 0 }}
   exit={{ y: 800 }}
   transition={{ type: 'spring', stiffness: 320, damping: 30 }}
   ```
   A dimmed `backdrop-filter: blur(6px)` fades in behind it. When you tap **Sources** it navigates to a page; when you tap **•••** the `MoreSheet` (which *is* a `SheetShell`) springs up with the Roster/Attention/Sources/Settings list.

3. The **Attention** chart page uses a third variant — `TwoPaneChartSheet` slides its white content pane up with `initial={{ y: 24, opacity: 0 }}` and a custom cubic-bezier `[0.22, 1, 0.36, 1]` ease, under a Recharts bar chart.

The flow: `AppCoachShell` mounts the `CoachFloatingTabBar` + a single `MoreSheet`, controlled by one `moreOpen` boolean.

---

## Files at a glance

| Layer | File | Role |
|---|---|---|
| Tokens | `lib/theme.ts` | `SYNTH` colors/fonts/shadows/radii |
| Motion | `lib/motion.ts` + `index.css` | presets + `.synth-scroll` / `.pb-safe-tab` |
| **Navbar** | `primitives/FloatingTabBar.tsx` | the glass pill + `+` button |
| **Slide-up** | `primitives/SheetShell.tsx` | the `y:800 → 0` spring sheet |
| **••• menu** | `primitives/MoreSheet.tsx` | Roster/Attention/Sources/Settings |
| Shell | `coach/AppCoachShell.tsx` | wires navbar + MoreSheet + canvas |
| Primitives | `CoachPageHeader` · `SourcesSegmentedSwitch` · `ConnectorLogo` · `SwipeBackPage` · `TwoPaneChartSheet` · `SourcesSheets` | reused everywhere |
| Pages | `SourcesPage` · `SourcesDataViewPage` · `SettingsPage` · `AttentionPage` · `HomePage` | the five surfaces |
| Data | `mockConnectors` · `useSourcesStore` · `demoConnectorsData` · `useAttentionItems` | seed content |

**Dependencies**: `framer-motion`, `react-router-dom`, `recharts`, `lucide-react`, `zustand`, Tailwind, and the Geist/Inter fonts.

The three patterns that make this design coherent:
1. **glass** = `rgba(255,255,255,0.14)` + `backdrop-filter: blur(24px) saturate(140%)` + `0.28` border, used for exactly one floating control per screen.
2. **inline cards** = `rgba(255,255,255,0.10)` flat translucent panels on the cobalt.
3. **every data point carries a provenance line** (`Source · synced Xm ago` in faint uppercase tabular-nums).

**Text treatment cheatsheet:**
- Section kickers: `text-[10px] font-semibold uppercase tracking-[0.18em]` in `inkOnBrandMuted`
- Page titles: `text-[24px] font-bold tracking-[-0.01em]` in `inkOnBrand`
- Provenance: `text-[10px] uppercase tracking-[0.14em]` in `provenanceOnBrand` with `fontVariantNumeric: 'tabular-nums'`
- All numbers use `fontVariantNumeric: 'tabular-nums'`

---

## 1. Design tokens — `src/features/app/lib/theme.ts`

```ts
export const SYNTH = {
  // Canvas — full-bleed brand wash, top-to-bottom gradient
  canvasTop: '#2E37F2',
  canvasBottom: '#1F26C9',
  canvasInk: '#0B0E2E', // dark navy for AI/loading surfaces only

  // Solid candy cards
  cardYellow: '#F5EE3D',
  cardMint: '#B4E8C7',
  cardSky: '#A8DBF5',
  cardPink: '#F5C9D0',
  cardCream: '#FFF6B8',
  cardLemon: '#FCFB7A',
  cardLavender: '#E0D8F8',

  // Glass — for floating controls only (one element per screen)
  glass: 'rgba(255,255,255,0.14)',
  glassActive: 'rgba(255,255,255,0.22)',
  glassBorder: 'rgba(255,255,255,0.28)',
  glassInset: 'rgba(255,255,255,0.35)',
  glassBlur: 24,
  glassSaturate: 140,

  // Inline translucent cards — embedded in the canvas, no backdrop-filter
  inlineCard: 'rgba(255,255,255,0.10)',
  inlineCardBorder: 'rgba(255,255,255,0.16)',

  // Detail sheet — pure paper white, bleeds to the viewport bottom
  sheet: '#FFFFFF',
  sheetMuted: '#F2F2F6',

  // Ink
  ink: '#0A0A12',
  inkMuted: '#7A7A8C',
  inkOnBrand: '#FFFFFF',
  inkOnBrandMuted: 'rgba(255,255,255,0.62)',
  inkOnBrandFaint: 'rgba(255,255,255,0.42)',

  // Signal accents (semantic, not chrome)
  accentAmber: '#F39E5C',
  accentRed: '#E64A3C',
  accentBlack: '#0A0A12',
  accentEmerald: '#10B981',

  // Side colors (rowing: starboard=green, port=red)
  sidePort: '#E64A3C',
  sideStarboard: '#10B981',

  // Provenance — synth's signature element
  provenanceOnBrand: 'rgba(255,255,255,0.55)',
  provenanceOnSheet: '#9A9AAB',

  // AI surface — warm paper canvas
  aiCanvas: '#F4EFE3',
  aiCard: '#EFE9DA',
  aiBubble: '#E6E1D2',
  aiBorder: '#E5DFCE',
  aiTextMuted: '#6F6B62',

  // Type
  font: '"Geist", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',

  // Shadows
  shadow: {
    card: '0 8px 24px rgba(8,8,40,0.18)',
    cardLifted: '0 16px 40px rgba(8,8,40,0.28)',
    glass: '0 12px 32px rgba(8,8,40,0.25), 0 2px 4px rgba(8,8,40,0.18)',
    sheet: '0 -12px 40px rgba(8,8,40,0.25)',
    actionCircle: '0 8px 20px rgba(8,8,40,0.35)',
  },

  // Radii
  radius: {
    card: 28,
    sheet: 24,
    capsule: 9999,
    button: 20,
    chip: 14,
  },
} as const
```

---

## 2. Motion presets + CSS utilities

### `src/features/app/lib/motion.ts`

```ts
const EASE_OUT_BACK: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

/** Per-element entrance. Spread on each element's motion.div with custom={index}. */
export const TOOL_STAGGER = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.32, ease: EASE_OUT_BACK },
  }),
}

/** One-shot install pulse (~1.6s). */
export const INSTALL_PULSE = {
  initial: { scale: 1, boxShadow: '0 12px 28px -12px rgba(8,8,40,0.45)' },
  animate: {
    scale: [1, 1.025, 1],
    boxShadow: [
      '0 12px 28px -12px rgba(8,8,40,0.45)',
      '0 12px 36px -8px rgba(16,185,129,0.55), 0 0 0 1px rgba(16,185,129,0.45)',
      '0 12px 28px -12px rgba(8,8,40,0.45)',
    ],
  },
  transition: { duration: 1.6, ease: EASE_OUT_BACK },
}

/** Thinking-dot pulse. Per-dot transition.delay set at call site (0 / 0.2 / 0.4s). */
export const THINKING_DOT = {
  animate: { scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] },
  transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const },
}

/** Page-canvas entrance. */
export const CANVAS_ENTER = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.24, ease: 'easeOut' as const },
}
```

### Add to `src/index.css`

```css
/* Thin scrollbars for content panes */
.synth-scroll {
  scrollbar-width: thin;
  scrollbar-color: #d4d4d8 transparent;
}
.synth-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
.synth-scroll::-webkit-scrollbar-thumb {
  background: #d4d4d8; border-radius: 8px;
  border: 2px solid transparent; background-clip: padding-box;
}
.synth-scroll::-webkit-scrollbar-thumb:hover {
  background: #a1a1aa; background-clip: padding-box; border: 2px solid transparent;
}

/* Bottom padding so scrollable pages clear the 64px floating tab bar */
.pb-safe-tab {
  padding-bottom: calc(max(env(safe-area-inset-bottom, 0px), 16px) + 88px);
}
```

Fonts (Geist / Inter) must be loaded in `index.html` or via `@fontsource`.

---

## 3. The navbar — `src/features/app/primitives/FloatingTabBar.tsx`

```tsx
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Home, Boxes, Plus, Sparkles, MoreHorizontal } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { useUiStore } from '../../../shared/store/useUiStore'

export type FloatingTabItem = {
  key: string
  label: string
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
        // Dark navy-gray glass overlay so the bar reads against any backdrop.
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

export function CoachFloatingTabBar({ onMoreClick }: { onMoreClick: () => void }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const setHomePanelRequest = useUiStore((s) => s.setHomePanelRequest)

  const onHomeClick = () => {
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
```

---

## 4. The slide-up container — `src/features/app/primitives/SheetShell.tsx`

```tsx
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { SYNTH } from '../lib/theme'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** true = fixed 78dvh tall; default = sizes to content, 88dvh ceiling */
  tall?: boolean
}

/**
 * Rendered through a portal to document.body so the fixed-position sheet
 * always anchors to the viewport — not to the nearest ancestor with a
 * transform/filter/backdrop-filter.
 */
export function SheetShell({ open, onClose, title, children, tall = false }: Props) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          {/* Dimmed, blurred backdrop — tap to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(8,8,40,0.55)', backdropFilter: 'blur(6px)' }}
          />
          {/* The sheet — springs up from y:800 */}
          <motion.div
            initial={{ y: 800 }}
            animate={{ y: 0 }}
            exit={{ y: 800 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-[70] flex flex-col overflow-hidden"
            style={{
              background: SYNTH.sheet,
              borderRadius: `${SYNTH.radius.sheet}px ${SYNTH.radius.sheet}px 0 0`,
              ...(tall ? { height: '78dvh' } : { maxHeight: '88dvh' }),
              color: SYNTH.ink,
              fontFamily: SYNTH.font,
              boxShadow: SYNTH.shadow.sheet,
            }}
          >
            {/* Pinned header: drag handle + uppercase title + close X */}
            <header className="relative flex shrink-0 items-center justify-between px-5 pt-5 pb-3">
              <div
                className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full"
                style={{ background: SYNTH.sheetMuted }}
              />
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
              >
                {title}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </header>
            {/* Scrollable body */}
            <div className="synth-scroll flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-2">
              {children}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
```

---

## 5. The "•••" menu — `src/features/app/primitives/MoreSheet.tsx`

```tsx
import { useNavigate } from 'react-router-dom'
import { Users, AlertTriangle, Database, Settings as SettingsIcon, ChevronRight } from 'lucide-react'
import { SheetShell } from './SheetShell'
import { SYNTH } from '../lib/theme'

type MoreItem = { key: string; label: string; sub: string; to: string; icon: React.ReactNode }

export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()

  const items: MoreItem[] = [
    {
      key: 'roster',
      label: 'Roster',
      sub: 'All athletes, search, drill-in',
      to: '/app/coach/roster',
      icon: <Users size={18} strokeWidth={2.2} />,
    },
    {
      key: 'attention',
      label: 'Attention',
      sub: 'Flagged signals across the team',
      to: '/app/coach/attention',
      icon: <AlertTriangle size={18} strokeWidth={2.2} />,
    },
    {
      key: 'sources',
      label: 'Sources',
      sub: 'Connectors + read-only data view',
      to: '/app/coach/sources',
      icon: <Database size={18} strokeWidth={2.2} />,
    },
    {
      key: 'settings',
      label: 'Settings',
      sub: 'Profile, invite code, preferences',
      to: '/app/coach/settings',
      icon: <SettingsIcon size={18} strokeWidth={2.2} />,
    },
  ]

  const go = (to: string) => {
    onClose()
    navigate(to)
  }

  return (
    <SheetShell open={open} onClose={onClose} title="More">
      <div className="overflow-hidden rounded-2xl" style={{ background: SYNTH.sheetMuted }}>
        {items.map((item, i) => (
          <button
            key={item.key}
            type="button"
            onClick={() => go(item.to)}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:opacity-70"
            style={{ borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.sheet}`, background: 'transparent' }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: '#FFFFFF', color: SYNTH.ink }}
            >
              {item.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold leading-tight" style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}>
                {item.label}
              </p>
              <p className="mt-0.5 text-[12px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
                {item.sub}
              </p>
            </div>
            <ChevronRight size={16} color={SYNTH.inkMuted} />
          </button>
        ))}
      </div>
    </SheetShell>
  )
}
```

---

## 6. The shell that wires it — `src/features/app/coach/AppCoachShell.tsx`

```tsx
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { CoachFloatingTabBar } from '../primitives/FloatingTabBar'
import { MoreSheet } from '../primitives/MoreSheet'
import { SYNTH } from '../lib/theme'
import { useUiStore } from '../../../shared/store/useUiStore'

const HIDE_TAB_BAR_PREFIXES = [
  '/app/coach/ai',
  '/app/coach/athlete/',
  '/app/coach/tools/build',
]

export function AppCoachShell() {
  const { pathname } = useLocation()
  const isAI = pathname.startsWith('/app/coach/ai')
  const heroPageActive = useUiStore((s) => s.heroPageActive)
  const hideTabBar =
    HIDE_TAB_BAR_PREFIXES.some((p) => pathname.startsWith(p)) || heroPageActive
  const [moreOpen, setMoreOpen] = useState(false)

  const canvas = isAI ? 'cream' : heroPageActive ? 'dark-water' : 'cobalt'
  useEffect(() => {
    document.body.setAttribute('data-app-canvas', canvas)
    return () => document.body.removeAttribute('data-app-canvas')
  }, [canvas])

  const shellBg = isAI
    ? SYNTH.aiCanvas
    : heroPageActive
      ? '#050B1C'
      : `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`

  return (
    <div className="relative flex flex-1 flex-col" style={{ background: shellBg, fontFamily: SYNTH.font }}>
      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
      {hideTabBar ? null : <CoachFloatingTabBar onMoreClick={() => setMoreOpen(true)} />}
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  )
}
```

### UI store fields it depends on — `src/shared/store/useUiStore.ts`

```ts
import { create } from 'zustand'

type UiState = {
  homePanelRequest: number | null
  setHomePanelRequest: (panel: number | null) => void
  heroPageActive: boolean
  setHeroPageActive: (v: boolean) => void
  // ...other fields omitted
}

export const useUiStore = create<UiState>((set) => ({
  homePanelRequest: null,
  setHomePanelRequest: (panel) => set({ homePanelRequest: panel }),
  heroPageActive: false,
  setHeroPageActive: (v) => set({ heroPageActive: v }),
}))
```

### Route nesting

```tsx
<Route path="/app/coach" element={<AppCoachShell />}>
  <Route path="home" element={<HomePage />} />
  <Route path="sources" element={<SourcesPage />} />          {/* Connectors */}
  <Route path="sources/connectors" element={<SourcesPage />} />
  <Route path="sources/data-view" element={<SourcesDataViewPage />} />
  <Route path="settings" element={<SettingsPage />} />
  <Route path="attention" element={<AttentionPage />} />
</Route>
```

---

## 7. Shared primitives

### `CoachPageHeader.tsx`

```tsx
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { SYNTH } from '../lib/theme'

type Props = { title: string; subtitle?: string; back?: string; rightSlot?: ReactNode }

export function CoachPageHeader({ title, subtitle, back, rightSlot }: Props) {
  const navigate = useNavigate()
  return (
    <header className="flex items-start gap-3 px-5 pt-[max(env(safe-area-inset-top),32px)] pb-4">
      {back !== undefined ? (
        <button
          type="button"
          onClick={() => (back ? navigate(back) : navigate(-1))}
          aria-label="Back"
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`,
            color: SYNTH.inkOnBrand,
          }}
        >
          <ChevronLeft size={18} strokeWidth={2.2} />
        </button>
      ) : null}
      <div className="min-w-0 flex-1 pt-1">
        {subtitle ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em]"
             style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
            {subtitle}
          </p>
        ) : null}
        <h1 className="text-[24px] font-bold leading-tight tracking-[-0.01em]"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
          {title}
        </h1>
      </div>
      {rightSlot}
    </header>
  )
}
```

### `SourcesSegmentedSwitch.tsx` — Connectors / Data view toggle

```tsx
import { Link, useLocation } from 'react-router-dom'
import { SYNTH } from '../lib/theme'

export function SourcesSegmentedSwitch() {
  const { pathname } = useLocation()
  const onConnectors = pathname.startsWith('/app/coach/sources/connectors') || pathname === '/app/coach/sources'
  const onDataView = pathname.startsWith('/app/coach/sources/data-view')
  return (
    <div className="px-5 pb-1">
      <div
        className="flex items-center gap-1 rounded-full p-1"
        style={{
          background: SYNTH.glass,
          backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          border: `1px solid ${SYNTH.glassBorder}`,
        }}
      >
        <SegPill to="/app/coach/sources/connectors" label="Connectors" active={onConnectors} />
        <SegPill to="/app/coach/sources/data-view" label="Data view" active={onDataView} />
      </div>
    </div>
  )
}

function SegPill({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className="flex flex-1 items-center justify-center rounded-full py-2 text-[12px] font-semibold tracking-[0.06em] transition-colors"
      style={{
        background: active ? SYNTH.inkOnBrand : 'transparent',
        color: active ? SYNTH.ink : SYNTH.inkOnBrand,
        fontFamily: SYNTH.font,
      }}
    >
      {label}
    </Link>
  )
}
```

### `ConnectorLogo.tsx` — hand-rolled SVG brand marks

```tsx
import type { CSSProperties } from 'react'

type Props = { id: string; size?: number; tile?: boolean }

export function ConnectorLogo({ id, size = 28, tile = true }: Props) {
  const inner = renderMark(id, Math.round(size * 0.7))
  if (!tile) return <span className="inline-flex items-center justify-center">{inner}</span>

  const tileStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: Math.round(size * 0.26),
    background: '#FFFFFF',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 1px 2px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.06) inset',
  }
  return <span style={tileStyle}>{inner}</span>
}

function renderMark(id: string, s: number) {
  switch (id) {
    case 'concept2':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#1A1A2E" strokeWidth="2" />
          <path d="M5 12 L19 12 M12 5 L12 19" stroke="#FF6A2F" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'strava':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M14 3 L6 16 L9 16 L14 7 L19 16 L22 16 Z" fill="#FC4C02" />
          <path d="M14 16 L11 16 L13.5 21 L16 16 Z" fill="#FC4C02" opacity="0.6" />
        </svg>
      )
    case 'trainingpeaks':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M3 19 L9 8 L13 14 L17 6 L21 19 Z" fill="#1E5BAA" />
        </svg>
      )
    case 'whoop':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <text x="12" y="17" textAnchor="middle" fontFamily="Geist, Inter, sans-serif"
                fontWeight="900" fontSize="16" fill="#000000">W</text>
          <circle cx="20" cy="6" r="2" fill="#00F19F" />
        </svg>
      )
    case 'apple-health':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M12 21 C 5 16 3 12 3 9 C 3 6 5.5 4 8 4 C 9.7 4 11.1 4.9 12 6.2 C 12.9 4.9 14.3 4 16 4 C 18.5 4 21 6 21 9 C 21 12 19 16 12 21 Z" fill="#FF2D55" />
          <path d="M9 12 L11 12 L12 9 L13 15 L14 12 L15 12" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'garmin':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M12 3 L21 19 L3 19 Z" fill="#007CC3" />
          <path d="M12 8 L17 17 L7 17 Z" fill="white" />
        </svg>
      )
    case 'gmail':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="6" width="18" height="13" rx="2" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="0.5" />
          <path d="M3 8 L12 14 L21 8" stroke="#EA4335" strokeWidth="2" fill="none" />
          <path d="M3 8 L3 6 L12 13 L21 6 L21 8" fill="#EA4335" />
        </svg>
      )
    case 'sheets':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="5" y="3" width="14" height="18" rx="1.5" fill="#0F9D58" />
          <path d="M8 9 L16 9 M8 12 L16 12 M8 15 L16 15 M11 7 L11 17 M14 7 L14 17" stroke="white" strokeWidth="1.2" />
        </svg>
      )
    case 'oura':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="7.5" stroke="#1A1A1A" strokeWidth="2.4" fill="none" />
          <circle cx="12" cy="12" r="3" fill="#1A1A1A" />
        </svg>
      )
    case 'bridge':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M3 17 C 7 9 17 9 21 17" stroke="#4A90D9" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <line x1="3" y1="17" x2="3" y2="20" stroke="#4A90D9" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="21" y1="17" x2="21" y2="20" stroke="#4A90D9" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="9" y1="13.5" x2="9" y2="20" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round" />
          <line x1="15" y1="13.5" x2="15" y2="20" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'google-calendar':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="4" y="5" width="16" height="16" rx="1.5" fill="#FFFFFF" stroke="#DADCE0" strokeWidth="0.5" />
          <rect x="4" y="5" width="16" height="4" fill="#4285F4" />
          <text x="12" y="18" textAnchor="middle" fontFamily="Geist, Inter, sans-serif"
                fontWeight="700" fontSize="8" fill="#4285F4">31</text>
        </svg>
      )
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#7A7A8C" />
        </svg>
      )
  }
}
```

### `SwipeBackPage.tsx` — drag-right-to-go-back wrapper

```tsx
import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, type PanInfo } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = { children: ReactNode; to?: string; threshold?: number }

export function SwipeBackPage({ children, to, threshold = 80 }: Props) {
  const navigate = useNavigate()
  const x = useMotionValue(0)

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > threshold || info.velocity.x > 500) {
      if (to) navigate(to)
      else navigate(-1)
    }
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.4 }}
      dragDirectionLock
      onDragEnd={onDragEnd}
      style={{ x, touchAction: 'pan-y' }}
      className="flex min-h-0 flex-1 flex-col"
    >
      {children}
    </motion.div>
  )
}
```

### `TwoPaneChartSheet.tsx` — Recharts bar chart + white pane that slides up

```tsx
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { SYNTH } from '../lib/theme'

export type RangeKey = 'D' | 'W' | 'M'
export type ChartPoint = { key: string; label: string; value: number; highlighted?: boolean }

type Props = {
  title: string
  subtitle?: string
  onBack?: () => void
  range?: RangeKey
  onRangeChange?: (range: RangeKey) => void
  data: ChartPoint[]
  yFormatter?: (v: number) => string
  yDomain?: [number | 'auto' | 'dataMin', number | 'auto' | 'dataMax']
  trendLine?: string
  onBarClick?: (key: string) => void
  children: ReactNode
}

export function TwoPaneChartSheet({
  title, subtitle, onBack, range, onRangeChange, data,
  yFormatter, yDomain, trendLine, onBarClick, children,
}: Props) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-start gap-3 px-5 pt-[max(env(safe-area-inset-top),12px)] pb-3">
        {onBack ? <BackButton onClick={onBack} /> : <div className="h-10 w-10 shrink-0" />}
        <div className="min-w-0 flex-1 pt-1">
          <h1 className="truncate text-[22px] font-bold leading-tight tracking-[-0.01em]"
              style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
            {title}
          </h1>
          {subtitle ? (
            <p className="text-[11px] uppercase tracking-[0.16em]"
               style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {range && onRangeChange ? <RangeToggle value={range} onChange={onRangeChange} /> : null}
      </header>

      {trendLine ? (
        <p className="px-5 pb-1 text-[11px] uppercase tracking-[0.14em]"
           style={{ color: SYNTH.provenanceOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
          {trendLine}
        </p>
      ) : null}

      <div className="px-2 pt-2" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 12, bottom: 10, left: 0 }}>
            <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd"
              tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10, fontFamily: SYNTH.font }} />
            <YAxis tickLine={false} axisLine={false} width={42}
              domain={yDomain ?? ['auto', 'auto']}
              tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10, fontFamily: SYNTH.font }}
              tickFormatter={(v) => (yFormatter ? yFormatter(v as number) : String(v))} />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{
                background: SYNTH.canvasInk, border: `1px solid ${SYNTH.glassBorder}`,
                borderRadius: 12, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontSize: 12,
              }}
              formatter={(v: number) => (yFormatter ? yFormatter(v) : v)}
              labelStyle={{ color: SYNTH.inkOnBrandMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}
              onClick={(payload) => onBarClick?.(payload.key as string)}>
              {data.map((d) => (
                <Cell key={d.key}
                  fill={d.highlighted ? SYNTH.inkOnBrand : 'rgba(255,255,255,0.32)'}
                  cursor={onBarClick ? 'pointer' : 'default'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* White content pane slides up under the chart */}
      <motion.section
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="synth-scroll relative mt-3 flex flex-1 flex-col overflow-y-auto"
        style={{
          background: SYNTH.sheet,
          borderRadius: `${SYNTH.radius.sheet}px ${SYNTH.radius.sheet}px 0 0`,
          padding: '8px 20px max(env(safe-area-inset-bottom), 24px)',
          boxShadow: SYNTH.shadow.sheet,
          color: SYNTH.ink,
          fontFamily: SYNTH.font,
        }}
      >
        <div className="mx-auto mt-1 mb-4 h-1 w-10 rounded-full" style={{ background: SYNTH.sheetMuted }} />
        {children}
      </motion.section>
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Back"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
      style={{
        background: SYNTH.glass,
        backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        border: `1px solid ${SYNTH.glassBorder}`,
        color: SYNTH.inkOnBrand,
      }}>
      <ChevronLeft size={18} strokeWidth={2.2} />
    </button>
  )
}

function RangeToggle({ value, onChange }: { value: RangeKey; onChange: (r: RangeKey) => void }) {
  const ranges: RangeKey[] = ['D', 'W', 'M']
  return (
    <div className="flex items-center gap-0.5 rounded-full p-1"
      style={{
        background: SYNTH.glass,
        backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        border: `1px solid ${SYNTH.glassBorder}`,
      }}>
      {ranges.map((r) => {
        const active = value === r
        return (
          <button key={r} type="button" onClick={() => onChange(r)}
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{
              background: active ? SYNTH.glassActive : 'transparent',
              color: active ? SYNTH.inkOnBrand : SYNTH.inkOnBrandMuted,
              fontFamily: SYNTH.font, letterSpacing: '0.05em',
              border: active ? `1px solid ${SYNTH.glassBorder}` : '1px solid transparent',
            }}>
            {r}
          </button>
        )
      })}
    </div>
  )
}
```

### `SourcesSheets.tsx` — the **Add source** popup + Quick stats sheet

```tsx
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { SheetShell } from './SheetShell'
import { ConnectorLogo } from './ConnectorLogo'
import { SYNTH } from '../lib/theme'

export type ConnectorMeta = { id: string; name: string; category: string; brandColor: string }

export function AddSourceSheet({
  open, onClose, available, onAdd,
}: {
  open: boolean; onClose: () => void
  available: ConnectorMeta[]; onAdd: (id: string) => void
}) {
  return (
    <SheetShell open={open} onClose={onClose} title="Add a source">
      <p className="text-[13px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
        Pick anything synth doesn't yet pull from. We'll handshake the OAuth and start synthesizing immediately.
      </p>
      <div className="flex flex-col gap-2">
        {available.length === 0 ? (
          <div className="rounded-2xl px-5 py-8 text-center" style={{ background: SYNTH.sheetMuted }}>
            <p className="text-[13px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
              All sources connected. Nothing to add.
            </p>
          </div>
        ) : (
          available.map((c) => (
            <motion.button key={c.id} type="button" whileTap={{ scale: 0.98 }}
              onClick={() => onAdd(c.id)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left"
              style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}>
              <ConnectorLogo id={c.id} size={36} />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold" style={{ fontFamily: SYNTH.font }}>{c.name}</p>
                <p className="text-[11px] uppercase tracking-[0.12em]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
                  {c.category}
                </p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand }}>
                <Plus size={14} strokeWidth={2.6} />
              </span>
            </motion.button>
          ))
        )}
      </div>
    </SheetShell>
  )
}

export type QuickStatItem = {
  label: string; value: string; unit?: string
  delta?: { direction: 'up' | 'down' | 'flat'; value: string }
  source: string; syncedAgo: string
}

export function QuickStatsSheet({
  open, onClose, title, stats,
}: { open: boolean; onClose: () => void; title: string; stats: QuickStatItem[] }) {
  return (
    <SheetShell open={open} onClose={onClose} title={title}>
      <div className="grid grid-cols-2 gap-2 pt-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl px-3 py-3" style={{ background: SYNTH.sheetMuted }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
              {s.label}
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[24px] font-bold leading-none" style={{ color: SYNTH.ink, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
                {s.value}
              </span>
              {s.unit ? <span className="text-[11px] font-semibold" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>{s.unit}</span> : null}
              {s.delta ? (
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{
                    color: s.delta.direction === 'up' ? SYNTH.accentEmerald
                      : s.delta.direction === 'down' ? SYNTH.accentRed : SYNTH.inkMuted,
                    fontFamily: SYNTH.font,
                  }}>
                  {s.delta.direction === 'up' ? '↑' : s.delta.direction === 'down' ? '↓' : '·'} {s.delta.value}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[10px] uppercase tracking-[0.1em]"
               style={{ color: SYNTH.provenanceOnSheet, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
              {s.source} · {s.syncedAgo}
            </p>
          </div>
        ))}
      </div>
    </SheetShell>
  )
}
```

---

## 8. Page — Sources (Connectors tab) — `src/features/app/coach/SourcesPage.tsx`

```tsx
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, ChevronRight, ArrowUpRight } from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { COACH_CONNECTORS, type ConnectorMock } from '../data/mockConnectors'
import { ConnectorLogo } from '../primitives/ConnectorLogo'
import { SourcesSegmentedSwitch } from '../primitives/SourcesSegmentedSwitch'
import { AddSourceSheet } from '../primitives/SourcesSheets'
import { useSourcesStore, enabledToolCount } from '../data/useSourcesStore'
import { SYNTH } from '../lib/theme'

export function SourcesPage() {
  const sources = useSourcesStore((s) => s.sources)
  const connect = useSourcesStore((s) => s.connect)
  const [openAdd, setOpenAdd] = useState(false)

  const connected = useMemo(
    () => COACH_CONNECTORS.filter((c) => sources[c.id]).map((c) => ({
      ...c, toolCount: enabledToolCount(sources[c.id]),
    })),
    [sources],
  )
  const available = useMemo(() => COACH_CONNECTORS.filter((c) => !sources[c.id]), [sources])

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-safe-tab">
      <CoachPageHeader
        title="Sources"
        subtitle={`${connected.length} connected`}
        back="/app/coach/home"
        rightSlot={
          <button type="button" aria-label="Add source" onClick={() => setOpenAdd(true)}
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{
              background: SYNTH.glass,
              backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              border: `1px solid ${SYNTH.glassBorder}`, color: SYNTH.inkOnBrand,
            }}>
            <Plus size={18} strokeWidth={2.4} />
          </button>
        }
      />

      <SourcesSegmentedSwitch />

      <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }} className="mt-3 px-5">
        <p className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
           style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
          Connected
        </p>
        <div className="flex flex-col">
          {connected.map((c, i) => (
            <ConnectorRow key={c.id} connector={c} toolCount={c.toolCount} connected
              isFirst={i === 0} isLast={i === connected.length - 1}
              onClick={() => { /* open detail sheet */ }} />
          ))}
        </div>
      </motion.section>

      {available.length > 0 ? (
        <section className="mt-6 px-5">
          <p className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
             style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
            Available
          </p>
          <div className="flex flex-col">
            {available.map((c, i) => (
              <ConnectorRow key={c.id} connector={c} toolCount={0} connected={false}
                isFirst={i === 0} isLast={i === available.length - 1}
                onClick={() => connect(c.id)} />
            ))}
          </div>
        </section>
      ) : null}

      <AddSourceSheet
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        available={available.map((c) => ({ id: c.id, name: c.name, category: c.category, brandColor: c.brandColor }))}
        onAdd={(id) => { connect(id); setOpenAdd(false) }}
      />
    </div>
  )
}

function ConnectorRow({
  connector, toolCount, connected, isFirst, isLast, onClick,
}: {
  connector: ConnectorMock; toolCount: number; connected: boolean
  isFirst: boolean; isLast: boolean; onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick}
      className="flex w-full items-center gap-3 py-3 text-left active:opacity-70"
      style={{ borderTop: isFirst ? 'none' : `1px solid rgba(255,255,255,0.08)`, paddingTop: 12, paddingBottom: 12 }}>
      <ConnectorLogo id={connector.id} size={32} />
      <span className="flex-1 truncate text-[15px] font-semibold"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
        {connector.name}
      </span>
      {connected ? (
        <>
          <span className="flex h-7 min-w-[28px] items-center justify-center rounded-full px-2 text-[12px] font-bold"
            style={{ background: '#3B82F6', color: '#FFFFFF', fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
            {toolCount}
          </span>
          <ChevronRight size={18} color="rgba(255,255,255,0.6)" strokeWidth={2.2} />
        </>
      ) : (
        <span className="flex items-center gap-1 text-[13px] font-semibold"
              style={{ color: 'rgba(255,255,255,0.62)', fontFamily: SYNTH.font }}>
          Connect <ArrowUpRight size={14} strokeWidth={2.4} />
        </span>
      )}
    </button>
  )
}
```

---

## 9. Page — Sources (Data view tab) — `src/features/app/coach/SourcesDataViewPage.tsx`

The core reusable bits are `StatusPill`, `Card`, `SourceHero`, and `Sparkline`. Below is the full file.

```tsx
import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { SourcesSegmentedSwitch } from '../primitives/SourcesSegmentedSwitch'
import { ConnectorLogo } from '../primitives/ConnectorLogo'
import { SYNTH } from '../lib/theme'
import {
  CONCEPT2_ROWS,
  INFERENCE_LOG,
  SHEETS_ROWS,
  SOURCE_HEALTH,
  STRAVA_ACTIVITIES,
  TEAM_ROSTER,
  VOICE_NOTES,
  type DataViewTabId,
} from '../../coach/sources/data/demoConnectorsData'
import { SEED_GYM_SESSIONS } from '../../../shared/data/seeds'

type Tab = { id: DataViewTabId; label: string; color: string; connectorId?: string }

const TABS: Tab[] = [
  { id: 'workflow', label: 'Workflow', color: '#A8DBF5' },
  { id: 'concept2', label: 'Concept2', color: '#1A1A2E', connectorId: 'concept2' },
  { id: 'strava', label: 'Strava', color: '#FC4C02', connectorId: 'strava' },
  { id: 'apple-health', label: 'Apple Health', color: '#FF2D55', connectorId: 'apple-health' },
  { id: 'whoop', label: 'WHOOP', color: '#000000', connectorId: 'whoop' },
  { id: 'bridge', label: 'Bridge', color: '#4A90D9', connectorId: 'bridge' },
  { id: 'trainingpeaks', label: 'TrainingPeaks', color: '#1E5BAA', connectorId: 'trainingpeaks' },
  { id: 'google-calendar', label: 'Calendar', color: '#4285F4', connectorId: 'google-calendar' },
  { id: 'garmin', label: 'Garmin', color: '#007CC3', connectorId: 'garmin' },
  { id: 'oura', label: 'Oura', color: '#1A1A1A', connectorId: 'oura' },
  { id: 'google-sheets', label: 'Sheets', color: '#0F9D58', connectorId: 'sheets' },
  { id: 'coach-notes', label: 'Notes', color: '#8B5CF6' },
  { id: 'ai-import', label: 'AI Import', color: '#8B5CF6' },
]

function fmtShort(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

export function SourcesDataViewPage() {
  const [tab, setTab] = useState<DataViewTabId>('workflow')
  const [athleteId, setAthleteId] = useState<string>('all')
  const tabStripRef = useRef<HTMLDivElement | null>(null)

  const highlightAthleteName = useMemo(() => {
    if (athleteId === 'all') return null
    return TEAM_ROSTER.find((a) => a.id === athleteId)?.name ?? null
  }, [athleteId])

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-safe-tab">
      <CoachPageHeader title="Sources" subtitle="Data view" back="/app/coach/home" />
      <SourcesSegmentedSwitch />

      {/* Athlete chip row — horizontal scroll */}
      <div className="mt-3">
        <div className="synth-scroll flex items-center gap-2 overflow-x-auto px-5 pb-2" style={{ scrollbarWidth: 'none' }}>
          <AthleteChip label="All athletes" active={athleteId === 'all'} onClick={() => setAthleteId('all')} />
          {TEAM_ROSTER.map((a) => (
            <AthleteChip key={a.id} label={a.name.split(' ')[0]} active={athleteId === a.id} onClick={() => setAthleteId(a.id)} />
          ))}
        </div>
      </div>

      {/* Tab strip — colored dot + label, underline indicator */}
      <div ref={tabStripRef} className="synth-scroll flex items-center overflow-x-auto px-5 pb-3"
        style={{ scrollbarWidth: 'none', borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap py-2 pr-4 text-[13px] font-semibold transition-opacity"
              style={{
                color: active ? SYNTH.inkOnBrand : SYNTH.inkOnBrandMuted,
                fontFamily: SYNTH.font, opacity: active ? 1 : 0.85,
                borderBottom: active ? `2px solid ${t.color}` : '2px solid transparent', marginBottom: -1,
              }}>
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: t.color }} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Filter banner */}
      {highlightAthleteName ? (
        <div className="mx-5 mt-3 flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{ background: 'rgba(16,185,129,0.18)', border: `1px solid rgba(16,185,129,0.4)` }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: SYNTH.accentEmerald }} />
          <span className="text-[12px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
            Filtered to {highlightAthleteName}
          </span>
          <button type="button" onClick={() => setAthleteId('all')} className="ml-auto text-[11px] font-semibold"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
            Clear
          </button>
        </div>
      ) : null}

      {/* Content */}
      <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }} className="px-5 pt-4">
        {tab === 'workflow' && <WorkflowTab />}
        {tab === 'concept2' && <Concept2Tab highlight={highlightAthleteName} />}
        {tab === 'strava' && <StravaTab highlight={highlightAthleteName} />}
        {tab === 'apple-health' && <AppleHealthTab />}
        {tab === 'whoop' && <WhoopTab />}
        {tab === 'bridge' && <BridgeTab />}
        {tab === 'trainingpeaks' && <TrainingPeaksTab />}
        {tab === 'google-calendar' && <CalendarTab />}
        {tab === 'garmin' && <EmptyTab name="Garmin" />}
        {tab === 'oura' && <EmptyTab name="Oura" />}
        {tab === 'google-sheets' && <SheetsTab highlight={highlightAthleteName} />}
        {tab === 'coach-notes' && <CoachNotesTab />}
        {tab === 'ai-import' && <AiImportTab />}
      </motion.div>
    </div>
  )
}

function AthleteChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap"
      style={{
        background: active ? SYNTH.inkOnBrand : 'rgba(255,255,255,0.08)',
        color: active ? SYNTH.ink : SYNTH.inkOnBrand, fontFamily: SYNTH.font,
        border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.16)'}`,
      }}>
      {label}
    </button>
  )
}

function StatusPill({ status }: { status: 'healthy' | 'stale' | 'failed' | 'pending' }) {
  const map: Record<typeof status, { bg: string; color: string; label: string }> = {
    healthy: { bg: 'rgba(16,185,129,0.18)', color: '#34D399', label: 'Healthy' },
    stale: { bg: 'rgba(243,158,92,0.18)', color: '#F59E0B', label: 'Stale' },
    failed: { bg: 'rgba(230,74,60,0.18)', color: '#FCA5A5', label: 'Failed' },
    pending: { bg: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.7)', label: 'Pending' },
  }
  const { bg, color, label } = map[status]
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
      style={{ background: bg, color, fontFamily: SYNTH.font }}>
      {label}
    </span>
  )
}

function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-2xl p-4"
      style={{
        background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}`,
        borderLeft: accent ? `3px solid ${accent}` : `1px solid ${SYNTH.inlineCardBorder}`,
      }}>
      {children}
    </div>
  )
}

function SourceHero({
  connectorId, status, records, lastSyncAt,
}: {
  connectorId: string
  status: 'healthy' | 'stale' | 'failed' | 'pending'
  records?: number
  lastSyncAt?: string
}) {
  const meta = TABS.find((t) => t.connectorId === connectorId)
  return (
    <div className="mb-3 flex items-center gap-3 rounded-2xl p-3"
      style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
      <ConnectorLogo id={connectorId} size={36} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
            {meta?.label}
          </span>
          <StatusPill status={status} />
        </div>
        {(records !== undefined || lastSyncAt) && (
          <p className="mt-0.5 text-[11px]"
             style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
            {records !== undefined ? `${records.toLocaleString()} records` : ''}
            {records !== undefined && lastSyncAt ? ' · ' : ''}
            {lastSyncAt ? `last sync ${fmtShort(lastSyncAt)}` : ''}
          </p>
        )}
      </div>
    </div>
  )
}

function WorkflowTab() {
  return (
    <div className="space-y-4">
      <div>
        <p className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
           style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
          Source health
        </p>
        <div className="flex flex-col gap-2">
          {SOURCE_HEALTH.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-2xl p-3"
              style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
              <ConnectorLogo id={s.id} size={28} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold leading-tight" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                  {s.name}
                </p>
                <p className="text-[10px] uppercase tracking-[0.12em]"
                   style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
                  {s.records} records · {fmtShort(s.lastSyncAt)}
                </p>
              </div>
              <StatusPill status={s.status} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
           style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
          Inference log
        </p>
        <div className="flex flex-col gap-2">
          {INFERENCE_LOG.map((l) => (
            <Card key={l.id}
              accent={l.status === 'success' ? SYNTH.accentEmerald : l.status === 'warning' ? SYNTH.accentAmber : SYNTH.accentRed}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] font-semibold leading-snug" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                  {l.title}
                </p>
                <span className="text-[10px]" style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
                  {fmtShort(l.at)}
                </span>
              </div>
              <p className="mt-1 text-[12px] leading-snug" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                {l.detail}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function Concept2Tab({ highlight }: { highlight: string | null }) {
  const rows = highlight ? CONCEPT2_ROWS.filter((r) => r.athlete === highlight) : CONCEPT2_ROWS
  return (
    <div className="space-y-3">
      <SourceHero connectorId="concept2" status="healthy" records={982} lastSyncAt="2026-04-24T12:08:00Z" />
      {rows.length === 0 ? (
        <EmptyState message="No Concept2 records for this athlete." />
      ) : (
        rows.map((r) => (
          <Card key={r.athlete + r.date} accent="#FF6A2F">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[15px] font-bold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                  {r.athlete}
                </p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                  {r.testType} · {r.date}
                </p>
              </div>
              {r.isPr ? (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
                  style={{ background: 'rgba(16,185,129,0.18)', color: '#34D399', fontFamily: SYNTH.font }}>
                  PR
                </span>
              ) : null}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              <Stat label="Split" value={r.split} />
              <Stat label="Watts" value={String(r.watts)} />
              <Stat label="SPM" value={String(r.strokeRate)} />
              <Stat label="Distance" value={r.distance.replace(',000m', 'k')} />
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl px-2 py-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
        {label}
      </p>
      <p className="mt-0.5 text-[14px] font-bold leading-tight"
         style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
    </div>
  )
}

function StravaTab({ highlight }: { highlight: string | null }) {
  const rows = highlight ? STRAVA_ACTIVITIES.filter((a) => a.athlete === highlight) : STRAVA_ACTIVITIES
  return (
    <div className="space-y-3">
      <SourceHero connectorId="strava" status="stale" records={416} lastSyncAt="2026-04-23T19:21:00Z" />
      {rows.length === 0 ? (
        <EmptyState message="No Strava activity for this athlete." />
      ) : (
        rows.map((a) => (
          <Card key={a.id} accent="#FC4C02">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[14px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                  {a.athlete}
                </p>
                <p className="mt-0.5 text-[11px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                  {a.type} · {a.at}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[16px] font-bold"
                   style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
                  {a.distanceKm} <span className="text-[10px] font-medium">km</span>
                </p>
                <p className="text-[10px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                  {a.duration} · {a.pace}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-3 text-[11px]">
              {a.avgHr ? (
                <span style={{ color: a.avgHr > 165 ? '#FCA5A5' : a.avgHr > 155 ? SYNTH.accentAmber : '#34D399', fontFamily: SYNTH.font }}>
                  ♥ {a.avgHr}
                </span>
              ) : null}
              <span style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>Effort {a.effort}/10</span>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

const APPLE_SLEEP = [7.2, 6.8, 7.4, 7.1, 5.8, 7.5, 7.3, 6.9, 7.2, 7.0, 7.4, 6.5, 8.1, 7.3]
const APPLE_HRV = [52, 48, 51, 47, 44, 55, 53, 49, 48, 50, 46, 44, 52, 48]
const APPLE_RHR = [53, 54, 52, 55, 57, 51, 52, 54, 55, 53, 56, 58, 51, 52]

function AppleHealthTab() {
  return (
    <div className="space-y-3">
      <SourceHero connectorId="apple-health" status="healthy" records={2201} lastSyncAt="2026-04-24T11:40:00Z" />
      <Card accent="#FF2D55">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
          Sleep · 14 days
        </p>
        <Sparkline data={APPLE_SLEEP} type="bars" min={4} max={9} accent="#FF2D55" />
      </Card>
      <Card accent="#FF2D55">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
          HRV · 14 days
        </p>
        <Sparkline data={APPLE_HRV} type="line" min={40} max={60} accent="#FF2D55" />
      </Card>
      <Card accent="#FF2D55">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
          Resting HR · 14 days
        </p>
        <Sparkline data={APPLE_RHR} type="line" min={48} max={62} accent="#06B6D4" />
      </Card>
    </div>
  )
}

function Sparkline({
  data, type, min, max, accent,
}: { data: number[]; type: 'line' | 'bars'; min: number; max: number; accent: string }) {
  const w = 320
  const h = 80
  const range = max - min || 1
  if (type === 'bars') {
    const bw = w / data.length - 2
    return (
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        {data.map((v, i) => {
          const bh = ((v - min) / range) * (h - 4)
          return (
            <rect key={i} x={i * (w / data.length) + 1} y={h - bh} width={bw} height={bh} rx={2} fill={accent} opacity={0.9} />
          )
        })}
      </svg>
    )
  }
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(' ')
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WhoopTab() {
  return (
    <div className="space-y-3">
      <SourceHero connectorId="whoop" status="failed" lastSyncAt="2026-04-24T03:11:00Z" />
      <Card accent={SYNTH.accentRed}>
        <p className="text-[14px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
          Token expired Apr 24, 3:11 AM
        </p>
        <p className="mt-1 text-[12px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
          Reconnect from the desktop dashboard to resume sync.
        </p>
      </Card>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Recovery', value: '72%' },
          { label: 'HRV', value: '48ms' },
          { label: 'Resting HR', value: '52bpm' },
          { label: 'Sleep', value: '7.1h' },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl p-3"
            style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
              {m.label}
            </p>
            <p className="mt-1 text-[20px] font-bold"
               style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, filter: 'blur(4px)', opacity: 0.7 }}>
              {m.value}
            </p>
            <p className="mt-0.5 text-[10px]" style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}>
              reconnect to view
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function BridgeTab() {
  const sessions = SEED_GYM_SESSIONS.slice(0, 3)
  return (
    <div className="space-y-3">
      <SourceHero connectorId="bridge" status="healthy" records={188} lastSyncAt="2026-04-24T10:03:00Z" />
      {sessions.map((s) => (
        <Card key={s.id} accent="#4A90D9">
          <div className="flex items-start justify-between">
            <p className="text-[14px] font-semibold capitalize" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
              {s.athleteId.replace('athlete-', '').replace(/-/g, ' ')}
            </p>
            <span className="text-[10px]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
              {s.sessionDate} · {s.durationMin}m
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-1">
            {s.exercises.map((ex) => (
              <div key={ex.name} className="flex items-center justify-between text-[12px]">
                <span style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{ex.name}</span>
                <span style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
                  {ex.sets}×{ex.reps}{ex.weight > 0 ? ` @ ${ex.weight}lb` : ''}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

const TP_PLAN = [
  { day: 'Mon', planned: '60m SS', actual: '62m', done: true },
  { day: 'Tue', planned: '45m AT', actual: '44m', done: true },
  { day: 'Wed', planned: 'Rest', actual: 'Rest', done: true },
  { day: 'Thu', planned: '5×500m', actual: '5×500m', done: true },
  { day: 'Fri', planned: 'Shakeout', actual: null, done: false },
  { day: 'Sat', planned: 'RACE DAY', actual: null, done: false },
]

function TrainingPeaksTab() {
  const donePct = Math.round((TP_PLAN.filter((d) => d.done).length / TP_PLAN.length) * 100)
  return (
    <div className="space-y-3">
      <SourceHero connectorId="trainingpeaks" status="pending" />
      <Card accent={SYNTH.accentAmber}>
        <p className="text-[14px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
          Integration pending
        </p>
        <p className="mt-1 text-[12px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
          Configure TrainingPeaks from the desktop dashboard. Once connected, you'll see TSS · CTL · ATL load metrics,
          planned vs actual workouts, and HR-zone distribution per session.
        </p>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
            Weekly compliance
          </p>
          <p className="text-[12px] font-bold" style={{ color: '#34D399', fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
            {donePct}%
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.10)' }}>
          <div style={{ width: `${donePct}%`, height: '100%', background: SYNTH.accentEmerald, borderRadius: 9999 }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {TP_PLAN.map((d) => (
            <div key={d.day} className="rounded-xl p-2 text-center"
              style={{
                background: d.done ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${d.done ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.10)'}`,
              }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                {d.day}
              </p>
              <p className="mt-1 text-[11px]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{d.planned}</p>
              {d.actual ? <p className="text-[10px] font-bold" style={{ color: '#34D399', fontFamily: SYNTH.font }}>{d.actual}</p> : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

const CAL_EVENTS = [
  { day: 'Mon Apr 21', items: [{ time: '6:00 AM', title: 'Practice — Race Pace', color: '#34D399' }, { time: '4:00 PM', title: 'Gym S&C', color: '#60A5FA' }] },
  { day: 'Tue Apr 22', items: [{ time: '6:00 AM', title: 'Practice — Steady State', color: '#34D399' }] },
  { day: 'Wed Apr 23', items: [{ time: '', title: 'Rest day', color: 'rgba(255,255,255,0.4)' }] },
  { day: 'Thu Apr 24', items: [{ time: '6:00 AM', title: 'Race Prep Pieces', color: '#34D399' }, { time: '4:00 PM', title: 'Gym S&C', color: '#60A5FA' }] },
  { day: 'Fri Apr 25', items: [{ time: '6:00 AM', title: 'Shakeout Row', color: '#34D399' }] },
]

function CalendarTab() {
  return (
    <div className="space-y-3">
      <SourceHero connectorId="google-calendar" status="healthy" lastSyncAt="2026-04-24T11:55:00Z" />
      <div className="flex flex-col gap-2">
        {CAL_EVENTS.map((d) => (
          <Card key={d.day}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
              {d.day}
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {d.items.map((ev, i) => (
                <div key={i} className="rounded-lg px-2.5 py-1.5"
                  style={{ background: `${ev.color}1F`, borderLeft: `2px solid ${ev.color}` }}>
                  {ev.time ? (
                    <span className="text-[10px] font-mono" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                      {ev.time}
                    </span>
                  ) : null}
                  <p className="text-[12px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                    {ev.title}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <div className="flex items-center gap-3 rounded-2xl p-4"
        style={{ background: 'rgba(16,185,129,0.12)', border: `1px solid rgba(16,185,129,0.3)` }}>
        <div className="flex h-12 w-14 flex-col items-center justify-center rounded-xl"
          style={{ background: 'rgba(16,185,129,0.18)', border: `1px solid ${SYNTH.accentEmerald}` }}>
          <p className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: '#34D399', fontFamily: SYNTH.font }}>Apr</p>
          <p className="text-[16px] font-bold" style={{ color: '#34D399', fontFamily: SYNTH.font, lineHeight: 1 }}>26</p>
        </div>
        <div>
          <p className="text-[14px] font-bold" style={{ color: '#34D399', fontFamily: SYNTH.font }}>PACIFIC INVITE REGATTA</p>
          <p className="text-[11px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
            5:45 AM call · Briones Reservoir, Orinda CA
          </p>
        </div>
      </div>
    </div>
  )
}

function CoachNotesTab() {
  return (
    <div className="space-y-3">
      {VOICE_NOTES.map((n) => (
        <Card key={n.id} accent="#8B5CF6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[14px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{n.athlete}</p>
              <p className="text-[11px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{n.at}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {n.tags.map((t) => (
                <span key={t} className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: 'rgba(139,92,246,0.18)', color: '#C4B5FD', fontFamily: SYNTH.font }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
            {n.transcript}
          </p>
          {n.extracted.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {n.extracted.map((e) => (
                <span key={e} className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: 'rgba(16,185,129,0.18)', color: '#6EE7B7', fontFamily: SYNTH.font }}>
                  {e}
                </span>
              ))}
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  )
}

const AI_IMPORTS = [
  { id: 'aim-1', sourceType: 'Email attachment', extracted: 'Erg scores for 8 athletes from Apr 19 test', athlete: 'Team-wide', status: 'imported' as const },
  { id: 'aim-2', sourceType: 'PDF race program', extracted: 'Pacific Invite start list · 1V draw at lane 3', athlete: 'Team-wide', status: 'imported' as const },
  { id: 'aim-3', sourceType: 'Image (whiteboard photo)', extracted: 'Workout intervals: 4×8min at 2:02 w/ 4min rest', athlete: 'All', status: 'pending' as const },
]

function AiImportTab() {
  return (
    <div className="space-y-3">
      {AI_IMPORTS.map((item) => (
        <Card key={item.id} accent="#8B5CF6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                {item.sourceType}
              </p>
              <p className="mt-1 text-[13px] font-semibold leading-snug" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                {item.extracted}
              </p>
              <p className="mt-1 text-[11px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                Matched: {item.athlete}
              </p>
            </div>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
              style={
                item.status === 'imported'
                  ? { background: 'rgba(16,185,129,0.18)', color: '#34D399', fontFamily: SYNTH.font }
                  : { background: 'rgba(243,158,92,0.18)', color: SYNTH.accentAmber, fontFamily: SYNTH.font }
              }>
              {item.status}
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}

function SheetsTab({ highlight }: { highlight: string | null }) {
  const rows = highlight ? SHEETS_ROWS.filter((r) => r.athlete === highlight) : SHEETS_ROWS
  return (
    <div className="space-y-3">
      <SourceHero connectorId="sheets" status="healthy" records={1240} lastSyncAt="2026-04-24T12:12:00Z" />
      {rows.length === 0 ? (
        <EmptyState message="No sheet rows for this athlete." />
      ) : (
        rows.map((r) => (
          <Card key={r.id} accent="#0F9D58">
            <div className="flex items-start justify-between">
              <p className="text-[14px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{r.athlete}</p>
              <span className="text-[10px] font-mono" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                {r.date} · {r.session}
              </span>
            </div>
            <p className="mt-1 text-[10px] uppercase tracking-[0.12em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
              {r.type}
            </p>
            <p className="mt-2 text-[12px]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{r.notes}</p>
          </Card>
        ))
      )}
    </div>
  )
}

function EmptyTab({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl p-6 text-center"
      style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
      <p className="text-[14px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
        {name} not connected
      </p>
      <p className="text-[12px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
        Connect {name} from the desktop dashboard to view data here.
      </p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl p-6 text-center" style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
      <p className="text-[12px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{message}</p>
    </div>
  )
}
```

---

## 10. Page — Settings — `src/features/app/coach/SettingsPage.tsx`

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronRight, Bell, Shield, Database, LogOut, Sparkles,
  UserPlus, Copy, Check, HelpCircle, RotateCcw,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { SYNTH } from '../lib/theme'

export function SettingsPage() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const inviteCode = 'PAC-W26'

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { /* ignore */ }
  }

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-safe-tab">
      <CoachPageHeader title="Settings" subtitle="Coach" back="/app/coach/home" />

      {/* Yellow candy profile card */}
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }} className="mx-5 mt-2">
        <div className="rounded-3xl p-5" style={{ background: SYNTH.cardYellow, boxShadow: SYNTH.shadow.card }}>
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
              style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontWeight: 700, fontSize: 16, letterSpacing: '0.04em' }}>
              CO
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[18px] font-bold leading-tight" style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}>
                Coach Geri
              </p>
              <p className="mt-0.5 text-[12px]" style={{ color: SYNTH.ink, opacity: 0.65, fontFamily: SYNTH.font }}>
                Pacific Women's Rowing
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <Section title="Team">
        {/* Invite-code row with copy pill */}
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderTop: 'none' }}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: SYNTH.glass, color: SYNTH.inkOnBrand, border: `1px solid ${SYNTH.glassBorder}` }}>
            <UserPlus size={18} strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold leading-tight" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
              Team invite code
            </p>
            <p className="mt-0.5 text-[12px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
              Share with athletes joining the team
            </p>
          </div>
          <button type="button" onClick={onCopy}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold"
            style={{
              background: copied ? SYNTH.accentEmerald : SYNTH.inkOnBrand,
              color: copied ? SYNTH.inkOnBrand : SYNTH.ink, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums',
            }}>
            {copied ? <Check size={12} strokeWidth={3} /> : <Copy size={12} strokeWidth={2.4} />}
            {copied ? 'Copied' : inviteCode}
          </button>
        </div>
        <Row icon={<UserPlus size={18} />} label="Invite coaches" sub="Add assistant coaches to this team" onClick={() => {}} />
        <Row icon={<Database size={18} />} label="Connector health"
          sub="6 connected · 4m last sync · all healthy" onClick={() => navigate('/app/coach/sources')} />
      </Section>

      <Section title="Preferences">
        <Row icon={<Bell size={18} />} label="Notifications" sub="Daily summary, attention alerts" onClick={() => {}} />
        <Row icon={<Sparkles size={18} />} label="synth AI" sub="Model + scope defaults" onClick={() => {}} />
        <Row icon={<Shield size={18} />} label="Privacy & sharing" sub="What athletes can see by default" onClick={() => {}} />
      </Section>

      <Section title="Help & guidance">
        <Row icon={<HelpCircle size={18} />} label="Replay tutorial" sub="Walk through the home page step-by-step" onClick={() => {}} />
        <Row icon={<RotateCcw size={18} />} label="Reset all tutorials" sub="Make every walkthrough fire on next visit" onClick={() => {}} />
      </Section>

      <section className="mx-5 mt-6">
        <button type="button" onClick={() => {}}
          className="flex w-full items-center justify-center gap-2 rounded-full py-4 active:scale-[0.99]"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`, color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font, fontSize: 14, fontWeight: 600, letterSpacing: '0.02em',
          }}>
          <LogOut size={16} strokeWidth={2.2} /> Sign out
        </button>
        <p className="mt-4 text-center text-[10px] uppercase tracking-[0.14em]"
           style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}>
          synth · v0.1 mobile
        </p>
      </section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <p className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
         style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
        {title}
      </p>
      <div className="mx-5 overflow-hidden rounded-3xl"
        style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
        {children}
      </div>
    </section>
  )
}

function Row({ icon, label, sub, onClick }: { icon: ReactNode; label: string; sub?: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={!onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-opacity active:opacity-70 disabled:opacity-100"
      style={{ borderTop: `1px solid ${SYNTH.inlineCardBorder}` }}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: SYNTH.glass, color: SYNTH.inkOnBrand, border: `1px solid ${SYNTH.glassBorder}` }}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold leading-tight" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
          {label}
        </p>
        {sub ? <p className="mt-0.5 text-[12px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{sub}</p> : null}
      </div>
      {onClick ? <ChevronRight size={16} color={SYNTH.inkOnBrandFaint} /> : null}
    </button>
  )
}
```

---

## 11. Page — Attention (bar chart) — `src/features/app/coach/AttentionPage.tsx`

```tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { TwoPaneChartSheet, type ChartPoint } from '../primitives/TwoPaneChartSheet'
import { SwipeBackPage } from '../primitives/SwipeBackPage'
import { useAttentionItems, type AttentionSeverity } from '../data/useAttentionItems'

const SEVERITY_VALUE: Record<AttentionSeverity, number> = { high: 100, med: 64, low: 32 }
const SEVERITY_COLOR: Record<AttentionSeverity, string> = {
  high: SYNTH.accentRed, med: SYNTH.accentAmber, low: SYNTH.accentEmerald,
}

export function AttentionPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const focusId = params.get('focus')
  const items = useAttentionItems()
  const [selectedId, setSelectedId] = useState<string>('')

  useEffect(() => {
    if (selectedId || items.length === 0) return
    if (focusId && items.some((it) => it.id === focusId)) setSelectedId(focusId)
    else setSelectedId(items[0]!.id)
  }, [items, focusId, selectedId])

  const data: ChartPoint[] = useMemo(
    () => items.map((it) => ({
      key: it.id, label: it.initials,
      value: SEVERITY_VALUE[it.severity], highlighted: it.id === selectedId,
    })),
    [items, selectedId],
  )

  const selected = items.find((it) => it.id === selectedId) ?? items[0]
  const others = items.filter((it) => it.id !== selected?.id)
  if (!selected) return null

  return (
    <SwipeBackPage to="/app/coach/home">
      <TwoPaneChartSheet
        title="Attention"
        subtitle={`${items.length} flagged today`}
        onBack={() => navigate('/app/coach/home')}
        data={data}
        yFormatter={(v) => `${v}`}
        yDomain={[0, 100]}
        trendLine="Severity vs 7-day baseline · tap a bar"
        onBarClick={(k) => setSelectedId(k)}
      >
        <div className="flex flex-col gap-5 pb-[96px]">
          {/* Featured flagged athlete */}
          <article>
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                style={{ background: SYNTH.sheetMuted, color: SYNTH.ink, fontFamily: SYNTH.font, fontWeight: 700, fontSize: 13, letterSpacing: '0.04em' }}>
                {selected.initials}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[18px] font-bold leading-tight tracking-[-0.01em]" style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}>
                  {selected.athleteName}
                </h2>
                <p className="mt-1 text-[14px] leading-[1.4]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
                  {selected.signal}
                </p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.14em]"
                   style={{ color: SYNTH.provenanceOnSheet, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
                  {selected.source} · synced {selected.syncedLabel}
                </p>
              </div>
              <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: SEVERITY_COLOR[selected.severity] }} />
            </div>

            <button type="button" onClick={() => navigate(`/app/coach/athlete/${selected.athleteId}`)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold"
              style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, letterSpacing: '0.02em' }}>
              Open profile <ChevronRight size={14} strokeWidth={2.4} />
            </button>
          </article>

          {/* Others flagged */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
              Others flagged
            </p>
            <div className="flex flex-col">
              {others.map((it, i) => (
                <button key={it.id} type="button" onClick={() => setSelectedId(it.id)}
                  className="flex w-full items-start gap-3 py-3 text-left active:opacity-70"
                  style={{ borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.sheetMuted}` }}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ background: SYNTH.sheetMuted, color: SYNTH.ink, fontFamily: SYNTH.font, fontWeight: 700, fontSize: 11, letterSpacing: '0.04em' }}>
                    {it.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold leading-tight" style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}>
                      {it.athleteName}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-[12px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
                      {it.signal}
                    </p>
                  </div>
                  <span className="ml-2 mt-1.5 inline-flex h-2 w-2 shrink-0 rounded-full" style={{ background: SEVERITY_COLOR[it.severity] }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </TwoPaneChartSheet>
    </SwipeBackPage>
  )
}
```

---

## 12. Page — Dashboard ("Good evening, Coach") — `src/features/app/coach/HomePage.tsx`

The home is a horizontal 2-page pager (page 0 = lineup hero, page 1 = dashboard). Below is the dashboard panel — the part matching the screenshot — plus the pager wrapper.

```tsx
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, BarChart3 } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { QuickStatsSheet } from '../primitives/SourcesSheets'
import { useUiStore } from '../../../shared/store/useUiStore'

/**
 * Coach home — horizontal pager.
 *   Page 0 (left)  = Lineup hero (dark water).
 *   Page 1 (right) = Dashboard (cobalt canvas).
 */
export function HomePage() {
  const pagerRef = useRef<HTMLDivElement | null>(null)
  const homePanelRequest = useUiStore((s) => s.homePanelRequest)
  const setHomePanelRequest = useUiStore((s) => s.setHomePanelRequest)
  const setHeroPageActive = useUiStore((s) => s.setHeroPageActive)

  const goToPage = (index: number) => {
    const el = pagerRef.current
    if (!el) return
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' })
  }

  const onPagerScroll = () => {
    const el = pagerRef.current
    if (!el) return
    const pageIdx = Math.round(el.scrollLeft / el.clientWidth)
    setHeroPageActive(pageIdx === 0)
  }

  useEffect(() => {
    setHeroPageActive(true)
    const pendingPanel = useUiStore.getState().homePanelRequest
    if (pendingPanel !== null) {
      const el = pagerRef.current
      if (el) {
        el.scrollLeft = pendingPanel * el.clientWidth
        setHeroPageActive(pendingPanel === 0)
      }
      setHomePanelRequest(null)
    }
    return () => setHeroPageActive(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (homePanelRequest === null) return
    goToPage(homePanelRequest)
    setHeroPageActive(homePanelRequest === 0)
    setHomePanelRequest(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homePanelRequest])

  return (
    <div className="relative flex flex-col overflow-hidden"
      style={{ height: '100svh', maxHeight: '100svh', background: '#050B1C' }}>
      <div ref={pagerRef} onScroll={onPagerScroll}
        className="synth-scroll flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
        style={{ scrollbarWidth: 'none', overscrollBehaviorX: 'contain' }}>
        {/* Page 0 — Lineup hero (your own component) */}
        <div className="flex h-full w-full shrink-0 snap-center">
          {/* <LineupHeroPanel onPeekDashboard={() => goToPage(1)} /> */}
        </div>
        {/* Page 1 — Dashboard */}
        <div className="flex h-full w-full shrink-0 snap-center">
          <DashboardPanel />
        </div>
      </div>
    </div>
  )
}

function DashboardPanel() {
  const navigate = useNavigate()
  const greeting = greetingForNow()
  const [statsOpen, setStatsOpen] = useState(false)

  return (
    <div className="synth-scroll flex h-full w-full flex-col overflow-y-auto pb-safe-tab"
      style={{ background: 'linear-gradient(180deg, #2E37F2 0%, #1F26C9 100%)' }}>
      {/* Header: kicker + glass stats button */}
      <header className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] pb-2"
        style={{ color: SYNTH.inkOnBrand }}>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
          synth · coach
        </span>
        <button type="button" aria-label="Quick stats" onClick={() => setStatsOpen(true)}
          className="flex h-9 items-center gap-1.5 rounded-full px-3"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`, color: SYNTH.inkOnBrand,
          }}>
          <BarChart3 size={14} strokeWidth={2.2} />
        </button>
      </header>

      <QuickStatsSheet open={statsOpen} onClose={() => setStatsOpen(false)} title="Team at a glance"
        stats={[
          { label: 'Active today', value: '38', unit: '/46', source: 'synth.', syncedAgo: 'just now' },
          { label: 'Avg recovery', value: '74', delta: { direction: 'up', value: '+3' }, source: 'WHOOP', syncedAgo: '6m' },
          { label: 'Attention', value: '10', source: 'synth.', syncedAgo: 'live' },
          { label: 'Sessions today', value: '24', source: 'Concept2', syncedAgo: '4m' },
          { label: 'Avg 2K (30d)', value: '7:14', source: 'Concept2', syncedAgo: '4m' },
          { label: 'Volume (wk)', value: '142k', unit: 'm', delta: { direction: 'up', value: '+8%' }, source: 'Concept2', syncedAgo: '4m' },
        ]} />

      {/* Big headline */}
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="px-5 pt-3 text-[26px] font-bold leading-[1.15] tracking-[-0.01em]"
        style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
        {greeting}, Coach.<br /><span>Race day in 3 days.</span>
      </motion.h1>

      {/* TODAY'S STATE inline card */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mx-5 mt-6 rounded-3xl p-5"
        style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-1.5 w-1.5 rounded-full"
            style={{ background: SYNTH.accentEmerald, boxShadow: `0 0 0 4px ${SYNTH.accentEmerald}33` }} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
            Today's state
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="flex-1 text-[18px] font-semibold leading-[1.3]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
            38 of 46 athletes synced. 24 sessions logged. 10 flags raised.
          </p>
          <ArrowUpRight size={20} color={SYNTH.inkOnBrandMuted} />
        </div>
        <p className="mt-3 text-[11px] leading-[1.5]"
           style={{ color: SYNTH.provenanceOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
          Concept2 · Strava · TrainingPeaks · last sync 4m ago
        </p>
      </motion.section>

      {/* TODAY'S PLAN — segmented timeline bars */}
      <section className="mt-7 px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
          Today's plan
        </p>
        <div className="mt-2 flex items-baseline gap-5 text-[15px] font-semibold"
             style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
          <span>6 boats</span><span style={{ color: SYNTH.inkOnBrandFaint }}>·</span>
          <span>90 min</span><span style={{ color: SYNTH.inkOnBrandFaint }}>·</span>
          <span>38 athletes</span>
        </div>
        <div className="mt-4 flex gap-1">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="flex-1 rounded-full"
              style={{ height: 4, background: i < 14 ? SYNTH.inkOnBrand : SYNTH.inlineCard, opacity: i < 14 ? 1 : 0.6 }} />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-medium" style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}>
          <span>5:00</span><span>9:00</span><span>13:00</span><span>17:00</span><span>21:00</span>
        </div>
      </section>

      {/* NEEDS YOUR EYE — candy-card carousel */}
      <section className="mt-8 pl-5">
        <header className="flex items-baseline justify-between pr-5 pb-3">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
            Needs your eye
          </h2>
          <button type="button" onClick={() => navigate('/app/coach/attention')}
            className="text-[12px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
            View all ›
          </button>
        </header>
        <div className="flex gap-3 overflow-x-auto pb-2 pr-5" style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
          <CandyCard color={SYNTH.cardSky} kicker="Today's session"
            headline="8 × 500m at 22 spm — water at 06:30." ctaLabel="Open plan"
            provenance="TrainingPeaks · synced 12m ago" onClick={() => navigate('/app/coach/lineups')} />
          <CandyCard color={SYNTH.cardYellow} kicker="Lineup"
            headline="V8 lineup posted for tomorrow — stroke seat changed." ctaLabel="Review lineup"
            provenance="Lineups · just now" onClick={() => navigate('/app/coach/lineups')} />
          <CandyCard color={SYNTH.cardMint} kicker="Race"
            headline="Pacific Invite Regatta in 3 days — Saturday, 5:30 AM." ctaLabel="Open schedule"
            provenance="Google Calendar · synced 8m ago" onClick={() => navigate('/app/coach/lineups')} />
        </div>
      </section>
    </div>
  )
}

function CandyCard({ color, kicker, headline, ctaLabel, provenance, onClick }: {
  color: string; kicker: string; headline: string; ctaLabel: string; provenance: string; onClick: () => void
}) {
  const ink = SYNTH.ink
  return (
    <motion.article whileTap={{ scale: 0.985 }} onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      className="flex shrink-0 cursor-pointer flex-col gap-3 p-6"
      style={{
        background: color, boxShadow: SYNTH.shadow.cardLifted, borderRadius: SYNTH.radius.card,
        width: 'min(86vw, 320px)', minHeight: 220, scrollSnapAlign: 'center', color: ink, fontFamily: SYNTH.font,
      }}>
      <div className="flex items-center gap-2">
        <span className="inline-flex h-1.5 w-1.5 rounded-full" style={{ background: ink }} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: ink, opacity: 0.7 }}>{kicker}</span>
      </div>
      <p className="flex-1 text-[20px] font-bold leading-[1.2] tracking-[-0.01em]" style={{ color: ink }}>{headline}</p>
      <div className="flex items-center justify-between gap-3">
        <span className="shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-semibold"
          style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand, letterSpacing: '0.02em' }}>
          {ctaLabel}
        </span>
        <span className="min-w-0 text-right text-[10px] font-medium uppercase leading-[1.3] tracking-[0.14em]"
          style={{ color: ink, opacity: 0.55, fontVariantNumeric: 'tabular-nums' }}>
          {provenance}
        </span>
      </div>
    </motion.article>
  )
}

function greetingForNow(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
```

---

## 13. Data + stores

### `src/features/app/data/mockConnectors.ts`

```ts
export type ConnectorTool = { id: string; label: string }

export type ConnectorMock = {
  id: string
  name: string
  description: string
  brandColor: string
  category: 'Erg' | 'Wearable' | 'Outdoor' | 'Recovery' | 'Planning' | 'Comms' | 'Spreadsheet' | 'S&C'
  tools: ConnectorTool[]
}

export const COACH_CONNECTORS: ConnectorMock[] = [
  {
    id: 'concept2', name: 'Concept2 Logbook', description: 'Erg history, splits, watt curves',
    brandColor: '#1A1A2E', category: 'Erg',
    tools: [
      { id: 'list-workouts', label: 'List workouts' },
      { id: 'get-workout-detail', label: 'Get workout detail' },
      { id: 'get-athlete-profile', label: 'Get athlete profile' },
      { id: 'sync-logbook', label: 'Sync logbook' },
      { id: 'read-prs', label: 'Read PRs' },
      { id: 'read-seasonal-bests', label: 'Read seasonal bests' },
    ],
  },
  {
    id: 'strava', name: 'Strava', description: 'On-water + outdoor sessions',
    brandColor: '#FC4C02', category: 'Outdoor',
    tools: [
      { id: 'list-activities', label: 'List activities' },
      { id: 'get-activity-detail', label: 'Get activity detail' },
      { id: 'read-athlete', label: 'Read athlete' },
      { id: 'read-clubs', label: 'Read clubs' },
      { id: 'read-segments', label: 'Read segments' },
      { id: 'read-kudos', label: 'Read kudos' },
    ],
  },
  {
    id: 'trainingpeaks', name: 'TrainingPeaks', description: 'Coach-authored plans + sync',
    brandColor: '#1E5BAA', category: 'Planning',
    tools: [
      { id: 'read-planned', label: 'Read planned workouts' },
      { id: 'read-completed', label: 'Read completed workouts' },
      { id: 'read-tss', label: 'Read TSS / CTL / ATL' },
      { id: 'read-zones', label: 'Read zones' },
      { id: 'read-calendar', label: 'Read calendar' },
    ],
  },
  {
    id: 'whoop', name: 'WHOOP', description: 'Recovery + strain',
    brandColor: '#000000', category: 'Recovery',
    tools: [
      { id: 'read-recovery', label: 'Read recovery score' },
      { id: 'read-strain', label: 'Read strain' },
      { id: 'read-sleep', label: 'Read sleep' },
      { id: 'read-hrv', label: 'Read HRV' },
      { id: 'read-resting-hr', label: 'Read resting HR' },
    ],
  },
  {
    id: 'apple-health', name: 'Apple Health', description: 'Phone + watch wellness',
    brandColor: '#FF2D55', category: 'Wearable',
    tools: [
      { id: 'read-sleep', label: 'Read sleep' },
      { id: 'read-hrv', label: 'Read HRV' },
      { id: 'read-resting-hr', label: 'Read resting HR' },
      { id: 'read-steps', label: 'Read steps' },
      { id: 'read-heart-rate', label: 'Read heart rate' },
      { id: 'read-workouts', label: 'Read workouts' },
    ],
  },
  {
    id: 'garmin', name: 'Garmin', description: 'Watch + HR + sleep',
    brandColor: '#007CC3', category: 'Wearable',
    tools: [
      { id: 'read-activities', label: 'Read activities' },
      { id: 'read-hr', label: 'Read heart rate' },
      { id: 'read-sleep', label: 'Read sleep' },
      { id: 'read-body-battery', label: 'Read body battery' },
      { id: 'read-training-load', label: 'Read training load' },
    ],
  },
  {
    id: 'gmail', name: 'Gmail', description: 'Forwarded emails synth ingests',
    brandColor: '#EA4335', category: 'Comms',
    tools: [
      { id: 'list-forwarded', label: 'List forwarded emails' },
      { id: 'read-attachments', label: 'Read attachments' },
      { id: 'extract-erg-results', label: 'Extract erg results' },
    ],
  },
  {
    id: 'sheets', name: 'Google Sheets', description: 'Roster + erg tracker spreadsheets',
    brandColor: '#0F9D58', category: 'Spreadsheet',
    tools: [
      { id: 'list-sheets', label: 'List sheets' },
      { id: 'read-rows', label: 'Read rows' },
      { id: 'watch-updates', label: 'Watch for updates' },
    ],
  },
  {
    id: 'oura', name: 'Oura', description: 'Sleep + readiness',
    brandColor: '#1A1A1A', category: 'Recovery',
    tools: [
      { id: 'read-sleep', label: 'Read sleep' },
      { id: 'read-readiness', label: 'Read readiness' },
      { id: 'read-temperature', label: 'Read body temperature' },
      { id: 'read-hrv', label: 'Read HRV' },
    ],
  },
  {
    id: 'bridge', name: 'Bridge Athletics', description: 'S&C program + lift tracking',
    brandColor: '#4A90D9', category: 'S&C',
    tools: [
      { id: 'read-program', label: 'Read program' },
      { id: 'read-sessions', label: 'Read sessions' },
      { id: 'read-prs', label: 'Read lift PRs' },
      { id: 'read-volume', label: 'Read training volume' },
    ],
  },
  {
    id: 'google-calendar', name: 'Google Calendar', description: 'Practice + race schedule',
    brandColor: '#4285F4', category: 'Planning',
    tools: [
      { id: 'list-events', label: 'List events' },
      { id: 'read-attendees', label: 'Read attendees' },
      { id: 'watch-changes', label: 'Watch for changes' },
    ],
  },
]
```

### `src/features/app/data/useSourcesStore.ts`

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { COACH_CONNECTORS } from './mockConnectors'

export type SourceStatus = 'synced' | 'syncing' | 'error'

export type ConnectedSource = {
  id: string
  status: SourceStatus
  lastSync: string
  enabledTools: Record<string, boolean>
}

type SourcesState = {
  sources: Record<string, ConnectedSource>
  connect: (id: string) => void
  disconnect: (id: string) => void
  toggleTool: (sourceId: string, toolId: string) => void
  setAllTools: (sourceId: string, value: boolean) => void
  togglePause: (id: string) => void
}

const SEED_CONNECTED: string[] = ['concept2', 'strava', 'trainingpeaks', 'whoop', 'apple-health', 'garmin', 'gmail', 'sheets']

function seedSources(): Record<string, ConnectedSource> {
  const out: Record<string, ConnectedSource> = {}
  for (const id of SEED_CONNECTED) {
    const meta = COACH_CONNECTORS.find((c) => c.id === id)
    if (!meta) continue
    out[id] = {
      id,
      status: id === 'garmin' ? 'error' : 'synced',
      lastSync: id === 'garmin' ? '2h ago' : id === 'gmail' ? '8m ago' : '4m ago',
      enabledTools: Object.fromEntries(meta.tools.map((t) => [t.id, true])),
    }
  }
  return out
}

export const useSourcesStore = create<SourcesState>()(
  persist(
    (set) => ({
      sources: seedSources(),
      connect: (id) =>
        set((s) => {
          if (s.sources[id]) return s
          const meta = COACH_CONNECTORS.find((c) => c.id === id)
          if (!meta) return s
          return {
            sources: {
              ...s.sources,
              [id]: {
                id, status: 'synced', lastSync: 'just now',
                enabledTools: Object.fromEntries(meta.tools.map((t) => [t.id, true])),
              },
            },
          }
        }),
      disconnect: (id) =>
        set((s) => {
          const next = { ...s.sources }
          delete next[id]
          return { sources: next }
        }),
      toggleTool: (sourceId, toolId) =>
        set((s) => {
          const src = s.sources[sourceId]
          if (!src) return s
          return {
            sources: {
              ...s.sources,
              [sourceId]: { ...src, enabledTools: { ...src.enabledTools, [toolId]: !src.enabledTools[toolId] } },
            },
          }
        }),
      setAllTools: (sourceId, value) =>
        set((s) => {
          const src = s.sources[sourceId]
          if (!src) return s
          const next: Record<string, boolean> = {}
          for (const k of Object.keys(src.enabledTools)) next[k] = value
          return { sources: { ...s.sources, [sourceId]: { ...src, enabledTools: next } } }
        }),
      togglePause: (id) =>
        set((s) => {
          const src = s.sources[id]
          if (!src) return s
          return {
            sources: { ...s.sources, [id]: { ...src, status: src.status === 'syncing' ? 'synced' : 'syncing' } },
          }
        }),
    }),
    { name: 'synth:app:sources', version: 1 },
  ),
)

export function enabledToolCount(src: ConnectedSource | undefined): number {
  if (!src) return 0
  return Object.values(src.enabledTools).filter(Boolean).length
}
```

### `src/features/coach/sources/data/demoConnectorsData.ts` (Data-view seed data)

```ts
export type DataViewTabId =
  | 'workflow' | 'google-sheets' | 'concept2' | 'strava' | 'apple-health'
  | 'whoop' | 'bridge' | 'trainingpeaks' | 'google-calendar' | 'garmin'
  | 'oura' | 'coach-notes' | 'ai-import' | 'team-chat'

export type DemoRosterAthlete = {
  id: string; name: string
  side?: 'port' | 'starboard' | 'cox'
  year?: 'FR' | 'SO' | 'JR' | 'SR' | 'GR'
}

export type InferenceLogItem = {
  id: string; at: string; title: string; detail: string
  sourceId?: DataViewTabId; status: 'success' | 'warning' | 'error'
}

export type SourceHealthRow = {
  id: DataViewTabId; name: string
  status: 'healthy' | 'stale' | 'failed' | 'pending'
  lastSyncAt: string; records: number
}

export type SheetRow = { id: string; athlete: string; date: string; session: string; type: string; notes: string }

export const TEAM_ROSTER: DemoRosterAthlete[] = [
  { id: 'ew', name: 'Ella Wheeler', side: 'port', year: 'SR' },
  { id: 'ji', name: 'Julia Irmler', side: 'starboard', year: 'SR' },
  { id: 'la', name: 'Lily Abbott', side: 'port', year: 'JR' },
  { id: 'sm', name: 'Star Miller', side: 'starboard', year: 'JR' },
  { id: 'lv', name: 'Lotta Van Westreenen', side: 'starboard', year: 'SO' },
  { id: 'or', name: 'Olivia Roth', side: 'port', year: 'SO' },
  { id: 'mb', name: 'Minou Bauman', side: 'port', year: 'SR' },
  { id: 'lc', name: 'Lola Crampin', side: 'starboard', year: 'SR' },
  { id: 'cj', name: 'Charly Johnson', side: 'cox', year: 'SR' },
]

export const SOURCE_HEALTH: SourceHealthRow[] = [
  { id: 'google-sheets', name: 'Google Sheets', status: 'healthy', lastSyncAt: '2026-04-24T12:12:00Z', records: 1240 },
  { id: 'concept2', name: 'Concept2 Logbook', status: 'healthy', lastSyncAt: '2026-04-24T12:08:00Z', records: 982 },
  { id: 'strava', name: 'Strava', status: 'stale', lastSyncAt: '2026-04-23T19:21:00Z', records: 416 },
  { id: 'apple-health', name: 'Apple Health', status: 'healthy', lastSyncAt: '2026-04-24T11:40:00Z', records: 2201 },
  { id: 'whoop', name: 'Whoop', status: 'failed', lastSyncAt: '2026-04-24T03:11:00Z', records: 0 },
  { id: 'bridge', name: 'Bridge Athletics', status: 'healthy', lastSyncAt: '2026-04-24T10:03:00Z', records: 188 },
  { id: 'trainingpeaks', name: 'TrainingPeaks', status: 'pending', lastSyncAt: '2026-04-24T00:00:00Z', records: 0 },
]

export const INFERENCE_LOG: InferenceLogItem[] = [
  { id: 'inf-1', at: '2026-04-24T12:12:22Z', title: 'Normalized new workout rows from Sheets',
    detail: 'Detected 14 new rows across 9 athletes. Mapped "AM steady" → session template.', sourceId: 'google-sheets', status: 'success' },
  { id: 'inf-2', at: '2026-04-24T12:09:10Z', title: 'Updated Concept2 PR flags',
    detail: 'Marked 2K PR for Wheeler and 6K seasonal best for Roth.', sourceId: 'concept2', status: 'success' },
  { id: 'inf-3', at: '2026-04-24T03:11:44Z', title: 'Whoop sync failed',
    detail: 'Token expired. Needs reconnect in Connectors.', sourceId: 'whoop', status: 'error' },
  { id: 'inf-4', at: '2026-04-23T19:21:33Z', title: 'Strava activity classified as cross-training',
    detail: 'Labeled 6 activities as "cross-train" based on tags and HR zone distribution.', sourceId: 'strava', status: 'warning' },
]

export const SHEETS_ROWS: SheetRow[] = [
  { id: 'r1', athlete: 'Ella Wheeler', date: 'Apr 24', session: 'AM steady', type: 'Row', notes: 'Rate cap 18. Focus catch.' },
  { id: 'r2', athlete: 'Julia Irmler', date: 'Apr 24', session: 'AM steady', type: 'Row', notes: 'Clean finishes. 2×10 at 20.' },
  { id: 'r3', athlete: 'Star Miller', date: 'Apr 24', session: 'PM lift', type: 'S&C', notes: 'Back-off volume due low recovery.' },
  { id: 'r4', athlete: 'Olivia Roth', date: 'Apr 23', session: 'Erg test', type: 'Erg', notes: '6K controlled. Negative split.' },
  { id: 'r5', athlete: 'Minou Bauman', date: 'Apr 23', session: 'AT piece', type: 'Row', notes: 'Seat racing focus. Strong mid-drive.' },
  { id: 'r6', athlete: 'Lola Crampin', date: 'Apr 22', session: 'Starts', type: 'Row', notes: 'Explosive first 10. Quick hands away.' },
]

export type Concept2Row = {
  athlete: string; date: string; testType: string; split: string
  watts: number; strokeRate: number; distance: string; isPr?: boolean; daysSince: number
}

export type StravaActivityRow = {
  id: string; athlete: string; at: string; type: string
  distanceKm: number; duration: string; pace: string; avgHr?: number; effort: number
}

export type VoiceNoteItem = { id: string; at: string; athlete: string; tags: string[]; transcript: string; extracted: string[] }

export const CONCEPT2_ROWS: Concept2Row[] = [
  { athlete: 'Phelps', date: 'Apr 20', testType: '2K', split: '1:38.2', watts: 412, strokeRate: 32, distance: '2,000m', isPr: true, daysSince: 4 },
  { athlete: 'Ella Wheeler', date: 'Apr 20', testType: 'Piece', split: '1:38.9', watts: 362, strokeRate: 35, distance: '2,000m', daysSince: 4 },
  { athlete: 'Gold', date: 'Apr 18', testType: '6K', split: '1:42.1', watts: 348, strokeRate: 28, distance: '6,000m', daysSince: 6 },
  { athlete: 'Manton', date: 'Apr 16', testType: '2K', split: '1:39.0', watts: 398, strokeRate: 33, distance: '2,000m', daysSince: 8 },
  { athlete: 'Baroni', date: 'Apr 4', testType: '30min', split: '1:48.3', watts: 276, strokeRate: 26, distance: '8,300m', daysSince: 20 },
]

export const STRAVA_ACTIVITIES: StravaActivityRow[] = [
  { id: 'str-1', athlete: 'Ella Wheeler', at: 'Apr 22, 7:15 PM', type: 'Run', distanceKm: 5.2, duration: '26:14', pace: '5:03/km', avgHr: 152, effort: 6 },
  { id: 'str-2', athlete: 'Manton', at: 'Apr 22, 6:02 PM', type: 'Cycle', distanceKm: 24.1, duration: '48:40', pace: '29.6kph', avgHr: 149, effort: 7 },
  { id: 'str-3', athlete: 'Gold', at: 'Apr 21, 5:33 PM', type: 'Run', distanceKm: 6.8, duration: '34:11', pace: '5:01/km', avgHr: 158, effort: 7 },
  { id: 'str-4', athlete: 'Holt', at: 'Apr 20, 9:20 AM', type: 'Walk', distanceKm: 4.2, duration: '38:08', pace: '9:04/km', effort: 3 },
]

export const VOICE_NOTES: VoiceNoteItem[] = [
  { id: 'note-1', at: 'Apr 22, 3:45 PM', athlete: 'Ella Wheeler', tags: ['Technique', 'Positive'],
    transcript: "Ella's catch timing has improved since we adjusted her footplate. Still late on the drive at high rates.",
    extracted: ['Catch timing improved', 'Footplate adjusted', 'Drive connection needs work at high rate'] },
  { id: 'note-2', at: 'Apr 21, 1:25 PM', athlete: 'Gold', tags: ['Wellness', 'Watchlist'],
    transcript: 'Gold reported soreness 7/10 and poor sleep after the last two sessions.',
    extracted: ['Soreness elevated (7/10)', 'Sleep debt likely', 'Recovery intervention recommended'] },
]
```

### `src/features/app/data/useAttentionItems.ts`

```ts
import { useMemo } from 'react'
// Swap this for your own roster source:
import { useAthletes } from '../../../shared/data/queries'
import type { Athlete } from '../../../shared/data/types'

export type AttentionSeverity = 'high' | 'med' | 'low'

export type AttentionSignalTemplate = {
  id: string; signal: string; source: string; syncedLabel: string; severity: AttentionSeverity
}

export type AttentionItem = AttentionSignalTemplate & { athleteId: string; athleteName: string; initials: string }

export const ATTENTION_SIGNAL_TEMPLATES: AttentionSignalTemplate[] = [
  { id: 'att-erg-slip', signal: '2K split slipped 7.2s vs 4-week avg', source: 'Concept2', syncedLabel: '36m ago', severity: 'high' },
  { id: 'att-sleep-debt', signal: 'Recovery 38 — 3 nights of poor sleep', source: 'WHOOP', syncedLabel: '12m ago', severity: 'high' },
  { id: 'att-hrv-low', signal: 'HRV 18% below baseline for 8 days', source: 'Oura', syncedLabel: '1h ago', severity: 'high' },
  { id: 'att-volume-spike', signal: 'Training volume up 42% week-over-week', source: 'Concept2', syncedLabel: '22m ago', severity: 'med' },
  { id: 'att-gym-miss', signal: 'Missed 2 of 4 planned gym sessions this week', source: 'Bridge Athletics', syncedLabel: '4h ago', severity: 'med' },
  { id: 'att-schedule-conflict', signal: 'Schedule conflict — midterm + AM practice Apr 28', source: 'Google Calendar', syncedLabel: '8m ago', severity: 'med' },
  { id: 'att-resting-hr', signal: 'Resting HR up 8 bpm — possible illness', source: 'Apple Health', syncedLabel: '18m ago', severity: 'med' },
  { id: 'att-soreness', signal: 'Soreness check-ins trending up (3 → 7 in 5 days)', source: 'synth · check-ins', syncedLabel: '2h ago', severity: 'med' },
  { id: 'att-streak', signal: 'Hit 23-day training streak — longest on team', source: 'synth', syncedLabel: 'live', severity: 'low' },
  { id: 'att-pr', signal: '5K PR — 17.4s improvement vs prior best', source: 'Concept2', syncedLabel: '6m ago', severity: 'low' },
]

function initialsOf(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('')
}

export function pairSignalsWithAthletes(templates: AttentionSignalTemplate[], athletes: Athlete[]): AttentionItem[] {
  if (athletes.length === 0) return []
  return templates.map((t, i) => {
    const athlete = athletes[i % athletes.length]!
    return { ...t, athleteId: athlete.id, athleteName: athlete.name, initials: initialsOf(athlete.name) }
  })
}

export function useAttentionItems(): AttentionItem[] {
  const { data: athletes } = useAthletes()
  return useMemo(() => pairSignalsWithAthletes(ATTENTION_SIGNAL_TEMPLATES, athletes), [athletes])
}
```

---

## Design principles recap

1. **Glass** = `rgba(255,255,255,0.14)` + `backdrop-filter: blur(24px) saturate(140%)` + `0.28` border. Use for exactly one floating control per screen. The navbar uses a darker `rgba(15,18,42,0.62)` so it reads against any backdrop.
2. **Inline cards** = `rgba(255,255,255,0.10)` flat translucent panels on the cobalt canvas (no backdrop-filter).
3. **White detail sheets** bleed to the viewport bottom and hide the floating tab bar (those pages use a swipe-back gesture).
4. **Every data point carries a provenance line** — `Source · synced Xm ago` in faint uppercase tabular-nums.
5. **Status colors are semantic**: emerald = healthy/positive, amber = warning/stale, red = failed/high-severity.
6. **Numbers** always use `fontVariantNumeric: 'tabular-nums'`.
</content>
</invoke>
