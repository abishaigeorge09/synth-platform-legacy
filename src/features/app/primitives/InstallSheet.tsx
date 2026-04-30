import { motion } from 'framer-motion'
import {
  Download,
  Share,
  PlusSquare,
  Smartphone,
  Check,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { SheetShell } from './SheetShell'
import { SYNTH } from '../lib/theme'

export type InstallVariant = 'android' | 'ios' | 'fallback'

type Props = {
  open: boolean
  onClose: () => void
  variant: InstallVariant
  onInstall: () => void
  busy?: boolean
}

/**
 * Bottom-sheet install instructions. Three branches:
 *  - Android / Chromium: single Install Now button → native browser prompt.
 *  - iOS Safari: 3-step Share → Add to Home Screen → Add walkthrough.
 *  - Fallback (desktop, in-app browsers): "Open on your phone" message.
 */
export function InstallSheet({ open, onClose, variant, onInstall, busy = false }: Props) {
  if (variant === 'android') {
    return (
      <SheetShell open={open} onClose={onClose} title="Install synth.">
        <Hero />
        <h2
          className="text-center text-[22px] font-bold leading-[1.2] tracking-[-0.01em]"
          style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
        >
          Install synth on your home screen
        </h2>
        <p
          className="mx-auto max-w-[280px] text-center text-[13px]"
          style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
        >
          One tap. Launches like a native app — fullscreen, offline-ready,
          no browser bar.
        </p>

        <Bullets>
          <Bullet icon={<Check size={14} strokeWidth={2.6} />}>Works offline once installed</Bullet>
          <Bullet icon={<Check size={14} strokeWidth={2.6} />}>Stays signed in across launches</Bullet>
          <Bullet icon={<Check size={14} strokeWidth={2.6} />}>Auto-updates in the background</Bullet>
        </Bullets>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onInstall}
          disabled={busy}
          className="mt-2 flex items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-bold uppercase tracking-[0.04em] disabled:opacity-60"
          style={{
            background: SYNTH.accentEmerald,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            letterSpacing: '0.04em',
            boxShadow: `0 10px 22px ${SYNTH.accentEmerald}55`,
          }}
        >
          <Download size={16} strokeWidth={2.6} />
          {busy ? 'Installing…' : 'Install now'}
        </motion.button>

        <button
          type="button"
          onClick={onClose}
          className="text-center text-[12px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
        >
          Maybe later
        </button>
      </SheetShell>
    )
  }

  if (variant === 'ios') {
    return (
      <SheetShell open={open} onClose={onClose} title="Install synth.">
        <Hero />
        <h2
          className="text-center text-[22px] font-bold leading-[1.2] tracking-[-0.01em]"
          style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
        >
          Install synth on your iPhone
        </h2>
        <p
          className="mx-auto max-w-[300px] text-center text-[13px]"
          style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
        >
          iOS doesn't let us install for you, so it's three quick taps in
          Safari.
        </p>

        <ol className="mt-2 flex flex-col gap-2.5">
          <Step
            number={1}
            icon={<Share size={18} strokeWidth={2.2} />}
            title="Tap the Share button"
            sub="Bottom of the Safari window"
          />
          <Step
            number={2}
            icon={<PlusSquare size={18} strokeWidth={2.2} />}
            title='Choose "Add to Home Screen"'
            sub='Scroll down in the share sheet if you don&apos;t see it'
          />
          <Step
            number={3}
            icon={<Smartphone size={18} strokeWidth={2.2} />}
            title='Tap "Add"'
            sub="synth lands on your home screen — open it from there"
          />
        </ol>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="mt-2 rounded-full py-3.5 text-[14px] font-bold uppercase tracking-[0.04em]"
          style={{
            background: SYNTH.accentBlack,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            letterSpacing: '0.04em',
          }}
        >
          Got it
        </motion.button>
      </SheetShell>
    )
  }

  // fallback
  return (
    <SheetShell open={open} onClose={onClose} title="Install synth.">
      <Hero />
      <h2
        className="text-center text-[20px] font-bold leading-[1.2]"
        style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
      >
        Open synth on your phone to install
      </h2>
      <p
        className="mx-auto max-w-[300px] text-center text-[13px]"
        style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
      >
        synth installs as a home-screen app on iOS and Android. On a
        desktop browser, just keep using it here.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-2 rounded-full py-3.5 text-[14px] font-bold uppercase tracking-[0.04em]"
        style={{
          background: SYNTH.accentBlack,
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
        }}
      >
        Got it
      </button>
    </SheetShell>
  )
}

function Hero() {
  return (
    <div className="flex justify-center pt-2">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: SYNTH.accentEmerald,
          color: SYNTH.inkOnBrand,
          boxShadow: `0 12px 24px ${SYNTH.accentEmerald}55`,
        }}
      >
        <Download size={22} strokeWidth={2.4} />
      </span>
    </div>
  )
}

function Bullets({ children }: { children: ReactNode }) {
  return <ul className="flex flex-col gap-1.5">{children}</ul>
}

function Bullet({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li
      className="flex items-center gap-2 text-[13px]"
      style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{ background: `${SYNTH.accentEmerald}1F`, color: SYNTH.accentEmerald }}
      >
        {icon}
      </span>
      <span>{children}</span>
    </li>
  )
}

function Step({
  number,
  icon,
  title,
  sub,
}: {
  number: number
  icon: ReactNode
  title: string
  sub: string
}) {
  return (
    <li
      className="flex items-start gap-3 rounded-2xl border px-3 py-3"
      style={{
        background: SYNTH.aiCard,
        borderColor: SYNTH.aiBorder,
        fontFamily: SYNTH.font,
      }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: SYNTH.sheet, color: SYNTH.ink, border: `1px solid ${SYNTH.aiBorder}` }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: SYNTH.aiTextMuted }}
        >
          Step {number}
        </p>
        <p
          className="mt-0.5 text-[14px] font-bold leading-tight"
          style={{ color: SYNTH.ink }}
        >
          {title}
        </p>
        <p
          className="mt-0.5 text-[12px] leading-snug"
          style={{ color: SYNTH.inkMuted }}
        >
          {sub}
        </p>
      </div>
    </li>
  )
}
