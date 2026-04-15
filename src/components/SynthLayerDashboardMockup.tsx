import { motion } from 'framer-motion'
import { useEffect, useState, type ReactNode, type RefObject } from 'react'
import { THEME } from '../lib/theme'
import { TRANSITIONS } from '../lib/motion'

export type SynthDashboardNavMode = 'default' | 'custom-tools' | 'lineups-editor' | 'coach-setup'

/** Roster row for Team Overview table (demo / prototype overrides). */
export type DashboardAthleteRow = {
  name: string
  pos: string
  erg: string
  split: string
  squat: string
  load: 'High' | 'Med' | 'Low'
  sleep: string
  comply: string
  risk: boolean
}

export type SynthLayerDashboardMockupProps = {
  agentRef?: RefObject<HTMLButtonElement | null>
  /** Idle emphasis on the Synth agent pill (e.g. cursor hovering). */
  agentHighlight?: boolean
  /** Coach identity in the window chrome (signed-in profile). */
  showCoachProfile?: boolean
  /** Darken dashboard body under a modal. */
  dimMain?: boolean
  /** Centered or full overlay above the mockup (modals, wizards). */
  overlay?: ReactNode
  /** Show “Deploy agent” CTA in sidebar (off during some story beats). */
  showSidebarDeploy?: boolean
  navMode?: SynthDashboardNavMode
  /** Browser-style extension chip under the URL bar (story: extension installed). */
  showExtensionInToolbar?: boolean
  /** Horizontal sheet screenshot with a quick “scraping” sweep (story: ingest). */
  scrapeStripSrc?: string
  /** Replace main dashboard body (e.g. Lineups builder). */
  replaceMain?: ReactNode
  /** Sidebar: “Custom tools” group wrapper (for cursor demos). */
  customToolsGroupRef?: RefObject<HTMLDivElement | null>
  /** Sidebar: active Lineups row wrapper. */
  lineupsNavRef?: RefObject<HTMLDivElement | null>
  /** Hide the two chart strips (source signal / compliance) — table + insight remain. */
  hideTopCharts?: boolean
  /** Override “N sources ingesting” in Team Overview subtitle. */
  sourcesIngestSuffix?: string
  /** Workflow slide: two-stream header (athlete vs coach) + “shaped into” tiles + taller table. */
  workflowDetail?: boolean
  /** Override first line under “Team Overview” (e.g. women’s team copy). */
  teamSubtitle?: string
  /** Replace built-in men’s demo roster. */
  athleteRows?: DashboardAthleteRow[]
  /** Optional chart data: primary strip (e.g. weekly/monthly signal). */
  signalPrimary?: { labels: string[]; values: number[] }
  /** Optional chart data: secondary strip (e.g. block averages). */
  signalSecondary?: { labels: string[]; values: number[] }
  /** Replace AI insight paragraph. */
  aiInsightText?: string
  /** Override Team Overview table headers (8 columns). */
  tableColumnHeaders?: string[]
  /** Suffix after the fourth column cell (default ` lb` for squat load). Use `""` for watts-only cells. */
  squatColumnSuffix?: string
  /** Product prototype: app shell provides outer nav — hide mock sidebar. */
  hideSidebar?: boolean
  /** Table body max-height override (e.g. `min(22rem, 42vh)` for prototype). */
  tableMaxHeight?: string
  /**
   * Full product layout: no fake browser chrome (traffic lights / URL bar).
   * Use inside a real app shell (sidebar + header).
   */
  embeddedApp?: boolean
}

const DEFAULT_ATHLETES: DashboardAthleteRow[] = [
  { name: 'Matthew', pos: '1V Port', erg: '6:12.4', split: '1:32.6', squat: '315', load: 'High', sleep: '6.1h', comply: '94%', risk: true },
  { name: 'Lily', pos: '1V Stroke', erg: '6:18.1', split: '1:34.2', squat: '285', load: 'Med', sleep: '7.8h', comply: '100%', risk: false },
  { name: 'Star', pos: '1V 3-seat', erg: '6:21.7', split: '1:35.0', squat: '295', load: 'Low', sleep: '8.2h', comply: '97%', risk: false },
  { name: 'D. Torres', pos: '2V Bow', erg: '6:29.3', split: '1:37.1', squat: '260', load: 'High', sleep: '5.4h', comply: '88%', risk: true },
  { name: 'J. Okonkwo', pos: '2V 3', erg: '6:24.0', split: '1:35.8', squat: '275', load: 'Med', sleep: '7.1h', comply: '91%', risk: false },
  { name: 'R. Chen', pos: '2V Stroke', erg: '6:16.2', split: '1:33.4', squat: '305', load: 'Med', sleep: '6.8h', comply: '96%', risk: false },
]

