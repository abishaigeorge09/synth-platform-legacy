import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { posthog } from '../../shared/analytics/posthog'
import { AuthLayout } from './AuthLayout'
import {
  AuthHeader, FieldLabel, TextInput,
  PrimaryAuthButton,
} from './authShared'
import { AUTH_TOKENS } from './authTokens'

const { GREEN, MONO, MUTED, DIM, HAIR, FG } = AUTH_TOKENS

// Waitlist flow — replaces real signup until synth is open. We collect
// an email + optional name + sport, drop them in posthog as a captured
// waitlist event, persist a stable fake-queue position keyed on the
// email, then render a polished queue confirmation screen.

const SPORTS = ['Running', 'Cycling', 'Swimming', 'Rowing', 'Lifting', 'Other'] as const

const WAITLIST_STORAGE_KEY = 'synth:waitlist:entry'
const WAITLIST_BASE_COUNT = 1247 // shown as "athletes ahead of you" base
const WEEKLY_ADMITS = 50          // ETA math

type WaitlistEntry = {
  email: string
  name: string
  sport: string
  position: number
  joinedAt: number
}

/** Deterministic queue position from an email so the number stays stable
 *  if the user refreshes. Adds a bit of variance so two emails don't
 *  collide on the exact same number. */
function generatePosition(email: string): number {
  const key = email.trim().toLowerCase()
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0
  }
  return 200 + (Math.abs(hash) % 320) // 200–519 — feels real, not "you're #3"
}

function loadStoredEntry(): WaitlistEntry | null {
  try {
    const raw = localStorage.getItem(WAITLIST_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.email === 'string') return parsed as WaitlistEntry
  } catch { /* ignore */ }
  return null
}

