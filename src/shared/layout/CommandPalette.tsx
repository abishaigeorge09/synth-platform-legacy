import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { ComponentType } from 'react'
import { THEME } from '../../lib/theme'
import { useUiStore } from '../store/useUiStore'
import { COACH_TOOLS } from '../../features/coach/tools/toolRegistry'
import {
  DashboardIllustration,
  AthletesIllustration,
  SourcesIllustration,
  SynthAiIllustration,
  SettingsIllustration,
  AddToolIllustration,
} from '../illustrations/sidebarIllustrations'

/**
 * Phase 17 — global command palette.
 *
 * Cmd+K / Ctrl+K from anywhere inside `/coach/*` opens a search-driven
 * action list covering every navigable surface plus the Custom Tools
 * registry (Phase 16) and the synth. Agent modal trigger. The sidebar
 * "Add tool" button is repurposed as the explicit entry point — the
 * registry already knows every real tool, so the palette is the natural
 * place to expose the "coming soon" sport-specific tools too.
 *
 * Everything reads from THEME tokens; no hardcoded colors or fonts.
 *
 * Shape: the outer component owns the global keyboard shortcut (always
 * mounted). The inner component — which owns `query` / `cursor` state —
 * mounts only while `open` is true, so each palette session starts fresh
 * without needing an effect to reset state.
 *
 * Phase 18 adds: persisted "Recent" section (localStorage, max 5), a
 * focus trap that keeps Tab inside the dialog by redirecting to the
 * input, focus restore to the previously-active element on close, and
 * a proper ARIA listbox pattern (role="listbox" + role="option" +
 * aria-selected + aria-activedescendant on the input).
 *
 * Phase 21 adds: fuzzy matching so abbreviations ("dsh" → Dashboard)
 * and minor typos land correctly. Substring matches still rank first;
 * fuzzy results fill in below.
 *
 * Phase 22 adds: `mode` prop ('coach' | 'athlete') so the palette can
 * be mounted in AthleteLayout too. Coach mode shows coach navigation,
 * custom tools, coming-soon tools, and the Agent action. Athlete mode
 * shows athlete navigation and a "Switch to coach view" action. Both
 * share the same rendering, fuzzy-match, recents, focus-trap, and
 * ARIA infrastructure.
 */

type PaletteSection = 'Recent' | 'Navigate' | 'Custom Tools' | 'Coming soon' | 'Actions'

// localStorage-persisted recently-selected palette item IDs. Most-recent
// first, capped so the Recent section never crowds out the rest of the
// palette. Read once on mount; written on every successful selection.
const RECENTS_KEY = 'synth:palette:recents'
const RECENTS_LIMIT = 5

function readRecents(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((x): x is string => typeof x === 'string')
      .slice(0, RECENTS_LIMIT)
  } catch {
    return []
  }
}

function writeRecents(next: string[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
  } catch {
    // quota exceeded / private-mode / disabled storage — silently ignore;
    // the palette still works, just without persistence.
  }
}

type PaletteItem = {
  id: string
  label: string
  description: string
  section: PaletteSection
  keywords: string
  Glyph: ComponentType<{ size?: number; muted?: boolean }>
  disabled?: boolean
  run: () => void
}

// Sport-specific tools that haven't shipped yet. Registered here (not in
// COACH_TOOLS) because they have no route or component — they exist only
// as palette entries so the registry stays a contract about *shipped*
// surfaces.
const COMING_SOON: Array<{
  id: string
  label: string
  description: string
  keywords: string
}> = [
  {
    id: 'film-room',
    label: 'Film room',
    description: 'Video playback with session + split overlays (planned)',
    keywords: 'video film clip review',
  },
  {
    id: 'erg-builder',
    label: 'Erg test builder',
    description: 'Template 2k / 6k / 30-min pieces across the squad (planned)',
    keywords: 'erg test piece 2k 6k template',
  },
  {
    id: 'travel-roster',
    label: 'Travel roster',
    description: 'Away-regatta logistics + compliance holds (planned)',
    keywords: 'travel away regatta logistics',
  },
]

export type PaletteMode = 'coach' | 'athlete'

export function CommandPalette({ mode = 'coach' }: { mode?: PaletteMode }) {
  const open = useUiStore((s) => s.commandPaletteOpen)
  const openPalette = useUiStore((s) => s.openCommandPalette)
  const close = useUiStore((s) => s.closeCommandPalette)

  // Global Cmd+K / Ctrl+K toggle + Escape-to-close. Mounted at the
  // CoachLayout / AthleteLayout level so every surface inherits the shortcut.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey
      if (mod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        if (open) close()
        else openPalette()
      } else if (e.key === 'Escape' && open) {
        e.preventDefault()
        close()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, openPalette, close])

  return (
    <AnimatePresence>{open && <CommandPaletteInner onClose={close} mode={mode} />}</AnimatePresence>
  )
}

