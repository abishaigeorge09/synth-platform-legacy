import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { APP_THEME } from '../lib/theme'

export type MultiSelectOption = {
  value: string
  label: string
  description?: string
  icon?: ReactNode
  iconBackground?: string
}

type Props = {
  options: MultiSelectOption[]
  selectedValues: string[]
  onToggle: (value: string) => void
}

export function MultiSelectChips({ options, selectedValues, onToggle }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const isSelected = selectedValues.includes(opt.value)
        return (
          <motion.button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            whileTap={{ scale: 0.985 }}
            className="flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-colors"
            style={{
              background: isSelected ? APP_THEME.brandWashSoft : APP_THEME.surface,
              borderColor: isSelected ? APP_THEME.brand : APP_THEME.divider,
              color: APP_THEME.text,
              minHeight: 64,
            }}
          >
            {opt.icon ? (
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: opt.iconBackground ?? APP_THEME.brandWashSoft }}
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
                    color: APP_THEME.textMuted,
                  }}
                >
                  {opt.description}
                </span>
              ) : null}
            </span>
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
              style={{
                borderColor: isSelected ? APP_THEME.brand : APP_THEME.divider,
                background: isSelected ? APP_THEME.brand : 'transparent',
              }}
            >
              {isSelected ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
