import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../dashboard/components/PageHeader'
import { THEME } from '@lib/theme'
import { useTeamStore } from '@shared/store/useTeamStore'
import { toast } from '@shared/store/useToastStore'
import { useThemeStore } from '@shared/store/useThemeStore'

type Toggle = { key: string; label: string; detail: string; on: boolean }

const STORAGE_KEY = 'synth:settings'

const DEFAULT_VISIBILITY: Toggle[] = [
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
  {
    key: 'showErgRankings',
    label: 'Athletes can see erg rankings',
    detail: 'Team 2K ladder and anonymized distribution',
    on: true,
  },
  {
    key: 'showSessionMedia',
    label: 'Athletes can download session media',
    detail: 'Videos and exports from shared folder',
    on: false,
  },
  {
    key: 'allowScheduleOptIn',
    label: 'Athletes can opt into calendar sync',
    detail: 'Personal Google Calendar for travel and exams',
    on: true,
  },
]

const DEFAULT_NOTIFICATIONS: Toggle[] = [
  { key: 'pushLineup', label: 'Push on lineup publish', detail: 'Coach + athletes get a push', on: true },
  { key: 'emailDaily', label: 'Daily email digest', detail: '09:00 PT morning summary', on: true },
  { key: 'alertWellness', label: 'Wellness alert threshold', detail: 'Low-recovery flagged below 50%', on: true },
  { key: 'alertSync', label: 'Stale source alert', detail: 'Connector silent for > 48h', on: false },
]

type PersistedSettings = {
  visibility: Record<string, boolean>
  notifications: Record<string, boolean>
  scanCron: string
  staleHours: number
  sheetUrl: string
}

function readSettings(): PersistedSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedSettings
  } catch {
    return null
  }
}

function writeSettings(s: PersistedSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch { /* quota / private-mode */ }
}

function hydrateToggles(defaults: Toggle[], saved: Record<string, boolean> | undefined): Toggle[] {
  if (!saved) return defaults
  return defaults.map((t) => (t.key in saved ? { ...t, on: saved[t.key] } : t))
}

export function SettingsPage() {
  const team = useTeamStore((s) => s.activeTeam)
  const setActiveTeam = useTeamStore((s) => s.setActiveTeam)
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const [persisted] = useState(() => readSettings())
  const [teamName, setTeamName] = useState(team.name)
  const [teamSport, setTeamSport] = useState(team.sport)
  const [visibility, setVisibility] = useState(() =>
    hydrateToggles(DEFAULT_VISIBILITY, persisted?.visibility),
  )
  const [notifs, setNotifs] = useState(() =>
    hydrateToggles(DEFAULT_NOTIFICATIONS, persisted?.notifications),
  )
  const [scanCron, setScanCron] = useState(persisted?.scanCron ?? '0 18 * * *')
  const [staleHours, setStaleHours] = useState(persisted?.staleHours ?? 48)
  const [sheetUrl, setSheetUrl] = useState(
    persisted?.sheetUrl ?? 'https://docs.google.com/spreadsheets/d/rowing_women_ergs',
  )

  function toggleInList(list: Toggle[], setter: (t: Toggle[]) => void, key: string) {
    setter(list.map((t) => (t.key === key ? { ...t, on: !t.on } : t)))
  }

  function save() {
    const toMap = (list: Toggle[]) =>
      Object.fromEntries(list.map((t) => [t.key, t.on]))
    writeSettings({
      visibility: toMap(visibility),
      notifications: toMap(notifs),
      scanCron,
      staleHours,
      sheetUrl,
    })
    setActiveTeam({ ...team, name: teamName, sport: teamSport })
    toast('Settings saved')
  }

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <PageHeader
        kicker="Settings"
        title="Team & access"
        subtitle={`${team.name} · invite ${team.inviteCode}`}
      />

      <div className="flex items-center gap-3 px-5 sm:px-10 pb-4">
        <div
          className="inline-flex items-center rounded-full border p-0.5"
          style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}
        >
          <button
            type="button"
            onClick={() => setTheme('light')}
            className="theme-hover-surface rounded-full border border-transparent px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              fontFamily: THEME.fontMono,
              background: theme === 'light' ? THEME.primary : 'transparent',
              color: theme === 'light' ? THEME.white : THEME.textSecondary,
            }}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className="theme-hover-surface rounded-full border border-transparent px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              fontFamily: THEME.fontMono,
              background: theme === 'dark' ? THEME.primary : 'transparent',
              color: theme === 'dark' ? THEME.white : THEME.textSecondary,
            }}
          >
            Dark
          </button>
          <button
            type="button"
            onClick={() => setTheme('system')}
            className="theme-hover-surface rounded-full border border-transparent px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              fontFamily: THEME.fontMono,
              background: theme === 'system' ? THEME.primary : 'transparent',
              color: theme === 'system' ? THEME.white : THEME.textSecondary,
            }}
          >
            System
          </button>
        </div>
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
      </div>

      <div className="grid gap-4 px-5 sm:px-10 xl:grid-cols-2">
        <SettingsCard
          kicker="Team"
          title="Identity"
          description="Displayed on the coach sidebar and in every athlete invite."
        >
          <Field label="Team name" defaultValue={teamName} onChange={setTeamName} />
          <Field label="Sport" defaultValue={teamSport} onChange={setTeamSport} />
          <Field label="Invite code" defaultValue={team.inviteCode} mono suffix={<span className="text-[10px]" style={{color: THEME.textMuted, fontFamily: THEME.fontMono}}>rotate</span>} />
          <label className="mt-3 flex flex-col gap-1">
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
              Primary erg workbook URL
            </span>
            <input
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              className="rounded-lg border px-3 py-2 text-[13px] outline-none"
              style={{ background: THEME.light, borderColor: THEME.border, color: THEME.textPrimary, fontFamily: THEME.fontMono }}
            />
          </label>
        </SettingsCard>

        <SettingsCard
          kicker="Sync"
          title="Default connector cadence"
          description="Defaults applied to every newly-connected source. Per-source overrides live in the synth. Agent."
        >
          <SyncFrequencySelect value={scanCron} onChange={setScanCron} />
          <StaleThresholdSelect value={staleHours} onChange={setStaleHours} />
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

