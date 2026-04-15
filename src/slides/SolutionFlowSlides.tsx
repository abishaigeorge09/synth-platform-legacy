import { motion } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { ConnectSourcesPanel } from '../components/ConnectSourcesPanel'
import { LineupBoardMockup } from '../components/LineupBoardMockup'
import { ProblemInfiniteToolMarquee } from '../components/ProblemToolMarquee'
import { SynthDemoCursor, SynthNavFlowCursor } from '../components/SynthDemoCursor'
import { SynthLayerDashboardMockup } from '../components/SynthLayerDashboardMockup'
import { TopNav } from '../components/TopNav'
import { useSlideDeckMeta } from '../components/SlideDeckContext'
import { THEME } from '../lib/theme'
import { coachToolSrc } from './coachToolImages'
import { DECK_SLIDE_TOTAL } from '../lib/deckTotal'

const PAD = 'clamp(24px, 3.5vw, 40px) clamp(20px, 3.5vw, 48px) clamp(20px, 3.5vw, 32px)'

function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="h-full min-h-0 overflow-hidden rounded-lg border bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]" style={{ borderColor: THEME.border }}>
      <div className="flex items-center gap-2 border-b px-2.5 py-1.5" style={{ borderColor: THEME.border, background: '#f4f4f5' }}>
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-red-400/90" />
          <span className="h-2 w-2 rounded-full bg-amber-400/90" />
          <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
        </div>
        <span className="truncate text-[8px] text-zinc-500" style={{ fontFamily: THEME.fontMono }}>
          {url}
        </span>
      </div>
      <div className="bg-white">{children}</div>
    </div>
  )
}

/** 1 · You land on the dashboard; cursor finds Synth agent. */
export function SF01_DashboardIntro() {
  const agentRef = useRef<HTMLButtonElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: THEME.light, padding: PAD }}>
      <TopNav section="02 · SOLUTION" page={`6 / ${DECK_SLIDE_TOTAL}`} tone="light" />
      <h1
        className="shrink-0 text-[clamp(20px,3vw,30px)] font-bold leading-[1.08] tracking-[-0.04em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
      >
        Start from one dashboard.
      </h1>
      <p className="mt-1 max-w-[40rem] text-[11px] leading-snug text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
        Core product is the synth layer — everything funnels here. Custom tools plug in after.
      </p>
      <div ref={rootRef} className="relative mt-3 min-h-0 flex-1">
        <SynthLayerDashboardMockup agentRef={agentRef} agentHighlight showSidebarDeploy={false} />
        <SynthDemoCursor agentRef={agentRef} rootRef={rootRef} />
      </div>
    </div>
  )
}

/** 2 · Deploy modal — extension offer. */
export function SF02_DeployExtension() {
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: THEME.light, padding: PAD }}>
      <TopNav section="02 · SOLUTION" page={`7 / ${DECK_SLIDE_TOTAL}`} tone="light" />
      <h1
        className="shrink-0 text-[clamp(20px,3vw,30px)] font-bold leading-[1.08] tracking-[-0.04em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
      >
        Synth agent = browser extension.
      </h1>
      <p className="mt-1 max-w-[42rem] text-[11px] leading-snug text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
        Press next after the click — the extension is how we stay beside your real tools without another login wall.
      </p>
      <div className="relative mt-3 min-h-0 flex-1">
        <SynthLayerDashboardMockup
          dimMain
          showSidebarDeploy={false}
          overlay={
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-[340px] rounded-2xl border bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.2)]"
              style={{ borderColor: THEME.border }}
              data-no-advance
            >
              <p className="text-[13px] font-bold leading-snug" style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}>
                Hey — deploy the synth agent?
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-zinc-600" style={{ fontFamily: THEME.fontSans }}>
                It&apos;s a lightweight browser extension. It opens this shell next to the tools you already use so we can read what you permit and
                write it back into your roster view.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-white"
                  style={{ fontFamily: THEME.fontMono, background: THEME.primary }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  Download extension
                </button>
                <button
                  type="button"
                  className="rounded-lg border px-3 py-2 text-[10px] font-semibold text-zinc-600"
                  style={{ borderColor: THEME.border, fontFamily: THEME.fontMono }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  Not now
                </button>
              </div>
            </motion.div>
          }
        />
      </div>
    </div>
  )
}

