import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Search } from 'lucide-react'
import { AUTH_LIGHT } from '../authTokens'
import type { SurveyStep } from './synthSurveySteps'

const T = AUTH_LIGHT

export type SurveyAnswers = Record<string, string | string[]>

export type SubmitResult = { ok: true } | { ok: false; error: string }

/**
 * A compact, one-question-at-a-time survey wizard sized for a narrow column.
 * Driven entirely by the `steps` array (synthSurveySteps.ts). The parent owns
 * the write: when the final (`submit`) step completes, `onSubmit(answers)` runs
 * and, on ok, the parent swaps this out for a confirmation screen.
 */
export function SurveyWizard({
  steps,
  onSubmit,
}: {
  steps: SurveyStep[]
  onSubmit: (answers: SurveyAnswers) => Promise<SubmitResult>
}) {
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<SurveyAnswers>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const step = steps[i]
  const total = steps.length
  const last = i === total - 1

  const next = () => {
    setError(null)
    setI((v) => Math.min(v + 1, total - 1))
  }
  const back = () => {
    setError(null)
    setI((v) => Math.max(v - 1, 0))
  }

  const setAnswer = (key: string, value: string | string[]) =>
    setAnswers((a) => ({ ...a, [key]: value }))

  const submit = async () => {
    setSubmitting(true)
    setError(null)
    const res = await onSubmit(answers)
    if (res.ok === false) {
      setError(res.error)
      setSubmitting(false)
    }
    // On ok the parent unmounts this component; no state update needed.
  }

  return (
    <div className="flex flex-col">
      {/* Progress */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-1.5">
          {steps.map((_, idx) => (
            <span
              key={idx}
              className="h-1 flex-1 rounded-full transition-all"
              style={{ background: idx <= i ? T.GREEN : T.HAIR }}
            />
          ))}
        </div>
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ color: T.DIM, fontFamily: T.MONO }}
        >
          {i + 1}/{total}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <StepView
            step={step}
            answers={answers}
            submitting={submitting}
            last={last}
            onSetAnswer={setAnswer}
            onNext={next}
            onSubmit={submit}
          />
        </motion.div>
      </AnimatePresence>

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-lg px-3.5 py-2.5 text-[13px]"
          style={{ background: T.DANGER_WASH, border: `1px solid ${T.DANGER}`, color: T.DANGER, fontFamily: T.BODY }}
        >
          {error}
        </div>
      ) : null}

      {/* Back */}
      {i > 0 && !submitting ? (
        <button
          type="button"
          onClick={back}
          className="mt-6 inline-flex items-center gap-1.5 self-start text-[12px] font-medium"
          style={{ color: T.MUTED, fontFamily: T.BODY }}
        >
          <ArrowLeft size={14} strokeWidth={2.2} />
          Back
        </button>
      ) : null}
    </div>
  )
}

function Title({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2
        className="text-[26px] leading-[1.15] tracking-[-0.01em]"
        style={{ color: T.INK, fontFamily: T.SERIF, fontWeight: 600, textWrap: 'balance' as const }}
      >
        {title}
      </h2>
      {sub ? (
        <p className="mt-2 text-[14px] leading-[1.5]" style={{ color: T.MUTED, fontFamily: T.BODY }}>
          {sub}
        </p>
      ) : null}
    </div>
  )
}

