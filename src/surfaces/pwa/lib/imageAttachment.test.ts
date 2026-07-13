import { beforeAll, describe, expect, it } from 'vitest'
import {
  ImageAttachmentTooLargeError,
  MAX_IMAGE_BYTES,
  readChatAttachment,
} from './imageAttachment'

// Vitest's node mode lacks a real DOM File, but the constructor is
// available as a global polyfill in current node + we only read .name,
// .type, and .size. Same goes for FileReader — we need a minimal shim
// that returns a base64 data URL so readChatAttachment resolves.
beforeAll(() => {
  if (typeof globalThis.FileReader === 'undefined') {
    type Listener = (() => void) | null
    class MinimalFileReader {
      result: string | null = null
      error: unknown = null
      onload: Listener = null
      onerror: Listener = null
      readAsDataURL(blob: Blob & { type?: string }) {
        // Stub data: a tiny base64 payload that round-trips through
        // parseImageDataUrl. We don't care about the actual bytes for
        // these tests, only the shape.
        const mime = blob.type || 'application/octet-stream'
        this.result = `data:${mime};base64,QUJDRA==`
        // Emulate async dispatch.
        queueMicrotask(() => this.onload?.())
      }
    }
    Object.defineProperty(globalThis, 'FileReader', {
      value: MinimalFileReader,
      configurable: true,
    })
  }
})

function makeFile(opts: { name: string; type: string; size: number }): File {
  // node 20+ has File globally; size is set by passing a Buffer of the
  // right length. Keep it cheap — Buffer.alloc with zeroes is fine.
  const blob = new Blob([new Uint8Array(opts.size)], { type: opts.type })
  return new File([blob], opts.name, { type: opts.type })
}

describe('readChatAttachment — non-image files', () => {
  it('returns name + ext only for a PDF', async () => {
    const out = await readChatAttachment(
      makeFile({ name: 'race-plan.pdf', type: 'application/pdf', size: 1000 }),
    )
    expect(out).toEqual({ name: 'race-plan', ext: 'PDF' })
  })

  it('returns FILE for an extensionless file', async () => {
    const out = await readChatAttachment(
      makeFile({ name: 'something', type: 'text/plain', size: 100 }),
    )
    expect(out.ext).toBe('FILE')
  })

  it('truncates long names to 24 chars + ellipsis', async () => {
    const longName = 'a'.repeat(60) + '.csv'
    const out = await readChatAttachment(
      makeFile({ name: longName, type: 'text/csv', size: 100 }),
    )
    expect(out.name.length).toBeLessThanOrEqual(25)
    expect(out.name.endsWith('…')).toBe(true)
  })
})

describe('readChatAttachment — image files', () => {
  it('reads a JPEG and returns mediaType + dataUrl', async () => {
    const out = await readChatAttachment(
      makeFile({ name: 'catch.jpg', type: 'image/jpeg', size: 1024 }),
    )
    expect(out.mediaType).toBe('image/jpeg')
    expect(out.dataUrl?.startsWith('data:image/jpeg;base64,')).toBe(true)
  })

  it('handles PNG, GIF, WebP as images', async () => {
    for (const type of ['image/png', 'image/gif', 'image/webp'] as const) {
      const out = await readChatAttachment(
        makeFile({ name: 'x', type, size: 1024 }),
      )
      expect(out.mediaType).toBe(type)
      expect(out.dataUrl).toBeTruthy()
    }
  })

  it('rejects images larger than MAX_IMAGE_BYTES', async () => {
    const file = makeFile({
      name: 'huge.png',
      type: 'image/png',
      size: MAX_IMAGE_BYTES + 1,
    })
    await expect(readChatAttachment(file)).rejects.toBeInstanceOf(
      ImageAttachmentTooLargeError,
    )
  })

  it('treats unsupported image MIME types as plain files', async () => {
    // image/svg+xml isn't supported by Anthropic vision. We degrade
    // to a plain file chip rather than rejecting outright.
    const out = await readChatAttachment(
      makeFile({ name: 'logo.svg', type: 'image/svg+xml', size: 500 }),
    )
    expect(out.dataUrl).toBeUndefined()
    expect(out.mediaType).toBeUndefined()
  })
})
