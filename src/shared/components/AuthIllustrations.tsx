import { THEME } from '@lib/theme'

const stroke = THEME.primaryDarker
const accent = THEME.primary
const sub = 'rgba(24,24,27,0.22)'

export type AuthIllustrationId =
  | 'login'
  | 'coaching'
  | 'teamHuddle'
  | 'dataStreams'
  | 'inviteShare'
  | 'goalTarget'
  | 'athlete'
  | 'connectSources'

export function AuthIllustrationView({ id, className }: { id: AuthIllustrationId; className?: string }) {
  return (
    <div className={className} aria-hidden>
      {id === 'login' && <LoginIllustration />}
      {id === 'coaching' && <CoachingIllustration />}
      {id === 'teamHuddle' && <TeamHuddleIllustration />}
      {id === 'dataStreams' && <DataStreamsIllustration />}
      {id === 'inviteShare' && <InviteShareIllustration />}
      {id === 'goalTarget' && <GoalTargetIllustration />}
      {id === 'athlete' && <AthleteIllustration />}
      {id === 'connectSources' && <DataStreamsIllustration />}
    </div>
  )
}

function LoginIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full max-h-[min(60vh,280px)]" fill="none">
      <path d="M20 150 Q60 100 100 120 T180 100" stroke={sub} strokeWidth="1.2" />
      <ellipse cx="100" cy="128" rx="70" ry="6" fill={sub} opacity="0.4" />
      <path d="M60 90 L100 50 L160 100 L140 130 H70 Z" stroke={stroke} strokeWidth="1.4" fill={`${accent}12`} />
      <circle cx="100" cy="70" r="5" fill={accent} />
      <path d="M100 80 V105 M85 92 H115" stroke={stroke} strokeWidth="1.2" />
      <circle cx="50" cy="60" r="3" fill={accent} />
      <circle cx="150" cy="50" r="3" fill={accent} />
      <path d="M50 60 L100 70 M150 50 L100 70" stroke={sub} strokeWidth="0.8" />
    </svg>
  )
}

function CoachingIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full max-h-[min(60vh,280px)]" fill="none">
      <rect x="40" y="50" width="120" height="80" rx="6" stroke={sub} />
      <path d="M55 80 H145 M55 100 H130" stroke={sub} strokeWidth="0.8" />
      <circle cx="100" cy="40" r="6" fill={accent} />
      <path d="M100 45 L100 50 M85 50 H115" stroke={stroke} strokeWidth="1.1" />
      <rect x="70" y="120" width="20" height="50" rx="2" fill={`${accent}20`} stroke={stroke} />
      <rect x="100" y="120" width="20" height="50" rx="2" fill={`${accent}12`} stroke={sub} />
      <rect x="130" y="120" width="20" height="50" rx="2" fill={`${accent}12`} stroke={sub} />
    </svg>
  )
}

function TeamHuddleIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full max-h-[min(60vh,280px)]" fill="none">
      {[
        { cx: 100, cy: 55 },
        { cx: 60, cy: 90 },
        { cx: 140, cy: 90 },
        { cx: 80, cy: 130 },
        { cx: 120, cy: 130 },
      ].map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r="8" fill={i === 0 ? accent : `${accent}35`} stroke={stroke} strokeWidth="0.8" />
      ))}
      <path d="M100 64 L100 80 M100 64 L60 90 M100 64 L140 90" stroke={sub} strokeWidth="0.6" />
    </svg>
  )
}

function DataStreamsIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full max-h-[min(60vh,280px)]" fill="none">
      {[
        { x: 20, y: 40 },
        { x: 160, y: 30 },
        { x: 10, y: 120 },
        { x: 170, y: 130 },
      ].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="5" fill={`${accent}30`} stroke={stroke} />
      ))}
      <circle cx="100" cy="100" r="18" fill={`${accent}25`} stroke={stroke} strokeWidth="1.2" />
      {[
        { d: 'M25 40 L100 100' },
        { d: 'M160 32 L100 100' },
        { d: 'M15 120 L100 100' },
        { d: 'M170 130 L100 100' },
      ].map((p, i) => (
        <path key={i} d={p.d} stroke={sub} strokeWidth="0.8" strokeDasharray="3 3" />
      ))}
    </svg>
  )
}

function InviteShareIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full max-h-[min(60vh,280px)]" fill="none">
      <rect x="50" y="60" width="100" height="70" rx="4" stroke={stroke} fill={`${accent}10`} />
      <path d="M60 80 H120 M60 100 H110" stroke={sub} />
      <path
        d="M130 130 L150 150 L120 150 Z"
        fill={accent}
        transform="translate(-10, -8)"
        opacity="0.6"
      />
      <rect x="75" y="130" width="50" height="20" rx="2" fill={`${accent}25`} stroke={stroke} />
    </svg>
  )
}

function GoalTargetIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full max-h-[min(60vh,280px)]" fill="none">
      <circle cx="100" cy="100" r="50" stroke={sub} />
      <circle cx="100" cy="100" r="32" stroke={accent} strokeWidth="1.2" />
      <circle cx="100" cy="100" r="12" fill={`${accent}30`} />
      <path d="M80 32 H120" stroke={sub} strokeWidth="0.6" />
    </svg>
  )
}

function AthleteIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full max-h-[min(60vh,280px)]" fill="none">
      <path d="M30 90 L160 60 L180 100 L40 150 Z" fill={`${accent}12`} stroke={stroke} />
      <path d="M100 30 L100 100 M70 50 H130" stroke={stroke} strokeWidth="1.1" />
      <circle cx="100" cy="32" r="5" fill={accent} />
      <rect x="85" y="100" width="30" height="50" rx="2" fill={`${accent}18`} stroke={sub} />
    </svg>
  )
}
