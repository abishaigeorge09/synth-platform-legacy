import { useState, useMemo } from 'react'
import { THEME } from '../../../../../lib/theme'
import { HISTORY_ENTRIES } from '../data/demoLineupData'

export function HistoryTab() {
  const [month, setMonth] = useState('April 2026')
  const [boat, setBoat] = useState('all')
  const [search, setSearch] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    let list = HISTORY_ENTRIES

    // Month filter
    list = list.filter((e) => e.month === month)

    // Boat filter
    if (boat !== 'all') {
      list = list
        .map((e) => ({ ...e, boats: e.boats.filter((b) => b.name === boat) }))
        .filter((e) => e.boats.length > 0)
    }

    // Search filter (session title or athlete name in lineups)
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter((e) => {
        if (e.sessionTitle.toLowerCase().includes(q)) return true
        const allNames = [
          ...e.lineup1V.map((r) => r.name),
          ...e.lineup2V.map((r) => r.name),
        ]
        return allNames.some((n) => n.toLowerCase().includes(q))
      })
    }

    return list
  }, [month, boat, search])

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const monthCounts: Record<string, number> = {}
  HISTORY_ENTRIES.forEach((e) => {
    monthCounts[e.month] = (monthCounts[e.month] ?? 0) + 1
  })

  return (
    <div style={{ padding: '16px 24px', paddingBottom: 40, fontFamily: THEME.fontSans }}>
      {/* Header + filters */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Published Lineups
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {filtered.length} lineup{filtered.length !== 1 ? 's' : ''} — {month}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Month dropdown */}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: 8,
              fontSize: 12,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
              fontFamily: THEME.fontMono,
              cursor: 'pointer',
            }}
          >
            <option value="April 2026">April 2026 ({monthCounts['April 2026'] ?? 0})</option>
            <option value="March 2026">March 2026 ({monthCounts['March 2026'] ?? 0})</option>
            <option value="February 2026">February 2026 (0)</option>
            <option value="January 2026">January 2026 (0)</option>
          </select>

          {/* Boat dropdown */}
          <select
            value={boat}
            onChange={(e) => setBoat(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: 8,
              fontSize: 12,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
              fontFamily: THEME.fontMono,
              cursor: 'pointer',
            }}
          >
            <option value="all">All Boats</option>
            <option value="1V 8+">1V 8+</option>
            <option value="2V 8+">2V 8+</option>
          </select>

          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search session or athlete…"
            style={{
              padding: '7px 12px',
              borderRadius: 8,
              fontSize: 12,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              fontFamily: THEME.fontSans,
              outline: 'none',
              minWidth: 180,
            }}
          />
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: 'var(--text-secondary)',
            fontSize: 14,
          }}
        >
          No lineups match the current filters.
        </div>
      )}

      {/* History cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map((entry) => {
          const expanded = expandedIds.has(entry.id)
          return (
            <div
              key={entry.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              {/* Card header */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: THEME.fontMono,
                        color: 'var(--text-tertiary)',
                        marginBottom: 4,
                      }}
                    >
                      {entry.date}
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {entry.sessionTitle}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleExpand(entry.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border-default)',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      fontSize: 11,
                      fontFamily: THEME.fontMono,
                      cursor: 'pointer',
                    }}
                  >
                    {expanded ? '▲ Collapse' : '▼ Expand'}
                  </button>
                </div>

                {/* Boat time chips */}
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  {entry.boats.map((b) => (
                    <span
                      key={b.name}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontFamily: THEME.fontMono,
                        fontWeight: 600,
                        background: 'var(--bg-surface-raised)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--green-primary)',
                      }}
                    >
                      {b.name} · {b.time}
                    </span>
                  ))}
                </div>

                {/* Swap detected */}
                {entry.swaps && entry.swaps.length > 0 && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: 'var(--amber-subtle)',
                      border: '1px solid rgba(245,158,11,0.25)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontFamily: THEME.fontMono,
                        fontWeight: 700,
                        color: 'var(--amber-primary)',
                        letterSpacing: '0.12em',
                        marginBottom: 6,
                      }}
                    >
                      SWAP DETECTED · {entry.swaps.length} change{entry.swaps.length > 1 ? 's' : ''}
                    </div>
                    {entry.swaps.map((swap, i) => (
                      <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>
                        • {swap.change}
                        {swap.impact && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontFamily: THEME.fontMono,
                              fontSize: 11,
                              color: swap.impactPositive ? 'var(--green-primary)' : 'var(--red-primary)',
                            }}
                          >
                            → {swap.impact}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expanded lineup table */}
              {expanded && (
                <div
                  style={{
                    borderTop: '1px solid var(--border-default)',
                    padding: '16px 20px',
                    background: 'var(--bg-surface-raised)',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* 1V 8+ */}
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontFamily: THEME.fontMono,
                          color: 'var(--green-primary)',
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          marginBottom: 8,
                        }}
                      >
                        1V 8+
                      </div>
                      {entry.lineup1V.map((row) => (
                        <div
                          key={row.seat}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '5px 0',
                            borderBottom: '1px solid var(--border-subtle)',
                            fontSize: 12,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: THEME.fontMono,
                              fontSize: 10,
                              color: 'var(--text-tertiary)',
                              minWidth: 60,
                            }}
                          >
                            {row.seat}
                          </span>
                          <span
                            style={{
                              color: row.swappedIn
                                ? 'var(--green-primary)'
                                : row.swappedOut
                                ? 'var(--red-primary)'
                                : 'var(--text-primary)',
                              fontWeight: row.swappedIn || row.swappedOut ? 600 : 400,
                              textDecoration: row.swappedOut ? 'line-through' : 'none',
                            }}
                          >
                            {row.swappedIn && '↑ '}
                            {row.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* 2V 8+ */}
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontFamily: THEME.fontMono,
                          color: 'var(--text-secondary)',
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          marginBottom: 8,
                        }}
                      >
                        2V 8+
                      </div>
                      {entry.lineup2V.map((row) => (
                        <div
                          key={row.seat}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '5px 0',
                            borderBottom: '1px solid var(--border-subtle)',
                            fontSize: 12,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: THEME.fontMono,
                              fontSize: 10,
                              color: 'var(--text-tertiary)',
                              minWidth: 60,
                            }}
                          >
                            {row.seat}
                          </span>
                          <span
                            style={{
                              color: row.swappedIn
                                ? 'var(--green-primary)'
                                : row.swappedOut
                                ? 'var(--red-primary)'
                                : 'var(--text-primary)',
                              fontWeight: row.swappedIn || row.swappedOut ? 600 : 400,
                              textDecoration: row.swappedOut ? 'line-through' : 'none',
                            }}
                          >
                            {row.swappedIn && '↑ '}
                            {row.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Run impact summary */}
                  {entry.runImpact && (
                    <div
                      style={{
                        marginTop: 14,
                        padding: '8px 12px',
                        borderRadius: 6,
                        background: 'var(--green-subtle)',
                        border: '1px solid rgba(5,150,105,0.2)',
                        fontSize: 12,
                        fontFamily: THEME.fontMono,
                        color: 'var(--green-primary)',
                      }}
                    >
                      Run impact: {entry.runImpact}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
