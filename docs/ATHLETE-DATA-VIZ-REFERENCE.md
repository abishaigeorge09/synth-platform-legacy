# synth. — Athlete Data Visualization Reference

Complete reference for how athlete data is visualized in the mobile app: the **dashboard**, **profile tabs (sessions / wellness / telemetry / lineups)**, the standalone **Telemetry** page, the **Erg Pacer**, and the **"Ask synth." button in the top-right corner**.

All files live under `src/features/app/athlete/` and `src/features/app/primitives/`. Routes are `/app/athlete/*`. Theme tokens (`SYNTH`) and shared primitives (`SwipeBackPage`, `CoachPageHeader`, `SheetShell`) are documented in `MOBILE-COACH-UI-REFERENCE.md`.

---

## The recurring data-viz patterns

Every athlete page is built from a handful of repeating pieces:

| Pattern | What it is |
|---|---|
| **`Card`** | `rounded-3xl` inline-card with a kicker (uppercase label) + title + chart/content |
| **Recharts** | `LineChart` (trends), `AreaChart` (power), `BarChart` (HR zones) — all dark-themed |
| **Stat tile** | small `inlineCard` with icon + uppercase label + big accent number + sub |
| **Range selector** | pill row (`2w / 4w / all` or `7d / 14d / 30d / 90d`) toggling the data slice |
| **Provenance line** | `Source · synced Xm ago` in faint uppercase tabular-nums |
| **"Ask synth." pill** | glass pill, top-right of header, `Sparkles` icon → `/app/athlete/ai` |

The chart theme is consistent everywhere:
- grid: `stroke="rgba(255,255,255,0.12)" strokeDasharray="2 4"` verticals off
- axes: `tick fill rgba(255,255,255,0.55)`, `tickLine={false} axisLine={false}`
- tooltip: `background: SYNTH.canvasInk`, `border: 1px SYNTH.glassBorder`, `borderRadius: 12`
- series colors come from `SYNTH.cardSky / cardLemon / cardPink / accentEmerald`

---

## 1. The "Ask synth." corner button (the key piece)

This is the glass pill in the **top-right corner** of the athlete profile header. It's a plain button that navigates to the AI page.

```tsx
import { Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SYNTH } from '../lib/theme'

// Inside a page header (right side):
<button
  type="button"
  aria-label="Ask synth AI"
  onClick={() => navigate('/app/athlete/ai')}
  className="flex h-10 items-center gap-1.5 rounded-full px-3"
  style={{
    background: SYNTH.glass,
    backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
    WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
    border: `1px solid ${SYNTH.glassBorder}`,
    color: SYNTH.inkOnBrand,
  }}
>
  <Sparkles size={14} strokeWidth={2.4} />
  <span className="text-[12px] font-semibold">Ask synth.</span>
</button>
```

There are **three entry points** to the AI page, all `→ /app/athlete/ai`:
1. The corner pill above (profile header).
2. The "Ask synth" card at the bottom of the home dashboard (shown in §2).
3. The `AI` tab (Sparkles icon) in the floating bottom tab bar (`AthleteFloatingTabBar`).

> On the **dashboard** and **telemetry** pages the top-right corner is instead a `Settings` gear (`→ /app/athlete/settings`) — same glass-pill pattern, different icon. The "Ask synth" affordance on the dashboard is the card near the bottom.

---

## 2. Athlete dashboard — `src/features/app/athlete/HomePage.tsx`

A horizontal 2-page pager: page 0 is a view-only lineup hero, page 1 is the GO-Club-style dashboard with swipeable **hero metric cards** (PULL / STREAK / RACE / RECOVER), each expanding to a full-screen scene. Below: coach notes + the "Ask synth" card.

```tsx
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Settings, ArrowUpRight, X, Share2 } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { APP_MOCK_ATHLETES, fmtErgTime, fmtAgo } from '../data/mockTeam'
import { APP_MOCK_NOTES } from '../data/mockNotes'
import { AthleteLineupHeroPanel } from '../coach/lineupHero/AthleteLineupHeroPanel'
import { useUiStore } from '../../../shared/store/useUiStore'

type SubMetric = { value: string; label: string }
type HeroCard = {
  word: string
  metric: string
  label: string
  provenance: string
  bg: string
  accent: string
  subMetrics: SubMetric[]
  Illustration: () => React.ReactElement
  LargeScene: () => React.ReactElement
}

export function HomePage() {
  const pagerRef = useRef<HTMLDivElement | null>(null)
  const setHeroPageActive = useUiStore((s) => s.setHeroPageActive)
  const homePanelRequest = useUiStore((s) => s.homePanelRequest)
  const setHomePanelRequest = useUiStore((s) => s.setHomePanelRequest)

  const goToPage = (index: number) => {
    const el = pagerRef.current
    if (!el) return
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' })
  }
  const onPagerScroll = () => {
    const el = pagerRef.current
    if (!el) return
    setHeroPageActive(Math.round(el.scrollLeft / el.clientWidth) === 0)
  }

  useEffect(() => {
    setHeroPageActive(true)
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
    <div className="relative flex flex-col overflow-hidden" style={{ height: '100svh', maxHeight: '100svh', background: '#050B1C' }}>
      <div ref={pagerRef} onScroll={onPagerScroll}
        className="synth-scroll flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
        style={{ scrollbarWidth: 'none', overscrollBehaviorX: 'contain' }}>
        <div className="flex h-full w-full shrink-0 snap-center">
          <AthleteLineupHeroPanel onPeekDashboard={() => goToPage(1)} />
        </div>
        <div className="flex h-full w-full shrink-0 snap-center">
          <AthleteDashboardPanel />
        </div>
      </div>
    </div>
  )
}

function AthleteDashboardPanel() {
  const navigate = useNavigate()
  const me = APP_MOCK_ATHLETES[0]
  const greeting = greetingForNow()
  const sharedNotes = APP_MOCK_NOTES.filter((n) => n.athleteId === me.id || n.visibleToAthlete).slice(0, 3)
  const [activeCard, setActiveCard] = useState(0)
  const [fullCard, setFullCard] = useState<HeroCard | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)

  const HERO_CARDS: HeroCard[] = [
    {
      word: 'PULL', metric: fmtErgTime(me.twoKBestSeconds), label: 'Best 2K time',
      provenance: 'Concept2 · 4m ago', bg: '#0B0E2A', accent: '#63B3ED',
      subMetrics: [{ value: '1:48', label: 'Avg split' }, { value: '253W', label: 'Avg power' }, { value: '2,000m', label: 'Distance' }],
      Illustration: OarIllustration, LargeScene: PullScene,
    },
    {
      word: 'STREAK', metric: `${me.streakDays}`, label: 'Days consecutive',
      provenance: 'synth · live', bg: '#071A0E', accent: SYNTH.accentEmerald,
      subMetrics: [{ value: '5', label: 'This week' }, { value: '18.2km', label: 'Volume' }, { value: '6', label: 'Record' }],
      Illustration: FlameIllustration, LargeScene: StreakScene,
    },
    {
      word: 'RACE', metric: '9', label: 'Days to Pacific Cup',
      provenance: 'Coach Geri · 2d ago', bg: '#1A0A00', accent: SYNTH.accentAmber,
      subMetrics: [{ value: '2K', label: 'Race dist.' }, { value: 'W8+', label: 'Event' }, { value: 'Fri', label: 'Tune-up' }],
      Illustration: FlagIllustration, LargeScene: RaceScene,
    },
    {
      word: 'RECOVER', metric: `${me.recoveryScore}`, label: 'Recovery score',
      provenance: 'WHOOP · 6m ago', bg: '#040C20', accent: '#34D399',
      subMetrics: [{ value: '52ms', label: 'HRV' }, { value: '7.2h', label: 'Sleep' }, { value: '84%', label: 'Readiness' }],
      Illustration: WaveformIllustration, LargeScene: RecoverScene,
    },
  ]

  const onCardScroll = () => {
    const el = cardRef.current
    if (!el) return
    setActiveCard(Math.round(el.scrollLeft / el.clientWidth))
  }

  return (
    <div className="synth-scroll flex h-full w-full flex-col overflow-y-auto pb-safe-tab"
      style={{ background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`, fontFamily: SYNTH.font }}>
      {/* Header — Settings gear top-right */}
      <header className="flex items-center justify-between px-5 pb-2" style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)', color: SYNTH.inkOnBrand }}>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
          synth · athlete
        </span>
        <button type="button" aria-label="Settings" onClick={() => navigate('/app/athlete/settings')}
          className="flex h-9 items-center gap-1.5 rounded-full px-3"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`, color: SYNTH.inkOnBrand,
          }}>
          <Settings size={14} strokeWidth={2.2} />
        </button>
      </header>

      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="px-5 pt-3">
        <h1 className="text-[26px] font-bold leading-[1.15] tracking-[-0.01em]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
          {greeting}, {me.name.split(' ')[0]}.
        </h1>
        <p className="text-[15px] leading-[1.3]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
          You're recovered. Today is a green light.
        </p>
      </motion.div>

      {/* Hero metric cards — swipeable */}
      <section className="mt-6">
        <div ref={cardRef} onScroll={onCardScroll} className="synth-scroll flex overflow-x-auto pl-5"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', gap: 12 }}>
          {HERO_CARDS.map((card) => (
            <motion.article key={card.word} whileTap={{ scale: 0.97 }} onClick={() => setFullCard(card)}
              role="button" tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFullCard(card) } }}
              className="relative flex shrink-0 cursor-pointer flex-col justify-between overflow-hidden rounded-[28px] p-5"
              style={{ background: card.bg, border: `1px solid rgba(255,255,255,0.09)`, width: 'min(82vw, 300px)', minHeight: 220, scrollSnapAlign: 'center' }}>
              {/* Watermark word */}
              <span className="pointer-events-none absolute right-3 bottom-3 select-none font-bold leading-none"
                style={{ fontSize: 80, color: 'rgba(255,255,255,0.06)', fontFamily: SYNTH.font, letterSpacing: '-0.04em' }}>
                {card.word}
              </span>
              {/* Top label */}
              <div className="flex items-center gap-2">
                <span className="inline-flex h-1.5 w-1.5 rounded-full" style={{ background: card.accent }} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: card.accent, fontFamily: SYNTH.font }}>{card.word}</span>
              </div>
              {/* Metric + illustration */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[56px] font-bold leading-none tracking-[-0.02em]" style={{ color: '#FFFFFF', fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
                    {card.metric}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: SYNTH.font }}>
                    {card.label}
                  </p>
                </div>
                <div className="shrink-0 opacity-60"><card.Illustration /></div>
              </div>
              {/* Provenance */}
              <p className="text-[10px] font-medium uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
                {card.provenance}
              </p>
            </motion.article>
          ))}
          <div className="w-5 shrink-0" />
        </div>
        {/* Page dots */}
        <div className="mt-3 flex justify-center gap-1.5 pr-5">
          {HERO_CARDS.map((_, cardIndex) => (
            <span key={cardIndex} className="rounded-full transition-all duration-200"
              style={{ width: cardIndex === activeCard ? 16 : 4, height: 4, background: cardIndex === activeCard ? SYNTH.inkOnBrand : 'rgba(255,255,255,0.25)' }} />
          ))}
        </div>
      </section>

      {/* Coach notes */}
      <section className="mt-7 px-5">
        <header className="flex items-baseline justify-between pb-3">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
            Notes from your coach
          </h2>
          <button type="button" onClick={() => navigate('/app/athlete/notes')} className="text-[12px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
            View all ›
          </button>
        </header>
        <div className="overflow-hidden rounded-3xl" style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
          {sharedNotes.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-[12px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>No notes yet. Quiet today.</p>
            </div>
          ) : (
            sharedNotes.map((note, i) => (
              <button type="button" key={note.id} onClick={() => navigate('/app/athlete/notes')}
                className="block w-full px-4 py-3.5 text-left active:opacity-80"
                style={{ borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.inlineCardBorder}` }}>
                <p className="text-[14px] leading-[1.4]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{note.body}</p>
                <p className="mt-1.5 text-[10px] uppercase tracking-[0.14em]" style={{ color: SYNTH.provenanceOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
                  Coach Geri · {fmtAgo(note.minutesAgo)}
                </p>
              </button>
            ))
          )}
        </div>
      </section>

      {/* Ask synth card */}
      <section className="mt-5 px-5">
        <button type="button" onClick={() => navigate('/app/athlete/ai')}
          className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 active:opacity-80"
          style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
          <div className="text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>Ask synth</p>
            <p className="mt-0.5 text-[14px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>"Why did my split slip last week?"</p>
          </div>
          <ArrowUpRight size={18} color={SYNTH.inkOnBrandMuted} />
        </button>
      </section>

      {/* Full-screen card overlay (portal) — see the expand-to-scene section below */}
      {/* ...createPortal(<AnimatePresence>{fullCard && (...)}</AnimatePresence>, document.body) ... */}
    </div>
  )
}

