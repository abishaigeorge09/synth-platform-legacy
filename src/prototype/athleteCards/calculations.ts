import type { SynthAthleteCard } from './model'

export type FilterMode = 'all' | 'top10' | 'most_improved' | 'declining'
export type SortMode = 'rank' | 'name' | 'sessions' | 'improvement'

export function filterAthletes(list: SynthAthleteCard[], filter: FilterMode, search: string): SynthAthleteCard[] {
  let result = list
  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter((a) => a.name.toLowerCase().includes(q) || a.fullName.toLowerCase().includes(q))
  }
  switch (filter) {
    case 'top10':
      result = result.filter((a) => a.rank <= 10)
      break
    case 'most_improved':
      result = [...result].filter((a) => a.trend === 'improving').sort((a, b) => a.trendDeltaSec - b.trendDeltaSec)
      break
    case 'declining':
      result = result.filter((a) => a.trend === 'declining')
      break
    default:
      break
  }
  return result
}

export function sortAthletes(list: SynthAthleteCard[], sort: SortMode): SynthAthleteCard[] {
  const sorted = [...list]
  switch (sort) {
    case 'rank':
      sorted.sort((a, b) => a.rank - b.rank)
      break
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'sessions':
      sorted.sort((a, b) => b.sessionCount - a.sessionCount)
      break
    case 'improvement':
      sorted.sort((a, b) => a.trendDeltaSec - b.trendDeltaSec)
      break
  }
  return sorted
}

export function getSessionsInCommon(a: SynthAthleteCard, b: SynthAthleteCard) {
  const bByDate = new Map(b.sessions.map((s) => [s.date, s]))
  return a.sessions
    .filter((s) => bByDate.has(s.date))
    .map((s) => {
      const o = bByDate.get(s.date)!
      return {
        date: s.date,
        workoutName: s.workoutName,
        workoutCategory: s.workoutCategory,
        splitA: s.splitSec,
        spmA: s.spm,
        splitB: o.splitSec,
        spmB: o.spm,
      }
    })
}
