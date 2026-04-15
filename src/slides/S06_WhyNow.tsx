import { SimpleSlide } from '../components/SimpleSlide'
import { IllustTrendUp } from '../components/simpleIllustrations'
import { THEME } from '../lib/theme'

export function S06_WhyNow() {
  return (
    <SimpleSlide
      section="05 · WHY NOW"
      page="10 / 17"
      tone="light"
      illustration={<IllustTrendUp />}
      primary={
        <h1
          className="text-[clamp(26px,4.2vw,40px)] font-bold leading-[1.08] tracking-[-0.04em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
        >
          Why now?
        </h1>
      }
      secondary={
        <div
          className="space-y-3 text-[clamp(14px,2vw,17px)] leading-[1.55]"
          style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary }}
        >
          <p>
            We&apos;re athletes who understand how athletes and coaches struggle together — the same fragmented workflows, every season, every program.
          </p>
          <p>
            The data is already there, spread across tools and tabs. What changed is <strong style={{ color: THEME.textPrimary }}>AI</strong>: finally something
            that can connect it and make it usable.
          </p>
          <p className="pt-1 font-semibold italic text-zinc-800" style={{ fontFamily: THEME.fontSerif }}>
            We&apos;re athletes. We want to win.
          </p>
        </div>
      }
    />
  )
}
