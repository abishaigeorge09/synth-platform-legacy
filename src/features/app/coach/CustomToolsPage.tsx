import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  Timer,
  Video,
  GitCompareArrows,
  BookOpen,
  Gauge,
  Upload,
  Search,
  Settings,
  ChevronRight,
  Send,
  Sparkles,
  Lock,
  Map,
  Wand2,
} from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { SYNTH } from '../lib/theme'
import { toast } from '../../../shared/store/useToastStore'

// ─── Catalog ─────────────────────────────────────────────────────────────────

type ToolCategory = 'lineups' | 'timing' | 'analysis' | 'coaching' | 'data'
type ToolBase = {
  id: string
  name: string
  shortDesc: string
  publisher: string
  category: ToolCategory
  icon: React.ReactNode
  accent: string
}

type InstalledTool = ToolBase & {
  status: 'installed'
  to: string
  version: string
  loadMs: number
}

type ComingSoonTool = ToolBase & {
  status: 'coming-soon'
  eta: string
}

const INSTALLED: InstalledTool[] = [
  {
    id: 'lineup-builder',
    name: 'Lineup Builder',
    shortDesc:
      'Build, compare, and publish boat lineups. Drag athletes into seats, run a session timer, save history.',
    publisher: 'synth · core',
    category: 'lineups',
    icon: <LayoutGrid size={22} strokeWidth={2.2} />,
    accent: SYNTH.cardSky,
    status: 'installed',
    to: '/app/coach/lineups',
    version: 'v1.4.2',
    loadMs: 84,
  },
]

const COMING_SOON: ComingSoonTool[] = [
  {
    id: 'stopwatch',
    name: 'Stopwatch',
    shortDesc:
      'Time anything — pieces, intervals, races. Auto-tags the session and the athletes when you stop.',
    publisher: 'synth · core',
    category: 'timing',
    icon: <Timer size={22} strokeWidth={2.2} />,
    accent: SYNTH.cardLemon,
    status: 'coming-soon',
    eta: 'May 2026',
  },
  {
    id: 'race-recorder',
    name: 'Race Recorder',
    shortDesc:
      'Capture race-day footage. Auto-syncs splits to the video timeline so you can scrub stroke-by-stroke.',
    publisher: 'synth · core',
    category: 'analysis',
    icon: <Video size={22} strokeWidth={2.2} />,
    accent: SYNTH.cardPink,
    status: 'coming-soon',
    eta: 'Q2 2026',
  },
  {
    id: 'lineup-compare',
    name: 'Lineup Compare',
    shortDesc:
      'A/B two crews. Predicted boat-speed delta plus a per-seat athlete swap analysis.',
    publisher: 'synth · core',
    category: 'analysis',
    icon: <GitCompareArrows size={22} strokeWidth={2.2} />,
    accent: SYNTH.cardMint,
    status: 'coming-soon',
    eta: 'Q2 2026',
  },
  {
    id: 'drill-library',
    name: 'Drill Library',
    shortDesc:
      'Searchable catalog of rigging, technique, and warm-up drills. Bookmark and assign to athletes.',
    publisher: 'synth · partner',
    category: 'coaching',
    icon: <BookOpen size={22} strokeWidth={2.2} />,
    accent: SYNTH.cardCream,
    status: 'coming-soon',
    eta: 'Q3 2026',
  },
  {
    id: 'boat-speed-predictor',
    name: 'Boat Speed Predictor',
    shortDesc:
      'Estimate boat speed before launch from erg, weight, and recent rigging data.',
    publisher: 'synth · core',
    category: 'analysis',
    icon: <Gauge size={22} strokeWidth={2.2} />,
    accent: SYNTH.cardSky,
    status: 'coming-soon',
    eta: 'Q3 2026',
  },
  {
    id: 'heat-sheet-importer',
    name: 'Heat Sheet Importer',
    shortDesc:
      'Snap a regatta heat sheet — synth pulls events, lineups, and report times into your calendar.',
    publisher: 'synth · core',
    category: 'data',
    icon: <Upload size={22} strokeWidth={2.2} />,
    accent: SYNTH.cardYellow,
    status: 'coming-soon',
    eta: 'Q4 2026',
  },
  {
    id: 'race-plan-generator',
    name: 'Race Plan Generator',
    shortDesc:
      'AI-drafted race plan per athlete and per crew, calibrated to recent splits and the conditions on file.',
    publisher: 'synth · ai',
    category: 'coaching',
    icon: <Map size={22} strokeWidth={2.2} />,
    accent: SYNTH.cardMint,
    status: 'coming-soon',
    eta: 'Q4 2026',
  },
]