function StepView({
  step,
  answers,
  submitting,
  last,
  onSetAnswer,
  onNext,
  onSubmit,
}: {
  step: SurveyStep
  answers: SurveyAnswers
  submitting: boolean
  last: boolean
  onSetAnswer: (key: string, value: string | string[]) => void
  onNext: () => void
  onSubmit: () => void
}) {
  switch (step.type) {
    case 'welcome':
      return (
        <div>
          <Title title={step.title} sub={step.sub} />
          <PrimaryButton onClick={onNext}>{step.button ?? 'Start'}</PrimaryButton>
        </div>
      )
    case 'single':
      return (
        <SingleStep step={step} value={(answers[step.key] as string) ?? ''} onSetAnswer={onSetAnswer} onNext={onNext} />
      )
    case 'multi':
      return (
        <MultiStep step={step} value={(answers[step.key] as string[]) ?? []} onSetAnswer={onSetAnswer} onNext={onNext} />
      )
    case 'dropdown':
      return (
        <DropdownStep step={step} value={(answers[step.key] as string) ?? ''} onSetAnswer={onSetAnswer} onNext={onNext} />
      )
    case 'email':
      return (
        <EmailStep
          step={step}
          value={(answers[step.key] as string) ?? ''}
          submitting={submitting}
          last={last}
          onSetAnswer={onSetAnswer}
          onSubmit={onSubmit}
        />
      )
    default:
      return null
  }
}

// ─── Single-select (auto-advance) ────────────────────────────────────────────

function SingleStep({
  step,
  value,
  onSetAnswer,
  onNext,
}: {
  step: Extract<SurveyStep, { type: 'single' }>
  value: string
  onSetAnswer: (key: string, value: string) => void
  onNext: () => void
}) {
  const [otherOpen, setOtherOpen] = useState(false)
  const [otherText, setOtherText] = useState('')

  const pick = (v: string) => {
    onSetAnswer(step.key, v)
    window.setTimeout(onNext, 200)
  }

  return (
    <div>
      <Title title={step.title} sub={step.sub} />
      <div className="flex flex-col gap-2">
        {step.options.map((opt) => (
          <OptionRow key={opt} label={opt} selected={value === opt} onClick={() => pick(opt)} />
        ))}
        {step.other ? (
          otherOpen ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && otherText.trim()) pick(otherText.trim())
                }}
                placeholder="Type your sport"
                className="flex-1 rounded-lg px-3.5 py-3 text-[15px] outline-none"
                style={{ background: T.SUNK, border: `1px solid ${T.HAIR}`, color: T.INK, fontFamily: T.BODY }}
              />
              <button
                type="button"
                disabled={!otherText.trim()}
                onClick={() => pick(otherText.trim())}
                className="flex h-11 w-11 items-center justify-center rounded-lg disabled:opacity-40"
                style={{ background: T.GREEN, color: '#fff' }}
                aria-label="Confirm"
              >
                <ArrowRight size={18} strokeWidth={2.4} />
              </button>
            </div>
          ) : (
            <OptionRow label="Other" selected={false} onClick={() => setOtherOpen(true)} />
          )
        ) : null}
      </div>
    </div>
  )
}

// ─── Multi-select ─────────────────────────────────────────────────────────────

function MultiStep({
  step,
  value,
  onSetAnswer,
  onNext,
}: {
  step: Extract<SurveyStep, { type: 'multi' }>
  value: string[]
  onSetAnswer: (key: string, value: string[]) => void
  onNext: () => void
}) {
  const min = step.min ?? 0
  const toggle = (opt: string) => {
    const set = new Set(value)
    if (set.has(opt)) set.delete(opt)
    else set.add(opt)
    onSetAnswer(step.key, [...set])
  }
  const canAdvance = value.length >= min

  return (
    <div>
      <Title title={step.title} sub={step.sub} />
      <div className="flex flex-col gap-2">
        {step.options.map((opt) => (
          <OptionRow key={opt} label={opt} selected={value.includes(opt)} checkbox onClick={() => toggle(opt)} />
        ))}
      </div>
      <PrimaryButton className="mt-5" disabled={!canAdvance} onClick={onNext}>
        Continue{value.length > 0 ? ` · ${value.length}` : ''}
      </PrimaryButton>
    </div>
  )
}

// ─── Dropdown (type-to-search combobox) ──────────────────────────────────────

