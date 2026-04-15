import { THEME } from '../lib/theme'
import { COACH_TOOL_IMAGES, coachToolSrc } from '../slides/coachToolImages'

const TOOL_WORD = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'] as const

function toolHeading(index: number) {
  const w = TOOL_WORD[index]
  return w != null ? `Tool ${w}` : `Tool ${index + 1}`
}

function DownArrow({ color = THEME.textMuted }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 4v12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M7 13l5 5 5-5" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Image in the white card; tool name + description sit below the card. */
function ToolCarouselItem({ file, alt, heading }: { file: string; alt: string; heading: string }) {
  return (
    <div
      className="flex shrink-0 flex-col items-center px-[clamp(8px,1.1vw,14px)]"
      style={{ width: 'clamp(200px, 24vw, 300px)' }}
    >
      <div
        className="w-full rounded-xl border bg-white p-3 shadow-[0_10px_32px_rgba(0,0,0,0.08)]"
        style={{ borderColor: THEME.border }}
      >
        <div className="flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-50">
          <img src={coachToolSrc(file)} alt={alt} className="h-full w-full object-contain object-center" loading="lazy" />
        </div>
      </div>

      <div className="mt-2 flex justify-center" aria-hidden>
        <DownArrow />
      </div>

      <p
        className="mt-1 w-full text-center text-[clamp(13px,1.85vw,18px)] font-semibold leading-snug"
        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
      >
        {heading}
      </p>
      <p
        className="mt-1 w-full px-0.5 text-center text-[clamp(11px,1.35vw,14px)] font-medium leading-snug"
        style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary }}
      >
        {alt}
      </p>
    </div>
  )
}

/** Duplicated horizontal strip; CSS animates -50% for a seamless loop. */
export function ProblemInfiniteToolMarquee() {
  const items = COACH_TOOL_IMAGES.map((img, i) => ({
    ...img,
    heading: toolHeading(i),
  }))

  return (
    <div className="relative w-full">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[clamp(2rem,5vw,3.5rem)]"
        style={{
          background: `linear-gradient(90deg, ${THEME.light} 0%, transparent 100%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[clamp(2rem,5vw,3.5rem)]"
        style={{
          background: `linear-gradient(270deg, ${THEME.light} 0%, transparent 100%)`,
        }}
      />
      <div className="flex w-full items-start overflow-hidden py-1">
        <div className="problem-marquee-track flex w-max items-start">
          {items.map((item) => (
            <ToolCarouselItem key={`a-${item.file}`} file={item.file} alt={item.alt} heading={item.heading} />
          ))}
          {items.map((item) => (
            <ToolCarouselItem key={`b-${item.file}`} file={item.file} alt={item.alt} heading={item.heading} />
          ))}
        </div>
      </div>
    </div>
  )
}
