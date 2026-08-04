import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { posthog } from '@shared/analytics/posthog'
import { AuthLayout } from './AuthLayout'
import { AUTH_LIGHT } from './authTokens'
import { SurveyWizard, type SurveyAnswers, type SubmitResult } from './survey/surveyEngine'
import { SYNTH_SURVEY } from './survey/synthSurveySteps'
import {
  WAITLIST_BASE, loadStoredEntry, clearStoredEntry,
  joinWaitlist, fetchWaitlistCount, subscribeToWaitlistCount,
  type WaitlistEntry,
} from './waitlist'

const T = AUTH_LIGHT
const WEEKLY_ADMITS = 50 // ETA math
const WISPR_HREF = '/wispr'

const str = (v: string | string[] | undefined): string | undefined =>
  typeof v === 'string' ? v : undefined
const arr = (v: string | string[] | undefined): string[] | undefined =>
  Array.isArray(v) ? v : undefined

export function SignUpPage() {
  const [entry, setEntry] = useState<WaitlistEntry | null>(() => loadStoredEntry())
  const [liveTotal, setLiveTotal] = useState<number>(WAITLIST_BASE)

  useEffect(() => {
    let mounted = true
    void fetchWaitlistCount().then((total) => {
      if (mounted) setLiveTotal(total)
    })
    const unsub = subscribeToWaitlistCount((total) => {
      if (mounted) setLiveTotal(total)
    })
    return () => { mounted = false; unsub() }
  }, [])

  const onSubmit = async (answers: SurveyAnswers): Promise<SubmitResult> => {
    const email = (str(answers.email) ?? '').trim()
    const result = await joinWaitlist({
      email,
      sport: str(answers.sport),
      role: str(answers.role),
      university: str(answers.university),
      wearable: str(answers.wearable),
      tools: arr(answers.tools),
      trackWants: arr(answers.track_wants),
      dimensionality: str(answers.dimensionality),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    })
    if (result.ok === false) return { ok: false, error: result.error }
    try {
      posthog.identify(email, { email, source: 'waitlist', sport: str(answers.sport), role: str(answers.role) })
      posthog.capture('waitlist_joined', {
        email,
        sport: str(answers.sport),
        role: str(answers.role),
        position: result.entry.position,
        already_on_list: result.alreadyOnList,
      })
    } catch { /* analytics is best-effort */ }
    setEntry(result.entry)
    return { ok: true }
  }

  return (
    <AuthLayout tab="signup">
      {entry ? (
        <QueueConfirmation entry={entry} liveTotal={liveTotal} />
      ) : (
        <>
          <LiveCountLine total={liveTotal} />
          <SurveyWizard steps={SYNTH_SURVEY} onSubmit={onSubmit} />
        </>
      )}
    </AuthLayout>
  )
}

/* ─── Inline live count (social proof above the survey) ───────────────────── */

function LiveCountLine({ total }: { total: number }) {
  return (
    <div
      className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5"
      style={{ background: T.GREEN_WASH, border: `1px solid ${T.GREEN}` }}
    >
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: T.GREEN }}
      />
      <motion.span
        key={total}
        initial={{ scale: 0.9, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-[14px] font-bold tabular-nums"
        style={{ color: T.GREEN_DEEP }}
      >
        {total.toLocaleString()}
      </motion.span>
      <span className="text-[12px] font-medium" style={{ color: T.MUTED }}>
        already on the waitlist
      </span>
    </div>
  )
}

/* ─── Queue confirmation (light) + Wispr claim ────────────────────────────── */

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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl p-6"
        style={{ background: T.GREEN_WASH, border: `1px solid ${T.GREEN}` }}
      >
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ fontFamily: T.MONO, color: T.GREEN_DEEP }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: T.GREEN }} />
          You&apos;re in
        </div>

        <div className="mt-3 flex items-baseline gap-3">
          <span style={{ fontFamily: T.SERIF, fontSize: 'clamp(52px, 6vw, 76px)', lineHeight: 0.92, color: T.INK, fontWeight: 600 }}>
            #{entry.position.toLocaleString()}
          </span>
          <span className="text-[13px]" style={{ fontFamily: T.MONO, color: T.MUTED }}>
            of {liveTotal.toLocaleString()}
          </span>
        </div>

        <div className="mt-5">
          <div className="relative h-1.5 overflow-hidden rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(8, 100 - (entry.position / Math.max(entry.position, liveTotal)) * 100)}%` }}
              transition={{ duration: 1.1, delay: 0.3, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: T.GREEN }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: T.MONO, color: T.DIM }}>
            <span>{ahead.toLocaleString()} ahead</span>
            <span>ETA ~ {etaWeeks} {etaWeeks === 1 ? 'wk' : 'wks'}</span>
          </div>
        </div>
      </motion.div>

      {/* Wispr claim — the promised incentive. */}
      <a
        href={WISPR_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold transition-opacity hover:opacity-90"
        style={{ background: T.INK, color: '#fff', fontFamily: T.BODY }}
      >
        <Sparkles size={16} strokeWidth={2.2} />
        Claim your free Wispr Pro
      </a>
      <p className="mt-2 text-center text-[12px]" style={{ color: T.DIM, fontFamily: T.BODY }}>
        As promised. Opens Wispr Flow in a new tab.
      </p>

      {newSinceJoin > 0 && (
        <div className="mt-4 flex items-center gap-2 text-[12px]" style={{ fontFamily: T.BODY, color: T.MUTED }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: T.GREEN }} />
          <span style={{ color: T.INK, fontWeight: 600 }}>+{newSinceJoin}</span>
          joined since you did
        </div>
      )}

      <div className="mt-6 flex items-center justify-between text-[12px]" style={{ fontFamily: T.BODY, color: T.MUTED }}>
        <Link to="/" className="transition-colors hover:opacity-70">← Back to site</Link>
        <button type="button" onClick={reset} className="transition-colors hover:opacity-70">
          Use a different email
        </button>
      </div>
    </div>
  )
}
