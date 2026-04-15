import { ProblemInfiniteToolMarquee } from '../components/ProblemToolMarquee'
import { TopNav } from '../components/TopNav'
import { THEME } from '../lib/theme'

/** Problem slide: headline + carousel centered as a block below the nav. */
export function S02_Problem() {
  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{
        background: THEME.light,
        padding: 'clamp(28px, 4vw, 48px) clamp(24px, 4vw, 56px) clamp(24px, 4vw, 40px)',
      }}
    >
      <TopNav section="01 · PROBLEM" page="2 / 17" tone="light" />

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
        <h1
          className="max-w-[min(40ch,92vw)] shrink-0 text-center text-[clamp(24px,3.8vw,38px)] font-bold leading-[1.08] tracking-[-0.04em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
        >
          Coaches are drowning in dispersed data.
        </h1>

        <div className="relative w-full min-w-0 shrink-0 self-stretch">
          <ProblemInfiniteToolMarquee />
        </div>
      </div>
    </div>
  )
}
