import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
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
  Sparkles,
  Lock,
  Map,
  Check,
} from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { BuildChatInput } from '../primitives/BuildChatInput'
import { SYNTH } from '../lib/theme'
import { CANVAS_ENTER, INSTALL_PULSE } from '../lib/motion'
import { toast } from '@shared/store/useToastStore'
import {
  useInstalledToolsStore,
  type InstalledToolMeta,
} from '../store/useInstalledToolsStore'
import { useCoachContextStore } from '../store/useCoachContext'
import {
  fetchPublishedTeamTools,
  type PublishedTool,
} from '@lib/ai/publishedTools'
import { trackToolEvent } from '@lib/telemetry'

// ─── Catalog ─────────────────────────────────────────────────────────────────

type ToolCategory = 'lineups' | 'timing' | 'analysis' | 'coaching' | 'data'

type CatalogTool = {
  id: string
  name: string
  shortDesc: string
  publisher: string
  category: ToolCategory
  iconKey: string
  accent: string
  /**
   * `coming-soon` for unfinished tools, `installable` for tools that are
   * ready to install via the catalog. Sprint 1 ships every non-core tool
   * as `coming-soon` — Sprint 4 flips a couple to `installable` once the
   * mock generator can stand in for them.
   */
  state: 'installable' | 'coming-soon'
  /** Route to navigate to when this tool is opened (installable / installed). */
  to?: string
  /** Display version + activation chip; only used when state !== 'coming-soon'. */
  version?: string
  loadMs?: number
  /** ETA string for coming-soon tools. */
  eta?: string
}

const CATALOG: CatalogTool[] = [
  {
    id: 'lineup-builder',
    name: 'Lineup Builder',
    shortDesc:
      'Build, compare, and publish boat lineups. Drag athletes into seats, run a session timer, save history.',
    publisher: 'synth · core',
    category: 'lineups',
    iconKey: 'lineups',
    accent: SYNTH.cardSky,
    state: 'installable',
    to: '/app/coach/lineups',
    version: 'v1.4.2',
    loadMs: 84,
  },
  {
    id: 'stopwatch',
    name: 'Stopwatch',
    shortDesc:
      'Time anything — pieces, intervals, races. Auto-tags the session and the athletes when you stop.',
    publisher: 'synth · core',
    category: 'timing',
    iconKey: 'timer',
    accent: SYNTH.cardLemon,
    state: 'installable',
    to: '/app/coach/tools/stopwatch',
    version: 'v1.0.0',
    loadMs: 62,
  },
  {
    id: 'race-recorder',
    name: 'Race Recorder',
    shortDesc:
      'Capture race-day footage. Auto-syncs splits to the video timeline so you can scrub stroke-by-stroke.',
    publisher: 'synth · core',
    category: 'analysis',
    iconKey: 'video',
    accent: SYNTH.cardPink,
    state: 'coming-soon',
    eta: 'Q2 2026',
  },
  {
    id: 'lineup-compare',
    name: 'Lineup Compare',
    shortDesc:
      "A/B two crews. Predicted boat-speed delta plus a per-seat athlete swap analysis.",
    publisher: 'synth · core',
    category: 'analysis',
    iconKey: 'compare',
    accent: SYNTH.cardMint,
    state: 'coming-soon',
    eta: 'Q2 2026',
  },
  {
    id: 'drill-library',
    name: 'Drill Library',
    shortDesc:
      'Searchable catalog of rigging, technique, and warm-up drills. Bookmark and assign to athletes.',
    publisher: 'synth · partner',
    category: 'coaching',
    iconKey: 'book',
    accent: SYNTH.cardCream,
    state: 'coming-soon',
    eta: 'Q3 2026',
  },
  {
    id: 'boat-speed-predictor',
    name: 'Boat Speed Predictor',
    shortDesc:
      'Estimate boat speed before launch from erg, weight, and recent rigging data.',
    publisher: 'synth · core',
    category: 'analysis',
    iconKey: 'gauge',
    accent: SYNTH.cardSky,
    state: 'coming-soon',
    eta: 'Q3 2026',
  },
  {
    id: 'heat-sheet-importer',
    name: 'Heat Sheet Importer',
    shortDesc:
      'Snap a regatta heat sheet — synth pulls events, lineups, and report times into your calendar.',
    publisher: 'synth · core',
    category: 'data',
    iconKey: 'upload',
    accent: SYNTH.cardYellow,
    state: 'coming-soon',
    eta: 'Q4 2026',
  },
  {
    id: 'race-plan-generator',
    name: 'Race Plan Generator',
    shortDesc:
      'AI-drafted race plan per athlete and per crew, calibrated to recent splits and the conditions on file.',
    publisher: 'synth · ai',
    category: 'coaching',
    iconKey: 'map',
    accent: SYNTH.cardMint,
    state: 'coming-soon',
    eta: 'Q4 2026',
  },
]

