import { useNavigate } from 'react-router-dom'
import { Users, AlertTriangle, Database, Settings as SettingsIcon, ChevronRight } from 'lucide-react'
import { SheetShell } from './SheetShell'
import { SYNTH } from '../lib/theme'

type MoreItem = {
  key: string
  label: string
  sub: string
  to: string
  icon: React.ReactNode
}

/**
 * Tap-to-open menu surfaced from the More slot of the coach tab bar.
 * Holds the secondary surfaces that aren't on the primary nav.
 */
export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()

  const items: MoreItem[] = [
    {
      key: 'roster',
      label: 'Roster',
      sub: 'All athletes, search, drill-in',
      to: '/app/coach/roster',
      icon: <Users size={18} strokeWidth={2.2} />,
    },
    {
      key: 'attention',
      label: 'Attention',
      sub: 'Flagged signals across the team',
      to: '/app/coach/attention',
      icon: <AlertTriangle size={18} strokeWidth={2.2} />,
    },
    {
      key: 'sources',
      label: 'Sources',
      sub: 'Connectors + read-only data view',
      to: '/app/coach/sources',
      icon: <Database size={18} strokeWidth={2.2} />,
    },
    {
      key: 'settings',
      label: 'Settings',
      sub: 'Profile, invite code, preferences',
      to: '/app/coach/settings',
      icon: <SettingsIcon size={18} strokeWidth={2.2} />,
    },
  ]

  const go = (to: string) => {
    onClose()
    navigate(to)
  }

  return (
    <SheetShell open={open} onClose={onClose} title="More">
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: SYNTH.sheetMuted }}
      >
        {items.map((item, i) => (
          <button
            key={item.key}
            type="button"
            onClick={() => go(item.to)}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:opacity-70"
            style={{
              borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.sheet}`,
              background: 'transparent',
            }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: '#FFFFFF', color: SYNTH.ink }}
            >
              {item.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="text-[14px] font-semibold leading-tight"
                style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
              >
                {item.label}
              </p>
              <p
                className="mt-0.5 text-[12px]"
                style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
              >
                {item.sub}
              </p>
            </div>
            <ChevronRight size={16} color={SYNTH.inkMuted} />
          </button>
        ))}
      </div>
    </SheetShell>
  )
}
