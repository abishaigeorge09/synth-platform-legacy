import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../dashboard/components/PageHeader'
import { THEME } from '../../../lib/theme'
import { useTeamStore } from '../../../shared/store/useTeamStore'

type Toggle = { key: string; label: string; detail: string; on: boolean }

const INITIAL_VISIBILITY: Toggle[] = [
  {
    key: 'showTeamStats',
    label: 'Athletes can see team-wide stats',
    detail: 'Average splits, team compliance, distribution charts',
    on: true,
  },
  {
    key: 'showOtherBoats',
    label: 'Athletes can see other boats',
    detail: 'Lineup history outside their own shell',
    on: false,
  },
  {
    key: 'showCoachNotes',
    label: 'Athletes can see coach notes',
    detail: 'Private session notes attached to their own rows',
    on: false,
  },
  {
    key: 'shareVideos',
    label: 'Share video clips with athletes',
    detail: 'Session media tagged to an athlete is visible to them',
    on: true,
  },
  {
    key: 'allowPersonalSources',
    label: 'Athletes can connect their own sources',
    detail: 'Personal Google Sheets, screenshots, wearable exports',
    on: true,
  },
]

const INITIAL_NOTIFICATIONS: Toggle[] = [
  { key: 'pushLineup', label: 'Push on lineup publish', detail: 'Coach + athletes get a push', on: true },
  { key: 'emailDaily', label: 'Daily email digest', detail: '09:00 PT morning summary', on: true },
  { key: 'alertWellness', label: 'Wellness alert threshold', detail: 'Low-recovery flagged below 50%', on: true },
  { key: 'alertSync', label: 'Stale source alert', detail: 'Connector silent for > 48h', on: false },
]

export function SettingsPage() {
  const team = useTeamStore((s) => s.activeTeam)
  const [visibility, setVisibility] = useState(INITIAL_VISIBILITY)
  const [notifs, setNotifs] = useState(INITIAL_NOTIFICATIONS)
  const [scanCron, setScanCron] = useState('0 18 * * *')
  const [staleHours, setStaleHours] = useState(48)
  const [saved, setSaved] = useState(false)

  function toggleInList(list: Toggle[], setter: (t: Toggle[]) => void, key: string) {
    setter(list.map((t) => (t.key === key ? { ...t, on: !t.on } : t)))
  }

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <PageHeader
        kicker="Coach · Settings"
        title="Team · visibility · sync"
        subtitle={`${team.name} · invite ${team.inviteCode} · everything on this page maps to team_settings.*`}
      />

      <div className="flex items-center gap-3 px-5 sm:px-10 pb-4">
        <button
          type="button"
          onClick={save}
          className="rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02]"
          style={{
            background: THEME.primary,
            color: THEME.white,
            fontFamily: THEME.fontMono,
            boxShadow: '0 12px 30px -14px rgba(5,150,105,0.5)',
          }}
        >
          Save changes
        </button>
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: THEME.primary, fontFamily: THEME.fontMono }}
          >
            ✓ Saved
          </motion.span>
        )}
      </div>

      <div className="grid gap-4 px-5 sm:px-10 xl:grid-cols-2">
        <SettingsCard
          kicker="Team"
          title="Identity"
          description="Displayed on the coach sidebar and in every athlete invite."
        >
          <Field label="Team name" defaultValue={team.name} />
          <Field label="Sport" defaultValue={team.sport} />
          <Field label="Invite code" defaultValue={team.inviteCode} mono suffix={<span className="text-[10px]" style={{color: THEME.textMuted, fontFamily: THEME.fontMono}}>rotate</span>} />
        </SettingsCard>

        <SettingsCard
          kicker="Sync"
          title="Default connector cadence"
          description="Defaults applied to every newly-connected source. Per-source overrides live in the synth. Agent."
        >
          <Field
            label="Default scan cron"
            defaultValue={scanCron}
            onChange={setScanCron}
            mono
          />
          <Field
            label="Stale threshold (hours)"
            defaultValue={String(staleHours)}
            onChange={(v) => setStaleHours(parseInt(v, 10) || 48)}
            mono
          />
        </SettingsCard>
      </div>

      <div className="mt-4 px-5 sm:px-10">
        <SettingsCard
          kicker="Athlete visibility"
          title="What athletes can see"
          description="Enforces team_settings.athlete_visibility_json. Changes apply immediately."
        >
          <ToggleList
            toggles={visibility}
            onToggle={(key) => toggleInList(visibility, setVisibility, key)}
          />
        </SettingsCard>
      </div>

      <div className="mt-4 px-5 sm:px-10">
        <SettingsCard
          kicker="Notifications"
          title="Alerts & digests"
          description="Per-user preferences stored on user_settings.notification_prefs_json."
        >
          <ToggleList
            toggles={notifs}
            onToggle={(key) => toggleInList(notifs, setNotifs, key)}
          />
        </SettingsCard>
      </div>
    </div>
  )
}

function SettingsCard({
  kicker,
  title,
  description,
  children,
}: {
  kicker: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background: THEME.white,
        borderColor: THEME.border,
        boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
      }}
    >
      <div
        className="text-[9px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        {kicker}
      </div>
      <div className="mt-1 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
        {title}
      </div>
      <p className="mt-0.5 text-[11px]" style={{ color: THEME.textSecondary }}>
        {description}
      </p>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </div>
  )
}

function Field({
  label,
  defaultValue,
  mono,
  onChange,
  suffix,
}: {
  label: string
  defaultValue: string
  mono?: boolean
  onChange?: (v: string) => void
  suffix?: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1">
      <span
        className="text-[9px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          defaultValue={defaultValue}
          onChange={(e) => onChange?.(e.target.value)}
          className="flex-1 rounded-lg border px-3 py-2 text-[13px] outline-none transition-colors focus:border-emerald-600"
          style={{
            background: THEME.light,
            borderColor: THEME.border,
            color: THEME.textPrimary,
            fontFamily: mono ? THEME.fontMono : THEME.fontSans,
          }}
        />
        {suffix}
      </div>
    </label>
  )
}

function ToggleList({
  toggles,
  onToggle,
}: {
  toggles: Toggle[]
  onToggle: (key: string) => void
}) {
  return (
    <div className="flex flex-col divide-y" style={{ borderColor: THEME.border }}>
      {toggles.map((t, i) => (
        <div
          key={t.key}
          className="flex items-center justify-between py-3"
          style={{
            borderTop: i === 0 ? 'none' : `1px solid ${THEME.border}`,
            paddingTop: i === 0 ? 0 : 12,
          }}
        >
          <div>
            <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
              {t.label}
            </div>
            <div className="mt-0.5 text-[11px]" style={{ color: THEME.textSecondary }}>
              {t.detail}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onToggle(t.key)}
            className="flex h-6 w-11 items-center rounded-full p-0.5 transition-colors"
            style={{ background: t.on ? THEME.primary : THEME.border }}
          >
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              className="block h-5 w-5 rounded-full bg-white shadow-sm"
              style={{ marginLeft: t.on ? 18 : 0 }}
            />
          </button>
        </div>
      ))}
    </div>
  )
}
