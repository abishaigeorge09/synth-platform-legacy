/**
 * ToolRenderer — turns a ToolSpec into a React surface.
 *
 * Pipeline:
 *   spec --> ToolSpecSchema.safeParse()
 *        --> useResolvedBindings(spec)            [the data seam]
 *        --> read-only Inputs summary             [Sprint 4+ wires state]
 *        --> map elements through ELEMENT_RENDERERS
 *        --> grid layout (mobile = full, sm+ = full/half/third columns)
 *
 * Every element is wrapped in an error boundary so one bad element can't
 * crash the page. A spec that fails schema validation renders a single
 * error card.
 */
import { Component, useState, type ErrorInfo, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  ToolSpecSchema,
  type ToolElement,
  type ToolInput,
  type ToolPage,
  type ToolSpec,
} from './schema'
import { ELEMENT_RENDERERS } from './registry'
import { useResolvedBindings } from './resolver'
import { ToolStateContext, useToolInstanceState } from './instanceState'
import { SYNTH } from '../../features/app/lib/theme'
import { TOOL_STAGGER } from '../../features/app/lib/motion'

// ─── Public component ─────────────────────────────────────────────────────

export function ToolRenderer({ spec }: { spec: ToolSpec }) {
  // Defensive — even if the caller has a typed `ToolSpec`, a stale spec
  // (older schema_version, hand-edited JSON, etc.) might fail at runtime.
  // Using ToolSpecSchema.safeParse directly avoids the wrapper that lost
  // discriminator narrowing under this project's loose tsconfig.
  const validated = ToolSpecSchema.safeParse(spec)
  if (!validated.success) {
    const message = validated.error.issues[0]?.message ?? 'Invalid spec'
    return <SpecErrorCard message={message} />
  }
  return <ValidatedToolRenderer spec={validated.data} />
}

function ValidatedToolRenderer({ spec }: { spec: ToolSpec }) {
  const { data: resolvedData } = useResolvedBindings(spec)
  const { data, dispatch } = useToolInstanceState(resolvedData)
  const pages = spec.pages && spec.pages.length > 0 ? spec.pages : null
  const [activePageId, setActivePageId] = useState<string>(pages?.[0]?.id ?? '')

  // When pages exist, render only the active page's elements. Top-level
  // `elements` is treated as legacy single-page mode and ignored here.
  const elementsToRender: ToolElement[] = pages
    ? pages.find((p) => p.id === activePageId)?.elements ?? []
    : spec.elements

  return (
    <ToolStateContext.Provider value={{ data, dispatch }}>
      <div className="flex flex-col gap-4">
        {pages ? (
          <PageTabs
            pages={pages}
            active={activePageId}
            onChange={setActivePageId}
          />
        ) : null}
        {spec.inputs.length > 0 ? <InputsSummary inputs={spec.inputs} /> : null}
        <div
          className="grid grid-cols-1 gap-3 sm:grid-cols-6"
          style={{ fontFamily: SYNTH.font }}
        >
          {elementsToRender.map((element, i) => {
            const Renderer = ELEMENT_RENDERERS[element.type]
            return (
              <ElementSlot
                key={element.id ?? `${activePageId}-${element.type}-${i}`}
                element={element}
                index={i}
              >
                <ElementErrorBoundary type={element.type}>
                  <Renderer element={element} data={data} />
                </ElementErrorBoundary>
              </ElementSlot>
            )
          })}
        </div>
      </div>
    </ToolStateContext.Provider>
  )
}

function PageTabs({
  pages,
  active,
  onChange,
}: {
  pages: ToolPage[]
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div
      className="synth-scroll flex items-center gap-1.5 overflow-x-auto rounded-2xl p-1"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: `1px solid ${SYNTH.glassBorder}`,
      }}
    >
      {pages.map((page) => {
        const isActive = page.id === active
        return (
          <button
            key={page.id}
            type="button"
            onClick={() => onChange(page.id)}
            className="shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{
              background: isActive ? SYNTH.inkOnBrand : 'transparent',
              color: isActive ? SYNTH.ink : SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
              transition: 'background 140ms ease, color 140ms ease',
            }}
          >
            {page.title}
          </button>
        )
      })}
    </div>
  )
}

// ─── Layout slot ──────────────────────────────────────────────────────────

const SPAN_BY_WIDTH: Record<NonNullable<ToolElement['width']>, string> = {
  full: 'sm:col-span-6',
  half: 'sm:col-span-3',
  third: 'sm:col-span-2',
}

function ElementSlot({
  element,
  index,
  children,
}: {
  element: ToolElement
  index: number
  children: ReactNode
}) {
  const width = element.width ?? 'full'
  return (
    <motion.div
      className={`col-span-1 ${SPAN_BY_WIDTH[width]}`}
      custom={index}
      variants={TOOL_STAGGER}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  )
}

// ─── Inputs summary (read-only Sprint 3) ─────────────────────────────────

function InputsSummary({ inputs }: { inputs: ToolInput[] }) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-2xl px-3 py-2"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${SYNTH.glassBorder}`,
      }}
    >
      <span
        className="text-[10px] font-bold uppercase tracking-[0.16em]"
        style={{ color: SYNTH.inkOnBrandMuted }}
      >
        Inputs
      </span>
      {inputs.map((input) => {
        const fmt = formatDefault(input)
        return (
          <span
            key={input.name}
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{
              background: 'rgba(255,255,255,0.10)',
              color: SYNTH.inkOnBrand,
              border: `1px solid ${SYNTH.glassBorder}`,
            }}
          >
            {input.label}
            {fmt ? (
              <span
                className="ml-1.5 font-normal"
                style={{ color: SYNTH.inkOnBrandMuted }}
              >
                · {fmt}
              </span>
            ) : null}
          </span>
        )
      })}
    </div>
  )
}

function formatDefault(input: ToolInput): string | null {
  if (!('default' in input) || input.default === undefined) return null
  if (input.kind === 'date_range') {
    const range = input.default as [string, string]
    return `${range[0]} → ${range[1]}`
  }
  return String(input.default)
}

// ─── Error boundaries + error cards ───────────────────────────────────────

class ElementErrorBoundary extends Component<
  { type: string; children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Sprint 13 wires Sentry. For now keep it on the console.
    console.error('[tools] element render failed', { type: this.props.type, error, info })
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="flex flex-col gap-1 rounded-2xl px-3.5 py-3"
          style={{
            background: 'rgba(230,74,60,0.10)',
            border: `1px solid ${SYNTH.accentRed}55`,
            color: SYNTH.inkOnBrand,
          }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: SYNTH.accentRed }}
          >
            {this.props.type} failed to render
          </span>
          <span
            className="text-[11px]"
            style={{ color: SYNTH.inkOnBrandMuted }}
          >
            {this.state.error.message}
          </span>
        </div>
      )
    }
    return this.props.children
  }
}

function SpecErrorCard({ message }: { message: string }) {
  return (
    <div
      className="flex flex-col gap-1 rounded-2xl px-4 py-3"
      style={{
        background: 'rgba(230,74,60,0.10)',
        border: `1px solid ${SYNTH.accentRed}55`,
        color: SYNTH.inkOnBrand,
      }}
    >
      <span
        className="text-[10px] font-bold uppercase tracking-[0.16em]"
        style={{ color: SYNTH.accentRed }}
      >
        Invalid tool spec
      </span>
      <span className="text-[12px]" style={{ color: SYNTH.inkOnBrandMuted }}>
        {message}
      </span>
    </div>
  )
}
