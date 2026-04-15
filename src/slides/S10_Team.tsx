import { PaperTexture } from '../components/PaperTexture'
import { SectionLabel } from '../components/SectionLabel'
import { TopNav } from '../components/TopNav'
import { THEME } from '../lib/theme'

function TeamMember({
  name,
  title,
  bullets,
  accent,
  photoSrc,
  photoObjectPosition = 'center top',
}: {
  name: string
  title: string
  bullets: string[]
  accent: string
  photoSrc?: string
  /** Where to anchor `object-fit: cover` so head + shoulders read clearly (varies by source crop). */
  photoObjectPosition?: string
}) {
  return (
    <div className="flex min-w-0 gap-6 items-start h-full justify-center">
      <div
        className="relative shrink-0 w-[176px] aspect-[3/4] rounded-2xl overflow-hidden"
        style={{ background: `${THEME.light}`, border: `1px solid ${THEME.border}` }}
      >
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: photoObjectPosition }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: `${accent}08` }}>
            <span className="text-[10px] tracking-[0.12em] uppercase font-medium" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
              Photo
            </span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 max-w-[340px] flex flex-col justify-start pt-0.5">
        <div className="text-[19px] font-bold leading-tight" style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}>
          {name}
        </div>
        <div className="mt-1 text-[11px] tracking-[0.14em] uppercase font-semibold" style={{ fontFamily: THEME.fontMono, color: accent }}>
          {title}
        </div>
        <ul className="mt-2.5 space-y-2">
          {bullets.map((b) => (
            <li key={b} className="text-[13px] leading-[1.5] pl-3 border-l-2" style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary, borderColor: `${accent}55` }}>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function S10_Team() {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ padding: '44px 44px 32px', color: THEME.textPrimary, background: THEME.light }}>
      <TopNav section="09 · TEAM" page="14 / 17" tone="light" />
      <PaperTexture strength={0.65} tint="rgba(255,255,255,0.97)" />

      <div className="flex-1 flex flex-col items-center min-h-0 w-full">
        <SectionLabel text="09 · TEAM" className="!text-[12px] text-center" />

        {/* Reserves the same vertical space as the former headline (section label → grid). */}
        <h1
          className="mt-3 text-[36px] leading-[1.1] font-bold max-w-[920px] text-center invisible pointer-events-none select-none"
          style={{ fontFamily: THEME.fontMono, letterSpacing: '-0.05em', color: THEME.textPrimary }}
          aria-hidden={true}
        >
          We didn&apos;t discover this problem through research. We lived it.
        </h1>

        <div className="mt-6 flex-1 min-h-0 w-full max-w-[1100px] grid grid-cols-2 grid-rows-2 gap-x-12 gap-y-6 items-start justify-items-center content-center">
          <TeamMember
            name="Abishai Gosula"
            title="Co-founder"
            accent={THEME.primary}
            photoSrc="/team/abishai-gosula.png"
            photoObjectPosition="center 22%"
            bullets={[
              'Fractional founder of Elsheph Systems',
              'SAP Scholarship Holder ’26',
              'ISF Scholarship holder ’25',
              'ISF Dubai Tech Summit winner',
            ]}
          />
          <TeamMember
            name="Star Rose"
            title="Co-founder"
            accent={THEME.cyan}
            photoSrc="/team/star-rose.png"
            photoObjectPosition="center top"
            bullets={[
              'Cal Women’s Rowing',
              'Australian U23 Women’s Eight · 2024 World Rowing U23 Championships',
              'St. Catharines, Canada · Sydney Rowing Club',
            ]}
          />
          <TeamMember
            name="Lily Pember"
            title="Co-founder"
            accent={THEME.purple}
            photoSrc="/team/lily-pember.png"
            photoObjectPosition="center top"
            bullets={[
              'Cal Women’s Rowing',
              'Gold medalist · Junior World Rowing Championships (USA)',
              'Competed at the highest junior international level',
            ]}
          />
          <TeamMember
            name="Matthew Waddell"
            title="Co-founder"
            accent={THEME.amber}
            photoSrc="/team/matthew-waddell.png"
            photoObjectPosition="center top"
            bullets={[
              'Cal Men’s Rowing',
              'Silver medalist · U23 World Rowing Championships (New Zealand)',
              'Competed at the highest U23 international level',
            ]}
          />
        </div>

        <p className="mt-6 text-[15px] italic text-center max-w-[720px]" style={{ fontFamily: THEME.fontSerif, color: THEME.textMuted }}>
          We&apos;ve lived the problem. Now we&apos;re building the solution.
        </p>
      </div>
    </div>
  )
}
