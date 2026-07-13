import { motion } from 'framer-motion'
import { APP_THEME } from '../lib/theme'

type Props = {
  percent: number
  headline: string
  status?: string
  artifacts: string[]
  artifactsLabel: string
}

export function ScanningLoader({ percent, headline, status, artifacts, artifactsLabel }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)))

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
      <div className="flex w-full flex-col items-center">
        <motion.div
          key={clamped}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-[64px] font-bold leading-none"
          style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.text }}
        >
          {clamped}%
        </motion.div>
        <h2
          className="mt-4 max-w-[280px] text-center text-[22px] font-semibold leading-[1.2]"
          style={{ fontFamily: APP_THEME.fontSerif, color: APP_THEME.text }}
        >
          {headline}
        </h2>

        <div
          className="mt-8 h-2 w-full overflow-hidden rounded-full"
          style={{ background: APP_THEME.divider }}
        >
          <motion.div
            initial={false}
            animate={{ width: `${clamped}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${APP_THEME.brand}, ${APP_THEME.brandDeep})`,
            }}
          />
        </div>

        {status ? (
          <p
            className="mt-4 text-[12px] uppercase tracking-[0.14em]"
            style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textFaint }}
          >
            {status}
          </p>
        ) : null}

        <div
          className="mt-10 w-full rounded-2xl border px-4 py-4"
          style={{ background: APP_THEME.surface, borderColor: APP_THEME.divider }}
        >
          <p
            className="text-[12px] font-semibold uppercase tracking-[0.12em]"
            style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textMuted }}
          >
            {artifactsLabel}
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {artifacts.map((a) => (
              <li
                key={a}
                className="flex items-center gap-2 text-[13px]"
                style={{ fontFamily: APP_THEME.fontSans, color: APP_THEME.text }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: APP_THEME.brand }}
                />
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