// iconKey → ReactNode. Keeps the persisted store JSON-safe while the page
// renders real lucide glyphs.
function renderIcon(iconKey: string): ReactNode {
  switch (iconKey) {
    case 'lineups':
      return <LayoutGrid size={22} strokeWidth={2.2} />
    case 'timer':
      return <Timer size={22} strokeWidth={2.2} />
    case 'video':
      return <Video size={22} strokeWidth={2.2} />
    case 'compare':
      return <GitCompareArrows size={22} strokeWidth={2.2} />
    case 'book':
      return <BookOpen size={22} strokeWidth={2.2} />
    case 'gauge':
      return <Gauge size={22} strokeWidth={2.2} />
    case 'upload':
      return <Upload size={22} strokeWidth={2.2} />
    case 'map':
      return <Map size={22} strokeWidth={2.2} />
    default:
      return <Sparkles size={22} strokeWidth={2.2} />
  }
}

type Tab = 'installed' | 'catalog'

// ─── Page ────────────────────────────────────────────────────────────────────

export function CustomToolsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('installed')
  const [query, setQuery] = useState('')
  // Sprint 5.9 — pinned build prompt at the bottom of the page. Sending
  // hands the text off to the Build workspace via location state, which
  // drops the user straight into the clarifying-question flow.
  const [buildPrompt, setBuildPrompt] = useState('')

  const onSendBuildPrompt = () => {
    const prompt = buildPrompt.trim()
    if (!prompt) return
    setBuildPrompt('')
    navigate('/app/coach/tools/build', { state: { initialPrompt: prompt } })
  }

  const installedTools = useInstalledToolsStore((s) => s.tools)
  const isInstalled = useInstalledToolsStore((s) => s.isInstalled)
  const install = useInstalledToolsStore((s) => s.install)
  const lastInstalledId = useInstalledToolsStore((s) => s.lastInstalledId)
  const lastInstalledAt = useInstalledToolsStore((s) => s.lastInstalledAt)
  const clearLastInstalled = useInstalledToolsStore((s) => s.clearLastInstalled)

  // Sprint 10 — published team tools surface in the Catalog tab.
  // Hydrate once when the coach has a real users-row team_id; demo /
  // anonymous users see the static CATALOG only.
  const coachContext = useCoachContextStore((s) => s.context)
  const hydrateCoachContext = useCoachContextStore((s) => s.hydrate)
  const [publishedTools, setPublishedTools] = useState<PublishedTool[]>([])
  useEffect(() => {
    void hydrateCoachContext()
  }, [hydrateCoachContext])
  useEffect(() => {
    if (!coachContext) return
    let cancelled = false
    void fetchPublishedTeamTools(coachContext.team_id).then((tools) => {
      if (!cancelled) setPublishedTools(tools)
    })
    return () => {
      cancelled = true
    }
  }, [coachContext])

  // Retire the pulse signal once the animation has had time to play
  // (~2.5 s, longer than INSTALL_PULSE's 1.6 s duration). Keying on
  // `lastInstalledAt` resets the timer on each install.
  useEffect(() => {
    if (lastInstalledAt === null) return
    const t = window.setTimeout(() => clearLastInstalled(), 2500)
    return () => window.clearTimeout(t)
  }, [lastInstalledAt, clearLastInstalled])

  const q = query.trim().toLowerCase()

  const installedFiltered = useMemo(
    () =>
      q
        ? installedTools.filter(
            (t) =>
              t.name.toLowerCase().includes(q) ||
              t.shortDesc.toLowerCase().includes(q),
          )
        : installedTools,
    [q, installedTools],
  )

  const catalogFiltered = useMemo(
    () =>
      q
        ? CATALOG.filter(
            (t) =>
              t.name.toLowerCase().includes(q) ||
              t.shortDesc.toLowerCase().includes(q),
          )
        : CATALOG,
    [q],
  )

  const installFromCatalog = (tool: CatalogTool) => {
    if (!tool.to || !tool.version || tool.loadMs === undefined) return
    const meta: InstalledToolMeta = {
      id: tool.id,
      name: tool.name,
      shortDesc: tool.shortDesc,
      publisher: tool.publisher,
      category: tool.category,
      accent: tool.accent,
      version: tool.version,
      loadMs: tool.loadMs,
      to: tool.to,
      iconKey: tool.iconKey,
    }
    install(meta)
    trackToolEvent('tool_installed', {
      spec_id: tool.id,
      source: 'catalog',
    })
    toast('Tool added to your collection', 'success')
    setTab('installed')
  }

  return (
    <motion.div
      className="synth-scroll flex flex-1 flex-col overflow-y-auto"
      style={{
        // 88px tab-bar clearance + 64px chat-input clearance + safe area.
        // Replaces pb-safe-tab on this page only — every other Custom
        // Tools surface still uses the standard tab-bar offset.
        paddingBottom:
          'calc(max(env(safe-area-inset-bottom), 16px) + 88px + 64px)',
      }}
      {...CANVAS_ENTER}
    >
      <CoachPageHeader title="Tools" subtitle="Custom tools" />

      {/* Tech-feel grid backdrop sits behind everything else in this page */}
      <DotGridBackdrop />

      <div className="relative z-10 mx-5">
        {/* Search bar — applies to whichever tab is active */}
        <SearchBar
          query={query}
          onChange={setQuery}
          placeholder="Search the tool catalog"
        />

        {/* Tabs — Build is a navigation, not a panel */}
        <TabStrip
          tab={tab}
          onChange={setTab}
          onBuild={() => navigate('/app/coach/tools/build')}
          counts={{
            installed: installedFiltered.length,
            catalog: catalogFiltered.length,
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
                    pulse={t.id === lastInstalledId}
                    pulseKey={lastInstalledAt ?? 0}
                  />
                ))}
                {installedFiltered.length === 0 && (
                  <EmptyState
                    icon={<LayoutGrid size={20} strokeWidth={2.2} />}
                    title="No installed tools yet"
                    body="Browse the Catalog or build your own from the Build tab."
                  />
                )}
              </>
            )}

            {tab === 'catalog' && (
              <>
                {publishedTools.length > 0 ? (
                  <PublishedSection
                    publishedTools={publishedTools}
                    isInstalled={isInstalled}
                    onInstall={(pt) => {
                      const meta: InstalledToolMeta = {
                        id: pt.spec.id,
                        name: pt.spec.name,
                        shortDesc: pt.spec.description,
                        publisher: 'synth · team',
                        category: pt.spec.category,
                        accent: SYNTH.cardLemon,
                        version: pt.spec.version,
                        loadMs: 50,
                        to: `/app/coach/tools/${pt.spec.id}`,
                        iconKey: pt.spec.icon_key,
                      }
                      install(meta)
                      trackToolEvent('tool_installed', {
                        spec_id: pt.spec.id,
                        source: 'published_team',
                      })
                      toast(`${pt.spec.name} added to your collection`, 'success')
                      setTab('installed')
                    }}
                    onOpen={(pt) =>
                      navigate(`/app/coach/tools/${pt.spec.id}`)
                    }
                  />
                ) : null}
                {catalogFiltered.map((t, i) => (
                  <CatalogCard
                    key={t.id}
                    tool={t}
                    index={i}
                    installed={isInstalled(t.id)}
                    onOpen={() => t.to && navigate(t.to)}
                    onInstall={() => installFromCatalog(t)}
                  />
                ))}
                {catalogFiltered.length === 0 && (
                  <EmptyState
                    icon={<Sparkles size={20} strokeWidth={2.2} />}
                    title="Nothing matches that"
                    body="Try a different keyword, or jump to Build to describe a new tool."
                  />
                )}
              </>
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
          <span>v0.5 · build {new Date().toISOString().slice(0, 10)}</span>
        </div>
      </div>

      {/* Sprint 5.9 — pinned build-prompt input. Sits 88 px above the
          viewport bottom so it floats just above the floating tab bar.
          Sending hands the prompt to /app/coach/tools/build via state. */}
      <BuildChatInput
        position="fixed"
        bottomOffsetPx={88}
        value={buildPrompt}
        onChange={setBuildPrompt}
        onSend={onSendBuildPrompt}
        placeholder="Describe a tool you want to build…"
      />
    </motion.div>
  )
}

