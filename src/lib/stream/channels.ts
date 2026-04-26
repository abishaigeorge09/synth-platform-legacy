import type { Team } from '../../shared/data/types'

/** Messaging CID id segment (Stream `type` + `id`). */
export function teamMessagingChannelId(team: Pick<Team, 'id'>): string {
  return `team-${team.id}`
}

export function dmChannelId(athleteId: string): string {
  return `dm-coach-${athleteId}`
}
