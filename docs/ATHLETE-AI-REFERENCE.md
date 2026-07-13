# synth. — Athlete AI Page Reference

Complete reference for the **athlete app synth AI experience**: the chat page, how data is rendered (charts/tables/callouts/citations), the voice feature, program customization, and the full response engine (both the mock/canned generator and the live-Claude streaming path with its structured-token system prompt).

All files live under `src/features/app/` (the cobalt mobile surface). Route: `/app/athlete/ai`.

---

## Architecture overview

```
AIPage.tsx (athlete)                      ← page: state, send loop, mode switch
├── AIThread / AIComposer / SuggestionRow  ← AIChat.tsx (rendering + types)
├── AuroraVoiceOverlay.tsx                 ← voice capture (Web Speech API)
├── CustomizeChatSheet                     ← AIChat.tsx (program customization UI)
│   └── useAIChatCustomization.ts          ← per-scope persisted settings
├── AddToChatSheet / ChatHistorySheet      ← AIChat.tsx (attach + history)
│
├── RESPONSE ENGINE
│   ├── getAIClientMode()                  ← aiClient.ts (live vs mock)
│   ├── mockSelfResponse()                 ← AIPage.tsx (canned ChatPart[] replies)
│   ├── streamCompletion()                 ← aiClient.ts (Claude streaming)
│   ├── buildSystemPrompt()                ← aiClient.ts (the structured-token prompt)
│   └── parseAIText()                      ← aiResponseParser.ts (tokens → ChatPart[])
│
└── data: mockTeam.ts (buildErgHistory, fmtErgTime, APP_MOCK_ATHLETES)
```

**Two response modes**, chosen by `getAIClientMode()`:
- **`mock`** — no Anthropic/Supabase configured. The page calls `mockSelfResponse()` after a ~1.3s delay and renders a hand-built `ChatPart[]` (text + chart + chip + callout). This is the UI-first deterministic path.
- **`live`** — Claude is configured. The page streams text deltas from Claude, and `parseAIText()` converts the prose (which contains structured tokens like `[chart:...]`, `[c:...]`, `[suggest:...]`) into the same `ChatPart[]` the renderer understands.

Either way the renderer consumes one type — `ChatPart[]` — so the two modes look identical on screen.

---

## How data is represented — the `ChatPart` model

Every AI reply is an array of typed blocks. The renderer (`AIThread` → `MessageRow`) groups inline parts (`text` + `chip`) into paragraphs and renders the rest as standalone cards.

| `kind` | Renders as | Fields |
|---|---|---|
| `text` | a run of prose | `text` |
| `chip` | inline citation pill | `source`, `subject`, `date` |
| `chart` | Recharts line chart card | `title`, `data: {label,value}[]`, `yFormatter?`, `accent?`, `provenance?` |
| `callout` | left-bordered insight box | `tone: info\|warn\|success`, `title?`, `text` |
| `bulletList` | severity-dotted list | `items: {label, sub?, severity?}[]` |
| `illustration` | centered SVG glyph card | `glyph: boat\|erg\|trophy\|heart\|stopwatch`, `caption?` |
| `table` | data table card | `title`, `columns[]`, `rows[][]`, `provenance?` |
| `suggestions` | tap-to-send chips above composer | `items: string[]` (extracted, not rendered in bubble) |

---

## 1. The athlete AI page — `src/features/app/athlete/AIPage.tsx`

```tsx
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Menu, Sliders } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { SwipeBackPage } from '../primitives/SwipeBackPage'
import { AuroraVoiceOverlay } from '../primitives/AuroraVoiceOverlay'
import {
  AIThread,
  AIComposer,
  AddToChatSheet,
  ChatHistorySheet,
  CustomizeChatSheet,
  SuggestionRow,
  getActiveSuggestions,
  type ChatAttachment,
  type ChatMessage,
  type ChatPart,
  type ChartPoint,
  type ChatHistoryEntry,
  type ScopeOption,
  type StyleKey,
  type ChatCustomization,
} from '../primitives/AIChat'
import { timeAwareGreeting } from '../primitives/aiChatUtil'
import {
  streamCompletion,
  buildSystemPrompt,
  getAIClientMode,
  type AIMessage,
} from '../lib/aiClient'
import { buildUserContent, parseImageDataUrl } from '../../../lib/ai/claude'
import { parseAIText } from '../lib/aiResponseParser'
import {
  ImageAttachmentTooLargeError,
  readChatAttachment,
} from '../lib/imageAttachment'
import { useAppAuthStore } from '../store/useAppAuthStore'
import { useDemoUsage, DEMO_DAILY_AI_LIMIT } from '../store/useDemoUsage'
import { useAIChatCustomization } from '../store/useAIChatCustomization'
import { APP_MOCK_ATHLETES, buildErgHistory, fmtErgTime } from '../data/mockTeam'

const SEED_HISTORY: ChatHistoryEntry[] = [
  { id: 'h-1', title: 'Race-day warm-up', updatedAgo: 'yesterday', pinned: true },
  { id: 'h-2', title: 'Sleep + erg trend last week', updatedAgo: '4h ago' },
]

export function AIPage() {
  const navigate = useNavigate()
  const me = APP_MOCK_ATHLETES[0]
  const scopeLabel = me.name
  const isDemo = useAppAuthStore((s) => s.isDemo)
  // Demo daily-cap state (client-side soft defence; server is the hard cap).
  const demoCount = useDemoUsage((s) => s.count)
  const demoDate = useDemoUsage((s) => s.date)
  const recordDemoMessage = useDemoUsage((s) => s.recordMessage)
  const todayUtc = new Date().toISOString().slice(0, 10)
  const demoOverLimit =
    isDemo && demoDate === todayUtc && demoCount >= DEMO_DAILY_AI_LIMIT

  const scopeOptions: ScopeOption[] = useMemo(
    () => [{ id: me.id, label: `Just ${me.name.split(' ')[0]}` }],
    [me.id, me.name],
  )

  const [text, setText] = useState('')
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null)
  const [attachError, setAttachError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [history, setHistory] = useState<ChatHistoryEntry[]>(SEED_HISTORY)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [style, setStyle] = useState<StyleKey>('synthesized')

  // Athlete view is always self-scoped. Store key is `self:<id>` so it can
  // never overlap a coach-side `athlete:<id>` drilldown of the same uuid.
  const customScopeId = `self:${me.id}`
  const customCell = useAIChatCustomization((s) => s.byScope[customScopeId])
  const getForScope = useAIChatCustomization((s) => s.getForScope)
  const setForScope = useAIChatCustomization((s) => s.setForScope)
  const customResolved = customCell ?? getForScope(customScopeId)

  const streamingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const onPickFiles = (files: FileList | null) => {
    const f = files?.[0]
    if (!f) return
    setAttachError(null)
    void (async () => {
      try {
        const next = await readChatAttachment(f)
        setAttachment(next)
      } catch (err) {
        if (err instanceof ImageAttachmentTooLargeError) {
          setAttachError(err.message)
          setTimeout(() => setAttachError(null), 4000)
          return
        }
        console.error('[ai-attach] failed to read file:', err)
        setAttachError('Could not read that file.')
        setTimeout(() => setAttachError(null), 4000)
      }
    })()
  }

  const stopStreaming = () => {
    if (streamingTimer.current) {
      clearTimeout(streamingTimer.current)
      streamingTimer.current = null
    }
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setIsStreaming(false)
    setMessages((m) => m.filter((msg) => msg.role !== 'thinking'))
  }

  const send = (overrideText?: string) => {
    // overrideText lets suggestion chips fire send without round-tripping
    // through React state.
    const trimmed = (overrideText ?? text).trim()
    if (!trimmed && !attachment) return

    // Demo daily cap.
    if (isDemo && useDemoUsage.getState().isOverLimit()) {
      setMessages((m) => [
        ...m,
        {
          id: `err-${Date.now()}`,
          role: 'ai' as const,
          parts: [
            {
              kind: 'text' as const,
              text: `You've hit the demo daily limit of ${DEMO_DAILY_AI_LIMIT} messages. Sign up for unlimited access, or come back tomorrow.`,
            },
          ],
          ts: Date.now(),
        },
      ])
      return
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      ts: Date.now(),
      attachment: attachment ?? undefined,
    }
    const thinking: ChatMessage = { id: `t-${Date.now()}`, role: 'thinking' }
    setMessages((m) => [...m, userMsg, thinking])
    setText('')
    setAttachment(null)
    setIsStreaming(true)
    if (isDemo) recordDemoMessage()

    if (!activeChatId) {
      const newId = `h-${Date.now()}`
      const title = trimmed || 'New chat'
      setHistory((h) => [
        { id: newId, title: title.length > 48 ? `${title.slice(0, 48)}…` : title, updatedAgo: 'just now' },
        ...h,
      ])
      setActiveChatId(newId)
    }

    const mode = getAIClientMode({ isDemo })

    // ── MOCK MODE — deterministic canned reply ──
    if (mode === 'mock') {
      streamingTimer.current = setTimeout(() => {
        setMessages((m) => {
          const withoutThinking = m.filter((msg) => msg.role !== 'thinking')
          return [
            ...withoutThinking,
            {
              id: `a-${Date.now()}`,
              role: 'ai',
              parts: mockSelfResponse(me, trimmed, style, customResolved),
              ts: Date.now(),
            },
          ]
        })
        setIsStreaming(false)
        streamingTimer.current = null
      }, 1300)
      return
    }

    // ── LIVE MODE — call Anthropic. Self-scoped: athlete's own data only. ──
    const scopeData = {
      athlete: me,
      ergHistory: buildErgHistory(me.id).slice(-14),
    }

    const systemPrompt = buildSystemPrompt({
      scope: 'self',
      scopeLabel,
      scopeData,
      customization: customResolved,
      hasImage: !!userMsg.attachment?.dataUrl,
    })

    const history = messages
      .filter((m) => m.role !== 'thinking')
      .map((m): AIMessage => {
        if (m.role === 'user') return { role: 'user', content: m.text }
        const txt = m.parts
          .map((p) => (p.kind === 'text' ? p.text : ''))
          .join('')
          .trim()
        return { role: 'assistant', content: txt || '(prior response)' }
      })

    // Image attachment → content-block message; tier-forced to sonnet (vision).
    const imagePart =
      userMsg.attachment?.dataUrl != null
        ? parseImageDataUrl(userMsg.attachment.dataUrl)
        : null
    const userContent = imagePart
      ? buildUserContent(trimmed || 'What is shown in this image?', [
          { dataBase64: imagePart.data, mediaType: imagePart.mediaType },
        ])
      : trimmed

    const apiMessages: AIMessage[] = [...history, { role: 'user', content: userContent }]
    const modelOverride = imagePart ? 'sonnet' : undefined

    const ctrl = new AbortController()
    abortRef.current = ctrl
    const aiId = `a-${Date.now()}`
    let accumulated = ''

    void streamCompletion({
      systemPrompt,
      messages: apiMessages,
      model: modelOverride,
      signal: ctrl.signal,
      onEvent: (e) => {
        if (e.kind === 'delta') {
          accumulated += e.text
          // parseAIText is pure + idempotent, so re-parsing on every
          // delta is safe (same input → same parts, no flicker).
          const parsed = parseAIText(accumulated)
          setMessages((m) => {
            const withoutThinking = m.filter((msg) => msg.role !== 'thinking')
            const exists = withoutThinking.some((msg) => msg.id === aiId)
            if (exists) {
              return withoutThinking.map((msg) =>
                msg.id === aiId ? { ...msg, parts: parsed } : msg,
              )
            }
            return [
              ...withoutThinking,
              { id: aiId, role: 'ai' as const, parts: parsed, ts: Date.now() },
            ]
          })
        } else if (e.kind === 'error') {
          setMessages((m) => {
            const withoutThinking = m.filter((msg) => msg.role !== 'thinking')
            return [
              ...withoutThinking,
              {
                id: `err-${Date.now()}`,
                role: 'ai' as const,
                parts: [{ kind: 'text' as const, text: `⚠️ ${e.message}` }],
                ts: Date.now(),
              },
            ]
          })
          setIsStreaming(false)
          abortRef.current = null
        } else if (e.kind === 'done') {
          setIsStreaming(false)
          abortRef.current = null
        }
      },
    })
  }

  const onPickHistoryEntry = (id: string) => {
    setActiveChatId(id)
    setMessages([])
    setHistoryOpen(false)
  }
  const startNewChat = () => {
    setMessages([])
    setActiveChatId(null)
    setHistoryOpen(false)
  }
  const onPin = (id: string) => {
    setHistory((h) => h.map((e) => (e.id === id ? { ...e, pinned: !e.pinned } : e)))
  }
  const onRename = (id: string) => {
    const next = window.prompt('Rename chat')
    if (!next) return
    setHistory((h) => h.map((e) => (e.id === id ? { ...e, title: next } : e)))
  }
  const onDelete = (id: string) => {
    setHistory((h) => h.filter((e) => e.id !== id))
    if (activeChatId === id) {
      setActiveChatId(null)
      setMessages([])
    }
  }

  const greeting = useMemo(() => timeAwareGreeting(), [])
  const placeholder = messages.length > 0 ? 'Reply to synth.' : 'Ask synth. about your training'
  const customizationActive =
    customResolved.tone !== 'normal' ||
    customResolved.instructions.trim().length > 0 ||
    customResolved.references.length > 0

  return (
    <SwipeBackPage to="/app/athlete/home">
      <div
        className="flex h-dvh max-h-dvh flex-col overflow-hidden"
        style={{ background: SYNTH.aiCanvas, fontFamily: SYNTH.font }}
      >
        <header className="flex shrink-0 items-center gap-2 px-4 pt-[max(env(safe-area-inset-top),32px)] pb-3">
          <HeaderIconButton ariaLabel="Back" onClick={() => navigate('/app/athlete/home')}>
            <ChevronLeft size={18} strokeWidth={2.4} />
          </HeaderIconButton>
          <div
            className="flex flex-1 items-center justify-center rounded-full border px-3 py-2"
            style={{ background: SYNTH.sheet, borderColor: SYNTH.aiBorder, color: SYNTH.ink }}
          >
            <span className="text-[14px] font-semibold" style={{ fontFamily: SYNTH.font }}>
              Just me
            </span>
          </div>
          <HeaderIconButton ariaLabel="Chat history" onClick={() => setHistoryOpen(true)}>
            <Menu size={16} strokeWidth={2.2} />
          </HeaderIconButton>
          <HeaderIconButton
            ariaLabel="Customize chat"
            onClick={() => setCustomizeOpen(true)}
            badge={customizationActive}
          >
            <Sliders size={16} strokeWidth={2.2} />
          </HeaderIconButton>
        </header>

        <div className="synth-scroll flex min-h-0 flex-1 flex-col overflow-y-auto pb-2">
          <AIThread messages={messages} emptyHeadline={greeting} />
        </div>

        <SuggestionRow
          items={getActiveSuggestions(messages)}
          onSelect={(q) => send(q)}
          disabled={isStreaming}
        />

        {attachError ? (
          <div className="shrink-0 px-3 pt-1">
            <p className="rounded-2xl px-3 py-2 text-[12px]"
              style={{ background: SYNTH.aiCard, border: `1px solid ${SYNTH.aiBorder}`, color: SYNTH.ink, fontFamily: SYNTH.font }}>
              {attachError}
            </p>
          </div>
        ) : null}

        {isDemo && demoDate === todayUtc && demoCount > 0 ? (
          <div className="shrink-0 px-3 pt-1">
            <p className="text-center text-[11px]" style={{ color: SYNTH.aiTextMuted, fontFamily: SYNTH.font }}>
              {demoOverLimit
                ? `Demo daily limit reached (${DEMO_DAILY_AI_LIMIT}). Sign up for unlimited.`
                : `Demo: ${demoCount} of ${DEMO_DAILY_AI_LIMIT} messages today`}
            </p>
          </div>
        ) : null}

        <div className="shrink-0 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
          <AIComposer
            value={text}
            onChange={setText}
            onSubmit={() => send()}
            onStop={stopStreaming}
            onAttach={() => setAddOpen(true)}
            onOpenVoice={() => setVoiceOpen(true)}
            attachment={attachment}
            onClearAttachment={() => setAttachment(null)}
            isStreaming={isStreaming}
            placeholder={placeholder}
          />
        </div>

        <AddToChatSheet
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onPickFiles={onPickFiles}
          onOpenVoice={() => setVoiceOpen(true)}
          scopeOptions={scopeOptions}
          scopeId={me.id}
          onScopeChange={() => { /* athletes scoped to themselves */ }}
          style={style}
          onStyleChange={setStyle}
        />

        <AuroraVoiceOverlay
          open={voiceOpen}
          onClose={() => setVoiceOpen(false)}
          onSave={(transcript) => {
            setText((current) => (current ? `${current.trimEnd()} ${transcript}` : transcript))
            setVoiceOpen(false)
          }}
          scopeLabel={`Just ${me.name.split(' ')[0]}`}
        />

        <CustomizeChatSheet
          open={customizeOpen}
          onClose={() => setCustomizeOpen(false)}
          value={customResolved}
          onChange={(next) => setForScope(customScopeId, next)}
          scopeLabel={`Just ${me.name.split(' ')[0]}`}
        />

        <ChatHistorySheet
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          entries={history}
          activeId={activeChatId}
          onPick={onPickHistoryEntry}
          onPin={onPin}
          onRename={onRename}
          onDelete={onDelete}
          onNew={startNewChat}
        />
      </div>
    </SwipeBackPage>
  )
}

