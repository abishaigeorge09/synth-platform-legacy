import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Menu,
  Plus,
  Send,
  Sparkles,
  X,
  MessageSquarePlus,
} from 'lucide-react'
import { SYNTH } from '../lib/theme'
import {
  useChatSessionsStore,
  type ChatSession,
} from '../store/useChatSessionsStore'
import { generateToolSpec } from '../../../lib/tools/mockGenerator'
import { ToolRenderer } from '../../../lib/tools/ToolRenderer'

const SUGGESTED_PROMPTS: string[] = [
  'Stroke rate logger that pulls from Concept2',
  'Wellness summary for the 1V',
  "Compare two athletes' last 4 erg pieces",
]

const LOADING_MESSAGES = [
  'Understanding your request…',
  'Composing components…',
  'Wiring data…',
] as const

const PHASE_DELAY_MS = 700
const FINAL_DELAY_MS = 600

type LoadingPhase = 0 | 1 | 2 | null

export function ToolsBuildPage() {
  const navigate = useNavigate()
  const { chatId } = useParams<{ chatId: string }>()
  const sessions = useChatSessionsStore((s) => s.sessions)
  const createSession = useChatSessionsStore((s) => s.createSession)
  const session = chatId ? sessions.find((s) => s.id === chatId) ?? null : null

  const [text, setText] = useState('')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  // Cleared on unmount; the Send pipeline checks it between awaits so
  // an unmount mid-flight doesn't trigger a navigate after teardown.
  const cancelRef = useRef(false)

  useEffect(() => {
    cancelRef.current = false
    return () => {
      cancelRef.current = true
    }
  }, [])

  const isLoading = loadingPhase !== null

  const fillPrompt = (prompt: string) => {
    setText(prompt)
    inputRef.current?.focus()
  }

  const newChat = () => {
    if (isLoading) return
    setText('')
    setMobileSidebarOpen(false)
    navigate('/app/coach/tools/build')
  }

  const onSend = async () => {
    const prompt = text.trim()
    if (!prompt || isLoading) return

    setText('')
    setLoadingPhase(0)
    await delay(PHASE_DELAY_MS)
    if (cancelRef.current) return
    setLoadingPhase(1)
    await delay(PHASE_DELAY_MS)
    if (cancelRef.current) return
    setLoadingPhase(2)
    await delay(FINAL_DELAY_MS)
    if (cancelRef.current) return

    const spec = generateToolSpec(prompt)
    const id = createSession(prompt, spec)
    setLoadingPhase(null)
    navigate(`/app/coach/tools/build/${id}`)
  }

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ fontFamily: SYNTH.font }}
    >
      <Header
        onBack={() => navigate('/app/coach/tools')}
        onToggleSidebar={() => setMobileSidebarOpen((v) => !v)}
      />

      <div className="flex min-h-0 flex-1">
        <DesktopSidebar
          sessions={sessions}
          activeId={chatId}
          onNewChat={newChat}
        />

        <MobileSidebar
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          sessions={sessions}
          activeId={chatId}
          onNewChat={newChat}
        />

        <section className="relative flex min-h-0 flex-1 flex-col">
          <div className="synth-scroll flex flex-1 flex-col items-center overflow-y-auto px-5 pb-[180px]">
            {isLoading ? (
              <LoadingState phase={loadingPhase} />
            ) : session ? (
              <SessionView session={session} />
            ) : (
              <EmptyCanvas onPickPrompt={fillPrompt} />
            )}
          </div>

          <ChatInput
            inputRef={inputRef}
            value={text}
            onChange={setText}
            onSend={onSend}
            disabled={isLoading}
          />
        </section>
      </div>
    </div>
  )
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

// ─── Header ────────────────────────────────────────────────────────────────

function Header({
  onBack,
  onToggleSidebar,
}: {
  onBack: () => void
  onToggleSidebar: () => void
}) {
  return (
    <header
      className="flex items-center gap-2 px-5 pb-3"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 32px)' }}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to tools"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{
          background: SYNTH.glass,
          backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          border: `1px solid ${SYNTH.glassBorder}`,
          color: SYNTH.inkOnBrand,
        }}
      >
        <ArrowLeft size={18} strokeWidth={2.2} />
      </button>

      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Open sidebar"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full md:hidden"
        style={{
          background: SYNTH.glass,
          backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          border: `1px solid ${SYNTH.glassBorder}`,
          color: SYNTH.inkOnBrand,
        }}
      >
        <Menu size={18} strokeWidth={2.2} />
      </button>

      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted }}
        >
          Custom tools
        </span>
        <span
          className="truncate text-[15px] font-bold leading-tight"
          style={{ color: SYNTH.inkOnBrand }}
        >
          Build a tool
        </span>
      </div>
    </header>
  )
}

