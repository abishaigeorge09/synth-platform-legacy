import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  Bell,
  Shield,
  Database,
  LogOut,
  Sparkles,
  UserPlus,
  Copy,
  Check,
  HelpCircle,
  RotateCcw,
} from 'lucide-react'
import { useTutorialStore } from '@shared/tutorial'
import { toast } from '@shared/store/useToastStore'
import type { ReactNode } from 'react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import {
  NotificationsSheet,
  SynthAISheet,
  PrivacySheet,
} from '../primitives/SettingsSheets'
import { InviteCoachesSheet } from '../primitives/InviteCoachesSheet'
import { useAppAuthStore } from '../store/useAppAuthStore'
import { APP_MOCK_TEAM } from '../data/mockTeam'
import { SYNTH } from '../lib/theme'

type OpenSheet = 'notifications' | 'synth-ai' | 'privacy' | 'invite-coaches' | null

export function SettingsPage() {
  const navigate = useNavigate()
  const user = useAppAuthStore((s) => s.user)
  const signOut = useAppAuthStore((s) => s.signOut)
  const replayTour = useTutorialStore((s) => s.replay)
  const resetAll = useTutorialStore((s) => s.resetAll)
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null)

  const replayCurrent = () => {
    // Send the coach to home and replay that tour. Defer the replay so the
    // route mount happens before the overlay tries to find the anchor.
    navigate('/app/coach/home')
    window.setTimeout(() => replayTour('coachHome'), 80)
  }
  const resetEverything = () => {
    resetAll()
    toast('All tutorials reset — they will fire again on next visit.', 'success')
  }
  const [copied, setCopied] = useState(false)
  const inviteCode = 'PAC-W26'

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  const onSignOut = async () => {
    await signOut()
    navigate('/app/welcome')
  }

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-safe-tab">
      <CoachPageHeader title="Settings" subtitle="Coach" back="/app/coach/home" />

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="mx-5 mt-2"
      >
        <div
          className="rounded-3xl p-5"
          style={{
            background: SYNTH.cardYellow,
            boxShadow: SYNTH.shadow.card,
          }}
        >
          <div className="flex items-center gap-4">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
              style={{
                background: SYNTH.accentBlack,
                color: SYNTH.inkOnBrand,
                fontFamily: SYNTH.font,
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: '0.04em',
              }}
            >
              CO
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="text-[18px] font-bold leading-tight"
                style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
              >
                Coach Geri
              </p>
              <p
                className="mt-0.5 text-[12px]"
                style={{ color: SYNTH.ink, opacity: 0.65, fontFamily: SYNTH.font }}
              >
                {APP_MOCK_TEAM.name}
              </p>
              <p
                className="mt-1 text-[10px] uppercase tracking-[0.14em]"
                style={{ color: SYNTH.ink, opacity: 0.55, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
              >
                {user?.email ?? 'demo@synth.local'}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <Section title="Team">
        <div
          data-tour="coach-settings-invite"
          className="flex items-center gap-3 px-4 py-3.5"
          style={{ borderTop: 'none' }}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: SYNTH.glass,
              color: SYNTH.inkOnBrand,
              border: `1px solid ${SYNTH.glassBorder}`,
            }}
          >
            <UserPlus size={18} strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <p
              className="text-[14px] font-semibold leading-tight"
              style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
            >
              Team invite code
            </p>
            <p
              className="mt-0.5 text-[12px]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              Share with athletes joining {APP_MOCK_TEAM.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onCopy}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold"
            style={{
              background: copied ? SYNTH.accentEmerald : SYNTH.inkOnBrand,
              color: copied ? SYNTH.inkOnBrand : SYNTH.ink,
              fontFamily: SYNTH.font,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {copied ? <Check size={12} strokeWidth={3} /> : <Copy size={12} strokeWidth={2.4} />}
            {copied ? 'Copied' : inviteCode}
          </button>
        </div>
        <Row
          icon={<UserPlus size={18} />}
          label="Invite coaches"
          sub="Add assistant coaches to this team"
          onClick={() => setOpenSheet('invite-coaches')}
        />
        <Row
          icon={<Database size={18} />}
          label="Connector health"
          sub="6 connected · 4m last sync · all healthy"
          onClick={() => navigate('/app/coach/sources')}
        />
      </Section>

      <Section title="Preferences">
        <div data-tour="coach-settings-notif">
          <Row
            icon={<Bell size={18} />}
            label="Notifications"
            sub="Daily summary, attention alerts"
            onClick={() => setOpenSheet('notifications')}
          />
        </div>
        <Row
          icon={<Sparkles size={18} />}
          label="synth AI"
          sub="Model + scope defaults"
          onClick={() => setOpenSheet('synth-ai')}
        />
        <Row
          icon={<Shield size={18} />}
          label="Privacy &amp; sharing"
          sub="What athletes can see by default"
          onClick={() => setOpenSheet('privacy')}
        />
      </Section>

      <Section title="Help &amp; guidance">
        <div data-tour="coach-settings-replay">
          <Row
            icon={<HelpCircle size={18} />}
            label="Replay tutorial"
            sub="Walk through the home page step-by-step"
            onClick={replayCurrent}
          />
        </div>
        <Row
          icon={<RotateCcw size={18} />}
          label="Reset all tutorials"
          sub="Make every walkthrough fire on next visit"
          onClick={resetEverything}
        />
      </Section>

      <NotificationsSheet open={openSheet === 'notifications'} onClose={() => setOpenSheet(null)} />
      <SynthAISheet open={openSheet === 'synth-ai'} onClose={() => setOpenSheet(null)} />
      <PrivacySheet open={openSheet === 'privacy'} onClose={() => setOpenSheet(null)} role="coach" />
      <InviteCoachesSheet open={openSheet === 'invite-coaches'} onClose={() => setOpenSheet(null)} />

      <section className="mx-5 mt-6">
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-full py-4 active:scale-[0.99]"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          <LogOut size={16} strokeWidth={2.2} />
          Sign out
        </button>
        <p
          className="mt-4 text-center text-[10px] uppercase tracking-[0.14em]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
        >
          synth · v0.1 mobile · {new Date().getFullYear()}
        </p>
      </section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <p
        className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
      >
        {title}
      </p>
      <div
        className="mx-5 overflow-hidden rounded-3xl"
        style={{
          background: SYNTH.inlineCard,
          border: `1px solid ${SYNTH.inlineCardBorder}`,
        }}
      >
        {children}
      </div>
    </section>
  )
}

function Row({
  icon,
  label,
  sub,
  onClick,
}: {
  icon: ReactNode
  label: string
  sub?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-opacity active:opacity-70 disabled:opacity-100"
      style={{ borderTop: `1px solid ${SYNTH.inlineCardBorder}` }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: SYNTH.glass,
          color: SYNTH.inkOnBrand,
          border: `1px solid ${SYNTH.glassBorder}`,
        }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="text-[14px] font-semibold leading-tight"
          style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
        >
          {label}
        </p>
        {sub ? (
          <p
            className="mt-0.5 text-[12px]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            {sub}
          </p>
        ) : null}
      </div>
      {onClick ? <ChevronRight size={16} color={SYNTH.inkOnBrandFaint} /> : null}
    </button>
  )
}
