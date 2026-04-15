import { THEME } from '../lib/theme'
import { DECK_SLIDE_TOTAL } from '../lib/deckTotal'
import { TopNav } from '../components/TopNav'

/** Bridge after problem: centered headline, brand mark, tagline — then product walkthrough. */
export function OurSolutionCover() {
  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{ background: THEME.light, padding: 'clamp(24px, 3.5vw, 40px) clamp(20px, 3.5vw, 48px) clamp(20px, 3.5vw, 32px)' }}
    >
      <TopNav section="02 · SOLUTION" page={`3 / ${DECK_SLIDE_TOTAL}`} tone="light" />
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
        <h1
          className="text-[clamp(2rem,5.5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.04em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
        >
          Our Solution
        </h1>

        <div className="mt-10 shrink-0 rounded-3xl bg-white p-7 shadow-[0_24px_60px_rgba(0,0,0,0.12)] sm:p-9">
          <img
            src="/logos/synth-icon-green.svg"
            alt="synth."
            className="h-20 w-20 sm:h-28 sm:w-28"
            width={112}
            height={112}
          />
        </div>

        <p
          className="mt-10 max-w-md text-[clamp(14px,2.2vw,18px)] leading-relaxed text-zinc-600"
          style={{ fontFamily: THEME.fontSans }}
        >
          {THEME.tagline}
        </p>
      </div>
    </div>
  )
}
