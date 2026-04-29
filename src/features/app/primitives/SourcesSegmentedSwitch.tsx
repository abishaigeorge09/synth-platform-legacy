import { Link, useLocation } from 'react-router-dom'
import { SYNTH } from '../lib/theme'

/**
 * Sticky segmented control rendered under the page header on every Sources
 * surface. Two pills — Connectors / Data View — both glass on the cobalt
 * canvas. The active pill flips to white-on-ink for crisp contrast.
 */
export function SourcesSegmentedSwitch() {
  const { pathname } = useLocation()
  const onConnectors = pathname.startsWith('/app/coach/sources/connectors') || pathname === '/app/coach/sources'
  const onDataView = pathname.startsWith('/app/coach/sources/data-view')
  return (
    <div className="px-5 pb-1">
      <div
        className="flex items-center gap-1 rounded-full p-1"
        style={{
          background: SYNTH.glass,
          backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          border: `1px solid ${SYNTH.glassBorder}`,
        }}
      >
        <SegPill to="/app/coach/sources/connectors" label="Connectors" active={onConnectors} />
        <SegPill to="/app/coach/sources/data-view" label="Data view" active={onDataView} />
      </div>
    </div>
  )
}

function SegPill({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className="flex flex-1 items-center justify-center rounded-full py-2 text-[12px] font-semibold tracking-[0.06em] transition-colors"
      style={{
        background: active ? SYNTH.inkOnBrand : 'transparent',
        color: active ? SYNTH.ink : SYNTH.inkOnBrand,
        fontFamily: SYNTH.font,
      }}
    >
      {label}
    </Link>
  )
}
