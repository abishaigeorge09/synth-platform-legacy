import { motion } from 'framer-motion'
import { SYNTH } from '../lib/theme'

export type LaneBoat = {
  id: string
  name: string
  color: string
  /** 0..1 — how far along the course this boat has progressed */
  progress: number
  /** Last captured split, e.g. "1:42.3" — shown above the boat */
  lastSplit?: string
}

type Props = {
  boats: LaneBoat[]
  highlightedId?: string
  onSelectBoat?: (id: string) => void
  /** Number of split markers along the course (e.g. 4 for a 2K with 500m markers) */
  markers?: number
}

/**
 * Top-down boat-lane animation — the synth analog of Strava's map. Each
 * boat sits in its own horizontal lane and moves left → right as splits
 * are captured. Tap a boat to focus it (parent surfaces its stats).
 *
 * Visual: dark lane backdrop, dashed mid-course markers, boat as a small
 * pill with the boat name, gentle wake glow trailing behind.
 */
export function BoatLanesView({ boats, highlightedId, onSelectBoat, markers = 4 }: Props) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: 'rgba(8, 11, 56, 0.65)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        border: `1px solid ${SYNTH.glassBorder}`,
        height: 280,
      }}
    >
      {/* Course markers — dashed verticals at each split */}
      {Array.from({ length: markers - 1 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0"
          style={{
            left: `${((i + 1) / markers) * 100}%`,
            width: 1,
            background: 'rgba(255,255,255,0.10)',
            backgroundImage:
              'repeating-linear-gradient(180deg, rgba(255,255,255,0.18) 0 6px, transparent 6px 12px)',
          }}
        />
      ))}
      {/* Finish line on the right */}
      <div
        className="absolute right-0 top-0 bottom-0"
        style={{
          width: 4,
          background: SYNTH.accentEmerald,
          boxShadow: `0 0 18px ${SYNTH.accentEmerald}88`,
        }}
      />

      {/* Lanes */}
      <div className="relative flex h-full flex-col">
        {boats.map((boat, i) => {
          const isFocused = boat.id === highlightedId
          const laneCount = boats.length
          return (
            <button
              key={boat.id}
              type="button"
              onClick={() => onSelectBoat?.(boat.id)}
              className="relative flex flex-1 items-center px-3 text-left"
              style={{
                borderTop: i === 0 ? 'none' : `1px solid rgba(255,255,255,0.08)`,
                background: isFocused ? 'rgba(255,255,255,0.05)' : 'transparent',
              }}
            >
              {/* Lane label (left) */}
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
              >
                {laneCount > 1 ? `L${i + 1}` : ''}
              </span>

              {/* Animated boat */}
              <motion.div
                className="absolute"
                animate={{
                  left: `calc(${Math.max(0, Math.min(1, boat.progress)) * 90}% + 24px)`,
                }}
                transition={{ type: 'spring', stiffness: 90, damping: 22 }}
                style={{
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {boat.lastSplit ? (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                    style={{
                      background: SYNTH.accentBlack,
                      color: SYNTH.inkOnBrand,
                      fontFamily: SYNTH.font,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {boat.lastSplit}
                  </span>
                ) : null}
                <BoatGlyph color={boat.color} highlighted={isFocused} />
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                >
                  {boat.name}
                </span>
              </motion.div>

              {/* Wake — emerald gradient trailing the boat */}
              <div
                className="absolute"
                style={{
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: `calc(${Math.max(0, Math.min(1, boat.progress)) * 90}% + 24px)`,
                  height: 2,
                  background: `linear-gradient(90deg, transparent 0%, ${boat.color}77 100%)`,
                  borderRadius: 2,
                  pointerEvents: 'none',
                }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function BoatGlyph({ color, highlighted }: { color: string; highlighted: boolean }) {
  return (
    <svg width={28} height={14} viewBox="0 0 28 14" aria-hidden>
      <defs>
        <linearGradient id="boat-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity={0.85} />
          <stop offset="100%" stopColor={color} stopOpacity={1} />
        </linearGradient>
      </defs>
      {/* simplified eight oar shape */}
      <path
        d="M2 7 Q14 1 26 7 Q14 13 2 7 Z"
        fill="url(#boat-grad)"
        stroke={highlighted ? SYNTH.inkOnBrand : 'transparent'}
        strokeWidth={highlighted ? 1.5 : 0}
      />
      <circle cx={14} cy={7} r={1.5} fill={SYNTH.inkOnBrand} opacity={0.9} />
    </svg>
  )
}
