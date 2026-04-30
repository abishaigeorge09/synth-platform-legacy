import { useState } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Check, Download } from 'lucide-react'
import { SYNTH } from '../../lib/theme'
import { useInstallPrompt } from '../../../landing/useInstallPrompt'

const STEPS = [
  { n: 1, title: 'Open this link in Safari on your iPhone' },
  { n: 2, title: 'Tap Share in the bottom toolbar' },
  { n: 3, title: 'Tap Add to Home Screen' },
]

/**
 * Production app URL the QR / Copy link points at. Hardcoded (rather than
 * `window.location.href`) so the link works when testing on localhost or
 * a Vercel preview — the user always wants the recipient to land on the
 * live app surface, not whatever environment we happened to be testing in.
 */
const PRODUCTION_APP_URL = 'https://synth-platform-alt.vercel.app/app/welcome'

export function InstructionsSlide() {
  const [copied, setCopied] = useState(false)
  const { canInstall, trigger, isIos } = useInstallPrompt()

  // Preserve ?u=<recipient> off the current URL so PostHog still tags the
  // person on their phone.
  const url = (() => {
    if (typeof window === 'undefined') return PRODUCTION_APP_URL
    const params = new URLSearchParams(window.location.search)
    const u = params.get('u')
    return u ? `${PRODUCTION_APP_URL}?u=${encodeURIComponent(u)}` : PRODUCTION_APP_URL
  })()

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Ignore — old browsers
    }
  }

  return (
    <div className="grid h-full w-full grid-cols-2 items-center px-12 gap-12">
      {/* Left — numbered steps */}
      <div className="flex flex-col gap-5">
        <motion.span
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            fontFamily: SYNTH.font,
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: SYNTH.inkOnBrandFaint,
          }}
        >
          Three steps
        </motion.span>

        {STEPS.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
            className="flex items-start gap-4"
          >
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: SYNTH.font,
                fontWeight: 700,
                fontSize: 16,
                color: SYNTH.inkOnBrand,
                flexShrink: 0,
              }}
            >
              {s.n}
            </span>
            <p
              style={{
                fontFamily: SYNTH.font,
                fontSize: 'clamp(18px, 1.6vw, 22px)',
                fontWeight: 600,
                color: SYNTH.inkOnBrand,
                lineHeight: 1.35,
                margin: 0,
                paddingTop: 7,
              }}
            >
              {s.title}
            </p>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-3 flex items-center gap-3"
        >
          <button
            type="button"
            onClick={onCopy}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 18px',
              borderRadius: 9999,
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.20)',
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              backdropFilter: 'blur(20px)',
            }}
          >
            {copied ? <Check size={14} strokeWidth={2.6} /> : <Copy size={14} strokeWidth={2.4} />}
            {copied ? 'Copied' : 'Copy link'}
          </button>

          {canInstall ? (
            <button
              type="button"
              onClick={() => void trigger()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 18px',
                borderRadius: 9999,
                background: SYNTH.accentEmerald,
                border: 'none',
                color: SYNTH.inkOnBrand,
                fontFamily: SYNTH.font,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: '0 12px 32px rgba(16,185,129,0.45)',
              }}
            >
              <Download size={14} strokeWidth={2.6} />
              Install on this computer
            </button>
          ) : null}
        </motion.div>

        {!isIos && !canInstall ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            style={{
              fontFamily: SYNTH.font,
              fontSize: 12,
              color: SYNTH.inkOnBrandFaint,
              maxWidth: 420,
              lineHeight: 1.5,
            }}
          >
            On Android: open the link in Chrome and tap{' '}
            <span style={{ fontWeight: 600, color: SYNTH.inkOnBrandMuted }}>⋮ → Add to Home Screen</span>.
          </motion.p>
        ) : null}
      </div>

      {/* Right — QR */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-center gap-3"
      >
        <div
          style={{
            padding: 16,
            borderRadius: 24,
            background: '#FFFFFF',
            boxShadow: '0 20px 50px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)',
          }}
        >
          <QRCodeSVG value={url} size={240} level="M" includeMargin={false} fgColor={SYNTH.canvasBottom} bgColor="#FFFFFF" />
        </div>
        <p
          style={{
            fontFamily: SYNTH.font,
            fontSize: 12,
            color: SYNTH.inkOnBrandMuted,
            letterSpacing: '0.04em',
            margin: 0,
          }}
        >
          Scan with your iPhone's camera
        </p>
      </motion.div>
    </div>
  )
}
