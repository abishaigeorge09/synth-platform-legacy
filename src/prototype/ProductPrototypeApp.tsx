import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { SynthLayerDashboardMockup } from '../components/SynthLayerDashboardMockup'
import { THEME } from '../lib/theme'
import { TRANSITIONS } from '../lib/motion'
import {
  DEMO_LOGIN,
  PROTO_SESSION_KEY,
  WOMENS_AI_INSIGHT,
  WOMENS_ATHLETES,
  WOMENS_CONNECTORS,
  WOMENS_SIGNAL_BLOCK_LABELS,
  WOMENS_SIGNAL_BLOCK_VALUES,
  WOMENS_SIGNAL_MONTH_LABELS,
  WOMENS_SIGNAL_MONTH_VALUES,
  WOMENS_SOURCES_INGEST,
  WOMENS_TABLE_HEADERS,
  WOMENS_TEAM_SUBTITLE,
} from './womensDemoData'
import { RowiqWomensCharts } from './RowiqWomensCharts'
import { SynthAthleteCardsView } from './athleteCards/SynthAthleteCardsView'
import {
  ROWIQ_ROSTER_COUNT_2526,
  ROWIQ_SESSIONS_2425,
  ROWIQ_SESSIONS_2526,
  ROWIQ_SHEET_316_DATE,
} from './rowiqWomensData'

type ProtoRoute = 'signin' | 'dashboard' | 'sources' | 'athletes' | 'lineups'

const navItems: { id: ProtoRoute; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'lineups', label: 'Lineups' },
  { id: 'athletes', label: 'Athletes' },
  { id: 'sources', label: 'Sources' },
]

