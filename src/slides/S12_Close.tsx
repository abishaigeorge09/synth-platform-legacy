import { TopNav } from '../components/TopNav'
import { THEME } from '../lib/theme'

const ROWS: {
  num: string
  ask: string
  accent: string
  summary: string
  funds?: string[]
}[] = [
  {
    num: '01',
    ask: 'Partners & pilots',
    accent: THEME.primary,
    summary:
      'Coaches and programs still split across disconnected tools, help us shape the base app for your sport.',
  },
  {
    num: '02',
    ask: '$100k seed',
    accent: THEME.cyan,
    summary: 'Raising $100k to turn live traction into repeatable growth, clear use of funds, no mystery.',
    funds: ['Brand & marketing', 'AI & compute credits', 'Ops & infrastructure'],
  },
  {
    num: '03',
    ask: 'GTM / sales',
    accent: THEME.amber,
    summary:
      'A network into collegiate athletics, AD offices, coaching trees, conferences, to open doors while we ship.',
  },
]

export function S12_Close() {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ padding: '44px 40px 32px', color: THEME.textPrimary, background: THEME.light }}>
      <TopNav section="CLOSE" page="16 / 17" tone="light" />

      <div className="flex-1 min-h-0 flex flex-col justify-center w-full max-w-[1040px] mx-auto">
        {/* Title + subtitle sit directly on top of the table (one block, no vertical gap from justify-between) */}
        <div className="w-full min-h-0 flex flex-col">
          <h2
            className="text-[24px] font-bold tracking-[-0.04em] text-center"
            style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
          >
            Our ask
          </h2>
          <p className="mt-1 text-center text-[11px] uppercase tracking-[0.14em] font-semibold" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Three ways to plug in
          </p>

          <div className="mt-3 rounded-xl overflow-hidden w-full" style={{ border: `1px solid ${THEME.border}`, boxShadow: '0 4px 24px rgba(24,24,27,0.06)' }}>
            <table className="w-full border-collapse text-left" style={{ fontFamily: THEME.fontSans }}>
              <thead>
                <tr style={{ background: `${THEME.primary}10` }}>
                  <th
                    scope="col"
                    className="py-2.5 px-3 w-[52px] text-[10px] tracking-[0.12em] uppercase font-bold border-b"
                    style={{ fontFamily: THEME.fontMono, color: THEME.primaryDarker, borderColor: THEME.border }}
                  >
                    #
                  </th>
                  <th
                    scope="col"
                    className="py-2.5 px-3 w-[min(28%,200px)] text-[10px] tracking-[0.12em] uppercase font-bold border-b"
                    style={{ fontFamily: THEME.fontMono, color: THEME.primaryDarker, borderColor: THEME.border }}
                  >
                    Ask
                  </th>
                  <th
                    scope="col"
                    className="py-2.5 px-4 text-[10px] tracking-[0.12em] uppercase font-bold border-b"
                    style={{ fontFamily: THEME.fontMono, color: THEME.primaryDarker, borderColor: THEME.border }}
                  >
                    What we&apos;re looking for
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.num} style={{ background: THEME.white }}>
                    <td
                      className="align-top py-4 px-3 border-b font-bold text-[12px]"
                      style={{
                        fontFamily: THEME.fontMono,
                        color: row.accent,
                        borderColor: THEME.border,
                        borderLeft: `4px solid ${row.accent}`,
                      }}
                    >
                      {row.num}
                    </td>
                    <td
                      className="align-top py-4 px-3 border-b text-[14px] font-semibold leading-snug"
                      style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary, borderColor: THEME.border }}
                    >
                      {row.ask}
                    </td>
                    <td className="align-top py-4 px-4 border-b" style={{ borderColor: THEME.border }}>
                      <p className="text-[12px] leading-[1.55]" style={{ color: THEME.textSecondary }}>
                        {row.summary}
                      </p>
                      {row.funds ? (
                        <div className="mt-3 pt-3" style={{ borderTop: `1px dashed ${THEME.border}` }}>
                          <div className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1.5" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                            Use of funds
                          </div>
                          <ul className="space-y-1 text-[11px] leading-[1.4]" style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}>
                            {row.funds.map((f) => (
                              <li key={f} className="flex gap-2">
                                <span style={{ color: row.accent }}>·</span>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center text-center shrink-0">
          <p className="text-[12px] italic" style={{ fontFamily: THEME.fontSerif, color: THEME.textMuted }}>
            Built for rowing. Built to synthesize everything.
          </p>
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] tracking-[0.14em] uppercase" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            <span>synthsports.com</span>
            <span style={{ color: THEME.border }} aria-hidden>
              ·
            </span>
            <span>supportsynth@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  )
}
