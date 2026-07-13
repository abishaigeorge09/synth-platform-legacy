/** Shared form primitives for the auth pages (Login + Signup). Tokens
 *  live in authTokens.ts so React Fast Refresh is happy (this file only
 *  exports components). */

import { AUTH_TOKENS } from './authTokens'

const { FG, MUTED, DIM, HAIR, FAINT, GREEN, SERIF, MONO } = AUTH_TOKENS

/* ─── Form primitives ─────────────────────────────────────────────────── */

export function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-[0.28em]" style={{ fontFamily: MONO, color: DIM }}>
      <span>{children}</span>
      {hint}
    </div>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 text-[12px] outline-none transition-colors ${props.className ?? ''}`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${FAINT}`,
        borderRadius: 6,
        color: FG,
        fontFamily: MONO,
        caretColor: GREEN,
        ...(props.style ?? {}),
      }}
      onFocus={e => { e.currentTarget.style.borderColor = GREEN; props.onFocus?.(e) }}
      onBlur={e => { e.currentTarget.style.borderColor = FAINT; props.onBlur?.(e) }}
    />
  )
}

export function PrimaryAuthButton({
  children,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[0.18em] transition-all disabled:opacity-60"
      style={{
        background: GREEN,
        color: '#000',
        fontFamily: MONO,
        boxShadow: `0 0 32px rgba(16,185,129,0.22)`,
      }}
    >
      {children}
    </button>
  )
}

export function GhostAuthButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className="inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3.5 text-[13px] uppercase tracking-[0.18em] transition-colors hover:bg-white/5"
      style={{
        background: 'transparent',
        border: `1px solid ${HAIR}`,
        color: FG,
        fontFamily: MONO,
      }}
    >
      {children}
    </button>
  )
}

export function AuthHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2
        className="leading-[1.02] tracking-[-0.01em]"
        style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(32px, 3.6vw, 44px)', color: FG }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-[14px]" style={{ color: MUTED }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
