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

console.log('[icons] done.')