function greetingForNow(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
```

### The expand-to-full-screen scene overlay (tap a hero card)

```tsx
{typeof document !== 'undefined' &&
  createPortal(
    <AnimatePresence>
      {fullCard && (
        <>
          <motion.div key="full-card-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} className="fixed inset-0 z-[90]"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }} />
          <motion.div key="full-card" initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            className="fixed inset-x-0 bottom-0 z-[100] flex flex-col overflow-hidden"
            style={{ top: 0, background: fullCard.bg, fontFamily: SYNTH.font }}>
            {/* Top bar */}
            <div className="flex shrink-0 items-center justify-between px-6" style={{ paddingTop: 'max(env(safe-area-inset-top), 24px)', paddingBottom: 12 }}>
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: fullCard.accent, fontFamily: SYNTH.font }}>{fullCard.word}</span>
              <motion.button type="button" aria-label="Close" whileTap={{ scale: 0.9 }} onClick={() => setFullCard(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', color: '#FFFFFF' }}>
                <X size={18} strokeWidth={2.4} />
              </motion.button>
            </div>
            {/* Large illustration fills the center */}
            <div className="flex flex-1 items-center justify-center"><fullCard.LargeScene /></div>
            {/* Stats overlay at bottom */}
            <div className="shrink-0 px-7" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 36px)' }}>
              <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: SYNTH.font }}>{fmtFullDate()}</p>
              <p className="mt-1 leading-none font-bold tracking-[-0.03em]"
                style={{ fontSize: 'clamp(56px, 18vw, 80px)', color: '#FFFFFF', fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
                {fullCard.metric}
              </p>
              <p className="mt-1 text-[15px] font-semibold" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: SYNTH.font }}>{fullCard.label}</p>
              {/* Sub-metrics */}
              <div className="mt-5 flex gap-8">
                {fullCard.subMetrics.map((sm) => (
                  <div key={sm.label}>
                    <p className="text-[22px] font-bold leading-none" style={{ color: '#FFFFFF', fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{sm.value}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: SYNTH.font }}>{sm.label}</p>
                  </div>
                ))}
              </div>
              {/* Dots + Share CTA */}
              <div className="mt-6 flex gap-2">
                {HERO_CARDS.map((c) => (
                  <span key={c.word} className="rounded-full transition-all duration-200"
                    style={{ width: c.word === fullCard.word ? 20 : 6, height: 6, background: c.word === fullCard.word ? fullCard.accent : 'rgba(255,255,255,0.25)' }} />
                ))}
              </div>
              <motion.button type="button" whileTap={{ scale: 0.97 }}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full py-4 text-[14px] font-semibold"
                style={{ background: fullCard.accent + '1A', border: `1.5px solid ${fullCard.accent}55`, color: fullCard.accent, fontFamily: SYNTH.font, letterSpacing: '0.02em' }}>
                <Share2 size={16} strokeWidth={2.2} /> Share
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )}

function fmtFullDate(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })
}
```

### The hero card illustrations (small glyphs)

```tsx
function OarIllustration() {
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" fill="none" aria-hidden>
      <line x1={10} y1={46} x2={46} y2={10} stroke="rgba(255,255,255,0.7)" strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={8} cy={48} rx={7} ry={3} fill="rgba(255,255,255,0.5)" transform="rotate(-45 8 48)" />
      <circle cx={44} cy={12} r={4} fill="rgba(99,179,237,0.8)" />
    </svg>
  )
}

function FlameIllustration() {
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" fill="none" aria-hidden>
      <path d="M28 48 C14 40 10 28 18 20 C18 28 24 30 24 30 C22 20 28 10 28 10 C28 10 38 20 36 30 C36 30 42 28 42 20 C50 28 46 40 28 48Z" fill="rgba(245,158,11,0.6)" />
      <path d="M28 44 C20 38 18 30 22 24 C22 30 26 32 26 32 C25 26 28 18 28 18 C28 18 34 26 32 32 C32 32 36 30 36 24 C40 30 38 38 28 44Z" fill="rgba(245,158,11,0.9)" />
      <circle cx={28} cy={38} r={4} fill="rgba(255,255,255,0.4)" />
    </svg>
  )
}

function FlagIllustration() {
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" fill="none" aria-hidden>
      <line x1={14} y1={10} x2={14} y2={48} stroke="rgba(255,255,255,0.7)" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M14 12 L42 18 L38 30 L14 30 Z" fill="rgba(245,158,11,0.7)" />
      <line x1={10} y1={44} x2={46} y2={44} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}

