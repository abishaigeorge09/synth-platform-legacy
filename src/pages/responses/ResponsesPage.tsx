import { useEffect, useMemo, useState } from 'react'
import { AUTH_LIGHT } from '@auth/authTokens'

const T = AUTH_LIGHT

/**
 * /responses — passcode-gated admin view of the waitlist survey. Mirrors the
 * student-store responses dashboard: a passcode is POSTed to the
 * `waitlist-responses` edge function (which validates it server-side and reads
 * with the service role), then rows render in a sortable, filterable table with
 * CSV export. noindex; the passcode is cached in sessionStorage.
 */

type Row = {
  id: string
  email: string
  name: string | null
  sport: string | null
  role: string | null
  university: string | null
  wearable: string | null
  tools: string[] | null
  track_wants: string[] | null
  dimensionality: string | null
  created_at: string
}

type Col = { key: keyof Row; label: string; categorical?: boolean }
const COLS: Col[] = [
  { key: 'created_at', label: 'Joined' },
  { key: 'email', label: 'Email' },
  { key: 'sport', label: 'Sport', categorical: true },
  { key: 'role', label: 'Role', categorical: true },
  { key: 'university', label: 'School / Club' },
  { key: 'wearable', label: 'Wearable', categorical: true },
  { key: 'tools', label: 'Tools today' },
  { key: 'track_wants', label: 'Wants to track' },
  { key: 'dimensionality', label: 'Depth', categorical: true },
]

const PASS_KEY = 'synth:responses:pass'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

function cellText(row: Row, key: keyof Row): string {
  const v = row[key]
  if (v == null) return ''
  if (Array.isArray(v)) return v.join(', ')
  if (key === 'created_at') return new Date(v).toLocaleString()
  return String(v)
}

export function ResponsesPage() {
  useEffect(() => {
    document.title = 'synth · waitlist responses'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => { document.head.removeChild(meta) }
  }, [])

  const [pass, setPass] = useState<string>(() => sessionStorage.getItem(PASS_KEY) ?? '')
  const [authed, setAuthed] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async (p: string) => {
    if (!SUPABASE_URL || !SUPABASE_ANON) {
      setError('Supabase env is not configured in this build (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/waitlist-responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
        },
        body: JSON.stringify({ pass: p }),
      })
      if (res.status === 401) { setError('Wrong passcode.'); setLoading(false); return }
      if (!res.ok) { setError(`Server error (${res.status}).`); setLoading(false); return }
      const data = await res.json()
      setRows(data.rows ?? [])
      setAuthed(true)
      sessionStorage.setItem(PASS_KEY, p)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  // Auto-enter with a cached passcode.
  useEffect(() => {
    const cached = sessionStorage.getItem(PASS_KEY)
    if (cached) void load(cached)
  }, [])

  if (!authed) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6" style={{ background: T.BG, fontFamily: T.BODY }}>
        <form
          onSubmit={(e) => { e.preventDefault(); void load(pass) }}
          className="w-full max-w-[340px] rounded-2xl p-6"
          style={{ border: `1px solid ${T.HAIR}` }}
        >
          <h1 className="text-[20px] font-semibold" style={{ color: T.INK, fontFamily: T.SERIF }}>Waitlist responses</h1>
          <p className="mt-1 text-[13px]" style={{ color: T.MUTED }}>Enter the admin passcode.</p>
          <input
            type="password"
            autoFocus
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Passcode"
            className="mt-4 w-full rounded-lg px-3.5 py-3 text-[15px] outline-none"
            style={{ background: T.SUNK, border: `1px solid ${T.HAIR}`, color: T.INK }}
          />
          {error ? <p className="mt-3 text-[13px]" style={{ color: T.DANGER }}>{error}</p> : null}
          <button
            type="submit"
            disabled={loading || !pass}
            className="mt-4 w-full rounded-lg py-3 text-[15px] font-semibold disabled:opacity-40"
            style={{ background: T.INK, color: '#fff' }}
          >
            {loading ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>
    )
  }

  return <ResponsesTable rows={rows} onRefresh={() => void load(pass)} loading={loading} />
}