// ─── Sidebar — desktop ─────────────────────────────────────────────────────

function DesktopSidebar({
  sessions,
  activeId,
  onNewChat,
}: {
  sessions: ChatSession[]
  activeId: string | undefined
  onNewChat: () => void
}) {
  return (
    <aside
      className="hidden shrink-0 flex-col gap-3 px-3 pb-6 pt-2 md:flex"
      style={{ width: 280 }}
    >
      <SidebarSurface>
        <NewChatButton onClick={onNewChat} />
        <SidebarBody sessions={sessions} activeId={activeId} />
      </SidebarSurface>
    </aside>
  )
}

// ─── Sidebar — mobile slide-in ─────────────────────────────────────────────

function MobileSidebar({
  open,
  onClose,
  sessions,
  activeId,
  onNewChat,
}: {
  open: boolean
  onClose: () => void
  sessions: ChatSession[]
  activeId: string | undefined
  onNewChat: () => void
}) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-[55] md:hidden"
            style={{ background: 'rgba(8,8,40,0.55)', backdropFilter: 'blur(4px)' }}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed left-0 top-0 z-[60] flex h-full flex-col gap-3 px-3 pb-6 md:hidden"
            style={{
              width: 280,
              paddingTop: 'max(env(safe-area-inset-top), 32px)',
            }}
          >
            <div className="flex items-center justify-end pr-1">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close sidebar"
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  background: SYNTH.glass,
                  backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
                  WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
                  border: `1px solid ${SYNTH.glassBorder}`,
                  color: SYNTH.inkOnBrand,
                }}
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>
            <SidebarSurface>
              <NewChatButton
                onClick={() => {
                  onClose()
                  onNewChat()
                }}
              />
              <SidebarBody
                sessions={sessions}
                activeId={activeId}
                onPick={onClose}
              />
            </SidebarSurface>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}

function SidebarSurface({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-1 flex-col gap-3 rounded-3xl p-3"
      style={{
        background: SYNTH.glass,
        backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        border: `1px solid ${SYNTH.glassBorder}`,
        boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset',
      }}
    >
      {children}
    </div>
  )
}

function NewChatButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-left"
      style={{
        background: 'rgba(255,255,255,0.10)',
        border: `1px solid ${SYNTH.glassBorder}`,
        color: SYNTH.inkOnBrand,
      }}
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-lg"
        style={{
          background: SYNTH.accentEmerald,
          color: SYNTH.inkOnBrand,
        }}
      >
        <Plus size={14} strokeWidth={2.6} />
      </span>
      <span className="text-[12px] font-bold uppercase tracking-[0.12em]">
        New chat
      </span>
    </motion.button>
  )
}

