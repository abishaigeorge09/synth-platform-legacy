import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const SUGGESTED_PROMPTS: string[] = [
  'Stroke rate logger that pulls from Concept2',
  'Wellness summary for the 1V',
  "Compare two athletes' last 4 erg pieces",
]

export function ToolsBuildPage() {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const fillPrompt = (prompt: string) => {
    setText(prompt)
    inputRef.current?.focus()
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
        {/* Sidebar — desktop (md+) */}
        <DesktopSidebar />

        {/* Sidebar — mobile slide-in */}
        <MobileSidebar
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main canvas */}
        <section className="relative flex min-h-0 flex-1 flex-col">
          <div className="synth-scroll flex flex-1 flex-col items-center justify-center overflow-y-auto px-5 pb-[180px]">
            <Canvas onPickPrompt={fillPrompt} />
          </div>

          <ChatInput
            inputRef={inputRef}
            value={text}
            onChange={setText}
            onSend={() => {
              /* no-op in Sprint 1 */
            }}
          />
        </section>
      </div>
    </div>
  )
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

function DesktopSidebar() {
  return (
    <aside
      className="hidden shrink-0 flex-col gap-3 px-3 pb-6 pt-2 md:flex"
      style={{ width: 280 }}
    >
      <SidebarSurface>
        <NewChatButton />
        <SidebarEmptyState />
      </SidebarSurface>
    </aside>
  )
}

// ─── Sidebar — mobile slide-in ─────────────────────────────────────────────

function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
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
              <NewChatButton />
              <SidebarEmptyState />
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

function NewChatButton() {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        /* no-op in Sprint 1 — Sprint 2 wires chat threads */
      }}
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

// ─── Canvas ────────────────────────────────────────────────────────────────

function Canvas({ onPickPrompt }: { onPickPrompt: (prompt: string) => void }) {
  return (
    <div className="flex w-full max-w-[640px] flex-col items-center gap-6 py-10">
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

// ─── Chat input ────────────────────────────────────────────────────────────

type ChatInputProps = {
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (v: string) => void
  onSend: () => void
}

function ChatInput({ inputRef, value, onChange, onSend }: ChatInputProps) {
  const canSend = value.trim().length > 0

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
          placeholder="Describe a tool you need…"
          className="max-h-32 flex-1 resize-none bg-transparent py-2 text-[14px] leading-[1.4] outline-none placeholder:opacity-50"
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
