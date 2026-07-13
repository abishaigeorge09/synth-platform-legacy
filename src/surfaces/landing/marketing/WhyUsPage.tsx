import { motion } from 'framer-motion'
import {
  PageShell, StandardHero, KO,
  Hairlines, Crosshairs, SectionLabel,
} from '../shell/primitives'
import { BackedBy } from '../shell/BackedBy'
import {
  BG, FG, MUTED, HAIR, GREEN, DRUK, MONO,
} from '../shell/tokens'

const TEAM = [
  { name: 'Abishai Gosula',  role: 'founder & CEO',     image: '/team/abishai.jpeg', focus: '50% 30%', cred: ['CS · UC Berkeley', 'ex AITA tennis athlete'] },
  { name: 'Matthew Waddell', role: 'co-founder & COO',  image: '/team/matthew.png',  focus: '22% 35%', cred: ['2025 U23 Worlds silver · NZ rowing', 'Cal Men\'s Rowing · admitted Cambridge'] },
  { name: 'Star Miller',     role: 'co-founder & CCO',  image: '/team/star.png',     focus: '50% 30%', cred: ['Cal Women\'s Rowing', 'AUS · U23 Worlds'] },
  { name: 'Lily Pember',     role: 'co-founder & CSO',  image: '/team/lily.png',     focus: '50% 25%', cred: ['Cal Women\'s Rowing', 'USA · Junior World gold'] },
]

const TIMELINE = [
  { year: '2024', label: 'born from the boat', body: 'Abishai and a small group of athletes start building synth at Berkeley, frustrated by data living in five apps and a notes file.' },
  { year: '2025', label: 'pacific women\'s alpha', body: 'Pacific Women\'s Rowing runs synth as the first alpha team. 46 athletes, 5 sources, one screen.' },
  { year: '2025', label: 'skydeck pad-13 batch 22', body: 'synth is accepted into Berkeley SkyDeck, the university\'s flagship accelerator.' },
  { year: '2026', label: 'public alpha', body: '250+ athletes on the alpha. Eight platform modules live. Six sport templates shipped.' },
]

export function WhyUsPage() {
  return (
    <PageShell active="why-us">
      <StandardHero
        eyebrow="from the field to the future"
        headline={<>Built by the people who <KO>lived this problem</KO>.</>}
        subhead="Synth was started by Berkeley engineers who train serious. The advisory bench competes at the World Championship level. The product is shaped by the athletes it serves, not the analysts who measure them."
        primaryCta={{ label: 'start free', to: '/signup' }}
        secondaryCta={{ label: 'see the platform', to: '/platform' }}
        media={{
          kind: 'photo',
          label: 'Founder + advisor portrait or team-on-water shot',
          caption: 'A photo that anchors the "real athletes" claim — boat shed, gym, sunrise launch.',
        }}
      />

      {/* Manifesto */}
      <section className="relative overflow-hidden border-t px-5 sm:px-10 py-24 sm:py-32" style={{ background: BG, borderColor: HAIR }}>
        <Hairlines />
        <Crosshairs count={4} opacity={0.35} />
        <SectionLabel align="center">// our manifesto</SectionLabel>
        <div className="relative z-10 mx-auto mt-12 max-w-[920px] text-center">
          <h2
            className="tracking-[-0.01em]"
            style={{ fontFamily: DRUK, fontSize: 'clamp(36px, 6vw, 88px)', textTransform: 'uppercase', lineHeight: 1.08 }}
          >
            Your training shouldn't live in <KO>six apps</KO>.<br />
            <span style={{ color: MUTED }}>Your story shouldn't either.</span>
          </h2>
          <p className="mt-8 text-[16px] leading-relaxed" style={{ color: FG }}>
            We started synth because the picture of an athlete — what worked, what hurt, what came next — was scattered across tools that didn't talk to each other.
            Whoop knew our sleep. Strava knew our miles. The coach knew our lineup. The spreadsheet knew our 2K. No one place knew us.
          </p>
          <p className="mt-5 text-[16px] leading-relaxed" style={{ color: MUTED }}>
            So we built the layer that does. synth is calm, analytical, and direct.
            We don't motivate you. We don't gamify you. We show you the picture, and we stay out of the way.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative overflow-hidden border-t px-5 sm:px-10 py-24 sm:py-32" style={{ background: BG, borderColor: HAIR }}>
        <Hairlines />
        <SectionLabel>// the path</SectionLabel>
        <div className="relative z-10 mx-auto mt-12 w-full max-w-[1080px]">
          <h2
            className="tracking-[-0.015em]"
            style={{ fontFamily: DRUK, fontSize: 'clamp(40px, 6vw, 80px)', textTransform: 'uppercase', lineHeight: 1.05 }}
          >
            From the <KO>boat</KO> to the <KO>build</KO>.
          </h2>

          <div className="mt-12 relative">
            {/* spine */}
            <div className="absolute left-[18px] top-0 bottom-0 w-px" style={{ background: HAIR }} />
            <ul className="flex flex-col gap-10">
              {TIMELINE.map((t, i) => (
                <motion.li
                  key={t.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="relative pl-14"
                >
                  <span
                    className="absolute left-[10px] top-2 flex h-[18px] w-[18px] items-center justify-center rounded-full"
                    style={{ background: BG, border: `2px solid ${GREEN}` }}
                  />
                  <div className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
                    {t.year}
                  </div>
                  <div
                    className="mt-2 leading-[1.04] tracking-[-0.005em]"
                    style={{ fontFamily: DRUK, fontSize: 28, textTransform: 'uppercase', color: FG }}
                  >
                    {t.label}
                  </div>
                  <p className="mt-3 max-w-[640px] text-[14px] leading-relaxed" style={{ color: MUTED }}>
                    {t.body}
                  </p>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Team grid */}
      <section className="relative overflow-hidden border-t px-5 sm:px-10 py-24 sm:py-32" style={{ background: BG, borderColor: HAIR }}>
        <Hairlines />
        <SectionLabel>// the team</SectionLabel>
        <div className="relative z-10 mx-auto mt-12 w-full max-w-[1280px]">
          <h2
            className="tracking-[-0.015em]"
            style={{ fontFamily: DRUK, fontSize: 'clamp(40px, 6vw, 88px)', textTransform: 'uppercase', lineHeight: 1.05 }}
          >
            Built by <KO>champions</KO>.
          </h2>
          <div className="mt-12 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: HAIR }}>
            {TEAM.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="flex flex-col gap-3 p-7"
                style={{ background: BG }}
              >
                <div
                  className="relative overflow-hidden"
                  style={{ aspectRatio: '1 / 1', background: '#0f0f10', border: `1px solid ${HAIR}` }}
                >
                  <img
                    src={m.image}
                    alt={`${m.name} portrait`}
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: m.focus }}
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.35) 100%)' }}
                  />
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
                  {m.role}
                </div>
                <div
                  className="leading-[1.04] tracking-[-0.005em]"
                  style={{ fontFamily: DRUK, fontSize: 24, textTransform: 'uppercase', color: FG }}
                >
                  {m.name}
                </div>
                <ul className="space-y-1.5" style={{ fontFamily: MONO }}>
                  {m.cred.map(c => (
                    <li key={c} className="flex items-start gap-2 text-[11px]" style={{ color: MUTED }}>
                      <span className="mt-2 inline-block h-px w-2 shrink-0" style={{ background: GREEN }} />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <BackedBy />
    </PageShell>
  )
}
