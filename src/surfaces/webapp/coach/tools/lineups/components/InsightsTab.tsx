import { THEME } from '@lib/theme'
import {
  PAIR_SCORES,
  SUGGESTED_1V,
  BEST_LINEUPS,
} from '../data/demoLineupData'
import { toast } from '@shared/store/useToastStore'

interface Props {
  onApplySuggested: () => void
  onGoHistory: () => void
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        minWidth: 0,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <h3
        style={{
          fontSize: 11,
          fontFamily: THEME.fontMono,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

export function InsightsTab({ onApplySuggested, onGoHistory }: Props) {
  return (
    <div className="px-4 py-4 pb-10 sm:px-6">
      <div
        className="grid gap-4 lg:grid-cols-2"
        style={{ paddingBottom: 12 }}
      >
        {/* Card 1: Pair Compatibility */}
        <Card title="Pair Compatibility">
          {PAIR_SCORES.map((item) => (
            <div
              key={item.pair}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '9px 0',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{item.pair}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Score bar */}
                <div
                  style={{
                    width: 60,
                    height: 6,
                    borderRadius: 3,
                    background: 'var(--border-default)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(item.score / 10) * 100}%`,
                      background: item.status === 'good' ? 'var(--green-primary)' : 'var(--amber-primary)',
                      borderRadius: 3,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: THEME.fontMono,
                    fontSize: 13,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: item.status === 'good' ? 'var(--green-subtle)' : 'var(--amber-subtle)',
                    color: item.status === 'good' ? 'var(--green-primary)' : 'var(--amber-primary)',
                    fontWeight: 600,
                  }}
                >
                  {item.score}
                </span>
              </div>
            </div>
          ))}
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 12 }}>
            Scores based on sync rate, stroke consistency, and historical pairing performance.
          </p>
        </Card>

        {/* Card 2: Recovery Alerts */}
        <Card title="Recovery Alerts">
          <div
            style={{
              padding: 12,
              background: 'var(--amber-subtle)',
              borderRadius: 8,
              border: '1px solid rgba(245,158,11,0.2)',
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--amber-primary)', fontWeight: 600 }}>
              ⚠ Star Miller — Recovery 62/100
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
              HRV 10% below baseline. Consider lighter seat or swap with Bouman (recovery: 91).
            </div>
          </div>
          <div
            style={{
              padding: 12,
              background: 'var(--red-subtle)',
              borderRadius: 8,
              border: '1px solid rgba(239,68,68,0.2)',
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--red-primary)', fontWeight: 600 }}>
              🔴 Madeline Cox — Recovery 42/100
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
              Poor sleep (5.1 hrs avg) + high soreness. Recommend rest or 2V only.
            </div>
          </div>
          <div
            style={{
              padding: 12,
              background: 'var(--amber-subtle)',
              borderRadius: 8,
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--amber-primary)', fontWeight: 600 }}>
              ⚠ Lola Crampin — Recovery 55/100
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
              Elevated soreness reported. Monitor during warm-up, consider reduced piece count.
            </div>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 12 }}>
            Recovery data aggregated from Whoop + Oura + manual wellness check-ins.
          </p>
        </Card>

        {/* Card 3: Suggested 1V 8+ */}
        <Card title="Suggested 1V 8+">
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
            Based on current form × recovery × pair history
          </p>
          {SUGGESTED_1V.map((s) => (
            <div
              key={s.seat}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 8px',
                borderRadius: 6,
                background: s.seat === 'Cox' ? 'var(--green-subtle)' : 'transparent',
                marginBottom: 2,
              }}
            >
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: THEME.fontMono, minWidth: 60 }}>
                {s.seat}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: s.warn ? 'var(--amber-primary)' : 'var(--text-primary)',
                  fontWeight: s.warn ? 600 : 400,
                }}
              >
                {s.name} {s.warn ? '⚠' : ''}
              </span>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              onApplySuggested()
              toast('Suggested lineup applied in Builder', 'success')
            }}
            style={{
              width: '100%',
              marginTop: 14,
              padding: '10px 16px',
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
            Apply This Lineup →
          </button>
        </Card>

        {/* Card 4: Best Lineups This Season */}
        <Card title="Best Lineups This Season">
          {BEST_LINEUPS.map((e, i) => (
            <div
              key={e.event}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: i < BEST_LINEUPS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{e.event}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{e.date}</div>
              </div>
              <div
                style={{
                  fontFamily: THEME.fontMono,
                  fontSize: 18,
                  color: 'var(--green-primary)',
                  fontWeight: 700,
                }}
              >
                {e.time}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onGoHistory()}
            style={{
              marginTop: 14,
              padding: '8px 14px',
              borderRadius: 8,
              background: 'transparent',
              border: '1px solid var(--border-default)',
              color: 'var(--green-primary)',
              fontSize: 12,
              fontFamily: THEME.fontMono,
              cursor: 'pointer',
            }}
          >
            View in History →
          </button>
          <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-surface-raised)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, fontFamily: THEME.fontMono, color: 'var(--text-tertiary)', marginBottom: 6 }}>
              SEASON TREND
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 40 }}>
              {[5.49, 5.48, 5.47, 5.47, 5.46, 5.45, 5.44].map((t, i) => {
                const min = 5.43
                const max = 5.50
                const pct = ((max - t) / (max - min)) * 100
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${Math.max(pct, 10)}%`,
                      borderRadius: '3px 3px 0 0',
                      background: i === 6 ? 'var(--green-primary)' : 'var(--border-default)',
                    }}
                  />
                )
              })}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>
              Last 7 outings — trending faster ↑
            </div>
          </div>
        </Card>

        {/* Card 5: Erg Rankings */}
        <Card title="Erg Rankings · Top 9">
          {[
            { rank: 1, name: 'Ella Wheeler',         time: '6:35.6', delta: '—' },
            { rank: 2, name: 'Julia Irmler',          time: '6:38.6', delta: '+3.0s' },
            { rank: 3, name: 'Lily Abbott',           time: '6:41.7', delta: '+6.1s' },
            { rank: 4, name: 'Lotta Van Westreenen',  time: '6:45.6', delta: '+10.0s' },
            { rank: 5, name: 'Star Miller',           time: '6:44.9', delta: '+9.3s' },
            { rank: 6, name: 'Olivia Roth',           time: '6:48.1', delta: '+12.5s' },
            { rank: 7, name: 'Madeline Cox',          time: '6:48.9', delta: '+13.3s' },
            { rank: 8, name: 'Minou Bouman',          time: '6:50.0', delta: '+14.4s' },
            { rank: 9, name: 'Lola Crampin',          time: '6:55.8', delta: '+20.2s' },
          ].map((r) => (
            <div
              key={r.rank}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 0',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontFamily: THEME.fontMono,
                  color: r.rank <= 3 ? 'var(--green-primary)' : 'var(--text-tertiary)',
                  fontWeight: r.rank <= 3 ? 700 : 400,
                  minWidth: 16,
                }}
              >
                {r.rank}
              </span>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{r.name}</span>
              <span style={{ fontFamily: THEME.fontMono, fontSize: 13, color: 'var(--green-primary)', fontWeight: 600 }}>
                {r.time}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: THEME.fontMono, minWidth: 48, textAlign: 'right' }}>
                {r.delta}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