function WaveformIllustration() {
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" fill="none" aria-hidden>
      <polyline points="4,28 10,28 14,14 20,42 26,20 32,36 38,22 42,34 46,28 52,28" stroke="rgba(52,211,153,0.8)" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={28} cy={28} r={3} fill="rgba(52,211,153,0.6)" />
    </svg>
  )
}
```

> The four `LargeScene` components (`PullScene`, `StreakScene`, `RaceScene`, `RecoverScene`) are large decorative SVG scenes (rowing-at-night, flame+streak-calendar, race-finish, moon+HRV-waveform+recovery-ring). They're ~80 lines of SVG each — full source is in `HomePage.tsx` lines 619–953. The `RecoverScene` is the only data-driven one: its recovery ring arc uses `strokeDasharray={`${2*Math.PI*50*0.84} ${2*Math.PI*50}`}` to draw 84%.

---

## 3. Athlete profile (the tabbed data hub) — `src/features/app/athlete/MyProfilePage.tsx`

This is the centerpiece: a tabbed profile (Overview · Sessions · Lineups · Wellness · Telemetry · Notes · Settings) with the **"Ask synth." pill in the top-right corner**. Wrapped in `SwipeBackPage`.

### Page shell + header (with the corner button) + tab strip

```tsx
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Mic, Plus, Activity, Zap, Heart, Bell, Shield, Eye, User as UserIcon } from 'lucide-react'
import {
  Line, LineChart, AreaChart, Area, BarChart, Bar, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { toast } from '../../../shared/store/useToastStore'
import { useNavigate } from 'react-router-dom'
import { SYNTH } from '../lib/theme'
import { AchievementSheet, type AchievementKey } from './AchievementSheet'
import { SwipeBackPage } from '../primitives/SwipeBackPage'
import {
  useAthletes, useAthleteProfileSessions, useAthleteProfileLineups,
  useAthleteWellness, useAthleteCoachNotes,
} from '../../../shared/data/queries'
import { DEMO_TIMELINE_90_DAY, getDemoAthleteOverview } from '../../../features/coach/athletes/data/demoData'
import { APP_MOCK_ATHLETES } from '../data/mockTeam'

type TabKey = 'overview' | 'sessions' | 'lineups' | 'wellness' | 'telemetry' | 'notes' | 'settings'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' }, { key: 'sessions', label: 'Sessions' },
  { key: 'lineups', label: 'Lineups' }, { key: 'wellness', label: 'Wellness' },
  { key: 'telemetry', label: 'Telemetry' }, { key: 'notes', label: 'Notes' },
  { key: 'settings', label: 'Settings' },
]

type RangeKey = '7d' | '14d' | '30d' | '90d'

