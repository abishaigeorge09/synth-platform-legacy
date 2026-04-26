import {
  SEED_ALERTS,
  SEED_ATHLETES_ALL,
  SEED_ERG_SCORES_ALL,
  SEED_SOURCES_ALL,
  SEED_TEAM_CAL_WOMENS,
} from '../../shared/data/seeds'
import { DEMO_ATHLETE } from '../../shared/data/seeds/demoAthlete'
import { getYoyFor } from '../../shared/data/seeds/athleteExtras'

function fmt2k(seconds?: number) {
  if (seconds === undefined || !Number.isFinite(seconds)) return '—'
  const m = Math.floor(seconds / 60)
  const s = (seconds - m * 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

export function buildTeamDataSummary(teamId: string = SEED_TEAM_CAL_WOMENS.id): string {
  const athletes = SEED_ATHLETES_ALL.filter((a) => a.teamId === teamId)
  const ids = new Set(athletes.map((a) => a.id))
  const ergs = SEED_ERG_SCORES_ALL.filter((e) => ids.has(e.athleteId))
  const alerts = SEED_ALERTS.filter((a) => a.teamId === teamId)
  const sources = SEED_SOURCES_ALL.filter((s) => s.teamId === teamId)
  const staleSources = sources.filter((s) => s.status === 'stale' || s.status === 'failed').length
  const avg2k =
    ergs.length > 0
      ? fmt2k(ergs.reduce((acc, e) => acc + (e.timeSeconds ?? 0), 0) / ergs.length)
      : '—'
  return [
    `${athletes.length} rostered athletes.`,
    `${ergs.length} erg test rows on file; rough mean 2K ≈ ${avg2k}.`,
    `${alerts.length} open team alerts.`,
    `${sources.length} connected sources (${staleSources} stale or failed).`,
  ].join(' ')
}

export function buildAthleteSeedSummary(athleteId: string): string {
  const athlete = SEED_ATHLETES_ALL.find((a) => a.id === athleteId)
  if (!athlete) return 'No seed athlete row for this id.'
  const yoy = getYoyFor(athleteId)
  const erg = SEED_ERG_SCORES_ALL.find((e) => e.athleteId === athleteId)
  return [
    `Name: ${athlete.name}.`,
    yoy
      ? `YoY 2K: ${fmt2k(yoy.sec2025)} (${yoy.date2025}) → ${fmt2k(yoy.sec2026)} (${yoy.date2026}), delta ${yoy.deltaSec.toFixed(1)}s.`
      : 'YoY erg: not in seed YoY table.',
    erg
      ? `Latest seeded 2K: ${fmt2k(erg.timeSeconds)} on ${erg.date}, ${erg.watts ?? '—'}W.`
      : 'Latest erg row: none in seeds.',
  ].join(' ')
}

export function demoAthleteId(): string {
  return DEMO_ATHLETE.id
}