function HeaderIconButton({
  ariaLabel, onClick, badge, children,
}: {
  ariaLabel: string; onClick: () => void; badge?: boolean; children: React.ReactNode
}) {
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel}
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
      style={{ background: SYNTH.sheet, border: `1px solid ${SYNTH.aiBorder}`, color: SYNTH.ink }}>
      {children}
      {badge ? (
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full"
          style={{ background: SYNTH.accentEmerald, border: `1.5px solid ${SYNTH.sheet}` }} />
      ) : null}
    </button>
  )
}
```

---

## 2. The response engine (Part A) — the mock/canned generator

This is the deterministic reply builder inside `AIPage.tsx`. It pattern-matches the prompt and returns a `ChatPart[]`. **These are "their responses"** — what synth says in UI-first/demo mode, including the data viz.

```tsx
const TONE_PREFIX: Record<ChatCustomization['tone'], string> = {
  normal: '',
  coach: 'Coach mode — ',
  raceday: 'Race-day prep — ',
  recovery: 'Recovery focus — ',
}

function mockSelfResponse(
  me: typeof APP_MOCK_ATHLETES[number],
  prompt: string,
  style: StyleKey,
  custom: ChatCustomization,
): ChatPart[] {
  const today = new Date().toISOString().slice(0, 10)
  const tonePrefix = TONE_PREFIX[custom.tone]
  const lower = prompt.toLowerCase()

  // RAW PROVENANCE STYLE — numbers + a single citation, minimal prose.
  if (style === 'raw') {
    return [
      { kind: 'text', text: `${tonePrefix}Best 2K ${fmtErgTime(me.twoKBestSeconds)} · 30d avg ${fmtErgTime(me.twoKAvg30dSeconds)} · recovery ${me.recoveryScore} · streak ${me.streakDays}d · weekly ${(me.weeklyVolumeMeters / 1000).toFixed(0)}km. ` },
      { kind: 'chip', source: me.primarySource, subject: me.name, date: today },
    ]
  }

  // SPLIT / 2K / PACE / ERG — narrative + line chart + callout + follow-up.
  if (/split|2k|erg|pace|time/.test(lower)) {
    const points: ChartPoint[] = buildErgHistory(me.id)
      .slice(-14)
      .map((p) => ({ label: p.date, value: p.seconds }))
    return [
      { kind: 'text', text: `${tonePrefix}Your 2K trend over the last 14 days. ` },
      {
        kind: 'chart',
        title: '2K time · last 14 days',
        data: points,
        yFormatter: (v) => fmtErgTime(v),
        accent: SYNTH.accentEmerald,
        provenance: 'Concept2 · 14 days · synced 4m ago',
      },
      { kind: 'text', text: `30-day average ${fmtErgTime(me.twoKAvg30dSeconds)}, best ${fmtErgTime(me.twoKBestSeconds)} ` },
      { kind: 'chip', source: me.primarySource, subject: me.name, date: today },
      { kind: 'text', text: `. ` },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Pattern',
        text: 'Faster days follow nights with 7+ hours of sleep. Worth pairing pacing work with bedtime targets.',
      },
      { kind: 'text', text: `Want me to break down where you're losing seconds — pacing strategy or stroke rate?` },
    ]
  }

  // RECOVERY / SLEEP / HRV / WELLNESS — chip + heart illustration + success callout.
  if (/recover|sleep|hrv|wellness/.test(lower)) {
    return [
      { kind: 'text', text: `${tonePrefix}Recovery is sitting at ${me.recoveryScore} ` },
      { kind: 'chip', source: 'WHOOP', subject: me.name, date: today },
      { kind: 'text', text: `, on a ${me.streakDays}-day check-in streak. ` },
      { kind: 'illustration', glyph: 'heart', caption: `Recovery · ${me.recoveryScore}` },
      {
        kind: 'callout',
        tone: 'success',
        title: 'Strong block',
        text: 'Sleep average up 0.6h vs last week. HRV trending up. Keep the bedtime routine going.',
      },
    ]
  }

  // RACE / REGATTA — trophy illustration + taper advice + chip.
  if (/race|cup|heat|regatta/.test(lower)) {
    return [
      { kind: 'illustration', glyph: 'trophy', caption: 'Pacific Cup heat · 9 days out' },
      { kind: 'text', text: `${tonePrefix}You're 9 days out. Plan your taper around your pattern: longer Z2 work this week, sharpening at race pace next week. ` },
      { kind: 'chip', source: 'TrainingPeaks', subject: me.name, date: today },
      { kind: 'text', text: `Want a day-by-day breakdown?` },
    ]
  }

  // DEFAULT — recovery + volume summary with a follow-up offer.
  return [
    { kind: 'text', text: `${tonePrefix}You're recovered at ${me.recoveryScore} today, on a ${me.streakDays}-day streak ` },
    { kind: 'chip', source: 'WHOOP', subject: me.name, date: today },
    { kind: 'text', text: `. Weekly volume is ${(me.weeklyVolumeMeters / 1000).toFixed(0)}km — solid block. Want a session-by-session breakdown, or a recovery view?` },
  ]
}
```

---

## 3. The response engine (Part B) — live Claude streaming + the system prompt

### `src/features/app/lib/aiClient.ts`

This adapter streams from Claude (via a Supabase Edge Function proxy or a dev direct key) and **builds the system prompt that makes Claude emit structured tokens**. The prompt is the heart of how data gets rendered in live mode.

```ts
import { streamClaudeMessages, selectModel, type ContentBlock } from '../../../lib/ai/claude'
import { isClaudeConfigured } from '../../../lib/ai/env'
import { isDirectKeyConfigured, streamDirectMessages } from '../../../lib/ai/directClient'