/** 3 · Extension installed — shell is live. */
export function SF03_ExtensionLive() {
  const { currentIndex, slideCount } = useSlideDeckMeta()
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: THEME.light, padding: PAD }}>
      <TopNav section="APPENDIX · DRAFTS" page={`${currentIndex + 1} / ${slideCount}`} tone="light" />
      <h1
        className="shrink-0 text-[clamp(20px,3vw,30px)] font-bold leading-[1.08] tracking-[-0.04em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
      >
        Extension added — shell is live.
      </h1>
      <p className="mt-1 max-w-[42rem] text-[11px] leading-snug text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
        Same mini-site, now running beside your tabs. Next we wire sources.
      </p>
      <div className="relative mt-3 min-h-0 flex-1">
        <SynthLayerDashboardMockup
          dimMain
          showSidebarDeploy={false}
          showExtensionInToolbar
          scrapeStripSrc={coachToolSrc('google-sheets-rowing-erg-intervals.png')}
          overlay={
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex max-w-[360px] flex-col items-center rounded-2xl border bg-white px-6 py-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
              style={{ borderColor: THEME.border }}
              data-no-advance
            >
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white"
                style={{ background: THEME.primary }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              >
                {'\u2713'}
              </motion.div>
              <p className="mt-4 text-[14px] font-bold" style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}>
                Synth agent is installed
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-zinc-600" style={{ fontFamily: THEME.fontSans }}>
                You&apos;re inside the synth browser shell. From here we&apos;ll connect Sheets, TeamWorks, wearables — whatever you paste or pick from the list.
              </p>
            </motion.div>
          }
        />
      </div>
    </div>
  )
}

/** 4 · Paste URLs / presets — connect & process. */
export function SF04_ConnectSources() {
  const { currentIndex, slideCount } = useSlideDeckMeta()
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: THEME.light, padding: PAD }}>
      <TopNav section="APPENDIX · DRAFTS" page={`${currentIndex + 1} / ${slideCount}`} tone="light" />
      <h1
        className="shrink-0 text-[clamp(20px,3vw,30px)] font-bold leading-[1.08] tracking-[-0.04em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
      >
        Point it at your stack.
      </h1>
      <p className="mt-1 max-w-[42rem] text-[11px] leading-snug text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
        Paste URLs or choose a preset — then we normalize and map into the roster schema.
      </p>
      <div className="relative mt-3 min-h-0 flex-1">
        <SynthLayerDashboardMockup
          dimMain
          showSidebarDeploy={false}
          overlay={
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <ConnectSourcesPanel />
            </motion.div>
          }
        />
      </div>
    </div>
  )
}

const SCRAPED_INTERVAL_ROWS = [
  { name: 'Matthew', stbd: '1:32.6', port: '1:33.1', bike: '218W' },
  { name: 'Lily', stbd: '1:34.2', port: '1:34.0', bike: '195W' },
  { name: 'Star', stbd: '1:35.0', port: '1:35.4', bike: '188W' },
  { name: 'D. Torres', stbd: '1:37.1', port: '1:36.8', bike: '172W' },
  { name: 'J. Okonkwo', stbd: '1:35.8', port: '1:36.2', bike: '201W' },
  { name: 'R. Chen', stbd: '1:33.4', port: '1:33.9', bike: '224W' },
] as const

