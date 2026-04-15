import { SimpleSlide } from '../components/SimpleSlide'
import { IllustMarketRings } from '../components/simpleIllustrations'
import { THEME } from '../lib/theme'

export function S07_Market() {
  return (
    <SimpleSlide
      section="06 · MARKET"
      page="11 / 17"
      tone="dark"
      illustration={<IllustMarketRings />}
      primary={
        <h1
          className="text-[clamp(26px,4.2vw,40px)] font-bold leading-[1.08] tracking-[-0.04em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.white }}
        >
          Start with rowing. Scale to every sport.
        </h1>
      }
      secondary={
        <div
          className="space-y-4 text-[clamp(14px,2vw,17px)] leading-[1.55]"
          style={{ fontFamily: THEME.fontSans, color: 'rgba(255,255,255,0.72)' }}
        >
          <p>
            One synthesis engine. Each sport gets a thin base app; we widen the wedge before we blanket collegiate and pro.
          </p>
          <div className="space-y-2.5 text-left text-[clamp(13px,1.85vw,16px)]">
            <p>
              <span className="font-semibold text-white/90" style={{ fontFamily: THEME.fontMono }}>
                TAM · $4.2B+
              </span>{' '}
              — Global programs juggling fragmented performance stacks.
            </p>
            <p>
              <span className="font-semibold text-white/90" style={{ fontFamily: THEME.fontMono }}>
                SAM · $890M
              </span>{' '}
              — US collegiate: 12K+ programs, 3+ tools each.
            </p>
            <p>
              <span className="font-semibold" style={{ fontFamily: THEME.fontMono, color: THEME.primaryLight }}>
                SOM · $24M
              </span>{' '}
              — US collegiate rowing: high pain, no direct competitor.
            </p>
          </div>
        </div>
      }
    />
  )
}