export function SignUpPage() {
  // Lazy initializer reads any stored waitlist entry once on mount so a
  // returning visitor lands directly on their queue confirmation.
  const [entry, setEntry] = useState<WaitlistEntry | null>(() => loadStoredEntry())
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [sport, setSport] = useState<string>('Running')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Email is required.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('That doesn\'t look like a valid email.')
      return
    }
    setSubmitting(true)

    // Build the entry
    const next: WaitlistEntry = {
      email: trimmedEmail,
      name: name.trim(),
      sport,
      position: generatePosition(trimmedEmail),
      joinedAt: Date.now(),
    }

    // Persist + analytics
    try {
      localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(next))
      posthog.identify(trimmedEmail, { email: trimmedEmail, name: next.name, sport, source: 'waitlist' })
      posthog.capture('waitlist_joined', {
        email: trimmedEmail,
        sport,
        position: next.position,
      })
    } catch { /* analytics is best-effort */ }

    // Tiny artificial wait so the queue screen feels earned, not snappy
    await new Promise(r => setTimeout(r, 700))

    setEntry(next)
    setSubmitting(false)
  }

  return (
    <AuthLayout tab="signup">
      {entry ? <QueueConfirmation entry={entry} /> : (
        <>
          <AuthHeader
            title="Join the synth waitlist."
            subtitle="We're opening the alpha to athletes in waves. Tell us where to reach you."
          />

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <FieldLabel>Email</FieldLabel>
              <TextInput
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <FieldLabel hint={<span className="text-[10px] uppercase tracking-[0.28em]" style={{ color: DIM, fontFamily: MONO }}>optional</span>}>
                Name
              </FieldLabel>
              <TextInput
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="What should we call you?"
                autoComplete="given-name"
              />
            </div>

            <div>
              <FieldLabel hint={<span className="text-[10px] uppercase tracking-[0.28em]" style={{ color: DIM, fontFamily: MONO }}>optional</span>}>
                Sport
              </FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {SPORTS.map(s => {
                  const active = sport === s
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSport(s)}
                      className="rounded-md px-3 py-2.5 text-[11px] uppercase tracking-[0.18em] transition-colors"
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
              {submitting ? 'Joining…' : 'Join the waitlist →'}
            </PrimaryAuthButton>
          </form>

          <div className="mt-7 text-center text-[12px]" style={{ color: MUTED, fontFamily: MONO }}>
            Already on the list?{' '}
            <Link to="/login" className="transition-colors hover:opacity-80" style={{ color: GREEN }}>
              Log in →
            </Link>
          </div>

          <div className="mt-6 text-center text-[10px] uppercase tracking-[0.32em]" style={{ color: DIM, fontFamily: MONO }}>
            We'll only email you when your spot opens. No spam.
          </div>
        </>
      )}

      {/* unused-import guard */}
      <span aria-hidden style={{ display: 'none', color: FG }} />
    </AuthLayout>
  )
}

/* ─── Queue confirmation screen ──────────────────────────────────────── */

function QueueConfirmation({ entry }: { entry: WaitlistEntry }) {
  const ahead = entry.position - 1
  const totalQueue = WAITLIST_BASE_COUNT + entry.position
  const etaWeeks = Math.max(1, Math.ceil(entry.position / WEEKLY_ADMITS))
  // Fake progress bar — % position out of nominal max
  const progressPct = Math.max(4, Math.min(96, 100 - (entry.position / 520) * 100))

  function reset() {
    localStorage.removeItem(WAITLIST_STORAGE_KEY)
    window.location.reload()
  }

  return (
    <div className="flex flex-col">
      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: GREEN, boxShadow: `0 0 6px ${GREEN}` }}
          />
          <span>// you're on the list</span>
        </div>
        <h2
          className="leading-[1.02] tracking-[-0.01em]"
          style={{ fontFamily: AUTH_TOKENS.SERIF, fontWeight: 500, fontSize: 'clamp(32px, 3.6vw, 44px)', color: FG }}
        >
          You're in line<span style={{ color: GREEN }}>.</span>
        </h2>
        <p className="mt-2 text-[14px]" style={{ color: MUTED }}>
          We'll email <span style={{ color: FG }}>{entry.email}</span> the moment your spot opens.
        </p>
      </motion.div>

      {/* Big position card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mt-8 rounded-lg p-6"
        style={{
          background: 'rgba(16,185,129,0.04)',
          border: `1px solid ${GREEN}`,
          boxShadow: `inset 0 0 60px rgba(16,185,129,0.06)`,
        }}
      >
        <div className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
          your position
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              fontFamily: AUTH_TOKENS.SERIF,
              fontWeight: 500,
              fontSize: 'clamp(56px, 6vw, 80px)',
              lineHeight: 0.92,
              color: FG,
            }}
          >
            #{entry.position}
          </motion.span>
          <span className="text-[12px]" style={{ fontFamily: MONO, color: MUTED }}>
            of {totalQueue.toLocaleString()}
          </span>
        </div>

        {/* Progress bar — visualizes "people ahead of you" */}
        <div className="mt-5">
          <div className="relative h-1.5 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.4, delay: 0.5, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: GREEN, boxShadow: `0 0 12px ${GREEN}` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.22em]" style={{ fontFamily: MONO, color: DIM }}>
            <span>{ahead.toLocaleString()} ahead of you</span>
            <span>ETA ~ {etaWeeks} {etaWeeks === 1 ? 'week' : 'weeks'}</span>
          </div>
        </div>
      </motion.div>

      {/* Stat row */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-6 grid grid-cols-3 gap-px"
        style={{ background: HAIR }}
      >
        {[
          { v: '~50', l: 'admitted / week' },
          { v: entry.sport || 'all', l: 'your sport' },
          { v: 'beta', l: 'access tier' },
        ].map(s => (
          <div key={s.l} className="flex flex-col gap-1 p-4" style={{ background: 'rgba(255,255,255,0.02)', fontFamily: MONO }}>
            <div className="text-[18px] leading-none" style={{ color: FG }}>{s.v}</div>
            <div className="text-[9px] uppercase tracking-[0.22em]" style={{ color: DIM }}>{s.l}</div>
          </div>
        ))}
      </motion.div>

      {/* What happens next */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="mt-6 flex flex-col gap-2"
      >
        <div className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
          // what happens next
        </div>
        {[
          'We email you a personal invite when your spot opens.',
          'You connect your first source in 60 seconds.',
          'Your dashboard is ready the next morning.',
        ].map((t, i) => (
          <div key={t} className="flex items-start gap-3 text-[13px]" style={{ color: FG, fontFamily: MONO }}>
            <span className="mt-2 inline-flex h-4 w-4 shrink-0 items-center justify-center" style={{ border: `1px solid ${GREEN}`, color: GREEN, fontFamily: MONO, fontSize: 10 }}>
              {i + 1}
            </span>
            <span>{t}</span>
          </div>
        ))}
      </motion.div>

      {/* Footer actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-7 flex items-center justify-between text-[12px]"
        style={{ fontFamily: MONO, color: MUTED }}
      >
        <Link to="/" className="transition-colors hover:text-white">← back to synth</Link>
        <button type="button" onClick={reset} className="transition-colors hover:text-white" style={{ color: DIM }}>
          use a different email
        </button>
      </motion.div>
    </div>
  )
}
