#!/usr/bin/env node
/**
 * One-off generator for the link-preview card (og:image, twitter:image).
 *
 *   1200 × 630 — Facebook / Twitter / iMessage / Slack standard.
 *
 * Composition:
 *   - background: public/hero-landscape.png cropped to fill, with a
 *     bottom-weighted dark gradient overlay so the headline reads
 *   - top-left: small green pulse dot + "SYNTH" wordmark in mono
 *   - bottom-left: serif "Unlock every signal. / Push past every limit."
 *     plus a hairline mono "// the data layer for sports" caption
 *   - bottom-right: synthsports.co
 *
 * This file is NOT part of the prebuild — it bakes a static asset at
 * public/logos/og-card.png that we commit. Rerun manually:
 *
 *   node scripts/generate-og-card.mjs
 */
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const heroPath = resolve(root, 'public/hero-landscape.png')
const outPath = resolve(root, 'public/logos/og-card.png')

const W = 1200
const H = 630

// 1. Resize/crop hero photo to fill the OG aspect.
const heroBuf = await sharp(heroPath)
  .resize(W, H, { fit: 'cover', position: 'attention' })
  .toBuffer()

// 2. Build SVG overlay: dark gradient wash + brand typography.
//    Generic font families (`serif`, monospace) so the script renders on
//    any host. Locally that's Times / Menlo on macOS; on Linux it falls
//    back to DejaVu Serif / DejaVu Sans Mono — both readable.
const overlaySvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#000" stop-opacity="0.20"/>
      <stop offset="45%"  stop-color="#000" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.88"/>
    </linearGradient>
    <linearGradient id="sideFade" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%"   stop-color="#000" stop-opacity="0"/>
      <stop offset="55%"  stop-color="#000" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.55"/>
    </linearGradient>
  </defs>

  <!-- Bottom-weighted darken so headline reads -->
  <rect width="${W}" height="${H}" fill="url(#wash)"/>
  <!-- Slight left-side darken so the text block has its own area -->
  <rect width="${W}" height="${H}" fill="url(#sideFade)"/>

  <!-- Top-left mark: green pulse dot + "SYNTH" mono wordmark -->
  <g transform="translate(64, 70)">
    <circle cx="14" cy="14" r="14" fill="#10B981"/>
    <text x="42" y="22"
          font-family="ui-monospace, 'JetBrains Mono', monospace"
          font-size="22" font-weight="600" letter-spacing="3"
          fill="#fafafa">SYNTH</text>
  </g>

  <!-- Emerald rule above the headline for a touch of architecture -->
  <rect x="64" y="${H - 280}" width="56" height="2" fill="#10B981"/>

  <!-- Eyebrow: mono caption -->
  <text x="64" y="${H - 244}"
        font-family="ui-monospace, 'JetBrains Mono', monospace"
        font-size="18" font-weight="500" letter-spacing="5"
        fill="#10B981">// THE DATA LAYER FOR SPORTS</text>

  <!-- Serif headline, two lines -->
  <text x="64" y="${H - 158}"
        font-family="Fraunces, Georgia, 'Iowan Old Style', 'DejaVu Serif', serif"
        font-size="78" font-weight="500" letter-spacing="-2"
        fill="#fafafa">Unlock every signal.</text>

  <text x="64" y="${H - 74}"
        font-family="Fraunces, Georgia, 'Iowan Old Style', 'DejaVu Serif', serif"
        font-size="78" font-weight="500" letter-spacing="-2"
        fill="#a1a1aa">Push past every limit.</text>

  <!-- Bottom-right URL -->
  <text x="${W - 64}" y="${H - 36}"
        text-anchor="end"
        font-family="ui-monospace, 'JetBrains Mono', monospace"
        font-size="16" font-weight="500" letter-spacing="3"
        fill="#fafafa">synthsports.co</text>
</svg>
`)

const og = await sharp(heroBuf)
  .composite([{ input: overlaySvg }])
  .png({ compressionLevel: 9 })
  .toBuffer()

writeFileSync(outPath, og)
console.log(`[og] wrote ${outPath} (${W}×${H}, ${og.length} bytes)`)
