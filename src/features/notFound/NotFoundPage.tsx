import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { THEME } from '../../lib/theme'

/**
 * Phase 14 — real 404. Previously the `*` route silently redirected to `/`,
 * which masked broken bookmarks and hid routing bugs during development.
 * This surface tells the user what they asked for, where they are, and
 * points them at the primary re-entry surfaces (landing, coach dashboard,
 * athlete home).
 */
export function NotFoundPage() {
  const location = useLocation()

  const links: Array<{ to: string; label: string; hint: string }> = [
    { to: '/', label: 'Landing', hint: 'public home' },
    { to: '/coach/dashboard', label: 'Coach dashboard', hint: 'team overview' },
    { to: '/athlete/home', label: 'Athlete home', hint: 'my team' },
  ]

  return (
    <div
      className="flex min-h-dvh items-center justify-center px-6 py-16"
      style={{ backgroundColor: THEME.light }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[520px] rounded-2xl border p-8 shadow-sm"
        style={{ background: THEME.white, borderColor: THEME.border }}
      >
        <div
          className="mb-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: THEME.amber }}
          />
          404 · Not found
        </div>

        <h1
          className="mb-3 text-[32px] font-semibold leading-tight"
          style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
        >
          This surface doesn't exist yet.
        </h1>

        <p
          className="mb-5 text-[13px] leading-relaxed"
          style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary }}
        >
          synth. couldn't match the path you asked for to any coach, athlete,
          or public surface. It might be a broken bookmark, a stale link, or a
          route that's still on the roadmap.
        </p>

        <div
          className="mb-6 rounded-lg border px-3 py-2 text-[11px]"
          style={{
            borderColor: THEME.border,
            background: THEME.light,
            fontFamily: THEME.fontMono,
            color: THEME.textSecondary,
          }}
        >
          <span style={{ color: THEME.textMuted }}>requested</span>{' '}
          <span style={{ color: THEME.textPrimary }}>
            {location.pathname}
            {location.search}
          </span>
        </div>

        <div
          className="mb-2 text-[10px] uppercase tracking-[0.18em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          Jump back in
        </div>
        <ul className="flex flex-col gap-2">
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="flex items-center justify-between rounded-lg border px-4 py-3 text-[13px] transition-colors hover:border-emerald-500"
                style={{
                  borderColor: THEME.border,
                  color: THEME.textPrimary,
                  fontFamily: THEME.fontSans,
                  background: THEME.white,
                }}
              >
                <span className="font-medium">{link.label}</span>
                <span
                  className="text-[10px] uppercase tracking-[0.18em]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                >
                  {link.hint} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}
