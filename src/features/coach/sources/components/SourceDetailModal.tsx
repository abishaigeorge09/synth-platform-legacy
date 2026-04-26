import { Link } from 'react-router-dom'
import { THEME } from '../../../../lib/theme'
import type { ScanLog, Source } from '../../../../shared/data/types'

const STATUS_STYLE: Record<string, { fg: string; bg: string; label: string }> = {
  healthy: { fg: THEME.primary, bg: 'rgba(16,185,129,0.14)', label: 'healthy' },
  stale: { fg: THEME.amber, bg: 'rgba(245,158,11,0.14)', label: 'stale' },
  failed: { fg: THEME.red, bg: 'rgba(239,68,68,0.14)', label: 'failed' },
  pending: { fg: THEME.textSecondary, bg: 'rgba(161,161,170,0.14)', label: 'pending' },
  disconnected: { fg: THEME.textMuted, bg: 'rgba(161,161,170,0.14)', label: 'offline' },
}

export function SourceDetailModal({
  open,
  onClose,
  source,
  scanLogs,
}: {
  open: boolean
  onClose: () => void
  source: Source | null
  scanLogs?: ScanLog[]
}) {
  if (!open) return null
  const status = source ? STATUS_STYLE[source.status] ?? STATUS_STYLE.pending : null
  const latest = scanLogs?.[0] ?? null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5 py-10">
      <button className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.35)' }} onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-[680px] rounded-3xl border p-6" style={{ borderColor: THEME.border, background: THEME.white }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
              Source
            </div>
            <div className="mt-1 text-[18px] font-semibold" style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}>
              {source?.name ?? '—'}
            </div>
            <div className="mt-1 text-[12px]" style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary }}>
              {source?.type ?? ''} {source?.url ? `· ${source.url}` : ''}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-3 py-2 text-[11px] font-semibold uppercase tracking-wider"
            style={{ borderColor: THEME.border, color: THEME.textSecondary, fontFamily: THEME.fontMono }}
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border p-4" style={{ borderColor: THEME.border, background: THEME.light }}>
            <div className="flex items-center justify-between gap-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                Health
              </div>
              {status ? (
                <span
                  className="rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider"
                  style={{ background: status.bg, color: status.fg, fontFamily: THEME.fontMono }}
                >
                  {status.label}
                </span>
              ) : null}
            </div>
            <div className="mt-3 text-[12px]" style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary }}>
              {latest ? `Latest scan: ${new Date(latest.scannedAt).toLocaleString()}` : 'No scans logged yet.'}
            </div>
            <div className="mt-2 text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
              {scanLogs?.length ?? 0} scans total
            </div>
          </div>

          <div className="rounded-2xl border p-4" style={{ borderColor: THEME.border, background: THEME.light }}>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
              Actions
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to={source ? `/coach/sources/connectors?source=${encodeURIComponent(source.id)}` : '/coach/sources/connectors'}
                className="rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-wider"
                style={{ borderColor: THEME.border, color: THEME.textPrimary, fontFamily: THEME.fontMono, background: THEME.white }}
              >
                Open in connectors
              </Link>
              <Link
                to="/coach/sources/data-view"
                className="rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-wider"
                style={{ borderColor: THEME.border, color: THEME.textPrimary, fontFamily: THEME.fontMono, background: THEME.white }}
              >
                Data view
              </Link>
            </div>
          </div>
        </div>

        {scanLogs && scanLogs.length > 0 ? (
          <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: THEME.border, background: THEME.white }}>
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                Recent scans
              </div>
              <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                newest first
              </div>
            </div>
            <div className="mt-3 grid gap-2">
              {scanLogs.slice(0, 6).map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-xl border px-3 py-2"
                  style={{ borderColor: THEME.border, background: THEME.light }}
                >
                  <div className="text-[12px]" style={{ color: THEME.textPrimary, fontFamily: THEME.fontSans }}>
                    {new Date(l.scannedAt).toLocaleString()}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                    {l.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

