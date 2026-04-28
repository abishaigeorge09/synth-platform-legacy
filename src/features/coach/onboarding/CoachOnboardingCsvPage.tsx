import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { THEME } from '../../../lib/theme'
import { useCoachOnboardingStore } from '../../../shared/store/useCoachOnboardingStore'
import { useRosterOverridesStore } from '../../../shared/store/useRosterOverridesStore'
import { toast } from '../../../shared/store/useToastStore'
import type { Athlete } from '../../../shared/data/types'
import { useTeamStore } from '../../../shared/store/useTeamStore'
import type { AthleteYear } from '../../../shared/data/types'
import { OnboardingShell } from '../../../shared/components/OnboardingShell'

function downloadCsvTemplate() {
  const rows = [
    'name,side,status,year',
    '"First Last",port,active,2027',
    '"First Last",starboard,active,2028',
  ].join('\n')
  const blob = new Blob([rows], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'synth-roster-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const header = lines[0]?.toLowerCase() ?? ''
  const hasHeader = header.includes('name') && header.includes('side')
  const start = hasHeader ? 1 : 0
  const out: Array<{ name: string; side: 'port' | 'starboard'; status: 'active' | 'inactive'; year?: string }> = []
  for (const line of lines.slice(start)) {
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''))
    const name = cols[0] ?? ''
    const side = (cols[1] ?? 'port') as 'port' | 'starboard'
    const status = (cols[2] ?? 'active') as 'active' | 'inactive'
    const year = cols[3] ? String(cols[3]) : undefined
    if (!name) continue
    out.push({ name, side: side === 'starboard' ? 'starboard' : 'port', status: status === 'inactive' ? 'inactive' : 'active', year })
  }
  return out
}

function parseYear(raw?: string): AthleteYear | undefined {
  if (!raw) return undefined
  const v = raw.trim().toUpperCase()
  if (v === 'FR' || v === 'SO' || v === 'JR' || v === 'SR' || v === 'GR') return v
  return undefined
}

export function CoachOnboardingCsvPage() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement | null>(null)
  const setCsvUploaded = useCoachOnboardingStore((s) => s.setCsvUploaded)
  const addMany = useRosterOverridesStore((s) => s.addMany)
  const [lastFile, setLastFile] = useState<string | null>(null)
  const [sheetUrl, setSheetUrl] = useState('')
  const teamId = useTeamStore((s) => s.activeTeam.id)

  const canContinue = useMemo(
    () => !!lastFile || (sheetUrl.trim().startsWith('http') && sheetUrl.length > 12),
    [lastFile, sheetUrl],
  )

  async function handleFile(file: File) {
    setLastFile(null)
    const text = await file.text()
    const rows = parseCsv(text)
    if (!rows.length) {
      toast('No athlete rows found in CSV', 'error')
      return
    }
    const athletes: Athlete[] = rows.map((r, idx) => ({
      id: `athlete-import-${Date.now()}-${idx}`,
      userId: `user-athlete-import-${Date.now()}-${idx}`,
      teamId,
      name: r.name,
      side: r.side,
      status: r.status,
      year: parseYear(r.year),
      avatarColorIndex: idx % 8,
    }))
    addMany(athletes)
    setCsvUploaded(true)
    setLastFile(file.name)
    toast(`Imported ${athletes.length} athletes (demo)`, 'success')
  }

  function cont() {
    if (lastFile) {
      navigate('/coach/onboarding/sources')
      return
    }
    if (sheetUrl.trim().startsWith('http')) {
      setCsvUploaded(true)
      toast('We will use your sheet in the next connector step (demo).', 'success')
      navigate('/coach/onboarding/sources')
    }
  }

  return (
    <OnboardingShell
      kicker="Coach setup"
      title="Import your roster"
      subtitle="CSV upload or a public Sheet URL (demo)."
      illustration="dataStreams"
      stepIndex={2}
      totalSteps={4}
      backTo="/coach/onboarding/team"
    >
      <label className="grid w-full max-w-md gap-1.5 text-left">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
          Google Sheet URL (optional)
        </span>
        <input
          type="url"
          value={sheetUrl}
          onChange={(e) => setSheetUrl(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/..."
          className="w-full rounded-xl border px-4 py-3 text-[13px] outline-none"
          style={{ borderColor: THEME.border, color: THEME.textPrimary, background: 'var(--bg-primary)' }}
        />
      </label>
      <div className="my-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
        or
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={downloadCsvTemplate}
          className="rounded-full border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-colors hover:bg-zinc-50"
          style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textPrimary, fontFamily: THEME.fontMono }}
        >
          Download template
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider"
          style={{ background: THEME.primary, color: THEME.white, fontFamily: THEME.fontMono }}
        >
          Upload CSV
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void handleFile(f)
          }}
        />
      </div>

      {lastFile && (
        <div className="mt-3 text-center text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          Imported: {lastFile}
        </div>
      )}

      <div className="mt-6 flex items-center justify-end gap-2 border-t pt-4" style={{ borderColor: THEME.border }}>
        <button
          type="button"
          disabled={!canContinue}
          onClick={cont}
          className="rounded-full px-6 py-3 text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50"
          style={{ background: THEME.primary, color: THEME.white, fontFamily: THEME.fontMono }}
        >
          Continue
        </button>
      </div>
    </OnboardingShell>
  )
}

