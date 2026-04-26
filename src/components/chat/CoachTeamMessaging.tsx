import { useEffect, useState, type CSSProperties } from 'react'
import type { Channel as StreamChannel } from 'stream-chat'
import { Chat, Channel, ChannelHeader, MessageComposer, MessageList, Window } from 'stream-chat-react'
import 'stream-chat-react/dist/css/index.css'
import { THEME } from '../../lib/theme'
import { disconnectStreamClient, getStreamClient } from '../../lib/stream/client'
import { teamMessagingChannelId } from '../../lib/stream/channels'
import { isStreamConfigured } from '../../lib/stream/env'
import { getStreamUserToken } from '../../lib/stream/tokens'
import { DEMO_ATHLETE } from '../../shared/data/seeds/demoAthlete'
import { useAuthStore } from '../../shared/store/useAuthStore'
import { useTeamStore } from '../../shared/store/useTeamStore'
import { MockTeamChat } from './MockTeamChat'

type Variant = 'coach' | 'athlete'

export function CoachTeamMessaging({ variant = 'coach' }: { variant?: Variant }) {
  const [useMock, setUseMock] = useState(!isStreamConfigured())
  const [active, setActive] = useState<StreamChannel | null>(null)
  const [ready, setReady] = useState(false)
  const coachUser = useAuthStore((s) => s.user)
  const team = useTeamStore((s) => s.activeTeam)

  const streamUserId =
    variant === 'coach' ? (coachUser?.id ?? 'user-coach-cal-womens') : DEMO_ATHLETE.id
  const streamUserName = variant === 'coach' ? (coachUser?.name ?? 'Coach') : DEMO_ATHLETE.name

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!isStreamConfigured()) {
        setUseMock(true)
        setReady(true)
        return
      }
      const apiKey = import.meta.env.VITE_STREAM_API_KEY as string
      const client = getStreamClient()
      if (!client) {
        setUseMock(true)
        setReady(true)
        return
      }
      try {
        const token = getStreamUserToken(apiKey, streamUserId)
        await client.connectUser({ id: streamUserId, name: streamUserName }, token)
        const cid = teamMessagingChannelId(team)
        const ch = client.channel('messaging', cid, {})
        await ch.watch()
        if (!cancelled) {
          setActive(ch)
          setUseMock(false)
        }
      } catch {
        await disconnectStreamClient()
        if (!cancelled) {
          setUseMock(true)
          setActive(null)
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    }
    void run()
    return () => {
      cancelled = true
      void disconnectStreamClient()
    }
  }, [streamUserId, streamUserName, team])

  if (!ready && !useMock) {
    return (
      <div
        className="flex min-h-[420px] items-center justify-center rounded-2xl border text-[12px]"
        style={{ borderColor: THEME.border, color: THEME.textSecondary }}
      >
        Connecting to team chat…
      </div>
    )
  }

  if (useMock || !active) {
    return <MockTeamChat surface={variant === 'coach' ? 'coach' : 'athlete'} />
  }

  const client = getStreamClient()
  if (!client) return <MockTeamChat surface={variant === 'coach' ? 'coach' : 'athlete'} />

  return (
    <div
      className="str-chat str-chat--theme-dark synth-stream-chat h-full min-h-[420px] overflow-hidden rounded-2xl border"
      style={
        {
          '--str-chat__primary-color': THEME.primary,
          '--str-chat__active-primary-color': THEME.primaryDark,
          '--str-chat__background-color': variant === 'coach' ? THEME.white : '#18181b',
          '--str-chat__secondary-background-color': variant === 'coach' ? THEME.light : '#27272a',
          '--str-chat__own-message-bubble-color': THEME.primary,
          borderColor: variant === 'coach' ? THEME.border : 'var(--border-default)',
        } as CSSProperties
      }
    >
      <Chat client={client}>
        <Channel channel={active}>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageComposer focus />
          </Window>
        </Channel>
      </Chat>
    </div>
  )
}
