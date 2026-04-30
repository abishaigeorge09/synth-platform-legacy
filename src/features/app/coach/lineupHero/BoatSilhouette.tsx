import { useMemo } from 'react'
import { APP_MOCK_ATHLETES, type AppMockAthlete } from '../../data/mockTeam'
import {
  COXED,
  SEAT_COUNT,
  seatSide,
  type Boat,
} from '../../data/lineupBuilderStore'

type Props = {
  boat: Boat
  onSeatTap: (seatPosition: number, athlete: AppMockAthlete | null) => void
}

/**
 * Cal-Rowing style boat silhouette — single SVG, pointed thin hull with
 * angled oars + last-name typography on each rower's side. Empty seats
 * render the oar but no name, so the illustration is intact even before
 * a lineup is built.
 *
 * Visual contract:
 *   • Hull is a tall pointed shell, centered, pure white over dark water
 *   • Stroke (highest seat) renders at the top, bow at the bottom
 *   • Cox (if present) renders above the hull as text + (COX) tag
 *   • Each rower's oar extends out at a slight downward angle to their side
 *   • Last name is typeset just beyond the blade, all-caps, mono spacing
 *   • Tap target spans each rower row so a finger anywhere on the row works
 */
export function BoatSilhouette({ boat, onSeatTap }: Props) {
  const hasCox = COXED[boat.size]
  const rowerCount = SEAT_COUNT[boat.size]

  // Stroke (highest position) at top → bow (position 1) at bottom.
  const rowers = useMemo(
    () =>
      boat.seats
        .filter((s) => seatSide(boat.size, s.position) !== 'X')
        .sort((a, b) => b.position - a.position),
    [boat],
  )
  const coxSeat = useMemo(
    () => boat.seats.find((s) => seatSide(boat.size, s.position) === 'X') ?? null,
    [boat],
  )

  // ─── Geometry ───────────────────────────────────────────────────────────
  // The hull renders at the SAME SIZE for every rig — a 2- and an 8+ both
  // get a full-length boat. Smaller rigs just spread their few oars across
  // the same hull height. You read the boat size from the count of oars,
  // not from the hull dimensions.
  const HULL_ROWER_AREA = 420                 // constant rower-area height (px in viewBox)
  const ROW_H = HULL_ROWER_AREA / rowerCount  // even oar spacing across the area
  const COX_BAND = hasCox ? 32 : 12           // space above the hull for the cox label
  const HULL_TIP = 22                         // length of the pointed taper
  const HULL_HALF_W = 6                       // half-width of the hull at center
  const TOTAL_W = 540
  const CX = TOTAL_W / 2                      // 270 — boat center

  // Hull extents — fixed regardless of rower count.
  const HULL_TOP = COX_BAND
  const HULL_BOTTOM = HULL_TOP + HULL_ROWER_AREA + 8
  const TOTAL_H = HULL_BOTTOM + 14
  const VERT_OFFSET = 0                       // no vertical padding needed any more

  // Oar geometry.
  const OAR_INNER_OFFSET = HULL_HALF_W
  const OAR_OUTER_X_PORT = CX - 120           // far-out blade on port side
  const OAR_OUTER_X_STBD = CX + 120
  const OAR_DROP = 12                         // blade lower than the rigger
  const NAME_BASELINE_NUDGE = 4               // optical alignment of text to blade tip

  return (
    <svg
      viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
      // ViewBox aspect is fixed (540 × ~415, ratio 1.3:1) regardless of
      // boat size — the boat content is vertically centered inside the
      // viewBox via VERT_OFFSET. The CSS aspect-ratio wrapper around this
      // SVG ensures the rendered SVG matches the viewBox aspect, so xMidYMid
      // perfectly centers the boat with no internal letterboxing.
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      aria-label={`${boat.name} crew layout`}
    >
      <defs>
        <linearGradient id="bs-hull" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.98)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.92)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.86)" />
        </linearGradient>
        <filter id="bs-glow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Hull — long pointed shell */}
      <path
        d={hullPath(CX, HULL_TOP, HULL_BOTTOM, HULL_HALF_W, HULL_TIP)}
        fill="url(#bs-hull)"
        opacity="0.96"
        filter="url(#bs-glow)"
      />

      {/* Cox label — typography only, sits above the hull */}
      {hasCox && coxSeat ? (
        <CoxLabel
          cx={CX}
          y={VERT_OFFSET + 18}
          name={lastNameOf(coxSeat.athleteId)}
          onTap={() => onSeatTap(coxSeat.position, athleteFor(coxSeat.athleteId))}
        />
      ) : null}

      {/* Rower rows — oar + last name */}
      {rowers.map((seat, i) => {
        const y = HULL_TOP + i * ROW_H + ROW_H / 2
        const isPort = seatSide(boat.size, seat.position) === 'P'
        const innerX = CX + (isPort ? -OAR_INNER_OFFSET : OAR_INNER_OFFSET)
        const outerX = isPort ? OAR_OUTER_X_PORT : OAR_OUTER_X_STBD
        const bladeY = y + OAR_DROP
        const lastName = lastNameOf(seat.athleteId)
        const isStroke = i === 0
        const isBow = i === rowers.length - 1

        return (
          <g
            key={seat.position}
            onClick={() => onSeatTap(seat.position, athleteFor(seat.athleteId))}
            style={{ cursor: 'pointer' }}
          >
            {/* Invisible tap target spans the full row for forgiving touches */}
            <rect
              x={0}
              y={y - ROW_H / 2}
              width={TOTAL_W}
              height={ROW_H}
              fill="transparent"
            />

            {/* Oar shaft */}
            <line
              x1={innerX}
              y1={y}
              x2={outerX + (isPort ? -2 : 2)}
              y2={bladeY}
              stroke="rgba(255,255,255,0.94)"
              strokeWidth={1.8}
              strokeLinecap="round"
            />
            {/* Oar blade — small ellipse */}
            <ellipse
              cx={outerX + (isPort ? -6 : 6)}
              cy={bladeY}
              rx={7.5}
              ry={2.6}
              fill="rgba(255,255,255,0.94)"
              transform={`rotate(${isPort ? 14 : -14} ${outerX + (isPort ? -6 : 6)} ${bladeY})`}
            />

            {/* Last-name text — only when filled */}
            {lastName ? (
              <text
                x={isPort ? outerX - 16 : outerX + 16}
                y={bladeY + NAME_BASELINE_NUDGE}
                textAnchor={isPort ? 'end' : 'start'}
                fill="#FFFFFF"
                style={{
                  fontFamily: '"Geist","Inter",system-ui,sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                }}
                fontSize={12}
              >
                {lastName.toUpperCase()}
              </text>
            ) : (
              // Empty marker — small dot at the rigger so the row never feels orphaned
              <circle
                cx={isPort ? innerX - 3 : innerX + 3}
                cy={y}
                r={2}
                fill="rgba(255,255,255,0.5)"
              />
            )}

            {/* Tiny seat number on the inside, near the rigger */}
            <text
              x={isPort ? CX + 10 : CX - 10}
              y={y + 3}
              textAnchor={isPort ? 'start' : 'end'}
              fill="rgba(255,255,255,0.4)"
              fontSize={8}
              style={{
                fontFamily: '"Geist","Inter",system-ui,sans-serif',
                fontWeight: 600,
                letterSpacing: '0.12em',
              }}
            >
              {isStroke ? 'STR' : isBow ? 'BOW' : seat.position}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Cox label ───────────────────────────────────────────────────────────────

function CoxLabel({
  cx,
  y,
  name,
  onTap,
}: {
  cx: number
  y: number
  name: string | null
  onTap: () => void
}) {
  const display = name ? `${name.toUpperCase()} (COX)` : '— (COX)'
  return (
    <g onClick={onTap} style={{ cursor: 'pointer' }}>
      <text
        x={cx}
        y={y}
        textAnchor="middle"
        fill="#FFFFFF"
        style={{
          fontFamily: '"Geist","Inter",system-ui,sans-serif',
          fontWeight: 700,
          letterSpacing: '0.10em',
          opacity: name ? 1 : 0.55,
        }}
        fontSize={12}
      >
        {display}
      </text>
    </g>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lastNameOf(athleteId: string | null): string | null {
  if (!athleteId) return null
  const a = APP_MOCK_ATHLETES.find((x) => x.id === athleteId)
  if (!a) return null
  const parts = a.name.trim().split(/\s+/)
  return parts[parts.length - 1] ?? null
}

function athleteFor(athleteId: string | null): AppMockAthlete | null {
  if (!athleteId) return null
  return APP_MOCK_ATHLETES.find((a) => a.id === athleteId) ?? null
}

function hullPath(cx: number, yTop: number, yBottom: number, halfW: number, tipLen: number): string {
  // Long pointed shell: pointed tip at yTop, slight curve out to halfW, runs
  // straight down, then mirrors the curve to a tip at yBottom.
  const upperArcEnd = yTop + tipLen
  const lowerArcStart = yBottom - tipLen
  return [
    `M ${cx} ${yTop}`,
    `C ${cx + halfW * 0.5} ${yTop + tipLen * 0.4}, ${cx + halfW} ${yTop + tipLen * 0.85}, ${cx + halfW} ${upperArcEnd}`,
    `L ${cx + halfW} ${lowerArcStart}`,
    `C ${cx + halfW} ${yBottom - tipLen * 0.85}, ${cx + halfW * 0.5} ${yBottom - tipLen * 0.4}, ${cx} ${yBottom}`,
    `C ${cx - halfW * 0.5} ${yBottom - tipLen * 0.4}, ${cx - halfW} ${yBottom - tipLen * 0.85}, ${cx - halfW} ${lowerArcStart}`,
    `L ${cx - halfW} ${upperArcEnd}`,
    `C ${cx - halfW} ${yTop + tipLen * 0.85}, ${cx - halfW * 0.5} ${yTop + tipLen * 0.4}, ${cx} ${yTop}`,
    'Z',
  ].join(' ')
}
