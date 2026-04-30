import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share, Plus } from 'lucide-react'
import { SYNTH } from '../lib/theme'

/**
 * Loops a scripted Safari → Share Sheet → Add to Home Screen → Home flow,
 * to teach the user how to install the synth PWA. Lives inside <PhoneFrame>.
 *
 * Stages drive a state machine; durations are tuned so the full loop runs
 * ~9 seconds with a 1s rest between iterations.
 */
type Stage =
  | 'typing-url' // 0–1.6s: URL bar autotypes
  | 'page-loaded' // 1.6–3.0s: synth page visible
  | 'share-tap' // 3.0–3.8s: share button pulse + tap ripple
  | 'sheet-open' // 3.8–5.4s: share sheet slides up
  | 'home-tap' // 5.4–6.2s: "Add to Home Screen" highlights
  | 'icon-flying' // 6.2–7.4s: synth icon flies to home screen
  | 'home-screen' // 7.4–8.8s: app on home screen, briefly
  | 'reset' // 8.8–9.0s: pause, then loop

const URL_TARGET = 'synth-platform-alt.vercel.app/app'
const URL_TYPE_MS = 50

export function SafariMockup() {
  const [stage, setStage] = useState<Stage>('typing-url')
  const [urlText, setUrlText] = useState('')

  // Stage transitions
  useEffect(() => {
    const transitions: Record<Stage, [number, Stage]> = {
      'typing-url': [URL_TARGET.length * URL_TYPE_MS + 200, 'page-loaded'],
      'page-loaded': [1400, 'share-tap'],
      'share-tap': [800, 'sheet-open'],
      'sheet-open': [1600, 'home-tap'],
      'home-tap': [800, 'icon-flying'],
      'icon-flying': [1200, 'home-screen'],
      'home-screen': [1400, 'reset'],
      reset: [200, 'typing-url'],
    }
    const [duration, next] = transitions[stage]
    const t = setTimeout(() => {
      if (stage === 'reset') setUrlText('')
      setStage(next)
    }, duration)
    return () => clearTimeout(t)
  }, [stage])

  // URL typing on the typing-url stage
  useEffect(() => {
    if (stage !== 'typing-url') return
    let i = 0
    const interval = setInterval(() => {
      i += 1
      setUrlText(URL_TARGET.slice(0, i))
      if (i >= URL_TARGET.length) clearInterval(interval)
    }, URL_TYPE_MS)
    return () => clearInterval(interval)
  }, [stage])

  const showHomeScreen = stage === 'home-screen'

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: showHomeScreen
          ? `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`
          : '#FFFFFF',
        transition: 'background 0.4s ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {showHomeScreen ? <HomeScreen /> : <SafariBrowser stage={stage} urlText={urlText} />}
    </div>
  )
}

// ─── Safari browser view ──────────────────────────────────────────────────