type RequestIdea = { id: string; label: string; description: string }
const REQUEST_IDEAS: RequestIdea[] = [
  { id: 'video-coach', label: 'Video coaching review', description: 'Per-stroke annotations + voice notes' },
  { id: 'wellness-triage', label: 'Wellness triage', description: 'Auto-flag at-risk athletes from biometrics' },
  { id: 'erg-comparator', label: 'Erg comparator', description: "Compare two athletes' pieces stroke-by-stroke" },
  { id: 'recovery-coach', label: 'Recovery coach', description: 'Daily wellness questions + insights' },
  { id: 'ranking-board', label: 'Team ranking board', description: 'Public team leaderboard widget' },
  { id: 'parents-digest', label: 'Parents digest', description: 'Auto-weekly summary email home' },
]

type Tab = 'installed' | 'coming-soon' | 'request'

// ─── Page ────────────────────────────────────────────────────────────────────

export function CustomToolsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('installed')
  const [query, setQuery] = useState('')
  const [requestText, setRequestText] = useState('')

  const q = query.trim().toLowerCase()
  const installedFiltered = useMemo(
    () => (q ? INSTALLED.filter(matches(q)) : INSTALLED),
    [q],
  )
  const comingFiltered = useMemo(
    () => (q ? COMING_SOON.filter(matches(q)) : COMING_SOON),
    [q],
  )
  const requestFiltered = useMemo(
    () =>
      q
        ? REQUEST_IDEAS.filter(
            (i) =>
              i.label.toLowerCase().includes(q) ||
              i.description.toLowerCase().includes(q),
          )
        : REQUEST_IDEAS,
    [q],
  )

  const submitRequest = (idOrText: string) => {
    toast(`Request received — we'll keep you posted on "${idOrText}"`, 'success')
    setRequestText('')
  }

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-safe-tab">
      <CoachPageHeader title="Tools" subtitle="Custom tools catalog" />

      {/* Tech-feel grid backdrop sits behind everything else in this page */}
      <DotGridBackdrop />

      <div className="relative z-10 mx-5">
        {/* Search bar — applies to whichever tab is active */}
        <SearchBar
          query={query}
          onChange={setQuery}
          placeholder={
            tab === 'request' ? 'Search ideas or describe what you need…' : 'Search the tool catalog'
          }
        />

        {/* Tabs */}
        <TabStrip
          tab={tab}
          onChange={setTab}
          counts={{
            installed: installedFiltered.length,
            coming: comingFiltered.length,
            request: requestFiltered.length,
          }}
        />

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.section
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-4 flex flex-col gap-3"
          >
            {tab === 'installed' && (
              <>
                {installedFiltered.map((t, i) => (
                  <InstalledCard
                    key={t.id}
                    tool={t}
                    index={i}
                    onOpen={() => navigate(t.to)}
                  />
                ))}
                {installedFiltered.length === 0 && (
                  <EmptyState
                    icon={<LayoutGrid size={20} strokeWidth={2.2} />}
                    title="No installed tools match"
                    body="Clear the search to see everything that's wired up."
                  />
                )}
              </>
            )}

            {tab === 'coming-soon' && (
              <>
                {comingFiltered.map((t, i) => (
                  <ComingSoonCard key={t.id} tool={t} index={i} />
                ))}
                {comingFiltered.length === 0 && (
                  <EmptyState
                    icon={<Sparkles size={20} strokeWidth={2.2} />}
                    title="Nothing matches that"
                    body="Try a different keyword, or jump to Request to ask for it."
                  />
                )}
              </>
            )}

            {tab === 'request' && (
              <RequestPane
                customText={requestText}
                onCustomTextChange={setRequestText}
                onSubmitCustom={() => submitRequest(requestText.trim() || 'a custom tool')}
                ideas={requestFiltered}
                onPick={(idea) => submitRequest(idea.label)}
              />
            )}
          </motion.section>
        </AnimatePresence>

        {/* Footer marque */}
        <div
          className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.16em]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
        >
          <span>synth · tools</span>
          <span>·</span>
          <span>v0.4 · build {new Date().toISOString().slice(0, 10)}</span>
        </div>
      </div>
    </div>
  )
}

