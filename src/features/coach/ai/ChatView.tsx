import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { THEME } from '../../../lib/theme'
import { SynthAiIllustration } from '../../../shared/illustrations/sidebarIllustrations'
import { useChatStore, threadKey, type ChatMsg } from '../../../shared/store/useChatStore'
import type { ChatScope } from '../../../shared/data/types'
import { generateCannedReply } from './cannedResponses'

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
  const threads = useChatStore((s) => s.threads)
  const messages = threads[key] ?? EMPTY_THREAD
  const append = useChatStore((s) => s.append)
  const reset = useChatStore((s) => s.reset)
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function send(content: string) {
    if (!content.trim()) return
    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      createdAt: Date.now(),
    }
    append(key, userMsg)
    setDraft('')

    setTimeout(() => {
      const reply = generateCannedReply(content, scope, scopedAthleteId)
      const asst: ChatMsg = {
        id: `a-${Date.now() + 1}`,
        role: 'assistant',
        content: reply.content,
        createdAt: Date.now(),
        citations: reply.citations,
      }
      append(key, asst)
    }, 420)
  }

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <header className="flex items-start justify-between px-10 pb-5 pt-8">
        <div>
          <div
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
          >
            {kicker}
          </div>
          <h1
            className="text-[32px] font-semibold leading-[1.1]"
            style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
          >
            {title}
          </h1>
          <div
            className="mt-1 text-[12px]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
          >
            {subtitle}
          </div>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => reset(key)}
            className="rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors hover:bg-zinc-50"
            style={{ borderColor: THEME.border, color: THEME.textSecondary, fontFamily: THEME.fontMono }}
          >
            Clear thread
          </button>
        )}
      </header>

      <div className="mx-10 flex flex-1 flex-col overflow-hidden rounded-2xl border"
        style={{ background: THEME.white, borderColor: THEME.border, minHeight: 520 }}
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
            placeholder={
              scope === 'athlete' && scopedAthleteName
                ? `Ask about ${scopedAthleteName.split(' ')[0]}…`
                : scope === 'self'
                ? 'Ask about your own training…'
                : 'Ask anything about the team…'
            }
            className="flex-1 rounded-full border px-4 py-2.5 text-[13px] outline-none"
            style={{
              background: THEME.white,
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
            onClick={() => onPick(s)}
            className="rounded-full border px-4 py-2 text-[11px] transition-colors hover:bg-zinc-50"
            style={{
              borderColor: THEME.border,
              background: THEME.white,
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
                  background: isUser ? 'rgba(255,255,255,0.1)' : THEME.white,
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
