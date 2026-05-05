/**
 * Phase 4 — file → ChatAttachment.
 *
 * Reads a picked file and returns the shape the AI chat expects:
 *
 *   - For supported images (JPEG/PNG/GIF/WebP) under MAX_IMAGE_BYTES:
 *     `{name, ext, mediaType, dataUrl}` — Anthropic content blocks
 *     can be built from this directly.
 *
 *   - For non-image files (PDF, txt, csv, ...) or unsupported image
 *     formats: `{name, ext}` only. The chip still renders, but the
 *     send path treats the message as text-only and skips vision.
 *
 *   - For oversized images: throws. Callers surface a user-facing
 *     toast/inline error.
 *
 * Anthropic's image limits (as of 2026-05): 5 MB per image after
 * base64 encoding, ~33% larger than the raw bytes. We gate on raw
 * size at 5 MB which is conservative — a 5 MB raw image becomes
 * ~6.7 MB base64. If we hit that ceiling in practice we'll lower to
 * 3.75 MB raw (= 5 MB base64).
 *
 * NOT implemented yet — image tagging / classification:
 *   AG asked for an auto-tag pass on upload (erg-screen vs.
 *   stroke-video-still vs. whiteboard, athlete linkage via OCR,
 *   stroke-phase classifier). Spec lives in docs/TODO.md section
 *   "4a. Chat → Image tagging + classification". Until that
 *   ships, the composer shows a "synth can't auto-tag images yet"
 *   hint and the system prompt instructs Claude to ask
 *   clarifying follow-up questions instead of guessing.
 */

import type { ChatAttachment } from '../primitives/AIChat'

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export class ImageAttachmentTooLargeError extends Error {
  readonly bytes: number
  constructor(bytes: number) {
    super(`Image too large (${(bytes / 1024 / 1024).toFixed(1)} MB, max 5 MB).`)
    this.name = 'ImageAttachmentTooLargeError'
    this.bytes = bytes
  }
}

const ANTHROPIC_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
])

function nameAndExt(file: File): { name: string; ext: string } {
  const dot = file.name.lastIndexOf('.')
  const ext = dot >= 0 ? file.name.slice(dot + 1).toUpperCase() : 'FILE'
  const raw = dot >= 0 ? file.name.slice(0, dot) : file.name
  const name = raw.length > 24 ? `${raw.slice(0, 24)}…` : raw
  return { name, ext }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const v = reader.result
      if (typeof v !== 'string') return reject(new Error('FileReader returned non-string'))
      resolve(v)
    }
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'))
    reader.readAsDataURL(file)
  })
}

export async function readChatAttachment(file: File): Promise<ChatAttachment> {
  const { name, ext } = nameAndExt(file)
  if (!ANTHROPIC_IMAGE_TYPES.has(file.type)) {
    // Non-image (or an image format Anthropic can't process — we'd
    // rather degrade gracefully than reject the upload entirely).
    return { name, ext }
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ImageAttachmentTooLargeError(file.size)
  }
  const dataUrl = await readAsDataUrl(file)
  return {
    name,
    ext,
    mediaType: file.type as ChatAttachment['mediaType'],
    dataUrl,
  }
}
