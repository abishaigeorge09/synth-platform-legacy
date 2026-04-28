import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { APP_THEME } from '../lib/theme'

type Props = {
  headline: string
  subhead?: string
  illustration: ReactNode
  privacyTitle: string
  privacyBody: string
}

export function TrustCard({ headline, subhead, illustration, privacyTitle, privacyBody }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center px-6 pt-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-[200px] w-[200px] items-center justify-center"
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${APP_THEME.brandWash} 0%, ${APP_THEME.brandWashSoft} 45%, transparent 75%)`,
            filter: 'blur(2px)',
          }}
        />
        <div className="relative flex h-[148px] w-[148px] items-center justify-center rounded-full"
             style={{ background: APP_THEME.surface, boxShadow: '0 12px 30px -16px rgba(5,150,105,0.35)' }}>
          {illustration}
        </div>
      </motion.div>

      <h1
        className="mt-8 text-center text-[28px] font-semibold leading-[1.15]"
        style={{ fontFamily: APP_THEME.fontSerif, color: APP_THEME.text }}
      >
        {headline}
      </h1>
      {subhead ? (
        <p
          className="mt-2 max-w-[300px] text-center text-[14px] leading-[1.5]"
          style={{ fontFamily: APP_THEME.fontSans, color: APP_THEME.textMuted }}
        >
          {subhead}
        </p>
      ) : null}

      <div
        className="mt-8 w-full rounded-2xl border px-4 py-4"
        style={{ background: APP_THEME.surface, borderColor: APP_THEME.divider }}
      >
        <div className="flex items-start gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: APP_THEME.brandWashSoft }}
          >
            <Lock size={16} color={APP_THEME.brand} strokeWidth={2.4} />
          </span>
          <div className="min-w-0 flex-1">
            <p
              className="text-[13px] font-semibold leading-tight"
              style={{ fontFamily: APP_THEME.fontSans, color: APP_THEME.text }}
            >
              {privacyTitle}
            </p>
            <p
              className="mt-1 text-[12px] leading-[1.5]"
              style={{ fontFamily: APP_THEME.fontSans, color: APP_THEME.textMuted }}
            >
              {privacyBody}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
