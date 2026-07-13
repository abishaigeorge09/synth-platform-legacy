import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Timer,
  Video,
  BookOpen,
  Heart,
  Target,
  Salad,
  Moon,
  Gauge,
  Search,
  Send,
  Sparkles,
  ChevronRight,
  LayoutGrid,
} from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { SYNTH } from '../lib/theme'
import { toast } from '@shared/store/useToastStore'

// ─── Types ────────────────────────────────────────────────────────────────────

type ToolBase = {
  id: string
  name: string
  shortDesc: string
  publisher: string
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

// ─── Athlete tool catalog ─────────────────────────────────────────────────────

const INSTALLED: InstalledTool[] = [
  {
    id: 'erg-pacer',
    name: 'Erg Pacer',
    shortDesc:
      'Set your 2K target, watch live split breakdowns, and pace every piece against your personal best.',
    publisher: 'synth · core',
    icon: <ErgIcon size={22} />,
    accent: SYNTH.cardSky,
    status: 'installed',
    to: '/app/athlete/erg-pacer',
    version: 'v1.2.0',
    loadMs: 42,
  },
  {
    id: 'form-video',
    name: 'Form Video',
    shortDesc:
      'Record or upload your stroke, annotate the phase, and send directly to your coach for real-time feedback.',
    publisher: 'synth · core',
    icon: <Video size={22} strokeWidth={2.2} />,
    accent: SYNTH.cardMint,
    status: 'installed',
    to: '/app/athlete/form-video',
    version: 'v1.0.0',
    loadMs: 38,
  },
]

const COMING_SOON: ComingSoonTool[] = [
  {
    id: 'drill-library',
    name: 'Drill Library',
    shortDesc:
      'Searchable catalog of rowing technique and warm-up drills. View drills your coach assigns and bookmark your own.',
    publisher: 'synth · core',
    icon: <BookOpen size={22} strokeWidth={2.2} />,
    accent: SYNTH.cardMint,
    status: 'coming-soon',
    eta: 'May 2026',
  },
  {
    id: 'race-plan',
    name: 'Race Plan Viewer',
    shortDesc:
      'Your AI-drafted race plan — target split by 500m, power curve, and rate schedule for each event.',
    publisher: 'synth · ai',
    icon: <Timer size={22} strokeWidth={2.2} />,
    accent: SYNTH.cardSky,
    status: 'coming-soon',
    eta: 'May 2026',
  },
  {
    id: 'video-review',
    name: 'Video Review',
    shortDesc:
      'Watch your stroke footage synced frame-by-frame to split data. Add annotations and share with your coach.',
    publisher: 'synth · core',
    icon: <Video size={22} strokeWidth={2.2} />,
    accent: SYNTH.cardPink,
    status: 'coming-soon',
    eta: 'Q2 2026',
  },
  {
    id: 'recovery-coach',
    name: 'Recovery Coach',
    shortDesc:
      'Daily check-in, HRV trend analysis, and personalised recovery recommendations based on your load.',
    publisher: 'synth · ai',
    icon: <Heart size={22} strokeWidth={2.2} />,
    accent: '#E64A3C',
    status: 'coming-soon',
    eta: 'Q2 2026',
  },
  {
    id: 'goal-tracker',
    name: 'Goal Tracker',
    shortDesc:
      'Set a season 2K target, weekly training hours, or a race placement goal — synth tracks progress automatically.',
    publisher: 'synth · core',
    icon: <Target size={22} strokeWidth={2.2} />,
    accent: SYNTH.accentEmerald,
    status: 'coming-soon',
    eta: 'Q3 2026',
  },
  {
    id: 'nutrition-log',
    name: 'Nutrition Log',
    shortDesc:
      'Log meals and hydration around training. Correlate fuelling patterns with split performance.',
    publisher: 'synth · partner',
    icon: <Salad size={22} strokeWidth={2.2} />,
    accent: SYNTH.cardLemon,
    status: 'coming-soon',
    eta: 'Q3 2026',
  },
  {
    id: 'sleep-analysis',
    name: 'Sleep Analysis',
    shortDesc:
      'Overlay sleep stage data from WHOOP or Garmin against your training load to spot recovery gaps.',
    publisher: 'synth · core',
    icon: <Moon size={22} strokeWidth={2.2} />,
    accent: SYNTH.cardSky,
    status: 'coming-soon',
    eta: 'Q4 2026',
  },
  {
    id: 'boat-speed',
    name: 'Boat Speed Estimator',
    shortDesc:
      "Estimate your crew's predicted boat speed from erg scores, weight, and recent on-water splits.",
    publisher: 'synth · core',
    icon: <Gauge size={22} strokeWidth={2.2} />,
    accent: SYNTH.cardCream,
    status: 'coming-soon',
    eta: 'Q4 2026',
  },
]

type RequestIdea = { id: string; label: string; description: string }
const REQUEST_IDEAS: RequestIdea[] = [
  { id: 'stroke-coach', label: 'Stroke rate coach', description: 'Live SPM feedback during training' },
  { id: 'race-predictor', label: 'Race predictor', description: 'Estimate finish time from current form' },
  { id: 'training-plan', label: 'Training plan viewer', description: 'See your full weekly training plan' },
  { id: 'peer-compare', label: 'Peer comparison', description: 'Compare splits with anonymised teammates' },
  { id: 'injury-log', label: 'Injury log', description: 'Track niggles and rehab milestones' },
  { id: 'mental-prep', label: 'Mental prep', description: 'Pre-race focus routine and visualisation' },
]

type Tab = 'installed' | 'coming-soon' | 'request'

// ─── Page ────────────────────────────────────────────────────────────────────

export function AthleteToolsPage() {
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
            (i) => i.label.toLowerCase().includes(q) || i.description.toLowerCase().includes(q),
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
      <CoachPageHeader title="Tools" subtitle="Your athlete toolkit" back="/app/athlete/home" />

      <DotGridBackdrop />

      <div className="relative z-10 mx-5">
        {/* Search */}
        <SearchBar
          query={query}
          onChange={setQuery}
          placeholder={
            tab === 'request' ? 'Search ideas or describe what you need…' : 'Search tools'
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
                    body="Clear the search to see everything wired up."
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
                    title="Nothing matches"
                    body="Try a different keyword, or jump to Request."
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

        <div
          className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.16em]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
        >
          <span>synth · tools</span>
          <span>·</span>
          <span>athlete</span>
          <span>·</span>
          <span>build {new Date().toISOString().slice(0, 10)}</span>
        </div>
      </div>
    </div>
  )
}

