import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PageShell, StandardHero, ValueBridge, KO,
  Hairlines, Crosshairs, SectionLabel, Chevron, PlaceholderMedia,
  FeaturedQuote, IntegrationsStrip,
} from '../shell/primitives'
import {
  BG, FG, MUTED, DIM, HAIR, GREEN, DRUK, MONO,
} from '../shell/tokens'

const MODULES = [
  { slug: 'synth-core',           name: 'synth Core',            sub: 'the foundational data layer' },
  { slug: 'recovery-health',      name: 'Recovery & Health',     sub: 'HRV · sleep · injury lifecycle' },
  { slug: 'training-load',        name: 'Training & Load',       sub: 'plan, prescribe, execute, review' },
  { slug: 'progress-development', name: 'Progress & Development',sub: 'PRs · trends · season pacing' },
  { slug: 'team-operations',      name: 'Team Operations',       sub: 'lineups · schedules · attendance' },
  { slug: 'custom-analytics',     name: 'Custom Analytics',      sub: 'bespoke models · 4–12 week engagements' },
  { slug: 'integrations',         name: 'Integrations',          sub: '12+ direct · AI Import for everything else' },
  { slug: 'api',                  name: 'API',                   sub: 'read, write, build on your tenant' },
]

const SPORTS = [
  { slug: 'running',  name: 'Running',  sub: 'sub-3 marathons · sub-18 5Ks · ultras' },
  { slug: 'cycling',  name: 'Cycling',  sub: 'FTP · threshold · indoor + outdoor' },
  { slug: 'swimming', name: 'Swimming', sub: 'pool sets · open water · meet weeks' },
  { slug: 'rowing',   name: 'Rowing',   sub: 'erg · on-water · seat races · lineups' },
  { slug: 'lifting',  name: 'Lifting',  sub: 'powerlifting · Olympic · hybrid' },
  { slug: 'teams',    name: 'Teams',    sub: 'clubs · schools · programs' },
]

export function PlatformHubPage() {
  return (
    <PageShell active="platform" canvas="dark">
      <StandardHero
        eyebrow="more than a tracker. beyond a dashboard."
        headline={<>Synth <KO>Intelligence Platform</KO></>}
        subhead="The connective tissue under every signal an athlete or a team generates. One codebase. One data model. One calendar across every sport, every wearable, every spreadsheet."
        primaryCta={{ label: 'start free', to: '/signup' }}
        secondaryCta={{ label: 'watch demo', to: '/coach/dashboard' }}
        media={{
          kind: 'illustration',
          label: 'Platform overview diagram — 12 sources into synth, 8 modules out',
          caption: 'Hub-and-spoke schematic of the platform.',
        }}
      />

      {/* Intro split — synth core paragraph + product mock */}
      <ValueBridge
        eyebrow="the intelligence platform"
        headline={<>Aggregate thousands of signals. <KO>act on the few that matter.</KO></>}
        body="synth is cloud-based, sport-agnostic, and connector-driven. It pulls every signal your training generates — wearables, training apps, video, coach spreadsheets — into a single data model and surfaces what each signal means about your week, your season, and your next decision."
        media={{
          kind: 'screenshot',
          label: 'Platform overview — calendar + dashboard + recovery card',
          caption: 'Composite product mock showing the unified surface.',
        }}
      />

      {/* Modules grid */}
      <section className="relative overflow-hidden border-t px-5 sm:px-10 py-24 sm:py-32" style={{ background: BG, borderColor: HAIR }}>
        <Hairlines />
        <Crosshairs count={4} opacity={0.4} />
        <SectionLabel>// modules in the platform</SectionLabel>

        <div className="relative z-10 mx-auto mt-12 w-full max-w-[1280px]">
          <h2
            className="tracking-[-0.015em]"
            style={{ fontFamily: DRUK, fontSize: 'clamp(40px, 6vw, 88px)', textTransform: 'uppercase', lineHeight: 1.05 }}
          >
            Transform how your <KO>training operates</KO>.
          </h2>
          <div className="mt-3 flex items-center justify-between">
            <p className="max-w-[560px] text-[14px] leading-relaxed" style={{ color: MUTED }}>
              Eight modules. Each independently useful. Together: a complete picture of you, your week, or your program.
            </p>
            <Chevron to="/sports">explore all sports</Chevron>
          </div>

          <div className="mt-12 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: HAIR }}>
            {MODULES.map((m, i) => (
              <motion.div
                key={m.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: (i % 4) * 0.04 }}
                style={{ background: BG }}
              >
                <Link
                  to={`/platform/${m.slug}`}
                  className="group flex h-full flex-col gap-3 p-6 transition-colors"
                  style={{ color: FG }}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center" style={{ border: `1px solid ${GREEN}`, color: GREEN, fontFamily: MONO, fontSize: 11 }}>+</span>
                    <span className="text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: DIM }}>module 0{i + 1}</span>
                  </div>
                  <div
                    className="leading-[1.04] tracking-[-0.005em]"
                    style={{ fontFamily: DRUK, fontSize: 26, textTransform: 'uppercase' }}
                  >
                    {m.name}
                  </div>
                  <div className="text-[12px] uppercase tracking-[0.18em]" style={{ fontFamily: MONO, color: MUTED }}>
                    {m.sub}
                  </div>
                  <div className="mt-auto pt-3 text-[11px] uppercase tracking-[0.22em] transition-colors group-hover:opacity-100" style={{ fontFamily: MONO, color: GREEN, opacity: 0.85 }}>
                    learn more ›
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <IntegrationsStrip />

      {/* Sports grid */}
      <section className="relative overflow-hidden border-t px-5 sm:px-10 py-24 sm:py-32" style={{ background: BG, borderColor: HAIR }}>
        <Hairlines />
        <SectionLabel>// sports</SectionLabel>

        <div className="relative z-10 mx-auto mt-12 w-full max-w-[1280px]">
          <h2
            className="tracking-[-0.015em]"
            style={{ fontFamily: DRUK, fontSize: 'clamp(36px, 5vw, 72px)', textTransform: 'uppercase', lineHeight: 1.05 }}
          >
            Support every <KO>athlete</KO>, every <KO>team</KO>.
          </h2>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SPORTS.map((s, i) => (
              <motion.div
                key={s.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: (i % 3) * 0.05 }}
              >
                <Link to={`/sports/${s.slug}`} className="group block">
                  <PlaceholderMedia
                    kind="photo"
                    label={`${s.name} — amateur athlete photo`}
                    ratio="4/3"
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div
                        className="leading-[1.04] tracking-[-0.005em]"
                        style={{ fontFamily: DRUK, fontSize: 24, textTransform: 'uppercase', color: FG }}
                      >
                        {s.name}
                      </div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.22em]" style={{ fontFamily: MONO, color: MUTED }}>
                        {s.sub}
                      </div>
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.22em]" style={{ fontFamily: MONO, color: GREEN }}>
                      learn ›
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FeaturedQuote
        quote="synth flagged my HRV drop a week before I would have. We pulled back load that Tuesday — race weekend was still on."
        attribution="Star Miller"
        role="Cal Women's Rowing · AUS U23"
      />

    </PageShell>
  )
}