function SidebarBody({
  sessions,
  activeId,
  onPick,
}: {
  sessions: ChatSession[]
  activeId: string | undefined
  onPick?: () => void
}) {
  if (sessions.length === 0) {
    return <SidebarEmptyState />
  }
  return (
    <ul className="synth-scroll flex flex-1 flex-col gap-1 overflow-y-auto">
      {sessions.slice(0, 20).map((s) => {
        const active = s.id === activeId
        return (
          <li key={s.id}>
            <Link
              to={`/app/coach/tools/build/${s.id}`}
              onClick={onPick}
              className="block rounded-xl px-3 py-2"
              style={{
                background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
                border: `1px solid ${active ? SYNTH.glassBorder : 'transparent'}`,
              }}
            >
              <span
                className="block truncate text-[12px] font-semibold leading-tight"
                style={{ color: SYNTH.inkOnBrand }}
              >
                {s.title}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function SidebarEmptyState() {
  return (
    <div
      className="mt-1 flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl px-4 py-8 text-center"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px dashed ${SYNTH.glassBorder}`,
      }}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full"
        style={{
          background: 'rgba(255,255,255,0.10)',
          color: SYNTH.inkOnBrandMuted,
        }}
      >
        <MessageSquarePlus size={16} strokeWidth={2.2} />
      </span>
      <p
        className="text-[12px] font-bold"
        style={{ color: SYNTH.inkOnBrand }}
      >
        No tools yet
      </p>
      <p
        className="max-w-[200px] text-[11px] leading-[1.4]"
        style={{ color: SYNTH.inkOnBrandMuted }}
      >
        Describe one below to get started.
      </p>
    </div>
  )
}

// ─── Empty canvas (no chat yet) ────────────────────────────────────────────

function EmptyCanvas({ onPickPrompt }: { onPickPrompt: (prompt: string) => void }) {
  return (
    <div className="flex w-full max-w-[640px] flex-col items-center justify-center gap-6 py-10">
      <span
        className="text-[10px] font-bold uppercase tracking-[0.22em]"
        style={{ color: SYNTH.inkOnBrandFaint }}
      >
        Custom tools
      </span>
      <h1
        className="text-center text-[28px] font-bold leading-[1.15] tracking-[-0.01em] sm:text-[34px]"
        style={{ color: SYNTH.inkOnBrand }}
      >
        What should we build?
      </h1>
      <p
        className="max-w-[440px] text-center text-[13px] leading-[1.5]"
        style={{ color: SYNTH.inkOnBrandMuted }}
      >
        Describe a tool your program needs. synth will scaffold a working
        version and wire it to your sources.
      </p>

      <div className="flex w-full flex-col gap-2 px-1">
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <motion.button
            key={prompt}
            type="button"
            whileTap={{ scale: 0.99 }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04, duration: 0.28 }}
            onClick={() => onPickPrompt(prompt)}
            className="flex items-center gap-3 rounded-2xl p-3 text-left"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${SYNTH.glassBorder}`,
            }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: `1px solid ${SYNTH.glassBorder}`,
                color: SYNTH.accentEmerald,
              }}
            >
              <Sparkles size={14} strokeWidth={2.4} />
            </span>
            <p
              className="min-w-0 flex-1 truncate text-[13px] font-semibold"
              style={{ color: SYNTH.inkOnBrand }}
            >
              {prompt}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ─── Loading state ─────────────────────────────────────────────────────────

function LoadingState({ phase }: { phase: 0 | 1 | 2 }) {
  return (
    <div className="flex w-full max-w-[640px] flex-col items-center gap-5 py-20">
      <motion.span
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="block h-3 w-3 rounded-full"
        style={{
          background: SYNTH.accentEmerald,
          boxShadow: `0 0 16px ${SYNTH.accentEmerald}`,
        }}
      />
      <AnimatePresence mode="wait">
        <motion.span
          key={phase}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="text-[14px] font-semibold"
          style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
        >
          {LOADING_MESSAGES[phase]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

// ─── Session view (rendered tool) ──────────────────────────────────────────

function SessionView({ session }: { session: ChatSession }) {
  return (
    <motion.div
      key={session.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex w-full max-w-[640px] flex-col gap-4 py-6"
    >
      <div className="flex justify-end">
        <div
          className="flex max-w-[80%] flex-col gap-1.5 rounded-2xl px-4 py-3"
          style={{
            background: 'rgba(255,255,255,0.10)',
            border: `1px solid ${SYNTH.glassBorder}`,
          }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: SYNTH.inkOnBrandMuted }}
          >
            You
          </span>
          <span
            className="text-[13px] leading-[1.5]"
            style={{ color: SYNTH.inkOnBrand }}
          >
            {session.prompt}
          </span>
        </div>
      </div>

      <ToolRenderer spec={session.spec} />
    </motion.div>
  )
}

// ─── Chat input ────────────────────────────────────────────────────────────

type ChatInputProps = {
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (v: string) => void
  onSend: () => void
  disabled?: boolean
}

function ChatInput({ inputRef, value, onChange, onSend, disabled = false }: ChatInputProps) {
  const canSend = !disabled && value.trim().length > 0

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-4"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
    >
      <div
        className="pointer-events-auto flex w-full max-w-[640px] items-end gap-2 rounded-3xl px-3 py-2.5"
        style={{
          background: 'rgba(15, 18, 42, 0.62)',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow:
            '0 14px 36px rgba(8,8,40,0.35), 0 2px 6px rgba(8,8,40,0.18), inset 0 1px 0 rgba(255,255,255,0.16)',
        }}
      >
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (canSend) onSend()
            }
          }}
          rows={1}
          disabled={disabled}
          placeholder={disabled ? 'Generating…' : 'Describe a tool you need…'}
          className="max-h-32 flex-1 resize-none bg-transparent py-2 text-[14px] leading-[1.4] outline-none placeholder:opacity-50 disabled:opacity-50"
          style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          aria-label="Send"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full disabled:opacity-40"
          style={{
            background: canSend ? SYNTH.accentEmerald : 'rgba(255,255,255,0.10)',
            color: SYNTH.inkOnBrand,
            transition: 'background 120ms ease',
          }}
        >
          <Send size={15} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  )
}
