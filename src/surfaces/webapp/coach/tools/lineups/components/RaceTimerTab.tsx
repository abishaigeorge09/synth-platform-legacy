import { useState, useRef, useEffect } from 'react'
import { THEME } from '@lib/theme'
import type { BoatLineup } from '@shared/data/queries'
import { SPLIT_HISTORY_DEMO } from '../data/demoLineupData'
import { toast } from '@shared/store/useToastStore'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BoatTimer {
  running: boolean
  startedAt: number | null
  elapsedMs: number
  splits: number[]
}

interface SwapState {
  athleteA: string | null
  athleteB: string | null
}

interface Run {
  id: number
  label: string
  swaps: { from: string; to: string }[]
}

interface Props {
  boats: BoatLineup[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(ms: number): string {
  const sec = Math.floor(ms / 1000)
  const min = Math.floor(sec / 60)
  const rem = sec % 60
  const cent = Math.floor((ms % 1000) / 10)
  return `${String(min).padStart(2, '0')}:${String(rem).padStart(2, '0')}.${String(cent).padStart(2, '0')}`
}

// Fallback crew names for demo when boat seats are empty
const FALLBACK_CREW: Record<string, { crew: string; cox: string }> = {
  'boat-1v': { crew: 'Wheeler, Irmler, Abbott, Miller, Roth, Bouman, Crampin, Van W.', cox: 'Johnson' },
  'boat-2v': { crew: 'Bell, Ellis, Kent, Ng, Flores, Hansen, Roth, Abbott', cox: 'Morgan' },
}

function getCrewLine(boat: BoatLineup): string {
  const rowers = boat.seats.filter((s) => !s.isCox && s.athleteId).map((s) => s.athleteId!)
  if (rowers.length >= 4) return rowers.slice(0, 6).join(', ')
  const fb = FALLBACK_CREW[boat.id]
  return fb ? fb.crew : '—'
}

function getCoxLine(boat: BoatLineup): string {
  const cox = boat.seats.find((s) => s.isCox)
  if (cox?.athleteId) return cox.athleteId
  const fb = FALLBACK_CREW[boat.id]
  return fb ? fb.cox : '—'
}

// ─── Swap modal ───────────────────────────────────────────────────────────────

const SWAP_DEMO_ATHLETES = [
  'Wheeler', 'Irmler', 'Abbott', 'Miller', 'Roth', 'Bouman', 'Crampin', 'Van W.', 'Johnson (cox)',
]

function SwapModal({
  onClose,
  onCreateRun,
}: {
  onClose: () => void
  onCreateRun: (swaps: { from: string; to: string }[]) => void
}) {
  const [swapState, setSwapState] = useState<SwapState>({ athleteA: null, athleteB: null })
  const [confirmedSwaps, setConfirmedSwaps] = useState<{ from: string; to: string }[]>([])
  const [flash, setFlash] = useState<string[]>([])

  function tap(name: string) {
    if (flash.includes(name)) return
    if (!swapState.athleteA) {
      setSwapState({ athleteA: name, athleteB: null })
      return
    }
    if (swapState.athleteA === name) {
      setSwapState({ athleteA: null, athleteB: null })
      return
    }
    const swap = { from: swapState.athleteA, to: name }
    setConfirmedSwaps((prev) => [...prev, swap])
    setFlash([swapState.athleteA!, name])
    setTimeout(() => setFlash([]), 800)
    setSwapState({ athleteA: null, athleteB: null })
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: 480, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 14, padding: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontFamily: THEME.fontMono, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
          New Run Lineup
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Tap two athletes to swap them. Changes apply to the next run.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {SWAP_DEMO_ATHLETES.map((name) => {
            const isA = swapState.athleteA === name
            const isFlash = flash.includes(name)
            return (
              <button
                key={name}
                type="button"
                onClick={() => tap(name)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontFamily: THEME.fontMono,
                  border: `1px solid ${isA ? '#3B82F6' : isFlash ? 'var(--green-primary)' : 'var(--border-default)'}`,
                  background: isFlash ? 'var(--green-subtle)' : isA ? 'rgba(59,130,246,0.1)' : 'transparent',
                  color: isFlash ? 'var(--green-primary)' : isA ? '#3B82F6' : 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {name}
              </button>
            )
          })}
        </div>

        {confirmedSwaps.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontFamily: THEME.fontMono, color: 'var(--text-tertiary)', marginBottom: 6 }}>
              SWAP HISTORY
            </div>
            {confirmedSwaps.map((s, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '3px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--red-primary)' }}>{s.from}</span>
                <span>↔</span>
                <span style={{ color: 'var(--green-primary)' }}>{s.to}</span>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setConfirmedSwaps((prev) => prev.slice(0, -1))}
              style={{ marginTop: 6, fontSize: 11, color: 'var(--text-tertiary)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: THEME.fontMono }}
            >
              Undo last swap
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, fontFamily: THEME.fontMono, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { onCreateRun(confirmedSwaps); onClose() }}
            style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--green-primary)', color: '#fff', border: 'none', fontSize: 12, fontFamily: THEME.fontMono, fontWeight: 600, cursor: 'pointer' }}
          >
            Create Run →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── RaceTimerTab ─────────────────────────────────────────────────────────────

export function RaceTimerTab({ boats }: Props) {
  const [timers, setTimers] = useState<Record<string, BoatTimer>>({})
  const [runs, setRuns] = useState<Run[]>([
    { id: 1, label: 'Run 1', swaps: [] },
    { id: 2, label: 'Run 2', swaps: [] },
  ])
  const [activeRun, setActiveRun] = useState(0)
  const [swapOpen, setSwapOpen] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Global tick
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev }
        let changed = false
        Object.keys(next).forEach((k) => {
          const t = next[k]
          if (t.running && t.startedAt) {
            next[k] = { ...t, elapsedMs: Date.now() - t.startedAt }
            changed = true
          }
        })
        return changed ? next : prev
      })
    }, 50)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  function getTimer(boatId: string): BoatTimer {
    return timers[boatId] ?? { running: false, startedAt: null, elapsedMs: 0, splits: [] }
  }

  function startBoat(boatId: string) {
    setTimers((prev) => {
      const cur = prev[boatId] ?? { running: false, startedAt: null, elapsedMs: 0, splits: [] }
      return { ...prev, [boatId]: { ...cur, running: true, startedAt: Date.now() - cur.elapsedMs } }
    })
  }

  function pauseBoat(boatId: string) {
    setTimers((prev) => {
      const cur = prev[boatId]
      if (!cur) return prev
      return { ...prev, [boatId]: { ...cur, running: false, startedAt: null } }
    })
  }

  function splitBoat(boatId: string) {
    setTimers((prev) => {
      const cur = prev[boatId]
      if (!cur) return prev
      return { ...prev, [boatId]: { ...cur, splits: [...cur.splits, cur.elapsedMs] } }
    })
  }

  function finishBoat(boatId: string) {
    pauseBoat(boatId)
    toast(`${boats.find((b) => b.id === boatId)?.name ?? 'Boat'} finished`, 'success')
  }

  function startAllBoats() {
    setTimers((prev) => {
      const next = { ...prev }
      for (const boat of boats) {
        const cur = next[boat.id] ?? { running: false, startedAt: null, elapsedMs: 0, splits: [] }
        next[boat.id] = { ...cur, running: true, startedAt: Date.now() - cur.elapsedMs }
      }
      return next
    })
  }

  function resetAll() {
    setTimers({})
  }

  function addRun(swaps: { from: string; to: string }[]) {
    const n = runs.length + 1
    setRuns((prev) => [...prev, { id: n, label: `Run ${n}`, swaps }])
    setActiveRun(runs.length)
    resetAll()
  }

  const anyRunning = boats.some((b) => getTimer(b.id).running)

  return (
    <div style={{ padding: '16px 24px', paddingBottom: 40 }}>
      {/* Run tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {runs.map((run, i) => (
          <button
            key={run.id}
            type="button"
            onClick={() => setActiveRun(i)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              fontFamily: THEME.fontMono,
              fontSize: 12,
              fontWeight: 600,
              background: activeRun === i ? 'var(--green-primary)' : 'var(--bg-surface)',
              color: activeRun === i ? '#fff' : 'var(--text-secondary)',
              border: activeRun === i ? 'none' : '1px solid var(--border-default)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {run.label}
            {i === activeRun && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: anyRunning ? '#A7F3D0' : 'rgba(255,255,255,0.5)',
                }}
              />
            )}
            {run.swaps.length > 0 && (
              <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.2)', borderRadius: 4, padding: '1px 4px' }}>
                {run.swaps.length} swap{run.swaps.length > 1 ? 's' : ''}
              </span>
            )}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSwapOpen(true)}
          style={{
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: 12,
            background: 'transparent',
            border: '1px dashed var(--border-default)',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            fontFamily: THEME.fontMono,
          }}
        >
          + New Run
        </button>
      </div>

      {/* START RACE button */}
      <button
        type="button"
        onClick={startAllBoats}
        style={{
          width: '100%',
          padding: '14px 24px',
          borderRadius: 10,
          marginBottom: 16,
          background: anyRunning ? 'var(--bg-surface)' : 'var(--green-primary)',
          color: anyRunning ? 'var(--text-secondary)' : '#fff',
          border: anyRunning ? '1px solid var(--border-default)' : 'none',
          fontFamily: THEME.fontMono,
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.08em',
        }}
      >
        {anyRunning ? 'RACE IN PROGRESS…' : 'START RACE — ALL BOATS'}
      </button>

      {/* Boat timer cards */}
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {boats.map((boat) => {
          const t = getTimer(boat.id)
          const isRunning = t.running
          const crew = getCrewLine(boat)
          const cox = getCoxLine(boat)

          return (
            <div
              key={boat.id}
              style={{
                borderRadius: 12,
                border: '1px solid var(--border-default)',
                padding: 20,
                background: isRunning
                  ? 'linear-gradient(160deg,#065F46,#047857)'
                  : 'var(--bg-surface)',
                transition: 'background 0.3s',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div
                  style={{
                    fontFamily: THEME.fontMono,
                    fontSize: 18,
                    fontWeight: 700,
                    color: isRunning ? '#A7F3D0' : 'var(--text-primary)',
                  }}
                >
                  {boat.name}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: THEME.fontMono,
                    color: isRunning ? '#A7F3D0' : 'var(--text-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: isRunning ? '#A7F3D0' : 'var(--text-tertiary)',
                      display: 'inline-block',
                    }}
                  />
                  {isRunning ? 'RUNNING' : 'IDLE'}
                </span>
              </div>
              <div style={{ fontSize: 11, color: isRunning ? 'rgba(167,243,208,0.7)' : 'var(--text-tertiary)', lineHeight: 1.4, marginBottom: 16 }}>
                {crew} · Cox: {cox}
              </div>

              {/* Big timer */}
              <div
                style={{
                  fontFamily: THEME.fontMono,
                  fontSize: 52,
                  fontWeight: 700,
                  color: isRunning ? '#A7F3D0' : 'var(--green-primary)',
                  textAlign: 'center',
                  letterSpacing: '-0.02em',
                  margin: '8px 0 12px',
                  lineHeight: 1,
                }}
              >
                {fmt(t.elapsedMs)}
              </div>

              <div
                style={{
                  textAlign: 'center',
                  fontSize: 11,
                  fontFamily: THEME.fontMono,
                  color: isRunning ? 'rgba(167,243,208,0.6)' : 'var(--text-tertiary)',
                  marginBottom: 16,
                }}
              >
                {t.splits.length} SPLIT{t.splits.length !== 1 ? 'S' : ''} · {boat.seats.filter((s) => s.athleteId).length || 9} ATHLETES
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', gap: 8 }}>
                {!isRunning ? (
                  <button
                    type="button"
                    onClick={() => startBoat(boat.id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 8,
                      background: 'var(--green-primary)',
                      color: '#fff',
                      border: 'none',
                      fontFamily: THEME.fontMono,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {t.elapsedMs > 0 ? 'RESUME' : 'START'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => pauseBoat(boat.id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.15)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.2)',
                      fontFamily: THEME.fontMono,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    PAUSE
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => splitBoat(boat.id)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 8,
                    background: 'transparent',
                    border: `1px solid ${isRunning ? 'rgba(255,255,255,0.3)' : 'var(--border-default)'}`,
                    color: isRunning ? '#fff' : 'var(--text-secondary)',
                    fontFamily: THEME.fontMono,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  SPLIT
                </button>
                <button
                  type="button"
                  onClick={() => finishBoat(boat.id)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 8,
                    background: 'transparent',
                    border: `1px solid ${isRunning ? 'rgba(255,255,255,0.3)' : 'var(--border-default)'}`,
                    color: isRunning ? '#A7F3D0' : 'var(--text-secondary)',
                    fontFamily: THEME.fontMono,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  FINISH
                </button>
              </div>

              {/* Live splits */}
              {t.splits.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {t.splits.map((s, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 11,
                        fontFamily: THEME.fontMono,
                        padding: '3px 7px',
                        borderRadius: 4,
                        background: isRunning ? 'rgba(255,255,255,0.1)' : 'var(--bg-surface-raised)',
                        color: isRunning ? '#A7F3D0' : 'var(--green-primary)',
                      }}
                    >
                      {fmt(s)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Split history table */}
      <div style={{ marginTop: 32 }}>
        <div
          style={{
            fontSize: 11,
            fontFamily: THEME.fontMono,
            color: 'var(--text-tertiary)',
            letterSpacing: '0.1em',
            marginBottom: 12,
          }}
        >
          SPLIT HISTORY · {runs[activeRun]?.label ?? 'Run 1'}
          {runs[activeRun]?.swaps?.length > 0 && (
            <span style={{ color: 'var(--amber-primary)', marginLeft: 8 }}>
              · {runs[activeRun].swaps.length} swap{runs[activeRun].swaps.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 1fr 80px',
              padding: '8px 16px',
              borderBottom: '1px solid var(--border-default)',
              fontSize: 10,
              color: 'var(--text-tertiary)',
              fontFamily: THEME.fontMono,
              letterSpacing: '0.08em',
            }}
          >
            <span>PIECE</span><span>1V 8+</span><span>2V 8+</span><span>DELTA</span>
          </div>
          {SPLIT_HISTORY_DEMO.map((row) => (
            <div
              key={row.piece}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 1fr 80px',
                padding: '9px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                fontFamily: THEME.fontMono,
                fontSize: 13,
                fontWeight: row.isFinish ? 700 : 400,
              }}
            >
              <span style={{ color: row.isFinish ? 'var(--green-primary)' : 'var(--text-tertiary)' }}>
                {row.piece}
              </span>
              <span style={{ color: row.isFinish ? 'var(--green-primary)' : 'var(--text-primary)' }}>
                {row.v1}
              </span>
              <span style={{ color: 'var(--text-primary)' }}>{row.v2}</span>
              <span style={{ color: 'var(--red-primary)' }}>{row.delta}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Swap modal */}
      {swapOpen && (
        <SwapModal
          onClose={() => setSwapOpen(false)}
          onCreateRun={addRun}
        />
      )}
    </div>
  )
}
