import { forwardRef } from 'react'
import { THEME } from '../../../lib/theme'

type Props = {
  athleteName: string
  initials: string
  eventLabel: string
  displayValue: string
  date: string
  /** When true, renders for 1080×1920 story dimensions instead of 1080×1080 square. */
  story?: boolean
}

/** Off-screen renderable card. html2canvas captures the DOM node by ref. */
export const ShareableCard = forwardRef<HTMLDivElement, Props>(function ShareableCard(
  { athleteName, initials, eventLabel, displayValue, date, story = false },
  ref,
) {
  const width = 1080
  const height = story ? 1920 : 1080

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: '-10000px',
        left: '-10000px',
        width: `${width}px`,
        height: `${height}px`,
        background: `linear-gradient(155deg, ${THEME.primaryDarker} 0%, ${THEME.primary} 55%, ${THEME.accent} 100%)`,
        color: '#FFFFFF',
        fontFamily: THEME.fontSans,
        padding: story ? '160px 100px' : '100px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: story ? 'center' : 'space-between',
        gap: story ? '60px' : '40px',
        overflow: 'hidden',
      }}
    >
      {/* logo + watermark */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          style={{
            fontFamily: THEME.fontMono,
            fontWeight: 700,
            fontSize: '52px',
            letterSpacing: '-0.02em',
          }}
        >
          synth
          <span style={{ color: '#A7F3D0' }}>.</span>
        </div>
        <div
          style={{
            fontFamily: THEME.fontMono,
            fontSize: '20px',
            opacity: 0.75,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          made with synth.
        </div>
      </div>

      {/* avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <div
          style={{
            width: '160px',
            height: '160px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.18)',
            border: '4px solid rgba(255,255,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: THEME.fontMono,
            fontSize: '64px',
            fontWeight: 700,
          }}
        >
          {initials}
        </div>
        <div>
          <div
            style={{
              fontFamily: THEME.fontMono,
              fontSize: '22px',
              opacity: 0.85,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            New personal record
          </div>
          <div
            style={{
              fontFamily: THEME.fontSerif,
              fontSize: '60px',
              fontWeight: 600,
              marginTop: '12px',
              lineHeight: 1.05,
            }}
          >
            {athleteName}
          </div>
        </div>
      </div>

      {/* big number */}
      <div style={{ flex: story ? '0 0 auto' : 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div
          style={{
            fontFamily: THEME.fontMono,
            fontSize: '32px',
            opacity: 0.9,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          {eventLabel}
        </div>
        <div
          style={{
            fontFamily: THEME.fontSerif,
            fontSize: story ? '320px' : '260px',
            fontWeight: 600,
            lineHeight: 1,
            marginTop: '20px',
            letterSpacing: '-0.02em',
          }}
        >
          {displayValue}
        </div>
      </div>

      {/* date footer */}
      <div
        style={{
          fontFamily: THEME.fontMono,
          fontSize: '24px',
          opacity: 0.85,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {date}
      </div>
    </div>
  )
})
