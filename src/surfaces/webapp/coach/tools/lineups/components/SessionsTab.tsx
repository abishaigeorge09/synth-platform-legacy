import { useState } from 'react'
import { THEME } from '@lib/theme'
import { DEMO_SESSIONS } from '../data/demoLineupData'
import { toast } from '@shared/store/useToastStore'

interface Props {
  onGoTimer: () => void
  onGoHistory: () => void
}

function StatusBadge({ status }: { status: 'upcoming' | 'completed' }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '0.1em',
        padding: '3px 8px',
        borderRadius: 4,
        background: status === 'upcoming' ? 'var(--amber-subtle)' : 'var(--green-subtle)',
        color: status === 'upcoming' ? 'var(--amber-primary)' : 'var(--green-primary)',
        display: 'inline-block',
        textTransform: 'uppercase',
      }}
    >
      {status}
    </span>
  )
}

function KindBadge({ kind }: { kind: 'RACE' | 'PRAC' }) {
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 700,
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '0.1em',
        padding: '2px 6px',
        borderRadius: 4,
        background: kind === 'RACE' ? 'var(--red-subtle)' : 'var(--green-subtle)',
        color: kind === 'RACE' ? 'var(--red-primary)' : 'var(--green-primary)',
        textTransform: 'uppercase',
      }}
    >
      {kind}
    </span>
  )
}

// ─── Create Session Modal ────────────────────────────────────────────────────

function CreateSessionModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('New Practice')
  const [type, setType] = useState<'Practice' | 'Race Day'>('Practice')
  const [date, setDate] = useState('2026-04-27')
  const [time, setTime] = useState('06:00')
  const [lineupSource, setLineupSource] = useState<'builder' | 'published'>('builder')
  const [boats1v, setBoats1v] = useState(true)
  const [boats2v, setBoats2v] = useState(true)
  const [boatsV4, setBoatsV4] = useState(false)

  function handleCreate() {
    onClose()
    toast(`Session "${name}" created`, 'success')
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 14,
          padding: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            fontFamily: THEME.fontMono,
            color: 'var(--text-primary)',
            marginBottom: 16,
          }}
        >
          Create Session
        </h3>

        <div style={{ display: 'grid', gap: 10 }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: 11, fontFamily: THEME.fontMono, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
              NAME
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid var(--border-default)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 14,
                background: 'var(--bg-surface-raised)',
                color: 'var(--text-primary)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Type */}
          <div>
            <label style={{ fontSize: 11, fontFamily: THEME.fontMono, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
              TYPE
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['Practice', 'Race Day'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 8,
                    border: `1px solid ${type === t ? 'var(--green-primary)' : 'var(--border-default)'}`,
                    background: type === t ? 'var(--green-subtle)' : 'transparent',
                    color: type === t ? 'var(--green-primary)' : 'var(--text-secondary)',
                    fontSize: 13,
                    fontFamily: THEME.fontMono,
                    cursor: 'pointer',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Date + Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, fontFamily: THEME.fontMono, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
                DATE
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid var(--border-default)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  fontSize: 13,
                  background: 'var(--bg-surface-raised)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontFamily: THEME.fontMono, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
                TIME
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid var(--border-default)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  fontSize: 13,
                  background: 'var(--bg-surface-raised)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Lineup source */}
          <div>
            <label style={{ fontSize: 11, fontFamily: THEME.fontMono, color: 'var(--text-tertiary)', display: 'block', marginBottom: 6 }}>
              LINEUP SOURCE
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { id: 'builder' as const, label: 'Use current builder' },
                { id: 'published' as const, label: 'Use published lineup' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: `1px solid ${lineupSource === opt.id ? 'var(--green-primary)' : 'var(--border-default)'}`,
                    background: lineupSource === opt.id ? 'var(--green-subtle)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: lineupSource === opt.id ? 'var(--green-primary)' : 'var(--text-secondary)',
                  }}
                >
                  <input
                    type="radio"
                    name="lineupSource"
                    value={opt.id}
                    checked={lineupSource === opt.id}
                    onChange={() => setLineupSource(opt.id)}
                    style={{ accentColor: 'var(--green-primary)' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Boat checkboxes */}
          <div>
            <label style={{ fontSize: 11, fontFamily: THEME.fontMono, color: 'var(--text-tertiary)', display: 'block', marginBottom: 6 }}>
              BOATS
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: '1V 8+', checked: boats1v, set: setBoats1v },
                { label: '2V 8+', checked: boats2v, set: setBoats2v },
                { label: 'V4+',   checked: boatsV4, set: setBoatsV4 },
              ].map(({ label, checked, set }) => (
                <label
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: `1px solid ${checked ? 'var(--green-primary)' : 'var(--border-default)'}`,
                    background: checked ? 'var(--green-subtle)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontFamily: THEME.fontMono,
                    color: checked ? 'var(--green-primary)' : 'var(--text-secondary)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => set(e.target.checked)}
                    style={{ accentColor: 'var(--green-primary)' }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: 8,
              border: '1px solid var(--border-default)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: 12,
              fontFamily: THEME.fontMono,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            style={{
              padding: '9px 18px',
              borderRadius: 8,
              background: 'var(--green-primary)',
              color: '#fff',
              border: 'none',
              fontSize: 12,
              fontFamily: THEME.fontMono,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Create Session →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SessionsTab ─────────────────────────────────────────────────────────────

export function SessionsTab({ onGoTimer, onGoHistory }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  const upcoming = DEMO_SESSIONS.filter((s) => s.status === 'upcoming').length
  const completed = DEMO_SESSIONS.filter((s) => s.status === 'completed').length

  return (
    <div style={{ padding: '16px 24px', paddingBottom: 40, fontFamily: THEME.fontSans }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Sessions
            </h2>
            <span
              style={{
                fontSize: 11,
                fontFamily: THEME.fontMono,
                color: 'var(--text-tertiary)',
                padding: '2px 8px',
                borderRadius: 4,
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
              }}
            >
              {DEMO_SESSIONS.length} total
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Upcoming:{' '}
            <strong style={{ color: 'var(--amber-primary)' }}>{upcoming}</strong>
            {' · '}
            Completed:{' '}
            <strong style={{ color: 'var(--green-primary)' }}>{completed}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            background: 'var(--green-primary)',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: THEME.fontMono,
            fontSize: 12,
          }}
        >
          + Create Session
        </button>
      </div>

      {/* Session cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {DEMO_SESSIONS.map((session) => (
          <div
            key={session.id}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderLeft: `4px solid ${session.status === 'upcoming' ? 'var(--amber-primary)' : 'var(--green-primary)'}`,
              borderRadius: 10,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <KindBadge kind={session.kind} />
                  <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {session.name}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{session.type}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{session.boats}</div>
                {session.best && (
                  <div style={{ fontSize: 13, color: 'var(--green-primary)', marginTop: 6, fontFamily: THEME.fontMono, fontWeight: 600 }}>
                    Best: {session.best}
                  </div>
                )}
                {session.runsCount && (
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {session.runsCount} run{session.runsCount > 1 ? 's' : ''} recorded
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{session.date}</div>
                <div style={{ marginTop: 6 }}>
                  <StatusBadge status={session.status} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  if (session.status === 'upcoming') onGoTimer()
                  else onGoHistory()
                }}
                style={{
                  padding: '7px 14px',
                  borderRadius: 6,
                  fontSize: 12,
                  background: 'transparent',
                  border: '1px solid var(--border-default)',
                  color: 'var(--green-primary)',
                  cursor: 'pointer',
                  fontFamily: THEME.fontMono,
                  fontWeight: 600,
                }}
              >
                {session.status === 'upcoming' ? 'Open in Timer →' : 'View Results →'}
              </button>
              <button
                type="button"
                onClick={() => toast(`Editing "${session.name}" (demo)`, 'info')}
                style={{
                  padding: '7px 14px',
                  borderRadius: 6,
                  fontSize: 12,
                  background: 'transparent',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontFamily: THEME.fontMono,
                }}
              >
                Edit
              </button>
              {session.status === 'completed' && (
                <button
                  type="button"
                  onClick={() => toast('Export to CSV (demo)', 'info')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 6,
                    fontSize: 12,
                    background: 'transparent',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontFamily: THEME.fontMono,
                  }}
                >
                  Export
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {modalOpen && <CreateSessionModal onClose={() => setModalOpen(false)} />}
    </div>
  )
}
