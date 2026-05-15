import { create } from 'zustand'
import type { Team } from '../data/types'
import { SEED_TEAM_CAL_WOMENS } from '../data/seeds'
import { supabase } from '../../lib/supabaseClient'

type TeamState = {
  activeTeam: Team
  /** True if the store has reflected the user's real team (not the seed fallback). */
  isRealTeam: boolean
  setActiveTeam: (team: Team) => void
}

export const useTeamStore = create<TeamState>((set) => ({
  activeTeam: SEED_TEAM_CAL_WOMENS,
  isRealTeam: false,
  setActiveTeam: (team) => set({ activeTeam: team, isRealTeam: team.id !== SEED_TEAM_CAL_WOMENS.id }),
}))

// ─── Supabase team bridge ─────────────────────────────────────────────────
// Subscribes to auth state. When a real (non-anonymous) user signs in,
// we look up their team_id in public.users → public.teams and push
// the result into the store. On sign-out we revert to the seed team
// so the demo experience still renders.

if (supabase) {
  type UserRow = { team_id: string | null }
  type TeamRow = {
    id: string
    name: string
    sport: string
    invite_code: string
    created_at: string
  }

  const rowToTeam = (row: TeamRow): Team => ({
    id: row.id,
    name: row.name,
    sport: row.sport,
    inviteCode: row.invite_code,
    createdAt: row.created_at,
  })

  async function loadTeamForUser(userId: string): Promise<Team | null> {
    if (!supabase) return null
    const { data: userRow, error: userErr } = await supabase
      .from('users')
      .select('team_id')
      .eq('id', userId)
      .maybeSingle<UserRow>()
    if (userErr || !userRow?.team_id) return null
    const { data: teamRow, error: teamErr } = await supabase
      .from('teams')
      .select('id, name, sport, invite_code, created_at')
      .eq('id', userRow.team_id)
      .maybeSingle<TeamRow>()
    if (teamErr || !teamRow) return null
    return rowToTeam(teamRow)
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session || session.user.is_anonymous) {
      // Anonymous users (demo) and signed-out state both render the
      // seed Pacific Women's team so the UI has something to show.
      useTeamStore.setState({
        activeTeam: SEED_TEAM_CAL_WOMENS,
        isRealTeam: false,
      })
      return
    }
    try {
      const team = await loadTeamForUser(session.user.id)
      if (team) {
        useTeamStore.setState({ activeTeam: team, isRealTeam: true })
      } else {
        useTeamStore.setState({
          activeTeam: SEED_TEAM_CAL_WOMENS,
          isRealTeam: false,
        })
      }
    } catch (err) {
      if (typeof console !== 'undefined') {
        console.warn('[team] loadTeamForUser failed', err)
      }
    }
  })

  // One-shot fetch on module load in case the listener missed the
  // initial event.
  void Promise.race([
    supabase.auth.getSession(),
    new Promise<{ data: { session: null } }>((resolve) =>
      setTimeout(() => resolve({ data: { session: null } }), 1500),
    ),
  ]).then(async ({ data }) => {
    if (!data.session || data.session.user.is_anonymous) return
    const team = await loadTeamForUser(data.session.user.id)
    if (team) useTeamStore.setState({ activeTeam: team, isRealTeam: true })
  })
}
