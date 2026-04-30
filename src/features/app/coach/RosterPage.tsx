import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ChevronRight } from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import {
  useAthletes,
  useErgScores,
  getAthleteRecovery,
  isAthleteFlagged,
} from '../../../shared/data/queries'
import type { Athlete, ErgScore } from '../../../shared/data/types'
import { SYNTH } from '../lib/theme'

type SortKey = 'rank' | 'name' | 'recovery'

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'rank', label: '2K rank' },
  { value: 'name', label: 'Name' },
  { value: 'recovery', label: 'Recovery' },
]

function fmt2k(seconds?: number) {
  if (seconds === undefined) return '—'
  const m = Math.floor(seconds / 60)
  const s = (seconds - m * 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

function recoveryAccent(recovery: number) {
  if (recovery >= 75) return SYNTH.accentEmerald
  if (recovery >= 50) return SYNTH.accentAmber
  return SYNTH.accentRed
}

export function RosterPage() {
  const navigate = useNavigate()
  const { data: athletes } = useAthletes()
  const { data: ergScores } = useErgScores()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('rank')

  const ranks = useMemo(() => {
    const sorted = athletes
      .map((a) => ({
        id: a.id,
        time: ergScores.find((e) => e.athleteId === a.id)?.timeSeconds ?? Infinity,
      }))
      .sort((a, b) => a.time - b.time)
    const map = new Map<string, number>()
    sorted.forEach((s, i) => map.set(s.id, i + 1))
    return map
  }, [athletes, ergScores])

  const visible = useMemo(() => {
    let rows = athletes.map((a) => ({
      athlete: a,
      erg: ergScores.find((e) => e.athleteId === a.id),
      rank: ranks.get(a.id) ?? 999,
      recovery: getAthleteRecovery(a.id),
      flagged: isAthleteFlagged(a.id),
    }))
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      rows = rows.filter((r) => r.athlete.name.toLowerCase().includes(q))
    }
    if (sort === 'rank') rows.sort((a, b) => a.rank - b.rank)
    if (sort === 'name') rows.sort((a, b) => a.athlete.name.localeCompare(b.athlete.name))
    if (sort === 'recovery') rows.sort((a, b) => b.recovery - a.recovery)
    return rows
  }, [athletes, ergScores, ranks, query, sort])

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-safe-tab">
      <CoachPageHeader title="Roster" back="/app/coach/settings" />

      <section className="mx-5 mt-2">
        <label
          data-tour="coach-roster-search"
          className="flex items-center gap-2 rounded-full px-4"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`,
            color: SYNTH.inkOnBrand,
          }}
        >
          <Search size={14} color={SYNTH.inkOnBrandMuted} strokeWidth={2.2} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search athletes"
            className="flex-1 bg-transparent py-3 text-[14px] outline-none placeholder:opacity-60"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          />
        </label>

        <div className="mt-3 flex flex-wrap gap-2">
          {SORTS.map((s) => {
            const active = sort === s.value
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => setSort(s.value)}
                className="rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{
                  background: active ? SYNTH.inkOnBrand : 'transparent',
                  borderColor: active ? SYNTH.inkOnBrand : SYNTH.glassBorder,
                  color: active ? SYNTH.ink : SYNTH.inkOnBrand,
                  fontFamily: SYNTH.font,
                }}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-5 px-5">
        <div
          className="overflow-hidden rounded-3xl"
          style={{
            background: SYNTH.inlineCard,
            border: `1px solid ${SYNTH.inlineCardBorder}`,
          }}
        >
          {visible.length === 0 ? (
            <p
              className="px-5 py-8 text-center text-[13px]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              No athletes match.
            </p>
          ) : (
            visible.map(({ athlete, erg, rank, recovery, flagged }, i) => (
              <div key={athlete.id} {...(i === 0 ? { 'data-tour': 'coach-roster-card' } : {})}>
                <RosterRow
                  athlete={athlete}
                  erg={erg}
                  rank={rank}
                  recovery={recovery}
                  flagged={flagged}
                  first={i === 0}
                  onPress={() => navigate(`/app/coach/athlete/${athlete.id}`)}
                />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

function RosterRow({
  athlete,
  erg,
  rank,
  recovery,
  flagged,
  first,
  onPress,
}: {
  athlete: Athlete
  erg?: ErgScore
  rank: number
  recovery: number
  flagged: boolean
  first: boolean
  onPress: () => void
}) {
  const recColor = recoveryAccent(recovery)
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.99 }}
      onClick={onPress}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:opacity-80"
      style={{ borderTop: first ? 'none' : `1px solid ${SYNTH.inlineCardBorder}` }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{
          background: SYNTH.glass,
          border: `1px solid ${SYNTH.glassBorder}`,
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: '0.04em',
        }}
      >
        {initialsOf(athlete.name)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p
            className="truncate text-[14px] font-semibold leading-tight"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            {athlete.name}
          </p>
          {flagged ? (
            <span
              className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: recColor }}
              aria-label="flagged"
            />
          ) : null}
        </div>
        <p
          className="mt-0.5 text-[10px] uppercase tracking-[0.12em]"
          style={{
            color: SYNTH.inkOnBrandMuted,
            fontFamily: SYNTH.font,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          #{String(rank).padStart(2, '0')} · {athlete.year} · {athlete.side}
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="text-right">
          <p
            className="text-[9px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
          >
            2K
          </p>
          <p
            className="text-[13px] font-bold leading-none"
            style={{
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {fmt2k(erg?.timeSeconds)}
          </p>
        </div>
        <span
          className="rounded-full px-2 py-1 text-[11px] font-bold"
          style={{
            background: `${recColor}26`,
            color: recColor,
            border: `1px solid ${recColor}55`,
            fontFamily: SYNTH.font,
            fontVariantNumeric: 'tabular-nums',
            minWidth: 38,
            textAlign: 'center',
          }}
        >
          {recovery}
        </span>
        <ChevronRight size={14} color={SYNTH.inkOnBrandFaint} />
      </div>
    </motion.button>
  )
}