function matches(q: string) {
  return (t: ToolBase) =>
    t.name.toLowerCase().includes(q) || t.shortDesc.toLowerCase().includes(q)
}

// ─── Backdrop ────────────────────────────────────────────────────────────────

function DotGridBackdrop() {
  // 12 px dot grid in low-opacity white — pure decoration. Sits absolute under
  // the content layer so it reads as "engineering surface" without competing
  // with the cards.
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage: `radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)`,
        backgroundSize: '12px 12px',
        backgroundPosition: '0 0',
        maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 60%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 60%, transparent 100%)',
      }}
    />
  )
}

// ─── Search bar ──────────────────────────────────────────────────────────────

function SearchBar({
  query,
  onChange,
  placeholder,
}: {
  query: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <label
      className="flex items-center gap-2.5 rounded-2xl px-3.5"
      style={{
        background: SYNTH.glass,
        backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        border: `1px solid ${SYNTH.glassBorder}`,
        boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset',
      }}
    >
      <Search size={14} color={SYNTH.inkOnBrandMuted} strokeWidth={2.4} />
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent py-3 text-[14px] outline-none placeholder:opacity-50"
        style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
      />
      {query ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Clear
        </button>
      ) : (
        <span
          className="text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
        >
          ⌘K
        </span>
      )}
    </label>
  )
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

