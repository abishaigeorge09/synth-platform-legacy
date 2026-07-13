import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { posthog } from '@shared/analytics/posthog'
import { AuthLayout } from './AuthLayout'
import {
  FieldLabel, TextInput, PrimaryAuthButton,
} from './authShared'
import { AUTH_TOKENS } from './authTokens'
import {
  WAITLIST_BASE, loadStoredEntry, clearStoredEntry,
  joinWaitlist, fetchWaitlistCount, subscribeToWaitlistCount,
  type WaitlistEntry,
} from './waitlist'

const { GREEN, MONO, MUTED, DIM, HAIR, SERIF, FG } = AUTH_TOKENS

const SPORTS = ['Running', 'Cycling', 'Swimming', 'Rowing', 'Lifting', 'Other'] as const

const WEEKLY_ADMITS = 50 // ETA math

export function SignUpPage() {
  const [entry, setEntry] = useState<WaitlistEntry | null>(() => loadStoredEntry())
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [sport, setSport] = useState<string>('Running')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [liveTotal, setLiveTotal] = useState<number>(WAITLIST_BASE)

  // Pull the current total on mount + subscribe to realtime updates.
  useEffect(() => {
    let mounted = true
    void fetchWaitlistCount().then(total => {
      if (mounted) setLiveTotal(total)
    })
    const unsub = subscribeToWaitlistCount(total => {
      if (mounted) setLiveTotal(total)
    })
    return () => { mounted = false; unsub() }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmedEmail = email.trim()
    if (!trimmedEmail) { setError('Email is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('That doesn\'t look like a valid email.')
      return
    }
    setSubmitting(true)
    const result = await joinWaitlist({ email: trimmedEmail, name, sport })
    if (result.ok === false) {
      setError(result.error)
      setSubmitting(false)
      return
    }
    try {
      posthog.identify(trimmedEmail, { email: trimmedEmail, name, sport, source: 'waitlist' })
      posthog.capture('waitlist_joined', {
        email: trimmedEmail,
        sport,
        position: result.entry.position,
        already_on_list: result.alreadyOnList,
      })
    } catch { /* analytics is best-effort */ }
    setEntry(result.entry)
    setSubmitting(false)
  }

  return (
    <AuthLayout tab="signup">
      {/* Fixed top-right live badge — visible across both states */}
      <LiveCountBadge total={liveTotal} />

      {entry ? (
        <QueueConfirmation entry={entry} liveTotal={liveTotal} />
      ) : (
        <WaitlistForm
          email={email}
          name={name}
          sport={sport}
          submitting={submitting}
          error={error}
          onEmailChange={setEmail}
          onNameChange={setName}
          onSportChange={setSport}
          onSubmit={handleSubmit}
        />
      )}
    </AuthLayout>
  )
}

/* ─── Fixed top-right live waitlist badge ────────────────────────────── */

function LiveCountBadge({ total }: { total: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed right-5 top-5 z-50 hidden flex-col gap-1 rounded-md px-3.5 py-2.5 backdrop-blur-md lg:flex"
      style={{
        background: 'rgba(0,0,0,0.55)',
        border: '1px solid rgba(16,185,129,0.35)',
        fontFamily: MONO,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(16,185,129,0.12)',
      }}
    >
      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.32em]" style={{ color: GREEN }}>
        <motion.span
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: GREEN, boxShadow: `0 0 6px ${GREEN}` }}
        />
        live waitlist
      </div>
      <div className="flex items-baseline gap-1.5">
        <motion.span
          key={total} // re-animates on every realtime tick
          initial={{ scale: 0.92, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 0.8, 0.22, 1] }}
          style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1, color: FG, fontWeight: 500 }}
        >
          {total.toLocaleString()}
        </motion.span>
        <span className="text-[10px] uppercase tracking-[0.22em]" style={{ color: MUTED }}>
          already in
        </span>
      </div>
      <div className="text-[11px]" style={{ fontFamily: SERIF, color: GREEN, fontStyle: 'italic' }}>
        Be #{(total + 1).toLocaleString()}.
      </div>
    </motion.div>
  )
}

/* ─── Form ────────────────────────────────────────────────────────── */

