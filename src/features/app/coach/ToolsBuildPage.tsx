import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Menu,
  Plus,
  Sparkles,
  X,
  MessageSquarePlus,
} from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { CANVAS_ENTER, THINKING_DOT } from '../lib/motion'
import {
  useChatSessionsStore,
  type ChatMessage,
  type ChatMessageRole,
  type ChatSession,
} from '../store/useChatSessionsStore'
import {
  useInstalledToolsStore,
  type InstalledToolMeta,
} from '../store/useInstalledToolsStore'
import { toast } from '../../../shared/store/useToastStore'
import { generateToolSpec, MockGenerationError } from '../../../lib/tools/mockGenerator'
import {
  generateToolViaEdge,
  ToolGenerateError,
} from '../../../lib/ai/toolGenerateClient'
import { publishToolVersion } from '../../../lib/ai/publishedTools'
import { trackToolEvent } from '../../../lib/telemetry'
import { captureError } from '../../../lib/sentry'
import { useCoachContextStore } from '../store/useCoachContext'
import { getAIClientMode } from '../lib/aiClient'
import { deriveQuestions } from '../../../lib/tools/clarifyingQuestions'
import type { ToolSpec } from '../../../lib/tools/schema'
import { ToolPreviewPanel } from './ToolPreviewPanel'
import { BuildChatInput } from '../primitives/BuildChatInput'

type ClarifyingState = {
  originalPrompt: string
  questions: string[]
  answered: { q: string; a: string }[]
}

type DeclineState = {
  prompt: string
  reason: string
  suggestedAlternative: string
}

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
type MobilePane = 'chat' | 'preview'