function splitToSeconds(split: string): number {
  const [mm, ss] = split.split(':')
  const m = parseInt(mm ?? '', 10)
  const s = parseFloat(ss ?? '')
  if (!Number.isFinite(m) || !Number.isFinite(s)) return Number.NaN
  return m * 60 + s
}
function fmtSplit(seconds?: number) {
  if (seconds === undefined || !Number.isFinite(seconds)) return '—'
  const m = Math.floor(seconds / 60)
  const s = (seconds - m * 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

export function MyProfilePage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabKey>('overview')
  const { data: athletes } = useAthletes()
  const me = APP_MOCK_ATHLETES[0]
  const athlete = useMemo(() => athletes.find((a) => a.id === me.id) ?? athletes[0], [athletes, me.id])

  if (!athlete) {
    return (
      <div className="flex flex-1 items-center justify-center px-5"
        style={{ background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
        Loading…
      </div>
    )
  }

  return (
    <SwipeBackPage to="/app/athlete/home">
      <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-safe-tab"
        style={{ background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`, fontFamily: SYNTH.font }}>
        {/* Header — Ask synth. pill top-right */}
        <div className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] pb-2" style={{ color: SYNTH.inkOnBrand }}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: SYNTH.inkOnBrandMuted }}>synth · athlete</p>
            <h1 className="mt-0.5 text-[20px] font-bold leading-tight">{athlete.name}</h1>
          </div>
          <button type="button" aria-label="Ask synth AI" onClick={() => navigate('/app/athlete/ai')}
            className="flex h-10 items-center gap-1.5 rounded-full px-3"
            style={{
              background: SYNTH.glass,
              backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              border: `1px solid ${SYNTH.glassBorder}`, color: SYNTH.inkOnBrand,
            }}>
            <Sparkles size={14} strokeWidth={2.4} />
            <span className="text-[12px] font-semibold">Ask synth.</span>
          </button>
        </div>

        {/* Tab strip — glass pill row, horizontal scroll */}
        <div className="mt-2 px-5">
          <div className="synth-scroll flex gap-1.5 overflow-x-auto rounded-full p-1"
            style={{
              background: SYNTH.glass,
              backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              border: `1px solid ${SYNTH.glassBorder}`, scrollbarWidth: 'none',
            }}>
            {TABS.map((t) => {
              const active = tab === t.key
              return (
                <button key={t.key} type="button" onClick={() => setTab(t.key)}
                  className="shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors"
                  style={{ background: active ? SYNTH.inkOnBrand : 'transparent', color: active ? SYNTH.ink : SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab content — fades on switch */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="mt-4">
            {tab === 'overview'  && <OverviewTab  athleteId={athlete.id} athleteName={athlete.name} />}
            {tab === 'sessions'  && <SessionsTab  athleteId={athlete.id} />}
            {tab === 'lineups'   && <LineupsTab   athleteId={athlete.id} />}
            {tab === 'wellness'  && <WellnessTab  athleteId={athlete.id} />}
            {tab === 'telemetry' && <TelemetryTab />}
            {tab === 'notes'     && <NotesTab     athleteId={athlete.id} />}
            {tab === 'settings'  && <SettingsTab  athleteName={athlete.name} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </SwipeBackPage>
  )
}
```

### Overview tab — headline tiles + 90-day multi-series timeline + recovery stats

```tsx
function OverviewTab({ athleteId, athleteName }: { athleteId: string; athleteName: string }) {
  const demo = useMemo(
    () => getDemoAthleteOverview({ id: athleteId, name: athleteName, side: 'both', status: 'active', year: 'SO' }),
    [athleteId, athleteName],
  )
  const [range, setRange] = useState<RangeKey>('30d')
  const [seriesOn, setSeriesOn] = useState({ erg: true, trainingLoad: true, recovery: true, sleep: false })
  const [openAchievement, setOpenAchievement] = useState<AchievementKey | null>(null)

  const timeline = useMemo(() => {
    const n = range === '7d' ? 7 : range === '14d' ? 14 : range === '30d' ? 30 : 90
    return DEMO_TIMELINE_90_DAY.slice(-n)
  }, [range])

  return (
    <div className="flex flex-col gap-4 px-5">
      {/* Tappable headline tiles → AchievementSheet */}
      <div className="grid grid-cols-2 gap-2">
        <HeadlineTile label="2K test" value={demo.headline.twoK.value} sub={demo.headline.twoK.delta} accent={SYNTH.cardSky} onClick={() => setOpenAchievement('twoK')} />
        <HeadlineTile label="Avg split /500" value={demo.headline.avgSplit.value} sub={demo.headline.avgSplit.delta} accent={SYNTH.accentEmerald} onClick={() => setOpenAchievement('split')} />
        <HeadlineTile label="Training load" value={demo.headline.trainingLoad.value} sub={demo.headline.trainingLoad.delta} accent={SYNTH.cardLemon} onClick={() => setOpenAchievement('load')} />
        <HeadlineTile label="Recovery" value={demo.headline.recovery.value} sub={demo.recovery.concern} accent={SYNTH.accentEmerald} onClick={() => setOpenAchievement('recovery')} />
        <HeadlineTile label="Injury risk" value={demo.headline.injuryRisk.level} sub={demo.headline.injuryRisk.factors[0] ?? ''} accent={demo.headline.injuryRisk.level === 'LOW' ? SYNTH.accentEmerald : SYNTH.accentAmber} pill onClick={() => setOpenAchievement('risk')} />
        <HeadlineTile label="Data quality" value={demo.headline.dataQuality.value} sub={`${demo.headline.dataQuality.connectedSources} sources`} accent={SYNTH.cardMint} onClick={() => setOpenAchievement('data')} />
      </div>
      <AchievementSheet open={openAchievement !== null} achievementKey={openAchievement} onClose={() => setOpenAchievement(null)} />

      {/* 90-day timeline — dual Y axis, toggleable series via legend pills */}
      <Card kicker="Performance synthesis" title="90-day timeline">
        <div className="flex flex-wrap items-center gap-1.5 pb-3">
          {(['7d', '14d', '30d', '90d'] as RangeKey[]).map((k) => {
            const active = range === k
            return (
              <button key={k} type="button" onClick={() => setRange(k)}
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                style={{ background: active ? SYNTH.inkOnBrand : 'transparent', border: `1px solid ${active ? SYNTH.inkOnBrand : SYNTH.glassBorder}`, color: active ? SYNTH.ink : SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                {k}
              </button>
            )
          })}
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} strokeDasharray="2 4" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis yAxisId="left" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} domain={[96, 106]} />
              <Tooltip contentStyle={{ background: SYNTH.canvasInk, border: `1px solid ${SYNTH.glassBorder}`, borderRadius: 12, fontSize: 11, color: SYNTH.inkOnBrand }} labelStyle={{ color: SYNTH.inkOnBrandMuted }} />
              {seriesOn.erg && <Line yAxisId="right" type="monotone" dataKey="ergSplitSec" stroke={SYNTH.cardSky} strokeWidth={2} dot={false} name="Erg split" />}
              {seriesOn.trainingLoad && <Line yAxisId="left" type="monotone" dataKey="trainingLoad" stroke={SYNTH.cardLemon} strokeWidth={2} dot={false} name="Load" />}
              {seriesOn.recovery && <Line yAxisId="left" type="monotone" dataKey="recovery" stroke={SYNTH.accentEmerald} strokeWidth={2} dot={false} name="Recovery" />}
              {seriesOn.sleep && <Line yAxisId="left" type="monotone" dataKey="sleepHours" stroke={SYNTH.cardPink} strokeWidth={2} dot={false} name="Sleep" />}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <LegendPill label="Erg" color={SYNTH.cardSky} on={seriesOn.erg} onToggle={() => setSeriesOn((s) => ({ ...s, erg: !s.erg }))} />
          <LegendPill label="Load" color={SYNTH.cardLemon} on={seriesOn.trainingLoad} onToggle={() => setSeriesOn((s) => ({ ...s, trainingLoad: !s.trainingLoad }))} />
          <LegendPill label="Recovery" color={SYNTH.accentEmerald} on={seriesOn.recovery} onToggle={() => setSeriesOn((s) => ({ ...s, recovery: !s.recovery }))} />
          <LegendPill label="Sleep" color={SYNTH.cardPink} on={seriesOn.sleep} onToggle={() => setSeriesOn((s) => ({ ...s, sleep: !s.sleep }))} />
        </div>
      </Card>

      <Card kicker="Recovery" title="Sleep · HRV · resting HR">
        <div className="grid grid-cols-2 gap-2">
          <MiniStat label="Recovery" value={`${demo.recoveryDetails.recoveryScore}/100`} sub={`Strain ${demo.recoveryDetails.strain.toFixed(1)}`} />
          <MiniStat label="Sleep" value={`${demo.recoveryDetails.sleepLastNightHours.toFixed(1)}h`} sub={`${demo.recoveryDetails.sleepQualityPct}% quality`} />
          <MiniStat label="HRV" value={`${demo.recoveryDetails.hrvMs}ms`} sub={`Baseline ${demo.recoveryDetails.hrvBaselineMs}ms`} />
          <MiniStat label="Resting HR" value={`${demo.recoveryDetails.restingHrBpm} bpm`} sub={`Baseline ${demo.recoveryDetails.restingHrBaselineBpm}`} />
        </div>
      </Card>

      <Card kicker="Schedule" title="Next 5 days" subtitle={demo.scheduleConflict}>
        <div className="space-y-2">
          {demo.schedule.map((d) => (
            <div key={d.date} className="rounded-2xl px-3 py-2.5"
              style={{ background: d.flagged ? `${SYNTH.accentAmber}1F` : SYNTH.glass, border: `1px solid ${d.flagged ? `${SYNTH.accentAmber}55` : SYNTH.glassBorder}` }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{d.date}</p>
              <p className="mt-1 text-[12px]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{d.items}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
```

### Sessions tab — split-trend line chart + session list with split chips

```tsx
function SessionsTab({ athleteId }: { athleteId: string }) {
  const { data: sessions } = useAthleteProfileSessions(athleteId)

  const splitSeries = useMemo(() =>
    [...sessions].reverse().map((s) => {
      const secs = s.splits.map(splitToSeconds).filter((v) => Number.isFinite(v))
      const avg = secs.length ? secs.reduce((a, b) => a + b, 0) / secs.length : Number.NaN
      return { date: s.date.slice(5), avgSplit: avg, bestSplit: secs.length ? Math.min(...secs) : Number.NaN }
    }), [sessions])

  return (
    <div className="flex flex-col gap-4 px-5">
      <Card kicker="Split trend" title="Avg + best /500 over time">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={splitSeries} margin={{ top: 8, right: 8, bottom: 4, left: -10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} strokeDasharray="2 4" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} tickFormatter={(v) => fmtSplit(v as number)} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip contentStyle={{ background: SYNTH.canvasInk, border: `1px solid ${SYNTH.glassBorder}`, borderRadius: 12, fontSize: 11, color: SYNTH.inkOnBrand }} labelStyle={{ color: SYNTH.inkOnBrandMuted }} formatter={(v, k) => [fmtSplit(v as number), k === 'avgSplit' ? 'Avg' : 'Best']} />
              <Line type="monotone" dataKey="avgSplit" stroke={SYNTH.cardSky} strokeWidth={2.2} dot={false} />
              <Line type="monotone" dataKey="bestSplit" stroke={SYNTH.accentEmerald} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card kicker="Sessions" title={`${sessions.length} workouts logged`}>
        <div className="space-y-2">
          {sessions.slice(0, 12).map((s) => (
            <div key={s.id} className="rounded-2xl px-3 py-2.5" style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}` }}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{s.title}</p>
                <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{s.date}</p>
              </div>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{s.boat} · seat {s.seat}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {s.splits.map((split, i) => (
                  <span key={i} className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: SYNTH.glassActive, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{split}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
```

### Lineups tab — side-colored assignment list

```tsx
function LineupsTab({ athleteId }: { athleteId: string }) {
  const { data: lineups } = useAthleteProfileLineups(athleteId)
  return (
    <div className="px-5">
      <Card kicker="Lineup history" title={`${lineups.length} assignments this season`}>
        <div className="space-y-2">
          {lineups.slice(0, 24).map((l) => (
            <div key={l.id} className="flex items-center justify-between rounded-2xl px-3 py-2.5"
              style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}`, borderLeft: `3px solid ${l.side === 'port' ? SYNTH.cardSky : SYNTH.cardPink}` }}>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{l.boat} · seat {l.seat}</p>
                <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{l.date} · {l.session}</p>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                style={{ background: l.side === 'port' ? `${SYNTH.cardSky}40` : `${SYNTH.cardPink}40`, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{l.side}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
```

### Wellness tab — current pills + 14-day recovery/HR/HRV line chart

```tsx
function WellnessTab({ athleteId }: { athleteId: string }) {
  const { data: checkins } = useAthleteWellness(athleteId)
  const latest = checkins[checkins.length - 1]
  const chartData = checkins.slice(-14).map((c) => ({ date: c.date.slice(5), sleep: c.sleepHours, hr: c.restingHr, hrv: c.hrv, recovery: c.recovery }))

  return (
    <div className="flex flex-col gap-4 px-5">
      {latest ? (
        <div className="grid grid-cols-3 gap-2">
          <WellnessPill label="Sleep" value={`${latest.sleepHours.toFixed(1)}h`} accent={SYNTH.cardSky} />
          <WellnessPill label="HR" value={`${latest.restingHr}`} accent={SYNTH.cardPink} />
          <WellnessPill label="Recovery" value={`${latest.recovery}%`} accent={SYNTH.accentEmerald} />
        </div>
      ) : null}
      <Card kicker="14-day rolling" title="Recovery · HR · sleep">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} strokeDasharray="2 4" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: SYNTH.canvasInk, border: `1px solid ${SYNTH.glassBorder}`, borderRadius: 12, fontSize: 11, color: SYNTH.inkOnBrand }} labelStyle={{ color: SYNTH.inkOnBrandMuted }} />
              <Line type="monotone" dataKey="recovery" stroke={SYNTH.accentEmerald} strokeWidth={2.2} dot={false} name="Recovery" />
              <Line type="monotone" dataKey="hr" stroke={SYNTH.cardPink} strokeWidth={2} dot={false} name="HR" />
              <Line type="monotone" dataKey="hrv" stroke={SYNTH.cardSky} strokeWidth={2} dot={false} name="HRV" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
```

### Notes tab — add-note composer + tagged coach-note feed

```tsx
function NotesTab({ athleteId }: { athleteId: string }) {
  const { data: notes } = useAthleteCoachNotes(athleteId)
  const [draft, setDraft] = useState('')

  return (
    <div className="flex flex-col gap-4 px-5">
      <Card kicker="New note" title="Add observation">
        <div className="flex items-center gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type or hold mic…"
            className="h-10 flex-1 rounded-full px-4 text-[13px] outline-none"
            style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}`, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }} />
          <button type="button" aria-label="Voice" className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}`, color: SYNTH.inkOnBrand }}>
            <Mic size={14} strokeWidth={2.4} />
          </button>
          <button type="button" aria-label="Add" disabled={!draft.trim()} onClick={() => setDraft('')}
            className="flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-50"
            style={{ background: SYNTH.inkOnBrand, color: SYNTH.ink }}>
            <Plus size={16} strokeWidth={2.6} />
          </button>
        </div>
      </Card>

      <Card kicker="Coach notes" title={`${notes.length} observations`}>
        <div className="space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="rounded-2xl px-3 py-2.5" style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}` }}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{n.date}</span>
                {n.isTranscription ? (
                  <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ background: `${SYNTH.cardPink}40`, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>Voice</span>
                ) : null}
                <div className="ml-auto flex gap-1">
                  {n.tags.map((t) => (
                    <span key={t} className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                      style={{ background: t === 'Positive' ? `${SYNTH.accentEmerald}33` : t === 'Flag' || t === 'Concern' ? `${SYNTH.accentRed}33` : `${SYNTH.cardSky}33`, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{t}</span>
                  ))}
                </div>
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{n.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
```

### Settings tab — notification + privacy toggles

```tsx
const ATHLETE_SETTING_ROWS = [
  { key: 'notif_session', icon: <Bell size={14} strokeWidth={2.2} />, label: 'Session reminders', on: true },
  { key: 'notif_coach',   icon: <Bell size={14} strokeWidth={2.2} />, label: 'Coach note alerts', on: true },
  { key: 'share_wellness', icon: <Eye size={14} strokeWidth={2.2} />, label: 'Share wellness with coach', on: true },
  { key: 'share_splits',   icon: <Shield size={14} strokeWidth={2.2} />, label: 'Share split data', on: true },
  { key: 'share_hr',       icon: <UserIcon size={14} strokeWidth={2.2} />, label: 'Share HR zones', on: false },
]

function SettingsTab({ athleteName }: { athleteName: string }) {
  const [rows, setRows] = useState(ATHLETE_SETTING_ROWS)
  const toggle = (key: string) => setRows((prev) => prev.map((r) => (r.key === key ? { ...r, on: !r.on } : r)))

  const ToggleRow = ({ r, i }: { r: typeof ATHLETE_SETTING_ROWS[number]; i: number }) => (
    <div key={r.key} className="flex items-center justify-between py-3" style={{ borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.glassBorder}` }}>
      <div className="flex items-center gap-2" style={{ color: SYNTH.inkOnBrandMuted }}>
        {r.icon}
        <p className="text-[13px]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{r.label}</p>
      </div>
      <button type="button" onClick={() => toggle(r.key)} className="flex h-6 w-11 items-center rounded-full p-0.5"
        style={{ background: r.on ? SYNTH.accentEmerald : SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}` }} aria-pressed={r.on}>
        <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 32 }} className="block h-5 w-5 rounded-full" style={{ background: SYNTH.inkOnBrand, marginLeft: r.on ? 18 : 0 }} />
      </button>
    </div>
  )

  return (
    <div className="flex flex-col gap-4 px-5">
      <Card kicker="Notifications" title="Alert preferences">
        <div className="flex flex-col">{rows.filter((r) => r.key.startsWith('notif')).map((r, i) => <ToggleRow key={r.key} r={r} i={i} />)}</div>
      </Card>
      <Card kicker="Privacy" title={`${athleteName.split(' ')[0]} — what coach can see`}>
        <div className="flex flex-col">{rows.filter((r) => r.key.startsWith('share')).map((r, i) => <ToggleRow key={r.key} r={r} i={i} />)}</div>
      </Card>
      <Card kicker="Account" title="Status">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: SYNTH.accentEmerald }} />
          <p className="text-[13px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>Active</p>
          <p className="text-[11px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>· Pacific Women's Rowing</p>
        </div>
      </Card>
    </div>
  )
}
```

### Shared profile primitives (Card / HeadlineTile / MiniStat / LegendPill / WellnessPill)

```tsx
function Card({ kicker, title, subtitle, children }: { kicker: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl p-4" style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{kicker}</p>
      <h3 className="mt-0.5 text-[15px] font-bold leading-tight" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{title}</h3>
      {subtitle ? <p className="mt-0.5 text-[11px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{subtitle}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  )
}

function HeadlineTile({ label, value, sub, accent, pill, onClick }: { label: string; value: string; sub: string; accent: string; pill?: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-3xl p-3 text-left transition-opacity active:opacity-75"
      style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}`, cursor: onClick ? 'pointer' : 'default' }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{label}</p>
      {pill
        ? <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[12px] font-bold uppercase tracking-wider" style={{ background: accent, color: SYNTH.ink, fontFamily: SYNTH.font }}>{value}</span>
        : <p className="mt-0.5 text-[18px] font-bold" style={{ color: accent, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{value}</p>}
      <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{sub}</p>
    </button>
  )
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl px-3 py-2.5" style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}` }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{label}</p>
      <p className="mt-0.5 text-[14px] font-bold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      <p className="text-[10px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{sub}</p>
    </div>
  )
}

function LegendPill({ label, color, on, onToggle }: { label: string; color: string; on: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
      style={{ background: on ? `${color}26` : 'transparent', border: `1px solid ${on ? color : SYNTH.glassBorder}`, color: on ? SYNTH.inkOnBrand : SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: on ? color : SYNTH.glassBorder }} />
      {label}
    </button>
  )
}

function WellnessPill({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-3xl p-3 text-center" style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{label}</p>
      <p className="mt-0.5 text-[18px] font-bold" style={{ color: accent, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
    </div>
  )
}
```

---

## 4. Telemetry — `src/features/app/athlete/TelemetryPage.tsx`

Standalone page (`/app/athlete/telemetry`) — the same content as the profile's Telemetry tab, but full-page with a header. Stroke-rate line, power area, HR-zone bar, split consistency, AI report CTA. (The profile's `TelemetryTab` is the identical body without the page header.)

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Activity, Zap, Heart, Settings } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { SYNTH } from '../lib/theme'
import { toast } from '../../../shared/store/useToastStore'

// ── Demo telemetry data ──
const TELEM_STROKE: { date: string; spm: number; target: number }[] = [
  { date: '4/01', spm: 18, target: 20 }, { date: '4/05', spm: 19, target: 20 },
  { date: '4/08', spm: 22, target: 22 }, { date: '4/12', spm: 23, target: 22 },
  { date: '4/15', spm: 24, target: 24 }, { date: '4/19', spm: 25, target: 24 },
  { date: '4/22', spm: 26, target: 26 }, { date: '4/26', spm: 27, target: 26 },
  { date: '4/29', spm: 28, target: 28 },
]
const TELEM_POWER: { date: string; watts: number }[] = [
  { date: '4/01', watts: 180 }, { date: '4/05', watts: 185 }, { date: '4/08', watts: 204 },
  { date: '4/12', watts: 211 }, { date: '4/15', watts: 220 }, { date: '4/19', watts: 228 },
  { date: '4/22', watts: 235 }, { date: '4/26', watts: 241 }, { date: '4/29', watts: 248 },
]
const TELEM_HR_ZONES: { zone: string; minutes: number; color: string }[] = [
  { zone: 'Z1', minutes: 22, color: '#6366F1' }, { zone: 'Z2', minutes: 48, color: '#10B981' },
  { zone: 'Z3', minutes: 31, color: '#F59E0B' }, { zone: 'Z4', minutes: 18, color: '#F97316' },
  { zone: 'Z5', minutes: 9, color: '#EF4444' },
]
const TELEM_SPLITS: { piece: string; split: number; target: number }[] = [
  { piece: 'P1', split: 101.4, target: 101 }, { piece: 'P2', split: 101.2, target: 101 },
  { piece: 'P3', split: 100.9, target: 101 }, { piece: 'P4', split: 100.6, target: 101 },
  { piece: 'P5', split: 101.1, target: 101 }, { piece: 'P6', split: 100.8, target: 101 },
]

function fmtTelemSplit(v: number) {
  const m = Math.floor(v / 60)
  const s = (v - m * 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

export function TelemetryPage() {
  const navigate = useNavigate()
  const [range, setRange] = useState<'2w' | '4w' | 'all'>('4w')
  const spmSlice = range === '2w' ? TELEM_STROKE.slice(-4) : range === '4w' ? TELEM_STROKE.slice(-6) : TELEM_STROKE
  const pwrSlice = range === '2w' ? TELEM_POWER.slice(-4) : range === '4w' ? TELEM_POWER.slice(-6) : TELEM_POWER

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-safe-tab"
      style={{ background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`, fontFamily: SYNTH.font }}>
      {/* Header — Settings gear top-right */}
      <div className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] pb-2" style={{ color: SYNTH.inkOnBrand }}>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>synth · athlete</p>
          <h1 className="mt-0.5 text-[20px] font-bold leading-tight">Telemetry</h1>
        </div>
        <button type="button" aria-label="Settings" onClick={() => navigate('/app/athlete/settings')}
          className="flex h-9 items-center gap-1.5 rounded-full px-3"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`, color: SYNTH.inkOnBrand,
          }}>
          <Settings size={14} strokeWidth={2.2} />
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }} className="mt-4 flex flex-col gap-4 px-5">
        {/* Range selector */}
        <div className="flex items-center gap-1.5">
          {(['2w', '4w', 'all'] as const).map((k) => (
            <button key={k} type="button" onClick={() => setRange(k)}
              className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{ background: range === k ? SYNTH.inkOnBrand : 'transparent', border: `1px solid ${range === k ? SYNTH.inkOnBrand : SYNTH.glassBorder}`, color: range === k ? SYNTH.ink : SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
              {k}
            </button>
          ))}
        </div>

        {/* Summary tiles */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <Activity size={13} strokeWidth={2.2} />, label: 'Avg SPM', value: '24.2', sub: '↑ 1.8 vs prev', accent: SYNTH.cardSky },
            { icon: <Zap size={13} strokeWidth={2.2} />, label: 'Peak watts', value: '248W', sub: '↑ 12W month', accent: SYNTH.cardLemon },
            { icon: <Heart size={13} strokeWidth={2.2} />, label: 'Avg HR', value: '162', sub: 'bpm · 84% max', accent: SYNTH.cardPink },
          ].map((t) => (
            <div key={t.label} className="rounded-3xl p-3" style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
              <div className="flex items-center gap-1" style={{ color: t.accent }}>{t.icon}</div>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{t.label}</p>
              <p className="mt-0.5 text-[16px] font-bold" style={{ color: t.accent, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{t.value}</p>
              <p className="text-[9px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{t.sub}</p>
            </div>
          ))}
        </div>

        {/* Stroke rate — line vs dashed target */}
        <Card kicker="Stroke rate" title="SPM vs target">
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spmSlice} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} strokeDasharray="2 4" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} domain={[16, 30]} />
                <Tooltip contentStyle={{ background: SYNTH.canvasInk, border: `1px solid ${SYNTH.glassBorder}`, borderRadius: 12, fontSize: 11, color: SYNTH.inkOnBrand }} labelStyle={{ color: SYNTH.inkOnBrandMuted }} formatter={(v, k) => [`${v} spm`, k === 'spm' ? 'Actual' : 'Target']} />
                <Line type="monotone" dataKey="target" stroke="rgba(255,255,255,0.22)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="target" />
                <Line type="monotone" dataKey="spm" stroke={SYNTH.cardSky} strokeWidth={2.2} dot={{ r: 3, fill: SYNTH.cardSky }} name="spm" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Power output — gradient area */}
        <Card kicker="Power output" title="Watts per session">
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pwrSlice} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
                <defs>
                  <linearGradient id="telPagePwrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SYNTH.cardLemon} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={SYNTH.cardLemon} stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} strokeDasharray="2 4" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} domain={[160, 260]} />
                <Tooltip contentStyle={{ background: SYNTH.canvasInk, border: `1px solid ${SYNTH.glassBorder}`, borderRadius: 12, fontSize: 11, color: SYNTH.inkOnBrand }} labelStyle={{ color: SYNTH.inkOnBrandMuted }} formatter={(v) => [`${v}W`, 'Power']} />
                <Area type="monotone" dataKey="watts" stroke={SYNTH.cardLemon} strokeWidth={2.2} fill="url(#telPagePwrGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* HR zones — color-per-bar */}
        <Card kicker="Heart rate zones" title="Time in zone · last session">
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TELEM_HR_ZONES} margin={{ top: 8, right: 8, bottom: 4, left: -20 }} barSize={24} barCategoryGap="30%">
                <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} strokeDasharray="2 4" />
                <XAxis dataKey="zone" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} unit="m" />
                <Tooltip contentStyle={{ background: SYNTH.canvasInk, border: `1px solid ${SYNTH.glassBorder}`, borderRadius: 12, fontSize: 11, color: SYNTH.inkOnBrand }} labelStyle={{ color: SYNTH.inkOnBrandMuted }} formatter={(v) => [`${v} min`, 'Time']} />
                <Bar dataKey="minutes" radius={[5, 5, 0, 0]}>
                  {TELEM_HR_ZONES.map((z, i) => <Cell key={i} fill={z.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Split consistency — list with fast/slow deltas */}
        <Card kicker="Split consistency" title="Piece-by-piece /500m · last session">
          <div className="space-y-2">
            {TELEM_SPLITS.map((p) => {
              const diff = p.split - p.target
              const fast = diff < 0
              return (
                <div key={p.piece} className="flex items-center justify-between rounded-2xl px-3 py-2.5" style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}` }}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{p.piece}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{fmtTelemSplit(p.split)}</p>
                    <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                      style={{ background: fast ? `${SYNTH.accentEmerald}33` : `${SYNTH.accentAmber}33`, color: fast ? SYNTH.accentEmerald : SYNTH.accentAmber, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
                      {fast ? `${Math.abs(diff).toFixed(1)}s fast` : `+${diff.toFixed(1)}s`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* AI report CTA (gradient card) */}
        <div className="rounded-3xl p-5" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(59,130,246,0.12) 100%)', border: `1px solid rgba(16,185,129,0.30)` }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.accentEmerald, fontFamily: SYNTH.font }}>AI analysis</p>
              <h3 className="mt-1 text-[15px] font-bold leading-tight" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>Generate telemetry report</h3>
              <p className="mt-1 text-[12px] leading-relaxed" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                synth. will synthesise your stroke rate, power, and HR data into a personalised performance breakdown.
              </p>
            </div>
            <span className="shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider" style={{ background: `${SYNTH.accentAmber}33`, color: SYNTH.accentAmber, fontFamily: SYNTH.font }}>Soon</span>
          </div>
          <button type="button" onClick={() => toast('AI report generation coming soon — stay tuned!', 'info')}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold"
            style={{ background: SYNTH.accentEmerald, color: '#FFFFFF', fontFamily: SYNTH.font }}>
            <Sparkles size={14} strokeWidth={2.4} /> Generate AI Report
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function Card({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl p-4" style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{kicker}</p>
      <h3 className="mt-0.5 text-[15px] font-bold leading-tight" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}
```

---

## 5. Erg Pacer — `src/features/app/athlete/ErgPacerPage.tsx`

Live RAF timer with pace prediction, live delta badge, splits table, and a bottom-sheet config (distance / target split / rate). Uses `CoachPageHeader` (back → home).

```tsx
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Square, ChevronUp, ChevronDown, X } from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { SYNTH } from '../lib/theme'

function parseSplit(raw: string): number {
  const [minPart, secPart = '0'] = raw.split(':')
  return Number(minPart) * 60 + Number(secPart)
}
function fmtSplit(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  const [whole, dec = '0'] = s.toFixed(1).split('.')
  return `${m}:${whole.padStart(2, '0')}.${dec}`
}
function formatElapsed(ms: number): string {
  const totalSeconds = ms / 1000
  const m = Math.floor(totalSeconds / 60)
  const s = Math.floor(totalSeconds % 60)
  const tenths = Math.floor((totalSeconds * 10) % 10)
  return `${m}:${s.toString().padStart(2, '0')}.${tenths}`
}

const DISTANCE_OPTIONS = [500, 1000, 2000, 4000, 6000]

export function ErgPacerPage() {
  const [running, setRunning] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const startedAtRef = useRef<number>(0)
  const rafRef = useRef<number>(0)

  const [targetDistanceM, setTargetDistanceM] = useState(2000)
  const [targetSplitStr, setTargetSplitStr] = useState('1:45.3')
  const [targetRate, setTargetRate] = useState(22)
  const [configOpen, setConfigOpen] = useState(false)

  const targetSplitSec = parseSplit(targetSplitStr)

  // RAF loop — performance.now() based so it's drift-free across pause/resume.
  useEffect(() => {
    if (!running) return
    startedAtRef.current = performance.now() - elapsedMs
    const tick = () => {
      setElapsedMs(performance.now() - startedAtRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const reset = () => { setRunning(false); setElapsedMs(0) }

  const elapsedSec = elapsedMs / 1000
  const splits = elapsedMs > 0 ? generateSplits(elapsedMs, targetSplitSec, targetDistanceM) : []
  const liveDeltaSec = elapsedSec > 3 ? Math.sin(elapsedSec / 8) * 1.2 : null

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto" style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom), 16px) + 88px)' }}>
      <CoachPageHeader title="Erg pacer" subtitle={`${targetDistanceM}m target`} back="/app/athlete/home" />

      {/* Main timer */}
      <section className="mx-5 mt-2 flex flex-col items-center px-5 py-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
          Elapsed · {running ? 'live' : 'paused'}
        </p>
        <motion.div key={running ? 'running' : 'paused'} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.32 }} className="mt-2 text-center">
          <div className="text-[88px] font-bold leading-none tracking-[-0.04em]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
            {formatElapsed(elapsedMs)}
          </div>
        </motion.div>

        {/* Live pace badge — green when ahead, red when behind */}
        <AnimatePresence>
          {liveDeltaSec !== null ? (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="mt-2">
              <span className="rounded-full px-3 py-1 text-[12px] font-bold tracking-[0.06em]"
                style={{
                  background: liveDeltaSec < 0 ? 'rgba(52,199,89,0.18)' : 'rgba(255,69,58,0.18)',
                  color: liveDeltaSec < 0 ? '#34C759' : '#FF453A',
                  border: `1px solid ${liveDeltaSec < 0 ? 'rgba(52,199,89,0.35)' : 'rgba(255,69,58,0.35)'}`,
                  fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums',
                }}>
                {liveDeltaSec < 0 ? '–' : '+'}{Math.abs(liveDeltaSec).toFixed(1)}s vs target
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Target label — tap to configure */}
        <button type="button" onClick={() => setConfigOpen(true)}
          className="mt-2 rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums', background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}` }}>
          {targetSplitStr} · {targetRate} spm · tap to change
        </button>

        {/* Transport controls */}
        <div className="mt-7 flex items-center gap-4">
          <button type="button" onClick={reset} disabled={!running && elapsedMs === 0}
            className="flex h-12 w-12 items-center justify-center rounded-full disabled:opacity-30"
            style={{
              background: SYNTH.glass,
              backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              border: `1px solid ${SYNTH.glassBorder}`, color: SYNTH.inkOnBrand,
            }} aria-label="Reset">
            <Square size={16} strokeWidth={2.4} />
          </button>
          <motion.button type="button" whileTap={{ scale: 0.94 }} onClick={() => setRunning((r) => !r)}
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand, boxShadow: SYNTH.shadow.actionCircle }}
            aria-label={running ? 'Pause' : 'Start'}>
            {running ? <Pause size={28} strokeWidth={2.4} /> : <Play size={28} strokeWidth={2.4} />}
          </motion.button>
          <div className="h-12 w-12" />
        </div>
      </section>

      {/* Pace prediction card (candy sky) */}
      <section className="mx-5 mt-3 rounded-3xl p-5" style={{ background: SYNTH.cardSky, boxShadow: SYNTH.shadow.card }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.ink, opacity: 0.65, fontFamily: SYNTH.font }}>Pace prediction</p>
        <p className="mt-2 text-[24px] font-bold leading-tight tracking-[-0.01em]" style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}>
          On pace for {predictFinish(elapsedMs, targetSplitSec, targetDistanceM)}.
        </p>
        <p className="mt-1 text-[12px]" style={{ color: SYNTH.ink, opacity: 0.6, fontFamily: SYNTH.font }}>
          {elapsedMs > 0 ? 'Hold rate. Keep the split consistent through 1500m.' : 'Tap start. synth will pace you live.'}
        </p>
      </section>

      {/* Splits list */}
      <section className="mx-5 mt-5">
        <p className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>500m splits</p>
        <div className="overflow-hidden rounded-3xl" style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
          {splits.length === 0 ? (
            <p className="px-4 py-6 text-center text-[12px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>Splits appear once you start.</p>
          ) : (
            splits.map((s, i) => (
              <div key={s.label} className="flex items-center justify-between px-4 py-3.5" style={{ borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.inlineCardBorder}` }}>
                <span className="text-[13px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{s.label}</span>
                <div className="flex items-center gap-2">
                  {s.delta !== 0 ? (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: s.delta > 0 ? 'rgba(255,69,58,0.14)' : 'rgba(52,199,89,0.14)', color: s.delta > 0 ? '#FF453A' : '#34C759' }}>
                      {s.delta > 0 ? '+' : ''}{s.delta.toFixed(1)}s
                    </span>
                  ) : null}
                  <span className="text-[16px] font-bold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{s.value}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Config bottom-sheet */}
      <AnimatePresence>
        {configOpen ? (
          <TargetConfigSheet
            distanceM={targetDistanceM} splitStr={targetSplitStr} rate={targetRate}
            onSave={(d, s, r) => { setTargetDistanceM(d); setTargetSplitStr(s); setTargetRate(r); setConfigOpen(false) }}
            onClose={() => setConfigOpen(false)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function TargetConfigSheet({ distanceM, splitStr, rate, onSave, onClose }: {
  distanceM: number; splitStr: string; rate: number
  onSave: (d: number, s: string, r: number) => void; onClose: () => void
}) {
  const [localDist, setLocalDist] = useState(distanceM)
  const [localSplit, setLocalSplit] = useState(splitStr)
  const [localRate, setLocalRate] = useState(rate)

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose}
        className="fixed inset-0 z-40" style={{ background: 'rgba(8,8,40,0.55)', backdropFilter: 'blur(6px)' }} />
      <motion.div initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }} transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-5 px-5"
        style={{ background: SYNTH.sheet, borderRadius: `${SYNTH.radius.sheet}px ${SYNTH.radius.sheet}px 0 0`, paddingTop: 24, paddingBottom: 'max(env(safe-area-inset-bottom), 24px)', color: SYNTH.ink, fontFamily: SYNTH.font }}>
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-bold" style={{ color: SYNTH.ink }}>Set target</span>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: SYNTH.sheetMuted }}>
            <X size={16} strokeWidth={2.2} style={{ color: SYNTH.ink }} />
          </button>
        </div>

        {/* Distance pills */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: SYNTH.inkMuted }}>Distance</p>
          <div className="flex flex-wrap gap-2">
            {DISTANCE_OPTIONS.map((d) => (
              <button key={d} type="button" onClick={() => setLocalDist(d)} className="rounded-full px-4 py-1.5 text-[13px] font-semibold"
                style={{ background: localDist === d ? SYNTH.accentBlack : SYNTH.sheetMuted, color: localDist === d ? SYNTH.inkOnBrand : SYNTH.ink, fontFamily: SYNTH.font }}>
                {d >= 1000 ? `${d / 1000}K` : `${d}m`}
              </button>
            ))}
          </div>
        </div>

        {/* Target split input */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: SYNTH.inkMuted }}>Target split /500m</p>
          <input value={localSplit} onChange={(e) => setLocalSplit(e.target.value)} placeholder="1:45.0"
            className="w-full rounded-2xl px-4 py-3 text-[20px] font-bold tracking-[-0.01em] outline-none"
            style={{ background: SYNTH.sheetMuted, color: SYNTH.ink, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }} />
        </div>

        {/* Rate stepper */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: SYNTH.inkMuted }}>Target rate (spm)</p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setLocalRate((r) => Math.max(14, r - 1))} className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}>
              <ChevronDown size={18} strokeWidth={2.4} />
            </button>
            <span className="w-14 text-center text-[28px] font-bold" style={{ color: SYNTH.ink, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{localRate}</span>
            <button type="button" onClick={() => setLocalRate((r) => Math.min(40, r + 1))} className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}>
              <ChevronUp size={18} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        <button type="button" onClick={() => onSave(localDist, localSplit, localRate)} className="rounded-full py-3.5 text-[14px] font-semibold"
          style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
          Save target
        </button>
      </motion.div>
    </>
  )
}

function generateSplits(elapsedMs: number, targetSplitSec: number, totalM: number) {
  const completed = Math.min(Math.floor(elapsedMs / 1000 / targetSplitSec), Math.floor(totalM / 500))
  return Array.from({ length: completed }).map((_, i) => {
    const delta = i % 2 === 0 ? 0 : 0.8
    return { label: `${(i + 1) * 500}m`, value: fmtSplit(targetSplitSec + delta), delta }
  })
}

function predictFinish(elapsedMs: number, targetSplitSec: number, totalM: number): string {
  const numSplits = totalM / 500
  if (elapsedMs === 0) return fmtSplit(targetSplitSec * numSplits)
  const elapsedSec = elapsedMs / 1000
  const completedFraction = elapsedSec / (targetSplitSec * numSplits)
  const projectedTotal = elapsedSec / Math.max(completedFraction, 0.01)
  return fmtSplit(Math.min(projectedTotal, targetSplitSec * numSplits * 1.15))
}
```

---

## 6. Supporting primitives & data

### `StatWithProvenance.tsx` — the provenance stat tile (light-theme variant)

```tsx
import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { APP_THEME } from '../lib/theme'

type Props = {
  value: string
  unit?: string
  label: string
  source: string
  syncedAgo: string
  accent?: string
  delta?: { direction: 'up' | 'down' | 'flat'; value: string }
  icon?: ReactNode
}

export function StatWithProvenance({ value, unit, label, source, syncedAgo, accent = APP_THEME.brand, delta, icon }: Props) {
  const DeltaIcon = delta?.direction === 'up' ? ArrowUp : delta?.direction === 'down' ? ArrowDown : Minus
  const deltaColor = delta?.direction === 'up' ? '#10B981' : delta?.direction === 'down' ? '#EF4444' : APP_THEME.textFaint

  return (
    <div className="flex flex-col gap-2 rounded-2xl border p-4" style={{ background: APP_THEME.surface, borderColor: APP_THEME.divider }}>
      <div className="flex items-center gap-2">
        {icon ? <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${accent}1A` }}>{icon}</span> : null}
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textMuted }}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[26px] font-bold leading-none" style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.text }}>{value}</span>
        {unit ? <span className="text-[12px] font-semibold" style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textFaint }}>{unit}</span> : null}
        {delta ? (
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold" style={{ fontFamily: APP_THEME.fontMono, color: deltaColor }}>
            <DeltaIcon size={12} strokeWidth={2.6} /> {delta.value}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textFaint }}>
        {source} · synced {syncedAgo}
      </p>
    </div>
  )
}
```

### `SessionDetailSheet.tsx` — tap a session → per-boat splits + rating

```tsx
import { Star, Calendar, User } from 'lucide-react'
import { SheetShell } from './SheetShell'
import { SYNTH } from '../lib/theme'
import type { MockSession } from '../data/mockSessions'