// ─── Backdrop ────────────────────────────────────────────────────────────────

function DotGridBackdrop() {
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
  onBuild,
  counts,
}: {
  tab: Tab
  onChange: (t: Tab) => void
  onBuild: () => void
  counts: { installed: number; catalog: number }
}) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      <PanelPill
        index="01"
        label="Installed"
        count={counts.installed}
        active={tab === 'installed'}
        onClick={() => onChange('installed')}
      />
      <BuildPill index="02" onClick={onBuild} />
      <PanelPill
        index="03"
        label="Catalog"
        count={counts.catalog}
        active={tab === 'catalog'}
        onClick={() => onChange('catalog')}
      />
    </div>
  )
}

function PanelPill({
  index,
  label,
  count,
  active,
  onClick,
}: {
  index: string
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      layout
      onClick={onClick}
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
      <div className="flex w-full items-center justify-between">
        <span
          className="text-[9px] font-bold uppercase tracking-[0.18em]"
          style={{
            color: active ? SYNTH.inkMuted : SYNTH.inkOnBrandMuted,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {index}
        </span>
        <span
          className="flex h-4 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
          style={{
            background: active ? SYNTH.accentBlack : 'rgba(255,255,255,0.14)',
            color: SYNTH.inkOnBrand,
            fontVariantNumeric: 'tabular-nums',
            border: active ? 'none' : `1px solid ${SYNTH.glassBorder}`,
          }}
        >
          {count}
        </span>
      </div>

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
          style={{ color: active ? SYNTH.ink : SYNTH.inkOnBrand }}
        >
          {label}
        </span>
      </div>
    </motion.button>
  )
}

function BuildPill({ index, onClick }: { index: string; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-label="Build a tool"
      className="relative flex h-[64px] flex-col items-start justify-between rounded-2xl px-3 py-2.5 text-left"
      style={{
        background: SYNTH.accentEmerald,
        border: `1px solid ${SYNTH.accentEmerald}`,
        color: SYNTH.inkOnBrand,
        fontFamily: SYNTH.font,
        boxShadow:
          '0 10px 24px -8px rgba(16,185,129,0.55), 0 1px 0 rgba(255,255,255,0.25) inset',
      }}
    >
      <div className="flex w-full items-center justify-between">
        <span
          className="text-[9px] font-bold uppercase tracking-[0.18em]"
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {index}
        </span>
        <Sparkles size={12} strokeWidth={2.6} color={SYNTH.inkOnBrand} />
      </div>

      <span
        className="truncate text-[11px] font-bold uppercase tracking-[0.12em]"
        style={{ color: SYNTH.inkOnBrand }}
      >
        Build
      </span>
    </motion.button>
  )
}

// ─── Tool card surface (shared shell) ────────────────────────────────────────

type ToolBase = {
  id: string
  name: string
  shortDesc: string
  publisher: string
  category: string
  accent: string
  iconKey: string
}

function ToolShell({
  tool,
  children,
  onClick,
  dimmed = false,
}: {
  tool: ToolBase
  children: ReactNode
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
      <span
        className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
        style={{
          background: tool.accent,
          color: SYNTH.ink,
          boxShadow: '0 8px 20px -8px rgba(8,8,40,0.45), 0 1px 0 rgba(255,255,255,0.4) inset',
        }}
      >
        {renderIcon(tool.iconKey)}
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
  pulse = false,
  pulseKey = 0,
}: {
  tool: InstalledToolMeta
  index: number
  onOpen: () => void
  pulse?: boolean
  pulseKey?: number
}) {
  // Re-trigger the install pulse on each new install by keying on
  // pulseKey (the lastInstalledAt timestamp from the store).
  return (
    <motion.div
      key={pulse ? `pulse-${pulseKey}` : `rest-${tool.id}`}
      initial={pulse ? INSTALL_PULSE.initial : { opacity: 0, y: 8 }}
      animate={pulse ? INSTALL_PULSE.animate : { opacity: 1, y: 0 }}
      transition={pulse ? INSTALL_PULSE.transition : { delay: index * 0.04, duration: 0.32 }}
      className="rounded-3xl"
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

// ─── Catalog card ────────────────────────────────────────────────────────────

function CatalogCard({
  tool,
  index,
  installed,
  onOpen,
  onInstall,
}: {
  tool: CatalogTool
  index: number
  installed: boolean
  onOpen: () => void
  onInstall: () => void
}) {
  const isComingSoon = tool.state === 'coming-soon'
  const cardOnClick = installed ? onOpen : undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.32 }}
      className="relative"
    >
      <ToolShell tool={tool} onClick={cardOnClick} dimmed={isComingSoon}>
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
          {isComingSoon ? (
            <Lock size={14} color={SYNTH.inkOnBrandFaint} strokeWidth={2.2} />
          ) : null}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            {tool.publisher}
          </span>
          <div className="ml-auto">
            <CatalogStateChip
              tool={tool}
              installed={installed}
              onInstall={onInstall}
            />
          </div>
        </div>
      </ToolShell>
    </motion.div>
  )
}

const INSTALL_PROGRESS_MS = 800

function CatalogStateChip({
  tool,
  installed,
  onInstall,
}: {
  tool: CatalogTool
  installed: boolean
  onInstall: () => void
}) {
  const [installing, setInstalling] = useState(false)

  const startInstall = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (installing) return
    setInstalling(true)
    window.setTimeout(() => {
      onInstall()
      setInstalling(false)
    }, INSTALL_PROGRESS_MS)
  }

  if (installed) {
    return (
      <span
        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
        style={{
          background: 'rgba(16,185,129,0.14)',
          color: SYNTH.accentEmerald,
          border: `1px solid ${SYNTH.accentEmerald}55`,
          fontFamily: SYNTH.font,
        }}
      >
        <Check size={10} strokeWidth={2.6} />
        Installed
      </span>
    )
  }

  if (tool.state === 'installable') {
    if (installing) {
      return (
        <div
          className="relative flex items-center justify-center overflow-hidden rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{
            width: 96,
            background: 'rgba(16,185,129,0.18)',
            color: SYNTH.inkOnBrand,
            border: `1px solid ${SYNTH.accentEmerald}66`,
            fontFamily: SYNTH.font,
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: INSTALL_PROGRESS_MS / 1000, ease: 'easeOut' }}
            className="absolute inset-y-0 left-0"
            style={{ background: SYNTH.accentEmerald, opacity: 0.55 }}
          />
          <span className="relative z-10">Installing…</span>
        </div>
      )
    }
    return (
      <button
        type="button"
        onClick={startInstall}
        className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
        style={{
          background: SYNTH.accentEmerald,
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
        }}
      >
        Install
      </button>
    )
  }

  return (
    <span
      className="rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em]"
      style={{
        background: SYNTH.accentBlack,
        color: SYNTH.inkOnBrand,
        fontFamily: SYNTH.font,
        boxShadow: '0 4px 14px -4px rgba(8,8,40,0.6)',
        border: `1px solid ${SYNTH.glassBorder}`,
      }}
    >
      Coming soon{tool.eta ? ` · ${tool.eta}` : ''}
    </span>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: ReactNode
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

// ─── Published-team-tools section (Sprint 10) ────────────────────────────

function PublishedSection({
  publishedTools,
  isInstalled,
  onInstall,
  onOpen,
}: {
  publishedTools: PublishedTool[]
  isInstalled: (id: string) => boolean
  onInstall: (tool: PublishedTool) => void
  onOpen: (tool: PublishedTool) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full"
          style={{ background: 'rgba(16,185,129,0.20)', color: SYNTH.accentEmerald }}
        >
          <Sparkles size={11} strokeWidth={2.4} />
        </span>
        <span
          className="text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Published by your team · {publishedTools.length}
        </span>
      </div>
      {publishedTools.map((pt) => {
        const installed = isInstalled(pt.spec.id)
        return (
          <motion.div
            key={pt.versionId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
            className="flex flex-col gap-3 rounded-2xl p-4"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${SYNTH.glassBorder}`,
              boxShadow: '0 6px 18px rgba(8,8,40,0.20)',
            }}
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: SYNTH.cardLemon, color: SYNTH.ink }}
              >
                <Sparkles size={18} strokeWidth={2.2} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span
                  className="truncate text-[14px] font-bold leading-tight"
                  style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                >
                  {pt.spec.name}
                </span>
                <span
                  className="mt-0.5 text-[11px]"
                  style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                >
                  v{pt.spec.version} · {pt.spec.category}
                </span>
                <span
                  className="mt-2 text-[12px] leading-[1.4]"
                  style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                >
                  {pt.spec.description}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => onOpen(pt)}
                className="rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em]"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: `1px solid ${SYNTH.glassBorder}`,
                  color: SYNTH.inkOnBrand,
                  fontFamily: SYNTH.font,
                }}
              >
                Open
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => onInstall(pt)}
                disabled={installed}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] disabled:opacity-60"
                style={{
                  background: installed ? 'rgba(255,255,255,0.10)' : SYNTH.accentEmerald,
                  border: `1px solid ${installed ? SYNTH.glassBorder : SYNTH.accentEmerald}`,
                  color: SYNTH.inkOnBrand,
                  fontFamily: SYNTH.font,
                  boxShadow: installed ? 'none' : '0 6px 18px rgba(16,185,129,0.30)',
                }}
              >
                {installed ? (
                  <>
                    <Check size={12} strokeWidth={2.6} />
                    Installed
                  </>
                ) : (
                  'Install'
                )}
              </motion.button>
            </div>
          </motion.div>
        )
      })}
      <div
        aria-hidden
        className="my-3 h-px"
        style={{ background: SYNTH.glassBorder }}
      />
    </div>
  )
}
