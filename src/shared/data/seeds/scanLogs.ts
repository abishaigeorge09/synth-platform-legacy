/**
 * Synthetic ScanLog seed — a chronological stream of scans per connector that
 * the synth. Agent would have produced over the last ~72 hours. Each entry
 * carries a markdown report so the Sources page can render a report viewer
 * without needing a backend yet.
 *
 * When the real agent lands (Phase P1+), swap this module for a query hook on
 * the `scan_logs` table — the shape here already matches `docs/SCHEMA.md`.
 */
import type { ScanLog } from '@shared/data/types'

export const SEED_SCAN_LOGS: ScanLog[] = [
  // ── Erg workbooks (google_sheets) ──────────────────────────────────────────
  {
    id: 'scan-erg-2026-04-14',
    sourceId: 'source-erg-workbooks',
    scannedAt: '2026-04-14T18:00:12Z',
    status: 'success',
    durationMs: 4280,
    itemsAdded: 12,
    itemsUpdated: 0,
    itemsRemoved: 0,
    reportMd: [
      '# Erg workbooks · 2026-04-14 scan',
      '',
      '**Source** · `docs.google.com/spreadsheets/d/rowing_women_ergs`  ',
      '**Cadence** · daily · 18:00 PT  ',
      '**Duration** · 4.28s',
      '',
      '## Summary',
      '',
      '- Parsed sheet `316 2K` (52 rows).',
      '- **12 new erg scores** written to `erg_scores`.',
      '- No existing rows required update — sheet is append-only since last scan.',
      '- Mean 2K: **7:21.4**, stdev **10.8s**.',
      '',
      '## Notable',
      '',
      '- `Rothmore, Marnie` logged a new **season best** (−2.4s vs. 2026-02-18).',
      '- `Kaur, Priya` missing from sheet — flagged for coach follow-up.',
      '',
      '_No schema drift detected. Next scan: 2026-04-15 · 18:00 PT._',
    ].join('\n'),
  },
  {
    id: 'scan-erg-2026-04-13',
    sourceId: 'source-erg-workbooks',
    scannedAt: '2026-04-13T18:00:09Z',
    status: 'success',
    durationMs: 3990,
    itemsAdded: 0,
    itemsUpdated: 0,
    itemsRemoved: 0,
    reportMd: [
      '# Erg workbooks · 2026-04-13 scan',
      '',
      '**Source** · Google Sheets  ',
      '**Cadence** · daily · 18:00 PT',
      '',
      '## Summary',
      '',
      '- No changes detected — sheet hash unchanged since 2026-04-12.',
      '- Scanned all 4 active tabs (`316 2K`, `203 6K`, `Pieces`, `Season rolls`).',
      '',
      '_No-op scan. No rows written._',
    ].join('\n'),
  },
  // ── TeamWorks ──────────────────────────────────────────────────────────────
  {
    id: 'scan-tw-2026-04-14-22',
    sourceId: 'source-teamworks',
    scannedAt: '2026-04-14T21:58:02Z',
    status: 'success',
    durationMs: 1160,
    itemsAdded: 3,
    itemsUpdated: 18,
    itemsRemoved: 0,
    reportMd: [
      '# TeamWorks · 21:58 scan',
      '',
      '**Source** · `app.teamworks.com/cal-womens-rowing`  ',
      '**Cadence** · every 15 min',
      '',
      '## Summary',
      '',
      '- 3 new **availability** entries (injury room).',
      '- 18 attendance rows refreshed for today\'s PM session.',
      '- 1 compliance flag **surfaced**: `Silva, Marisol` — 5-day gym gap.',
      '',
      '## Next',
      '',
      '- Alert `alert-2` raised automatically (severity: danger).',
      '- Coach notification queued via daily digest.',
    ].join('\n'),
  },
  {
    id: 'scan-tw-2026-04-14-21',
    sourceId: 'source-teamworks',
    scannedAt: '2026-04-14T21:43:01Z',
    status: 'success',
    durationMs: 1204,
    itemsAdded: 0,
    itemsUpdated: 12,
    itemsRemoved: 0,
    reportMd: [
      '# TeamWorks · 21:43 scan',
      '',
      '12 attendance rows updated (AM session). No new items.',
      '',
      '_Routine scan. Next: 21:58 PT._',
    ].join('\n'),
  },
  // ── Wearable hub ──────────────────────────────────────────────────────────
  {
    id: 'scan-whoop-2026-04-14',
    sourceId: 'source-wearable-hub',
    scannedAt: '2026-04-14T22:00:00Z',
    status: 'success',
    durationMs: 820,
    itemsAdded: 52,
    itemsUpdated: 0,
    itemsRemoved: 0,
    reportMd: [
      '# Wearable hub · live rollup',
      '',
      '**Source** · Whoop team API  ',
      '**Cadence** · real-time (long-poll)',
      '',
      '## Summary',
      '',
      '- **52 / 52** athletes reporting overnight sleep + HRV.',
      '- Mean recovery: **68%**, 3 athletes below 50%.',
      '- One low-recovery case elevated to `alert-1` (severity: warning).',
      '',
      '## Notable',
      '',
      '- `Patel, Anjali` — recovery **34%** (2-day trend down). Coach notified.',
      '- Team HRV baseline holding steady week-over-week (+2ms).',
    ].join('\n'),
  },
  {
    id: 'scan-whoop-2026-04-13',
    sourceId: 'source-wearable-hub',
    scannedAt: '2026-04-13T22:00:00Z',
    status: 'partial',
    durationMs: 1540,
    itemsAdded: 49,
    itemsUpdated: 0,
    itemsRemoved: 0,
    reportMd: [
      '# Wearable hub · 2026-04-13 rollup',
      '',
      '**Status** · partial — 3 athletes missing overnight data.',
      '',
      '## Missing',
      '',
      '- `Chen, Mei` — device offline since 20:14.',
      '- `Nguyen, Linh` — sync paused in Whoop settings.',
      '- `Russo, Gemma` — no strap detected.',
      '',
      '_Coach pinged via morning digest. Retry window: 06:00 PT._',
    ].join('\n'),
  },
  // ── Email digests ─────────────────────────────────────────────────────────
  {
    id: 'scan-email-2026-04-14',
    sourceId: 'source-email-digests',
    scannedAt: '2026-04-14T09:02:17Z',
    status: 'success',
    durationMs: 2230,
    itemsAdded: 47,
    itemsUpdated: 0,
    itemsRemoved: 0,
    reportMd: [
      '# Email digests · morning wellness',
      '',
      '**Source** · `digests@synth.sports`  ',
      '**Cadence** · daily · 09:00 PT',
      '',
      '## Summary',
      '',
      '- **47 / 52** athletes completed the morning checkin form.',
      '- Mean subjective energy: **7.1 / 10**.',
      '- Mean soreness: **3.4 / 10** (legs most common callout).',
      '',
      '## Non-responders',
      '',
      '- 5 athletes — automatic nudge queued for 11:00 PT.',
    ].join('\n'),
  },
]

export function scanLogsForSource(sourceId: string) {
  return SEED_SCAN_LOGS.filter((s) => s.sourceId === sourceId).sort((a, b) =>
    a.scannedAt < b.scannedAt ? 1 : -1,
  )
}

export function latestScanForSource(sourceId: string) {
  return scanLogsForSource(sourceId)[0] ?? null
}