function SafariBrowser({ stage, urlText }: { stage: Stage; urlText: string }) {
  const showShareSheet = stage === 'sheet-open' || stage === 'home-tap' || stage === 'icon-flying'
  const showPagePreview = stage !== 'typing-url'
  const sharePulse = stage === 'share-tap'

  return (
    <>
      {/* Status bar */}
      <div
        style={{
          height: 44,
          paddingTop: 12,
          paddingLeft: 18,
          paddingRight: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          fontSize: 11,
          fontWeight: 700,
          color: '#000',
          fontFamily: SYNTH.font,
        }}
      >
        <span>9:41</span>
        <span style={{ display: 'flex', gap: 4, fontSize: 9 }}>•••• 􀙇 􀛨</span>
      </div>

      {/* Page area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence>
          {showPagePreview ? (
            <motion.div
              key="page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <SynthMark />
              <div
                style={{
                  height: 1,
                  background: 'rgba(255,255,255,0.16)',
                  margin: '8px 0',
                }}
              />
              <SkeletonRow w="62%" />
              <SkeletonRow w="92%" />
              <SkeletonRow w="78%" />
              <div
                style={{
                  marginTop: 12,
                  borderRadius: 18,
                  padding: 12,
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.16)',
                }}
              >
                <SkeletonRow w="42%" />
                <div style={{ height: 8 }} />
                <SkeletonRow w="78%" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="loading"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ position: 'absolute', inset: 0, background: '#FFFFFF' }}
            />
          )}
        </AnimatePresence>

        {/* Share sheet overlay */}
        <AnimatePresence>
          {showShareSheet ? <ShareSheet stage={stage} /> : null}
        </AnimatePresence>
      </div>

      {/* URL bar */}
      <div
        style={{
          padding: 8,
          background: '#F2F2F7',
          borderTop: '1px solid #DCDCDC',
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 12,
            padding: '8px 12px',
            fontSize: 12,
            color: '#1C1C1E',
            fontFamily: SYNTH.font,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            minHeight: 28,
            boxShadow: '0 0 0 0.5px rgba(0,0,0,0.12)',
          }}
        >
          <span style={{ color: '#86868B', fontSize: 10 }}>􀎬</span>
          <span style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {urlText}
            {stage === 'typing-url' ? <BlinkingCursor /> : null}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div
        style={{
          padding: '8px 16px 14px',
          background: '#F2F2F7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <ToolbarIcon disabled>􀯶</ToolbarIcon>
        <ToolbarIcon disabled>􀯻</ToolbarIcon>
        <div style={{ position: 'relative' }}>
          <motion.div
            animate={
              sharePulse
                ? {
                    scale: [1, 1.18, 1],
                    boxShadow: [
                      '0 0 0 0 rgba(245, 158, 11, 0.6)',
                      '0 0 0 14px rgba(245, 158, 11, 0)',
                      '0 0 0 0 rgba(245, 158, 11, 0)',
                    ],
                  }
                : { scale: 1 }
            }
            transition={{ duration: 0.6, repeat: sharePulse ? Infinity : 0, ease: 'easeOut' }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Share size={20} color="#0066FF" strokeWidth={2} />
          </motion.div>
        </div>
        <ToolbarIcon disabled>􀉅</ToolbarIcon>
        <ToolbarIcon disabled>􀙄</ToolbarIcon>
      </div>
    </>
  )
}

// ─── Share sheet ─────────────────────────────────────────────────────────

function ShareSheet({ stage }: { stage: Stage }) {
  const homeRowHighlight = stage === 'home-tap' || stage === 'icon-flying'
  const showIconFlying = stage === 'icon-flying'

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div
        style={{
          background: '#F2F2F7',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          padding: '12px 12px 18px',
          color: '#1C1C1E',
          fontFamily: SYNTH.font,
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: 'rgba(60,60,67,0.3)',
            margin: '0 auto 8px',
          }}
        />
        {/* App row */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 12,
            padding: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <SynthIconTile size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>synth.</p>
            <p style={{ fontSize: 10, color: '#86868B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {URL_TARGET}
            </p>
          </div>
        </div>

        {/* Action rows */}
        <div
          style={{
            marginTop: 10,
            background: '#FFFFFF',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <ShareRow icon="􀉅" label="Copy" />
          <ShareRow icon="􀎫" label="Add to Reading List" />
          <motion.div
            animate={
              homeRowHighlight
                ? { background: ['#FFFFFF', '#F0E7D8', '#FFFFFF'] }
                : { background: '#FFFFFF' }
            }
            transition={{ duration: 0.6, repeat: homeRowHighlight ? Infinity : 0 }}
            style={{ position: 'relative' }}
          >
            <ShareRow
              icon={<Plus size={16} color="#0066FF" />}
              label="Add to Home Screen"
              accent={homeRowHighlight}
            />
            {showIconFlying ? <FlyingIcon /> : null}
          </motion.div>
          <ShareRow icon="􀉪" label="Markup" />
        </div>
      </div>
    </motion.div>
  )
}

function ShareRow({ icon, label, accent }: { icon: string | React.ReactNode; label: string; accent?: boolean }) {
  return (
    <div
      style={{
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 12,
        borderBottom: '0.5px solid rgba(60,60,67,0.18)',
        color: accent ? '#0066FF' : '#1C1C1E',
        fontWeight: accent ? 600 : 400,
      }}
    >
      <span>{label}</span>
      <span
        style={{
          width: 24,
          height: 24,
          background: '#FFFFFF',
          border: '0.5px solid rgba(60,60,67,0.2)',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          color: '#0066FF',
        }}
      >
        {typeof icon === 'string' ? icon : icon}
      </span>
    </div>
  )
}

// ─── Icon flying to home screen ──────────────────────────────────────────

function FlyingIcon() {
  return (
    <motion.div
      initial={{ x: 200, y: 0, scale: 0.6, opacity: 1 }}
      animate={{ x: -120, y: -260, scale: 1.4, opacity: [1, 1, 0.4, 0] }}
      transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'absolute',
        right: 14,
        top: 12,
        zIndex: 20,
      }}
    >
      <SynthIconTile size={36} />
    </motion.div>
  )
}

// ─── Home screen ─────────────────────────────────────────────────────────

function HomeScreen() {
  const apps = [
    { letter: 'M', color: '#34C759', label: 'Mail' },
    { letter: 'S', color: '#FF9500', label: 'Strava' },
    { letter: 'C', color: '#FF3B30', label: 'Camera' },
    { letter: '🟦', color: '#0066FF', label: 'Maps' },
  ]
  return (
    <>
      {/* Status bar */}
      <div
        style={{
          height: 44,
          paddingTop: 12,
          paddingLeft: 18,
          paddingRight: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          fontSize: 11,
          fontWeight: 700,
          color: '#FFF',
          fontFamily: SYNTH.font,
        }}
      >
        <span>9:41</span>
        <span style={{ display: 'flex', gap: 4, fontSize: 9 }}>•••• 􀙇 􀛨</span>
      </div>

      {/* Grid */}
      <div
        style={{
          flex: 1,
          padding: '20px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
          alignContent: 'start',
        }}
      >
        {apps.map((a) => (
          <div key={a.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: a.color,
                color: '#FFF',
                fontWeight: 800,
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: SYNTH.font,
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              }}
            >
              {a.letter}
            </span>
            <span style={{ fontSize: 9, color: '#FFF', fontFamily: SYNTH.font }}>{a.label}</span>
          </div>
        ))}
        {/* synth — animated entrance */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
        >
          <SynthIconTile size={48} />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ fontSize: 9, color: '#FFF', fontFamily: SYNTH.font, fontWeight: 700 }}
          >
            synth.
          </motion.span>
        </motion.div>
      </div>

      {/* Dock */}
      <div
        style={{
          margin: '0 14px 24px',
          padding: 10,
          borderRadius: 28,
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(20px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
        }}
      >
        {['#5856D6', '#34C759', '#FF9500', '#FF3B30'].map((c, i) => (
          <span
            key={i}
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              background: c,
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }}
          />
        ))}
      </div>
    </>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function SynthMark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <SynthIconTile size={24} />
      <span style={{ color: '#FFF', fontWeight: 700, fontSize: 13, fontFamily: SYNTH.font }}>synth.</span>
    </div>
  )
}

function SynthIconTile({ size }: { size: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.26),
        background: `linear-gradient(135deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.08) inset',
      }}
    >
      <span
        style={{
          color: SYNTH.accentEmerald,
          fontWeight: 800,
          fontSize: Math.round(size * 0.42),
          fontFamily: SYNTH.font,
          letterSpacing: '-0.04em',
        }}
      >
        s.
      </span>
    </span>
  )
}

function SkeletonRow({ w }: { w: string }) {
  return (
    <div
      style={{
        height: 8,
        width: w,
        borderRadius: 4,
        background: 'rgba(255,255,255,0.12)',
      }}
    />
  )
}

function ToolbarIcon({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <span
      style={{
        width: 28,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        color: disabled ? '#86868B' : '#0066FF',
      }}
    >
      {children}
    </span>
  )
}

function BlinkingCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      style={{
        display: 'inline-block',
        width: 2,
        height: 12,
        background: '#1C1C1E',
        marginLeft: 1,
        verticalAlign: 'middle',
      }}
    />
  )
}