/** 5 · All coach-tool surfaces + normalized rows from the horizontal sheet scrape. */
export function SF05_PlayerInsights() {
  const { currentIndex, slideCount } = useSlideDeckMeta()
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: THEME.light, padding: PAD }}>
      <TopNav section="APPENDIX · DRAFTS" page={`${currentIndex + 1} / ${slideCount}`} tone="light" />
      <h1
        className="shrink-0 text-[clamp(20px,3vw,30px)] font-bold leading-[1.08] tracking-[-0.04em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
      >
        Every messy feed — then the rows we actually trust.
      </h1>
      <p className="mt-1 max-w-[44rem] text-[11px] leading-snug text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
        Same infinite strip as the problem slide. Below: what lands after the extension sweeps your horizontal erg sheet — Starboard, Port, bike watts,
        keyed to roster.
      </p>
      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3">
        <div className="min-h-0 shrink-0 py-1" style={{ maxHeight: 'min(46vh, 340px)' }}>
          <ProblemInfiniteToolMarquee />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden rounded-xl border bg-white p-3 shadow-sm" style={{ borderColor: THEME.border }}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
              Normalized · erg intervals (from sheet scrape)
            </p>
            <span className="text-[8px] text-zinc-400" style={{ fontFamily: THEME.fontSans }}>
              Live mapping → athlete ID
            </span>
          </div>
          <div className="mt-2 overflow-x-auto [scrollbar-width:thin]">
            <table className="w-full min-w-[420px] border-collapse text-left text-[9px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${THEME.border}` }}>
                  {['Athlete', 'Stbd split', 'Port split', 'Bike watts'].map((h) => (
                    <th key={h} className="py-1.5 pr-3 font-semibold" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SCRAPED_INTERVAL_ROWS.map((r) => (
                  <tr key={r.name} style={{ borderTop: `1px solid ${THEME.border}` }}>
                    <td className="py-1.5 pr-3 font-semibold" style={{ fontFamily: THEME.fontSans, color: THEME.textPrimary }}>
                      {r.name}
                    </td>
                    <td className="py-1.5 pr-3" style={{ fontFamily: THEME.fontMono, color: THEME.accent }}>
                      {r.stbd}
                    </td>
                    <td className="py-1.5 pr-3" style={{ fontFamily: THEME.fontMono, color: THEME.blue }}>
                      {r.port}
                    </td>
                    <td className="py-1.5 pr-3" style={{ fontFamily: THEME.fontMono, color: THEME.purple }}>
                      {r.bike}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 6 · Custom tools: cursor → Lineups, generated boat builder (no screenshot). */
export function SF06_SourceScreens() {
  const { currentIndex, slideCount } = useSlideDeckMeta()
  const rootRef = useRef<HTMLDivElement>(null)
  const customToolsGroupRef = useRef<HTMLDivElement>(null)
  const lineupsNavRef = useRef<HTMLDivElement>(null)

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: THEME.light, padding: PAD }}>
      <TopNav section="APPENDIX · DRAFTS" page={`${currentIndex + 1} / ${slideCount}`} tone="light" />
      <h1
        className="shrink-0 text-[clamp(20px,3vw,30px)] font-bold leading-[1.08] tracking-[-0.04em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
      >
        Custom tools: open Lineups, build boats on real IDs.
      </h1>
      <p className="mt-1 max-w-[44rem] text-[11px] leading-snug text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
        Cursor: Custom tools → Lineups. The canvas is generated UI (ROW IQ–style shells), not a static mock — same port / stbd language coaches expect.
      </p>
      <div ref={rootRef} className="relative mt-3 min-h-0 flex-1">
        <SynthLayerDashboardMockup
          navMode="lineups-editor"
          showSidebarDeploy={false}
          replaceMain={<LineupBoardMockup />}
          customToolsGroupRef={customToolsGroupRef}
          lineupsNavRef={lineupsNavRef}
        />
        <SynthNavFlowCursor rootRef={rootRef} firstRef={customToolsGroupRef} secondRef={lineupsNavRef} />
      </div>
    </div>
  )
}

/** 7 · Sessions calendar (real screenshot) beside the synth core. */
export function SF07_CustomTools() {
  const { currentIndex, slideCount } = useSlideDeckMeta()
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: THEME.light, padding: PAD }}>
      <TopNav section="APPENDIX · DRAFTS" page={`${currentIndex + 1} / ${slideCount}`} tone="light" />
      <h1
        className="shrink-0 text-[clamp(20px,3vw,30px)] font-bold leading-[1.08] tracking-[-0.04em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
      >
        Sessions, calendar, compliance — still your tools.
      </h1>
      <p className="mt-1 max-w-[46rem] text-[11px] leading-snug text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
        Practice grid from TeamWorks (or similar) on the left; synth roster on the right. Custom surfaces write back to the same athlete IDs the
        dashboard already ingests.
      </p>
      <div className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-2">
        <BrowserFrame url="teamworks.com · calendar">
          <img
            src={coachToolSrc('team_works_calaender.PNG')}
            alt="Team practice calendar"
            className="max-h-[min(42vh,320px)] w-full object-cover object-top"
            loading="lazy"
          />
        </BrowserFrame>
        <div className="min-h-0">
          <SynthLayerDashboardMockup navMode="custom-tools" showSidebarDeploy={false} />
        </div>
      </div>
    </div>
  )
}
