import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { APP_THEME } from '../lib/theme'

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
  /**
   * If true, the row visually mocks an OAuth flow — when toggled on, it
   * shows a "connecting" spinner for ~1s before settling to "connected".
   * Parent owns state; this just adds the timed transition for visual
   * feedback. Default true.
   */
  simulateAuth?: boolean
  onAuthComplete?: () => void
}

/**
 * One connector represented as a row with brand badge, name, description,
 * and an iOS-style switch. Tapping the switch (or anywhere on the row)
 * runs through off → connecting → connected with a small delay so it
 * reads as an OAuth handshake.
 */
export function ConnectorSwitchRow({
  option,
  state,
  onToggle,
  simulateAuth = true,
  onAuthComplete,
}: Props) {
  // When state hits 'connecting', auto-advance to connected after a delay.
  // The parent decides what to do with the completion.
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
    state === 'connecting'
      ? APP_THEME.brand
      : state === 'connected'
        ? APP_THEME.brand
        : APP_THEME.textMuted

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.99 }}
      onClick={onToggle}
      className="flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors"
      style={{
        background: APP_THEME.surface,
        borderColor: state === 'connected' ? `${APP_THEME.brand}40` : APP_THEME.divider,
      }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[14px] font-bold"
        style={{
          background: option.brandColor,
          color: '#FFFFFF',
          fontFamily: APP_THEME.fontMono,
        }}
      >
        {option.name.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[14px] font-semibold"
          style={{ color: APP_THEME.text, fontFamily: APP_THEME.fontSans }}
        >
          {option.name}
        </p>
        <p
          className="mt-0.5 text-[11px] uppercase tracking-[0.12em]"
          style={{ color: labelColor, fontFamily: APP_THEME.fontMono }}
        >
          {label}
          {option.description ? (
            <span style={{ color: APP_THEME.textFaint, textTransform: 'none', letterSpacing: 0 }}>
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
        background: on ? APP_THEME.brand : APP_THEME.dividerStrong,
      }}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="flex h-6 w-6 items-center justify-center rounded-full"
        style={{
          background: '#FFFFFF',
          marginLeft: on ? 20 : 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }}
      >
        {state === 'connecting' ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            className="flex"
          >
            <Loader2 size={12} strokeWidth={2.6} color={APP_THEME.brand} />
          </motion.span>
        ) : state === 'connected' ? (
          <Check size={12} strokeWidth={3} color={APP_THEME.brand} />
        ) : null}
      </motion.span>
    </span>
  )
}

/**
 * Hook-friendly state holder for a list of connectors. Each connector
 * tracks its own switch state. Toggling moves off → connecting (and a
 * setTimeout in <ConnectorSwitchRow simulateAuth/> calls onAuthComplete
 * which we route to mark connected).
 */
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
