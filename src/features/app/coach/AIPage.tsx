import { useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronDown, Menu, Sliders } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { SwipeBackPage } from '../primitives/SwipeBackPage'
import { SheetShell } from '../primitives/SheetShell'
import {
  AIThread,
  AIComposer,
  AddToChatSheet,
  ChatHistorySheet,
  CustomizeChatSheet,
  type ChatMessage,
  type ChatPart,
  type ChartPoint,
  type ScopeOption,
  type StyleKey,
  type ChatHistoryEntry,
  type ChatCustomization,
} from '../primitives/AIChat'
import { timeAwareGreeting, DEFAULT_CUSTOMIZATION } from '../primitives/aiChatUtil'
import {
  streamCompletion,
  buildSystemPrompt,
  getAIClientMode,
  type AIMessage,
} from '../lib/aiClient'
import {
  APP_MOCK_ATHLETES,
  APP_MOCK_TEAM,
  APP_MOCK_ATTENTION,
  buildErgHistory,
  fmtErgTime,
  fmtAgo,
} from '../data/mockTeam'

const SEED_HISTORY: ChatHistoryEntry[] = [
  { id: 'h-1', title: 'Race plan for Pacific Cup heat', updatedAgo: '3 days ago', pinned: true },
  { id: 'h-2', title: "Why is Star Miller's split slipping?", updatedAgo: '6h ago' },
  { id: 'h-3', title: 'Wednesday lineup analysis', updatedAgo: 'yesterday' },
]

