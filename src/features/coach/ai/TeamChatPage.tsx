import { ChatView } from './ChatView'

export function TeamChatPage() {
  return (
    <ChatView
      scope="team"
      kicker="synth. AI · team-wide"
      title="Chat with your team's synthesized data"
      subtitle="Every signal across every connector is context. Responses cite the rows they drew from."
      suggestions={[
        'Which athletes improved most this month?',
        "What is the team's average 2K split?",
        "Who hasn't logged gym data in 7 days?",
        'What changed in the last scan?',
      ]}
    />
  )
}
