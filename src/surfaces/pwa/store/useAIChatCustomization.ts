import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatCustomization } from '../primitives/AIChat'
import { DEFAULT_CUSTOMIZATION } from '../primitives/aiChatUtil'

/**
 * Phase 2 of the synth AI deep upgrade.
 *
 * One ChatCustomization per scope, surviving page reloads via localStorage.
 * Scope ids are stringly-typed so the same store covers all three surfaces:
 *
 *   - "team"            ← coach AIPage with no athlete drilled in
 *   - "athlete:<uuid>"  ← coach AIPage drilled into one athlete
 *   - "self:<uuid>"     ← athlete AIPage (self-scoped)
 *
 * Per AG: scopes are independent. There is no team -> athlete inheritance
 * or fallback. A coach editing instructions for Olivia must not silently
 * change anything about the team scope, and vice versa. Switching scope
 * mid-session loads that scope's saved customization unchanged.
 */
export type ChatScopeId = 'team' | `athlete:${string}` | `self:${string}`

type AIChatCustomizationState = {
  byScope: Record<string, ChatCustomization>
  /** Returns the saved customization for a scope, or DEFAULT_CUSTOMIZATION
   *  if the scope has never been edited. Always returns a fresh value (the
   *  default constant is spread) so callers can mutate without breaking the
   *  shared default. */
  getForScope: (scopeId: string) => ChatCustomization
  /** Replaces a scope's customization wholesale. */
  setForScope: (scopeId: string, value: ChatCustomization) => void
  /** Merges a partial patch onto a scope's existing customization (or onto
   *  the default if the scope is unset). Used by CustomizeChatSheet's
   *  per-field updates so we don't have to spread on every callsite. */
  patchForScope: (scopeId: string, patch: Partial<ChatCustomization>) => void
  /** Clears a scope back to defaults. */
  resetScope: (scopeId: string) => void
}

export const useAIChatCustomization = create<AIChatCustomizationState>()(
  persist(
    (set, get) => ({
      byScope: {},
      getForScope: (scopeId) => {
        const stored = get().byScope[scopeId]
        return stored ?? { ...DEFAULT_CUSTOMIZATION, references: [] }
      },
      setForScope: (scopeId, value) =>
        set((s) => ({ byScope: { ...s.byScope, [scopeId]: value } })),
      patchForScope: (scopeId, patch) =>
        set((s) => {
          const base = s.byScope[scopeId] ?? {
            ...DEFAULT_CUSTOMIZATION,
            references: [],
          }
          return { byScope: { ...s.byScope, [scopeId]: { ...base, ...patch } } }
        }),
      resetScope: (scopeId) =>
        set((s) => {
          const next = { ...s.byScope }
          delete next[scopeId]
          return { byScope: next }
        }),
    }),
    {
      name: 'synth:ai:customization',
      version: 1,
      // Only persist the map. The methods are recreated on every load
      // from the factory above. This keeps the localStorage payload
      // tiny + future-migration friendly.
      partialize: (s) => ({ byScope: s.byScope }),
    },
  ),
)
