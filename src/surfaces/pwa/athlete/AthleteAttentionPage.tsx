import { useNavigate } from 'react-router-dom'
import { AlertTriangle, TrendingDown, Wifi, Calendar, Shield, ArrowUpRight } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { SwipeBackPage } from '../primitives/SwipeBackPage'
import type { ReactNode } from 'react'

type Severity = 'high' | 'med' | 'low'

type Flag = {
  id: string
  icon: ReactNode
  title: string
  body: string
  source: string
  syncedLabel: string
  severity: Severity
}

const SEVERITY_COLOR: Record<Severity, string> = {
  high: SYNTH.accentRed,
  med: SYNTH.accentAmber,
  low: SYNTH.accentEmerald,
}

const FLAGS: Flag[] = [
  {
    id: 'recovery',
    icon: <Shield size={18} strokeWidth={2.2} />,
    title: 'Recovery below threshold',
    body: 'Your recovery score dropped to 58 — 18% below your 30-day average. Consider reducing training intensity today.',
    source: 'WHOOP',
    syncedLabel: '6m ago',
    severity: 'high',
  },
  {
    id: 'split',
    icon: <TrendingDown size={18} strokeWidth={2.2} />,
    title: 'Split degraded last week',
    body: 'Average 500m split slipped 3.2% (1:52.4 vs 1:48.9 baseline). Coach Geri has been notified.',
    source: 'Concept2',
    syncedLabel: '4m ago',
    severity: 'med',
  },
  {
    id: 'hrv',
    icon: <AlertTriangle size={18} strokeWidth={2.2} />,
    title: 'HRV trending down 5 days',
    body: 'Heart rate variability has dropped each day this week. Prioritise sleep, hydration, and recovery meals.',
    source: 'WHOOP',
    syncedLabel: '6m ago',
    severity: 'med',
  },
  {
    id: 'sessions',
    icon: <Calendar size={18} strokeWidth={2.2} />,
    title: '2 sessions not logged',
    body: 'Tuesday AM and Thursday PM sessions are missing. Mark them complete in Notes if you did train.',
    source: 'synth',
    syncedLabel: 'just now',
    severity: 'low',
  },
  {
    id: 'sync',
    icon: <Wifi size={18} strokeWidth={2.2} />,
    title: 'TrainingPeaks not syncing',
    body: 'Last successful sync was 48 hours ago. Reconnect in Sources to restore full training load data.',
    source: 'TrainingPeaks',
    syncedLabel: '48h ago',
    severity: 'low',
  },
]

export function AthleteAttentionPage() {
  const navigate = useNavigate()

  const high = FLAGS.filter((f) => f.severity === 'high')
  const med = FLAGS.filter((f) => f.severity === 'med')
  const low = FLAGS.filter((f) => f.severity === 'low')

  const groups = [
    { label: 'High priority', items: high },
    { label: 'Medium priority', items: med },
    { label: 'Low priority', items: low },
  ]

  return (
    <SwipeBackPage to="/app/athlete/home">
      <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-safe-tab">
        {/* Header */}
        <div
          className="px-5 pb-4"
          style={{ paddingTop: 'max(env(safe-area-inset-top), 20px)' }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            synth · athlete
          </p>
          <h1
            className="mt-1 text-[28px] font-bold leading-[1.1] tracking-[-0.02em]"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            Attention
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
            {FLAGS.length} flags active today
          </p>
        </div>

        {/* Flag groups */}
        {groups.map((group) =>
          group.items.length === 0 ? null : (
            <section key={group.label} className="mt-4 px-5">
              <p
                className="pb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
              >
                {group.label}
              </p>
              <div className="flex flex-col gap-3">
                {group.items.map((flag) => (
                  <div
                    key={flag.id}
                    className="overflow-hidden rounded-2xl p-4"
                    style={{
                      background: SYNTH.inlineCard,
                      border: `1px solid ${SYNTH.inlineCardBorder}`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          background: SEVERITY_COLOR[flag.severity] + '22',
                          color: SEVERITY_COLOR[flag.severity],
                        }}
                      >
                        {flag.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p
                            className="text-[14px] font-semibold leading-tight"
                            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                          >
                            {flag.title}
                          </p>
                          <span
                            className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ background: SEVERITY_COLOR[flag.severity] }}
                          />
                        </div>
                        <p
                          className="mt-1.5 text-[13px] leading-[1.45]"
                          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                        >
                          {flag.body}
                        </p>
                        <p
                          className="mt-2 text-[10px] uppercase tracking-[0.14em]"
                          style={{
                            color: SYNTH.provenanceOnBrand,
                            fontFamily: SYNTH.font,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {flag.source} · {flag.syncedLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ),
        )}

        {/* Ask synth CTA */}
        <section className="mt-6 px-5">
          <button
            type="button"
            onClick={() => navigate('/app/athlete/ai')}
            className="flex w-full items-center justify-between rounded-2xl px-4 py-4 active:opacity-80"
            style={{
              background: SYNTH.inlineCard,
              border: `1px solid ${SYNTH.inlineCardBorder}`,
            }}
          >
            <div className="text-left">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
              >
                Ask synth
              </p>
              <p
                className="mt-0.5 text-[14px] font-semibold"
                style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
              >
                "How do I improve my recovery this week?"
              </p>
            </div>
            <ArrowUpRight size={18} color={SYNTH.inkOnBrandMuted} />
          </button>
        </section>
      </div>
    </SwipeBackPage>
  )
}
