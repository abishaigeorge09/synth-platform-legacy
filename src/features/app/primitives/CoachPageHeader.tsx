import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { SYNTH } from '../lib/theme'

type Props = {
  title: string
  subtitle?: string
  back?: string
  rightSlot?: ReactNode
}

export function CoachPageHeader({ title, subtitle, back, rightSlot }: Props) {
  const navigate = useNavigate()

  return (
    <header className="flex items-start gap-3 px-5 pt-[max(env(safe-area-inset-top),32px)] pb-4">
      {back !== undefined ? (
        <button
          type="button"
          onClick={() => (back ? navigate(back) : navigate(-1))}
          aria-label="Back"
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`,
            color: SYNTH.inkOnBrand,
          }}
        >
          <ChevronLeft size={18} strokeWidth={2.2} />
        </button>
      ) : null}
      <div className="min-w-0 flex-1 pt-1">
        {subtitle ? (
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            {subtitle}
          </p>
        ) : null}
        <h1
          className="text-[24px] font-bold leading-tight tracking-[-0.01em]"
          style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
        >
          {title}
        </h1>
      </div>
      {rightSlot}
    </header>
  )
}
