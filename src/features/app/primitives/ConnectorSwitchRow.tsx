/* eslint-disable react-refresh/only-export-components */
// Primitive module: exports the row component plus shared constants used
// across the connector flow. Trade-off is full HMR reload on edits.
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { SYNTH } from '../lib/theme'

export type ConnectorSwitchState = 'off' | 'connecting' | 'connected'

export type ConnectorSwitchOption = {
  id: string
  name: string
  description?: string
  brandColor: string
}

type Props = {
  option: ConnectorSwitchOption
  state: ConnectorSwitchState
  onToggle: () => void
  simulateAuth?: boolean
  onAuthComplete?: () => void
}

/**
 * Connector row on the cobalt canvas — brand tile + name + description +
 * iOS-style switch. Tap kicks off off → connecting (spinner) → connected
 * (check) so it reads as an OAuth handshake.
 */
export function ConnectorSwitchRow({
  option,
  state,
  onToggle,
  simulateAuth = true,
  onAuthComplete,
}: Props) {
  useEffect(() => {
    if (!simulateAuth) return
    if (state !== 'connecting') return
    const t = window.setTimeout(() => onAuthComplete?.(), 1100)
    return () => window.clearTimeout(t)
  }, [state, simulateAuth, onAuthComplete])

  const on = state !== 'off'
  const label =
    state === 'connecting' ? 'Connecting…' : state === 'connected' ? 'Connected' : 'Connect'
  const labelColor =
    state === 'connecting' || state === 'connected'
      ? SYNTH.accentEmerald
      : SYNTH.inkOnBrandMuted

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.99 }}
      onClick={onToggle}
      className="flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors"
      style={{
        background: state === 'connected' ? SYNTH.glassActive : SYNTH.glass,
        backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        borderColor: state === 'connected' ? SYNTH.accentEmerald : SYNTH.glassBorder,
      }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[14px] font-bold"
        style={{
          background: option.brandColor,
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
        }}
      >
        {option.name.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[14px] font-semibold"
          style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
        >
          {option.name}
        </p>
        <p
          className="mt-0.5 text-[11px] uppercase tracking-[0.12em]"
          style={{ color: labelColor, fontFamily: SYNTH.font }}
        >
          {label}
          {option.description ? (
            <span
              style={{
                color: SYNTH.inkOnBrandFaint,
                textTransform: 'none',
                letterSpacing: 0,
              }}
            >
              {' '}· {option.description}
            </span>
          ) : null}
        </p>
      </div>
      <Switch state={state} on={on} />
    </motion.button>
  )
}

function Switch({ state, on }: { state: ConnectorSwitchState; on: boolean }) {
  return (
    <span
      className="relative flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors"
      style={{
        background: on ? SYNTH.accentEmerald : 'rgba(255,255,255,0.20)',
        border: '1px solid rgba(255,255,255,0.18)',
      }}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="flex h-5 w-5 items-center justify-center rounded-full"
        style={{
          background: SYNTH.inkOnBrand,
          marginLeft: on ? 18 : 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        }}
      >
        {state === 'connecting' ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            className="flex"
          >
            <Loader2 size={11} strokeWidth={2.6} color={SYNTH.accentEmerald} />
          </motion.span>
        ) : state === 'connected' ? (
          <Check size={11} strokeWidth={3} color={SYNTH.accentEmerald} />
        ) : null}
      </motion.span>
    </span>
  )
}

export function useConnectorSwitchStates(initialIds: string[] = []) {
  const [states, setStates] = useState<Record<string, ConnectorSwitchState>>(
    Object.fromEntries(initialIds.map((id) => [id, 'connected'])),
  )

  const get = (id: string): ConnectorSwitchState => states[id] ?? 'off'

  const toggle = (id: string) => {
    setStates((prev) => {
      const cur = prev[id] ?? 'off'
      if (cur === 'off') return { ...prev, [id]: 'connecting' }
      return { ...prev, [id]: 'off' }
    })
  }

  const markConnected = (id: string) => {
    setStates((prev) => {
      if (prev[id] !== 'connecting') return prev
      return { ...prev, [id]: 'connected' }
    })
  }

  const connectedIds = Object.entries(states)
    .filter(([, s]) => s === 'connected')
    .map(([id]) => id)

  return { get, toggle, markConnected, connectedIds }
}