export type AIClientMode = 'live' | 'mock'

/**
 * `live` when either VITE_ANTHROPIC_API_KEY is set (dev) OR Supabase is
 * configured (the claude-chat Edge Function path). Otherwise `mock`.
 * (The opts param is ignored — kept for backwards compat.)
 */
export function getAIClientMode(_opts?: { isDemo?: boolean }): AIClientMode {
  void _opts
  if (isDirectKeyConfigured()) return 'live'
  if (!isClaudeConfigured()) return 'mock'
  return 'live'
}

export type AIRole = 'user' | 'assistant'
export type AIMessage = { role: AIRole; content: string | ContentBlock[] }

export type StreamEvent =
  | { kind: 'delta'; text: string }
  | { kind: 'done' }
  | { kind: 'error'; message: string }

type StreamArgs = {
  systemPrompt: string
  messages: AIMessage[]
  onEvent: (e: StreamEvent) => void
  signal?: AbortSignal
  model?: string
  maxTokens?: number
}

/** Streams a Claude completion as text deltas. */
export async function streamCompletion({
  systemPrompt, messages, onEvent, signal, model,
}: StreamArgs): Promise<void> {
  let cancelled = signal?.aborted ?? false
  const onAbort = () => { cancelled = true }
  signal?.addEventListener('abort', onAbort)

  // selectModel reads the last user prompt to choose a tier; pull a string
  // out of either content shape so the heuristic works with images too.
  const lastContent = messages[messages.length - 1]?.content ?? ''
  const lastUser =
    typeof lastContent === 'string'
      ? lastContent
      : lastContent
          .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
          .map((b) => b.text)
          .join(' ')
  const chosenModel = model ?? selectModel(lastUser, systemPrompt)

  let prev = ''
  const apiMessages = messages.map((m) => ({ role: m.role, content: m.content }))
  const onDelta = (full: string) => {
    if (cancelled) return
    const delta = full.slice(prev.length)
    prev = full
    if (delta) onEvent({ kind: 'delta', text: delta })
  }

  try {
    if (isDirectKeyConfigured()) {
      await streamDirectMessages({ system: systemPrompt, model: chosenModel, messages: apiMessages, onTextDelta: onDelta })
    } else {
      await streamClaudeMessages({ system: systemPrompt, model: chosenModel, messages: apiMessages, onTextDelta: onDelta })
    }
    if (!cancelled) onEvent({ kind: 'done' })
  } catch (err) {
    if (cancelled) { onEvent({ kind: 'done' }); return }
    onEvent({ kind: 'error', message: err instanceof Error ? err.message : 'AI request failed.' })
  } finally {
    signal?.removeEventListener('abort', onAbort)
  }
}

// ── System prompt builder ──

type Customization = {
  instructions: string
  tone: 'normal' | 'coach' | 'raceday' | 'recovery'
  references: { name: string; ext: string }[]
  alwaysPlans: boolean
  alwaysWellness: boolean
  neverPrivateNotes: boolean
}

const TONE_GUIDANCE: Record<Customization['tone'], string> = {
  normal: 'Balanced narrative with citations. Lead with the metric, end with a follow-up question.',
  coach: 'Practical and action-first. Give the coach what to DO, not just what is. Short paragraphs.',
  raceday: 'Tight, high-signal, no fluff. Numbers + recommended action only. Race-day mindset.',
  recovery: 'Lean into sleep, load, readiness. Emphasize the WHY behind recovery patterns.',
}

export function buildSystemPrompt({
  scope, scopeLabel, scopeData, customization, hasImage = false,
}: {
  scope: 'team' | 'athlete' | 'self'
  scopeLabel: string
  scopeData: Record<string, unknown>
  customization: Customization
  hasImage?: boolean
}): string {
  const lines: string[] = [
    'You are synth, an AI assistant for a rowing coach/athlete data platform.',
    'You answer from the data the user has connected. Never invent metrics.',
    `Current scope: ${scopeLabel} (${scope}).`,
    `Scope data:\n${JSON.stringify(scopeData, null, 2)}`,
    '',
    'WRITING RULES (apply to every response):',
    '- Plain words. No corporate jargon. Banned phrases: "leverage", "synergy", "deep dive", "unlock", "circle back", "at the end of the day", "moving forward".',
    '- Never use em-dashes (—) or en-dashes (–). Use a comma, period, colon, or simple hyphen (-) instead. This rule has no exceptions.',
    '- Short sentences. Aim for 12-18 words each.',
    '- Prose budget: AT MOST 2 short sentences between any two structured blocks (chart / table / callout / illustration / chip). The visual blocks carry the response, not the paragraphs.',
    '- Lead with a 1-line headline (≤14 words) before the first block. Bold the key number with **markdown bold**.',
    '',
    'CONVERSATION RULES:',
    '- For greetings or chit-chat ("hi", "thanks", "ok", "cool", "thx", "got it"), respond conversationally in 1-2 short sentences. NO citations, NO charts, NO tables, NO callouts, NO illustrations, NO suggestion chips. Just chat.',
    '- For ANY question that touches data (status, trends, comparison, why, who, what, when, recovery, splits, lineups, race plan, sleep, training load, attention list, flagged): you MUST emit a structured response. Generic prose answers are forbidden for data questions.',
    '',
    'STRUCTURED OUTPUT — REQUIRED for data questions:',
    'Every data answer must include the right blocks for the scenario. Pick from these tokens — they render as interactive UI, not literal text. The user sees graphs, tables, callouts, illustrations, citation chips, and tappable follow-up chips, NOT the raw token syntax.',
    '',
    '  [c:source|subject|date]                      citation chip (e.g. [c:WHOOP|Olivia Roth|2026-05-05])',
    '  [chart:title|source|metric|window]           time-series graph (e.g. [chart:Avg recovery, 7d|WHOOP|recovery|7d])',
    '  [table:title|col1,col2,col3|r1a,r1b,r1c|r2a,r2b,r2c]   data table (header row first, then rows)',
    '  [callout:tone|title|text]                    boxed insight, tone is one of info | warn | success',
    '  [illustration:glyph|caption]                 visual cue, glyph is one of boat | erg | trophy | heart | stopwatch',
    '  [suggest:Q1|Q2|Q3]                           1-3 tappable follow-up questions (max 80 chars each), end of message only',
    '',
    'Required block recipe by scenario (pick the matching one and follow the template literally):',
    '',
    '  • TEAM STATUS / "how is the team / today / this week":',
    '      1 short headline sentence with the active count.',
    '      [chart:Avg recovery, 7d|WHOOP|recovery|7d]',
    '      [table:Athletes to watch|Athlete,Signal,Source|<3 rows>]',
    '      [callout:warn|<top concern title>|<one-line cause>]   if there is a concern',
    '      [callout:success|<bright spot title>|<one line>]      if there is a clear win',
    '      One citation chip on the most important number.',
    '      [suggest:Q1|Q2|Q3]',
    '',
    '  • ATHLETE DEEP-DIVE / "how is X / what\'s wrong with X / show X\'s splits":',
    '      1 headline sentence ("**Olivia\'s 2K** has slipped 6.4s in 4 weeks.").',
    '      [chart:2K time, 14d|Concept2|split|14d]   pick the metric they asked about',
    '      [callout:warn|Likely cause|<one line tying data points together>]',
    '      One citation chip [c:source|athlete|date].',
    '      [suggest:Q1|Q2|Q3]',
    '',
    '  • COMPARISON / "compare 1V vs 2V / olivia vs ella":',
    '      1 headline sentence naming the winner.',
    '      [table:<title>|<col_csv>|<row1_csv>|<row2_csv>...]   table is required for comparisons',
    '      Optional [chart:...] if both have a shared trend.',
    '      [suggest:Q1|Q2|Q3]',
    '',
    '  • WELLNESS / RECOVERY / SLEEP:',
    '      1 headline sentence with current value.',
    '      [chart:Recovery, 7d|WHOOP|recovery|7d]',
    '      [callout:info|Pattern|<one line on what drives the trend>]',
    '      [suggest:Q1|Q2|Q3]',
    '',
    '  • RACE DAY / WIN / MOTIVATIONAL:',
    '      [illustration:trophy|<caption>] (or boat / heart depending on tone)',
    '      1-2 short sentences.',
    '      [suggest:Q1|Q2|Q3]',
    '',
    '  • LINEUP / BOAT / SEAT:',
    '      [illustration:boat|<boat name + published time>]',
    '      [table:<lineup title>|Seat,Athlete,Side|<rows>]',
    '      [suggest:Q1|Q2|Q3]',
    '',
    'Block usage rules:',
    '- Tokens render as UI — never wrap them in code fences or quotes.',
    '- Citations: at most TWO chips per response, attached to the most important numbers. Never on every sentence.',
    '- After [suggest:...], do not write a follow-up question in prose. Chips replace that question.',
    '- Skip blocks that don\'t fit. A pure "hi" gets zero blocks; a team status gets all of chart + table + callout + chip + suggest.',
    '',
    `Tone: ${TONE_GUIDANCE[customization.tone]}`,
  ]

  if (hasImage) {
    lines.push(
      '',
      'IMAGE ATTACHED — special handling for this message:',
      '1. In ONE short sentence, say what you see in the image. No more than 18 words. No bullet list, no markdown headers.',
      '2. Then add this exact disclaimer once, on its own short line: "synth can\'t auto-tag images yet, that\'s coming soon."',
      '3. Then ask 1-3 clarifying questions ONLY via [suggest:Q1|Q2|Q3] so the coach can tap to send. Pick questions that pin down WHAT they want analysed (e.g. catch position, finish, blade depth, comparison to a prior session, technique vs. force, who they\'re comparing against). Each item max 80 characters, each one a complete sentence ending in "?".',
      '4. Do not ask the same question in prose AND in a chip. Chips replace inline questions on this turn.',
      '5. Do not add citations, charts, tables, or illustrations to this message. Keep it minimal until the coach picks a follow-up.',
    )
  }

  if (customization.instructions.trim()) {
    lines.push('', `Coach's custom instructions:\n${customization.instructions.trim()}`)
  }

  if (customization.references.length > 0) {
    const refs = customization.references.map((r) => `- ${r.name} (${r.ext})`).join('\n')
    lines.push('', `Reference materials uploaded by the coach:\n${refs}`)
    lines.push('Treat these references as authoritative context for any answer that touches them.')
  }

  const alwaysList: string[] = []
  if (customization.alwaysPlans) alwaysList.push('Race plans + lineups')
  if (customization.alwaysWellness) alwaysList.push('Wellness check-ins')
  if (alwaysList.length > 0) {
    lines.push('', `Always reference when relevant: ${alwaysList.join(', ')}.`)
  }

  if (customization.neverPrivateNotes) {
    lines.push('Never reference: private coach notes (notes flagged as Private).')
  }

  return lines.join('\n')
}
```

> **Live-mode infra dependencies** (not reproduced in full — they're server/proxy plumbing): `src/lib/ai/claude.ts` exports `streamClaudeMessages`, `selectModel`, `buildUserContent`, `parseImageDataUrl`, `type ContentBlock`. `src/lib/ai/env.ts` exports `isClaudeConfigured`. `src/lib/ai/directClient.ts` exports `isDirectKeyConfigured`, `streamDirectMessages`. If you're building UI-first you only need `mock` mode and can stub `getAIClientMode` to always return `'mock'`.

---

## 4. The response engine (Part C) — the streaming parser

### `src/features/app/lib/aiResponseParser.ts`

Turns Claude's accumulated text (with structured tokens) into `ChatPart[]`. Pure + idempotent, safe to re-run on every delta.

```ts
import type { ChartPoint, ChatPart } from '../primitives/AIChat'

