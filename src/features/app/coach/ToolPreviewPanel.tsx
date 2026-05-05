import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Settings,
  Home,
  Boxes,
  Sparkles,
  X,
  Check,
  PencilLine,
  Maximize2,
  RefreshCw,
} from 'lucide-react'
import type { ToolSpec } from '../../../lib/tools/schema'
import { ToolRenderer } from '../../../lib/tools/ToolRenderer'
import { SYNTH } from '../lib/theme'

/**
 * Phone-frame app-shell wrapper for the Build workspace's preview pane.
 * Coaches see their tool rendered as if it were already installed —
 * top bar with name + back + functional settings, the spec body
 * full-bleed below, simulated bottom-tab strip, all wrapped in a
 * device-shaped frame.
 *
 * Sprint 5.5 — sibling component `ToolFullscreenPage` shares the inner
 * layout but mounts at viewport scale.
 *
 * Sprint 5.8 — preview owns the workflow chips (Install / Refine /
 * Open fullscreen). Settings opens a real bottom sheet. Spec interaction
 * lives entirely inside the phone frame, so the chat panel can stay
 * focused on conversation.
 */
type PreviewActions = {
  installed: boolean
  onInstall: () => void
  onRefine: () => void
  onOpenFullscreen: () => void
}

export function ToolPreviewPanel({
  spec,
  actions,
}: {
  spec: ToolSpec | null
  actions: PreviewActions | null
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  // `rendererKey` bumps to force a fresh mount of <ToolRenderer> — used
  // by the Reset action in the settings sheet to clear instance state.
  const [rendererKey, setRendererKey] = useState(0)

  return (
    <div className="flex flex-1 flex-col items-center justify-start gap-4 p-6">
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: '100%',
          maxWidth: 390,
          flex: '1 1 auto',
          maxHeight: 760,
          minHeight: 520,
          borderRadius: 36,
          background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
          border: '8px solid rgba(8, 8, 40, 0.85)',
          boxShadow:
            '0 32px 80px -20px rgba(8,8,40,0.55), 0 0 0 1px rgba(255,255,255,0.08) inset, 0 12px 28px rgba(8,8,40,0.45)',
          fontFamily: SYNTH.font,
        }}
      >
        <PreviewTopBar
          name={spec?.name ?? null}
          onSettings={spec ? () => setSettingsOpen(true) : null}
        />
        <div className="synth-scroll relative flex flex-1 flex-col overflow-y-auto px-4 pb-20 pt-3">
          {spec ? (
            <ToolRenderer key={rendererKey} spec={spec} />
          ) : (
            <PreviewEmptyState />
          )}
        </div>
        <PreviewTabBar />

        <SettingsSheet
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          spec={spec}
          onReset={() => {
            setRendererKey((k) => k + 1)
            setSettingsOpen(false)
          }}
        />
      </div>

      {spec && actions ? <ActionChipRow spec={spec} actions={actions} /> : null}
    </div>
  )
}

function PreviewTopBar({
  name,
  onSettings,
}: {
  name: string | null
  onSettings: (() => void) | null
}) {
  return (
    <header
      className="flex items-center gap-2 px-4"
      style={{ paddingTop: 18, paddingBottom: 12 }}
    >
      <span
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{
          background: SYNTH.glass,
          border: `1px solid ${SYNTH.glassBorder}`,
          color: SYNTH.inkOnBrand,
        }}
      >
        <ArrowLeft size={14} strokeWidth={2.2} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className="text-[8px] font-bold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted }}
        >
          Custom tool
        </span>
        <span
          className="truncate text-[13px] font-bold leading-tight"
          style={{ color: SYNTH.inkOnBrand }}
        >
          {name ?? 'Untitled tool'}
        </span>
      </div>
      <button
        type="button"
        onClick={onSettings ?? undefined}
        disabled={!onSettings}
        aria-label="Tool settings"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full disabled:opacity-50"
        style={{
          background: SYNTH.glass,
          border: `1px solid ${SYNTH.glassBorder}`,
          color: onSettings ? SYNTH.inkOnBrand : SYNTH.inkOnBrandMuted,
        }}
      >
        <Settings size={14} strokeWidth={2.2} />
      </button>
    </header>
  )
}

function PreviewEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{
          background: 'rgba(255,255,255,0.10)',
          color: SYNTH.inkOnBrandFaint,
        }}
      >
        <Sparkles size={16} strokeWidth={2.2} />
      </span>
      <p
        className="text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{ color: SYNTH.inkOnBrandMuted }}
      >
        Live preview
      </p>
      <p
        className="max-w-[240px] text-[12px] leading-[1.5]"
        style={{ color: SYNTH.inkOnBrandFaint }}
      >
        Your tool will appear here as you describe it. Try one of the prompt chips on the left to see an example.
      </p>
    </div>
  )
}

