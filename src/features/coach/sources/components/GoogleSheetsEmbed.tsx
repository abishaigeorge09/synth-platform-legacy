/**
 * GoogleSheetsEmbed — renders ERG_316_2K data in a faithful Google Sheets style.
 * Background is ALWAYS white (#ffffff), Arial 13px, #f3f3f3 header rows, #e2e2e2 gridlines.
 */
import { useState, useMemo } from 'react'
import { ERG_316_2K, ERG_2K_YOY } from '../../../../prototype/rowiqWomensData'
import { toast } from '../../../../shared/store/useToastStore'

export type GoogleSheetsEmbedProps = {
  highlightAthleteName?: string | null
  sortCol?: string
  onSortChange?: (col: string) => void
}

type SheetTabId = 'erg-log' | 'yoy-compare' | 'season-prs'

// Convert 'Wheeler, Ella' → 'Ella Wheeler'
function flipName(lastFirst: string): string {
  const [last, first] = lastFirst.split(', ')
  if (!first || !last) return lastFirst
  return `${first.trim()} ${last.trim()}`
}

// Notes for specific ranks
const RANK_NOTES: Record<number, string> = {
  1: 'Season PR',
  4: 'Negative split',
  6: '↑ +10.3s from last year',
}

// ── Build sheet rows from ERG_316_2K ─────────────────────────────────────────
const ALL_ROWS = ERG_316_2K.map((entry, idx) => ({
  rank: idx + 1,
  side: idx % 2 === 0 ? 'Port' : 'Stbd',
  athlete: flipName(entry.lastFirst),
  time: entry.time,
  avgSplit: entry.avgSplit,
  watts: entry.watts,
  spm: entry.rate,
  date: 'Mar 16, 2026',
  notes: RANK_NOTES[idx + 1] ?? '',
}))

type Row = typeof ALL_ROWS[number]

const COLUMNS: { key: keyof Row; label: string; width: number; align?: 'right' | 'left' }[] = [
  { key: 'rank',     label: 'Rank',     width: 52,  align: 'right' },
  { key: 'side',     label: 'Side',     width: 64 },
  { key: 'athlete',  label: 'Athlete',  width: 180 },
  { key: 'time',     label: '2K Time',  width: 90,  align: 'right' },
  { key: 'avgSplit', label: 'Avg Split',width: 90,  align: 'right' },
  { key: 'watts',    label: 'Watts',    width: 70,  align: 'right' },
  { key: 'spm',      label: 'SPM',      width: 56,  align: 'right' },
  { key: 'date',     label: 'Date',     width: 110 },
  { key: 'notes',    label: 'Notes',    width: 200 },
]

const COL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function colLetter(idx: number) {
  return COL_LETTERS[idx] ?? String(idx + 1)
}

function sortRows(rows: Row[], col: string, asc: boolean): Row[] {
  return [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[col]
    const bv = (b as Record<string, unknown>)[col]
    if (typeof av === 'number' && typeof bv === 'number') return asc ? av - bv : bv - av
    return asc
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av))
  })
}