// ─── Public API ───
export function parseAIText(rawText: string): ChatPart[] {
  if (!rawText) return []
  const text = sanitizeEmDashes(rawText)

  const parts: ChatPart[] = []
  let cursor = 0
  let buffer = ''

  while (cursor < text.length) {
    const tokenStart = text.indexOf('[', cursor)
    if (tokenStart === -1) {
      buffer += text.slice(cursor)
      break
    }
    buffer += text.slice(cursor, tokenStart)

    const tokenEnd = text.indexOf(']', tokenStart)
    if (tokenEnd === -1) {
      // Unclosed token at the tail. Hide known structured tokens mid-stream
      // (so users never see literal `[table:...` flicker); keep stray
      // brackets as literal text.
      const partialContent = text.slice(tokenStart + 1)
      if (
        partialContent.startsWith('c:') ||
        partialContent.startsWith('chart:') ||
        partialContent.startsWith('table:') ||
        partialContent.startsWith('illustration:') ||
        partialContent.startsWith('callout:') ||
        partialContent.startsWith('suggest:')
      ) {
        cursor = text.length
        break
      }
      buffer += text.slice(tokenStart)
      cursor = text.length
      break
    }

    const tokenContent = text.slice(tokenStart + 1, tokenEnd)
    const parsed = tryParseToken(tokenContent)

    if (parsed) {
      if (buffer.length > 0) { parts.push({ kind: 'text', text: buffer }); buffer = '' }
      parts.push(parsed)
      cursor = tokenEnd + 1
    } else {
      buffer += text.slice(tokenStart, tokenEnd + 1)
      cursor = tokenEnd + 1
    }
  }

  if (buffer.length > 0) parts.push({ kind: 'text', text: buffer })
  return parts
}

// ─── Em-dash sanitiser (AG-locked: no em/en-dashes in responses) ───
export function sanitizeEmDashes(text: string): string {
  return text.replace(/\s*[—–]\s*/g, ', ')
}

// ─── Token dispatcher ───
function tryParseToken(content: string): ChatPart | null {
  if (content.startsWith('c:')) return parseChip(content.slice(2))
  if (content.startsWith('chart:')) return parseChart(content.slice(6))
  if (content.startsWith('table:')) return parseTable(content.slice(6))
  if (content.startsWith('illustration:')) return parseIllustration(content.slice(13))
  if (content.startsWith('callout:')) return parseCallout(content.slice(8))
  if (content.startsWith('suggest:')) return parseSuggestions(content.slice(8))
  return null
}

// ─── Per-token parsers ───
function parseChip(payload: string): ChatPart | null {
  const parts = payload.split('|').map((s) => s.trim())
  if (parts.length !== 3) return null
  const [source, subject, date] = parts
  if (!source || !subject || !date) return null
  return { kind: 'chip', source, subject, date }
}

function parseChart(payload: string): ChatPart | null {
  const parts = payload.split('|').map((s) => s.trim())
  if (parts.length !== 4) return null
  const [title, source, metric, window] = parts
  if (!title || !metric) return null
  return {
    kind: 'chart',
    title,
    data: synthChartData(metric, window),
    provenance: source ? `${source}, ${window}, demo data` : undefined,
  }
}

function parseTable(payload: string): ChatPart | null {
  // Format: title|header_csv|row1_csv|row2_csv|...
  const segments = payload.split('|').map((s) => s.trim())
  if (segments.length < 2) return null
  const [title, headerCsv, ...rowCsvs] = segments
  if (!headerCsv) return null
  const columns = splitCsv(headerCsv)
  if (columns.length === 0) return null
  const rows = rowCsvs
    .filter((r) => r.length > 0)
    .map((r) => splitCsv(r))
    .map((row) =>
      row.length < columns.length
        ? [...row, ...Array(columns.length - row.length).fill('')]
        : row.slice(0, columns.length),
    )
  return { kind: 'table', title, columns, rows }
}

function parseSuggestions(payload: string): ChatPart | null {
  const items = payload
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length <= 120)
    .slice(0, 5)
  if (items.length === 0) return null
  return { kind: 'suggestions', items }
}

function parseCallout(payload: string): ChatPart | null {
  // Format: tone|title|text — split only on the first two pipes.
  const firstPipe = payload.indexOf('|')
  if (firstPipe === -1) return null
  const tone = payload.slice(0, firstPipe).trim()
  if (tone !== 'info' && tone !== 'warn' && tone !== 'success') return null

  const rest = payload.slice(firstPipe + 1)
  const secondPipe = rest.indexOf('|')
  let title: string | undefined
  let text: string
  if (secondPipe === -1) { title = undefined; text = rest.trim() }
  else { title = rest.slice(0, secondPipe).trim() || undefined; text = rest.slice(secondPipe + 1).trim() }

  if (!text && !title) return null
  return { kind: 'callout', tone, title, text: text || (title ?? '') }
}

function parseIllustration(payload: string): ChatPart | null {
  const parts = payload.split('|').map((s) => s.trim())
  if (parts.length === 0) return null
  const glyph = parts[0]
  const caption = parts[1]
  if (glyph !== 'boat' && glyph !== 'erg' && glyph !== 'trophy' && glyph !== 'heart' && glyph !== 'stopwatch') return null
  return { kind: 'illustration', glyph, caption: caption || undefined }
}

// ─── Helpers ───
function splitCsv(s: string): string[] {
  return s.split(',').map((cell) => cell.trim())
}

/** Deterministic synthetic chart data (sine-shaped). Deterministic so the
 *  chart doesn't shimmer as new streaming tokens arrive. */
function synthChartData(metric: string, window: string): ChartPoint[] {
  const days = parseDayCount(window)
  const centre = chartCentre(metric)
  const variance = chartVariance(metric)
  const points: ChartPoint[] = []
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    const label = `${date.getMonth() + 1}/${date.getDate()}`
    const wave = Math.sin((i / Math.max(1, days - 1)) * Math.PI * 1.4)
    const value = centre + wave * variance
    points.push({ label, value: Math.round(value * 10) / 10 })
  }
  return points
}

function parseDayCount(window: string): number {
  const m = window.match(/^(\d+)\s*d/i)
  if (m) return Math.max(2, Math.min(30, parseInt(m[1], 10)))
  if (/week/i.test(window)) return 7
  if (/month/i.test(window)) return 30
  return 7
}

function chartCentre(metric: string): number {
  const m = metric.toLowerCase()
  if (m.includes('recovery')) return 70
  if (m.includes('stroke_rate') || m.includes('rate')) return 30
  if (m.includes('split') || m.includes('2k')) return 110
  if (m.includes('hrv')) return 65
  if (m.includes('sleep')) return 7.5
  if (m.includes('strain')) return 14
  if (m.includes('soreness') || m.includes('energy')) return 6
  return 50
}

function chartVariance(metric: string): number {
  const m = metric.toLowerCase()
  if (m.includes('recovery')) return 8
  if (m.includes('rate')) return 2
  if (m.includes('split')) return 3
  if (m.includes('hrv')) return 10
  if (m.includes('sleep')) return 0.8
  if (m.includes('strain')) return 3
  if (m.includes('soreness') || m.includes('energy')) return 2
  return 5
}
```

---

## 5. The voice feature — `src/features/app/primitives/AuroraVoiceOverlay.tsx`

Full-screen aurora overlay using the **Web Speech API** for live transcription plus an **AudioContext analyser** driving a 12-bar equalizer. Three phases: `listening → processing → preview`. On save, the transcript is appended to the composer.

```tsx
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { SYNTH } from '../lib/theme'

type Phase = 'listening' | 'processing' | 'preview'

type Props = {
  open: boolean
  onClose: () => void
  onSave: (transcript: string) => void
  scopeLabel?: string
}

const BAR_COUNT = 12
const FALLBACK_BARS = Array.from({ length: BAR_COUNT }, () => 0.18)

// Web Speech API — types are not in the default DOM lib, so declare what we use.
type SRResult = { 0: { transcript: string } }
type SREvent = { results: ArrayLike<SRResult> }
type SRInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SREvent) => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
}
type SRConstructor = new () => SRInstance
type WindowWithSR = Window & {
  SpeechRecognition?: SRConstructor
  webkitSpeechRecognition?: SRConstructor
}

export function AuroraVoiceOverlay({ open, onClose, onSave, scopeLabel = 'your team' }: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <AuroraVoiceOverlayInner onClose={onClose} onSave={onSave} scopeLabel={scopeLabel} />
      ) : null}
    </AnimatePresence>
  )
}

