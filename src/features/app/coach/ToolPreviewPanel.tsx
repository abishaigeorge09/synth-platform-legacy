import { ArrowLeft, Settings, Home, Boxes, Sparkles } from 'lucide-react'
import type { ToolSpec } from '../../../lib/tools/schema'
import { ToolRenderer } from '../../../lib/tools/ToolRenderer'
import { SYNTH } from '../lib/theme'

/**
 * Phone-frame app-shell wrapper. Used in the Build workspace's preview
 * pane so coaches see their tool rendered as if it were already a
 * real installed app — top bar with name + back + settings, the spec
 * body full-bleed below, simulated bottom-tab strip, all wrapped in a
 * device-shaped frame.
 *
 * Sprint 5.5 — sibling component `ToolFullscreenPage` shares the
 * inner layout but mounts at viewport scale.
 */
export function ToolPreviewPanel({ spec }: { spec: ToolSpec | null }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: '100%',
          maxWidth: 390,
          height: '100%',
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
        <PreviewTopBar name={spec?.name ?? null} />
        <div className="synth-scroll relative flex flex-1 flex-col overflow-y-auto px-4 pb-20 pt-3">
          {spec ? <ToolRenderer spec={spec} /> : <PreviewEmptyState />}
        </div>
        <PreviewTabBar />
      </div>
    </div>
  )
}

function PreviewTopBar({ name }: { name: string | null }) {
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
      <span
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{
          background: SYNTH.glass,
          border: `1px solid ${SYNTH.glassBorder}`,
          color: SYNTH.inkOnBrandMuted,
        }}
      >
        <Settings size={14} strokeWidth={2.2} />
      </span>
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