export function ToolsBuildPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { chatId } = useParams<{ chatId: string }>()
  const createSession = useChatSessionsStore((s) => s.createSession)
  const getSession = useChatSessionsStore((s) => s.getSession)
  const getRecent = useChatSessionsStore((s) => s.getRecent)
  const install = useInstalledToolsStore((s) => s.install)
  const isInstalled = useInstalledToolsStore((s) => s.isInstalled)
  // Resolve the active session via getSession so seeded examples load too.
  const session = chatId ? getSession(chatId) ?? null : null
  // Combined list (user sessions then seeded examples) for the sidebar.
  const recent = getRecent(20)

  const [text, setText] = useState('')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [mobilePane, setMobilePane] = useState<MobilePane>('preview')
  const [clarifyingState, setClarifyingState] = useState<ClarifyingState | null>(null)
  const [declineState, setDeclineState] = useState<DeclineState | null>(null)
  // Sprint 9.2 — multi-turn refinement: subsequent turns reuse this id
  // so server-side history (tool_versions rows) stitches together.
  const [toolRequestId, setToolRequestId] = useState<string | null>(null)
  const [unmetConnectors, setUnmetConnectors] = useState<string[]>([])
  // Sprint 10 — head coach can publish the most recently emitted spec.
  // Tracks the latest tool_versions.id with kind='spec' for this session.
  const [lastVersionId, setLastVersionId] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [publishedVersionIds, setPublishedVersionIds] = useState<Set<string>>(
    () => new Set(),
  )
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const cancelRef = useRef(false)

  // Sprint 9.2 — hydrate the coach's team_id + role once. Live tool-
  // generate path activates only when both are present (i.e. the user
  // has a row in `users`). Demo / anonymous users fall through to the
  // mock keyword matcher, preserving the existing demo experience.
  const coachContext = useCoachContextStore((s) => s.context)
  const hydrateCoachContext = useCoachContextStore((s) => s.hydrate)
  useEffect(() => {
    void hydrateCoachContext()
  }, [hydrateCoachContext])

  const liveGenerationAvailable =
    coachContext !== null && getAIClientMode() === 'live'

  useEffect(() => {
    cancelRef.current = false
    return () => {
      cancelRef.current = true
    }
  }, [])

  // Sprint 5.9 — Custom Tools catalog page can hand off an initial
  // prompt via location.state. Drop straight into the clarifying flow
  // so the coach lands mid-conversation, not at a blank textarea.
  const initialPrompt =
    (location.state as { initialPrompt?: string } | null)?.initialPrompt ?? null
  useEffect(() => {
    if (!initialPrompt || chatId) return
    const questions = deriveQuestions(initialPrompt)
    setMobilePane('chat')
    setClarifyingState({ originalPrompt: initialPrompt, questions, answered: [] })
    // Clear the state so a refresh doesn't re-trigger the same flow.
    navigate(location.pathname, { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt, chatId])

  const isLoading = loadingPhase !== null
  const previewSpec: ToolSpec | null = session?.spec ?? null

  const fillPrompt = (prompt: string) => {
    setText(prompt)
    inputRef.current?.focus()
  }

  const newChat = () => {
    if (isLoading) return
    setText('')
    setMobileSidebarOpen(false)
    setMobilePane('chat')
    setClarifyingState(null)
    setDeclineState(null)
    setToolRequestId(null)
    setUnmetConnectors([])
    setLastVersionId(null)
    navigate('/app/coach/tools/build')
  }

  const onPublish = async () => {
    if (!lastVersionId || publishing) return
    if (!coachContext || coachContext.role !== 'head_coach') return
    if (publishedVersionIds.has(lastVersionId)) {
      toast('Already published', 'info')
      return
    }
    setPublishing(true)
    try {
      await publishToolVersion(lastVersionId)
      setPublishedVersionIds((prev) => {
        const next = new Set(prev)
        next.add(lastVersionId)
        return next
      })
      if (session) {
        trackToolEvent('tool_published', {
          spec_id: session.spec.id,
          version_id: lastVersionId,
        })
      }
      toast(`${session?.spec.name ?? 'Tool'} published to your team`, 'success')
    } catch (err) {
      captureError(err, { area: 'tool-publish' })
      const message = err instanceof Error ? err.message : 'Publish failed'
      toast(message, 'error')
    } finally {
      setPublishing(false)
    }
  }

  const canPublish =
    Boolean(lastVersionId) &&
    coachContext?.role === 'head_coach' &&
    Boolean(session)
  const isPublished = lastVersionId !== null && publishedVersionIds.has(lastVersionId)

  const proceedToGenerate = async (basePrompt: string, answered: { q: string; a: string }[] = []) => {
    const augmented =
      answered.length > 0
        ? `${basePrompt} (${answered.map((qa) => qa.a).join(', ')})`
        : basePrompt

    setClarifyingState(null)
    setDeclineState(null)
    setText('')
    setErrorMessage(null)
    setLoadingPhase(0)
    await delay(PHASE_DELAY_MS)
    if (cancelRef.current) return
    setLoadingPhase(1)
    await delay(PHASE_DELAY_MS)
    if (cancelRef.current) return
    setLoadingPhase(2)
    await delay(FINAL_DELAY_MS)
    if (cancelRef.current) return

    // Read coach context fresh at the moment we're about to dispatch.
    // The render-time `liveGenerationAvailable` constant captures
    // whatever was true when this function reference was created;
    // if useCoachContext finished hydrating during the
    // clarifying-questions back-and-forth, the closure value is
    // stale and we'd wrongly fall into the mock path. Pulling
    // straight off the store here uses the latest value.
    const liveCtx = useCoachContextStore.getState().context
    const liveAvailable = liveCtx !== null && getAIClientMode() === 'live'

    if (liveAvailable && liveCtx) {
      trackToolEvent('tool_request_submitted', {
        prompt_length: augmented.length,
        is_refinement: toolRequestId !== null,
        mode: 'live',
      })
      try {
        const result = await generateToolViaEdge({
          description: augmented,
          role: liveCtx.role,
          team_id: liveCtx.team_id,
          tool_request_id: toolRequestId,
        })
        if (cancelRef.current) return
        setToolRequestId(result.tool_request_id)
        setLoadingPhase(null)

        if (result.kind === 'spec') {
          setUnmetConnectors(result.unmet_connectors)
          setLastVersionId(result.version_id)
          const elementCount =
            (result.spec.elements?.length ?? 0) +
            (result.spec.pages?.reduce((acc, p) => acc + p.elements.length, 0) ??
              0)
          trackToolEvent('tool_generated', {
            spec_id: result.spec.id,
            schema_version: result.spec.schema_version,
            element_count: elementCount,
            page_count: result.spec.pages?.length ?? 0,
            unmet_connectors: result.unmet_connectors,
            turn_number: result.turn_number,
            mode: 'live',
          })
          if (result.unmet_connectors.length > 0) {
            toast(
              `Built using demo data — connect ${result.unmet_connectors.join(', ')} for live numbers.`,
              'info',
            )
          }
          const id = createSession(augmented, result.spec)
          navigate(`/app/coach/tools/build/${id}`)
          return
        }

        if (result.kind === 'clarification') {
          setClarifyingState({
            originalPrompt: augmented,
            questions: result.questions,
            answered: [],
          })
          return
        }

        // result.kind === 'declined'
        trackToolEvent('tool_declined', {
          reason: result.reason,
          suggested_alternative: result.suggested_alternative,
          turn_number: result.turn_number,
        })
        setDeclineState({
          prompt: augmented,
          reason: result.reason,
          suggestedAlternative: result.suggested_alternative,
        })
        return
      } catch (err) {
        setLoadingPhase(null)
        captureError(err, {
          area: 'tool-generate',
          tags: { mode: 'live', is_refinement: toolRequestId !== null },
        })
        const message =
          err instanceof ToolGenerateError
            ? `Generation failed (${err.status}): ${err.message}`
            : 'Generation failed. Try again.'
        setErrorMessage(message)
        return
      }
    }

    // Mock fallback — demo profiles and any session without a live coach
    // context route here. Preserves the keyword-matcher experience that
    // shipped in Phase A.
    trackToolEvent('tool_request_submitted', {
      prompt_length: augmented.length,
      is_refinement: false,
      mode: 'mock',
    })
    try {
      const spec = generateToolSpec(augmented)
      const elementCount =
        spec.elements.length +
        (spec.pages?.reduce((acc, p) => acc + p.elements.length, 0) ?? 0)
      trackToolEvent('tool_generated', {
        spec_id: spec.id,
        schema_version: spec.schema_version,
        element_count: elementCount,
        page_count: spec.pages?.length ?? 0,
        unmet_connectors: [],
        turn_number: 1,
        mode: 'mock',
      })
      const id = createSession(augmented, spec)
      setUnmetConnectors([])
      setLoadingPhase(null)
      navigate(`/app/coach/tools/build/${id}`)
    } catch (err) {
      setLoadingPhase(null)
      const message =
        err instanceof MockGenerationError
          ? err.message
          : 'Generation failed. Try again.'
      setErrorMessage(message)
    }
  }

  const onSend = async () => {
    const prompt = text.trim()
    if (!prompt || isLoading) return

    // Live mode: defer clarifying to Claude — it picks between
    // emit_spec / request_clarification / decline_request itself, so
    // the keyword-derived questions only get in the way.
    // Mock mode: keep the keyword-derived clarifying flow on first send
    // so the demo path preserves its multi-step feel.
    if (!liveGenerationAvailable && !clarifyingState && !chatId) {
      const questions = deriveQuestions(prompt)
      setClarifyingState({ originalPrompt: prompt, questions, answered: [] })
      setText('')
      return
    }

    // Refinement on an existing session, or follow-up text in any state,
    // or any send in live mode → fire generation directly.
    await proceedToGenerate(prompt)
  }

  const onAnswerQuestion = (q: string, a: string) => {
    setClarifyingState((cs) =>
      cs ? { ...cs, answered: [...cs.answered, { q, a }] } : null,
    )
  }

  const onLooksGood = () => {
    if (!clarifyingState) return
    void proceedToGenerate(clarifyingState.originalPrompt, clarifyingState.answered)
  }

  const onSkipQuestions = () => {
    if (!clarifyingState) return
    void proceedToGenerate(clarifyingState.originalPrompt)
  }

  const onRefine = () => {
    // On mobile, switch to the chat pane so the input we're focusing is
    // actually on screen. Defer the focus call so the textarea is
    // mounted in the chat-pane DOM tree before we ask for focus.
    setMobilePane('chat')
    setText('Refine: ')
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const onOpenFullscreen = () => {
    if (!session) return
    // Sprint 5.8 — prefer spec.id when the tool is installed (the
    // installed-tools route owns that slug); otherwise fall back to the
    // session id so seeded examples and unsaved drafts still resolve.
    const slug = isInstalled(session.spec.id) ? session.spec.id : session.id
    navigate(`/app/coach/tools/${slug}`)
  }

  const onInstall = () => {
    if (!session) return
    if (isInstalled(session.spec.id)) {
      toast(`${session.spec.name} is already installed`, 'info')
      return
    }
    const meta: InstalledToolMeta = {
      id: session.spec.id,
      name: session.spec.name,
      shortDesc: session.spec.description,
      publisher: 'synth · custom',
      category: session.spec.category,
      accent: SYNTH.cardLemon,
      version: session.spec.version,
      loadMs: 50,
      to: `/app/coach/tools/${session.spec.id}`,
      iconKey: session.spec.icon_key,
    }
    install(meta)
    trackToolEvent('tool_installed', {
      spec_id: session.spec.id,
      source: 'build',
    })
    toast(`${session.spec.name} added to your collection`, 'success')
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

      {/* Mobile-only Chat | Preview toggle */}
      <PaneToggle
        pane={mobilePane}
        onChange={setMobilePane}
        hasPreview={Boolean(previewSpec)}
      />

      <div className="flex min-h-0 flex-1">
        <DesktopSidebar
          sessions={recent}
          activeId={chatId}
          onNewChat={newChat}
        />

        <MobileSidebar
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          sessions={recent}
          activeId={chatId}
          onNewChat={newChat}
        />

        {/* Preview pane (LEFT now — leads the eye, dominates the workspace).
            Visible always on ≥md; on <md only when mobilePane==='preview'. */}
        <section
          className={`relative min-h-0 flex-col md:flex md:flex-1 ${
            mobilePane === 'preview' ? 'flex flex-1' : 'hidden md:flex'
          }`}
        >
          <ToolPreviewPanel
            spec={previewSpec}
            unmetConnectors={unmetConnectors}
            actions={
              session
                ? {
                    installed: isInstalled(session.spec.id),
                    onInstall,
                    onRefine,
                    onOpenFullscreen,
                    publish: canPublish
                      ? {
                          published: isPublished,
                          publishing,
                          onPublish,
                        }
                      : null,
                  }
                : null
            }
          />
        </section>

        {/* Chat pane (RIGHT). Visible always on ≥md; on <md only when chat tab. */}
        <section
          className={`relative flex min-h-0 flex-col md:max-w-[440px] md:flex-1 ${
            mobilePane === 'chat' ? 'flex flex-1' : 'hidden md:flex'
          }`}
        >
          <motion.div
            className="synth-scroll flex flex-1 flex-col items-center overflow-y-auto px-5"
            {...CANVAS_ENTER}
          >
            {isLoading ? (
              <LoadingState phase={loadingPhase} />
            ) : errorMessage ? (
              <ErrorState
                message={errorMessage}
                onDismiss={() => setErrorMessage(null)}
              />
            ) : clarifyingState ? (
              <ClarifyingView
                state={clarifyingState}
                onAnswer={onAnswerQuestion}
                onLooksGood={onLooksGood}
                onSkip={onSkipQuestions}
              />
            ) : declineState ? (
              <DeclineView
                state={declineState}
                onTryAlternative={() => {
                  setText(declineState.suggestedAlternative)
                  setDeclineState(null)
                  inputRef.current?.focus()
                }}
                onDismiss={() => setDeclineState(null)}
              />
            ) : session ? (
              <SessionChatView session={session} />
            ) : (
              <EmptyCanvas
                key={chatId ?? 'empty'}
                onPickPrompt={fillPrompt}
              />
            )}
          </motion.div>

          <BuildChatInput
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

// ─── Mobile pane toggle ────────────────────────────────────────────────────

function PaneToggle({
  pane,
  onChange,
  hasPreview,
}: {
  pane: MobilePane
  onChange: (p: MobilePane) => void
  hasPreview: boolean
}) {
  return (
    <div className="flex justify-center px-5 pb-2 md:hidden">
      <div
        className="grid grid-cols-2 rounded-full p-1"
        style={{
          background: SYNTH.glass,
          backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          border: `1px solid ${SYNTH.glassBorder}`,
        }}
      >
        <ToggleButton
          label="Chat"
          active={pane === 'chat'}
          onClick={() => onChange('chat')}
        />
        <ToggleButton
          label="Preview"
          active={pane === 'preview'}
          onClick={() => onChange('preview')}
          dimmed={!hasPreview}
        />
      </div>
    </div>
  )
}

function ToggleButton({
  label,
  active,
  onClick,
  dimmed = false,
}: {
  label: string
  active: boolean
  onClick: () => void
  dimmed?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative rounded-full px-5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em]"
      style={{
        background: active ? SYNTH.inkOnBrand : 'transparent',
        color: active ? SYNTH.ink : dimmed ? SYNTH.inkOnBrandFaint : SYNTH.inkOnBrand,
        fontFamily: SYNTH.font,
      }}
    >
      {label}
    </button>
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
  // Split user sessions vs seeded examples for the rendered groupings.
  const userSessions = sessions.filter((s) => !s.seeded)
  const seededSessions = sessions.filter((s) => s.seeded)

  if (userSessions.length === 0 && seededSessions.length === 0) {
    return <SidebarEmptyState />
  }

  return (
    <ul className="synth-scroll flex flex-1 flex-col gap-1 overflow-y-auto">
      {userSessions.map((s) => (
        <SidebarRow
          key={s.id}
          session={s}
          active={s.id === activeId}
          onPick={onPick}
        />
      ))}
      {seededSessions.length > 0 ? (
        <>
          {userSessions.length > 0 ? (
            <li
              aria-hidden
              className="my-1.5 h-px"
              style={{ background: SYNTH.glassBorder }}
            />
          ) : null}
          <li
            aria-hidden
            className="px-2 pb-1 pt-1 text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.inkOnBrandFaint }}
          >
            Examples
          </li>
          {seededSessions.map((s) => (
            <SidebarRow
              key={s.id}
              session={s}
              active={s.id === activeId}
              onPick={onPick}
            />
          ))}
        </>
      ) : null}
    </ul>
  )
}

function SidebarRow({
  session,
  active,
  onPick,
}: {
  session: ChatSession
  active: boolean
  onPick?: () => void
}) {
  return (
    <li>
      <Link
        to={`/app/coach/tools/build/${session.id}`}
        onClick={onPick}
        className="flex items-center gap-2 rounded-xl px-3 py-2"
        style={{
          background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
          border: `1px solid ${active ? SYNTH.glassBorder : 'transparent'}`,
        }}
      >
        <span
          className="block min-w-0 flex-1 truncate text-[12px] font-semibold leading-tight"
          style={{ color: SYNTH.inkOnBrand }}
        >
          {session.title}
        </span>
        {session.seeded ? (
          <span
            className="shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em]"
            style={{
              background: 'rgba(255,255,255,0.10)',
              color: SYNTH.inkOnBrandMuted,
              border: `1px solid ${SYNTH.glassBorder}`,
            }}
          >
            Example
          </span>
        ) : null}
      </Link>
    </li>
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

function EmptyCanvas({
  onPickPrompt,
}: {
  onPickPrompt: (prompt: string) => void
}) {
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
        What should we build today?
      </h1>
      <p
        className="max-w-[440px] text-center text-[13px] leading-[1.5]"
        style={{ color: SYNTH.inkOnBrandMuted }}
      >
        Describe a tool your program needs. synth will scaffold a working version and wire it to your sources.
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
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={THINKING_DOT.animate}
            transition={{ ...THINKING_DOT.transition, delay: i * 0.2 }}
            className="block h-2.5 w-2.5 rounded-full"
            style={{
              background: SYNTH.accentEmerald,
              boxShadow: `0 0 14px ${SYNTH.accentEmerald}`,
            }}
          />
        ))}
      </div>
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

// ─── Error state ───────────────────────────────────────────────────────────

function ErrorState({
  message,
  onDismiss,
}: {
  message: string
  onDismiss: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="flex w-full max-w-[480px] flex-col items-center gap-3 py-20"
    >
      <span
        className="text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{ color: SYNTH.accentRed }}
      >
        Generation failed
      </span>
      <p
        className="text-center text-[13px] leading-[1.5]"
        style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
      >
        {message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em]"
        style={{
          background: SYNTH.glass,
          backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          border: `1px solid ${SYNTH.glassBorder}`,
          color: SYNTH.inkOnBrand,
        }}
      >
        Try again
      </button>
    </motion.div>
  )
}

// ─── Decline view (Sprint 9.2 — Claude declined the request) ──────────────

function DeclineView({
  state,
  onTryAlternative,
  onDismiss,
}: {
  state: DeclineState
  onTryAlternative: () => void
  onDismiss: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex w-full max-w-[640px] flex-col gap-3 py-6"
    >
      {/* User bubble — what they asked for */}
      <div className="flex justify-end">
        <div
          className="flex max-w-[85%] flex-col gap-1.5 rounded-2xl px-4 py-3"
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
            {state.prompt}
          </span>
        </div>
      </div>

      {/* synth bubble — decline + reason + alternative chip */}
      <div className="flex justify-start">
        <div
          className="flex max-w-[88%] flex-col gap-3 rounded-2xl px-4 py-3"
          style={{
            background: 'rgba(16,185,129,0.10)',
            border: `1px solid ${SYNTH.accentEmerald}55`,
          }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: SYNTH.accentEmerald }}
          >
            synth · MVP scope
          </span>
          <span
            className="text-[13px] leading-[1.5]"
            style={{ color: SYNTH.inkOnBrand }}
          >
            {state.reason}
          </span>
          {state.suggestedAlternative ? (
            <div className="flex flex-col gap-2">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: SYNTH.inkOnBrandMuted }}
              >
                Try instead
              </span>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={onTryAlternative}
                className="flex items-center gap-2 self-start rounded-2xl px-3 py-2 text-left"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  border: `1px solid ${SYNTH.glassBorder}`,
                }}
              >
                <Sparkles size={12} strokeWidth={2.4} color={SYNTH.accentEmerald} />
                <span
                  className="text-[12px] font-semibold leading-[1.4]"
                  style={{ color: SYNTH.inkOnBrand }}
                >
                  {state.suggestedAlternative}
                </span>
              </motion.button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex justify-start pl-1">
        <button
          type="button"
          onClick={onDismiss}
          className="text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Dismiss · ask something else
        </button>
      </div>
    </motion.div>
  )
}

// ─── Session chat view (multi-turn transcript, no action chips) ───────────
// Sprint 5.8 — chat panel is conversation only. Workflow chips
// (Install / Refine / Open fullscreen) live under the preview phone
// frame so the preview owns the "this is the working app" surface.

function SessionChatView({ session }: { session: ChatSession }) {
  // Multi-turn when the seeded example or future user session carries
  // a `messages` transcript. Single-turn fallback: just the original
  // prompt + a generated "Built X" assistant turn.
  const messages: ChatMessage[] =
    session.messages && session.messages.length > 0
      ? session.messages
      : [
          { role: 'user', content: session.prompt },
          {
            role: 'assistant',
            content: `Built **${session.spec.name}** — see the preview.`,
          },
        ]

  return (
    <motion.div
      key={session.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex w-full max-w-[640px] flex-col gap-3 py-6"
    >
      {messages.map((msg, i) => (
        <ChatBubble key={i} role={msg.role} content={msg.content} index={i} />
      ))}

      <BuiltBadge spec={session.spec} />
    </motion.div>
  )
}

function ChatBubble({
  role,
  content,
  index,
}: {
  role: ChatMessageRole
  content: string
  index: number
}) {
  const isUser = role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.24 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className="flex max-w-[85%] flex-col gap-1.5 rounded-2xl px-4 py-3"
        style={{
          background: isUser
            ? 'rgba(255,255,255,0.10)'
            : 'rgba(255,255,255,0.04)',
          border: `1px solid ${SYNTH.glassBorder}`,
        }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: SYNTH.inkOnBrandMuted }}
        >
          {isUser ? 'You' : 'synth'}
        </span>
        <div
          className="whitespace-pre-line text-[13px] leading-[1.55]"
          style={{ color: SYNTH.inkOnBrand }}
        >
          {renderInlineMarkdown(content)}
        </div>
      </div>
    </motion.div>
  )
}