function DropdownStep({
  step,
  value,
  onSetAnswer,
  onNext,
}: {
  step: Extract<SurveyStep, { type: 'dropdown' }>
  value: string
  onSetAnswer: (key: string, value: string) => void
  onNext: () => void
}) {
  const [query, setQuery] = useState(value)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return step.options.slice(0, 8)
    return step.options.filter((o) => o.toLowerCase().includes(q)).slice(0, 8)
  }, [query, step.options])

  const pick = (v: string) => {
    onSetAnswer(step.key, v)
    window.setTimeout(onNext, 160)
  }

  const exactish = filtered.some((o) => o.toLowerCase() === query.trim().toLowerCase())

  return (
    <div>
      <Title title={step.title} sub={step.sub} />
      <div
        className="flex items-center gap-2 rounded-lg px-3.5 py-3"
        style={{ background: T.SUNK, border: `1px solid ${T.HAIR}` }}
      >
        <Search size={16} color={T.DIM} />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={step.placeholder ?? 'Search'}
          className="flex-1 bg-transparent text-[15px] outline-none"
          style={{ color: T.INK, fontFamily: T.BODY }}
        />
      </div>

      <div className="mt-2 flex flex-col gap-1.5">
        {filtered.map((opt) => (
          <OptionRow key={opt} label={opt} selected={value === opt} compact onClick={() => pick(opt)} />
        ))}
        {step.other && query.trim() && !exactish ? (
          <OptionRow label={`Use "${query.trim()}"`} selected={false} compact onClick={() => pick(query.trim())} />
        ) : null}
      </div>

      {step.optional ? (
        <button
          type="button"
          onClick={onNext}
          className="mt-4 text-[12px] font-medium underline-offset-2 hover:underline"
          style={{ color: T.MUTED, fontFamily: T.BODY }}
        >
          Skip this
        </button>
      ) : null}
    </div>
  )
}

// ─── Email (final / submit) ──────────────────────────────────────────────────

function EmailStep({
  step,
  value,
  submitting,
  onSetAnswer,
  onSubmit,
}: {
  step: Extract<SurveyStep, { type: 'email' }>
  value: string
  submitting: boolean
  last: boolean
  onSetAnswer: (key: string, value: string) => void
  onSubmit: () => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    inputRef.current?.focus()
  }, [])
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (valid && !submitting) onSubmit()
      }}
    >
      <Title title={step.title} sub={step.sub} />
      <input
        ref={inputRef}
        type="email"
        value={value}
        onChange={(e) => onSetAnswer(step.key, e.target.value)}
        placeholder={step.placeholder ?? 'you@example.com'}
        autoComplete="email"
        className="w-full rounded-lg px-3.5 py-3.5 text-[15px] outline-none"
        style={{ background: T.SUNK, border: `1px solid ${valid || !value ? T.HAIR : T.DANGER}`, color: T.INK, fontFamily: T.BODY }}
      />
      <PrimaryButton className="mt-4" type="submit" disabled={!valid || submitting}>
        {submitting ? 'Locking your spot…' : 'Get early access'}
      </PrimaryButton>
    </form>
  )
}

// ─── Shared bits ──────────────────────────────────────────────────────────────

function OptionRow({
  label,
  selected,
  checkbox,
  compact,
  onClick,
}: {
  label: string
  selected: boolean
  checkbox?: boolean
  compact?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-lg text-left transition-colors"
      style={{
        padding: compact ? '10px 14px' : '13px 15px',
        background: selected ? T.GREEN_WASH : T.BG,
        border: `1px solid ${selected ? T.GREEN : T.HAIR}`,
        color: T.INK,
        fontFamily: T.BODY,
      }}
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center"
        style={{
          borderRadius: checkbox ? 6 : 999,
          border: `1.5px solid ${selected ? T.GREEN : T.HAIR}`,
          background: selected ? T.GREEN : 'transparent',
        }}
      >
        {selected ? <Check size={13} strokeWidth={3} color="#fff" /> : null}
      </span>
      <span className="text-[15px] font-medium leading-tight">{label}</span>
    </button>
  )
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  type = 'button',
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-[15px] font-semibold transition-opacity disabled:opacity-40 ${className ?? ''}`}
      style={{ background: T.INK, color: '#fff', fontFamily: T.BODY }}
    >
      {children}
    </button>
  )
}
