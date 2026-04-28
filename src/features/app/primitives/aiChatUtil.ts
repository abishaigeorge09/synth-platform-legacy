import type { ChatCustomization } from './AIChat'

/**
 * Helpers + constants used by the AI chat pages. Lives here (not AIChat.tsx)
 * so the primitives file can be a components-only module — keeps Fast Refresh
 * compatible.
 */

export function timeAwareGreeting(): string {
  const h = new Date().getHours()
  if (h < 5) return 'How can I help this late night?'
  if (h < 12) return 'What can I show you this morning?'
  if (h < 17) return 'What do you want to know this afternoon?'
  if (h < 22) return "What's on your mind tonight?"
  return 'How can I help this late night?'
}

export const DEFAULT_CUSTOMIZATION: ChatCustomization = {
  instructions: '',
  tone: 'normal',
  references: [],
  alwaysPlans: true,
  alwaysWellness: true,
  neverPrivateNotes: false,
}
