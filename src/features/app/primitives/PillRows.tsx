import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { APP_THEME } from '../lib/theme'

export type PillRowOption = {
  value: string
  label: string
  description?: string
  icon?: ReactNode
  iconBackground?: string
  disabled?: boolean
  badge?: string
}

type Props = {
  options: PillRowOption[]
  selectedValue: string | null
  onSelect: (value: string) => void
}

export function PillRows({ options, selectedValue, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const isSelected = selectedValue === opt.value
        return (
          <motion.button
            key={opt.value}
            type="button"
            onClick={() => !opt.disabled && onSelect(opt.value)}
            disabled={opt.disabled}
            whileTap={opt.disabled ? undefined : { scale: 0.985 }}
            className="flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-colors disabled:opacity-50"
            style={{
              background: isSelected ? APP_THEME.brand : APP_THEME.surface,
              borderColor: isSelected ? APP_THEME.brand : APP_THEME.divider,
              color: isSelected ? '#FFFFFF' : APP_THEME.text,
              minHeight: 64,
            }}
          >
            {opt.icon ? (
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: isSelected
                    ? 'rgba(255,255,255,0.18)'
                    : (opt.iconBackground ?? APP_THEME.brandWashSoft),
                }}
              >
                {opt.icon}
              </span>
            ) : null}
            <span className="flex min-w-0 flex-1 flex-col">
              <span
                className="text-[15px] font-semibold leading-tight"
                style={{ fontFamily: APP_THEME.fontSans }}
              >
                {opt.label}
              </span>
              {opt.description ? (
                <span
                  className="mt-1 text-[12px] leading-[1.4]"
                  style={{
                    fontFamily: APP_THEME.fontSans,
                    color: isSelected ? 'rgba(255,255,255,0.75)' : APP_THEME.textMuted,
                  }}
                >
                  {opt.description}
                </span>
              ) : null}
            </span>
            {opt.badge ? (
              <span
                className="ml-2 shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                style={{
                  borderColor: isSelected ? 'rgba(255,255,255,0.4)' : APP_THEME.divider,
                  color: isSelected ? 'rgba(255,255,255,0.9)' : APP_THEME.textFaint,
                  fontFamily: APP_THEME.fontMono,
                }}
              >
                {opt.badge}
              </span>
            ) : null}
          </motion.button>
        )
      })}
    </div>
  )
}
