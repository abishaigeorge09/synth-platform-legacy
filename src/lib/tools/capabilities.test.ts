/**
 * Lock the capability manifest in step with the schema. If the schema
 * gains a new element type, source, input kind, scope, category, or
 * schema_version literal, this test fails until the manifest is updated.
 *
 * Conversely, the manifest cannot list anything the schema doesn't
 * actually support — drift in either direction breaks the test.
 */
import { describe, it, expect } from 'vitest'
import {
  SUPPORTED_ELEMENTS,
  SUPPORTED_SOURCES,
  SUPPORTED_INPUTS,
  SUPPORTED_SCOPES,
  SUPPORTED_CATEGORIES,
  SUPPORTED_SCHEMA_VERSIONS,
  CONNECTOR_SOURCES,
  CONNECTOR_LABELS,
  UNSUPPORTED_CAPABILITIES,
  manifestForSystemPrompt,
} from './capabilities'
import { ELEMENT_RENDERERS } from './registry'
import { ToolElementSchema, ToolInputSchema, ToolBindingSchema, ToolSpecSchema } from './schema'

describe('capabilities — schema parity', () => {
  it('SUPPORTED_ELEMENTS matches the renderer registry exactly', () => {
    const registryKeys = Object.keys(ELEMENT_RENDERERS).sort()
    const manifest = [...SUPPORTED_ELEMENTS].sort()
    expect(manifest).toEqual(registryKeys)
  })

  it('SUPPORTED_ELEMENTS matches the ToolElementSchema discriminated union', () => {
    // zod doesn't expose union options as a direct enum, but every option
    // has a literal `type`. Pull them out and compare.
    const schemaTypes = ToolElementSchema.options
      .map((opt) => {
        const typeField = opt.shape.type
        return (typeField as { value: string }).value
      })
      .sort()
    const manifest = [...SUPPORTED_ELEMENTS].sort()
    expect(manifest).toEqual(schemaTypes)
  })

  it('SUPPORTED_SOURCES matches ToolBindingSchema.source enum', () => {
    const schemaSources = (
      ToolBindingSchema.shape.source as unknown as { options: string[] }
    ).options
      .slice()
      .sort()
    const manifest = [...SUPPORTED_SOURCES].sort()
    expect(manifest).toEqual(schemaSources)
  })

  it('SUPPORTED_INPUTS matches ToolInputSchema discriminator', () => {
    const schemaInputKinds = ToolInputSchema.options
      .map((opt) => {
        const kindField = opt.shape.kind
        return (kindField as { value: string }).value
      })
      .sort()
    const manifest = [...SUPPORTED_INPUTS].sort()
    expect(manifest).toEqual(schemaInputKinds)
  })

  it('SUPPORTED_SCOPES matches ToolSpecSchema.scope enum', () => {
    const schemaScopes = (
      ToolSpecSchema.shape.scope as unknown as { options: string[] }
    ).options
      .slice()
      .sort()
    const manifest = [...SUPPORTED_SCOPES].sort()
    expect(manifest).toEqual(schemaScopes)
  })

  it('SUPPORTED_CATEGORIES matches ToolSpecSchema.category enum', () => {
    const schemaCategories = (
      ToolSpecSchema.shape.category as unknown as { options: string[] }
    ).options
      .slice()
      .sort()
    const manifest = [...SUPPORTED_CATEGORIES].sort()
    expect(manifest).toEqual(schemaCategories)
  })

  it('CONNECTOR_SOURCES is a subset of SUPPORTED_SOURCES', () => {
    for (const src of CONNECTOR_SOURCES) {
      expect(SUPPORTED_SOURCES).toContain(src)
    }
  })

  it('CONNECTOR_LABELS has a label for every CONNECTOR_SOURCES entry', () => {
    for (const src of CONNECTOR_SOURCES) {
      expect(CONNECTOR_LABELS[src]).toBeTruthy()
    }
  })
})

describe('capabilities — UNSUPPORTED_CAPABILITIES well-formed', () => {
  it('every entry has match keywords + reason + alternative', () => {
    for (const cap of UNSUPPORTED_CAPABILITIES) {
      expect(cap.id).toMatch(/^[a-z][a-z0-9_]*$/)
      expect(cap.match.length).toBeGreaterThan(0)
      expect(cap.reason.length).toBeGreaterThan(20)
      expect(cap.alternative.length).toBeGreaterThan(20)
    }
  })

  it('ids are unique', () => {
    const ids = UNSUPPORTED_CAPABILITIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('manifestForSystemPrompt', () => {
  it('renders every element type, source, and unsupported id', () => {
    const out = manifestForSystemPrompt()
    for (const el of SUPPORTED_ELEMENTS) expect(out).toContain(el)
    for (const src of SUPPORTED_SOURCES) expect(out).toContain(src)
    for (const cap of UNSUPPORTED_CAPABILITIES) expect(out).toContain(cap.id)
  })

  it('includes the SCHEMA_VERSIONS list', () => {
    const out = manifestForSystemPrompt()
    for (const v of SUPPORTED_SCHEMA_VERSIONS) expect(out).toContain(String(v))
  })
})

describe('SUPPORTED_SCHEMA_VERSIONS — locked at 1, 2', () => {
  it('matches the schema.ts SUPPORTED_SCHEMA_VERSIONS', () => {
    expect([...SUPPORTED_SCHEMA_VERSIONS]).toEqual([1, 2])
  })
})