function AuroraVoiceOverlayInner({
  onClose, onSave, scopeLabel,
}: {
  onClose: () => void
  onSave: (transcript: string) => void
  scopeLabel: string
}) {
  const [phase, setPhase] = useState<Phase>('listening')
  const [transcript, setTranscript] = useState('')
  const [bars, setBars] = useState<number[]>(FALLBACK_BARS)
  const recognitionRef = useRef<SRInstance | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    // 1. Speech recognition for the transcript.
    const w = window as WindowWithSR
    const Recognition = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (Recognition) {
      try {
        const rec = new Recognition()
        rec.continuous = true
        rec.interimResults = true
        rec.lang = 'en-US'
        rec.onresult = (event) => {
          const text = Array.from(event.results)
            .map((r) => r[0]?.transcript ?? '')
            .join(' ')
            .trim()
          setTranscript(text)
        }
        rec.onerror = () => { /* mic denied / network — keep going */ }
        rec.start()
        recognitionRef.current = rec
      } catch { /* Recognition unavailable */ }
    }

    // 2. getUserMedia + AudioContext analyser for the live waveform bars.
    let cancelled = false
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return }
          streamRef.current = stream
          const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          const ctx = new Ctx()
          audioCtxRef.current = ctx
          const source = ctx.createMediaStreamSource(stream)
          const analyser = ctx.createAnalyser()
          analyser.fftSize = 64
          analyser.smoothingTimeConstant = 0.78
          source.connect(analyser)

          const data = new Uint8Array(analyser.frequencyBinCount)
          const tick = () => {
            analyser.getByteFrequencyData(data)
            const next = Array.from({ length: BAR_COUNT }).map((_, i) => {
              const start = Math.floor((i / BAR_COUNT) * data.length)
              const end = Math.floor(((i + 1) / BAR_COUNT) * data.length)
              let sum = 0
              for (let j = start; j < end; j++) sum += data[j]
              const avg = sum / Math.max(1, end - start) / 255
              return Math.max(0.12, Math.min(1, avg * 1.5))
            })
            setBars(next)
            rafRef.current = requestAnimationFrame(tick)
          }
          tick()
        })
        .catch(() => { /* mic denied — keep idle bars */ })
    }

    return () => {
      cancelled = true
      try { recognitionRef.current?.stop() } catch { /* already stopped */ }
      recognitionRef.current = null
      cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      audioCtxRef.current?.close().catch(() => undefined)
      audioCtxRef.current = null
    }
  }, [])

  const handleStop = () => {
    setPhase('processing')
    try { recognitionRef.current?.stop() } catch { /* ignore */ }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    cancelAnimationFrame(rafRef.current)
    setTimeout(() => setPhase('preview'), 600)
  }

  const handleSave = () => {
    onSave(transcript || '')
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.32 }}
      className="fixed inset-0 z-50"
      style={{ background: 'rgba(8,8,40,0.92)', backdropFilter: 'blur(8px)' }}
      aria-modal role="dialog"
    >
      <Aurora />

      <button type="button" onClick={onClose} aria-label="Cancel"
        className="absolute right-5 top-[max(env(safe-area-inset-top),16px)] z-10 flex h-10 w-10 items-center justify-center rounded-full"
        style={{
          background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)',
          color: '#FFFFFF', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        }}>
        <X size={16} strokeWidth={2.4} />
      </button>

      <div className="relative flex h-full flex-col items-center justify-end pb-[max(env(safe-area-inset-bottom),24px)]">
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
          <DotMark color="#FFFFFF" />

          <motion.p
            key={transcript || phase}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}
            className="max-w-[320px] text-center text-[26px] font-bold leading-[1.25] tracking-[-0.01em]"
            style={{ color: '#FFFFFF', fontFamily: SYNTH.font }}
          >
            {phase === 'preview'
              ? (transcript || 'Nothing captured.')
              : transcript || `Hi! Tell synth about ${scopeLabel}.`}
          </motion.p>

          {phase === 'preview' ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: 'rgba(255,255,255,0.55)', fontFamily: SYNTH.font }}>
              Save or cancel?
            </p>
          ) : (
            <Waveform bars={bars} active={phase === 'listening'} />
          )}
        </div>

        <div className="flex items-center gap-5 pb-2">
          {phase === 'preview' ? (
            <>
              <button type="button" onClick={onClose} aria-label="Discard"
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)', color: '#FFFFFF' }}>
                <X size={18} strokeWidth={2.4} />
              </button>
              <motion.button type="button" onClick={handleSave} whileTap={{ scale: 0.94 }}
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: SYNTH.accentEmerald, color: '#FFFFFF', boxShadow: '0 10px 24px -8px rgba(16,185,129,0.7)' }}
                aria-label="Save">
                <Check size={22} strokeWidth={3} />
              </motion.button>
              <div className="h-12 w-12" />
            </>
          ) : (
            <motion.button type="button" onClick={handleStop} whileTap={{ scale: 0.92 }}
              className="flex h-20 w-20 items-center justify-center rounded-full"
              style={{ background: '#0A0A12', color: '#FFFFFF', boxShadow: '0 18px 32px -10px rgba(8,8,40,0.6)' }}
              aria-label="Stop recording" disabled={phase !== 'listening'}>
              <span className="block h-5 w-5 rounded-sm" style={{ background: '#FFFFFF' }} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function Aurora() {
  return (
    <>
      <motion.div aria-hidden animate={{ scale: [1, 1.08, 1], rotate: [0, 12, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(circle at 30% 75%, rgba(167,139,250,0.65), transparent 55%)', filter: 'blur(48px)' }} />
      <motion.div aria-hidden animate={{ scale: [1.05, 1, 1.05], rotate: [0, -8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(circle at 70% 60%, rgba(96,165,250,0.55), transparent 55%)', filter: 'blur(56px)' }} />
      <motion.div aria-hidden animate={{ scale: [1, 1.12, 1], rotate: [0, 6, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 90%, rgba(244,114,182,0.45), transparent 60%)', filter: 'blur(60px)' }} />
    </>
  )
}

function Waveform({ bars, active }: { bars: number[]; active: boolean }) {
  return (
    <div className="flex items-center gap-1 rounded-full px-4 py-3"
      style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      {bars.map((level, i) => (
        <motion.span key={i}
          animate={{ height: active ? 6 + level * 26 : 6 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          style={{ width: 3, background: '#FFFFFF', borderRadius: 2, opacity: active ? 0.9 : 0.4 }} />
      ))}
    </div>
  )
}

function DotMark({ color }: { color: string }) {
  const rings = [{ r: 6, count: 1 }, { r: 18, count: 8 }, { r: 30, count: 12 }]
  return (
    <motion.svg width={84} height={84} viewBox="-42 -42 84 84"
      animate={{ y: [0, -3, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} aria-hidden>
      {rings.map((ring) =>
        Array.from({ length: ring.count }).map((_, i) => {
          const angle = (i / ring.count) * Math.PI * 2
          const x = Math.cos(angle) * ring.r
          const y = Math.sin(angle) * ring.r
          return <circle key={`${ring.r}-${i}`} cx={x} cy={y} r={ring.r === 6 ? 2.4 : 1.4} fill={color} opacity={ring.r === 6 ? 1 : 0.7} />
        }),
      )}
    </motion.svg>
  )
}
```

---

## 6. Program customization

This is the "customize synth" surface — custom instructions, a tone preset, uploaded reference programs/docs, and always/never toggles. It persists **per scope** so the athlete's `self:<id>` settings never collide with a coach's `team` or `athlete:<id>` settings.

### Customization type + defaults

```ts
// In AIChat.tsx:
export type TonePreset = 'normal' | 'coach' | 'raceday' | 'recovery'

export type ChatCustomization = {
  instructions: string
  tone: TonePreset
  references: { id: string; name: string; ext: string }[]
  alwaysPlans: boolean
  alwaysWellness: boolean
  neverPrivateNotes: boolean
}

// In aiChatUtil.ts:
export const DEFAULT_CUSTOMIZATION: ChatCustomization = {
  instructions: '',
  tone: 'normal',
  references: [],
  alwaysPlans: true,
  alwaysWellness: true,
  neverPrivateNotes: false,
}

export function timeAwareGreeting(): string {
  const h = new Date().getHours()
  if (h < 5) return 'How can I help this late night?'
  if (h < 12) return 'What can I show you this morning?'
  if (h < 17) return 'What do you want to know this afternoon?'
  if (h < 22) return "What's on your mind tonight?"
  return 'How can I help this late night?'
}
```

### Per-scope persisted store — `src/features/app/store/useAIChatCustomization.ts`

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatCustomization } from '../primitives/AIChat'
import { DEFAULT_CUSTOMIZATION } from '../primitives/aiChatUtil'

/**
 * One ChatCustomization per scope, surviving reloads via localStorage.
 *   - "team"            ← coach AIPage, no athlete drilled in
 *   - "athlete:<uuid>"  ← coach AIPage drilled into one athlete
 *   - "self:<uuid>"     ← athlete AIPage (self-scoped)
 * Scopes are independent — no team→athlete inheritance.
 */
export type ChatScopeId = 'team' | `athlete:${string}` | `self:${string}`

type AIChatCustomizationState = {
  byScope: Record<string, ChatCustomization>
  getForScope: (scopeId: string) => ChatCustomization
  setForScope: (scopeId: string, value: ChatCustomization) => void
  patchForScope: (scopeId: string, patch: Partial<ChatCustomization>) => void
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
          const base = s.byScope[scopeId] ?? { ...DEFAULT_CUSTOMIZATION, references: [] }
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
      partialize: (s) => ({ byScope: s.byScope }),
    },
  ),
)
```

### The customization sheet — `CustomizeChatSheet` (from `AIChat.tsx`)

```tsx
const TONE_PRESETS: { key: TonePreset; label: string; hint: string }[] = [
  { key: 'normal', label: 'Normal', hint: 'Balanced narrative + citations' },
  { key: 'coach', label: 'Coach mode', hint: 'Practical, action-first' },
  { key: 'raceday', label: 'Race-day', hint: 'Tight, high-signal' },
  { key: 'recovery', label: 'Recovery focus', hint: 'Sleep + load + readiness' },
]

export function CustomizeChatSheet({
  open, onClose, value, onChange, scopeLabel,
}: {
  open: boolean
  onClose: () => void
  value: ChatCustomization
  onChange: (next: ChatCustomization) => void
  scopeLabel?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const onPickRefs = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const additions = Array.from(files).map((f, i) => {
      const dot = f.name.lastIndexOf('.')
      const ext = dot >= 0 ? f.name.slice(dot + 1).toUpperCase() : 'FILE'
      const name = dot >= 0 ? f.name.slice(0, dot) : f.name
      return {
        id: `r-${Date.now()}-${i}`,
        name: name.length > 24 ? `${name.slice(0, 24)}…` : name,
        ext,
      }
    })
    onChange({ ...value, references: [...value.references, ...additions] })
  }

  const removeRef = (id: string) => {
    onChange({ ...value, references: value.references.filter((r) => r.id !== id) })
  }

  return (
    <SheetShell open={open} onClose={onClose} title="Customize chat">
      {scopeLabel ? (
        <p className="-mt-1 mb-1 text-[12px]" style={{ color: SYNTH.aiTextMuted, fontFamily: SYNTH.font }}>
          Editing for <span style={{ color: SYNTH.ink, fontWeight: 600 }}>{scopeLabel}</span>
          {'. '}Other scopes keep their own settings.
        </p>
      ) : null}

      {/* Custom instructions */}
      <Group label="Custom instructions">
        <textarea
          value={value.instructions}
          onChange={(e) => onChange({ ...value, instructions: e.target.value })}
          rows={4}
          placeholder="How should synth respond? e.g. lead with the metric, keep responses under 5 lines, always suggest a follow-up question."
          className="block w-full resize-none rounded-2xl border px-3 py-3 text-[14px] outline-none"
          style={{ background: SYNTH.sheet, borderColor: SYNTH.aiBorder, color: SYNTH.ink, fontFamily: SYNTH.font, minHeight: 96 }}
        />
      </Group>

      {/* Tone preset */}
      <Group label="Tone preset">
        <div className="flex flex-wrap gap-2">
          {TONE_PRESETS.map((t) => (
            <Pill key={t.key} active={value.tone === t.key} onClick={() => onChange({ ...value, tone: t.key })}>
              {t.label}
            </Pill>
          ))}
        </div>
        <p className="text-[11px]" style={{ color: SYNTH.aiTextMuted, fontFamily: SYNTH.font }}>
          {TONE_PRESETS.find((t) => t.key === value.tone)?.hint}
        </p>
      </Group>

      {/* Reference materials (programs / docs) */}
      <Group label="Reference materials">
        <div className="flex flex-col gap-2">
          {value.references.length === 0 ? (
            <p className="rounded-2xl px-4 py-3 text-[12px]"
              style={{ background: SYNTH.aiCard, border: `1px solid ${SYNTH.aiBorder}`, color: SYNTH.aiTextMuted, fontFamily: SYNTH.font }}>
              No programs or docs uploaded yet. synth will only use connected sources.
            </p>
          ) : (
            value.references.map((r) => (
              <div key={r.id}
                className="flex items-center justify-between gap-2 rounded-2xl border px-3 py-2.5"
                style={{ background: SYNTH.aiCard, borderColor: SYNTH.aiBorder, fontFamily: SYNTH.font }}>
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                    style={{ background: SYNTH.ink, color: SYNTH.inkOnBrand }}>
                    {r.ext}
                  </span>
                  <span className="truncate text-[13px] font-medium" style={{ color: SYNTH.ink }}>{r.name}</span>
                </span>
                <button type="button" onClick={() => removeRef(r.id)} aria-label="Remove reference"
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ background: SYNTH.sheetMuted, color: SYNTH.aiTextMuted }}>
                  <X size={13} strokeWidth={2.4} />
                </button>
              </div>
            ))
          )}
          <button type="button" onClick={() => inputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-full border py-2.5 text-[13px] font-semibold"
            style={{ background: SYNTH.sheet, borderColor: SYNTH.aiBorder, color: SYNTH.ink, fontFamily: SYNTH.font }}>
            <FileUp size={14} strokeWidth={2.2} /> Upload program or doc
          </button>
          <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,image/*" multiple
            onChange={(e) => { onPickRefs(e.target.files); if (inputRef.current) inputRef.current.value = '' }}
            className="hidden" />
        </div>
      </Group>

      {/* Always reference */}
      <Group label="Always reference">
        <Toggle label="Race plans + lineups"
          hint="synth will pull current lineups and weekly plan into every answer"
          value={value.alwaysPlans} onChange={(v) => onChange({ ...value, alwaysPlans: v })} />
        <Toggle label="Wellness check-ins" hint="Sleep, soreness, stress signals"
          value={value.alwaysWellness} onChange={(v) => onChange({ ...value, alwaysWellness: v })} />
      </Group>

      {/* Never reference */}
      <Group label="Never reference">
        <Toggle label="Private coach notes" hint="Notes flagged Private stay out of every chat"
          value={value.neverPrivateNotes} onChange={(v) => onChange({ ...value, neverPrivateNotes: v })} />
      </Group>
    </SheetShell>
  )
}
```

How customization flows into responses:
- **Mock mode** — `TONE_PREFIX[custom.tone]` prepends a label like `"Race-day prep — "` to the first text part.
- **Live mode** — `buildSystemPrompt` injects `TONE_GUIDANCE[tone]`, the custom `instructions`, the `references` list, and the always/never toggles into the system prompt (see §3).

---

## 7. Message rendering — `src/features/app/primitives/AIChat.tsx`

This is the big module: all the `ChatPart` types, the thread renderer, every block renderer, the thinking glyph, citation chip, composer, suggestion row, attach sheet, and history sheet. (The `CustomizeChatSheet` shown above also lives here.)

### Types + thinking glyph + citation chip

```tsx
export type ChartPoint = { label: string; value: number }

export type ChatPart =
  | { kind: 'text'; text: string }
  | { kind: 'chip'; source: string; subject: string; date: string }
  | { kind: 'chart'; title: string; data: ChartPoint[]; yFormatter?: (v: number) => string; accent?: string; provenance?: string }
  | { kind: 'callout'; tone: 'info' | 'warn' | 'success'; title?: string; text: string }
  | { kind: 'bulletList'; items: { label: string; sub?: string; severity?: 'high' | 'med' | 'low' }[] }
  | { kind: 'illustration'; glyph: 'boat' | 'erg' | 'trophy' | 'heart' | 'stopwatch'; caption?: string }
  | { kind: 'table'; title: string; columns: string[]; rows: string[][]; provenance?: string }
  | { kind: 'suggestions'; items: string[] }

export type ChatAttachment = {
  name: string
  ext: string
  mediaType?: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
  dataUrl?: string
}

export type ChatMessage =
  | { id: string; role: 'user'; text: string; ts: number; attachment?: ChatAttachment }
  | { id: string; role: 'ai'; parts: ChatPart[]; ts: number }
  | { id: string; role: 'thinking' }

// Concentric-dots glyph used as both the thinking spinner and the AI avatar.
export function SynthGlyph({
  size = 28, rotating = false, color = SYNTH.accentEmerald,
}: { size?: number; rotating?: boolean; color?: string }) {
  const rings = [
    { r: 0, count: 1, dot: 3 },
    { r: 8, count: 8, dot: 1.4 },
    { r: 14, count: 12, dot: 1.4 },
  ]
  const half = size / 2
  return (
    <motion.svg width={size} height={size} viewBox={`-${half} -${half} ${size} ${size}`}
      animate={rotating ? { rotate: 360 } : { rotate: 0 }}
      transition={rotating ? { duration: 1.6, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
      aria-hidden>
      {rings.map((ring) =>
        Array.from({ length: ring.count }).map((_, i) => {
          const angle = (i / ring.count) * Math.PI * 2
          const x = Math.cos(angle) * ring.r
          const y = Math.sin(angle) * ring.r
          return <circle key={`${ring.r}-${i}`} cx={x} cy={y} r={ring.dot} fill={color} opacity={ring.r === 0 ? 1 : 0.7} />
        }),
      )}
    </motion.svg>
  )
}

export function CitationChip({ source, subject, date }: { source: string; subject: string; date: string }) {
  return (
    <span className="mx-0.5 inline-flex items-baseline gap-1 rounded-full border px-2 py-0.5 text-[11px]"
      style={{
        background: SYNTH.aiCard, borderColor: SYNTH.aiBorder, color: SYNTH.aiTextMuted,
        fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums', fontWeight: 500, verticalAlign: 'baseline',
      }}>
      <span className="font-semibold" style={{ color: SYNTH.ink }}>{source}</span>
      <span aria-hidden>·</span>
      <span>{subject}</span>
      <span aria-hidden>·</span>
      <span>{date}</span>
    </span>
  )
}
```

### Block renderers (chart / callout / bulletList / table / illustration)

```tsx
function ChartBlock({ part }: { part: Extract<ChatPart, { kind: 'chart' }> }) {
  const accent = part.accent ?? SYNTH.accentEmerald
  return (
    <div className="my-2 rounded-2xl border p-3" style={{ background: SYNTH.aiCard, borderColor: SYNTH.aiBorder, fontFamily: SYNTH.font }}>
      <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.aiTextMuted }}>
        {part.title}
      </p>
      <div className="mt-2 h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={part.data} margin={{ top: 8, right: 8, bottom: 8, left: -8 }}>
            <XAxis dataKey="label" tick={{ fill: SYNTH.aiTextMuted, fontSize: 10, fontFamily: SYNTH.font }}
              tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: SYNTH.aiTextMuted, fontSize: 10, fontFamily: SYNTH.font }}
              tickLine={false} axisLine={false} width={36}
              tickFormatter={(v) => (part.yFormatter ? part.yFormatter(v as number) : String(v))} />
            <Tooltip contentStyle={{ background: SYNTH.sheet, border: `1px solid ${SYNTH.aiBorder}`, borderRadius: 12, color: SYNTH.ink, fontFamily: SYNTH.font, fontSize: 12 }}
              formatter={(v: number) => (part.yFormatter ? part.yFormatter(v) : v)} />
            <Line type="monotone" dataKey="value" stroke={accent} strokeWidth={2.4}
              dot={{ r: 2.5, fill: accent }} activeDot={{ r: 4, fill: accent }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {part.provenance ? (
        <p className="mt-2 px-1 text-[10px] uppercase tracking-[0.12em]" style={{ color: SYNTH.aiTextMuted, fontVariantNumeric: 'tabular-nums' }}>
          {part.provenance}
        </p>
      ) : null}
    </div>
  )
}

function CalloutBlock({ part }: { part: Extract<ChatPart, { kind: 'callout' }> }) {
  const tone = {
    info: { color: SYNTH.canvasTop, icon: <Info size={14} strokeWidth={2.4} /> },
    warn: { color: SYNTH.accentAmber, icon: <AlertTriangle size={14} strokeWidth={2.4} /> },
    success: { color: SYNTH.accentEmerald, icon: <Check size={14} strokeWidth={2.6} /> },
  }[part.tone]
  return (
    <div className="my-2 rounded-2xl border p-3"
      style={{ background: SYNTH.aiCard, borderColor: SYNTH.aiBorder, borderLeft: `3px solid ${tone.color}`, fontFamily: SYNTH.font }}>
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: `${tone.color}22`, color: tone.color }}>
          {tone.icon}
        </span>
        <div className="min-w-0 flex-1">
          {part.title ? <p className="text-[12px] font-semibold leading-tight" style={{ color: SYNTH.ink }}>{part.title}</p> : null}
          <p className={`text-[13px] leading-snug ${part.title ? 'mt-0.5' : ''}`} style={{ color: SYNTH.ink }}>{part.text}</p>
        </div>
      </div>
    </div>
  )
}

function BulletListBlock({ part }: { part: Extract<ChatPart, { kind: 'bulletList' }> }) {
  const sevColor = { high: SYNTH.accentRed, med: SYNTH.accentAmber, low: SYNTH.accentEmerald }
  return (
    <ul className="my-2 flex flex-col gap-1.5" style={{ fontFamily: SYNTH.font }}>
      {part.items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: item.severity ? sevColor[item.severity] : SYNTH.aiTextMuted }} />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] leading-snug" style={{ color: SYNTH.ink }}>{item.label}</p>
            {item.sub ? <p className="mt-0.5 text-[11px]" style={{ color: SYNTH.aiTextMuted }}>{item.sub}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  )
}

function TableBlock({ part }: { part: Extract<ChatPart, { kind: 'table' }> }) {
  return (
    <div className="my-2 overflow-hidden rounded-2xl border" style={{ background: SYNTH.aiCard, borderColor: SYNTH.aiBorder, fontFamily: SYNTH.font }}>
      <p className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.aiTextMuted, borderBottom: `1px solid ${SYNTH.aiBorder}` }}>
        {part.title}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]" style={{ color: SYNTH.ink, fontVariantNumeric: 'tabular-nums' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${SYNTH.aiBorder}` }}>
              {part.columns.map((col, i) => (
                <th key={i} className="px-3 py-2 text-left font-semibold" style={{ color: SYNTH.aiTextMuted }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {part.rows.length === 0 ? (
              <tr><td colSpan={part.columns.length} className="px-3 py-3 text-center" style={{ color: SYNTH.aiTextMuted }}>No rows</td></tr>
            ) : (
              part.rows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? 'transparent' : SYNTH.aiBubble }}>
                  {row.map((cell, ci) => <td key={ci} className="px-3 py-2">{cell}</td>)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {part.provenance ? (
        <p className="px-4 py-2 text-[10px]" style={{ color: SYNTH.aiTextMuted, borderTop: `1px solid ${SYNTH.aiBorder}` }}>{part.provenance}</p>
      ) : null}
    </div>
  )
}

function IllustrationBlock({ part }: { part: Extract<ChatPart, { kind: 'illustration' }> }) {
  const icon = {
    boat: <BoatGlyph />, erg: <ErgGlyph />,
    trophy: <Trophy size={36} strokeWidth={1.8} />, heart: <Heart size={36} strokeWidth={1.8} />,
    stopwatch: <Timer size={36} strokeWidth={1.8} />,
  }[part.glyph]
  return (
    <div className="my-2 flex flex-col items-center gap-2 rounded-2xl border px-4 py-5"
      style={{ background: SYNTH.aiCard, borderColor: SYNTH.aiBorder, color: SYNTH.ink, fontFamily: SYNTH.font }}>
      <span style={{ color: SYNTH.accentEmerald }}>{icon}</span>
      {part.caption ? <p className="text-center text-[11px] uppercase tracking-[0.14em]" style={{ color: SYNTH.aiTextMuted }}>{part.caption}</p> : null}
    </div>
  )
}

function BoatGlyph() {
  return (
    <svg width={120} height={36} viewBox="0 0 120 36" fill="none" aria-hidden>
      <path d="M 4,18 Q 0,8 12,6 L 100,6 Q 115,8 116,18 Q 115,28 100,30 L 12,30 Q 0,28 4,18 Z" stroke={SYNTH.accentEmerald} strokeWidth={1.6} />
      {[20, 36, 52, 68, 84, 100].map((x) => <circle key={x} cx={x} cy={18} r={2.4} fill={SYNTH.accentEmerald} />)}
      <line x1={20} y1={4} x2={20} y2={32} stroke={SYNTH.accentEmerald} strokeWidth={1} opacity={0.4} />
    </svg>
  )
}

function ErgGlyph() {
  return (
    <svg width={48} height={36} viewBox="0 0 48 36" fill="none" aria-hidden>
      <circle cx={12} cy={18} r={9} stroke={SYNTH.accentEmerald} strokeWidth={1.6} />
      <circle cx={12} cy={18} r={3} fill={SYNTH.accentEmerald} />
      <path d="M21 18 H40 L36 26" stroke={SYNTH.accentEmerald} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 9 l4 4" stroke={SYNTH.accentEmerald} strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  )
}
```

### Thread + message rows + part grouping + suggestions helper

```tsx
export function AIThread({ messages, emptyHeadline }: { messages: ChatMessage[]; emptyHeadline: string }) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 pb-16 pt-12">
        <SynthGlyph size={36} />
        <h2 className="max-w-[300px] text-center text-[24px] font-semibold leading-[1.25] tracking-[-0.01em]"
          style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}>
          {emptyHeadline}
        </h2>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-5 px-5 py-4">
      {messages.map((m) => <MessageRow key={m.id} message={m} />)}
      <div ref={endRef} />
    </div>
  )
}

function MessageRow({ message }: { message: ChatMessage }) {
  if (message.role === 'thinking') {
    return (
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex">
        <SynthGlyph size={24} rotating />
      </motion.div>
    )
  }

  if (message.role === 'user') {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="flex justify-end">
        <div className="flex max-w-[80%] flex-col items-end gap-2">
          {message.attachment ? (
            message.attachment.dataUrl ? (
              <img src={message.attachment.dataUrl} alt={message.attachment.name} className="max-w-[240px] rounded-2xl"
                style={{ border: `1px solid ${SYNTH.aiBorder}`, background: SYNTH.aiCard }} />
            ) : (
              <div className="flex items-center gap-2 rounded-2xl px-3 py-2"
                style={{ background: SYNTH.aiCard, border: `1px solid ${SYNTH.aiBorder}`, fontFamily: SYNTH.font }}>
                <span className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{ background: SYNTH.ink, color: SYNTH.inkOnBrand }}>{message.attachment.ext}</span>
                <span className="text-[12px] font-medium" style={{ color: SYNTH.ink }}>{message.attachment.name}</span>
              </div>
            )
          ) : null}
          {message.text ? (
            <div className="rounded-[18px] px-4 py-2.5 text-[15px] leading-[1.4]"
              style={{ background: SYNTH.aiBubble, color: SYNTH.ink, fontFamily: SYNTH.font, borderRadius: '18px 18px 4px 18px' }}>
              {message.text}
            </div>
          ) : null}
        </div>
      </motion.div>
    )
  }

  // ai response — group inline parts (text+chip) into paragraphs; blocks render standalone.
  const groups = groupParts(message.parts)
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} className="flex flex-col gap-2">
      <SynthGlyph size={20} />
      {groups.map((g, i) => {
        if (g.kind === 'inline') {
          return (
            <p key={i} className="max-w-full text-[15px] leading-[1.55]" style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}>
              {g.parts.map((p, pi) =>
                p.kind === 'text'
                  ? <span key={pi}>{p.text}</span>
                  : <CitationChip key={pi} source={p.source} subject={p.subject} date={p.date} />,
              )}
            </p>
          )
        }
        if (g.part.kind === 'chart') return <ChartBlock key={i} part={g.part} />
        if (g.part.kind === 'callout') return <CalloutBlock key={i} part={g.part} />
        if (g.part.kind === 'bulletList') return <BulletListBlock key={i} part={g.part} />
        if (g.part.kind === 'illustration') return <IllustrationBlock key={i} part={g.part} />
        if (g.part.kind === 'table') return <TableBlock key={i} part={g.part} />
        return null
      })}
    </motion.div>
  )
}

type Group =
  | { kind: 'inline'; parts: Extract<ChatPart, { kind: 'text' | 'chip' }>[] }
  | { kind: 'block'; part: Extract<ChatPart, { kind: 'chart' | 'callout' | 'bulletList' | 'illustration' | 'table' }> }

function groupParts(parts: ChatPart[]): Group[] {
  const out: Group[] = []
  let inline: Extract<ChatPart, { kind: 'text' | 'chip' }>[] = []
  for (const p of parts) {
    if (p.kind === 'suggestions') continue  // suggestions render above the composer
    if (p.kind === 'text' || p.kind === 'chip') {
      inline.push(p)
    } else {
      if (inline.length) { out.push({ kind: 'inline', parts: inline }); inline = [] }
      out.push({ kind: 'block', part: p })
    }
  }
  if (inline.length) out.push({ kind: 'inline', parts: inline })
  return out
}

/** Pull the latest suggestion list — only the most recent AI message counts. */
export function getActiveSuggestions(messages: ChatMessage[]): string[] {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role === 'thinking') continue
    if (m.role === 'user') return []
    const suggestions = m.parts.find((p) => p.kind === 'suggestions')
    if (suggestions && suggestions.kind === 'suggestions') return suggestions.items
    return []
  }
  return []
}
```

### Suggestion row + composer (with the morphing send/mic/stop button)

```tsx
export function SuggestionRow({
  items, onSelect, disabled = false,
}: { items: string[]; onSelect: (text: string) => void; disabled?: boolean }) {
  if (items.length === 0) return null
  return (
    <div className="synth-scroll flex shrink-0 gap-2 overflow-x-auto px-3 pb-2 pt-1" style={{ fontFamily: SYNTH.font }}>
      {items.map((q, i) => (
        <button key={i} type="button" onClick={() => onSelect(q)} disabled={disabled}
          className="shrink-0 rounded-full border px-3 py-1.5 text-[12px] disabled:opacity-50"
          style={{
            background: SYNTH.sheet, borderColor: SYNTH.aiBorder, color: SYNTH.ink, fontFamily: SYNTH.font,
            maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
          {q}
        </button>
      ))}
    </div>
  )
}

type ComposerProps = {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  onStop: () => void
  onAttach: () => void
  onOpenVoice?: () => void
  attachment?: ChatAttachment | null
  onClearAttachment?: () => void
  isStreaming: boolean
  placeholder: string
}

export function AIComposer({
  value, onChange, onSubmit, onStop, onAttach, onOpenVoice,
  attachment, onClearAttachment, isStreaming, placeholder,
}: ComposerProps) {
  const hasContent = value.trim().length > 0 || !!attachment

  return (
    <div className="rounded-3xl px-3 pb-3 pt-3"
      style={{ background: SYNTH.sheet, border: `1px solid ${SYNTH.aiBorder}`, boxShadow: '0 4px 16px rgba(46,55,242,0.08)', fontFamily: SYNTH.font }}>
      {attachment ? (
        <div className="mb-2 inline-flex items-center gap-2 rounded-xl px-2.5 py-1.5"
          style={{ background: SYNTH.aiCard, border: `1px solid ${SYNTH.aiBorder}` }}>
          {attachment.dataUrl ? (
            <img src={attachment.dataUrl} alt={attachment.name} className="h-8 w-8 rounded-md object-cover" style={{ border: `1px solid ${SYNTH.aiBorder}` }} />
          ) : (
            <span className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ background: SYNTH.ink, color: SYNTH.inkOnBrand }}>{attachment.ext}</span>
          )}
          <span className="text-[12px] font-medium" style={{ color: SYNTH.ink }}>{attachment.name}</span>
          <button type="button" onClick={onClearAttachment} aria-label="Remove attachment"
            className="ml-1 flex h-5 w-5 items-center justify-center rounded-full" style={{ background: SYNTH.sheetMuted, color: SYNTH.aiTextMuted }}>
            <X size={11} strokeWidth={2.6} />
          </button>
        </div>
      ) : null}

      {attachment?.dataUrl ? (
        <p className="mb-2 px-1 text-[11px] leading-snug" style={{ color: SYNTH.aiTextMuted, fontFamily: SYNTH.font }}>
          synth can't auto-tag images yet. Describe what you want to know, or hit send and I'll ask follow-ups.
        </p>
      ) : null}

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!isStreaming && hasContent) onSubmit() }
        }}
        rows={1}
        placeholder={placeholder}
        disabled={isStreaming}
        className="block w-full resize-none bg-transparent px-2 text-[15px] outline-none placeholder:opacity-60 disabled:opacity-60"
        style={{ color: SYNTH.ink, fontFamily: SYNTH.font, minHeight: 28 }}
      />

      <div className="mt-2 flex items-center gap-1 px-1">
        <button type="button" onClick={onAttach} aria-label="Attach" disabled={isStreaming}
          className="flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-50" style={{ color: SYNTH.aiTextMuted }}>
          <Plus size={18} strokeWidth={2.2} />
        </button>
        <span className="flex-1" />
        {/* Trailing button: streaming→stop, has-text→send, idle→mic (opens voice) */}
        <AnimatePresence mode="wait" initial={false}>
          {isStreaming ? (
            <motion.button key="stop" type="button" onClick={onStop}
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.12 }}
              aria-label="Stop" className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}>
              <span className="block h-3 w-3 rounded-[3px]" style={{ background: SYNTH.ink }} />
            </motion.button>
          ) : hasContent ? (
            <motion.button key="send" type="button" onClick={onSubmit}
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.12 }}
              whileTap={{ scale: 0.94 }} aria-label="Send"
              className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: SYNTH.accentEmerald, color: SYNTH.inkOnBrand }}>
              <UpArrowGlyph />
            </motion.button>
          ) : (
            <motion.button key="voice" type="button" onClick={onOpenVoice}
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.12 }}
              whileTap={{ scale: 0.94 }} aria-label="Voice transcribe" disabled={!onOpenVoice}
              className="flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-60" style={{ background: SYNTH.ink, color: SYNTH.inkOnBrand }}>
              <Mic size={16} strokeWidth={2.2} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function UpArrowGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 19V5M5 12l7-7 7 7" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
