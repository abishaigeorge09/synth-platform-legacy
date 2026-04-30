import type { ReactNode } from 'react'
import { THEME } from '../../lib/theme'

const MOCK = [
  { id: '1', who: 'coach' as const, name: 'Coach', text: 'V8 lineup for Pacific Invite is published. Check your Lineups page.' },
  { id: '2', who: 'athlete' as const, name: 'Athlete', text: 'Thanks coach!' },
  { id: '3', who: 'coach' as const, name: 'Coach', text: 'Practice moved to 7 AM tomorrow for exam week.' },
]

export function MockTeamChat({
  surface = 'coach',
  footer,
}: {
  surface?: 'coach' | 'athlete'
  footer?: ReactNode
}) {
  const isCoach = surface === 'coach'
  return (
    <div
      className="flex h-full min-h-[420px] flex-col rounded-2xl border"
      style={
        isCoach
          ? { borderColor: THEME.border, background: THEME.white }
          : { borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }
      }
    >
      <div
        className="border-b px-4 py-3"
        style={
          isCoach
            ? { borderColor: THEME.border, background: THEME.light }
            : { borderColor: 'var(--border-default)', background: 'var(--bg-primary)' }
        }
      >
        <div
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: THEME.fontMono, color: isCoach ? THEME.primary : 'var(--green-primary)' }}
        >
          Team channel (demo)
        </div>
        <div className="text-[13px] font-semibold" style={{ color: isCoach ? THEME.textPrimary : 'var(--text-primary)' }}>
          Pacific Women&apos;s Rowing
        </div>
      </div>
      <div className="synth-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {MOCK.map((m) => (
          <div key={m.id} className={`flex ${m.who === 'coach' ? 'justify-start' : 'justify-end'}`}>
            <div
              className="max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed"
              style={
                m.who === 'coach'
                  ? {
                      background: isCoach ? THEME.light : 'var(--bg-surface-raised)',
                      border: `1px solid ${isCoach ? THEME.border : 'var(--border-subtle)'}`,
                      color: isCoach ? THEME.textPrimary : 'var(--text-primary)',
                    }
                  : {
                      background: isCoach ? THEME.primary : 'var(--green-primary)',
                      color: '#fff',
                    }
              }
            >
              <div
                className="mb-1 text-[9px] font-semibold uppercase tracking-wider opacity-80"
                style={{ fontFamily: THEME.fontMono }}
              >
                {m.name}
              </div>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      {footer ? <div className="border-t p-3">{footer}</div> : null}
    </div>
  )
}