function CommandPaletteInner({ onClose, mode }: { onClose: () => void; mode: PaletteMode }) {
  const openAgent = useUiStore((s) => s.openAgentModal)
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const [recents] = useState<string[]>(() => readRecents())
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  // Focus the input as soon as the palette mounts, and restore focus to
  // whatever element owned it before the palette opened when the palette
  // unmounts. Runs once because the inner component only mounts while the
  // palette is open.
  useEffect(() => {
    const previouslyFocused =
      typeof document !== 'undefined'
        ? (document.activeElement as HTMLElement | null)
        : null
    const t = window.setTimeout(() => inputRef.current?.focus(), 20)
    return () => {
      window.clearTimeout(t)
      // Best-effort focus restore — ignore if the element is gone or not
      // focusable (e.g. a removed button in a re-rendered subtree).
      try {
        previouslyFocused?.focus?.()
      } catch {
        /* no-op */
      }
    }
  }, [])

  const go = (path: string) => {
    onClose()
    navigate(path)
  }

  // Single entry point for "user selected this palette item". Writes the
  // id into the recents ring buffer (most-recent first, capped) before
  // running the item's action. Disabled rows short-circuit so "coming
  // soon" entries can't pollute the recent list.
  const runItem = (item: PaletteItem) => {
    if (item.disabled) return
    const next = [item.id, ...recents.filter((x) => x !== item.id)].slice(
      0,
      RECENTS_LIMIT,
    )
    writeRecents(next)
    item.run()
  }

  // Build the full item list every render — React Compiler handles
  // memoization, so no manual useMemo. The handlers closed over (go /
  // onClose / openAgent / navigate) don't need to be stable because the
  // component only exists while the palette is open.
  const coachItems: PaletteItem[] = [
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      description: 'Team overview — stats, trends, roster, alerts',
      section: 'Navigate',
      keywords: 'dashboard home overview team stats',
      Glyph: DashboardIllustration,
      run: () => go('/coach/dashboard'),
    },
    {
      id: 'nav-athletes',
      label: 'Athletes',
      description: 'Searchable roster — 46 cards',
      section: 'Navigate',
      keywords: 'athletes roster players people',
      Glyph: AthletesIllustration,
      run: () => go('/coach/athletes'),
    },
    {
      id: 'nav-sources',
      label: 'Sources',
      description: 'Connectors, sync status, scan logs',
      section: 'Navigate',
      keywords: 'sources connectors integrations sync',
      Glyph: SourcesIllustration,
      run: () => go('/coach/sources'),
    },
    {
      id: 'nav-ai',
      label: 'synth. AI',
      description: 'Team-wide chat with citations',
      section: 'Navigate',
      keywords: 'ai chat assistant synth',
      Glyph: SynthAiIllustration,
      run: () => go('/coach/ai'),
    },
    {
      id: 'nav-settings',
      label: 'Settings',
      description: 'Visibility toggles · sync defaults · notifications',
      section: 'Navigate',
      keywords: 'settings preferences config',
      Glyph: SettingsIllustration,
      run: () => go('/coach/settings'),
    },
    ...COACH_TOOLS.map<PaletteItem>((t) => ({
      id: `tool-${t.id}`,
      label: t.label,
      description: t.description,
      section: 'Custom Tools',
      keywords: `tool ${t.label} ${t.description}`.toLowerCase(),
      Glyph: t.Glyph,
      run: () => go(t.absolutePath),
    })),
    ...COMING_SOON.map<PaletteItem>((c) => ({
      id: `soon-${c.id}`,
      label: c.label,
      description: c.description,
      section: 'Coming soon',
      keywords: c.keywords,
      Glyph: AddToolIllustration,
      disabled: true,
      run: () => {},
    })),
    {
      id: 'action-agent',
      label: 'Open synth. Agent',
      description: 'Connectors · scans · reports modal',
      section: 'Actions',
      keywords: 'agent modal connectors scan scrape sources',
      Glyph: SourcesIllustration,
      run: () => {
        onClose()
        openAgent()
      },
    },
    {
      id: 'action-landing',
      label: 'Back to landing',
      description: 'Public marketing surface',
      section: 'Actions',
      keywords: 'landing marketing home root',
      Glyph: DashboardIllustration,
      run: () => go('/'),
    },
    {
      id: 'action-athlete-home',
      label: 'Switch to athlete view',
      description: 'Preview the athlete-side experience',
      section: 'Actions',
      keywords: 'athlete view switch preview',
      Glyph: AthletesIllustration,
      run: () => go('/athlete/home'),
    },
  ]

  const athleteItems: PaletteItem[] = [
    {
      id: 'nav-athlete-today',
      label: 'Today',
      description: 'Readiness, schedule, coach feedback',
      section: 'Navigate',
      keywords: 'athlete today readiness home schedule',
      Glyph: DashboardIllustration,
      run: () => go('/athlete/today'),
    },
    {
      id: 'nav-athlete-progress',
      label: 'My progress',
      description: 'Goals, erg progression, feedback history',
      section: 'Navigate',
      keywords: 'athlete progress goals erg trends feedback',
      Glyph: AthletesIllustration,
      run: () => go('/athlete/progress'),
    },
    {
      id: 'nav-athlete-sessions',
      label: 'My sessions',
      description: 'Practice history + splits',
      section: 'Navigate',
      keywords: 'athlete sessions practices splits history',
      Glyph: DashboardIllustration,
      run: () => go('/athlete/sessions'),
    },
    {
      id: 'nav-athlete-lineups',
      label: 'My lineups',
      description: 'Boats + seating',
      section: 'Navigate',
      keywords: 'athlete lineups boats seating',
      Glyph: AthletesIllustration,
      run: () => go('/athlete/lineups'),
    },
    {
      id: 'nav-athlete-record',
      label: 'Record',
      description: 'Record form clips and log scores',
      section: 'Navigate',
      keywords: 'athlete record camera video log score',
      Glyph: SourcesIllustration,
      run: () => go('/athlete/record'),
    },
    {
      id: 'nav-athlete-workbook',
      label: 'Erg workbook',
      description: 'Team sheet view (demo)',
      section: 'Navigate',
      keywords: 'athlete workbook erg sheet google sheets',
      Glyph: DashboardIllustration,
      run: () => go('/athlete/workbook'),
    },
    {
      id: 'nav-athlete-sources-connectors',
      label: 'Sources — connectors',
      description: 'Connected apps and sync',
      section: 'Navigate',
      keywords: 'athlete sources connectors whoop strava concept2 apple health',
      Glyph: SourcesIllustration,
      run: () => go('/athlete/sources/connectors'),
    },
    {
      id: 'nav-athlete-sources-data-view',
      label: 'Sources — data view',
      description: 'Workflow + records by source',
      section: 'Navigate',
      keywords: 'athlete sources data view workflow concept2 strava whoop apple health',
      Glyph: SourcesIllustration,
      run: () => go('/athlete/sources/data-view'),
    },
    {
      id: 'nav-athlete-ai',
      label: 'synth. AI',
      description: 'Conversational assistant',
      section: 'Navigate',
      keywords: 'athlete ai chat assistant synth race plan',
      Glyph: SynthAiIllustration,
      run: () => go('/athlete/chat'),
    },
    {
      id: 'nav-athlete-settings',
      label: 'Settings',
      description: 'Athlete settings',
      section: 'Navigate',
      keywords: 'athlete settings preferences',
      Glyph: SettingsIllustration,
      run: () => go('/athlete/settings'),
    },
    {
      id: 'action-switch-coach',
      label: 'Switch to coach view',
      description: 'Preview the coach-side experience',
      section: 'Actions',
      keywords: 'coach view switch preview',
      Glyph: DashboardIllustration,
      run: () => go('/coach/dashboard'),
    },
    {
      id: 'action-landing',
      label: 'Back to landing',
      description: 'Public marketing surface',
      section: 'Actions',
      keywords: 'landing marketing home root',
      Glyph: DashboardIllustration,
      run: () => go('/'),
    },
  ]

  const items = mode === 'athlete' ? athleteItems : coachItems

  const q = query.trim().toLowerCase()

  // When the query is empty and the user has a recents history, prepend
  // a "Recent" section (in recency order) and remove those items from
  // their usual sections so they don't appear twice. When the user types,
  // the recents section disappears entirely — typed queries always search
  // the full palette. Disabled items can't land in recents (runItem
  // skips them) so this never creates phantom disabled recents.
  let filtered: PaletteItem[]
  if (q) {
    // Two-pass filter: substring matches first (exact relevance), then
    // fuzzy matches sorted by score. This keeps exact matches at the top
    // while still surfacing abbreviation / typo hits below.
    const substringHits: PaletteItem[] = []
    const fuzzyHits: Array<{ item: PaletteItem; score: number }> = []
    const substringIds = new Set<string>()

    for (const i of items) {
      if (
        i.label.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.keywords.includes(q)
      ) {
        substringHits.push(i)
        substringIds.add(i.id)
      }
    }

    for (const i of items) {
      if (substringIds.has(i.id)) continue
      const score = fuzzyScoreItem(q, i)
      if (score > 0) fuzzyHits.push({ item: i, score })
    }

    fuzzyHits.sort((a, b) => b.score - a.score)
    filtered = [...substringHits, ...fuzzyHits.map((h) => h.item)]
  } else if (recents.length > 0) {
    const byId = new Map(items.map((i) => [i.id, i]))
    const recentItems: PaletteItem[] = []
    for (const id of recents) {
      const base = byId.get(id)
      if (!base) continue
      recentItems.push({ ...base, section: 'Recent' })
    }
    const recentIds = new Set(recentItems.map((i) => i.id))
    const rest = items.filter((i) => !recentIds.has(i.id))
    filtered = [...recentItems, ...rest]
  } else {
    filtered = items
  }

  // Clamp cursor at render time instead of in an effect — avoids the
  // set-state-in-effect lint rule and keeps rendering deterministic even if
  // `filtered` shrinks because the user typed a query that removes rows.
  const maxIndex = Math.max(0, filtered.length - 1)
  const activeIndex = Math.min(cursor, maxIndex)

  // Group filtered results by section while preserving insertion order.
  const grouped: Array<[PaletteSection, Array<{ item: PaletteItem; index: number }>]> = []
  {
    const map = new Map<PaletteSection, Array<{ item: PaletteItem; index: number }>>()
    filtered.forEach((item, index) => {
      const arr = map.get(item.section) ?? []
      arr.push({ item, index })
      map.set(item.section, arr)
    })
    map.forEach((rows, section) => grouped.push([section, rows]))
  }

  const onKeyDownInPalette = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor(findNextEnabled(filtered, activeIndex, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor(findNextEnabled(filtered, activeIndex, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const target = filtered[activeIndex]
      if (target) runItem(target)
    } else if (e.key === 'Tab') {
      // Focus trap: Tab / Shift+Tab should never leave the palette dialog.
      // The input is the primary focus target for a command palette
      // (arrow keys drive the list), so the simplest correct trap is to
      // absorb Tab and re-focus the input.
      e.preventDefault()
      inputRef.current?.focus()
    }
  }

  // Keep the active row in view as the cursor moves. DOM-sync only — no
  // state updates inside.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLButtonElement>(
      `[data-cursor-index="${activeIndex}"]`,
    )
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-start justify-center p-3 pt-[14dvh] sm:p-6 sm:pt-[14dvh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onKeyDown={onKeyDownInPalette}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(12,10,9,0.55)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        role="dialog"
        aria-label="Command palette"
        className="relative flex w-full max-w-[640px] flex-col overflow-hidden rounded-2xl shadow-2xl"
        style={{ background: 'var(--bg-primary)', border: `1px solid ${THEME.border}` }}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 border-b px-5 py-4"
          style={{ borderColor: THEME.border }}
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: THEME.accent }}
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setCursor(0)
            }}
            placeholder="Jump to a surface, tool, or action…"
            className="flex-1 bg-transparent text-[15px] outline-none"
            style={{
              fontFamily: THEME.fontSans,
              color: THEME.textPrimary,
            }}
            role="combobox"
            aria-expanded={true}
            aria-controls="palette-listbox"
            aria-autocomplete="list"
            aria-activedescendant={
              filtered[activeIndex]
                ? `palette-option-${activeIndex}`
                : undefined
            }
          />
          <kbd
            className="rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              borderColor: THEME.border,
              color: THEME.textMuted,
              fontFamily: THEME.fontMono,
            }}
          >
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          id="palette-listbox"
          role="listbox"
          aria-label="Command palette results"
          className="synth-scroll max-h-[56dvh] overflow-y-auto px-2 py-2"
        >
          {filtered.length === 0 && (
            <div
              className="px-4 py-8 text-center text-[13px]"
              style={{
                color: THEME.textSecondary,
                fontFamily: THEME.fontSans,
              }}
            >
              No matches.
              <div
                className="mt-1 text-[11px]"
                style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}
              >
                Try "athletes", "lineups", or "agent".
              </div>
            </div>
          )}
          {grouped.map(([section, rows]) => (
            <div key={section} className="mb-2">
              <div
                className="px-3 pb-1 pt-2 text-[9px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}
              >
                {section}
              </div>
              <div className="flex flex-col">
                {rows.map(({ item, index }) => {
                  const active = index === activeIndex
                  return (
                    <button
                      key={item.id}
                      type="button"
                      id={`palette-option-${index}`}
                      role="option"
                      aria-selected={active}
                      aria-disabled={item.disabled || undefined}
                      data-cursor-index={index}
                      onMouseEnter={() => setCursor(index)}
                      onClick={() => runItem(item)}
                      disabled={item.disabled}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
                      style={{
                        background: active ? 'rgba(5,150,105,0.08)' : 'transparent',
                        color: item.disabled ? THEME.textMuted : THEME.textPrimary,
                        cursor: item.disabled ? 'not-allowed' : 'pointer',
                        opacity: item.disabled ? 0.65 : 1,
                      }}
                    >
                      <item.Glyph size={20} muted={!active || item.disabled} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[13px] font-semibold"
                            style={{ fontFamily: THEME.fontSans }}
                          >
                            {item.label}
                          </span>
                          {item.disabled && (
                            <span
                              className="rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider"
                              style={{
                                background: THEME.light,
                                border: `1px solid ${THEME.border}`,
                                color: THEME.amber,
                                fontFamily: THEME.fontMono,
                              }}
                            >
                              Planned
                            </span>
                          )}
                        </div>
                        <div
                          className="truncate text-[11px]"
                          style={{
                            color: THEME.textSecondary,
                            fontFamily: THEME.fontMono,
                          }}
                        >
                          {item.description}
                        </div>
                      </div>
                      {active && !item.disabled && (
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wider"
                          style={{
                            color: THEME.primary,
                            fontFamily: THEME.fontMono,
                          }}
                        >
                          ↵
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint row */}
        <div
          className="flex items-center justify-between border-t px-5 py-3 text-[10px]"
          style={{
            borderColor: THEME.border,
            color: THEME.textMuted,
            fontFamily: THEME.fontMono,
          }}
        >
          <div className="flex flex-wrap gap-3">
            <HintKey label="↑↓" text="navigate" />
            <HintKey label="↵" text="select" />
            <HintKey label="esc" text="close" />
          </div>
          <div>
            {filtered.length} result{filtered.length === 1 ? '' : 's'}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function HintKey({ label, text }: { label: string; text: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <kbd
        className="rounded border px-1.5 py-0.5 text-[9px] font-semibold"
        style={{
          borderColor: THEME.border,
          background: 'var(--bg-primary)',
          color: THEME.textSecondary,
        }}
      >
        {label}
      </kbd>
      <span>{text}</span>
    </span>
  )
}

/**
 * Fuzzy match scorer. Returns a non-negative score if every character in
 * `query` appears in `target` in order; -1 otherwise. Higher is better.
 *
 * Bonuses:
 *  - +5 for a match at a word boundary (start of string, after space/hyphen/slash)
 *  - +3 for consecutive matched characters
 *  - +2 for a match in the first 4 characters of the target
 *
 * The score is intentionally simple — no dynamic programming, no
 * backtracking. O(n) per target string, which is fine for ~15 items.
 */
function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase()
  const t = target.toLowerCase()
  let score = 0
  let ti = 0
  let prevMatchIndex = -2 // -2 = no previous match yet

  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi]
    let found = false
    while (ti < t.length) {
      if (t[ti] === ch) {
        // Base point for every matched character
        score += 1
        // Word-boundary bonus
        if (ti === 0 || t[ti - 1] === ' ' || t[ti - 1] === '-' || t[ti - 1] === '/') {
          score += 5
        }
        // Consecutive-match bonus
        if (ti === prevMatchIndex + 1) {
          score += 3
        }
        // Near-start bonus
        if (ti < 4) {
          score += 2
        }
        prevMatchIndex = ti
        ti++
        found = true
        break
      }
      ti++
    }
    if (!found) return -1
  }
  return score
}

/**
 * Score a query against a palette item. Checks label, description, and
 * keywords; returns the best score across all three (or -1 if none match).
 */
function fuzzyScoreItem(query: string, item: PaletteItem): number {
  return Math.max(
    fuzzyScore(query, item.label),
    fuzzyScore(query, item.description),
    fuzzyScore(query, item.keywords),
  )
}

// Skip over disabled ("coming soon") rows when arrow-key navigating so
// Enter always lands on something actionable.
function findNextEnabled(list: PaletteItem[], from: number, dir: 1 | -1): number {
  if (list.length === 0) return 0
  const len = list.length
  let i = from
  for (let step = 0; step < len; step++) {
    i = (i + dir + len) % len
    if (!list[i].disabled) return i
  }
  return from
}
