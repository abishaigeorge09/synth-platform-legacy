import { APP_THEME } from './lib/theme'

type StubProps = {
  label: string
  phase: 'B' | 'C' | 'D' | 'E' | 'F'
  reference: string
}

function Stub({ label, phase, reference }: StubProps) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center"
      style={{ background: APP_THEME.canvas }}
    >
      <span
        className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
        style={{
          fontFamily: APP_THEME.fontMono,
          color: APP_THEME.brand,
          borderColor: APP_THEME.brandWash,
          background: APP_THEME.brandWashSoft,
        }}
      >
        Phase {phase}
      </span>
      <h1
        className="text-[26px] font-semibold leading-tight"
        style={{ fontFamily: APP_THEME.fontSerif, color: APP_THEME.text }}
      >
        {label}
      </h1>
      <p
        className="max-w-[280px] text-[13px] leading-[1.5]"
        style={{ fontFamily: APP_THEME.fontSans, color: APP_THEME.textMuted }}
      >
        Stub — built in Phase {phase}.
      </p>
      <p
        className="max-w-[280px] text-[11px] uppercase tracking-[0.12em]"
        style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textFaint }}
      >
        Reference · {reference}
      </p>
    </div>
  )
}

// — Coach stubs (Phase E / F) —

export const AppCoachCapturePage = () => (
  <Stub label="Capture" phase="E" reference="Arc Search + new synthesis" />
)
export const AppCoachLineupsPage = () => (
  <Stub label="Lineups" phase="F" reference="Existing /coach/tools/lineups" />
)
export const AppCoachNotesPage = () => (
  <Stub label="Notes" phase="F" reference="GO Club [18]" />
)
export const AppCoachSourcesPage = () => (
  <Stub label="Sources" phase="F" reference="Cal AI [5, 21]" />
)
export const AppCoachSettingsPage = () => (
  <Stub label="Settings" phase="F" reference="GO Club [84–87]" />
)

// — Athlete (Phase D / E / F) —

export const AppAthleteHomePage = () => (
  <Stub label="Athlete home" phase="D" reference="GO Club [12] · existing AthleteCard" />
)
export const AppAthleteAIPage = () => (
  <Stub label="synth. AI" phase="D" reference="Claude iOS [0]" />
)
export const AppAthleteErgPacerPage = () => (
  <Stub label="Erg pacer" phase="D" reference="GO Club [13] + existing session timer" />
)
export const AppAthleteCapturePage = () => (
  <Stub label="Capture" phase="E" reference="Arc Search + GO Club [45, 46]" />
)
export const AppAthleteNotesPage = () => (
  <Stub label="Notes from coach" phase="F" reference="New (provenance-first)" />
)
export const AppAthleteSourcesPage = () => (
  <Stub label="My sources" phase="F" reference="Cal AI [5]" />
)
export const AppAthleteSettingsPage = () => (
  <Stub label="Settings" phase="F" reference="GO Club [84–87]" />
)
