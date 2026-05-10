import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { THEME } from '../../lib/theme'
import { useUiStore } from '../store/useUiStore'
import { useAuthStore } from '../store/useAuthStore'
import { useTeamStore } from '../store/useTeamStore'

export function CoachProfileModal() {
  const open = useUiStore((s) => s.coachProfileOpen)
  const close = useUiStore((s) => s.closeCoachProfile)

  return (
    <AnimatePresence>{open && <CoachProfileInner close={close} />}</AnimatePresence>
  )
}

function CoachProfileInner({ close }: { close: () => void }) {
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const user = useAuthStore((s) => s.user)
  const mode = useAuthStore((s) => s.mode)
  const isAnonymous = useAuthStore((s) => s.isAnonymous)
  const signOut = useAuthStore((s) => s.signOut)
  const team = useTeamStore((s) => s.activeTeam)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  useEffect(() => {
    const prev =
      typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null
    const t = window.setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>('button')?.focus()
    }, 30)
    return () => {
      window.clearTimeout(t)
      try {
        prev?.focus?.()
      } catch {
        /* no-op */
      }
    }
  }, [])

  const handleSignOut = async () => {
    close()
    await signOut()
    navigate('/')
  }

  const sessionLabel =
    mode === 'supabase' && user
      ? `Signed in · ${user.email}`
      : isAnonymous
      ? 'Demo session · anonymous'
      : 'Demo session · seed data'

  const initials = user?.name
    ? user.name
        .split(/\s+/)
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'C'

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(12,10,9,0.55)', backdropFilter: 'blur(6px)' }}
        onClick={close}
      />
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Coach profile"
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative flex w-full max-w-[420px] flex-col overflow-hidden rounded-2xl shadow-2xl"
        style={{ background: 'var(--bg-primary)', border: `1px solid ${THEME.border}` }}
      >
        <header
          className="flex items-start justify-between border-b px-5 py-4"
          style={{ borderColor: THEME.border }}
        >
          <div>
            <div
              className="text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              Profile
            </div>
            <h2 className="mt-0.5 text-[18px] font-semibold" style={{ color: THEME.textPrimary }}>
              Coach account
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-[var(--bg-surface)]"
            style={{ borderColor: THEME.border, color: THEME.textPrimary }}
          >
            ✕
          </button>
        </header>

        <div className="flex flex-col gap-4 px-5 py-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-[15px] font-semibold"
              style={{
                background: THEME.primaryDarker,
                color: THEME.white,
                fontFamily: THEME.fontMono,
              }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold" style={{ color: THEME.textPrimary }}>
                {user?.name ?? 'Demo Coach'}
              </div>
              <div
                className="truncate text-[11px]"
                style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
              >
                {user?.email ?? 'coach@example.com'}
              </div>
            </div>
            <span
              className="ml-auto rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em]"
              style={{
                borderColor: THEME.border,
                color: THEME.primary,
                background: 'rgba(5,150,105,0.08)',
                fontFamily: THEME.fontMono,
              }}
            >
              {user?.role ?? 'coach'}
            </span>
          </div>

          <Field label="Active team" value={team.name} />
          <Field label="Sport" value={team.sport} />
          <Field label="Invite code" value={team.inviteCode} mono />
        </div>

        <footer
          className="flex items-center justify-between gap-3 border-t px-5 py-3"
          style={{ borderColor: THEME.border }}
        >
          <div
            className="text-[10px]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            {sessionLabel}
          </div>
          {mode === 'supabase' && !user && !isAnonymous ? (
            <button
              type="button"
              onClick={() => {
                close()
                navigate('/login')
              }}
              className="rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors hover:bg-[var(--bg-surface)]"
              style={{
                borderColor: THEME.primary,
                color: THEME.primary,
                fontFamily: THEME.fontMono,
              }}
            >
              Sign in
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors hover:bg-[var(--bg-surface)]"
              style={{
                borderColor: THEME.border,
                color: THEME.red,
                fontFamily: THEME.fontMono,
              }}
            >
              Sign out
            </button>
          )}
        </footer>
      </motion.div>
    </motion.div>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div
      className="flex items-center justify-between rounded-lg border px-3 py-2"
      style={{ borderColor: THEME.border, background: THEME.light }}
    >
      <div
        className="text-[10px] font-semibold uppercase tracking-[0.16em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        {label}
      </div>
      <div
        className="text-[12px] font-semibold"
        style={{
          color: THEME.textPrimary,
          fontFamily: mono ? THEME.fontMono : THEME.fontSans,
        }}
      >
        {value}
      </div>
    </div>
  )
}
