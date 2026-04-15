import { SimpleSlide } from '../components/SimpleSlide'
import { IllustConnectorHub } from '../components/simpleIllustrations'
import { THEME } from '../lib/theme'

export function S04_Connectors() {
  return (
    <SimpleSlide
      section="03 · CONNECTORS"
      page="8 / 17"
      tone="light"
      illustration={<IllustConnectorHub />}
      primary={
        <h1
          className="text-[clamp(26px,4.2vw,40px)] font-bold leading-[1.08] tracking-[-0.04em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
        >
          Connect once. It updates forever.
        </h1>
      }
      secondary={
        <p className="text-[clamp(14px,2vw,17px)] leading-[1.55]" style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary }}>
          OAuth or extension — then scheduled pulls from Sheets, Bridge, TeamWorks, Whoop, and the tools you already pay for.
        </p>
      }
    />
  )
}