export function SessionDetailSheet({ open, onClose, session }: { open: boolean; onClose: () => void; session: MockSession | null }) {
  if (!session) return null
  return (
    <SheetShell open={open} onClose={onClose} title="Session detail">
      {/* Header: date/type + title + big duration */}
      <div>
        <div className="flex items-center gap-1.5">
          <Calendar size={12} color={SYNTH.inkMuted} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>{session.date} · {session.type}</span>
        </div>
        <p className="mt-1 text-[18px] font-bold leading-tight" style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}>{session.title}</p>
        <p className="mt-2 text-[36px] font-bold leading-none tracking-[-0.02em]" style={{ color: SYNTH.ink, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{session.duration}</p>
      </div>

      {/* Per-boat splits + star rating */}
      <div className="flex flex-col gap-3">
        {session.boats.map((b) => (
          <div key={b.id} className="rounded-2xl px-3 py-3" style={{ background: SYNTH.sheetMuted }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: b.color }} />
                <p className="text-[13px] font-bold" style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}>{b.name}</p>
              </div>
              <span className="flex items-center gap-1">
                <Star size={11} color={SYNTH.accentEmerald} fill={SYNTH.accentEmerald} />
                <span className="text-[11px] font-bold" style={{ color: SYNTH.ink, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{b.rating.toFixed(1)}</span>
              </span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {b.splits.map((split, i) => (
                <div key={i} className="rounded-md px-2 py-1.5 text-center" style={{ background: '#FFFFFF' }}>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.1em]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>{(i + 1) * 500}m</p>
                  <p className="mt-0.5 text-[12px] font-bold" style={{ color: SYNTH.ink, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{split}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Notes + rated-by */}
      <div className="rounded-2xl px-3 py-3" style={{ background: SYNTH.sheetMuted }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>Notes</p>
        <p className="mt-1 text-[13px] leading-[1.5]" style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}>{session.description}</p>
      </div>
      <div className="flex items-center gap-2 px-1">
        <User size={12} color={SYNTH.inkMuted} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>Rated by {session.ratedByCoach}</span>
      </div>
    </SheetShell>
  )
}
```

### `mockSessions.ts` — the session data shape + seed

```ts
import { SYNTH } from '../lib/theme'

export type MockSessionBoat = {
  id: string
  name: string
  color: string
  splits: string[]   // mm:ss.t
  rating: number     // 1-5
}

export type MockSession = {
  id: string
  date: string       // 'Apr 21'
  title: string
  duration: string   // '06:42.1'
  type: 'Practice piece' | 'Time trial' | 'Seat race' | 'Regatta'
  ratedByCoach: string
  description: string
  boats: MockSessionBoat[]
}

export const APP_MOCK_SESSIONS: MockSession[] = [
  {
    id: 'sess-1', date: 'Apr 21', title: 'V8 race-pace pieces · 4 × 500m', duration: '06:42.1',
    type: 'Practice piece', ratedByCoach: 'Coach Geri',
    description: 'Strong start, V8 A held a comfortable seat through the third 500m. Sync slipped slightly at high rate — work on catch timing.',
    boats: [
      { id: 'v8a', name: 'V8 A', color: SYNTH.cardSky, splits: ['1:38.4', '1:40.1', '1:41.7', '1:42.0'], rating: 4.4 },
      { id: 'v8b', name: 'V8 B', color: SYNTH.cardPink, splits: ['1:42.6', '1:43.8', '1:44.5', '1:45.2'], rating: 4.0 },
    ],
  },
  // ...sess-2 … sess-8 (seat race, time trial, regatta, tune-up, drills, UT2 long row, erg ladder).
  // Full seed (8 sessions) is in src/features/app/data/mockSessions.ts.
]
```

### Athlete data shape — `mockTeam.ts` (the `me` object the dashboard/profile read)

```ts
export type AppMockAthlete = {
  id: string
  name: string
  initials: string
  position: string
  side: 'P' | 'S' | 'X'
  preferredSeat?: 'stroke' | 'bow' | 'middle' | 'cox' | 'any'
  recoveryScore: number
  twoKBestSeconds: number
  twoKAvg30dSeconds: number
  weeklyVolumeMeters: number
  streakDays: number
  lastSyncMinutes: number
  primarySource: string
}

export const APP_MOCK_ATHLETES: AppMockAthlete[]   // [0] = the signed-in demo athlete (Star Miller)

export function fmtErgTime(totalSeconds: number): string   // 7:14.3 formatter
export function fmtAgo(minutes: number): string            // "4m ago" / "2h ago"
export function buildErgHistory(athleteId: string): { date: string; seconds: number; meters: number }[]
```

> Profile tabs read from React-Query-style hooks in `src/shared/data/queries.ts`: `useAthletes`, `useAthleteProfileSessions`, `useAthleteProfileLineups`, `useAthleteWellness`, `useAthleteCoachNotes`. Overview reads `getDemoAthleteOverview` + `DEMO_TIMELINE_90_DAY` from `src/features/coach/athletes/data/demoData.ts`. Swap these for live queries and the visualization layer doesn't change.

---

## Feature → file map

| Surface | File | Key viz |
|---|---|---|
| **Ask synth. corner button** | `MyProfilePage.tsx` header (also `HomePage` card + tab bar) | glass pill + `Sparkles` → `/app/athlete/ai` |
| Dashboard | `athlete/HomePage.tsx` | swipeable hero metric cards → full-screen scenes |
| Profile · Overview | `MyProfilePage.tsx` `OverviewTab` | headline tiles + dual-axis 90-day `LineChart` + recovery `MiniStat`s |
| Profile · Sessions | `MyProfilePage.tsx` `SessionsTab` | split-trend `LineChart` + session list w/ split chips |
| Profile · Lineups | `MyProfilePage.tsx` `LineupsTab` | side-colored assignment list |
| Profile · Wellness | `MyProfilePage.tsx` `WellnessTab` | current pills + 14-day recovery/HR/HRV `LineChart` |
| Profile · Telemetry | `MyProfilePage.tsx` `TelemetryTab` | (same as TelemetryPage body) |
| Telemetry (full page) | `athlete/TelemetryPage.tsx` | stroke `LineChart` + power `AreaChart` + HR-zone `BarChart` + split list |
| Erg pacer | `athlete/ErgPacerPage.tsx` | RAF timer + live delta + pace prediction + splits + config sheet |
| Session detail | `primitives/SessionDetailSheet.tsx` | per-boat splits grid + rating |
| Stat tile | `primitives/StatWithProvenance.tsx` | value + delta + provenance |

All charts use **Recharts** with the shared dark theme; the canvas is the cobalt gradient `linear-gradient(180deg, ${SYNTH.canvasTop}, ${SYNTH.canvasBottom})`; cards are `SYNTH.inlineCard` over it; the corner AI button and tab strip are the one glass element per screen.
</content>
</invoke>
