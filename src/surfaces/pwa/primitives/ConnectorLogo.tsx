import type { CSSProperties } from 'react'

type Size = number

type Props = {
  id: string
  size?: Size
  /** When true, draws on a white rounded tile (matches the iOS connectors UI). */
  tile?: boolean
}

/**
 * Inline brand marks for every coach connector. Each glyph is hand-rolled SVG —
 * no asset deps, no network, paints crisp at 24/32/40px. The shapes are
 * stylised — they read as the brand at glance without trying to be exact
 * trademarks.
 *
 * Always pass `id` matching `ConnectorMock.id` from `mockConnectors.ts`.
 */
export function ConnectorLogo({ id, size = 28, tile = true }: Props) {
  const inner = renderMark(id, Math.round(size * 0.7))
  if (!tile) return <span className="inline-flex items-center justify-center">{inner}</span>

  const tileStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: Math.round(size * 0.26),
    background: '#FFFFFF',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 1px 2px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.06) inset',
  }

  return <span style={tileStyle}>{inner}</span>
}

function renderMark(id: string, s: number) {
  switch (id) {
    case 'concept2':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#1A1A2E" strokeWidth="2" />
          <path d="M5 12 L19 12 M12 5 L12 19" stroke="#FF6A2F" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'strava':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path
            d="M14 3 L6 16 L9 16 L14 7 L19 16 L22 16 Z"
            fill="#FC4C02"
          />
          <path
            d="M14 16 L11 16 L13.5 21 L16 16 Z"
            fill="#FC4C02"
            opacity="0.6"
          />
        </svg>
      )
    case 'trainingpeaks':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M3 19 L9 8 L13 14 L17 6 L21 19 Z" fill="#1E5BAA" />
        </svg>
      )
    case 'whoop':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <text
            x="12"
            y="17"
            textAnchor="middle"
            fontFamily="Geist, Inter, sans-serif"
            fontWeight="900"
            fontSize="16"
            fill="#000000"
          >
            W
          </text>
          <circle cx="20" cy="6" r="2" fill="#00F19F" />
        </svg>
      )
    case 'apple-health':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21 C 5 16 3 12 3 9 C 3 6 5.5 4 8 4 C 9.7 4 11.1 4.9 12 6.2 C 12.9 4.9 14.3 4 16 4 C 18.5 4 21 6 21 9 C 21 12 19 16 12 21 Z"
            fill="#FF2D55"
          />
          <path d="M9 12 L11 12 L12 9 L13 15 L14 12 L15 12" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'garmin':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M12 3 L21 19 L3 19 Z" fill="#007CC3" />
          <path d="M12 8 L17 17 L7 17 Z" fill="white" />
        </svg>
      )
    case 'gmail':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="6" width="18" height="13" rx="2" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="0.5" />
          <path d="M3 8 L12 14 L21 8" stroke="#EA4335" strokeWidth="2" fill="none" />
          <path d="M3 8 L3 6 L12 13 L21 6 L21 8" fill="#EA4335" />
        </svg>
      )
    case 'sheets':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="5" y="3" width="14" height="18" rx="1.5" fill="#0F9D58" />
          <path d="M8 9 L16 9 M8 12 L16 12 M8 15 L16 15 M11 7 L11 17 M14 7 L14 17" stroke="white" strokeWidth="1.2" />
        </svg>
      )
    case 'oura':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="7.5" stroke="#1A1A1A" strokeWidth="2.4" fill="none" />
          <circle cx="12" cy="12" r="3" fill="#1A1A1A" />
        </svg>
      )
    case 'bridge':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M3 17 C 7 9 17 9 21 17" stroke="#4A90D9" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <line x1="3" y1="17" x2="3" y2="20" stroke="#4A90D9" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="21" y1="17" x2="21" y2="20" stroke="#4A90D9" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="9" y1="13.5" x2="9" y2="20" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round" />
          <line x1="15" y1="13.5" x2="15" y2="20" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'google-calendar':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="4" y="5" width="16" height="16" rx="1.5" fill="#FFFFFF" stroke="#DADCE0" strokeWidth="0.5" />
          <rect x="4" y="5" width="16" height="4" fill="#4285F4" />
          <text
            x="12"
            y="18"
            textAnchor="middle"
            fontFamily="Geist, Inter, sans-serif"
            fontWeight="700"
            fontSize="8"
            fill="#4285F4"
          >
            31
          </text>
        </svg>
      )
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#7A7A8C" />
        </svg>
      )
  }
}
