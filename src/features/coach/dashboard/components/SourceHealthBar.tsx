import { Link } from 'react-router-dom'
import { THEME } from '../../../../lib/theme'
import { useSources } from '../../../../shared/data/queries'

export function SourceHealthBar() {
  const { data: sources } = useSources()
  const healthy = sources.filter((s) => s.status === 'healthy').length
  const pct = sources.length ? healthy / sources.length : 0

  return (
    <div className="px-5 sm:px-10">
      <div className="flex items-center justify-between">
        <Link
          to="/coach/sources/connectors"
          className="text-[10px] font-semibold uppercase tracking-[0.18em] hover:underline"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          Manage
        </Link>
        <div className="text-[11px]" style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary }}>
          {healthy} healthy
        </div>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full" style={{ background: THEME.border }}>
        <div className="h-2 rounded-full" style={{ width: `${Math.round(pct * 100)}%`, background: THEME.primary }} />
      </div>
    </div>
  )
}