function SignInScreen({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState<string>(DEMO_LOGIN.email)
  const [password, setPassword] = useState<string>(DEMO_LOGIN.password)

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: `linear-gradient(165deg, ${THEME.primaryDarker} 0%, ${THEME.primary} 42%, ${THEME.primaryLight} 160%)` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={TRANSITIONS.smooth}
        className="w-full max-w-[420px] rounded-2xl border bg-white p-8 shadow-[0_24px_64px_rgba(0,0,0,0.28)]"
        style={{ borderColor: THEME.border }}
        data-prototype-signin
        onKeyDown={(e) => e.stopPropagation()}
      >
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
          Product prototype
        </p>
        <h1
          className="mt-2 text-center text-[26px] font-bold tracking-tight text-zinc-900"
          style={{ fontFamily: THEME.logoFont, fontWeight: THEME.logoWeight }}
        >
          synth<span style={{ color: THEME.logoDotColor }}>.</span>
        </h1>
        <p className="mt-2 text-center text-[13px] text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
          {THEME.tagline}
        </p>

        <div
          className="mt-6 rounded-lg border border-dashed bg-zinc-50 px-3 py-3 text-left"
          style={{ borderColor: `${THEME.primary}44` }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500" style={{ fontFamily: THEME.fontMono }}>
            Demo IDs (copy / use as-is)
          </p>
          <dl className="mt-2 space-y-1.5 text-[12px]" style={{ fontFamily: THEME.fontMono }}>
            <div className="flex justify-between gap-2">
              <dt className="text-zinc-500">Email</dt>
              <dd className="min-w-0 truncate text-zinc-900">{DEMO_LOGIN.email}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-zinc-500">Password</dt>
              <dd className="text-zinc-900">{DEMO_LOGIN.password}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-zinc-500">Team ID</dt>
              <dd className="min-w-0 truncate text-[11px] text-zinc-800">{DEMO_LOGIN.teamId}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-zinc-500">Org ID</dt>
              <dd className="min-w-0 truncate text-[11px] text-zinc-800">{DEMO_LOGIN.orgId}</dd>
            </div>
          </dl>
        </div>

        <button
          type="button"
          className="mt-5 w-full rounded-lg py-3.5 text-[14px] font-bold text-white shadow-lg transition hover:brightness-105"
          style={{ fontFamily: THEME.fontMono, background: THEME.primary, boxShadow: `0 8px 24px ${THEME.primary}55` }}
          onClick={onSignedIn}
        >
          Enter demo dashboard
        </button>
        <p className="mt-2 text-center text-[11px] text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
          No typing required — one click signs you in (local browser only).
        </p>

        <form
          className="mt-6 border-t pt-6"
          style={{ borderColor: THEME.border }}
          onSubmit={(e) => {
            e.preventDefault()
            onSignedIn()
          }}
        >
          <p className="mb-3 text-[11px] font-semibold text-zinc-500" style={{ fontFamily: THEME.fontMono }}>
            Or edit fields &amp; Sign in
          </p>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500" style={{ fontFamily: THEME.fontMono }}>
              Work email
            </span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="select-text mt-1.5 w-full rounded-lg border px-3 py-2.5 text-[14px] text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-500/40"
              style={{ borderColor: THEME.border, fontFamily: THEME.fontSans }}
            />
          </label>
          <label className="mt-4 block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500" style={{ fontFamily: THEME.fontMono }}>
              Password
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="select-text mt-1.5 w-full rounded-lg border px-3 py-2.5 text-[14px] text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-500/40"
              style={{ borderColor: THEME.border, fontFamily: THEME.fontSans }}
            />
          </label>
          <button
            type="submit"
            className="mt-5 w-full rounded-lg border-2 border-zinc-200 bg-white py-2.5 text-[12px] font-bold text-zinc-800 transition hover:bg-zinc-50"
            style={{ fontFamily: THEME.fontMono }}
          >
            Sign in (demo — password not checked)
          </button>
        </form>
        <p className="mt-4 text-center text-[11px] text-zinc-400" style={{ fontFamily: THEME.fontSans }}>
          Demo only — no server; data is static from the women&apos;s team sheet spec.
        </p>
      </motion.div>
      <button
        type="button"
        className="mt-8 text-[11px] font-medium text-white/80 underline-offset-4 hover:underline"
        style={{ fontFamily: THEME.fontMono }}
        onClick={() => {
          window.location.hash = ''
        }}
      >
        ← Back to pitch deck
      </button>
    </div>
  )
}

function colorForKey(k: 'primary' | 'cyan' | 'purple' | 'amber') {
  const map = { primary: THEME.primary, cyan: THEME.cyan, purple: THEME.purple, amber: THEME.amber } as const
  return map[k]
}

function initialProtoRoute(): ProtoRoute {
  if (typeof window === 'undefined') return 'signin'
  return localStorage.getItem(PROTO_SESSION_KEY) === '1' ? 'dashboard' : 'signin'
}

export function ProductPrototypeApp() {
  const [route, setRoute] = useState<ProtoRoute>(initialProtoRoute)

  useEffect(() => {
    document.title = 'synth. — Product prototype'
    return () => {
      document.title = 'synth. — Pitch Deck'
    }
  }, [])

  const signIn = () => {
    localStorage.setItem(PROTO_SESSION_KEY, '1')
    setRoute('dashboard')
  }

  const signOut = () => {
    localStorage.removeItem(PROTO_SESSION_KEY)
    setRoute('signin')
  }

  if (route === 'signin') {
    return (
      <div data-synth-prototype className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
        <SignInScreen onSignedIn={signIn} />
      </div>
    )
  }

  return (
    <div
      data-synth-prototype
      className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-row items-stretch overflow-hidden"
      style={{ background: THEME.light }}
    >
      <aside
        className="flex w-[200px] shrink-0 flex-col border-r bg-white sm:w-[220px]"
        style={{ borderColor: THEME.border }}
      >
        <div className="border-b px-4 py-4 sm:py-5" style={{ borderColor: THEME.border }}>
          <div className="text-[18px] font-semibold text-zinc-900" style={{ fontFamily: THEME.logoFont, fontWeight: THEME.logoWeight }}>
            synth<span style={{ color: THEME.logoDotColor }}>.</span>
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
            Cal Women&apos;s Rowing
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2 sm:px-4">
          {navItems.map((item) => {
            const active = route === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setRoute(item.id)}
                className="rounded-lg px-2 py-2.5 text-left text-[12px] font-semibold transition-colors sm:px-3"
                style={{
                  fontFamily: THEME.fontSans,
                  background: active ? `${THEME.primary}14` : 'transparent',
                  color: active ? THEME.primaryDark : THEME.textSecondary,
                }}
              >
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="border-t px-3 py-3 sm:px-4" style={{ borderColor: THEME.border }}>
          <button
            type="button"
            className="w-full rounded-lg px-3 py-2 text-[11px] font-medium text-zinc-500 hover:bg-zinc-100"
            style={{ fontFamily: THEME.fontMono }}
            onClick={signOut}
          >
            Sign out
          </button>
          <button
            type="button"
            className="mt-2 w-full text-[10px] text-zinc-400 underline-offset-2 hover:underline"
            style={{ fontFamily: THEME.fontMono }}
            onClick={() => {
              window.location.hash = ''
            }}
          >
            Pitch deck
          </button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-x-hidden">
        <header
          className="flex shrink-0 items-center gap-4 border-b px-5 py-3 sm:px-6 lg:px-8 sm:py-4"
          style={{ borderColor: THEME.border, background: '#fff' }}
        >
          <div className="min-w-0 flex-1">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
              {navItems.find((n) => n.id === route)?.label ?? 'Dashboard'}
            </h2>
            <p className="text-[15px] font-semibold text-zinc-900 sm:text-[17px]" style={{ fontFamily: THEME.fontSerif }}>
              {route === 'dashboard' ? 'Team overview' : route === 'sources' ? 'Connectors' : route === 'athletes' ? 'Roster' : 'Lineups'}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
            {route === 'dashboard' ? (
              <>
                <span
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-900 shadow-sm"
                  style={{ fontFamily: THEME.fontMono }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </span>
                <button
                  type="button"
                  className="rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-md transition hover:brightness-105"
                  style={{
                    fontFamily: THEME.fontMono,
                    background: THEME.primary,
                    boxShadow: `0 4px 16px ${THEME.primary}55`,
                  }}
                >
                  Synth agent
                </button>
                <span className="hidden h-8 w-px bg-zinc-200 sm:block" aria-hidden />
              </>
            ) : null}
            <div className="text-right">
              <p className="text-[11px] font-medium text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
                Signed in
              </p>
              <p className="text-[10px] text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
                coach@berkeley.edu
              </p>
            </div>
          </div>
        </header>

        <main
          className={
            route === 'dashboard'
              ? 'flex min-h-0 flex-1 flex-col overflow-hidden bg-zinc-100'
              : route === 'athletes'
                ? 'flex min-h-0 flex-1 flex-col overflow-hidden bg-zinc-50/90'
                : 'min-h-0 flex-1 overflow-auto bg-zinc-50/90 px-5 py-4 sm:px-6 lg:px-8 sm:py-6'
          }
        >
          {route === 'dashboard' && (
            <>
              <p
                className="shrink-0 border-b border-zinc-200/90 bg-white px-5 py-2.5 text-[12px] leading-snug text-zinc-600 sm:px-6 lg:px-8"
                style={{ fontFamily: THEME.fontSans }}
              >
                Ingest mirrors <strong className="font-semibold text-zinc-800">WOMENS_DATA.md</strong> —{' '}
                <span className="font-mono text-[11px] text-zinc-700">rowing_women__ 2024-2025 ERGS-2.xlsx</span> +{' '}
                <span className="font-mono text-[11px] text-zinc-700">rowing_women_2025-2026 ERGS-2.xlsx</span> · roster + dated
                sessions + 316 2k test
              </p>
              <div className="grid shrink-0 grid-cols-2 gap-2 border-b border-zinc-200/90 bg-zinc-50/90 px-5 py-3 sm:grid-cols-4 sm:px-6 lg:px-8">
                {[
                  { label: 'Roster (Names)', value: String(ROWIQ_ROSTER_COUNT_2526), sub: '25–26 sheet' },
                  { label: 'Sessions logged', value: `${ROWIQ_SESSIONS_2425 + ROWIQ_SESSIONS_2526}`, sub: 'both workbooks' },
                  { label: '25–26 season', value: String(ROWIQ_SESSIONS_2526), sub: 'dated workouts' },
                  {
                    label: 'Latest 2k',
                    value: new Date(`${ROWIQ_SHEET_316_DATE}T12:00:00`).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }),
                    sub: 'Sheet 316 2k',
                  },
                ].map((k) => (
                  <div
                    key={k.label}
                    className="rounded-lg border bg-white px-3 py-2 shadow-sm"
                    style={{ borderColor: THEME.border }}
                  >
                    <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
                      {k.label}
                    </div>
                    <div className="mt-0.5 text-lg font-bold tabular-nums text-zinc-900" style={{ fontFamily: THEME.fontMono }}>
                      {k.value}
                    </div>
                    <div className="text-[10px] text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
                      {k.sub}
                    </div>
                  </div>
                ))}
              </div>
              <div className="min-h-0 min-w-0 max-w-full flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-5 py-4 sm:px-6 lg:px-8 lg:py-6">
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={TRANSITIONS.smooth}
                  className="flex min-h-0 min-w-0 max-w-full flex-col gap-6 pb-8"
                >
                  <SynthLayerDashboardMockup
                    embeddedApp
                    hideSidebar
                    showCoachProfile={false}
                    showSidebarDeploy={false}
                    teamSubtitle={WOMENS_TEAM_SUBTITLE}
                    athleteRows={WOMENS_ATHLETES}
                    tableColumnHeaders={WOMENS_TABLE_HEADERS}
                    squatColumnSuffix=""
                    signalPrimary={{ labels: WOMENS_SIGNAL_MONTH_LABELS, values: WOMENS_SIGNAL_MONTH_VALUES }}
                    signalSecondary={{ labels: WOMENS_SIGNAL_BLOCK_LABELS, values: WOMENS_SIGNAL_BLOCK_VALUES }}
                    aiInsightText={WOMENS_AI_INSIGHT}
                    tableMaxHeight="min(42rem, 62vh)"
                    sourcesIngestSuffix={WOMENS_SOURCES_INGEST}
                  />
                  <RowiqWomensCharts />
                </motion.div>
              </div>
            </>
          )}

          {route === 'sources' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-3xl space-y-3">
              {WOMENS_CONNECTORS.map((c) => {
                const col = colorForKey(c.colorKey)
                return (
                  <div
                    key={c.name}
                    className="flex items-center justify-between rounded-xl border bg-white px-4 py-4 shadow-sm"
                    style={{ borderColor: THEME.border }}
                  >
                    <div>
                      <p className="text-[14px] font-semibold text-zinc-900" style={{ fontFamily: THEME.fontSans }}>
                        {c.name}
                      </p>
                      <p className="text-[12px] text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
                        {c.detail}
                      </p>
                    </div>
                    <span
                      className="rounded-full border px-3 py-1 text-[11px] font-bold"
                      style={{
                        fontFamily: THEME.fontMono,
                        borderColor: `${col}40`,
                        background: `${col}12`,
                        color: col,
                      }}
                    >
                      {c.status}
                    </span>
                  </div>
                )
              })}
            </motion.div>
          )}

          {route === 'athletes' && (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden overscroll-y-contain px-5 py-4 sm:px-6 lg:px-8">
              <SynthAthleteCardsView />
            </div>
          )}

          {route === 'lineups' && (
            <div
              className="mx-auto max-w-[560px] rounded-xl border border-dashed bg-white p-8 text-center"
              style={{ borderColor: `${THEME.primary}55` }}
            >
              <p className="text-[14px] font-semibold text-zinc-900" style={{ fontFamily: THEME.fontSerif }}>
                Lineups builder
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
                Boat assignments and seat tools ship in the next prototype slice. Dashboard and roster use the same athlete IDs as the
                Excel ingest.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
