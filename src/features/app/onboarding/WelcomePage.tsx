import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { APP_THEME } from '../lib/theme'
import { isSupabaseConfigured, signInWithGoogle } from '../lib/supabase'
import { useAppAuthStore } from '../store/useAppAuthStore'

export function WelcomePage() {
  const navigate = useNavigate()
  const setDemoUser = useAppAuthStore((s) => s.setDemoUser)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onGoogle = async () => {
    setError(null)
    setBusy(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in unavailable')
      setBusy(false)
    }
  }

  const onDemo = () => {
    setDemoUser({ id: 'demo-user', email: 'demo@synth.local' })
    navigate('/app')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1 flex-col"
      style={{ background: APP_THEME.canvas }}
    >
      <div className="flex flex-1 flex-col items-center justify-center px-6 pt-[max(env(safe-area-inset-top),24px)]">
        <SynthHero />

        <h1
          className="mt-10 text-center text-[36px] font-semibold leading-[1.05]"
          style={{ fontFamily: APP_THEME.fontSerif, color: APP_THEME.text }}
        >
          Every <span style={{ color: APP_THEME.brand }}>signal.</span>
          <br />
          One platform.
        </h1>
        <p
          className="mt-3 max-w-[300px] text-center text-[14px] leading-[1.5]"
          style={{ fontFamily: APP_THEME.fontSans, color: APP_THEME.textMuted }}
        >
          Your team's data, synthesized into one mobile surface for coaches and
          athletes.
        </p>
      </div>

      <div className="px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-4">
        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-[14px] font-semibold transition-opacity active:scale-[0.99] disabled:opacity-60"
          style={{
            background: APP_THEME.text,
            color: '#FFFFFF',
            fontFamily: APP_THEME.fontMono,
            letterSpacing: '0.03em',
          }}
        >
          <GoogleGlyph />
          {busy ? 'Opening Google…' : 'Sign in with Google'}
        </button>

        <button
          type="button"
          onClick={onDemo}
          className="mt-3 block w-full text-center text-[12px] font-semibold uppercase tracking-[0.14em]"
          style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textMuted }}
        >
          {isSupabaseConfigured() ? 'Continue as demo' : 'Continue as demo (Supabase not configured)'}
        </button>

        {error ? (
          <p
            className="mt-3 text-center text-[12px]"
            style={{ fontFamily: APP_THEME.fontSans, color: '#DC2626' }}
          >
            {error}
          </p>
        ) : null}
      </div>
    </motion.div>
  )
}

function SynthHero() {
  return (
    <div className="flex flex-col items-center">
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.2em]"
        style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textFaint }}
      >
        synth · mobile
      </p>

      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mt-6 flex h-[180px] w-[180px] items-center justify-center"
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${APP_THEME.brandWash} 0%, transparent 65%)`,
            filter: 'blur(2px)',
          }}
        />
        <div
          className="relative flex h-[128px] w-[128px] items-center justify-center rounded-3xl"
          style={{
            background: `linear-gradient(135deg, ${APP_THEME.brand}, ${APP_THEME.brandDeep})`,
            boxShadow: '0 20px 40px -16px rgba(5,150,105,0.55)',
          }}
        >
          <span
            className="text-[44px] font-bold leading-none text-white"
            style={{ fontFamily: APP_THEME.fontMono, letterSpacing: '0.02em' }}
          >
            s.
          </span>
        </div>
      </motion.div>

      <p
        className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em]"
        style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textFaint }}
      >
        Every data signal · one platform
      </p>
    </div>
  )
}

function GoogleGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#FFFFFF"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.797 2.717v2.258h2.908c1.702-1.567 2.685-3.874 2.685-6.616z"
      />
      <path
        fill="#FFFFFF"
        opacity={0.9}
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FFFFFF"
        opacity={0.7}
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
      />
      <path
        fill="#FFFFFF"
        opacity={0.5}
        d="M9 3.58c1.321 0 2.508.454 3.44 1.346l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
      />
    </svg>
  )
}
