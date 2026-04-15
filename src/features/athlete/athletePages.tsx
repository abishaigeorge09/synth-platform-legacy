import { PlaceholderPage } from '../../shared/layout/PlaceholderPage'

export function MyDashboardPage() {
  return (
    <PlaceholderPage
      kicker="Athlete · My Team"
      title="Your team, your coach, your squad."
      description="Phase 7 shows the athlete's team card, coach contact, and teammate grid. Visibility follows team_settings.athlete_visibility_json in the schema."
      phase="Phase 7 · queued"
    />
  )
}

export function MyStatsPage() {
  return (
    <PlaceholderPage
      kicker="Athlete · My Stats"
      title="Personal performance trends."
      description="Phase 7 renders your own erg splits, recovery, and training load charted over the season. Scoped to self — no other-athlete visibility."
      phase="Phase 7 · queued"
    />
  )
}

export function MySessionsPage() {
  return (
    <PlaceholderPage
      kicker="Athlete · Sessions"
      title="Every session you were in."
      description="Phase 7 lists every session timeline with splits and any videos the coach chose to share from your boat."
      phase="Phase 7 · queued"
    />
  )
}

export function MyLineupsPage() {
  return (
    <PlaceholderPage
      kicker="Athlete · Lineups"
      title="Boat assignments across the season."
      description="Phase 7 surfaces which boat and seat you were in for every published lineup."
      phase="Phase 7 · queued"
    />
  )
}

export function MySourcesPage() {
  return (
    <PlaceholderPage
      kicker="Athlete · My Sources"
      title="Connect your own apps."
      description="Phase 7 lets athletes attach personal data sources — Google Sheets, screenshot uploads, wearables — that plug back into their own stats only."
      phase="Phase 7 · queued"
    />
  )
}

export function MyChatPage() {
  return (
    <PlaceholderPage
      kicker="Athlete · synth. AI"
      title="Chat scoped to your data."
      description="Phase 8 wires the athlete-scoped chat UI. Questions like 'How did my splits trend this month?' resolve against your own source_data only."
      phase="Phase 8 · queued"
    />
  )
}

export function AthleteSettingsPage() {
  return (
    <PlaceholderPage
      kicker="Athlete · Settings"
      title="Notifications, visibility, account."
      description="Phase 9 adds athlete-side preferences. Coach-controlled settings live on team_settings; personal preferences on user_settings."
      phase="Phase 9 · queued"
    />
  )
}
