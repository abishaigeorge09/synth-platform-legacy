import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { THEME } from '../../../../../lib/theme'
import { useAthleteProfileLineups } from '../../../../../shared/data/queries'

type RangeKey = '30d' | '90d' | 'all'

const RANGE_LABELS: Record<RangeKey, string> = {
  '30d': '30 days',
  '90d': '90 days',
  all: 'All',
}

function cutoffFor(range: RangeKey) {
  if (range === 'all') return null
  const days = range === '30d' ? 30 : 90
  return Date.now() - days * 86400000
}

export function LineupsHistoryPanel({ athleteId }: { athleteId: string }) {
  const { data: raw } = useAthleteProfileLineups(athleteId)
  const [range, setRange] = useState<RangeKey>('90d')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const cutoff = cutoffFor(range)
    const query = q.trim().toLowerCase()
    return raw
      .filter((l) => {
        if (!cutoff) return true
        return new Date(l.date).getTime() >= cutoff
      })
      .filter((l) => {
        if (!query) return true
        return (
          l.date.toLowerCase().includes(query) ||
          l.session.toLowerCase().includes(query) ||
          l.boat.toLowerCase().includes(query)
        )
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [raw, range, q])

  const label = useMemo(() => {
    if (range === 'all') return `Showing ${filtered.length} of ${raw.length}`
    const days = range === '30d' ? 30 : 90
    return `Showing ${filtered.length} of ${raw.length} · last ${days} days`
  }, [filtered.length, raw.length, range])

  return (
    <section className="rounded-xl border border-zinc-200 bg-[var(--bg-primary)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">Lineups</div>
          <div className="mt-1 text-[15px] font-semibold text-zinc-900">Complete history</div>
          <div className="mt-0.5 text-[11px]" style={{ color: THEME.textSecondary, fontFamily: THEME.fontSans }}>
            {label}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
            {(Object.keys(RANGE_LABELS) as RangeKey[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setRange(k)}
                className="px-2.5 py-1 text-[11px]"
                style={{
                  fontFamily: THEME.fontMono,
                  background: range === k ? THEME.primary : 'transparent',
                  color: range === k ? THEME.white : THEME.textSecondary,
                }}
              >
                {RANGE_LABELS[k]}
              </button>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search date (YYYY-MM-DD)…"
            className="h-8 w-[220px] rounded-lg border px-3 text-[12px] outline-none"
            style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textPrimary, fontFamily: THEME.fontSans }}
          />
        </div>
      </div>

      <div className="synth-scroll mt-4 flex max-h-[340px] flex-col gap-2 overflow-y-auto pr-1">
        {filtered.map((l) => (
          <motion.div
            key={l.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2.5"
            style={{
              borderColor: THEME.border,
              background: THEME.light,
              borderLeft: `3px solid ${l.side === 'port' ? THEME.cyan : THEME.purple}`,
            }}
          >
            <div className="min-w-0">
              <div className="text-[11px] font-semibold" style={{ color: THEME.textPrimary }}>
                {l.session}
              </div>
              <div className="mt-0.5 text-[11px]" style={{ color: THEME.textSecondary, fontFamily: THEME.fontSans }}>
                {l.date} · {l.boat} · seat {l.seat} · {l.side}
                {l.changed ? ' · changed' : ''}
              </div>
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{
                background: `${l.side === 'port' ? THEME.cyan : THEME.purple}16`,
                color: l.side === 'port' ? THEME.cyan : THEME.purple,
                fontFamily: THEME.fontMono,
              }}
            >
              {l.boat}
            </span>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed p-4 text-[12px]" style={{ borderColor: THEME.border, color: THEME.textSecondary }}>
            No lineups match your filters.
          </div>
        )}
      </div>
    </section>
  )
}