// ── YoY tab ──────────────────────────────────────────────────────────────────
function YoySheet() {
  return (
    <div style={{ overflowX: 'auto', height: 440, overflowY: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13, fontFamily: 'Arial, system-ui, sans-serif', color: '#202124' }}>
        <thead>
          <tr style={{ background: '#f3f3f3', position: 'sticky', top: 0 }}>
            {['#', 'Athlete', '2025 Time', '2026 Time', 'Δ (sec)', 'Trend'].map((h, i) => (
              <th key={h} style={{ border: '1px solid #e2e2e2', padding: '4px 8px', textAlign: i <= 1 ? 'left' : 'right', fontWeight: 600, whiteSpace: 'nowrap', minWidth: i === 1 ? 160 : 80 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ERG_2K_YOY.map((r, i) => (
            <tr key={r.short} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
              <td style={{ border: '1px solid #e2e2e2', padding: '3px 8px', textAlign: 'right', color: '#6c6c6c' }}>{i + 1}</td>
              <td style={{ border: '1px solid #e2e2e2', padding: '3px 8px' }}>{r.short}</td>
              <td style={{ border: '1px solid #e2e2e2', padding: '3px 8px', textAlign: 'right' }}>{r.y2025}</td>
              <td style={{ border: '1px solid #e2e2e2', padding: '3px 8px', textAlign: 'right', fontWeight: 600 }}>{r.y2026}</td>
              <td style={{ border: '1px solid #e2e2e2', padding: '3px 8px', textAlign: 'right', color: r.deltaSec < 0 ? '#137333' : '#c5221f' }}>
                {r.deltaSec < 0 ? r.deltaSec.toFixed(1) : `+${r.deltaSec.toFixed(1)}`}
              </td>
              <td style={{ border: '1px solid #e2e2e2', padding: '3px 8px', textAlign: 'right' }}>
                <span style={{ color: r.deltaSec < -3 ? '#137333' : r.deltaSec < 0 ? '#188038' : '#c5221f' }}>
                  {r.deltaSec < -3 ? '▲▲' : r.deltaSec < 0 ? '▲' : '▼'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Season PRs tab ────────────────────────────────────────────────────────────
function SeasonPrsSheet() {
  const top10 = ALL_ROWS.slice(0, 10)
  return (
    <div style={{ overflowX: 'auto', height: 440, overflowY: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13, fontFamily: 'Arial, system-ui, sans-serif', color: '#202124' }}>
        <thead>
          <tr style={{ background: '#f3f3f3', position: 'sticky', top: 0 }}>
            {['Rank', 'Athlete', 'PR Time', 'Avg Split', 'Watts', 'PR Date'].map((h, i) => (
              <th key={h} style={{ border: '1px solid #e2e2e2', padding: '4px 8px', textAlign: i === 1 ? 'left' : 'right', fontWeight: 600, whiteSpace: 'nowrap', minWidth: i === 1 ? 160 : 80 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {top10.map((r, i) => (
            <tr key={r.athlete} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
              <td style={{ border: '1px solid #e2e2e2', padding: '3px 8px', textAlign: 'right', color: '#6c6c6c' }}>{i + 1}</td>
              <td style={{ border: '1px solid #e2e2e2', padding: '3px 8px', fontWeight: 500 }}>{r.athlete}</td>
              <td style={{ border: '1px solid #e2e2e2', padding: '3px 8px', textAlign: 'right', fontWeight: 700, color: '#137333' }}>{r.time}</td>
              <td style={{ border: '1px solid #e2e2e2', padding: '3px 8px', textAlign: 'right' }}>{r.avgSplit}</td>
              <td style={{ border: '1px solid #e2e2e2', padding: '3px 8px', textAlign: 'right' }}>{r.watts}</td>
              <td style={{ border: '1px solid #e2e2e2', padding: '3px 8px', textAlign: 'right', color: '#6c6c6c' }}>Mar 16, 2026</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function GoogleSheetsEmbed({ highlightAthleteName }: GoogleSheetsEmbedProps) {
  const [sheetTab, setSheetTab] = useState<SheetTabId>('erg-log')
  const [sortCol, setSortCol] = useState<string>('rank')
  const [sortAsc, setSortAsc] = useState(true)

  const sorted = useMemo(() => sortRows(ALL_ROWS, sortCol, sortAsc), [sortCol, sortAsc])

  function handleColClick(col: string) {
    if (col === sortCol) {
      setSortAsc((v) => !v)
    } else {
      setSortCol(col)
      setSortAsc(true)
    }
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e2e2', borderRadius: 8, overflow: 'hidden', fontFamily: 'Arial, system-ui, sans-serif' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid #e2e2e2', background: '#f8f9fa' }}>
        <div style={{ fontSize: 13, color: '#202124', fontWeight: 500 }}>
          Cal Women&apos;s Erg Workbook · 46 athletes · 316 2K · Mar 16 2026
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => toast('Sync requested (demo)', 'info')}
            style={{ fontSize: 12, padding: '4px 12px', borderRadius: 4, border: '1px solid #dadce0', background: '#fff', color: '#3c4043', cursor: 'pointer' }}
          >
            Sync now
          </button>
          <button
            type="button"
            onClick={() => toast('Open in Google Sheets (demo)', 'info')}
            style={{ fontSize: 12, padding: '4px 12px', borderRadius: 4, border: 'none', background: '#188038', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
          >
            Open in Sheets →
          </button>
        </div>
      </div>

      {/* Sheet body */}
      {sheetTab === 'erg-log' && (
        <div style={{ overflowX: 'auto', height: 440, overflowY: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 13, fontFamily: 'Arial, system-ui, sans-serif', color: '#202124', tableLayout: 'fixed' }}>
            {/* Column-letter header row */}
            <colgroup>
              {/* row-number col */}
              <col style={{ width: 40 }} />
              {COLUMNS.map((c, i) => (
                <col key={i} style={{ width: c.width }} />
              ))}
            </colgroup>
            <thead>
              <tr style={{ background: '#f3f3f3' }}>
                {/* top-left corner cell */}
                <th style={{ border: '1px solid #e2e2e2', padding: '3px 4px', width: 40, minWidth: 40, background: '#f3f3f3', color: '#6c6c6c', fontSize: 11, textAlign: 'center' }} />
                {COLUMNS.map((c, i) => (
                  <th
                    key={c.key}
                    style={{ border: '1px solid #e2e2e2', padding: '3px 4px', background: '#f3f3f3', color: '#6c6c6c', fontSize: 11, textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleColClick(c.key)}
                  >
                    {colLetter(i)}
                  </th>
                ))}
              </tr>
              <tr style={{ background: '#f3f3f3', position: 'sticky', top: 22 }}>
                {/* row-number header */}
                <td style={{ border: '1px solid #e2e2e2', padding: '3px 4px', background: '#f3f3f3', minWidth: 40, textAlign: 'center', color: '#6c6c6c', fontSize: 11 }}>1</td>
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    style={{
                      border: '1px solid #e2e2e2',
                      padding: '4px 8px',
                      background: '#f3f3f3',
                      fontWeight: 600,
                      fontSize: 13,
                      textAlign: c.align === 'right' ? 'right' : 'left',
                      cursor: 'pointer',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      color: sortCol === c.key ? '#1a73e8' : '#202124',
                    }}
                    onClick={() => handleColClick(c.key)}
                  >
                    {c.label}
                    {sortCol === c.key ? (sortAsc ? ' ↑' : ' ↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, rowIdx) => {
                const isHighlighted = highlightAthleteName
                  ? row.athlete.toLowerCase().includes(highlightAthleteName.toLowerCase()) ||
                    highlightAthleteName.toLowerCase().includes(row.athlete.split(' ')[0]?.toLowerCase() ?? '')
                  : false
                return (
                  <tr
                    key={row.rank}
                    style={{ background: isHighlighted ? '#e6f4ea' : rowIdx % 2 === 0 ? '#fff' : '#fafafa' }}
                  >
                    {/* row number */}
                    <td style={{ border: '1px solid #e2e2e2', padding: '3px 4px', textAlign: 'right', background: '#f3f3f3', color: '#6c6c6c', fontSize: 11, minWidth: 40 }}>
                      {rowIdx + 2}
                    </td>
                    {COLUMNS.map((c) => (
                      <td
                        key={c.key}
                        style={{
                          border: '1px solid #e2e2e2',
                          padding: '3px 8px',
                          textAlign: c.align === 'right' ? 'right' : 'left',
                          whiteSpace: c.key === 'notes' ? 'normal' : 'nowrap',
                          fontWeight: c.key === 'time' || c.key === 'athlete' ? 500 : 400,
                          color: c.key === 'time' ? '#137333' : '#202124',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {String(row[c.key])}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {sheetTab === 'yoy-compare' && <YoySheet />}
      {sheetTab === 'season-prs' && <SeasonPrsSheet />}

      {/* Sheet tabs at bottom */}
      <div style={{ display: 'flex', borderTop: '1px solid #e2e2e2', background: '#f8f9fa', padding: '0 8px' }}>
        {([
          { id: 'erg-log', label: 'Erg Log' },
          { id: 'yoy-compare', label: 'YoY Compare' },
          { id: 'season-prs', label: 'Season PRs' },
        ] as const).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSheetTab(t.id)}
            style={{
              fontSize: 12,
              padding: '6px 14px',
              border: 'none',
              borderTop: sheetTab === t.id ? `2px solid #1a73e8` : '2px solid transparent',
              background: sheetTab === t.id ? '#fff' : 'transparent',
              color: sheetTab === t.id ? '#1a73e8' : '#5f6368',
              cursor: 'pointer',
              fontWeight: sheetTab === t.id ? 600 : 400,
              fontFamily: 'Arial, system-ui, sans-serif',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
