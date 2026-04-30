import { useState } from 'react'
import { Bell, Shield, Eye, Sparkles, User, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { SheetShell } from './SheetShell'
import { SYNTH } from '../lib/theme'

type SectionSheetProps = {
  open: boolean
  onClose: () => void
}

// — Coach: Notifications —

export function NotificationsSheet({ open, onClose }: SectionSheetProps) {
  const [daily, setDaily] = useState(true)
  const [attention, setAttention] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)
  return (
    <SheetShell open={open} onClose={onClose} title="Notifications">
      <SheetHero icon={<Bell size={20} strokeWidth={2.2} />} title="Notifications" subtitle="Coach-side alerts and digests" />
      <Toggle label="Daily morning summary" hint="06:00 · top 3 athletes flagged" value={daily} onChange={setDaily} />
      <Toggle label="Attention alerts" hint="When a metric breaks 7-day baseline" value={attention} onChange={setAttention} />
      <Toggle label="Weekly digest" hint="Sunday 18:00 · sent to your inbox" value={weeklyDigest} onChange={setWeeklyDigest} />
    </SheetShell>
  )
}

// — Coach: synth AI defaults —

export function SynthAISheet({ open, onClose }: SectionSheetProps) {
  const [scope, setScope] = useState<'team' | 'last-athlete' | 'ask'>('team')
  const [style, setStyle] = useState<'normal' | 'concise' | 'detailed'>('normal')
  return (
    <SheetShell open={open} onClose={onClose} title="synth AI">
      <SheetHero icon={<Sparkles size={20} strokeWidth={2.2} />} title="synth AI defaults" subtitle="What synth assumes when you start a chat" />
      <Group label="Default scope">
        <Pill active={scope === 'team'} onClick={() => setScope('team')}>Whole team</Pill>
        <Pill active={scope === 'last-athlete'} onClick={() => setScope('last-athlete')}>Last athlete viewed</Pill>
        <Pill active={scope === 'ask'} onClick={() => setScope('ask')}>Ask each time</Pill>
      </Group>
      <Group label="Response style">
        <Pill active={style === 'normal'} onClick={() => setStyle('normal')}>Normal</Pill>
        <Pill active={style === 'concise'} onClick={() => setStyle('concise')}>Concise</Pill>
        <Pill active={style === 'detailed'} onClick={() => setStyle('detailed')}>Detailed</Pill>
      </Group>
      <p className="text-[12px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
        synth always cites its sources. You can override scope inside any chat.
      </p>
    </SheetShell>
  )
}

// — Coach + Athlete: Privacy & sharing —

export function PrivacySheet({ open, onClose, role }: SectionSheetProps & { role: 'coach' | 'athlete' }) {
  const [shareScores, setShareScores] = useState(role === 'coach' ? false : true)
  const [shareNotes, setShareNotes] = useState(false)
  const [shareAttendance, setShareAttendance] = useState(true)
  return (
    <SheetShell open={open} onClose={onClose} title="Privacy & sharing">
      <SheetHero icon={<Shield size={20} strokeWidth={2.2} />} title="Privacy & sharing" subtitle={role === 'coach' ? 'What athletes can see by default' : 'What synth shares with your coach'} />
      <Toggle label="Synthesized scores" hint="Recovery, training-load, readiness numbers" value={shareScores} onChange={setShareScores} />
      <Toggle label="Notes" hint={role === 'coach' ? 'Coach notes default to private' : 'Wellness check-in notes'} value={shareNotes} onChange={setShareNotes} />
      <Toggle label="Attendance + sessions" hint="Logged work, on-time arrival" value={shareAttendance} onChange={setShareAttendance} />
      <p className="text-[12px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
        Defaults apply to new athletes. Per-athlete overrides live on each profile.
      </p>
    </SheetShell>
  )
}

// — Coach: Roster —

export function RosterSheet({ open, onClose, count }: SectionSheetProps & { count: number }) {
  return (
    <SheetShell open={open} onClose={onClose} title="Roster">
      <SheetHero icon={<Users size={20} strokeWidth={2.2} />} title="Roster" subtitle={`${count} athletes in Pacific Women's Rowing`} />
      <p className="text-[14px]" style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}>
        Roster management lands in a coming release. Today, athletes onboard via your team's invite code.
      </p>
      <CopyRow label="Team invite code" value="CALW-2026" />
    </SheetShell>
  )
}

