import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ChevronRight } from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { APP_MOCK_ATHLETES, APP_MOCK_TEAM, fmtErgTime, fmtAgo } from '../data/mockTeam'
import { SYNTH } from '../lib/theme'

type SortKey = 'name' | 'recovery' | 'erg' | 'sync'

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'erg', label: '2K best' },
  { value: 'sync', label: 'Last sync' },
]

export function RosterPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('name')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = APP_MOCK_ATHLETES.filter((a) => {
      if (!q) return true
      return a.name.toLowerCase().includes(q) || a.position.toLowerCase().includes(q)
    })
    switch (sort) {
      case 'recovery':
        return [...list].sort((a, b) => b.recoveryScore - a.recoveryScore)
      case 'erg':
        return [...list].sort((a, b) => a.twoKBestSeconds - b.twoKBestSeconds)
      case 'sync':
        return [...list].sort((a, b) => a.lastSyncMinutes - b.lastSyncMinutes)
      case 'name':
      default:
        return [...list].sort((a, b) => a.name.localeCompare(b.name))
    }
  }, [query, sort])

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[140px]">
      <CoachPageHeader
        title="Roster"
        subtitle={`${APP_MOCK_TEAM.athleteCount} athletes · ${APP_MOCK_TEAM.name}`}
        back="/app/coach/settings"
      />

      <section className="mx-5 mt-2">
        <label
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
            placeholder="Search by name or seat"
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
          {filtered.length === 0 ? (
            <p
              className="px-5 py-8 text-center text-[13px]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              No athletes match.
            </p>
          ) : (
            filtered.map((a, i) => (
              <motion.button
                key={a.id}
                type="button"
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/app/coach/athlete/${a.id}`)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:opacity-80"
                style={{
                  borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.inlineCardBorder}`,
                }}
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
                  {a.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-[14px] font-semibold leading-tight"
                    style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                  >
                    {a.name}
                  </p>
                  <p
                    className="mt-0.5 text-[11px]"
                    style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                  >
                    {a.position}
                  </p>
                  <p
                    className="mt-1 text-[10px] uppercase tracking-[0.12em]"
                    style={{
                      color: SYNTH.provenanceOnBrand,
                      fontFamily: SYNTH.font,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    Recovery {a.recoveryScore} · 2K {fmtErgTime(a.twoKBestSeconds)} · {a.primarySource} {fmtAgo(a.lastSyncMinutes)}
                  </p>
                </div>
                <ChevronRight size={16} color={SYNTH.inkOnBrandFaint} />
              </motion.button>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