function matches(q: string) {
  return (t: ToolBase) =>
    t.name.toLowerCase().includes(q) || t.shortDesc.toLowerCase().includes(q)
}

// ─── Backdrop ─────────────────────────────────────────────────────────────────

function DotGridBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage: `radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)`,
        backgroundSize: '12px 12px',
        backgroundPosition: '0 0',
        maskImage:
          'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 60%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 60%, transparent 100%)',
      }}
    />
  )
}

// ─── Search bar ───────────────────────────────────────────────────────────────

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
    <div
      className="mb-4 mt-2 flex items-center gap-2.5 rounded-2xl px-4 py-3"
      style={{
        background: SYNTH.inlineCard,
        border: `1px solid ${SYNTH.inlineCardBorder}`,
      }}
    >
      <Search size={16} color={SYNTH.inkOnBrandMuted} strokeWidth={2.2} />
      <input
        type="search"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:opacity-50"
        style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
      />
    </div>
  )
}

// ─── Tab strip ────────────────────────────────────────────────────────────────

function TabStrip({
  tab,
  onChange,
  counts,
}: {
  tab: Tab
  onChange: (t: Tab) => void
  counts: { installed: number; coming: number; request: number }
}) {
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'installed', label: 'Installed', count: counts.installed },
    { key: 'coming-soon', label: 'Coming soon', count: counts.coming },
    { key: 'request', label: 'Request', count: counts.request },
  ]

  return (
    <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all"
          style={{
            background: tab === t.key ? SYNTH.accentBlack : SYNTH.inlineCard,
            color: tab === t.key ? SYNTH.inkOnBrand : SYNTH.inkOnBrandMuted,
            border: `1px solid ${tab === t.key ? 'transparent' : SYNTH.inlineCardBorder}`,
            fontFamily: SYNTH.font,
            letterSpacing: '0.01em',
          }}
        >
          {t.label}
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px]"
            style={{
              background: tab === t.key ? 'rgba(255,255,255,0.18)' : SYNTH.inlineCardBorder,
              color: tab === t.key ? '#FFFFFF' : SYNTH.inkOnBrandMuted,
            }}
          >
            {t.count}
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── Installed card ───────────────────────────────────────────────────────────

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <div
        className="overflow-hidden rounded-3xl p-5"
        style={{
          background: SYNTH.inlineCard,
          border: `1px solid ${SYNTH.inlineCardBorder}`,
        }}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: tool.accent + '22', color: tool.accent }}
          >
            {tool.icon}
          </span>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p
                className="text-[16px] font-bold leading-tight"
                style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
              >
                {tool.name}
              </p>
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]"
                style={{ background: SYNTH.accentEmerald + '22', color: SYNTH.accentEmerald }}
              >
                installed
              </span>
            </div>
            <p
              className="mt-1.5 text-[13px] leading-[1.5]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              {tool.shortDesc}
            </p>
            <p
              className="mt-2 text-[10px] uppercase tracking-[0.14em]"
              style={{ color: SYNTH.provenanceOnBrand, fontFamily: SYNTH.font }}
            >
              {tool.publisher} · {tool.version} · {tool.loadMs}ms
            </p>
          </div>
        </div>

        {/* Open button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onOpen}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold"
          style={{
            background: SYNTH.accentBlack,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            letterSpacing: '0.02em',
          }}
        >
          Open tool
          <ChevronRight size={14} strokeWidth={2.4} />
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─── Coming Soon card ─────────────────────────────────────────────────────────

function ComingSoonCard({ tool, index }: { tool: ComingSoonTool; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="overflow-hidden rounded-3xl p-5"
      style={{
        background: SYNTH.inlineCard,
        border: `1px solid ${SYNTH.inlineCardBorder}`,
        opacity: 0.88,
      }}
    >
      <div className="flex items-start gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: tool.accent + '18', color: tool.accent + 'AA' }}
        >
          {tool.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className="text-[15px] font-bold leading-tight"
              style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
            >
              {tool.name}
            </p>
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]"
              style={{ background: 'rgba(255,255,255,0.08)', color: SYNTH.inkOnBrandMuted }}
            >
              {tool.eta}
            </span>
          </div>
          <p
            className="mt-1.5 text-[13px] leading-[1.5]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            {tool.shortDesc}
          </p>
          <p
            className="mt-2 text-[10px] uppercase tracking-[0.14em]"
            style={{ color: SYNTH.provenanceOnBrand, fontFamily: SYNTH.font }}
          >
            {tool.publisher}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

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
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <span style={{ color: SYNTH.inkOnBrandFaint }}>{icon}</span>
      <p
        className="text-[14px] font-semibold"
        style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
      >
        {title}
      </p>
      <p className="text-[12px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
        {body}
      </p>
    </div>
  )
}

// ─── Request pane ─────────────────────────────────────────────────────────────

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
  onPick: (i: RequestIdea) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Free-text request */}
      <div
        className="overflow-hidden rounded-3xl p-5"
        style={{
          background: SYNTH.inlineCard,
          border: `1px solid ${SYNTH.inlineCardBorder}`,
        }}
      >
        <p
          className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Describe a tool you need
        </p>
        <textarea
          value={customText}
          onChange={(e) => onCustomTextChange(e.target.value)}
          placeholder="e.g. A way to track my erging consistency week over week…"
          rows={3}
          className="w-full resize-none rounded-2xl bg-transparent p-3 text-[14px] leading-[1.5] outline-none placeholder:opacity-40"
          style={{
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            border: `1px solid ${SYNTH.inlineCardBorder}`,
          }}
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          disabled={!customText.trim()}
          onClick={onSubmitCustom}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold disabled:opacity-40"
          style={{
            background: SYNTH.accentBlack,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            letterSpacing: '0.02em',
          }}
        >
          <Send size={14} strokeWidth={2.2} />
          Send request
        </motion.button>
      </div>

      {/* Quick ideas */}
      <p
        className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
      >
        Or vote for an idea
      </p>
      <div className="flex flex-col gap-2">
        {ideas.map((idea, i) => (
          <motion.button
            key={idea.id}
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => onPick(idea)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left active:opacity-80"
            style={{
              background: SYNTH.inlineCard,
              border: `1px solid ${SYNTH.inlineCardBorder}`,
            }}
          >
            <div className="min-w-0 flex-1">
              <p
                className="text-[14px] font-semibold leading-tight"
                style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
              >
                {idea.label}
              </p>
              <p
                className="mt-0.5 text-[12px]"
                style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
              >
                {idea.description}
              </p>
            </div>
            <ChevronRight size={14} color={SYNTH.inkOnBrandFaint} />
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ─── Erg icon ────────────────────────────────────────────────────────────────

function ErgIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
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
