import type { ReactNode } from 'react'

type Props = {
  /** Frame width in px (height auto-derived to keep iPhone aspect). */
  width?: number
  children: ReactNode
}

/**
 * Hand-rolled SVG iPhone shell — black bezel, dynamic island, side buttons,
 * rounded inner screen. Crisp at any zoom and matches synth's monospace /
 * architectural aesthetic better than a PNG mockup.
 *
 * The screen content slot is positioned absolutely via the `screen-area`
 * div so consumers can paint inside without knowing the bezel geometry.
 */
export function PhoneFrame({ width = 320, children }: Props) {
  // iPhone 15 Pro is 1179×2556 native = ~2.166 aspect.
  const aspect = 2.166
  const height = Math.round(width * aspect)
  const bezelRadius = Math.round(width * 0.16)
  const screenInset = Math.round(width * 0.018)
  const screenRadius = bezelRadius - screenInset
  const islandWidth = Math.round(width * 0.36)
  const islandHeight = Math.round(width * 0.085)

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        borderRadius: bezelRadius,
        background: 'linear-gradient(160deg, #1a1a22 0%, #0a0a10 50%, #1a1a22 100%)',
        boxShadow:
          '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 0 4px #050507',
        padding: screenInset,
      }}
    >
      {/* Side buttons — silent toggle, volume up, volume down (left), power (right) */}
      <span
        style={{
          position: 'absolute',
          left: -2,
          top: '12%',
          width: 3,
          height: width * 0.06,
          background: '#0a0a10',
          borderRadius: 2,
        }}
      />
      <span
        style={{
          position: 'absolute',
          left: -2,
          top: '20%',
          width: 3,
          height: width * 0.11,
          background: '#0a0a10',
          borderRadius: 2,
        }}
      />
      <span
        style={{
          position: 'absolute',
          left: -2,
          top: '32%',
          width: 3,
          height: width * 0.11,
          background: '#0a0a10',
          borderRadius: 2,
        }}
      />
      <span
        style={{
          position: 'absolute',
          right: -2,
          top: '24%',
          width: 3,
          height: width * 0.18,
          background: '#0a0a10',
          borderRadius: 2,
        }}
      />

      {/* Screen */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: screenRadius,
          overflow: 'hidden',
          background: '#000000',
        }}
      >
        {children}

        {/* Dynamic island — sits on top of screen content */}
        <div
          style={{
            position: 'absolute',
            top: Math.round(width * 0.04),
            left: '50%',
            transform: 'translateX(-50%)',
            width: islandWidth,
            height: islandHeight,
            background: '#000000',
            borderRadius: islandHeight,
            zIndex: 10,
          }}
        />
      </div>
    </div>
  )
}