// — Athlete: What coach can see —

export function CoachVisibilitySheet({ open, onClose }: SectionSheetProps) {
  const [shareErgs, setShareErgs] = useState(true)
  const [shareWellness, setShareWellness] = useState(true)
  const [shareSleep, setShareSleep] = useState(false)
  return (
    <SheetShell open={open} onClose={onClose} title="What coach can see">
      <SheetHero icon={<Eye size={20} strokeWidth={2.2} />} title="What coach sees" subtitle="Toggle individual data streams" />
      <Toggle label="Erg sessions" hint="Times, splits, watt curves" value={shareErgs} onChange={setShareErgs} />
      <Toggle label="Wellness check-ins" hint="Sleep, soreness, stress entries" value={shareWellness} onChange={setShareWellness} />
      <Toggle label="Detailed sleep" hint="WHOOP / Oura nightly breakdown" value={shareSleep} onChange={setShareSleep} />
      <p className="text-[12px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
        Your raw data always stays yours. These toggles only control what shows in the coach view.
      </p>
    </SheetShell>
  )
}

// — Athlete: Personal info —

export function PersonalInfoSheet({ open, onClose }: SectionSheetProps) {
  return (
    <SheetShell open={open} onClose={onClose} title="Personal info">
      <SheetHero icon={<User size={20} strokeWidth={2.2} />} title="Personal info" subtitle="Used to calibrate synthesized scores" />
      <ReadonlyRow label="Height" value={`5'9" (175 cm)`} />
      <ReadonlyRow label="Weight" value="142 lb (64 kg)" />
      <ReadonlyRow label="Date of birth" value="Mar 12, 2003" />
      <p className="text-[12px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
        Editing lands in a coming release. Reach out to your coach if anything's wrong.
      </p>
    </SheetShell>
  )
}

// — Generic "coming soon" —

export function ComingSoonSheet({
  open,
  onClose,
  title,
  body,
}: SectionSheetProps & { title: string; body: string }) {
  return (
    <SheetShell open={open} onClose={onClose} title={title}>
      <div className="flex flex-col items-center gap-3 px-2 py-6">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}
        >
          <Sparkles size={20} strokeWidth={2.2} />
        </span>
        <p
          className="text-center text-[18px] font-bold leading-tight"
          style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
        >
          {title}
        </p>
        <p
          className="max-w-[300px] text-center text-[13px]"
          style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
        >
          {body}
        </p>
      </div>
    </SheetShell>
  )
}

// — Shared bits —

function SheetHero({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
        style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="text-[16px] font-bold leading-tight"
          style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
        >
          {title}
        </p>
        <p
          className="mt-0.5 text-[12px]"
          style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  )
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left active:opacity-80"
      style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold" style={{ fontFamily: SYNTH.font }}>{label}</p>
        {hint ? (
          <p className="mt-0.5 text-[11px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>{hint}</p>
        ) : null}
      </div>
      <span
        className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
        style={{ background: value ? SYNTH.accentEmerald : '#D4D4D8' }}
      >
        <span
          className="absolute top-0.5 h-6 w-6 rounded-full transition-transform"
          style={{
            background: '#FFFFFF',
            transform: value ? 'translateX(22px)' : 'translateX(2px)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        />
      </span>
    </button>
  )
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-3 py-1.5 text-[12px] font-semibold"
      style={{
        background: active ? SYNTH.accentBlack : SYNTH.sheet,
        borderColor: active ? SYNTH.accentBlack : SYNTH.sheetMuted,
        color: active ? SYNTH.inkOnBrand : SYNTH.ink,
        fontFamily: SYNTH.font,
      }}
    >
      {children}
    </button>
  )
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center justify-between rounded-2xl px-4 py-3 text-left active:opacity-80"
      style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
          {label}
        </p>
        <p className="mt-1 text-[16px] font-bold" style={{ fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </p>
      </div>
      <span
        className="rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]"
        style={{
          background: copied ? SYNTH.accentEmerald : SYNTH.accentBlack,
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </span>
    </button>
  )
}

function ReadonlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between rounded-2xl px-4 py-3"
      style={{ background: SYNTH.sheetMuted }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
      >
        {label}
      </p>
      <p className="text-[14px] font-semibold" style={{ color: SYNTH.ink, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
    </div>
  )
}
