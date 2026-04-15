import { THEME } from '../lib/theme'

const SHELLS = [
  { id: 1, label: 'Shell 1', mode: '8+', seats: ['M', 'L', 'S', '—', '—', '—', '—', 'S'] },
  { id: 2, label: 'Shell 2', mode: '4+', seats: ['—', 'T', '—', '—'] },
  { id: 3, label: 'Shell 3', mode: '2x', seats: ['—', '—'] },
] as const

/** Generated lineup UI (ROW IQ–inspired, no screenshot). */
export function LineupBoardMockup() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-auto p-2.5">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b pb-2" style={{ borderColor: THEME.border }}>
        <div className="flex gap-1">
          {(['1x', '2x', '4+', '8+'] as const).map((m) => (
            <span
              key={m}
              className="rounded-md border px-2 py-0.5 text-[8px] font-semibold"
              style={{
                fontFamily: THEME.fontMono,
                borderColor: m === '8+' ? THEME.primary : THEME.border,
                background: m === '8+' ? `${THEME.primary}14` : '#fff',
                color: m === '8+' ? THEME.primaryDark : THEME.textMuted,
              }}
            >
              {m}
            </span>
          ))}
        </div>
        <span className="text-[8px] font-semibold text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
          BOATS · Cal Men&apos;s 1V
        </span>
      </div>

      <p className="mt-2 text-[8px] text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
        Drag to assign — same athlete IDs as Team Overview. Not assigned slots stay open.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {SHELLS.map((shell) => (
          <div
            key={shell.id}
            className="rounded-xl border bg-gradient-to-b from-white to-zinc-50 p-2 shadow-sm"
            style={{ borderColor: THEME.border }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold" style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}>
                {shell.label}
              </span>
              <span className="text-[7px] font-semibold text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
                {shell.mode}
              </span>
            </div>
            <div className="mt-1 flex justify-between text-[6px] font-bold uppercase tracking-wider">
              <span style={{ color: '#dc2626' }}>Port</span>
              <span style={{ color: THEME.primary }}>Stbd</span>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {shell.seats.map((s, i) => (
                <div
                  key={`${shell.id}-${i}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full border text-[8px] font-bold"
                  style={{
                    fontFamily: THEME.fontMono,
                    borderColor: s === '—' ? THEME.border : THEME.primary,
                    background: s === '—' ? '#fafafa' : `${THEME.primary}12`,
                    color: s === '—' ? THEME.textMuted : THEME.textPrimary,
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
            <div className="mt-2 text-center text-[7px] text-zinc-400" style={{ fontFamily: THEME.fontSans }}>
              {shell.id === 1 ? 'Not assigned · tap seat' : 'Draft'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
