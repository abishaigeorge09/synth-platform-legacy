import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Menu, Sliders } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { SwipeBackPage } from '../primitives/SwipeBackPage'
import {
  AIThread,
  AIComposer,
  AddToChatSheet,
  ChatHistorySheet,
  CustomizeChatSheet,
  SuggestionRow,
  getActiveSuggestions,
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
import { parseAIText } from '../lib/aiResponseParser'
import { useAppAuthStore } from '../store/useAppAuthStore'
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

  const scopeOptions: ScopeOption[] = useMemo(
    () => [{ id: me.id, label: `Just ${me.name.split(' ')[0]}` }],
    [me.id, me.name],
  )

  const [text, setText] = useState('')
  const [attachment, setAttachment] = useState<{ name: string; ext: string } | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [history, setHistory] = useState<ChatHistoryEntry[]>(SEED_HISTORY)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [style, setStyle] = useState<StyleKey>('synthesized')

  // Phase 2 — athlete view is always self-scoped to the signed-in
  // athlete. The store keys this surface as `self:<id>` so it can never
  // overlap with a coach-side `athlete:<id>` drilldown of the same uuid.
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
    const dot = f.name.lastIndexOf('.')
    const ext = dot >= 0 ? f.name.slice(dot + 1).toUpperCase() : 'FILE'
    const name = dot >= 0 ? f.name.slice(0, dot) : f.name
    setAttachment({ name: name.length > 24 ? `${name.slice(0, 24)}…` : name, ext })
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
    // Accepts an explicit text override so suggestion chips can fire
    // send without round-tripping through React state. (See coach
    // AIPage for full rationale.)
    const trimmed = (overrideText ?? text).trim()
    if (!trimmed && !attachment) return

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

    // Live mode — call Anthropic. Self-scoped: send athlete's own data only.
    const scopeData = {
      athlete: me,
      ergHistory: buildErgHistory(me.id).slice(-14),
    }

    const systemPrompt = buildSystemPrompt({
      scope: 'self',
      scopeLabel,
      scopeData,
      customization: customResolved,
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

    const apiMessages: AIMessage[] = [...history, { role: 'user', content: trimmed }]

    const ctrl = new AbortController()
    abortRef.current = ctrl
    const aiId = `a-${Date.now()}`
    let accumulated = ''

    void streamCompletion({
      systemPrompt,
      messages: apiMessages,
      signal: ctrl.signal,
      onEvent: (e) => {
        if (e.kind === 'delta') {
          accumulated += e.text
          // Phase 1 — see coach/AIPage.tsx for the rationale on this
          // streaming-parser approach. parseAIText is pure + idempotent
          // so re-parsing on every delta is safe.
          const parsed = parseAIText(accumulated)
          setMessages((m) => {
            const withoutThinking = m.filter((msg) => msg.role !== 'thinking')
            const exists = withoutThinking.some((msg) => msg.id === aiId)
            if (exists) {
              return withoutThinking.map((msg) =>
                msg.id === aiId
                  ? { ...msg, parts: parsed }
                  : msg,
              )
            }
            return [
              ...withoutThinking,
              {
                id: aiId,
                role: 'ai' as const,
                parts: parsed,
                ts: Date.now(),
              },
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
        // See coach/AIPage.tsx for the rationale on h-dvh + overflow.
        // Locks this surface to viewport height so only the thread
        // scrolls; header + composer stay pinned.
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
          <span data-tour="athlete-ai-history">
            <HeaderIconButton ariaLabel="Chat history" onClick={() => setHistoryOpen(true)}>
              <Menu size={16} strokeWidth={2.2} />
            </HeaderIconButton>
          </span>
          <span data-tour="athlete-ai-customize">
            <HeaderIconButton
              ariaLabel="Customize chat"
              onClick={() => setCustomizeOpen(true)}
              badge={customizationActive}
            >
              <Sliders size={16} strokeWidth={2.2} />
            </HeaderIconButton>
          </span>
        </header>

        <div className="synth-scroll flex min-h-0 flex-1 flex-col overflow-y-auto pb-2">
          <AIThread messages={messages} emptyHeadline={greeting} />
        </div>

        <SuggestionRow
          items={getActiveSuggestions(messages)}
          onSelect={(q) => send(q)}
          disabled={isStreaming}
        />

        <div data-tour="athlete-ai-input" className="shrink-0 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
          <AIComposer
            value={text}
            onChange={setText}
            onSubmit={() => send()}
            onStop={stopStreaming}
            onAttach={() => setAddOpen(true)}
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
          scopeOptions={scopeOptions}
          scopeId={me.id}
          onScopeChange={() => {
            /* athletes scoped to themselves */
          }}
          style={style}
          onStyleChange={setStyle}
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
  ariaLabel,
  onClick,
  badge,
  children,
}: {
  ariaLabel: string
  onClick: () => void
  badge?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
      style={{ background: SYNTH.sheet, border: `1px solid ${SYNTH.aiBorder}`, color: SYNTH.ink }}
    >
      {children}
      {badge ? (
        <span
          className="absolute right-1 top-1 h-2 w-2 rounded-full"
          style={{ background: SYNTH.accentEmerald, border: `1.5px solid ${SYNTH.sheet}` }}
        />
      ) : null}
    </button>
  )
}

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

  if (style === 'raw') {
    return [
      { kind: 'text', text: `${tonePrefix}Best 2K ${fmtErgTime(me.twoKBestSeconds)} · 30d avg ${fmtErgTime(me.twoKAvg30dSeconds)} · recovery ${me.recoveryScore} · streak ${me.streakDays}d · weekly ${(me.weeklyVolumeMeters / 1000).toFixed(0)}km. ` },
      { kind: 'chip', source: me.primarySource, subject: me.name, date: today },
    ]
  }

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

  if (/race|cup|heat|regatta/.test(lower)) {
    return [
      { kind: 'illustration', glyph: 'trophy', caption: 'Pacific Cup heat · 9 days out' },
      { kind: 'text', text: `${tonePrefix}You're 9 days out. Plan your taper around your pattern: longer Z2 work this week, sharpening at race pace next week. ` },
      { kind: 'chip', source: 'TrainingPeaks', subject: me.name, date: today },
      { kind: 'text', text: `Want a day-by-day breakdown?` },
    ]
  }

  // default
  return [
    { kind: 'text', text: `${tonePrefix}You're recovered at ${me.recoveryScore} today, on a ${me.streakDays}-day streak ` },
    { kind: 'chip', source: 'WHOOP', subject: me.name, date: today },
    { kind: 'text', text: `. Weekly volume is ${(me.weeklyVolumeMeters / 1000).toFixed(0)}km — solid block. Want a session-by-session breakdown, or a recovery view?` },
  ]
}
