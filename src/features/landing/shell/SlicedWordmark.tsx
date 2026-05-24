import { DRUK, FG, GREEN } from './tokens'

/**
 * Massive typographic statement piece for the footer — a giant brand
 * wordmark rendered at ~30vw and clipped so only the top fragments
 * (~30% of the glyph height) are visible. Inspired by xenkrypt.com's
 * footer wordmark slice.
 *
 * Implementation note: render the full text in a container with
 * `overflow: hidden` and a fixed height equal to roughly 30% of the
 * font's cap height. This crops cleanly across font weights without
 * needing a `clip-path` (which is finicky inside flex/grid layouts).
 *
 * Pure presentation. No animation by default — the size and crop are
 * the statement.
 */

export function SlicedWordmark({
  text = 'synth',
  dot = true,
  showFraction = 0.32,
}: {
  /** Wordmark text. Defaults to "synth". */
  text?: string
  /** Whether to add the green dot suffix (synth's logo signature). */
  dot?: boolean
  /** Fraction of the glyph height that should remain visible (0..1).
   *  0.32 = show top ~32% of the letterforms, hide the bottom 68%. */
  showFraction?: number
}) {
  return (
    <div
      aria-hidden
      className="relative w-full overflow-hidden"
      style={{
        // The container's height is a fraction of the font size so the
        // glyph appears cropped from the bottom.
        height: `calc(30vw * ${showFraction})`,
        // Clamp so it doesn't grow obscene on ultra-wide displays.
        maxHeight: `calc(420px * ${showFraction})`,
      }}
    >
      <span
        className="block w-full text-center tracking-[-0.04em]"
        style={{
          fontFamily: DRUK,
          fontWeight: 700,
          fontSize: 'clamp(160px, 30vw, 420px)',
          lineHeight: 1,
          color: FG,
          textTransform: 'lowercase',
          // Lift the text up so the bottom is cut off by the parent's
          // overflow hidden; the visible portion is the top sliver of
          // each glyph (the "leg fragments" effect).
          marginTop: 0,
          // Tiny stroke makes the visible fragments read clearly even
          // against the dark canvas; without it the tops of round
          // letters can disappear into the background.
          WebkitTextStroke: '0px transparent',
          userSelect: 'none',
        }}
      >
        {text}
        {dot && <span style={{ color: GREEN }}>.</span>}
      </span>
    </div>
  )
}
