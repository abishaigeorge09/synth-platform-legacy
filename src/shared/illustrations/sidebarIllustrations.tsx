/**
 * Hand-rolled SVG illustrations for the coach sidebar nav.
 * All 24x24, stroked with the emerald palette from THEME. Kept intentionally
 * simple so they read at small sizes and match synth's monospace/architectural
 * aesthetic rather than a generic icon set.
 */
import { THEME } from '@lib/theme'

type Props = { size?: number; muted?: boolean }

function baseProps({ size = 24, muted = false }: Props) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: muted ? THEME.textMuted : THEME.primary,
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
    focusable: false as const,
  }
}

export function DashboardIllustration(props: Props) {
  const accent = props.muted ? THEME.textMuted : THEME.accent
  return (
    <svg {...baseProps(props)}>
      <rect x="3" y="3" width="8" height="9" rx="1.2" />
      <rect x="13" y="3" width="8" height="5" rx="1.2" />
      <rect x="13" y="10" width="8" height="11" rx="1.2" />
      <rect x="3" y="14" width="8" height="7" rx="1.2" />
      <path d="M5 18.5 L7 17 L9 18.5" stroke={accent} strokeWidth="1.4" />
    </svg>
  )
}

export function AthletesIllustration(props: Props) {
  const accent = props.muted ? THEME.textMuted : THEME.accent
  return (
    <svg {...baseProps(props)}>
      <circle cx="8" cy="8" r="2.6" />
      <path d="M3 19 c0 -3 2.2 -5 5 -5 s5 2 5 5" />
      <circle cx="16" cy="9" r="2.2" stroke={accent} />
      <path d="M12.5 19 c0.3 -2.6 1.9 -4 3.5 -4 s3.2 1.4 3.5 4" stroke={accent} />
    </svg>
  )
}

export function SourcesIllustration(props: Props) {
  const accent = props.muted ? THEME.textMuted : THEME.accent
  return (
    <svg {...baseProps(props)}>
      <circle cx="4.5" cy="5" r="1.6" />
      <circle cx="4.5" cy="12" r="1.6" />
      <circle cx="4.5" cy="19" r="1.6" />
      <circle cx="19.5" cy="12" r="2.2" stroke={accent} />
      <path d="M6 5 C12 5 14 10 17.6 11.4" />
      <path d="M6 12 L17.3 12" />
      <path d="M6 19 C12 19 14 14 17.6 12.6" />
    </svg>
  )
}

export function LineupsIllustration(props: Props) {
  const accent = props.muted ? THEME.textMuted : THEME.accent
  return (
    <svg {...baseProps(props)}>
      {/* shell hull — top down */}
      <path d="M4 12 Q12 4 20 12 Q12 20 4 12 Z" />
      {/* seats */}
      <circle cx="8" cy="10" r="0.9" fill={accent} stroke="none" />
      <circle cx="8" cy="14" r="0.9" fill={accent} stroke="none" />
      <circle cx="12" cy="9.4" r="0.9" fill={accent} stroke="none" />
      <circle cx="12" cy="14.6" r="0.9" fill={accent} stroke="none" />
      <circle cx="16" cy="10" r="0.9" fill={accent} stroke="none" />
      <circle cx="16" cy="14" r="0.9" fill={accent} stroke="none" />
    </svg>
  )
}

export function SessionTimerIllustration(props: Props) {
  const accent = props.muted ? THEME.textMuted : THEME.accent
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M10.5 2.5 h3" />
      <path d="M12 2.5 v2" />
      <path d="M19.5 5 l1.5 -1.5" strokeWidth="1.2" />
      <path d="M12 13 L12 8.8" stroke={accent} />
      <path d="M12 13 L15 14.6" stroke={accent} />
      <circle cx="12" cy="13" r="0.9" fill={accent} stroke="none" />
    </svg>
  )
}

export function AddToolIllustration(props: Props) {
  return (
    <svg {...baseProps(props)}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" strokeDasharray="2 2.4" />
      <path d="M12 8.5 v7" />
      <path d="M8.5 12 h7" />
    </svg>
  )
}

export function SynthAiIllustration(props: Props) {
  const accent = props.muted ? THEME.textMuted : THEME.accent
  return (
    <svg {...baseProps(props)}>
      {/* speech/brain blob */}
      <path d="M4 12 C4 7.6 7.6 4 12 4 C16.4 4 20 7.6 20 12 C20 15.1 18.1 17.8 15.4 19.1 L15 21.5 L12 19.9 C7.7 19.8 4 16.3 4 12 Z" />
      {/* synapse sparkle */}
      <circle cx="9" cy="11" r="0.9" fill={accent} stroke="none" />
      <circle cx="12" cy="13" r="0.9" fill={accent} stroke="none" />
      <circle cx="15" cy="10" r="0.9" fill={accent} stroke="none" />
      <path d="M9 11 L12 13 L15 10" stroke={accent} strokeWidth="1.1" />
    </svg>
  )
}

export function SettingsIllustration(props: Props) {
  const accent = props.muted ? THEME.textMuted : THEME.accent
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="12" r="2.6" stroke={accent} />
      <path d="M12 3 v2.2 M12 18.8 v2.2 M3 12 h2.2 M18.8 12 h2.2 M5.6 5.6 l1.55 1.55 M16.85 16.85 l1.55 1.55 M5.6 18.4 l1.55 -1.55 M16.85 7.15 l1.55 -1.55" />
    </svg>
  )
}

export function SourcesGlyph(props: Props) {
  return <SourcesIllustration {...props} />
}