function MicroBars({
  values,
  color,
  labels,
}: {
  values: number[]
  color: string
  labels: string[]
}) {
  const max = Math.max(...values, 1)
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div
        className="text-[7px] font-bold uppercase tracking-wider text-zinc-400 sm:text-[8px]"
        style={{ fontFamily: THEME.fontMono }}
      >
        Source signal
      </div>
      <div className="flex h-14 items-end gap-1 px-0.5">
        {values.map((v, i) => {
          const px = Math.max(6, Math.round((v / max) * 52))
          return (
            <motion.div
              key={labels[i]}
              className="flex-1 rounded-t"
              initial={{ height: 0 }}
              animate={{ height: px }}
              transition={{ ...TRANSITIONS.smooth, delay: i * 0.04 }}
              style={{ background: color, maxHeight: 52 }}
              title={labels[i]}
            />
          )
        })}
      </div>
      <div
        className="flex justify-between gap-1 px-0.5 pb-1 pt-1 text-[6px] text-zinc-400 sm:text-[7px]"
        style={{ fontFamily: THEME.fontMono }}
      >
        {labels.map((l) => (
          <span key={l} className="max-w-[2.5rem] truncate">
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}

function SidebarNav({
  mode,
  customToolsGroupRef,
  lineupsNavRef,
}: {
  mode: SynthDashboardNavMode
  customToolsGroupRef?: RefObject<HTMLDivElement | null>
  lineupsNavRef?: RefObject<HTMLDivElement | null>
}) {
  const inactive = (label: string) => (
    <div key={label} className="mt-1 flex items-center gap-1 px-1.5 py-0.5 opacity-55">
      <span className="h-1 w-1 rounded-sm bg-zinc-300" />
      <span className="text-[7px]" style={{ fontFamily: THEME.fontSans, color: THEME.textMuted }}>
        {label}
      </span>
    </div>
  )

  const active = (label: string, sub?: string) => (
    <div key={label} className="mt-1 rounded px-1.5 py-1" style={{ background: `${THEME.primary}12` }}>
      <div className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-sm" style={{ background: THEME.primary }} />
        <span className="text-[7px] font-semibold" style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>
          {label}
        </span>
      </div>
      {sub ? (
        <span className="mt-0.5 block pl-3.5 text-[6px] leading-tight text-zinc-400" style={{ fontFamily: THEME.fontSans }}>
          {sub}
        </span>
      ) : null}
    </div>
  )

  if (mode === 'coach-setup') {
    return (
      <>
        {active('Dashboard')}
        <div
          className="mt-1 rounded-md px-0.5 py-1"
          style={{ background: `${THEME.primary}06`, outline: `1px solid ${THEME.border}` }}
        >
          <div
            className="px-1.5 pb-0.5 text-[6px] font-bold uppercase tracking-wider text-zinc-500"
            style={{ fontFamily: THEME.fontMono }}
          >
            Custom tools
          </div>
          {inactive('Lineups')}
          {inactive('Sessions')}
        </div>
        {inactive('Athletes')}
        {inactive('Sources')}
      </>
    )
  }

  if (mode === 'lineups-editor') {
    return (
      <>
        {inactive('Dashboard')}
        <div
          ref={customToolsGroupRef}
          className="mt-1 rounded-md px-0.5 py-1"
          style={{ background: `${THEME.primary}0d`, outline: `1px solid ${THEME.primary}22` }}
        >
          <div
            className="px-1.5 pb-0.5 text-[6px] font-bold uppercase tracking-wider text-zinc-500"
            style={{ fontFamily: THEME.fontMono }}
          >
            Custom tools
          </div>
          <div ref={lineupsNavRef}>{active('Lineups', 'Boat builder')}</div>
          {inactive('Sessions')}
        </div>
        {inactive('Athletes')}
        {inactive('Sources')}
      </>
    )
  }

  if (mode === 'custom-tools') {
    return (
      <>
        {inactive('Dashboard')}
        {active('Lineups', 'Boat builder')}
        {active('Sessions', 'Practice schedule')}
        {inactive('Athletes')}
        {inactive('Sources')}
      </>
    )
  }

  return (
    <>
      {active('Dashboard')}
      {inactive('Lineups')}
      {inactive('Athletes')}
      {inactive('Sources')}
    </>
  )
}

/**
 * In-slide app.synthsports.com mockup — configurable for the multi-step solution story.
 */
export function SynthLayerDashboardMockup({
  agentRef,
  agentHighlight = false,
  showCoachProfile = false,
  dimMain = false,
  overlay = null,
  showSidebarDeploy = true,
  navMode = 'default',
  showExtensionInToolbar = false,
  scrapeStripSrc,
  replaceMain,
  customToolsGroupRef,
  lineupsNavRef,
  hideTopCharts = false,
  sourcesIngestSuffix,
  workflowDetail = false,
  teamSubtitle,
  athleteRows,
  signalPrimary,
  signalSecondary,
  aiInsightText,
  tableColumnHeaders,
  squatColumnSuffix,
  hideSidebar = false,
  tableMaxHeight,
  embeddedApp = false,
}: SynthLayerDashboardMockupProps) {
  const [deployPulse, setDeployPulse] = useState(false)
  const athletes = athleteRows ?? DEFAULT_ATHLETES
  const tableHeaders = tableColumnHeaders ?? ['Athlete', 'Erg 2K', 'Split', 'Squat', 'Load', 'Sleep', 'Comply', 'Status']
  const squatSuffix = squatColumnSuffix ?? ' lb'
  const primaryStrip = signalPrimary ?? {
    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    values: [72, 85, 78, 91, 88, 76, 82],
  }
  const secondaryStrip = signalSecondary ?? {
    labels: ['wk1', 'wk2', 'wk3', 'wk4'],
    values: [64, 71, 69, 74],
  }

  useEffect(() => {
    if (!deployPulse) return
    const t = window.setTimeout(() => setDeployPulse(false), 2400)
    return () => window.clearTimeout(t)
  }, [deployPulse])

  return (
    <div
      className={
        embeddedApp
          ? 'relative flex w-full max-w-full min-w-0 flex-col overflow-x-hidden rounded-xl border bg-white shadow-sm'
          : 'relative flex h-full min-h-[18rem] flex-col overflow-hidden rounded-xl border shadow-[0_2px_0_rgba(0,0,0,0.03),0_22px_48px_rgba(0,0,0,0.14)]'
      }
      style={{ borderColor: THEME.border, ...(embeddedApp ? {} : { background: '#fff' }) }}
    >
      {!embeddedApp ? (
        <div className="flex shrink-0 items-center gap-2 px-3 py-2" style={{ background: THEME.darkDeep }}>
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-red-400/95" />
            <span className="h-2 w-2 rounded-full bg-amber-400/95" />
            <span className="h-2 w-2 rounded-full bg-emerald-400/90" />
          </div>
          <div
            className="mx-1 min-w-0 flex-1 truncate rounded px-2 py-0.5 text-[8px] text-white/55"
            style={{ background: 'rgba(255,255,255,0.08)', fontFamily: THEME.fontMono }}
          >
            app.synthsports.com/dashboard
          </div>
          {showCoachProfile ? (
            <div
              className="flex max-w-[min(42%,9rem)] shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-1.5 py-0.5"
              title="Coach profile"
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[7px] font-bold text-white"
                style={{ background: THEME.primaryDarker, fontFamily: THEME.fontMono }}
              >
                C
              </span>
              <div className="min-w-0 text-left leading-tight">
                <div className="truncate text-[7px] font-semibold text-white" style={{ fontFamily: THEME.fontSans }}>
                  Coach
                </div>
                <div className="truncate text-[6px] text-emerald-300/90" style={{ fontFamily: THEME.fontMono }}>
                  Cal Men&apos;s · signed in
                </div>
              </div>
            </div>
          ) : null}
          <span className="shrink-0 text-[7px] text-white/35" style={{ fontFamily: THEME.fontMono }}>
            Live
          </span>
          <motion.button
            ref={agentRef}
            type="button"
            data-synth-agent
            className="shrink-0 cursor-default rounded-full border-0 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wide text-white shadow-md outline-none"
            style={{
              fontFamily: THEME.fontMono,
              background: THEME.primary,
              boxShadow: `0 2px 12px ${THEME.primary}66`,
            }}
            animate={
              deployPulse || agentHighlight
                ? { scale: deployPulse ? [1, 1.06, 1] : [1, 1.03, 1] }
                : { scale: 1 }
            }
            transition={{
              duration: deployPulse ? 0.45 : 2.2,
              repeat: deployPulse ? 2 : agentHighlight ? Infinity : 0,
              ease: 'easeInOut',
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              setDeployPulse(true)
            }}
          >
            Synth agent
          </motion.button>
        </div>
      ) : null}

      {showExtensionInToolbar ? (
        <div
          className="flex shrink-0 items-center gap-2 border-b px-2.5 py-1"
          style={{ borderColor: THEME.border, background: '#F4F4F5' }}
        >
          <span className="text-[7px] font-semibold uppercase tracking-wider text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
            Extensions
          </span>
          <div
            className="flex items-center gap-1 rounded-md border bg-white px-2 py-0.5 shadow-sm"
            style={{ borderColor: `${THEME.primary}55` }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden className="text-zinc-500">
              <path
                fill="currentColor"
                d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5a2.5 2.5 0 0 0 0-5z"
              />
            </svg>
            <span className="text-[8px] font-bold" style={{ fontFamily: THEME.logoFont, fontWeight: THEME.logoWeight, color: THEME.primary }}>
              synth<span style={{ color: THEME.logoDotColor }}>.</span>
            </span>
          </div>
        </div>
      ) : null}

      {scrapeStripSrc ? (
        <div
          className="relative h-[68px] w-full shrink-0 overflow-hidden border-b bg-white"
          style={{ borderColor: THEME.border }}
        >
          <img src={scrapeStripSrc} alt="" className="h-full w-full object-cover object-center" />
          <motion.div
            className="pointer-events-none absolute inset-y-2 w-0.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
            initial={{ left: '-4%' }}
            animate={{ left: '104%' }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
          />
          <div
            className="absolute bottom-1 left-2 rounded px-1 py-0.5 text-[6px] font-bold uppercase tracking-wide text-white"
            style={{ fontFamily: THEME.fontMono, background: 'rgba(0,0,0,0.55)' }}
          >
            Scraping cells…
          </div>
        </div>
      ) : null}

      <div className={embeddedApp ? 'relative flex w-full min-w-0' : 'relative flex min-h-0 flex-1'}>
        {dimMain ? (
          <div className="pointer-events-none absolute inset-0 z-[15] bg-zinc-900/35" aria-hidden />
        ) : null}

        {!hideSidebar ? (
          <aside
            className="flex w-[100px] shrink-0 flex-col border-r py-2 pl-2 pr-1.5"
            style={{ borderColor: THEME.border, background: '#FAFAF9' }}
          >
            <SidebarNav mode={navMode} customToolsGroupRef={customToolsGroupRef} lineupsNavRef={lineupsNavRef} />
            {showSidebarDeploy ? (
              <div className="mt-auto border-t pt-2" style={{ borderColor: THEME.border }}>
                <button
                  type="button"
                  className="w-full rounded-lg border px-1 py-2 text-center transition-shadow hover:shadow-md"
                  style={{
                    background: '#fff',
                    borderColor: `${THEME.primary}40`,
                    boxShadow: `0 1px 0 ${THEME.border}`,
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeployPulse(true)
                  }}
                >
                  <span
                    className="block leading-none"
                    style={{ fontFamily: THEME.logoFont, fontWeight: THEME.logoWeight, fontSize: 10, color: THEME.textPrimary }}
                  >
                    synth<span style={{ color: THEME.logoDotColor }}>.</span>
                  </span>
                  <span
                    className="mt-1 block text-[6px] font-bold uppercase tracking-[0.12em]"
                    style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
                  >
                    Deploy agent
                  </span>
                </button>
              </div>
            ) : (
              <div className="mt-auto" />
            )}
          </aside>
        ) : null}

        <div
          className={
            embeddedApp
              ? 'flex min-w-0 max-w-full flex-col gap-5 overflow-x-hidden px-4 pb-3 pt-4 sm:px-5 sm:pb-4 sm:pt-5 lg:px-6'
              : 'flex min-w-0 flex-1 flex-col gap-2 overflow-hidden p-2.5'
          }
        >
          {replaceMain ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border" style={{ borderColor: THEME.border }}>
              {replaceMain}
            </div>
          ) : (
            <>
          <div className="flex shrink-0 flex-wrap items-start justify-between gap-x-5 gap-y-3 pb-1">
            <div className="min-w-0 max-w-[min(100%,44rem)] space-y-2 pr-2">
              <div
                className={embeddedApp ? 'text-[18px] font-bold leading-snug sm:text-[20px]' : 'text-[13px] font-bold leading-tight'}
                style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
              >
                Team Overview
              </div>
              <div
                className={embeddedApp ? 'text-[10px] leading-relaxed sm:text-[11px]' : 'text-[8px]'}
                style={{ fontFamily: THEME.fontSans, color: THEME.textMuted }}
              >
                {teamSubtitle ? (
                  workflowDetail ? (
                    <>
                      {teamSubtitle}{' '}
                      · <span style={{ color: THEME.textPrimary }}>Athlete + coach streams merged below</span>
                    </>
                  ) : (
                    teamSubtitle
                  )
                ) : (
                  <>
                    Cal Men&apos;s 1V + 2V · 18 athletes
                    {workflowDetail ? (
                      <>
                        {' '}
                        · <span style={{ color: THEME.textPrimary }}>Athlete + coach streams merged below</span>
                      </>
                    ) : (
                      <> · {sourcesIngestSuffix ?? '6 sources ingesting'}</>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className={`shrink-0 pt-0.5 ${workflowDetail ? 'flex flex-col items-end gap-1' : 'flex flex-col items-end gap-1.5'}`}>
              {workflowDetail ? (
                <span
                  className="text-[6px] font-bold uppercase tracking-wider text-zinc-400"
                  style={{ fontFamily: THEME.fontMono }}
                >
                  Coach connectors
                </span>
              ) : null}
              <div className="flex flex-wrap justify-end gap-1.5 sm:gap-2">
                {[
                  { label: 'Sheets', val: 'synced', c: THEME.primary },
                  { label: 'TeamWorks', val: '2m ago', c: THEME.cyan },
                  { label: 'Wearable', val: 'live', c: THEME.purple },
                  ...(workflowDetail ? ([{ label: 'Email', val: 'digests', c: THEME.amber }] as const) : []),
                ].map((b) => (
                  <span
                    key={b.label}
                    className={
                      embeddedApp
                        ? 'rounded-md border px-2 py-1 text-[8px] font-semibold sm:text-[9px]'
                        : 'rounded border px-1.5 py-0.5 text-[7px] font-semibold'
                    }
                    style={{ fontFamily: THEME.fontMono, borderColor: `${b.c}35`, background: `${b.c}10`, color: b.c }}
                  >
                    {b.label}: {b.val}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {workflowDetail ? (
            <div
              className="shrink-0 rounded-lg border border-dashed p-2"
              style={{ borderColor: `${THEME.primary}44`, background: `${THEME.primary}07` }}
            >
              <div className="grid grid-cols-2 gap-2 text-[6px] leading-snug">
                <div>
                  <div className="font-bold uppercase tracking-wider text-zinc-500" style={{ fontFamily: THEME.fontMono }}>
                    Athlete feeds
                  </div>
                  <p className="mt-0.5 text-zinc-600" style={{ fontFamily: THEME.fontSans }}>
                    One device view per row + <strong style={{ color: THEME.textPrimary }}>their</strong> connectors (apps, sheets,
                    wearables). Tagged by athlete before merge.
                  </p>
                </div>
                <div>
                  <div className="font-bold uppercase tracking-wider text-zinc-500" style={{ fontFamily: THEME.fontMono }}>
                    Coach connectors
                  </div>
                  <p className="mt-0.5 text-zinc-600" style={{ fontFamily: THEME.fontSans }}>
                    <strong style={{ color: THEME.textPrimary }}>Your</strong> roster authority: Sheets, TeamWorks, calendar, email —
                    normalized with athlete reads so nothing double-counts.
                  </p>
                </div>
              </div>
              <div
                className="mt-2 flex flex-wrap items-center gap-1 border-t pt-2"
                style={{ borderColor: THEME.border }}
              >
                <span className="text-[6px] font-bold uppercase tracking-wider text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
                  Shaped into
                </span>
                {(
                  [
                    { t: 'Roster table', c: THEME.primary },
                    { t: 'Signal charts', c: THEME.blue },
                    { t: 'Compliance', c: THEME.amber },
                    { t: 'AI insight', c: THEME.purple },
                  ] as const
                ).map((x) => (
                  <span
                    key={x.t}
                    className="rounded px-1.5 py-0.5 text-[6px] font-semibold"
                    style={{ fontFamily: THEME.fontMono, background: `${x.c}14`, color: x.c, border: `1px solid ${x.c}33` }}
                  >
                    {x.t}
                  </span>
                ))}
              </div>
              <p className="mt-1.5 text-[6px] text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
                Ingest: {sourcesIngestSuffix ?? '8 athlete bundles + coach stack'}
              </p>
            </div>
          ) : null}

          {!hideTopCharts ? (
            <div className={`grid min-w-0 shrink-0 gap-3 ${embeddedApp ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2'}`}>
              <div
                className={`flex min-w-0 rounded-lg border bg-zinc-50/90 ${embeddedApp ? 'p-3 sm:p-4' : 'p-2'}`}
                style={{ borderColor: THEME.border }}
              >
                <MicroBars color={THEME.primary} labels={primaryStrip.labels} values={primaryStrip.values} />
                <div className={`shrink-0 bg-zinc-200 ${embeddedApp ? 'mx-3 w-px' : 'mx-2 w-px'}`} />
                <MicroBars color={THEME.blue} labels={secondaryStrip.labels} values={secondaryStrip.values} />
              </div>
              <div
                className={`min-w-0 rounded-lg border bg-white ${embeddedApp ? 'p-3 sm:p-4' : 'p-2'}`}
                style={{ borderColor: THEME.border }}
              >
                <div
                  className={`font-bold uppercase tracking-wider text-zinc-400 ${embeddedApp ? 'text-[8px] sm:text-[9px]' : 'text-[7px]'}`}
                  style={{ fontFamily: THEME.fontMono }}
                >
                  {squatSuffix === '' ? 'Watts vs. load (top 6)' : 'Compliance vs. load'}
                </div>
                <div className={`flex h-16 items-end gap-1 px-0.5 ${embeddedApp ? 'mt-3' : 'mt-2'}`}>
                  {athletes.slice(0, 6).map((a) => {
                    const n = parseInt(a.squat, 10)
                    const pct = a.risk ? 0.92 : 0.52 + (a.name.length % 5) * 0.06
                    const px =
                      squatSuffix === '' && Number.isFinite(n) && n > 80 && n < 500
                        ? Math.max(10, Math.round((n / 400) * 56))
                        : Math.max(10, Math.round(pct * 56))
                    return (
                      <motion.div
                        key={a.name}
                        className="flex-1 rounded-t"
                        initial={{ height: 0 }}
                        animate={{ height: px }}
                        transition={{ ...TRANSITIONS.smooth, delay: 0.05 }}
                        style={{
                          background: a.risk ? `${THEME.red}85` : `${THEME.accent}90`,
                          maxHeight: 56,
                        }}
                      />
                    )
                  })}
                </div>
                <div
                  className={`flex justify-between text-zinc-400 ${embeddedApp ? 'mt-2 px-0.5 pb-1 pt-1 text-[7px] sm:text-[8px]' : 'mt-1 text-[6px]'}`}
                  style={{ fontFamily: THEME.fontMono }}
                >
                  <span>Risk bands</span>
                  <span>Per athlete</span>
                </div>
              </div>
            </div>
          ) : null}

          <div
            className={
              embeddedApp
                ? 'min-h-0 shrink-0 overflow-x-auto overflow-y-auto rounded-lg border'
                : 'min-h-0 flex-1 overflow-auto rounded-lg border'
            }
            style={{
              borderColor: THEME.border,
              maxHeight: tableMaxHeight ?? (workflowDetail ? 'min(13.5rem, 36vh)' : '11rem'),
            }}
          >
            <table
              className={`w-full border-collapse text-left ${embeddedApp ? 'text-[9px] sm:text-[10px]' : 'text-[8px]'}`}
            >
              <thead className="sticky top-0 z-[1]" style={{ background: '#F4F4F5', boxShadow: `0 1px 0 ${THEME.border}` }}>
                <tr>
                  {tableHeaders.map((h) => (
                    <th key={h} className="px-1.5 py-1 font-semibold" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {athletes.map((a) => (
                  <tr key={a.name} style={{ borderTop: `1px solid ${THEME.border}` }}>
                    <td className="px-1.5 py-1 align-top font-semibold" style={{ fontFamily: THEME.fontSans, color: THEME.textPrimary }}>
                      {a.name}
                      <div className="font-normal text-zinc-400" style={{ fontSize: 7 }}>
                        {a.pos}
                      </div>
                    </td>
                    <td className="px-1.5 py-1 align-top" style={{ fontFamily: THEME.fontMono, color: THEME.accent }}>
                      {a.erg}
                    </td>
                    <td className="px-1.5 py-1 align-top" style={{ fontFamily: THEME.fontMono }}>
                      {a.split}
                    </td>
                    <td className="px-1.5 py-1 align-top" style={{ fontFamily: THEME.fontMono, color: THEME.blue }}>
                      {a.squat}
                      {squatSuffix}
                    </td>
                    <td
                      className="px-1.5 py-1 align-top"
                      style={{
                        fontFamily: THEME.fontMono,
                        color: a.load === 'High' ? THEME.red : a.load === 'Med' ? THEME.amber : THEME.accent,
                      }}
                    >
                      {a.load}
                    </td>
                    <td
                      className="px-1.5 py-1 align-top"
                      style={{
                        fontFamily: THEME.fontMono,
                        color: (() => {
                          const s = a.sleep.trim()
                          if (s === '—' || s === 'n/a' || s === '') return THEME.textMuted
                          const h = parseFloat(s)
                          return Number.isFinite(h) && h < 6.5 ? THEME.red : THEME.textSecondary
                        })(),
                      }}
                    >
                      {a.sleep}
                    </td>
                    <td
                      className="px-1.5 py-1 align-top"
                      style={{
                        fontFamily: THEME.fontMono,
                        color: (() => {
                          const n = parseInt(a.comply.replace(/\D/g, ''), 10)
                          if (!Number.isFinite(n) || n <= 0) return THEME.textMuted
                          return n < 90 ? THEME.amber : THEME.accent
                        })(),
                      }}
                    >
                      {a.comply}
                    </td>
                    <td className="px-1.5 py-1 align-top">
                      {a.risk ? (
                        <span
                          className="rounded px-1 py-0.5 text-[7px] font-bold"
                          style={{ background: `${THEME.red}18`, color: THEME.red, fontFamily: THEME.fontMono }}
                        >
                          AT RISK
                        </span>
                      ) : (
                        <span className="text-[7px]" style={{ fontFamily: THEME.fontMono, color: THEME.accent }}>
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className={`shrink-0 rounded-lg border ${embeddedApp ? 'px-3 py-3 sm:px-4 sm:py-3.5' : 'px-2 py-2'}`}
            style={{ borderColor: `${THEME.amber}35`, background: `${THEME.amber}08` }}
          >
            <div className={`flex items-start ${embeddedApp ? 'gap-3' : 'gap-2'}`}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded" style={{ background: `${THEME.amber}22` }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={THEME.amber}>
                  <path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6zm-1 5v4h2v-4h-2zm0 6v2h2v-2h-2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-[8px] font-bold" style={{ fontFamily: THEME.fontMono, color: THEME.amber }}>
                  AI INSIGHT
                </div>
                <p
                  className={embeddedApp ? 'mt-1 text-[10px] leading-relaxed sm:text-[11px]' : 'mt-0.5 text-[9px] leading-snug'}
                  style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary }}
                >
                  {aiInsightText ??
                    'Matthew: 1:32.6 split + 4×3 Front Squat this week + Tuesday 6hr day. Fatigue risk flagged. Torres: sleep dropping 3 nights, compliance 88%. Monitor closely. Ingest matched rows from Sheets + TeamWorks compliance.'}
                </p>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </div>

      {overlay ? (
        <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center p-4">
          {overlay}
        </div>
      ) : null}
    </div>
  )
}
