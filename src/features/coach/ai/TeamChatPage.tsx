import { useState } from 'react'
import { motion } from 'framer-motion'
import { CoachTeamMessaging } from '../../../components/chat/CoachTeamMessaging'
import { THEME } from '../../../lib/theme'
import { ChatView } from './ChatView'

type Tab = 'team' | 'ai'

export function TeamChatPage() {
  const [tab, setTab] = useState<Tab>('ai')

  return (
    <div className="flex min-h-full w-full flex-col">
      <div className="flex gap-2 px-5 pt-6 sm:px-10">
        {(
          [
            { id: 'ai' as const, label: 'synth. AI' },
            { id: 'team' as const, label: 'Team messages' },
          ] satisfies { id: Tab; label: string }[]
        ).map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors"
              style={{
                fontFamily: THEME.fontMono,
                borderColor: active ? THEME.primary : THEME.border,
                background: active ? `${THEME.primary}14` : THEME.white,
                color: active ? THEME.primary : THEME.textSecondary,
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div className={tab === 'team' ? 'block' : 'hidden'}>
        <div className="px-5 pb-10 pt-4 sm:px-10">
          <p className="mb-3 max-w-[640px] text-[13px]" style={{ color: THEME.textSecondary, fontFamily: THEME.fontSans }}>
            Real-time roster chat via GetStream. When no API key is set, you see the demo thread.
          </p>
          <CoachTeamMessaging variant="coach" />
        </div>
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: tab === 'ai' ? 1 : 0.96 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={tab === 'ai' ? 'block' : 'hidden'}
      >
        <ChatView
          scope="team"
          kicker="Team AI"
          title="Ask your data"
          subtitle="Answers include source citations. Claude streams when configured."
          suggestions={[
            'Which athletes improved most this month?',
            "What is the team's average 2K split?",
            "Who hasn't logged gym data in 7 days?",
            'What changed in the last scan?',
          ]}
        />
      </motion.div>
    </div>
  )
}
