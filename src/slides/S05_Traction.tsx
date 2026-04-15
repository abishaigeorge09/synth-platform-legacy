import { SimpleSlide } from '../components/SimpleSlide'
import { THEME } from '../lib/theme'

const CAL_LOGO = '/logos/cal-golden-bears.svg'

export function S05_Traction() {
  return (
    <SimpleSlide
      section="04 · TRACTION"
      page="9 / 17"
      tone="light"
      illustration={
        <div className="flex flex-col items-center gap-4 py-2">
          <img src={CAL_LOGO} alt="California Golden Bears" className="h-[7.5rem] w-auto sm:h-32" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
            Pilot partner
          </span>
        </div>
      }
      primary={
        <h1
          className="text-[clamp(26px,4.2vw,40px)] font-bold leading-[1.08] tracking-[-0.04em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
        >
          Validating at the highest level.
        </h1>
      }
      secondary={
        <p className="text-[clamp(14px,2vw,17px)] leading-[1.55]" style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary }}>
          Cal Men&apos;s &amp; Women&apos;s Rowing — pilot program, real rosters, real feedback on fatigue and lineups.
        </p>
      }
    />
  )
}
