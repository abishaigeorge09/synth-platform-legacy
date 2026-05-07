#!/usr/bin/env node
/**
 * Rasterize the synth. SVG mark into every PNG size the PWA manifest and
 * iOS home-screen install need. Runs as the `prebuild` step so manifest
 * icons always exist before Vite picks them up.
 *
 * Output (under public/logos/):
 *   icon-180.png         — iOS apple-touch-icon (iPhone)
 *   icon-152.png         — iPad apple-touch-icon
 *   icon-192.png         — Android launcher / manifest
 *   icon-512.png         — Android splash / manifest
 *   icon-maskable-512.png — Android adaptive icon with emerald padding
 *   og-card.png          — 1200×630 link-preview card (Open Graph /
 *                          Twitter / iMessage). Cobalt canvas with the
 *                          synth icon centered + small. Replaces the
 *                          full-bleed solid-emerald look that messaging
 *                          apps rendered when og:image was just the
 *                          512×512 PWA icon.
 */
import sharp from 'sharp'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const srcSvg = resolve(root, 'public/logos/synth-icon-green.svg')
const outDir = resolve(root, 'public/logos')

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
if (!existsSync(srcSvg)) {
  console.error(`[icons] source not found: ${srcSvg}`)
  process.exit(1)
}

const svgBuffer = readFileSync(srcSvg)

const sizes = [
  { name: 'icon-152.png', size: 152 },
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
]

for (const { name, size } of sizes) {
  const out = resolve(outDir, name)
  const buf = await sharp(svgBuffer, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 5, g: 150, b: 105, alpha: 1 } })
    .png()
    .toBuffer()
  writeFileSync(out, buf)
  console.log(`[icons] wrote ${name} (${size}×${size}, ${buf.length} bytes)`)
}

// Android maskable — the safe area is the inner ~80%, so we scale the mark
// down and pad with emerald so the adaptive mask never clips the logo.
{
  const size = 512
  const inner = Math.round(size * 0.64)
  const innerPng = await sharp(svgBuffer, { density: 512 })
    .resize(inner, inner, { fit: 'contain', background: { r: 5, g: 150, b: 105, alpha: 1 } })
    .png()
    .toBuffer()

  const maskable = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 5, g: 150, b: 105, alpha: 1 },
    },
  })
    .composite([{ input: innerPng, gravity: 'center' }])
    .png()
    .toBuffer()

  const out = resolve(outDir, 'icon-maskable-512.png')
  writeFileSync(out, maskable)
  console.log(`[icons] wrote icon-maskable-512.png (${size}×${size} maskable, ${maskable.length} bytes)`)
}

// Open Graph link-preview card. 1200×630 is the Facebook / Twitter /
// iMessage standard aspect. Cobalt brand canvas with the synth icon
// centered at ~250 px so the preview reads as "small subtle logo on a
// product surface" rather than the full-bleed PWA app-icon Vercel was
// previously serving as og:image.
{
  const ogWidth = 1200
  const ogHeight = 630
  const iconSize = 240
  const iconPng = await sharp(svgBuffer, { density: 512 })
    .resize(iconSize, iconSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer()

  const og = await sharp({
    create: {
      width: ogWidth,
      height: ogHeight,
      channels: 3,
      // Brand canvas — matches THEME.canvas / cobalt gradient bottom
      // (#1F26C9). Solid not gradient because radial gradients in
      // sharp's create-buffer aren't directly supported and the solid
      // tone reads cleaner at this size than a faux gradient.
      background: { r: 31, g: 38, b: 201 },
    },
  })
    .composite([{ input: iconPng, gravity: 'center' }])
    .png()
    .toBuffer()

  const out = resolve(outDir, 'og-card.png')
  writeFileSync(out, og)
  console.log(`[icons] wrote og-card.png (${ogWidth}×${ogHeight}, ${og.length} bytes)`)
}

console.log('[icons] done.')
