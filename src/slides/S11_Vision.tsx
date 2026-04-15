import { PaperTexture } from '../components/PaperTexture'
import { SectionLabel } from '../components/SectionLabel'
import { TopNav } from '../components/TopNav'
import { THEME } from '../lib/theme'

function ZoneCard({
  kicker,
  title,
  children,
  accent,
}: {
  kicker: string
  title: string
  children: React.ReactNode
  accent: string
}) {
  return (
    <div
      className="rounded-xl p-5 h-full flex flex-col"
      style={{
        background: THEME.white,
        border: `1px solid ${THEME.border}`,
        borderTop: `3px solid ${accent}`,
        boxShadow: '0 4px 24px rgba(24,24,27,0.06)',
      }}
    >
      <div className="text-[10px] tracking-[0.2em] uppercase font-bold mb-1" style={{ fontFamily: THEME.fontMono, color: accent }}>
        {kicker}
      </div>
      <div className="text-[17px] font-bold leading-tight mb-3" style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}>
        {title}
      </div>
      <div className="text-[13px] leading-[1.55] flex-1" style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary }}>
        {children}
      </div>
    </div>
  )
}

function ScaleStep({ step, label, detail }: { step: string; label: string; detail: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
        style={{ fontFamily: THEME.fontMono, background: `${THEME.primary}18`, color: THEME.primaryDarker }}
      >
        {step}
      </div>
      <div>
        <div className="text-[13px] font-semibold leading-tight" style={{ fontFamily: THEME.fontSans, color: THEME.textPrimary }}>
          {label}
        </div>
        <div className="text-[11px] mt-0.5 leading-snug" style={{ fontFamily: THEME.fontSans, color: THEME.textMuted }}>
          {detail}
        </div>
      </div>
    </div>
  )
}

function MarketTile({ label, sub }: { label: string; sub: string }) {
  return (
    <div
      className="rounded-lg px-2.5 py-2 text-center flex-1 min-w-0"
      style={{ background: THEME.light, border: `1px solid ${THEME.border}` }}
    >
      <div className="text-[9px] font-bold tracking-[0.06em] uppercase leading-tight" style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}>
        {label}
      </div>
      <div className="text-[8px] mt-1 leading-snug" style={{ fontFamily: THEME.fontSans, color: THEME.textMuted }}>
        {sub}
      </div>
    </div>
  )
}

export function S11_Vision() {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ padding: '44px 40px 32px', color: THEME.textPrimary, background: THEME.light }}>
      <PaperTexture strength={0.5} tint="rgba(255,255,255,0.92)" />
      <TopNav section="VISION" page="15 / 17" tone="light" />

      <div className="relative z-10 flex-1 min-h-0 flex flex-col max-w-[1200px] mx-auto w-full">
        <SectionLabel text="10 · VISION" className="!text-[11px]" />

        <div className="mt-3 max-w-[900px]">
          <h1
            className="text-[clamp(28px,3.2vw,40px)] font-bold leading-[1.05] tracking-[-0.04em] uppercase"
            style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
          >
            Custom base apps.
            <br />
            One synth layer.
            <br />
            <span style={{ color: THEME.primaryDarker }}>Every program.</span>
          </h1>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          <ZoneCard kicker="01" title="What we’re building" accent={THEME.primary}>
            <p>
              An <strong style={{ color: THEME.textPrimary }}>agentic data synthesis</strong> layer: your organization’s own base app on top, every
              existing tool plugged in underneath, nothing replaced, everything read and unified.
            </p>
          </ZoneCard>

          <ZoneCard kicker="02" title="How we scale" accent={THEME.cyan}>
            <div className="space-y-3">
              <ScaleStep step="1" label="Rowing" detail="Depth and proof (now)" />
              <ScaleStep step="2" label="Team & Olympic sports" detail="Parallel expansion" />
              <ScaleStep step="3" label="Individual sports · large rosters" detail="Tennis, track, swim, and similar" />
              <ScaleStep step="4" label="Enterprise" detail="Partners ship their own surface on the same layer" />
            </div>
          </ZoneCard>
        </div>

        <div
          className="mt-4 rounded-lg px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          style={{ background: `${THEME.primary}0d`, border: `1px solid ${THEME.primary}33` }}
        >
          <div className="text-[10px] tracking-[0.18em] uppercase font-bold" style={{ fontFamily: THEME.fontMono, color: THEME.primaryDarker }}>
            North star
          </div>
          <p className="text-[12px] leading-[1.45] sm:text-right sm:max-w-[80%]" style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}>
            Same synth engine everywhere, more sports and larger orgs until any program meets us through product or enterprise.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch pb-1">
          <div
            className="lg:col-span-4 rounded-xl p-5 flex flex-col justify-center"
            style={{
              background: THEME.white,
              border: `1px solid ${THEME.border}`,
              borderLeft: `4px solid ${THEME.purple}`,
              boxShadow: '0 2px 16px rgba(24,24,27,0.05)',
            }}
          >
            <div className="text-[15px] font-semibold leading-snug" style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}>
              &ldquo;Your base app. Our synth layer.&rdquo;
            </div>
            <p className="mt-2 text-[12px] leading-[1.5]" style={{ fontFamily: THEME.fontSans, color: THEME.textMuted }}>
              Read everything. Replace nothing.
            </p>
          </div>

          <div
            className="lg:col-span-8 rounded-xl p-4 flex flex-col justify-center"
            style={{ background: THEME.white, border: `1px solid ${THEME.border}`, boxShadow: '0 2px 16px rgba(24,24,27,0.05)' }}
          >
            <div className="text-[9px] tracking-[0.2em] uppercase font-bold mb-2 text-center" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
              Inputs → layer → outcome
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              <MarketTile label="Rowing" sub="Now" />
              <MarketTile label="Team / Olympic" sub="Next" />
              <MarketTile label="Individual · rosters" sub="Then" />
              <MarketTile label="Enterprise" sub="Deploy" />
            </div>
            <div className="flex justify-center my-1">
              <div className="h-6 w-px bg-gradient-to-b from-transparent via-zinc-300 to-transparent" />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <div
                className="w-[100px] h-[100px] sm:w-32 sm:h-32 rounded-2xl flex flex-col items-center justify-center shrink-0"
                style={{
                  background: `${THEME.primary}10`,
                  border: `2px solid ${THEME.primary}`,
                  boxShadow: `0 8px 28px ${THEME.primary}22`,
                }}
              >
                <div className="text-[22px] sm:text-[26px] font-bold" style={{ fontFamily: THEME.logoFont, fontWeight: THEME.logoWeight, color: THEME.textPrimary }}>
                  synth<span style={{ color: THEME.logoDotColor }}>.</span>
                </div>
                <div className="text-[8px] mt-1 tracking-[0.14em] uppercase font-semibold" style={{ fontFamily: THEME.fontMono, color: THEME.primaryDarker }}>
                  Synth layer
                </div>
              </div>
              <div className="hidden sm:block text-zinc-300 text-lg font-mono">→</div>
              <div
                className="rounded-lg px-5 py-3 text-center max-w-[220px]"
                style={{ background: THEME.light, border: `1px solid ${THEME.border}` }}
              >
                <div className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ fontFamily: THEME.fontMono, color: THEME.primaryDarker }}>
                  Complete picture
                </div>
                <div className="text-[10px] mt-1 leading-snug" style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary }}>
                  Every athlete · Every source · Every morning
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
