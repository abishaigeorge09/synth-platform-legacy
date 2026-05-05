import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

// Vitest runs these tests in node mode (no jsdom) so window.localStorage
// is undefined. zustand/middleware persist logs a warning every set when
// it can't reach storage. Stub it with an in-memory shim so the tests
// stay quiet — we don't assert on persistence here, only on store
// behaviour.
beforeAll(() => {
  if (typeof globalThis.localStorage === 'undefined') {
    const mem = new Map<string, string>()
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (k: string) => mem.get(k) ?? null,
        setItem: (k: string, v: string) => void mem.set(k, v),
        removeItem: (k: string) => void mem.delete(k),
        clear: () => mem.clear(),
        key: (i: number) => Array.from(mem.keys())[i] ?? null,
        get length() {
          return mem.size
        },
      },
      configurable: true,
    })
  }
})

const { useAIChatCustomization } = await import('./useAIChatCustomization')
const { DEFAULT_CUSTOMIZATION } = await import('../primitives/aiChatUtil')

// Reset to a clean slate before every test.
beforeEach(() => {
  useAIChatCustomization.setState({ byScope: {} })
})

describe('useAIChatCustomization — defaults', () => {
  it('returns DEFAULT_CUSTOMIZATION shape for an unset scope', () => {
    const out = useAIChatCustomization.getState().getForScope('team')
    expect(out.tone).toBe(DEFAULT_CUSTOMIZATION.tone)
    expect(out.instructions).toBe(DEFAULT_CUSTOMIZATION.instructions)
    expect(out.references).toEqual([])
  })

  it('returns a fresh object so callers can mutate references safely', () => {
    const a = useAIChatCustomization.getState().getForScope('team')
    const b = useAIChatCustomization.getState().getForScope('athlete:abc')
    expect(a).not.toBe(b)
    expect(a.references).not.toBe(b.references)
  })
})

describe('useAIChatCustomization — set + get', () => {
  it('writes a full customization for a scope', () => {
    const next = {
      ...DEFAULT_CUSTOMIZATION,
      instructions: 'Lead with sleep data',
      tone: 'recovery' as const,
      references: [],
    }
    useAIChatCustomization.getState().setForScope('athlete:abc', next)
    const out = useAIChatCustomization.getState().getForScope('athlete:abc')
    expect(out.instructions).toBe('Lead with sleep data')
    expect(out.tone).toBe('recovery')
  })

  it('keeps scopes independent', () => {
    useAIChatCustomization.getState().setForScope('team', {
      ...DEFAULT_CUSTOMIZATION,
      instructions: 'Team-wide rules',
      references: [],
    })
    useAIChatCustomization.getState().setForScope('athlete:olivia', {
      ...DEFAULT_CUSTOMIZATION,
      instructions: 'Olivia rules',
      references: [],
    })
    const team = useAIChatCustomization.getState().getForScope('team')
    const olivia = useAIChatCustomization
      .getState()
      .getForScope('athlete:olivia')
    expect(team.instructions).toBe('Team-wide rules')
    expect(olivia.instructions).toBe('Olivia rules')
  })
})

describe('useAIChatCustomization — patch', () => {
  it('merges a partial patch onto the default for an unset scope', () => {
    useAIChatCustomization
      .getState()
      .patchForScope('self:me', { tone: 'raceday' })
    const out = useAIChatCustomization.getState().getForScope('self:me')
    expect(out.tone).toBe('raceday')
    expect(out.instructions).toBe(DEFAULT_CUSTOMIZATION.instructions)
  })

  it('merges a partial patch onto an existing customization', () => {
    useAIChatCustomization.getState().setForScope('team', {
      ...DEFAULT_CUSTOMIZATION,
      instructions: 'Original',
      tone: 'coach',
      references: [],
    })
    useAIChatCustomization
      .getState()
      .patchForScope('team', { instructions: 'Updated' })
    const out = useAIChatCustomization.getState().getForScope('team')
    expect(out.instructions).toBe('Updated')
    // Tone untouched.
    expect(out.tone).toBe('coach')
  })
})

describe('useAIChatCustomization — reset', () => {
  it('removes a scope from the map', () => {
    useAIChatCustomization.getState().setForScope('team', {
      ...DEFAULT_CUSTOMIZATION,
      instructions: 'Will be cleared',
      references: [],
    })
    useAIChatCustomization.getState().resetScope('team')
    const out = useAIChatCustomization.getState().getForScope('team')
    expect(out.instructions).toBe(DEFAULT_CUSTOMIZATION.instructions)
    expect(useAIChatCustomization.getState().byScope).not.toHaveProperty('team')
  })

  it('does not touch other scopes', () => {
    useAIChatCustomization.getState().setForScope('team', {
      ...DEFAULT_CUSTOMIZATION,
      instructions: 'Team',
      references: [],
    })
    useAIChatCustomization.getState().setForScope('athlete:x', {
      ...DEFAULT_CUSTOMIZATION,
      instructions: 'X',
      references: [],
    })
    useAIChatCustomization.getState().resetScope('team')
    expect(
      useAIChatCustomization.getState().getForScope('athlete:x').instructions,
    ).toBe('X')
  })
})
