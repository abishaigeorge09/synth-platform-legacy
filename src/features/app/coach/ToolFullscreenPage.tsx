import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Settings, Sparkles, X, Trash2 } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { CANVAS_ENTER } from '../lib/motion'
import {
  useInstalledToolsStore,
  type InstalledToolMeta,
} from '../store/useInstalledToolsStore'

/**
 * Sprint 10 deliverable, pulled forward in Sprint 5.5 — fullscreen
 * native-app surface for an installed tool, mounted at
 * /app/coach/tools/:slug. Floating tab bar stays visible
 * (AppCoachShell does not hide on this prefix).
 *
 * Sprint 5.5 ships the route + component shell. End-to-end render of
 * a generated spec via this surface is exercised in Sprint 9 once
 * tool_versions rows carry validated specs.
 */
export function ToolFullscreenPage() {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()
  const tools = useInstalledToolsStore((s) => s.tools)
  const uninstall = useInstalledToolsStore((s) => s.uninstall)

  const tool = tools.find((t) => t.id === slug) ?? null
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (!tool) {
    return <Navigate to="/app/coach/tools" replace />
  }

  return (
    <motion.div
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ fontFamily: SYNTH.font }}
      {...CANVAS_ENTER}
    >
      <Header
        tool={tool}
        onBack={() => navigate('/app/coach/tools')}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="synth-scroll flex flex-1 flex-col overflow-y-auto px-5 pb-[120px]">
        <ToolBody tool={tool} />
      </div>

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        tool={tool}
        onUninstall={() => {
          uninstall(tool.id)
          navigate('/app/coach/tools')
        }}
      />
    </motion.div>
  )
}

function Header({
  tool,
  onBack,
  onOpenSettings,
}: {
  tool: InstalledToolMeta
  onBack: () => void
  onOpenSettings: () => void
}) {
  return (
    <header
      className="flex items-center gap-3 px-5 pb-3"
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

      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted }}
        >
          {tool.publisher}
        </span>
        <span
          className="truncate text-[18px] font-bold leading-tight"
          style={{ color: SYNTH.inkOnBrand }}
        >
          {tool.name}
        </span>
      </div>

      <button
        type="button"
        onClick={onOpenSettings}
        aria-label="Tool settings"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{
          background: SYNTH.glass,
          backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          border: `1px solid ${SYNTH.glassBorder}`,
          color: SYNTH.inkOnBrand,
        }}
      >
        <Settings size={18} strokeWidth={2.2} />
      </button>
    </header>
  )
}

function ToolBody({ tool }: { tool: InstalledToolMeta }) {
  // Sprint 5.5 — no spec attached to InstalledToolMeta yet. Sprint 9 ships
  // generated tools whose specs are pinned at install time; this body
  // will render <ToolRenderer spec={tool.spec} /> when that lands.
  return (
    <div className="flex w-full max-w-[640px] mx-auto flex-col gap-4 py-6">
      <div
        className="flex flex-col gap-3 rounded-3xl p-5"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${SYNTH.glassBorder}`,
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              background: tool.accent,
              color: SYNTH.ink,
              boxShadow: '0 8px 20px -8px rgba(8,8,40,0.45), 0 1px 0 rgba(255,255,255,0.4) inset',
            }}
          >
            <Sparkles size={20} strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <p
              className="text-[15px] font-bold leading-tight"
              style={{ color: SYNTH.inkOnBrand }}
            >
              {tool.name}
            </p>
            <p
              className="mt-0.5 text-[11px] uppercase tracking-[0.12em]"
              style={{ color: SYNTH.inkOnBrandMuted }}
            >
              {tool.version} · {tool.publisher}
            </p>
          </div>
        </div>
        <p
          className="text-[13px] leading-[1.5]"
          style={{ color: SYNTH.inkOnBrandMuted }}
        >
          {tool.shortDesc}
        </p>
      </div>

      <div
        className="flex flex-col items-center gap-2 rounded-3xl px-5 py-12 text-center"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px dashed ${SYNTH.glassBorder}`,
        }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted }}
        >
          Tool body
        </p>
        <p
          className="max-w-[320px] text-[12px] leading-[1.5]"
          style={{ color: SYNTH.inkOnBrandFaint }}
        >
          The rendered tool surface mounts here once Sprint 9 attaches generated specs to installed tools.
        </p>
      </div>
    </div>
  )
}

function SettingsSheet({
  open,
  onClose,
  tool,
  onUninstall,
}: {
  open: boolean
  onClose: () => void
  tool: InstalledToolMeta
  onUninstall: () => void
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
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(8,8,40,0.55)', backdropFilter: 'blur(6px)' }}
          />
          <motion.div
            initial={{ y: 600 }}
            animate={{ y: 0 }}
            exit={{ y: 600 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-[70] flex flex-col gap-4 px-5 pt-6 pb-[max(env(safe-area-inset-bottom),24px)]"
            style={{
              background: SYNTH.sheet,
              borderRadius: `${SYNTH.radius.sheet}px ${SYNTH.radius.sheet}px 0 0`,
              boxShadow: SYNTH.shadow.sheet,
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
              >
                Tool settings
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <p
                className="text-[18px] font-bold leading-tight"
                style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
              >
                {tool.name}
              </p>
              <p
                className="text-[12px]"
                style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
              >
                {tool.version} · {tool.publisher}
              </p>
            </div>

            <button
              type="button"
              onClick={onUninstall}
              className="mt-2 flex items-center gap-2 self-start rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em]"
              style={{
                background: 'rgba(230,74,60,0.12)',
                color: SYNTH.accentRed,
                border: `1px solid ${SYNTH.accentRed}55`,
                fontFamily: SYNTH.font,
              }}
            >
              <Trash2 size={14} strokeWidth={2.2} />
              Uninstall
            </button>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