function ResponsesTable({ rows, onRefresh, loading }: { rows: Row[]; onRefresh: () => void; loading: boolean }) {
  const [sortKey, setSortKey] = useState<keyof Row>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Partial<Record<keyof Row, string>>>({})

  const distinct = useMemo(() => {
    const map = new Map<keyof Row, Set<string>>()
    for (const col of COLS) {
      if (!col.categorical) continue
      const set = new Set<string>()
      for (const r of rows) {
        const v = cellText(r, col.key)
        if (v) set.add(v)
      }
      map.set(col.key, set)
    }
    return map
  }, [rows])

  const visible = useMemo(() => {
    let out = rows.filter((r) => {
      for (const [key, val] of Object.entries(filters)) {
        if (!val) continue
        if (cellText(r, key as keyof Row) !== val) return false
      }
      if (search.trim()) {
        const hay = COLS.map((c) => cellText(r, c.key)).join(' ').toLowerCase()
        if (!hay.includes(search.trim().toLowerCase())) return false
      }
      return true
    })
    out = [...out].sort((a, b) => {
      const av = cellText(a, sortKey)
      const bv = cellText(b, sortKey)
      const cmp = sortKey === 'created_at'
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : av.localeCompare(bv)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return out
  }, [rows, filters, search, sortKey, sortDir])

  const toggleSort = (key: keyof Row) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const exportCsv = () => {
    const header = COLS.map((c) => c.label).join(',')
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`
    const lines = visible.map((r) => COLS.map((c) => escape(cellText(r, c.key))).join(','))
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-dvh px-4 py-6 sm:px-8" style={{ background: T.BG, fontFamily: T.BODY, color: T.INK }}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-[22px] font-semibold" style={{ fontFamily: T.SERIF }}>Waitlist responses</h1>
        <span className="rounded-full px-2.5 py-0.5 text-[12px] font-semibold tabular-nums" style={{ background: T.GREEN_WASH, color: T.GREEN_DEEP }}>
          {visible.length} / {rows.length}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="rounded-lg px-3 py-2 text-[13px] outline-none"
            style={{ background: T.SUNK, border: `1px solid ${T.HAIR}`, color: T.INK }}
          />
          <button onClick={onRefresh} disabled={loading} className="rounded-lg px-3 py-2 text-[13px] font-semibold disabled:opacity-40" style={{ border: `1px solid ${T.HAIR}`, color: T.INK }}>
            {loading ? '…' : 'Refresh'}
          </button>
          <button onClick={exportCsv} className="rounded-lg px-3 py-2 text-[13px] font-semibold" style={{ background: T.INK, color: '#fff' }}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Categorical filters */}
      <div className="mb-3 flex flex-wrap gap-2">
        {COLS.filter((c) => c.categorical).map((c) => (
          <select
            key={String(c.key)}
            value={filters[c.key] ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, [c.key]: e.target.value }))}
            className="rounded-lg px-2.5 py-1.5 text-[12px] outline-none"
            style={{ background: T.SUNK, border: `1px solid ${T.HAIR}`, color: filters[c.key] ? T.INK : T.DIM }}
          >
            <option value="">{c.label}: all</option>
            {[...(distinct.get(c.key) ?? [])].sort().map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl" style={{ border: `1px solid ${T.HAIR}` }}>
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr style={{ background: T.SUNK }}>
              {COLS.map((c) => (
                <th
                  key={String(c.key)}
                  onClick={() => toggleSort(c.key)}
                  className="cursor-pointer select-none whitespace-nowrap px-3 py-2.5 text-left font-semibold"
                  style={{ color: T.MUTED, borderBottom: `1px solid ${T.HAIR}` }}
                >
                  {c.label}{sortKey === c.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id}>
                {COLS.map((c) => (
                  <td key={String(c.key)} className="whitespace-nowrap px-3 py-2.5 align-top" style={{ borderBottom: `1px solid ${T.HAIR}`, color: T.INK }}>
                    {cellText(r, c.key) || <span style={{ color: T.DIM }}>—</span>}
                  </td>
                ))}
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr><td colSpan={COLS.length} className="px-3 py-8 text-center" style={{ color: T.DIM }}>No responses match.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