```

### Add-to-chat sheet + chat history sheet + shared bits (Tile / Group / Pill / Toggle / MenuItem)

```tsx
export type ScopeOption = { id: string; label: string; flagged?: boolean; pinned?: boolean }
export type StyleKey = 'synthesized' | 'raw'

/** Shared scope filter logic — pinned (team) always shown; athletes filtered by query + flagged. */
export function filterScopes(options: ScopeOption[], query: string, flaggedOnly: boolean): { pinned: ScopeOption[]; athletes: ScopeOption[] } {
  const q = query.trim().toLowerCase()
  const pinned: ScopeOption[] = []
  const athletes: ScopeOption[] = []
  for (const o of options) {
    if (o.pinned) { pinned.push(o); continue }
    if (flaggedOnly && !o.flagged) continue
    if (q && !o.label.toLowerCase().includes(q)) continue
    athletes.push(o)
  }
  return { pinned, athletes }
}

export function AddToChatSheet({
  open, onClose, onPickFiles, onOpenVoice, scopeOptions, scopeId, onScopeChange, style, onStyleChange,
}: {
  open: boolean
  onClose: () => void
  onPickFiles: (files: FileList | null) => void
  onOpenVoice?: () => void
  scopeOptions: ScopeOption[]
  scopeId: string
  onScopeChange: (id: string) => void
  style: StyleKey
  onStyleChange: (s: StyleKey) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [scopeQuery, setScopeQuery] = useState('')
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  const handleClose = () => { setScopeQuery(''); setFlaggedOnly(false); onClose() }

  const { athletes } = filterScopes(scopeOptions, scopeQuery, flaggedOnly)

  const triggerFile = (accept: string) => {
    const el = fileInputRef.current
    if (!el) return
    el.accept = accept
    el.click()
  }
  const triggerVoice = () => { if (!onOpenVoice) return; handleClose(); onOpenVoice() }

  // Athlete view passes a single self-scoped option → hide the whole Scope group.
  const showScopeGroup = scopeOptions.filter((o) => !o.pinned).length > 1
  const isScopeIdle = scopeQuery.trim() === '' && !flaggedOnly

  return (
    <SheetShell open={open} onClose={handleClose} title="Add to chat">
      <div className="grid grid-cols-2 gap-2 pt-2">
        <Tile icon={<Camera size={20} strokeWidth={2.2} />} label="Camera" onClick={() => triggerFile('image/*')} />
        <Tile icon={<ImageIcon size={20} strokeWidth={2.2} />} label="Photos" onClick={() => triggerFile('image/*')} />
        <Tile icon={<FileText size={20} strokeWidth={2.2} />} label="Files" onClick={() => triggerFile('*/*')} />
        {onOpenVoice ? <Tile icon={<Mic size={20} strokeWidth={2.2} />} label="Voice" onClick={triggerVoice} /> : null}
      </div>

      {showScopeGroup ? (
        <Group label="Scope">
          {/* ...ScopeSearchControls + athlete pills (coach surface only)... */}
        </Group>
      ) : null}

      <Group label="Response style">
        <div className="flex flex-wrap gap-2">
          <Pill active={style === 'synthesized'} onClick={() => onStyleChange('synthesized')}>Synthesized</Pill>
          <Pill active={style === 'raw'} onClick={() => onStyleChange('raw')}>Raw provenance</Pill>
        </div>
        <p className="text-[11px]" style={{ color: SYNTH.aiTextMuted, fontFamily: SYNTH.font }}>
          {style === 'synthesized' ? 'Narrative, with inline citations and visualizations.' : 'Numbers and tables, minimal prose.'}
        </p>
      </Group>

      <input ref={fileInputRef} type="file" accept="*/*"
        onChange={(e) => { onPickFiles(e.target.files); if (fileInputRef.current) fileInputRef.current.value = ''; handleClose() }}
        className="hidden" />
    </SheetShell>
  )
}

export type ChatHistoryEntry = { id: string; title: string; updatedAgo: string; pinned?: boolean }

export function ChatHistorySheet({
  open, onClose, entries, activeId, onPick, onPin, onRename, onDelete, onNew,
}: {
  open: boolean
  onClose: () => void
  entries: ChatHistoryEntry[]
  activeId: string | null
  onPick: (id: string) => void
  onPin: (id: string) => void
  onRename: (id: string) => void
  onDelete: (id: string) => void
  onNew: () => void
}) {
  const pinned = entries.filter((e) => e.pinned)
  const others = entries.filter((e) => !e.pinned)
  return (
    <SheetShell open={open} onClose={onClose} title="Chat history">
      <div className="flex flex-col gap-2">
        <button type="button" onClick={onNew}
          className="flex items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold"
          style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, letterSpacing: '0.02em' }}>
          + Start a new chat
        </button>
      </div>
      {pinned.length > 0 ? (
        <Group label="Starred">
          <HistoryList entries={pinned} activeId={activeId} onPick={onPick} onPin={onPin} onRename={onRename} onDelete={onDelete} />
        </Group>
      ) : null}
      <Group label="Recents">
        {others.length === 0 ? (
          <p className="rounded-2xl px-4 py-6 text-center text-[12px]" style={{ background: SYNTH.aiCard, color: SYNTH.aiTextMuted, fontFamily: SYNTH.font }}>
            No prior chats yet.
          </p>
        ) : (
          <HistoryList entries={others} activeId={activeId} onPick={onPick} onPin={onPin} onRename={onRename} onDelete={onDelete} />
        )}
      </Group>
    </SheetShell>
  )
}

