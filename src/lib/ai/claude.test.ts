import { describe, expect, it } from 'vitest'
import { buildUserContent, parseImageDataUrl } from './claude'

describe('parseImageDataUrl', () => {
  it('extracts data + media type from a JPEG data URL', () => {
    const out = parseImageDataUrl('data:image/jpeg;base64,/9j/4AAQSkZJRgABA')
    expect(out).toEqual({ mediaType: 'image/jpeg', data: '/9j/4AAQSkZJRgABA' })
  })

  it('handles PNG, GIF, WebP', () => {
    expect(parseImageDataUrl('data:image/png;base64,iVBORw0KGgo')?.mediaType).toBe('image/png')
    expect(parseImageDataUrl('data:image/gif;base64,R0lGOD')?.mediaType).toBe('image/gif')
    expect(parseImageDataUrl('data:image/webp;base64,UklGR')?.mediaType).toBe('image/webp')
  })

  it('lowercases the media type', () => {
    const out = parseImageDataUrl('data:image/JPEG;base64,xxx')
    expect(out?.mediaType).toBe('image/jpeg')
  })

  it('returns null for non-image data URLs', () => {
    expect(parseImageDataUrl('data:application/pdf;base64,JVBERi0xLjQK')).toBeNull()
    expect(parseImageDataUrl('data:image/svg+xml;base64,abc')).toBeNull()
    expect(parseImageDataUrl('not-a-data-url')).toBeNull()
    expect(parseImageDataUrl('')).toBeNull()
  })
})

describe('buildUserContent', () => {
  it('returns a single text block when no images are passed', () => {
    const out = buildUserContent('hello there', [])
    expect(out).toEqual([{ type: 'text', text: 'hello there' }])
  })

  it('puts images before the text block', () => {
    const out = buildUserContent('what is this?', [
      { dataBase64: 'AAAA', mediaType: 'image/png' },
    ])
    expect(out[0].type).toBe('image')
    expect(out[1]).toEqual({ type: 'text', text: 'what is this?' })
  })

  it('handles multiple images in order', () => {
    const out = buildUserContent('compare', [
      { dataBase64: 'A', mediaType: 'image/png' },
      { dataBase64: 'B', mediaType: 'image/jpeg' },
    ])
    expect(out).toHaveLength(3)
    expect(out[0].type).toBe('image')
    expect(out[1].type).toBe('image')
    expect(out[2].type).toBe('text')
  })

  it('forwards mediaType + base64 verbatim into the image block', () => {
    const out = buildUserContent('caption', [
      { dataBase64: 'AAAA', mediaType: 'image/webp' },
    ])
    const img = out[0]
    if (img.type !== 'image') throw new Error('expected image block')
    expect(img.source.type).toBe('base64')
    expect(img.source.media_type).toBe('image/webp')
    expect(img.source.data).toBe('AAAA')
  })
})
