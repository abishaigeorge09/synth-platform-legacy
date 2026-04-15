import { PixelArt } from '../components/PixelArt'
import { TopNav } from '../components/TopNav'
import { THEME } from '../lib/theme'

function CompetitorRow({ name, desc, checks }: { name: string; desc: string; checks: Array<boolean | string> }) {
  return (
    <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <td className="px-4 py-3">
        <div className="text-[13px] text-white/90 font-semibold" style={{ fontFamily: THEME.fontSans }}>{name}</div>
        <div className="text-[10px] text-white/45 mt-0.5" style={{ fontFamily: THEME.fontSans }}>{desc}</div>
      </td>
      {checks.map((c, i) => (
        <td key={i} className="px-3 py-3 text-center text-[14px]" style={{ fontFamily: THEME.fontMono }}>
          {c === true ? (
            <span style={{ color: THEME.accent }}>✓</span>
          ) : c === false ? (
            <span className="text-white/25">✗</span>
          ) : (
            <span className="text-white/50 text-[11px]">{c}</span>
          )}
        </td>
      ))}
    </tr>
  )
}

export function S09_Competition() {
  return (
    <div className="absolute inset-0 flex flex-col text-white" style={{ padding: '52px 48px 36px' }}>
      <PixelArt pattern="scatter" seed={93} color="#000000" opacity={0.08} />
      <TopNav section="08 · COMPETITION" page="13 / 17" />

      <div className="text-[48px] leading-[1.02] font-bold" style={{ fontFamily: THEME.fontMono, letterSpacing: '-0.06em' }}>
        No one connects it all.
      </div>

      {/* Main content · flex-grows to fill */}
      <div className="mt-5 flex-1 min-h-0 flex gap-6">
        {/* Table */}
        <div
          className="flex-1 rounded-xl overflow-hidden border flex flex-col"
          style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)' }}
        >
          <table className="w-full border-collapse flex-1">
            <thead>
              <tr className="text-[10px] tracking-[0.16em] uppercase" style={{ fontFamily: THEME.fontMono }}>
                <th className="px-4 py-3 text-left text-white/45">Competitor</th>
                <th className="px-3 py-3 text-center text-white/45">Sport-specific</th>
                <th className="px-3 py-3 text-center text-white/45">Connects tools</th>
                <th className="px-3 py-3 text-center text-white/45">One view</th>
                <th className="px-3 py-3 text-center text-white/45">Auto-updates</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: `${THEME.accent}08` }}>
                <td className="px-4 py-3">
                  <div className="text-[14px] font-bold" style={{ fontFamily: THEME.fontMono, color: THEME.accent }}>synth.</div>
                  <div className="text-[10px] text-white/55 mt-0.5" style={{ fontFamily: THEME.fontSans }}>Purpose-built synthesis</div>
                </td>
                <td className="px-3 py-3 text-center text-[14px]" style={{ fontFamily: THEME.fontMono, color: THEME.accent }}>✓</td>
                <td className="px-3 py-3 text-center text-[14px]" style={{ fontFamily: THEME.fontMono, color: THEME.accent }}>✓</td>
                <td className="px-3 py-3 text-center text-[14px]" style={{ fontFamily: THEME.fontMono, color: THEME.accent }}>✓</td>
                <td className="px-3 py-3 text-center text-[14px]" style={{ fontFamily: THEME.fontMono, color: THEME.accent }}>✓</td>
              </tr>
              <CompetitorRow name="TeamWorks" desc="Team communication & scheduling" checks={[false, false, false, false]} />
              <CompetitorRow name="Hudl" desc="Video analysis (football, basketball)" checks={[false, false, 'Partial', false]} />
              <CompetitorRow name="Bridge Athletics" desc="Gym & strength tracking" checks={[false, false, false, false]} />
              <CompetitorRow name="TrainingPeaks" desc="Endurance training plans" checks={['Endurance', false, 'Partial', false]} />
              <CompetitorRow name="Catapult / STATSports" desc="GPS wearables for team sports" checks={[false, false, false, false]} />
              <CompetitorRow name="Sheets + GroupMe" desc="The actual incumbent" checks={[false, false, false, false]} />
            </tbody>
          </table>
        </div>

        {/* Key differentiators */}
        <div className="flex flex-col gap-4" style={{ width: 320 }}>
          {[
            { num: '01', title: 'Built for the sport', body: 'synth. is sport-specific. Everyone else is generic or built for football.', color: THEME.accent },
            { num: '02', title: 'Connects all tools', body: 'synth. reads data from ANY tool via connectors. Nobody else does this.', color: THEME.cyan },
            { num: '03', title: 'One athlete view', body: 'Gym + water + schedule + compliance in one profile. Elsewhere: 4 apps.', color: THEME.purple },
            { num: '04', title: 'Automated updates', body: 'Cloud scraping on schedule. Everything else requires manual entry.', color: THEME.amber },
          ].map(d => (
            <div key={d.num} className="flex-1 rounded-xl border px-5 py-4 flex flex-col justify-center" style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', borderLeft: `4px solid ${d.color}` }}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold" style={{ fontFamily: THEME.fontMono, color: d.color }}>{d.num}</span>
                <span className="text-[13px] font-semibold" style={{ fontFamily: THEME.fontSans }}>{d.title}</span>
              </div>
              <div className="mt-1.5 text-[12px] text-white/65 leading-[1.5]" style={{ fontFamily: THEME.fontSans }}>{d.body}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 text-white/60 italic text-[13px]" style={{ fontFamily: THEME.fontSerif }}>
        The switching cost is low because there is nothing to switch from.
      </div>
    </div>
  )
}