const SYNC_FREQUENCIES = [
  { cron: '0 */4 * * *', label: 'Every 4 hours' },
  { cron: '0 */6 * * *', label: 'Every 6 hours' },
  { cron: '0 */12 * * *', label: 'Every 12 hours' },
  { cron: '0 18 * * *', label: 'Daily at 6 PM' },
  { cron: '0 6 * * *', label: 'Daily at 6 AM' },
  { cron: '0 6,18 * * *', label: 'Twice daily (6 AM + 6 PM)' },
  { cron: '0 0 * * 1', label: 'Weekly (Mon midnight)' },
]

const STALE_THRESHOLDS = [
  { hours: 12, label: '12 hours' },
  { hours: 24, label: '24 hours' },
  { hours: 48, label: '48 hours' },
  { hours: 72, label: '3 days' },
  { hours: 168, label: '1 week' },
]

function SyncFrequencySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span
        className="text-[9px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        Default scan frequency
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border px-3 py-2 text-[13px] outline-none transition-colors focus:border-emerald-600"
        style={{
          background: THEME.light,
          borderColor: THEME.border,
          color: THEME.textPrimary,
          fontFamily: THEME.fontMono,
        }}
      >
        {SYNC_FREQUENCIES.map((f) => (
          <option key={f.cron} value={f.cron}>{f.label}</option>
        ))}
        {!SYNC_FREQUENCIES.some((f) => f.cron === value) && (
          <option value={value}>Custom: {value}</option>
        )}
      </select>
    </label>
  )
}

function StaleThresholdSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span
        className="text-[9px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        Stale source threshold
      </span>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="rounded-lg border px-3 py-2 text-[13px] outline-none transition-colors focus:border-emerald-600"
        style={{
          background: THEME.light,
          borderColor: THEME.border,
          color: THEME.textPrimary,
          fontFamily: THEME.fontMono,
        }}
      >
        {STALE_THRESHOLDS.map((t) => (
          <option key={t.hours} value={t.hours}>{t.label}</option>
        ))}
        {!STALE_THRESHOLDS.some((t) => t.hours === value) && (
          <option value={value}>Custom: {value}h</option>
        )}
      </select>
    </label>
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
        background: 'var(--bg-primary)',
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
            aria-label={`Toggle ${t.label}`}
            role="switch"
            aria-checked={t.on}
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
