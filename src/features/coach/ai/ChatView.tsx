import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { THEME } from '../../../lib/theme'
import { streamClaudeMessages, selectModel } from '../../../lib/ai/claude'
import { isClaudeConfigured } from '../../../lib/ai/env'
import { coachPromptFromSeeds } from '../../../lib/ai/prompts'
import { buildIngestionContext } from '../../../lib/ai/ingestionContext'
import { useAthletes } from '../../../shared/data/queries'
import { SynthAiIllustration } from '../../../shared/illustrations/sidebarIllustrations'
import { useChatStore, threadKey, type ChatMsg, type ArchivedThread } from '../../../shared/store/useChatStore'
import { useTeamStore } from '../../../shared/store/useTeamStore'
import type { ChatScope } from '../../../shared/data/types'
import { generateCannedReply } from './cannedResponses'
import { posthog } from '../../../shared/analytics/posthog'

const EMPTY_THREAD: ChatMsg[] = []

export function ChatView({
  scope,
  scopedAthleteId,
  scopedAthleteName,
  kicker,
  title,
  subtitle,
  suggestions,
}: {
  scope: ChatScope
  scopedAthleteId?: string
  scopedAthleteName?: string
  kicker: string
  title: string
  subtitle: string
  suggestions: string[]
}) {
  const key = useMemo(() => threadKey(scope, scopedAthleteId), [scope, scopedAthleteId])
  const activeTeam = useTeamStore((s) => s.activeTeam)
  const activeTeamId = activeTeam.id
  const { data: rosterAthletes } = useAthletes()
  const threads = useChatStore((s) => s.threads)
  const messages = threads[key] ?? EMPTY_THREAD
  const append = useChatStore((s) => s.append)
  const patchMessage = useChatStore((s) => s.patchMessage)
  const reset = useChatStore((s) => s.reset)
  const archivedThreads = useChatStore((s) => s.archivedThreads)
  const restoreThread = useChatStore((s) => s.restoreThread)
  const scopeArchived = useMemo(
    () => archivedThreads.filter((a) => a.key === key),
    [archivedThreads, key],
  )
  const [historyOpen, setHistoryOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  async function send(content: string) {
    if (!content.trim()) return
    const trimmed = content.trim()
    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: Date.now(),
    }
    const priorForApi = (threads[key] ?? EMPTY_THREAD)
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content)
      .slice(-12)
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    posthog.capture('ai_message_sent', {
      scope,
      athlete_id: scopedAthleteId,
      message_length: trimmed.length,
      thread_length: (threads[key] ?? EMPTY_THREAD).length,
    })

    append(key, userMsg)
    setDraft('')

    if (!isClaudeConfigured() || scope === 'self') {
      setTyping(true)
      setTimeout(() => {
        const reply = generateCannedReply(trimmed, scope, scopedAthleteId, activeTeamId)
        const asst: ChatMsg = {
          id: `a-${Date.now() + 1}`,
          role: 'assistant',
          content: reply.content,
          createdAt: Date.now(),
          citations: reply.citations,
        }
        append(key, asst)
        setTyping(false)
      }, 680)
      return
    }

    let system = coachPromptFromSeeds(
      activeTeamId,
      activeTeam.name,
      scope === 'athlete' ? scopedAthleteId : undefined,
    )
    // Inject the coach's actually-ingested events as context. This is
    // what makes the file-upload pipeline visible from chat: ask
    // "what was Maria's 2k last Friday?" and Claude cites the CSV.
    const targetAthleteName =
      scope === 'athlete' && scopedAthleteId
        ? rosterAthletes.find((a) => a.id === scopedAthleteId)?.name
        : undefined
    const ingestionBlock = await buildIngestionContext({
      athleteId: scope === 'athlete' ? scopedAthleteId : undefined,
      teamId: activeTeamId,
      athleteName: targetAthleteName,
    })
    if (ingestionBlock) {
      system = `${system}\n\n${ingestionBlock}`
    }
    const model = selectModel(trimmed, system)
    const asstId = `a-${Date.now() + 1}`
    append(key, {
      id: asstId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
    })
    setTyping(true)

    try {
      await streamClaudeMessages({
        system,
        model,
        messages: [...priorForApi, { role: 'user' as const, content: trimmed }],
        onTextDelta: (full) => {
          setTyping(false)
          patchMessage(key, asstId, { content: full })
        },
      })
    } catch {
      setTyping(false)
      const reply = generateCannedReply(trimmed, scope, scopedAthleteId, activeTeamId)
      patchMessage(key, asstId, { content: reply.content, citations: reply.citations })
    }
    setTyping(false)
  }

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <header className="flex items-center justify-between px-5 sm:px-10 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ background: `${THEME.primary}18` }}
            aria-hidden
          >
            <SynthAiIllustration size={20} />
          </div>
          <div>
            <div
              className="text-[9px] font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
            >
              {kicker}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h1
                className="text-[18px] font-semibold leading-tight"
                style={{ fontFamily: THEME.fontSans, color: THEME.textPrimary }}
              >
                {title}
              </h1>
              <ScopeBadge scope={scope} athleteName={scopedAthleteName} />
            </div>
            <div
              className="text-[12px] leading-snug"
              style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary }}
            >
              {subtitle}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {scopeArchived.length > 0 && (
            <button
              type="button"
              onClick={() => setHistoryOpen((p) => !p)}
              className="rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors hover:bg-zinc-50"
              style={{
                borderColor: historyOpen ? THEME.primary : THEME.border,
                color: historyOpen ? THEME.primary : THEME.textSecondary,
                fontFamily: THEME.fontMono,
              }}
            >
              History ({scopeArchived.length})
            </button>
          )}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => reset(key)}
              className="rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors hover:bg-zinc-50"
              style={{ borderColor: THEME.border, color: THEME.textSecondary, fontFamily: THEME.fontMono }}
            >
              Clear
            </button>
          )}
        </div>
      </header>

      <AnimatePresence>
        {historyOpen && scopeArchived.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <ThreadHistory
              threads={scopeArchived}
              onRestore={(id) => {
                restoreThread(id)
                setHistoryOpen(false)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-5 flex flex-1 flex-col overflow-hidden rounded-2xl border sm:mx-10"
        style={{ background: 'var(--bg-primary)', borderColor: THEME.border, minHeight: 520 }}
      >
        <div ref={scrollRef} className="synth-scroll flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            <EmptyState
              suggestions={suggestions}
              onPick={send}
              scopedAthleteName={scopedAthleteName}
            />
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((m) => (
                <Message key={m.id} msg={m} />
              ))}
              {typing && (
                <div className="flex items-center gap-2" style={{ color: THEME.textSecondary }}>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: `${THEME.primary}18` }}>
                    <SynthAiIllustration size={18} />
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ background: THEME.primary }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ fontFamily: THEME.fontMono }}>
                    synth. is typing
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="flex items-center gap-2 border-t p-3"
          style={{ borderColor: THEME.border, background: THEME.light }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(draft)}
            aria-label="Chat message"
            placeholder={
              scope === 'athlete' && scopedAthleteName
                ? `Ask about ${scopedAthleteName.split(' ')[0]}…`
                : scope === 'self'
                ? 'Ask about your own training…'
                : 'Ask anything about the team…'
            }
            className="flex-1 rounded-full border px-4 py-2.5 text-[13px] outline-none"
            style={{
              background: 'var(--bg-primary)',
              borderColor: THEME.border,
              color: THEME.textPrimary,
            }}
          />
          <button
            type="button"
            onClick={() => send(draft)}
            disabled={!draft.trim()}
            className="rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02] disabled:opacity-40"
            style={{
              background: THEME.primary,
              color: THEME.white,
              fontFamily: THEME.fontMono,
            }}
          >
            Send →
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyState({
  suggestions,
  onPick,
  scopedAthleteName,
}: {
  suggestions: string[]
  onPick: (q: string) => void
  scopedAthleteName?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: `${THEME.primary}14` }}
      >
        <SynthAiIllustration size={28} />
      </div>
      <div>
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
        >
          synth. AI
        </div>
        <div className="mt-1 text-[19px] font-semibold" style={{ color: THEME.textPrimary }}>
          {scopedAthleteName ? `Ask anything about ${scopedAthleteName}` : 'Ask anything'}
        </div>
        <div className="mt-1 max-w-[520px] text-[12px]" style={{ color: THEME.textSecondary }}>
          Every answer cites the sources it drew from — erg workbooks, TeamWorks, Whoop, email digests.
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { posthog.capture('ai_suggestion_clicked', { suggestion: s }); onPick(s) }}
            className="rounded-full border px-4 py-2 text-[11px] transition-colors hover:bg-zinc-50"
            style={{
              borderColor: THEME.border,
              background: 'var(--bg-primary)',
              color: THEME.textPrimary,
              fontFamily: THEME.fontMono,
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function Message({ msg }: { msg: ChatMsg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className="max-w-[72%] rounded-2xl px-4 py-3"
        style={{
          background: isUser ? THEME.primary : THEME.light,
          border: `1px solid ${isUser ? THEME.primary : THEME.border}`,
          color: isUser ? THEME.white : THEME.textPrimary,
        }}
      >
        <div
          className="text-[13px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderBold(msg.content) }}
        />
        {msg.citations && msg.citations.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {msg.citations.map((c, i) => (
              <span
                key={i}
                className="rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                style={{
                  background: isUser ? 'rgba(255,255,255,0.1)' : 'var(--bg-primary)',
                  borderColor: isUser ? 'rgba(255,255,255,0.22)' : THEME.border,
                  color: isUser ? 'rgba(255,255,255,0.9)' : THEME.textSecondary,
                  fontFamily: THEME.fontMono,
                }}
              >
                {c.label} · {c.source}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function renderBold(s: string) {
  return s.replace(
    /\*\*([^*]+)\*\*/g,
    `<strong style="font-weight:600">$1</strong>`,
  )
}

function formatArchivedThreadTime(ts: number) {
  const d = new Date(ts)
  const now = Date.now()
  const diff = now - ts
  if (diff < 60_000) return 'Just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function ThreadHistory({
  threads,
  onRestore,
}: {
  threads: ArchivedThread[]
  onRestore: (id: string) => void
}) {
  return (
    <div className="mx-5 mb-3 sm:mx-10">
      <div
        className="rounded-xl border p-3"
        style={{ background: 'var(--bg-primary)', borderColor: THEME.border }}
      >
        <div
          className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          Previous threads
        </div>
        <div className="flex flex-col gap-1.5">
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onRestore(t.id)}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors hover:bg-zinc-50"
              style={{ borderColor: THEME.border }}
            >
              <div className="min-w-0 flex-1">
                <div
                  className="truncate text-[12px]"
                  style={{ color: THEME.textPrimary }}
                >
                  {t.preview}
                </div>
                <div
                  className="mt-0.5 text-[10px]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                >
                  {t.messageCount} messages · {formatArchivedThreadTime(t.archivedAt)}
                </div>
              </div>
              <span
                className="ml-3 shrink-0 text-[10px] font-semibold uppercase tracking-wider"
                style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
              >
                Restore
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const SCOPE_META: Record<ChatScope, { label: string; color: string }> = {
  team: { label: 'Team scope', color: THEME.primary },
  athlete: { label: 'Athlete scope', color: THEME.cyan },
  self: { label: 'My data', color: THEME.purple },
}

function ScopeBadge({ scope, athleteName }: { scope: ChatScope; athleteName?: string }) {
  const meta = SCOPE_META[scope]
  const label = scope === 'athlete' && athleteName
    ? `${athleteName}`
    : meta.label
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
      style={{
        fontFamily: THEME.fontMono,
        borderColor: meta.color,
        color: meta.color,
        background: `${meta.color}0A`,
      }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: meta.color }}
      />
      {label}
    </span>
  )
}