function WaitlistForm({
  email, name, sport, submitting, error,
  onEmailChange, onNameChange, onSportChange, onSubmit,
}: {
  email: string
  name: string
  sport: string
  submitting: boolean
  error: string | null
  onEmailChange: (v: string) => void
  onNameChange: (v: string) => void
  onSportChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <>
      <form className="flex flex-col gap-3.5" onSubmit={onSubmit}>
        <div>
          <FieldLabel>Email</FieldLabel>
          <TextInput
            type="email"
            value={email}
            onChange={e => onEmailChange(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <FieldLabel>Name</FieldLabel>
          <TextInput
            type="text"
            value={name}
            onChange={e => onNameChange(e.target.value)}
            placeholder="Optional"
            autoComplete="given-name"
          />
        </div>

        <div>
          <FieldLabel>Sport</FieldLabel>
          <div className="grid grid-cols-3 gap-1.5">
            {SPORTS.map(s => {
              const active = sport === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSportChange(s)}
                  className="rounded px-3 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors"
                  style={{
                    background: active ? 'rgba(16,185,129,0.10)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? GREEN : HAIR}`,
                    color: active ? GREEN : MUTED,
                    fontFamily: MONO,
                  }}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-md px-3 py-2.5 text-[12px]"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5',
              fontFamily: MONO,
            }}
          >
            {error}
          </div>
        )}

        <PrimaryAuthButton type="submit" disabled={submitting}>
          {submitting ? 'Joining…' : 'Join →'}
        </PrimaryAuthButton>
      </form>

      <div className="mt-6 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.32em]" style={{ color: DIM, fontFamily: MONO }}>
        <a href="/legal/terms" className="transition-colors hover:text-white">Terms</a>
        <span style={{ color: HAIR }}>·</span>
        <a href="/legal/privacy" className="transition-colors hover:text-white">Privacy</a>
      </div>
    </>
  )
}

/* ─── Queue confirmation — minimal text, real-time total ─────────────── */

function QueueConfirmation({ entry, liveTotal }: { entry: WaitlistEntry; liveTotal: number }) {
  const ahead = Math.max(0, entry.position - 1)
  const etaWeeks = Math.max(1, Math.ceil(entry.position / WEEKLY_ADMITS))
  const newSinceJoin = Math.max(0, liveTotal - entry.position)

  function reset() {
    clearStoredEntry()
    window.location.reload()
  }

  return (
    <div className="flex flex-col">
      {/* Big position number */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-lg p-6"
        style={{
          background: 'rgba(16,185,129,0.04)',
          border: `1px solid ${GREEN}`,
          boxShadow: 'inset 0 0 60px rgba(16,185,129,0.06)',
        }}
      >
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: GREEN, boxShadow: `0 0 6px ${GREEN}` }}
          />
          you're in
        </div>

        <div className="mt-3 flex items-baseline gap-3">
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(56px, 6vw, 80px)',
              lineHeight: 0.92,
              color: FG,
              fontWeight: 500,
            }}
          >
            #{entry.position}
          </span>
          <span className="text-[12px]" style={{ fontFamily: MONO, color: MUTED }}>
            of {liveTotal.toLocaleString()}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="relative h-1.5 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(8, 100 - (entry.position / Math.max(entry.position, liveTotal)) * 100)}%` }}
              transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: GREEN, boxShadow: `0 0 12px ${GREEN}` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.22em]" style={{ fontFamily: MONO, color: DIM }}>
            <span>{ahead.toLocaleString()} ahead</span>
            <span>ETA ~ {etaWeeks} {etaWeeks === 1 ? 'wk' : 'wks'}</span>
          </div>
        </div>
      </motion.div>

      {/* Live ticker — shows when others have joined since this user */}
      {newSinceJoin > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em]"
          style={{ fontFamily: MONO, color: MUTED }}
        >
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: GREEN }}
          />
          <span style={{ color: FG }}>+{newSinceJoin}</span>
          <span>since you joined</span>
        </motion.div>
      )}

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: DIM }}>
        <Link to="/" className="transition-colors hover:text-white">← back</Link>
        <button type="button" onClick={reset} className="transition-colors hover:text-white">
          different email
        </button>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.32em]" style={{ color: DIM, fontFamily: MONO }}>
        <a href="/legal/terms" className="transition-colors hover:text-white">Terms</a>
        <span style={{ color: HAIR }}>·</span>
        <a href="/legal/privacy" className="transition-colors hover:text-white">Privacy</a>
      </div>
    </div>
  )
}
