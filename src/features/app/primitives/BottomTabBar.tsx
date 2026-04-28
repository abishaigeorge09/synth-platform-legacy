import { useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { APP_THEME } from '../lib/theme'

export type BottomTabItem = {
  key: string
  label: string
  to: string
  match: (pathname: string) => boolean
  icon: ReactNode
  primary?: boolean
}

type Props = {
  items: BottomTabItem[]
}

export function BottomTabBar({ items }: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav
      aria-label="Primary"
      className="border-t pb-[max(env(safe-area-inset-bottom),8px)] pt-2"
      style={{ background: APP_THEME.surface, borderColor: APP_THEME.divider }}
    >
      <ul className="flex items-stretch justify-around px-2">
        {items.map((item) => {
          const active = item.match(pathname)
          const color = active ? APP_THEME.brand : APP_THEME.textFaint
          return (
            <li key={item.key} className="flex-1">
              <button
                type="button"
                onClick={() => navigate(item.to)}
                className="flex min-h-[52px] w-full flex-col items-center justify-center gap-1 transition-colors active:scale-[0.98]"
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={
                    item.primary
                      ? 'flex h-10 w-10 items-center justify-center rounded-full'
                      : 'flex h-6 w-6 items-center justify-center'
                  }
                  style={
                    item.primary
                      ? {
                          background: APP_THEME.brand,
                          boxShadow: '0 8px 16px -8px rgba(5,150,105,0.55)',
                        }
                      : undefined
                  }
                >
                  <span style={{ color: item.primary ? '#FFFFFF' : color }}>
                    {item.icon}
                  </span>
                </span>
                {item.primary ? null : (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.1em]"
                    style={{ fontFamily: APP_THEME.fontMono, color }}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

