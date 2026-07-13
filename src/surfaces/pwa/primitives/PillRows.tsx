import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { SYNTH } from '../lib/theme'

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

/**
 * Single-select option list rendered as glass-cards on the cobalt canvas.
 * Selected: emerald check + emerald-tinted border. Unselected: glass.
 */
export function PillRows({ options, selectedValue, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((opt) => {
        const isSelected = selectedValue === opt.value
        return (
          <motion.button
            key={opt.value}
            type="button"
            onClick={() => !opt.disabled && onSelect(opt.value)}
            disabled={opt.disabled}
            whileTap={opt.disabled ? undefined : { scale: 0.985 }}
            className="flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-colors disabled:opacity-40"
            style={{
              background: isSelected ? SYNTH.glassActive : SYNTH.glass,
              backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              borderColor: isSelected ? SYNTH.accentEmerald : SYNTH.glassBorder,
              color: SYNTH.inkOnBrand,
              minHeight: 64,
            }}
          >
            {opt.icon ? (
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.16)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                {opt.icon}
              </span>
            ) : null}
            <span className="flex min-w-0 flex-1 flex-col">
              <span
                className="text-[15px] font-semibold leading-tight"
                style={{ fontFamily: SYNTH.font, color: SYNTH.inkOnBrand }}
              >
                {opt.label}
              </span>
              {opt.description ? (
                <span
                  className="mt-1 text-[12px] leading-[1.4]"
                  style={{ fontFamily: SYNTH.font, color: SYNTH.inkOnBrandMuted }}
                >
                  {opt.description}
                </span>
              ) : null}
            </span>
            {opt.badge ? (
              <span
                className="ml-2 shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                style={{
                  borderColor: 'rgba(255,255,255,0.28)',
                  color: SYNTH.inkOnBrandMuted,
                  fontFamily: SYNTH.font,
                }}
              >
                {opt.badge}
              </span>
            ) : null}
            <span
              className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
              style={{
                background: isSelected ? SYNTH.accentEmerald : 'transparent',
                border: `1.5px solid ${isSelected ? SYNTH.accentEmerald : 'rgba(255,255,255,0.32)'}`,
              }}
            >
              {isSelected ? <Check size={13} strokeWidth={3} color={SYNTH.inkOnBrand} /> : null}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