export function AIPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const athleteIdFromUrl = params.get('athlete')
  const scopeId = athleteIdFromUrl ?? 'team'

  const scopeAthlete = useMemo(
    () => APP_MOCK_ATHLETES.find((a) => a.id === scopeId) ?? null,
    [scopeId],
  )
  const scopeLabel = scopeAthlete ? scopeAthlete.name : APP_MOCK_TEAM.name

  const [text, setText] = useState('')
  const [attachment, setAttachment] = useState<{ name: string; ext: string } | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [history, setHistory] = useState<ChatHistoryEntry[]>(SEED_HISTORY)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [scopeOpen, setScopeOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [style, setStyle] = useState<StyleKey>('synthesized')
  const [custom, setCustom] = useState<ChatCustomization>(DEFAULT_CUSTOMIZATION)
  const streamingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const scopeOptions: ScopeOption[] = useMemo(
    () => [
      { id: 'team', label: APP_MOCK_TEAM.name },
      ...APP_MOCK_ATHLETES.map((a) => ({ id: a.id, label: a.name })),
    ],
    [],
  )

  const onScopeChange = (id: string) => {
    if (id === 'team') {
      setParams({}, { replace: true })
    } else {
      setParams({ athlete: id }, { replace: true })
    }
  }

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

  const send = () => {
    const trimmed = text.trim()
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
      const title = trimmed || `New chat`
      setHistory((h) => [
        { id: newId, title: title.length > 48 ? `${title.slice(0, 48)}…` : title, updatedAgo: 'just now' },
        ...h,
      ])
      setActiveChatId(newId)
    }

    const mode = getAIClientMode()

    if (mode === 'mock') {
      // No API key — fall back to the canned scenario generator.
      streamingTimer.current = setTimeout(() => {
        const aiParts = mockResponse({ scopeAthlete, scopeLabel, prompt: trimmed, style, custom })
        setMessages((m) => {
          const withoutThinking = m.filter((msg) => msg.role !== 'thinking')
          return [
            ...withoutThinking,
            { id: `a-${Date.now()}`, role: 'ai', parts: aiParts, ts: Date.now() },
          ]
        })
        setIsStreaming(false)
        streamingTimer.current = null
      }, 1300)
      return
    }

    // Live mode — call Anthropic with full scope context + customization.
    const scopeData = scopeAthlete
      ? {
          athlete: scopeAthlete,
          attention: APP_MOCK_ATTENTION.filter((a) => a.athleteId === scopeAthlete.id),
          ergHistory: buildErgHistory(scopeAthlete.id).slice(-14),
        }
      : {
          team: APP_MOCK_TEAM,
          flagged: APP_MOCK_ATTENTION,
          roster: APP_MOCK_ATHLETES.map((a) => ({
            id: a.id,
            name: a.name,
            position: a.position,
            recovery: a.recoveryScore,
            twoKBest: fmtErgTime(a.twoKBestSeconds),
            streakDays: a.streakDays,
          })),
        }

    const systemPrompt = buildSystemPrompt({
      scope: scopeAthlete ? 'athlete' : 'team',
      scopeLabel,
      scopeData,
      customization: custom,
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
          setMessages((m) => {
            const withoutThinking = m.filter((msg) => msg.role !== 'thinking')
            const exists = withoutThinking.some((msg) => msg.id === aiId)
            if (exists) {
              return withoutThinking.map((msg) =>
                msg.id === aiId
                  ? { ...msg, parts: [{ kind: 'text' as const, text: accumulated }] }
                  : msg,
              )
            }
            return [
              ...withoutThinking,
              {
                id: aiId,
                role: 'ai' as const,
                parts: [{ kind: 'text' as const, text: accumulated }],
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
  const placeholder = messages.length > 0 ? 'Reply to synth.' : `Ask synth. about ${scopeLabel}`
  const customizationActive =
    custom.tone !== 'normal' ||
    custom.instructions.trim().length > 0 ||
    custom.references.length > 0

  return (
    <SwipeBackPage to="/app/coach/home">
      <div
        className="flex flex-1 flex-col"
        style={{ background: SYNTH.aiCanvas, fontFamily: SYNTH.font }}
      >
        <header className="flex items-center gap-2 px-4 pt-[max(env(safe-area-inset-top),32px)] pb-3">
          <HeaderIconButton
            ariaLabel="Back"
            onClick={() => navigate('/app/coach/home')}
          >
            <ChevronLeft size={18} strokeWidth={2.4} />
          </HeaderIconButton>
          <button
            type="button"
            data-tour="coach-ai-scope"
            onClick={() => setScopeOpen(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2"
            style={{ background: SYNTH.sheet, borderColor: SYNTH.aiBorder, color: SYNTH.ink }}
          >
            <span className="truncate text-[14px] font-semibold" style={{ fontFamily: SYNTH.font }}>
              {scopeLabel}
            </span>
            <ChevronDown size={14} color={SYNTH.aiTextMuted} strokeWidth={2.2} />
          </button>
          <span data-tour="coach-ai-history">
            <HeaderIconButton ariaLabel="Chat history" onClick={() => setHistoryOpen(true)}>
              <Menu size={16} strokeWidth={2.2} />
            </HeaderIconButton>
          </span>
          <span data-tour="coach-ai-customize">
            <HeaderIconButton
              ariaLabel="Customize chat"
              onClick={() => setCustomizeOpen(true)}
              badge={customizationActive}
            >
              <Sliders size={16} strokeWidth={2.2} />
            </HeaderIconButton>
          </span>
        </header>

        <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-2">
          <AIThread
            messages={messages}
            emptyHeadline={greeting}
            emptyHint={`Scoped · ${scopeLabel}`}
            scopeLabel={scopeLabel}
          />
        </div>

        <div data-tour="coach-ai-input" className="px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
          <AIComposer
            value={text}
            onChange={setText}
            onSubmit={send}
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
          scopeId={scopeId}
          onScopeChange={onScopeChange}
          style={style}
          onStyleChange={setStyle}
        />

        <ScopePickerSheet
          open={scopeOpen}
          onClose={() => setScopeOpen(false)}
          options={scopeOptions}
          activeId={scopeId}
          onPick={(id) => {
            onScopeChange(id)
            setScopeOpen(false)
          }}
        />

        <CustomizeChatSheet
          open={customizeOpen}
          onClose={() => setCustomizeOpen(false)}
          value={custom}
          onChange={setCustom}
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

function ScopePickerSheet({
  open,
  onClose,
  options,
  activeId,
  onPick,
}: {
  open: boolean
  onClose: () => void
  options: ScopeOption[]
  activeId: string
  onPick: (id: string) => void
}) {
  return (
    <SheetShell open={open} onClose={onClose} title="Scope this chat">
      <p className="text-[12px]" style={{ color: SYNTH.aiTextMuted, fontFamily: SYNTH.font }}>
        synth answers from this scope's data only.
      </p>
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: SYNTH.aiCard, border: `1px solid ${SYNTH.aiBorder}` }}
      >
        {options.map((o, i) => {
          const active = o.id === activeId
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onPick(o.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left active:opacity-70"
              style={{
                borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.aiBorder}`,
                background: active ? SYNTH.aiBubble : 'transparent',
                fontFamily: SYNTH.font,
              }}
            >
              <span className="text-[14px] font-semibold" style={{ color: SYNTH.ink }}>
                {o.label}
              </span>
              {active ? (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
                  style={{ background: SYNTH.accentEmerald, color: SYNTH.inkOnBrand }}
                >
                  Active
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </SheetShell>
  )
}

// — Mock response with rich content —

const TONE_PREFIX: Record<ChatCustomization['tone'], string> = {
  normal: '',
  coach: 'Coach mode — ',
  raceday: 'Race-day prep — ',
  recovery: 'Recovery focus — ',
}

function ergSeriesFor(athleteId: string): { points: ChartPoint[]; provenance: string } {
  const history = buildErgHistory(athleteId).slice(-14)
  return {
    points: history.map((p) => ({ label: p.date, value: p.seconds })),
    provenance: `Concept2 · 14 days · synced 4m ago`,
  }
}

function recoveryTeamSeries(): { points: ChartPoint[]; provenance: string } {
  // Mock 7-day average recovery for the team
  const today = new Date()
  const points = Array.from({ length: 7 }).map((_, i) => {
    const dayOffset = 6 - i
    const d = new Date(today)
    d.setDate(d.getDate() - dayOffset)
    const drift = Math.sin(i * 0.7) * 6 + (i - 3) * 1.5
    return { label: d.toISOString().slice(5, 10), value: Math.round(70 + drift) }
  })
  return { points, provenance: 'WHOOP · 7 days · synced 6m ago' }
}

function mockResponse({
  scopeAthlete,
  scopeLabel,
  prompt,
  style,
  custom,
}: {
  scopeAthlete: typeof APP_MOCK_ATHLETES[number] | null
  scopeLabel: string
  prompt: string
  style: StyleKey
  custom: ChatCustomization
}): ChatPart[] {
  const today = new Date().toISOString().slice(0, 10)
  const tonePrefix = TONE_PREFIX[custom.tone]
  const lower = prompt.toLowerCase()

  // Raw mode — short, citation-heavy, no chart
  if (style === 'raw') {
    if (scopeAthlete) {
      return [
        { kind: 'text', text: `${tonePrefix}${scopeAthlete.name}, last 14 days, raw:\n` },
        { kind: 'text', text: `2K best ${fmtErgTime(scopeAthlete.twoKBestSeconds)}, 30d avg ${fmtErgTime(scopeAthlete.twoKAvg30dSeconds)}. Recovery ${scopeAthlete.recoveryScore}. Streak ${scopeAthlete.streakDays}d. Weekly ${(scopeAthlete.weeklyVolumeMeters / 1000).toFixed(0)}km. ` },
        { kind: 'chip', source: scopeAthlete.primarySource, subject: scopeAthlete.name, date: today },
      ]
    }
    return [
      { kind: 'text', text: `${tonePrefix}${scopeLabel} — raw weekly: ${APP_MOCK_TEAM.activeToday}/${APP_MOCK_TEAM.athleteCount} active, avg recovery ${APP_MOCK_TEAM.avgRecovery}, ${APP_MOCK_TEAM.attentionCount} flagged, ${APP_MOCK_TEAM.sessionsToday} sessions today. ` },
      { kind: 'chip', source: 'synth.', subject: APP_MOCK_TEAM.name, date: today },
    ]
  }

  // Synthesized — pick scenario based on prompt keywords
  if (scopeAthlete) {
    if (/split|2k|erg|pace|time/.test(lower)) {
      const { points, provenance } = ergSeriesFor(scopeAthlete.id)
      return [
        { kind: 'text', text: `${tonePrefix}${scopeAthlete.name}'s 2K trend over the last 14 days. ` },
        {
          kind: 'chart',
          title: '2K time · last 14 days',
          data: points,
          yFormatter: (v) => fmtErgTime(v),
          accent: SYNTH.accentEmerald,
          provenance,
        },
        { kind: 'text', text: `Best is ${fmtErgTime(scopeAthlete.twoKBestSeconds)}, average ${fmtErgTime(scopeAthlete.twoKAvg30dSeconds)} ` },
        { kind: 'chip', source: scopeAthlete.primarySource, subject: scopeAthlete.name, date: today },
        { kind: 'text', text: `.` },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Likely cause',
          text: 'Two short-sleep nights this block. Splits drift 2–4s the day after a sub-6h night.',
        },
        { kind: 'text', text: `Want me to overlay sleep on this chart, or pull the by-day breakdown?` },
      ]
    }
    if (/recover|sleep|hrv|wellness/.test(lower)) {
      return [
        { kind: 'text', text: `${tonePrefix}${scopeAthlete.name}'s recovery sits at ${scopeAthlete.recoveryScore} ` },
        { kind: 'chip', source: 'WHOOP', subject: scopeAthlete.name, date: today },
        { kind: 'text', text: `.` },
        {
          kind: 'illustration',
          glyph: 'heart',
          caption: `Recovery · ${scopeAthlete.recoveryScore}`,
        },
        {
          kind: 'callout',
          tone: 'success',
          title: 'On track',
          text: `Sleep average is steady at 7.4h. HRV trending up. Streak: ${scopeAthlete.streakDays} days.`,
        },
      ]
    }
    if (/lineup|boat|seat/.test(lower)) {
      return [
        { kind: 'illustration', glyph: 'boat', caption: 'V8 — published 06:42' },
        { kind: 'text', text: `${tonePrefix}${scopeAthlete.name} is at ${scopeAthlete.position}. ` },
        { kind: 'chip', source: 'synth.', subject: scopeAthlete.name, date: today },
        { kind: 'text', text: ` Want me to show alternative lineups that keep stroke timing tight?` },
      ]
    }
    // default for athlete scope
    const { points, provenance } = ergSeriesFor(scopeAthlete.id)
    return [
      { kind: 'text', text: `${tonePrefix}Looking at ${scopeAthlete.name}'s last block. ` },
      {
        kind: 'chart',
        title: '2K time · last 14 days',
        data: points,
        yFormatter: (v) => fmtErgTime(v),
        accent: SYNTH.accentEmerald,
        provenance,
      },
      { kind: 'text', text: `Best 2K is ${fmtErgTime(scopeAthlete.twoKBestSeconds)}, recovery is ${scopeAthlete.recoveryScore}, on a ${scopeAthlete.streakDays}-day streak. ` },
      { kind: 'chip', source: scopeAthlete.primarySource, subject: scopeAthlete.name, date: today },
      { kind: 'text', text: `Where do you want to dig in — splits, sleep, or volume?` },
    ]
  }

  // Team scope
  if (/flag|attention|need|eye/.test(lower)) {
    return [
      { kind: 'text', text: `${tonePrefix}${APP_MOCK_TEAM.attentionCount} flagged today.` },
      {
        kind: 'bulletList',
        items: APP_MOCK_ATTENTION.map((a) => ({
          label: a.athleteName,
          sub: a.signal,
          severity: a.severity,
        })),
      },
      { kind: 'text', text: `Most recent sync: ` },
      { kind: 'chip', source: APP_MOCK_ATTENTION[0].source, subject: APP_MOCK_ATTENTION[0].athleteName, date: fmtAgo(APP_MOCK_ATTENTION[0].syncedMinutesAgo) },
      { kind: 'text', text: `. Tap any name in attention for the underlying data.` },
    ]
  }
  if (/recover|sleep|hrv|wellness/.test(lower)) {
    const { points, provenance } = recoveryTeamSeries()
    return [
      { kind: 'text', text: `${tonePrefix}Team-average recovery, last 7 days. ` },
      {
        kind: 'chart',
        title: 'Avg recovery · 7 days',
        data: points,
        yFormatter: (v) => `${v}`,
        accent: SYNTH.accentAmber,
        provenance,
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Trend',
        text: `Up 3 points week-over-week. Two athletes still under 50: Isla Park (42), Coral Mendez (58).`,
      },
    ]
  }
  // default team summary
  const { points, provenance } = recoveryTeamSeries()
  const example = APP_MOCK_ATTENTION[0]
  return [
    { kind: 'text', text: `${tonePrefix}${APP_MOCK_TEAM.activeToday} of ${APP_MOCK_TEAM.athleteCount} synced today, ${APP_MOCK_TEAM.attentionCount} flagged. ` },
    {
      kind: 'chart',
      title: 'Avg recovery · 7 days',
      data: points,
      yFormatter: (v) => `${v}`,
      accent: SYNTH.accentAmber,
      provenance,
    },
    { kind: 'text', text: `${example.athleteName}: ${example.signal} ` },
    { kind: 'chip', source: example.source, subject: example.athleteName, date: fmtAgo(example.syncedMinutesAgo) },
    { kind: 'text', text: `. ${prompt ? `On your question — ` : ''}I can drill into any athlete, or pull lineup readiness if you want a higher-altitude view.` },
  ]
}