function BuiltBadge({ spec }: { spec: ChatSession['spec'] }) {
  return (
    <div className="flex justify-start">
      <div
        className="flex max-w-[85%] items-center gap-2 rounded-2xl px-3.5 py-2"
        style={{
          background: 'rgba(16,185,129,0.10)',
          border: `1px solid ${SYNTH.accentEmerald}55`,
        }}
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{
            background: SYNTH.accentEmerald,
            boxShadow: `0 0 0 3px ${SYNTH.accentEmerald}33`,
          }}
        />
        <span
          className="text-[11px] font-semibold"
          style={{ color: SYNTH.inkOnBrand }}
        >
          Live preview ready
        </span>
        <span
          className="text-[11px]"
          style={{ color: SYNTH.inkOnBrandMuted }}
        >
          — {spec.name}
        </span>
      </div>
    </div>
  )
}

// Lightweight inline **bold** renderer so the seeded conversation can
// emphasize page names without pulling in a markdown parser. Anything
// else (lists, headings) renders as plain text via whitespace-pre-line.
function renderInlineMarkdown(content: string): React.ReactNode {
  const parts = content.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: SYNTH.inkOnBrand }}>
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

// ─── Clarifying view (chips before generation) ────────────────────────────

function ClarifyingView({
  state,
  onAnswer,
  onLooksGood,
  onSkip,
}: {
  state: ClarifyingState
  onAnswer: (q: string, a: string) => void
  onLooksGood: () => void
  onSkip: () => void
}) {
  const remaining = state.questions.filter(
    (q) => !state.answered.some((a) => a.q === q),
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex w-full max-w-[640px] flex-col gap-3 py-6"
    >
      <div className="flex justify-end">
        <div
          className="flex max-w-[85%] flex-col gap-1.5 rounded-2xl px-4 py-3"
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
            {state.originalPrompt}
          </span>
        </div>
      </div>

      <div className="flex justify-start">
        <div
          className="flex max-w-[85%] flex-col gap-2 rounded-2xl px-4 py-3"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${SYNTH.glassBorder}`,
          }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: SYNTH.inkOnBrandMuted }}
          >
            synth
          </span>
          <span
            className="text-[13px] leading-[1.5]"
            style={{ color: SYNTH.inkOnBrand }}
          >
            Before I build, a few quick questions:
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 pl-2">
        {remaining.map((q) => (
          <motion.button
            key={q}
            type="button"
            whileTap={{ scale: 0.99 }}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            onClick={() => onAnswer(q, q)}
            className="flex items-center gap-2 rounded-2xl px-3 py-2 text-left"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${SYNTH.glassBorder}`,
            }}
          >
            <Sparkles size={12} strokeWidth={2.4} color={SYNTH.accentEmerald} />
            <span
              className="text-[12px] font-semibold"
              style={{ color: SYNTH.inkOnBrand }}
            >
              {q}
            </span>
          </motion.button>
        ))}
      </div>

      {state.answered.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pl-2">
          {state.answered.map((qa) => (
            <span
              key={qa.q}
              className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
              style={{
                background: 'rgba(16,185,129,0.14)',
                color: SYNTH.accentEmerald,
                border: `1px solid ${SYNTH.accentEmerald}55`,
              }}
            >
              {qa.a}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onLooksGood}
          className="rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{
            background: SYNTH.accentEmerald,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
          }}
        >
          Looks good →
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onSkip}
          className="rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: `1px solid ${SYNTH.glassBorder}`,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
          }}
        >
          Skip questions
        </motion.button>
      </div>
    </motion.div>
  )
}

