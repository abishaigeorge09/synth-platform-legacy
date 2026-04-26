import { useMemo, useState } from 'react'
import { PageHeader } from '../../dashboard/components/PageHeader'
import { THEME } from '../../../../lib/theme'
import {
  makeEmptyBoat,
  useAthletes,
  useErgScores,
  getAthleteRecovery,
  type BoatLineup,
} from '../../../../shared/data/queries'
import { QueryError } from '../../../../shared/components/QueryError'
import { SkeletonBlock, SkeletonLine } from '../../../../shared/components/Skeleton'
import { toast } from '../../../../shared/store/useToastStore'
import { useLineupsStore } from '../../../../shared/store/useLineupsStore'

import { BuilderTab } from './components/BuilderTab'
import { InsightsTab } from './components/InsightsTab'
import { RaceTimerTab } from './components/RaceTimerTab'
import { SessionsTab } from './components/SessionsTab'
import { HistoryTab } from './components/HistoryTab'
import type { DemoAthlete } from './data/demoLineupData'

// ─── Types ────────────────────────────────────────────────────────────────────

type SubTab = 'builder' | 'insights' | 'timer' | 'sessions' | 'history'
type AthleteSide = 'port' | 'starboard' | 'cox'

// ─── Constants ───────────────────────────────────────────────────────────────

const SUBTABS: Array<{ id: SubTab; label: string }> = [
  { id: 'builder',  label: 'Builder' },
  { id: 'insights', label: 'Insights' },
  { id: 'timer',    label: 'Race Timer' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'history',  label: 'History' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtErgTime(seconds?: number) {
  if (seconds == null || !Number.isFinite(seconds)) return '—'
  const m = Math.floor(seconds / 60)
  const s = (seconds - m * 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}



const AVATAR_COLORS = [
  '#2d6a4f', '#5b4a9e', '#1a73e8', '#e67e22',
  '#16a085', '#8e44ad', '#c0392b', '#2980b9',
  '#27ae60', '#d35400', '#7f8c8d', '#8e44ad',
]

// ─── LineupsPage ──────────────────────────────────────────────────────────────

export function LineupsPage() {
  const [tab, setTab] = useState<SubTab>('builder')

  const { data: athletes, isLoading, isError, error } = useAthletes()
  const { data: ergScores } = useErgScores()

  // Build demo roster from real seed data
  const demoRoster: DemoAthlete[] = useMemo(
    () =>
      athletes.map((a, idx) => {
        const erg = ergScores.find((e) => e.athleteId === a.id)
        const t = erg?.timeSeconds
        const isCox = a.name === 'Charly Johnson' || a.name === 'Casey Morgan'
        const side: AthleteSide = isCox ? 'cox' : a.side === 'port' ? 'port' : 'starboard'
        const parts = a.name.split(/\s+/).filter(Boolean)
        const initials = ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
        return {
          id: a.id,
          name: a.name,
          initials: initials.slice(0, 2) || '??',
          side,
          ergTime: isCox ? 'cox' : fmtErgTime(t),
          ergSeconds: isCox ? Number.POSITIVE_INFINITY : (t ?? 400),
          recovery: getAthleteRecovery(a.id, a.name),
          avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
        }
      }),
    [athletes, ergScores],
  )

  const publishLineup = useLineupsStore((s) => s.publish)

  // ── Shared state ──
  const [boats, setBoats] = useState<BoatLineup[]>([
    makeEmptyBoat('boat-1v', '1V 8+', 8),
    makeEmptyBoat('boat-2v', '2V 8+', 8),
  ])
  const [banner, setBanner] = useState(false)

  // Derived counts
  const totalSeats = boats.reduce((sum, b) => sum + b.seats.length, 0)
  const filledSeats = boats.reduce((sum, b) => sum + b.seats.filter((s) => s.athleteId).length, 0)

  function switchTab(id: SubTab) {
    setTab(id)
  }

  function addBoat() {
    setBoats((prev) => [
      ...prev,
      makeEmptyBoat(`boat-${Date.now()}`, `Boat ${prev.length + 1}`, 8),
    ])
  }

  function publish() {
    publishLineup({
      sessionTitle: 'Published lineup',
      date: new Date().toISOString().slice(0, 10),
      note: `${boats.length} boats`,
      boats,
    })
    setBanner(true)
    toast('Lineup published — athletes notified', 'success')
    // Auto-dismiss after 8s
    setTimeout(() => setBanner(false), 8000)
  }

  // ── Loading / error ──
  if (isError) return <QueryError label="Lineups" error={error} />
  if (isLoading) {
    return (
      <div className="flex min-h-full w-full flex-col pb-12">
        <header className="px-5 pb-5 pt-8 sm:px-10">
          <SkeletonLine width={180} height={8} />
          <SkeletonLine width={260} height={28} className="mt-2" />
        </header>
        <SkeletonBlock className="mx-5 sm:mx-10 rounded-xl" style={{ height: 300 }} />
      </div>
    )
  }

  return (
    <div className="flex min-h-full w-full flex-col pb-8">
      {/* Page header */}
      <PageHeader
        kicker="CUSTOM TOOLS · LINEUPS"
        title="Boat builder"
        subtitle={`${filledSeats} of ${totalSeats} seats · ${boats.length} boats`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={addBoat}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px solid ${THEME.border}`,
                background: THEME.white,
                color: THEME.textPrimary,
                fontFamily: THEME.fontMono,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Add Boat
            </button>
            <button
              type="button"
              onClick={publish}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'var(--green-primary)',
                color: '#fff',
                border: 'none',
                fontFamily: THEME.fontMono,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              PUBLISH LINEUP →
            </button>
          </div>
        }
      />

      {/* SubTab bar */}
      <div
        className="sticky top-0 z-10 border-b px-5 sm:px-10"
        style={{
          borderColor: THEME.border,
          background: 'color-mix(in srgb, var(--surface, #fff) 95%, transparent)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ display: 'flex', gap: 0 }}>
          {SUBTABS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => switchTab(s.id)}
              style={{
                padding: '14px 18px',
                fontSize: 13,
                fontWeight: tab === s.id ? 700 : 500,
                fontFamily: tab === s.id ? THEME.fontMono : THEME.fontSans,
                color: tab === s.id ? THEME.textPrimary : THEME.textSecondary,
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${tab === s.id ? 'var(--green-primary)' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'border-color 0.15s, color 0.15s',
                letterSpacing: tab === s.id ? '0.02em' : 0,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'builder' && (
        <BuilderTab
          boats={boats}
          roster={demoRoster}
          onSetBoats={setBoats}
          showBanner={banner}
          onBannerDismiss={() => setBanner(false)}
          onGoHistory={() => switchTab('history')}
          onGoSessions={() => switchTab('sessions')}
        />
      )}

      {tab === 'insights' && (
        <InsightsTab
          onApplySuggested={() => switchTab('builder')}
          onGoHistory={() => switchTab('history')}
        />
      )}

      {tab === 'timer' && (
        <RaceTimerTab boats={boats} />
      )}

      {tab === 'sessions' && (
        <SessionsTab
          onGoTimer={() => switchTab('timer')}
          onGoHistory={() => switchTab('history')}
        />
      )}

      {tab === 'history' && (
        <HistoryTab />
      )}
    </div>
  )
}
