import { DashedRule } from '../components/DashedRule'
import { PaperTexture } from '../components/PaperTexture'
import { SectionLabel } from '../components/SectionLabel'
import { TierCard } from '../components/TierCard'
import { TopNav } from '../components/TopNav'
import { THEME } from '../lib/theme'

/** Steady-state ARR mix (illustrative) · must sum to 100. */
const ARR_MIX = [
  { tier: 'Starter', pct: 12, color: THEME.primary },
  { tier: 'Pro', pct: 28, color: THEME.cyan },
  { tier: 'Elite', pct: 38, color: THEME.purple },
  { tier: 'Enterprise', pct: 22, color: THEME.amber },
] as const

function ArrMixDonut() {
  const gradientStops = ARR_MIX.reduce(
    (state, s) => {
      const start = state.cum
      const end = state.cum + s.pct
      return {
        cum: end,
        parts: [...state.parts, `${s.color} ${start}% ${end}%`],
      }
    },
    { cum: 0, parts: [] as string[] },
  ).parts.join(', ')

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="text-[10px] tracking-[0.16em] uppercase text-center font-bold"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        Steady-state ARR mix
      </div>
      <div className="relative h-[140px] w-[140px] shrink-0">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from -90deg, ${gradientStops})`,
          }}
        />
        <div
          className="absolute rounded-full bg-white"
          style={{
            inset: '28%',
            boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.06)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[11px] font-bold text-center leading-tight px-2" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            by tier
          </span>
        </div>
      </div>
      <ul className="w-full space-y-1.5">
        {ARR_MIX.map((s) => (
          <li key={s.tier} className="flex items-center justify-between gap-2 text-[11px]">
            <span className="flex items-center gap-2 min-w-0">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
              <span className="truncate" style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary }}>
                {s.tier}
              </span>
            </span>
            <span className="tabular-nums font-semibold shrink-0" style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}>
              {s.pct}%
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[10px] leading-snug text-center max-w-[200px]" style={{ fontFamily: THEME.fontSans, color: THEME.textMuted }}>
        Illustrative mix once programs mature, Elite and Pro carry most recurring volume; Starter seeds the wedge.
      </p>
    </div>
  )
}

export function S08_BusinessModel() {
  const upsellSteps = [
    { tier: 'Starter', desc: 'Daily use → proof the surface saves time', color: THEME.primary },
    { tier: 'Pro', desc: 'More connectors + synthesis → fewer tabs', color: THEME.cyan },
    { tier: 'Elite', desc: 'Automation + real-time → staff stops babysitting exports', color: THEME.purple },
    { tier: 'Enterprise', desc: 'Athletics deploys one stack across sports', color: THEME.amber },
  ] as const

  return (
    <div className="absolute inset-0 flex flex-col" style={{ padding: '48px 44px 32px', color: THEME.textPrimary }}>
      <TopNav section="07 · BUSINESS MODEL" page="12 / 17" tone="light" />
      <PaperTexture strength={0.75} tint="rgba(244, 243, 236, 0.95)" />

      <SectionLabel text="07 · BUSINESS MODEL" />
      <div
        className="mt-2 text-[42px] leading-[1.05] font-bold max-w-[900px]"
        style={{ fontFamily: THEME.fontMono, letterSpacing: '-0.05em' }}
      >
        Flat tiers. Simple to buy. Natural to upgrade.
      </div>
      <div className="mt-3">
        <DashedRule />
      </div>

      {/* Tier cards · same baseline (no staircase) */}
      <div className="mt-4 grid grid-cols-4 gap-4 items-stretch">
        <TierCard
          name="Starter"
          price="$199/mo"
          accent={THEME.primary}
          offset={0}
          features={['Up to 40 athletes', 'Base app', '1 connector (Sheets)', 'Weekly sync']}
        />
        <TierCard
          name="Pro"
          price="$499/mo"
          accent={THEME.cyan}
          offset={0}
          features={['Up to 80 athletes', '3 connectors', 'Daily cloud scraping', 'AI dashboard']}
        />
        <TierCard
          name="Elite"
          price="$999/mo"
          accent={THEME.purple}
          offset={0}
          features={['Unlimited athletes', 'Unlimited connectors', 'Real-time sync', 'Chrome ext + layouts']}
        />
        <TierCard
          name="Enterprise"
          price="Custom"
          accent={THEME.amber}
          offset={0}
          features={['Multi-sport deploy', 'Dedicated connectors', 'White-label', 'Custom base apps']}
        />
      </div>

      <div className="mt-4 flex-1 min-h-0 grid grid-cols-12 gap-4" style={{ alignItems: 'stretch' }}>
        {/* Upsell · single vertical spine + connected nodes */}
        <div className="col-span-4 rounded-xl border p-5 flex flex-col min-h-0" style={{ borderColor: THEME.border, background: '#ffffff' }}>
          <div className="text-[11px] tracking-[0.16em] uppercase mb-1" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Why the upsell is natural
          </div>
          <p className="text-[11px] leading-snug mb-4" style={{ fontFamily: THEME.fontSans, color: THEME.textMuted }}>
            Each step unlocks the next job-to-be-done, same product, wider pipes, not a different SKU for its own sake.
          </p>
          <div className="relative flex-1 pl-1">
            <div
              className="absolute left-[15px] top-2 bottom-2 w-[2px] rounded-full"
              style={{ background: `linear-gradient(180deg, ${THEME.primary}55, ${THEME.amber}55)` }}
            />
            <ul className="space-y-0">
              {upsellSteps.map((step, i) => (
                <li key={step.tier} className="relative flex gap-3 pb-5 last:pb-0">
                  <div
                    className="relative z-10 mt-0.5 h-8 w-8 shrink-0 rounded-full flex items-center justify-center border-2 bg-white"
                    style={{ borderColor: step.color, boxShadow: `0 0 0 3px ${step.color}22` }}
                  >
                    <span className="text-[11px] font-bold" style={{ fontFamily: THEME.fontMono, color: step.color }}>
                      {i + 1}
                    </span>
                  </div>
                  <div className="pt-0.5 min-w-0">
                    <div className="text-[13px] font-bold" style={{ fontFamily: THEME.fontMono, color: step.color }}>
                      {step.tier}
                    </div>
                    <div className="mt-0.5 text-[12px] leading-[1.45]" style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary }}>
                      {step.desc}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Revenue projections */}
        <div className="col-span-4 rounded-xl border p-5 flex flex-col min-h-0" style={{ borderColor: THEME.border, background: '#ffffff' }}>
          <div className="text-[11px] tracking-[0.16em] uppercase mb-3" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Revenue projections
          </div>
          <table className="w-full text-left border-collapse flex-1 text-[12px]">
            <thead>
              <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                <th className="pb-2 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                  Year
                </th>
                <th className="pb-2 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                  Programs
                </th>
                <th className="pb-2 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                  Mix
                </th>
                <th className="pb-2 text-[10px] uppercase tracking-[0.12em] text-right" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                  ARR
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { year: '1 (pilot)', programs: '5', mix: '3S + 2P', arr: '$19K', color: THEME.primary },
                { year: '2', programs: '20', mix: '8S+8P+4E', arr: '$115K', color: THEME.cyan },
                { year: '3', programs: '50', mix: '15S+20P+10E+5Ent', arr: '$400K+', color: THEME.purple },
                { year: '4', programs: '100+', mix: 'Multi-sport', arr: '$800K–1.2M', color: THEME.amber },
              ].map((row) => (
                <tr key={row.year} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                  <td className="py-2.5" style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary }}>
                    {row.year}
                  </td>
                  <td className="py-2.5 font-semibold" style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}>
                    {row.programs}
                  </td>
                  <td className="py-2.5 text-[10px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                    {row.mix}
                  </td>
                  <td className="py-2.5 text-right font-bold" style={{ fontFamily: THEME.fontMono, color: row.color }}>
                    {row.arr}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ARR mix donut */}
        <div className="col-span-4 flex flex-col min-h-0">
          <div
            className="rounded-xl border p-5 flex-1 flex flex-col items-center justify-center min-h-[280px]"
            style={{ borderColor: THEME.border, background: '#ffffff' }}
          >
            <ArrMixDonut />
          </div>
        </div>
      </div>

      <div className="mt-3 text-[12px] italic" style={{ fontFamily: THEME.fontSerif, color: THEME.textMuted }}>
        Less than a set of oars to start. Scales to a university-wide deployment.
      </div>
    </div>
  )
}