function TabStrip({
  tab,
  onChange,
  counts,
}: {
  tab: Tab
  onChange: (t: Tab) => void
  counts: { installed: number; coming: number; request: number }
}) {
  const tabs: Array<{ id: Tab; label: string; count: number; index: string }> = [
    { id: 'installed', label: 'Installed', count: counts.installed, index: '01' },
    { id: 'coming-soon', label: 'Coming soon', count: counts.coming, index: '02' },
    { id: 'request', label: 'Request', count: counts.request, index: '03' },
  ]

  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {tabs.map((t) => {
        const active = t.id === tab
        return (
          <motion.button
            key={t.id}
            type="button"
            whileTap={{ scale: 0.97 }}
            layout
            onClick={() => onChange(t.id)}
            className="relative flex h-[64px] flex-col items-start justify-between rounded-2xl px-3 py-2.5 text-left"
            style={{
              background: active ? SYNTH.inkOnBrand : 'rgba(255,255,255,0.08)',
              border: `1px solid ${active ? SYNTH.inkOnBrand : 'rgba(255,255,255,0.22)'}`,
              color: active ? SYNTH.ink : SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
              boxShadow: active
                ? '0 8px 22px -10px rgba(255,255,255,0.4), 0 1px 0 rgba(255,255,255,0.6) inset'
                : '0 1px 0 rgba(255,255,255,0.08) inset',
            }}
          >
            {/* Top row — index + count */}
            <div className="flex w-full items-center justify-between">
              <span
                className="text-[9px] font-bold uppercase tracking-[0.18em]"
                style={{
                  color: active ? SYNTH.inkMuted : SYNTH.inkOnBrandMuted,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {t.index}
              </span>
              <span
                className="flex h-4 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
                style={{
                  background: active ? SYNTH.accentBlack : 'rgba(255,255,255,0.14)',
                  color: active ? SYNTH.inkOnBrand : SYNTH.inkOnBrand,
                  fontVariantNumeric: 'tabular-nums',
                  border: active ? 'none' : `1px solid ${SYNTH.glassBorder}`,
                }}
              >
                {t.count}
              </span>
            </div>

            {/* Bottom row — label + active dot */}
            <div className="flex w-full items-center gap-1.5">
              {active ? (
                <motion.span
                  layoutId="tab-active-dot"
                  className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    background: SYNTH.accentEmerald,
                    boxShadow: `0 0 0 3px ${SYNTH.accentEmerald}33`,
                  }}
                />
              ) : null}
              <span
                className="truncate text-[11px] font-bold uppercase tracking-[0.12em]"
                style={{
                  color: active ? SYNTH.ink : SYNTH.inkOnBrand,
                }}
              >
                {t.label}
              </span>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

// ─── Tool card surface (shared shell) ────────────────────────────────────────

function ToolShell({
  tool,
  children,
  onClick,
  dimmed = false,
}: {
  tool: ToolBase
  children: React.ReactNode
  onClick?: () => void
  dimmed?: boolean
}) {
  const Tag = onClick ? motion.button : motion.div
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      className="relative flex w-full items-start gap-3.5 rounded-3xl p-4 text-left"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${SYNTH.glassBorder}`,
        boxShadow: '0 12px 28px -12px rgba(8,8,40,0.45)',
      }}
    >
      {/* Icon medallion */}
      <span
        className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
        style={{
          background: tool.accent,
          color: SYNTH.ink,
          boxShadow: '0 8px 20px -8px rgba(8,8,40,0.45), 0 1px 0 rgba(255,255,255,0.4) inset',
        }}
      >
        {tool.icon}
        {/* Tiny category chip on the icon corner */}
        <span
          className="absolute -bottom-1 -right-1 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em]"
          style={{
            background: SYNTH.accentBlack,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            border: `1px solid ${SYNTH.glassBorder}`,
          }}
        >
          {tool.category}
        </span>
      </span>

      {/* Body — dimmed when coming-soon so the title overlay reads cleanly */}
      <div
        className="min-w-0 flex-1"
        style={dimmed ? { filter: 'blur(0.4px)', opacity: 0.7 } : undefined}
      >
        {children}
      </div>
    </Tag>
  )
}

// ─── Installed card ──────────────────────────────────────────────────────────

function InstalledCard({
  tool,
  index,
  onOpen,
}: {
  tool: InstalledTool
  index: number
  onOpen: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.32 }}
    >
      <ToolShell tool={tool} onClick={onOpen}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <p
                className="truncate text-[15px] font-bold leading-tight"
                style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
              >
                {tool.name}
              </p>
              <span
                className="text-[10px] font-semibold tracking-[0.06em]"
                style={{
                  color: SYNTH.inkOnBrandMuted,
                  fontFamily: SYNTH.font,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {tool.version}
              </span>
            </div>
            <p
              className="mt-1 text-[12px] leading-[1.45]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              {tool.shortDesc}
            </p>
          </div>
          <ChevronRight size={16} color={SYNTH.inkOnBrandFaint} strokeWidth={2.2} />
        </div>

        {/* Footer row — publisher + load-time tech chip + gear */}
        <div className="mt-3 flex items-center gap-2">
          <span
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: SYNTH.accentEmerald, boxShadow: `0 0 0 3px ${SYNTH.accentEmerald}33` }}
            />
            {tool.publisher}
          </span>
          <span
            className="ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
            style={{
              background: 'rgba(16,185,129,0.14)',
              color: SYNTH.accentEmerald,
              border: `1px solid ${SYNTH.accentEmerald}55`,
              fontFamily: SYNTH.font,
              fontVariantNumeric: 'tabular-nums',
            }}
            aria-label={`Activates in ${tool.loadMs} milliseconds`}
            title="Activation time"
          >
            ⏱ {tool.loadMs} ms
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toast(`${tool.name} settings — wire-up coming soon`, 'info')
            }}
            aria-label="Tool settings"
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{
              background: 'rgba(255,255,255,0.10)',
              border: `1px solid ${SYNTH.glassBorder}`,
              color: SYNTH.inkOnBrandMuted,
            }}
          >
            <Settings size={12} strokeWidth={2.4} />
          </button>
        </div>
      </ToolShell>
    </motion.div>
  )
}

// ─── Coming soon card ────────────────────────────────────────────────────────

function ComingSoonCard({ tool, index }: { tool: ComingSoonTool; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.32 }}
      className="relative"
    >
      <ToolShell tool={tool} dimmed>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[15px] font-bold leading-tight"
              style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
            >
              {tool.name}
            </p>
            <p
              className="mt-1 text-[12px] leading-[1.45]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              {tool.shortDesc}
            </p>
          </div>
          <Lock size={14} color={SYNTH.inkOnBrandFaint} strokeWidth={2.2} />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            {tool.publisher}
          </span>
          <span
            className="ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
            style={{
              background: 'rgba(255,255,255,0.10)',
              color: SYNTH.inkOnBrandMuted,
              border: `1px solid ${SYNTH.glassBorder}`,
              fontFamily: SYNTH.font,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            ETA · {tool.eta}
          </span>
        </div>
      </ToolShell>

      {/* Sharp "COMING SOON" stamp — sits on top of the dimmed/blurred body
          and stays crisp because it's outside ToolShell's blur filter. */}
      <span
        className="pointer-events-none absolute right-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em]"
        style={{
          background: SYNTH.accentBlack,
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
          letterSpacing: '0.16em',
          boxShadow: '0 4px 14px -4px rgba(8,8,40,0.6)',
          border: `1px solid ${SYNTH.glassBorder}`,
        }}
      >
        Coming soon
      </span>
    </motion.div>
  )
}

// ─── Request pane ────────────────────────────────────────────────────────────

function RequestPane({
  customText,
  onCustomTextChange,
  onSubmitCustom,
  ideas,
  onPick,
}: {
  customText: string
  onCustomTextChange: (v: string) => void
  onSubmitCustom: () => void
  ideas: RequestIdea[]
  onPick: (idea: RequestIdea) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Big "describe what you need" input — primary action */}
      <div
        className="rounded-3xl p-4"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${SYNTH.glassBorder}`,
        }}
      >
        <div className="flex items-center gap-2">
          <Wand2 size={14} color={SYNTH.accentEmerald} strokeWidth={2.4} />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            Tell synth what you need
          </span>
        </div>
        <textarea
          value={customText}
          onChange={(e) => onCustomTextChange(e.target.value)}
          rows={3}
          placeholder="e.g. A way to log heart-rate alerts during the warm-up row, with a notification to the cox"
          className="mt-3 w-full resize-none bg-transparent text-[14px] leading-[1.5] outline-none placeholder:opacity-50"
          style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
        />
        <div className="mt-2 flex items-center justify-between">
          <span
            className="text-[10px] uppercase tracking-[0.14em]"
            style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
          >
            {customText.length}/500
          </span>
          <button
            type="button"
            onClick={onSubmitCustom}
            disabled={customText.trim().length === 0}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] disabled:opacity-40"
            style={{
              background: SYNTH.accentEmerald,
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
            }}
          >
            <Send size={11} strokeWidth={2.6} />
            Submit
          </button>
        </div>
      </div>

      {/* Suggested ideas — quick-tap requests */}
      <div>
        <p
          className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Or pick from frequent requests
        </p>
        <div className="flex flex-col gap-2">
          {ideas.map((idea, i) => (
            <motion.button
              key={idea.id}
              type="button"
              whileTap={{ scale: 0.99 }}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.22 }}
              onClick={() => onPick(idea)}
              className="flex items-center gap-3 rounded-2xl p-3 text-left"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${SYNTH.glassBorder}`,
              }}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: `1px solid ${SYNTH.glassBorder}`,
                  color: SYNTH.accentEmerald,
                }}
              >
                <Sparkles size={14} strokeWidth={2.4} />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[13px] font-bold"
                  style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                >
                  {idea.label}
                </p>
                <p
                  className="truncate text-[11px]"
                  style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                >
                  {idea.description}
                </p>
              </div>
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  color: SYNTH.inkOnBrand,
                  border: `1px solid ${SYNTH.glassBorder}`,
                  fontFamily: SYNTH.font,
                }}
              >
                Request →
              </span>
            </motion.button>
          ))}
          {ideas.length === 0 && (
            <EmptyState
              icon={<Sparkles size={18} strokeWidth={2.2} />}
              title="No matching ideas"
              body="Type your request above — we'll log it and follow up."
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div
      className="flex flex-col items-center gap-2 rounded-3xl px-5 py-10 text-center"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px dashed ${SYNTH.glassBorder}`,
      }}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full"
        style={{
          background: 'rgba(255,255,255,0.10)',
          color: SYNTH.inkOnBrandMuted,
        }}
      >
        {icon}
      </span>
      <p
        className="text-[13px] font-bold"
        style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
      >
        {title}
      </p>
      <p
        className="max-w-[260px] text-[11px] leading-[1.4]"
        style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
      >
        {body}
      </p>
    </div>
  )
}
