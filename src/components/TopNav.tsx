import { THEME } from '../lib/theme'

export function TopNav({
  brand = THEME.name,
  deckName = THEME.deckName,
  year = THEME.year,
  section,
  page,
  tone = 'dark',
  omitBrand = false,
}: {
  brand?: string
  deckName?: string
  year?: string
  section: string
  page: string
  tone?: 'dark' | 'light'
  /** When true, the left brand column is hidden (e.g. title slide shows an animated logo in the corner). */
  omitBrand?: boolean
}) {
  const textClass = tone === 'light' ? 'text-zinc-600/90' : 'text-white/70'
  const shadow = tone === 'dark' ? '0 1px 14px rgba(0,0,0,0.35)' : 'none'
  return (
    <div
      className="absolute left-0 top-0 z-40 w-full max-w-full pointer-events-none px-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] sm:px-10 sm:pt-7"
      style={{ fontFamily: THEME.fontMono }}
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 text-[9px] tracking-[0.12em] sm:gap-x-3 sm:text-[11px] sm:tracking-[0.16em] uppercase ${textClass}`}
        style={{ textShadow: shadow }}
      >
        {omitBrand ? null : (
          <div
            className={`font-semibold tracking-[0.18em] ${tone === 'light' ? 'text-zinc-900/95' : 'text-white/95'}`}
            style={{ textShadow: shadow }}
          >
            {brand}
          </div>
        )}
        <div>{deckName}</div>
        <div className="opacity-85">{year}</div>
        <div>{section}</div>
        <div className="tabular-nums">{page}</div>
      </div>
    </div>
  )
}