// Shared bits
function Tile({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <motion.button type="button" onClick={onClick} whileTap={{ scale: 0.97 }}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl px-3 py-5"
      style={{ background: SYNTH.aiCard, border: `1px solid ${SYNTH.aiBorder}`, color: SYNTH.ink, fontFamily: SYNTH.font }}>
      {icon}
      <span className="text-[12px] font-semibold">{label}</span>
    </motion.button>
  )
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 pt-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.aiTextMuted, fontFamily: SYNTH.font }}>{label}</p>
      {children}
    </div>
  )
}

function Pill({ active, onClick, disabled, children }: { active: boolean; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="rounded-full border px-3 py-1.5 text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        background: active ? SYNTH.accentBlack : SYNTH.sheet,
        borderColor: active ? SYNTH.accentBlack : SYNTH.aiBorder,
        color: active ? SYNTH.inkOnBrand : SYNTH.ink, fontFamily: SYNTH.font,
      }}>
      {children}
    </button>
  )
}

function Toggle({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className="flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left"
      style={{ background: SYNTH.aiCard, borderColor: SYNTH.aiBorder, color: SYNTH.ink, fontFamily: SYNTH.font }}>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold">{label}</p>
        {hint ? <p className="mt-0.5 text-[11px]" style={{ color: SYNTH.aiTextMuted }}>{hint}</p> : null}
      </div>
      <span className="relative h-6 w-11 shrink-0 rounded-full transition-colors" style={{ background: value ? SYNTH.accentEmerald : '#D4D4D8' }}>
        <span className="absolute top-0.5 h-5 w-5 rounded-full transition-transform"
          style={{ background: '#FFFFFF', transform: value ? 'translateX(22px)' : 'translateX(2px)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
      </span>
    </button>
  )
}
```

> The `HistoryList` + `MenuItem` (star/rename/delete context menu) and `ScopeSearchControls` are also in `AIChat.tsx` — they're standard list/menu components; see the source if you need them verbatim.

---

## 8. Supporting files

### Image attachment — `src/features/app/lib/imageAttachment.ts`

```ts
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

const ANTHROPIC_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

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
  if (!ANTHROPIC_IMAGE_TYPES.has(file.type)) return { name, ext }  // non-image → chip only
  if (file.size > MAX_IMAGE_BYTES) throw new ImageAttachmentTooLargeError(file.size)
  const dataUrl = await readAsDataUrl(file)
  return { name, ext, mediaType: file.type as ChatAttachment['mediaType'], dataUrl }
}
```

### Demo daily cap — `src/features/app/store/useDemoUsage.ts`

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const DEMO_DAILY_AI_LIMIT = 30

type DemoUsageState = {
  date: string                  // UTC YYYY-MM-DD; counter resets when this rolls
  count: number
  recordMessage: () => void
  isOverLimit: () => boolean
  remaining: () => number
  reset: () => void
}

function todayUtc(): string { return new Date().toISOString().slice(0, 10) }

export const useDemoUsage = create<DemoUsageState>()(
  persist(
    (set, get) => ({
      date: todayUtc(),
      count: 0,
      recordMessage: () =>
        set((s) => {
          const now = todayUtc()
          if (s.date !== now) return { date: now, count: 1 }
          return { date: s.date, count: s.count + 1 }
        }),
      isOverLimit: () => {
        const s = get()
        if (s.date !== todayUtc()) return false
        return s.count >= DEMO_DAILY_AI_LIMIT
      },
      remaining: () => {
        const s = get()
        if (s.date !== todayUtc()) return DEMO_DAILY_AI_LIMIT
        return Math.max(0, DEMO_DAILY_AI_LIMIT - s.count)
      },
      reset: () => set({ date: todayUtc(), count: 0 }),
    }),
    { name: 'synth:app:demo-usage', version: 1, partialize: (s) => ({ date: s.date, count: s.count }) },
  ),
)
```

### Athlete data shape + erg helpers — `src/features/app/data/mockTeam.ts` (excerpts)

```ts
export type AppMockAthlete = {
  id: string
  name: string
  initials: string
  position: string
  side: 'P' | 'S' | 'X'
  preferredSeat?: 'stroke' | 'bow' | 'middle' | 'cox' | 'any'
  recoveryScore: number
  twoKBestSeconds: number
  twoKAvg30dSeconds: number
  weeklyVolumeMeters: number
  streakDays: number
  lastSyncMinutes: number
  primarySource: string
}

export const APP_MOCK_ATHLETES: AppMockAthlete[] = [/* ...derived from real erg workbook... */]

export type AppSessionPoint = { date: string; seconds: number; meters: number }

/** 14-day synthetic 2K history around the athlete's 30-day average. */
export function buildErgHistory(athleteId: string): AppSessionPoint[] {
  const athlete = APP_MOCK_ATHLETES.find((a) => a.id === athleteId)
  const base = athlete?.twoKAvg30dSeconds ?? 7 * 60 + 15
  const today = new Date()
  return Array.from({ length: 14 }).map((_, i) => {
    const dayOffset = 13 - i
    const d = new Date(today)
    d.setDate(d.getDate() - dayOffset)
    const drift = Math.sin(i * 0.6) * 4 + (i - 7) * 0.4
    return { date: d.toISOString().slice(5, 10), seconds: Math.round(base + drift), meters: 2000 }
  })
}

/** 7:14.3-style formatter for erg seconds. */
export function fmtErgTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const raw = totalSeconds % 60
  const s = Math.round(raw * 10) / 10
  const [whole, dec = '0'] = s.toFixed(1).split('.')
  return `${m}:${whole.padStart(2, '0')}.${dec}`
}
```

---

## Feature checklist (everything on the athlete synth AI page)

| Feature | Where |
|---|---|
| Empty-state greeting (time-aware) | `AIThread` empty state + `timeAwareGreeting()` |
| Send a message (text) | `AIPage.send()` |
| Streaming "thinking" glyph | `MessageRow` role `thinking` + `SynthGlyph rotating` |
| Data viz responses (chart/table/callout/illustration/chip) | `ChatPart` blocks + `mockSelfResponse` / `parseAIText` |
| Tap-to-send follow-up suggestions | `SuggestionRow` + `getActiveSuggestions` + `[suggest:...]` token |
| Voice input (live transcript + waveform) | `AuroraVoiceOverlay` (Web Speech API + AudioContext) |
| Attach image/file (+ vision) | `AddToChatSheet`, `imageAttachment.ts`, `parseImageDataUrl` |
| Response style (Synthesized / Raw provenance) | `AddToChatSheet` + `style` state → `mockSelfResponse` |
| **Program customization** (instructions, tone, references, toggles) | `CustomizeChatSheet` + `useAIChatCustomization` |
| Per-scope persisted settings | `useAIChatCustomization` (`self:<id>` for athlete) |
| Chat history (star / rename / delete / new) | `ChatHistorySheet` + `history` state |
| Stop streaming | `AIPage.stopStreaming()` + composer stop button |
| Demo daily cap | `useDemoUsage` + banner in `AIPage` |
| Live Claude vs mock fallback | `getAIClientMode` → `streamCompletion` or `mockSelfResponse` |

The **coach AI page** (`src/features/app/coach/AIPage.tsx`) reuses every one of these primitives — the only differences are scope switching (team vs. a drilled-in athlete via `ScopeSearchControls`) and `scope: 'team' | 'athlete'` passed to `buildSystemPrompt`.
</content>
</invoke>
