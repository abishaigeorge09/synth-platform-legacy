import { describe, it, expect } from 'vitest'
import { resolveBindings } from './resolver'
import { EXAMPLES } from './examples'
import type { ToolSpec } from './schema'

describe('resolveBindings — example specs against MOCK_SNAPSHOTS', () => {
  for (const spec of EXAMPLES) {
    it(`${spec.id}: every declared binding resolves with status 'connected'`, () => {
      const state = resolveBindings(spec)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      for (const name of Object.keys(spec.bindings)) {
        expect(state.data, `data missing key: ${name}`).toHaveProperty(name)
        expect(state.bindingStatus[name]).toBe('connected')
      }
    })
  }
})

describe('resolveBindings — fallback for unknown spec id', () => {
  it('returns empty data + every binding marked fallback', () => {
    const synthetic: ToolSpec = {
      ...EXAMPLES[0],
      id: 'unknown-tool-xyz',
    }
    const state = resolveBindings(synthetic)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.data).toEqual({})
    for (const name of Object.keys(synthetic.bindings)) {
      expect(state.bindingStatus[name]).toBe('fallback')
    }
  })
})

describe('ResolverState shape — TanStack Query parity', () => {
  it('returns the four canonical fields exactly', () => {
    const state = resolveBindings(EXAMPLES[0])
    expect(Object.keys(state).sort()).toEqual(
      ['bindingStatus', 'data', 'error', 'isLoading'].sort(),
    )
  })
})