function PreviewTabBar() {
  // Decorative — non-interactive simulation of the floating tab bar so the
  // preview reads as a real app screen, not a card.
  const items = [
    { icon: <Home size={14} strokeWidth={2.2} />, label: 'Home' },
    { icon: <Boxes size={14} strokeWidth={2.2} />, label: 'Tools', active: true },
    { icon: <Sparkles size={14} strokeWidth={2.2} />, label: 'AI' },
  ]
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center"
      style={{ paddingBottom: 6 }}
    >
      <div
        className="flex items-center gap-1 rounded-full px-2 py-1.5"
        style={{
          background: 'rgba(15, 18, 42, 0.72)',
          backdropFilter: 'blur(12px) saturate(140%)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 6px 18px rgba(8,8,40,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
        }}
      >
        {items.map((it) => (
          <span
            key={it.label}
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{
              background: it.active ? 'rgba(255,255,255,0.16)' : 'transparent',
              border: it.active ? '1px solid rgba(255,255,255,0.22)' : '1px solid transparent',
              color: it.active ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
            }}
          >
            {it.icon}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Action chip row (Sprint 5.8 — under the phone frame) ────────────────

function ActionChipRow({
  spec,
  actions,
}: {
  spec: ToolSpec
  actions: PreviewActions
}) {
  return (
    <div className="flex w-full max-w-[420px] flex-wrap items-center justify-center gap-2">
      <PreviewChip
        label={actions.installed ? 'Installed' : 'Install'}
        icon={actions.installed ? <Check size={13} strokeWidth={2.6} /> : null}
        onClick={actions.onInstall}
        variant={actions.installed ? 'subtle' : 'primary'}
        title={
          actions.installed
            ? `${spec.name} is in your collection`
            : `Add ${spec.name} to your collection`
        }
      />
      <PreviewChip
        label="Refine"
        icon={<PencilLine size={12} strokeWidth={2.4} />}
        onClick={actions.onRefine}
      />
      <PreviewChip
        label="Open fullscreen"
        icon={<Maximize2 size={12} strokeWidth={2.4} />}
        onClick={actions.onOpenFullscreen}
      />
    </div>
  )
}

function PreviewChip({
  label,
  icon,
  onClick,
  variant = 'subtle',
  title,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'subtle'
  title?: string
}) {
  const isPrimary = variant === 'primary'
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      title={title}
      className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em]"
      style={{
        background: isPrimary ? SYNTH.accentEmerald : 'rgba(255,255,255,0.10)',
        border: `1px solid ${isPrimary ? SYNTH.accentEmerald : SYNTH.glassBorder}`,
        color: SYNTH.inkOnBrand,
        fontFamily: SYNTH.font,
        boxShadow: isPrimary ? '0 6px 18px rgba(16,185,129,0.30)' : 'none',
      }}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  )
}

// ─── Settings sheet (Sprint 5.8 — bottom sheet inside the phone frame) ────

function SettingsSheet({
  open,
  onClose,
  spec,
  onReset,
}: {
  open: boolean
  onClose: () => void
  spec: ToolSpec | null
  onReset: () => void
}) {
  return (
    <AnimatePresence>
      {open && spec ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="absolute inset-0 z-20"
            style={{ background: 'rgba(8,8,40,0.55)', backdropFilter: 'blur(6px)' }}
          />
          <motion.div
            initial={{ y: 600 }}
            animate={{ y: 0 }}
            exit={{ y: 600 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="absolute inset-x-0 bottom-0 z-30 flex flex-col gap-3 px-5 pb-6 pt-5"
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
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}
              >
                <X size={14} strokeWidth={2.2} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <p
                className="text-[16px] font-bold leading-tight"
                style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
              >
                {spec.name}
              </p>
              <p
                className="text-[11px]"
                style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
              >
                v{spec.version} · {spec.category} · {spec.scope}
              </p>
            </div>

            <SettingsRow label="Tool ID" value={spec.id} />
            <SettingsRow
              label="Pages"
              value={
                spec.pages && spec.pages.length > 0
                  ? `${spec.pages.length} (${spec.pages.map((p) => p.title).join(' · ')})`
                  : 'Single screen'
              }
            />
            <SettingsRow
              label="Bindings"
              value={Object.keys(spec.bindings).length.toString()}
            />

            <button
              type="button"
              onClick={onReset}
              className="mt-2 flex items-center justify-center gap-2 rounded-full py-2.5 text-[12px] font-bold uppercase tracking-[0.12em]"
              style={{
                background: SYNTH.ink,
                color: SYNTH.inkOnBrand,
                fontFamily: SYNTH.font,
              }}
            >
              <RefreshCw size={13} strokeWidth={2.4} />
              Reset tool state
            </button>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2"
      style={{ background: SYNTH.sheetMuted, fontFamily: SYNTH.font }}
    >
      <span
        className="text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.inkMuted }}
      >
        {label}
      </span>
      <span
        className="truncate text-[11px] font-semibold"
        style={{ color: SYNTH.ink }}
      >
        {value}
      </span>
    </div>
  )
}
