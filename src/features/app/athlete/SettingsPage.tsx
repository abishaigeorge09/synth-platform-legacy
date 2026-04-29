import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  Bell,
  Shield,
  Database,
  LogOut,
  User,
  Eye,
  HelpCircle,
  RotateCcw,
} from 'lucide-react'
import { useTutorialStore } from '../../../shared/tutorial'
import { toast } from '../../../shared/store/useToastStore'
import type { ReactNode } from 'react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import {
  NotificationsSheet,
  PrivacySheet,
  CoachVisibilitySheet,
  PersonalInfoSheet,
} from '../primitives/SettingsSheets'
import { useAppAuthStore } from '../store/useAppAuthStore'
import { APP_MOCK_ATHLETES, fmtErgTime } from '../data/mockTeam'
import { SYNTH } from '../lib/theme'

type OpenSheet = 'notifications' | 'visibility' | 'privacy' | 'personal' | null

export function SettingsPage() {
  const navigate = useNavigate()
  const user = useAppAuthStore((s) => s.user)
  const signOut = useAppAuthStore((s) => s.signOut)
  const replayTour = useTutorialStore((s) => s.replay)
  const resetAll = useTutorialStore((s) => s.resetAll)
  const me = APP_MOCK_ATHLETES[0]
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null)

  const replayCurrent = () => {
    navigate('/app/athlete/home')
    window.setTimeout(() => replayTour('athleteHome'), 80)
  }
  const resetEverything = () => {
    resetAll()
    toast('All tutorials reset — they will fire again on next visit.', 'success')
  }

  const onSignOut = async () => {
    await signOut()
    navigate('/app/welcome')
  }

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[140px]">
      <CoachPageHeader title="Settings" subtitle="Athlete" back="/app/athlete/home" />

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="mx-5 mt-2"
      >
        <div
          className="rounded-3xl p-5"
          style={{
            background: SYNTH.cardSky,
            boxShadow: SYNTH.shadow.card,
          }}
        >
          <div className="flex items-center gap-4">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
              style={{
                background: `linear-gradient(135deg, ${SYNTH.accentEmerald}, #047857)`,
                color: '#FFFFFF',
                fontFamily: SYNTH.font,
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: '0.04em',
              }}
            >
              {me.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="text-[18px] font-bold leading-tight"
                style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
              >
                {me.name}
              </p>
              <p
                className="mt-0.5 text-[12px]"
                style={{ color: SYNTH.ink, opacity: 0.65, fontFamily: SYNTH.font }}
              >
                {me.position}
              </p>
              <p
                className="mt-1 text-[10px] uppercase tracking-[0.14em]"
                style={{
                  color: SYNTH.ink,
                  opacity: 0.55,
                  fontFamily: SYNTH.font,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {user?.email ?? 'demo@synth.local'}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-3 border-t pt-3" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            <Stat label="Best 2K" value={fmtErgTime(me.twoKBestSeconds)} />
            <Stat label="Streak" value={`${me.streakDays}d`} />
            <Stat label="Recovery" value={`${me.recoveryScore}`} />
          </div>
        </div>
      </motion.section>

      <Section title="Profile">
        <Row
          icon={<User size={18} />}
          label="Personal info"
          sub="Height, weight, DOB"
          onClick={() => setOpenSheet('personal')}
        />
        <Row
          icon={<Database size={18} />}
          label="My sources"
          sub="5 connected · 4m last sync"
          onClick={() => navigate('/app/athlete/sources')}
        />
      </Section>

      <Section title="Preferences">
        <div data-tour="athlete-settings-notif">
          <Row
            icon={<Bell size={18} />}
            label="Notifications"
            sub="Coach notes, daily check-in"
            onClick={() => setOpenSheet('notifications')}
          />
        </div>
        <Row
          icon={<Eye size={18} />}
          label="What coach can see"
          sub="Manage shared data"
          onClick={() => setOpenSheet('visibility')}
        />
        <Row
          icon={<Shield size={18} />}
          label="Privacy"
          sub="Your data stays yours"
          onClick={() => setOpenSheet('privacy')}
        />
      </Section>

      <Section title="Help &amp; guidance">
        <div data-tour="athlete-settings-replay">
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
      <CoachVisibilitySheet open={openSheet === 'visibility'} onClose={() => setOpenSheet(null)} />
      <PrivacySheet open={openSheet === 'privacy'} onClose={() => setOpenSheet(null)} role="athlete" />
      <PersonalInfoSheet open={openSheet === 'personal'} onClose={() => setOpenSheet(null)} />

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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col">
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: SYNTH.ink, opacity: 0.6, fontFamily: SYNTH.font }}
      >
        {label}
      </span>
      <span
        className="text-[16px] font-bold"
        style={{ color: SYNTH.ink, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </span>
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
