import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PageShell, StandardHero, KO,
  Hairlines, Crosshairs, SectionLabel, PlaceholderMedia,
  FeaturedQuote, ClosingCta,
} from '../shell/primitives'
import {
  BG, FG, MUTED, HAIR, GREEN, DRUK, MONO,
} from '../shell/tokens'

const SPORTS = [
  { slug: 'running',  name: 'Running',   tagline: 'Sub-3 marathons. Sub-18 5Ks. Ultras.', capabilities: ['Strava + TrainingPeaks unified', 'Race countdown & taper view', 'Recovery readiness gating hard days'] },
  { slug: 'cycling',  name: 'Cycling',   tagline: 'FTP, threshold, VO2. Zwift + outdoor.', capabilities: ['Power + HR + cadence normalized', 'TrainerRoad / Wahoo plan sync', 'Acute:chronic load by week'] },
  { slug: 'swimming', name: 'Swimming',  tagline: 'Pool sets and open water. Meet weeks.', capabilities: ['Apple Watch / Garmin / Coros unified', 'Set planning + send-off tracking', 'Soreness map for shoulder + back'] },
  { slug: 'rowing',   name: 'Rowing',    tagline: 'Built by rowers. Erg + on-water + boats.', capabilities: ['Concept2 Logbook sync', '2K + seat-race tracking', 'Lineup builder writes to Sheets'] },
  { slug: 'lifting',  name: 'Lifting',   tagline: 'Powerlifting, Olympic, hybrid, gym.', capabilities: ['TrainHeroic / TrueCoach / Volt sync', 'Big-three PR engine over years', 'Volume × intensity dashboards'] },
  { slug: 'teams',    name: 'Teams',     tagline: 'Clubs, schools, programs of any size.', capabilities: ['Lineup builder with PR + wellness in view', 'Two-way sync — no rip-and-replace', 'Athlete-facing app, visibility you control'] },
]

export function SportsHubPage() {
  return (
    <PageShell active="sports">
      <StandardHero
        eyebrow="more than a tracker. beyond a generic dashboard."
        headline={<>Synth for every <KO>sport</KO></>}
        subhead="Connect the tools you already use. Train smarter. Race honestly. synth supports running, cycling, swimming, rowing, lifting, and team programs — with deep integrations into each."
        primaryCta={{ label: 'start free', to: '/signup' }}
        secondaryCta={{ label: 'see the platform', to: '/platform' }}
        media={{
          kind: 'photo',
          label: 'Multi-sport athletes — composite mosaic',
          caption: 'A composite of amateur athletes across running, cycling, swimming, rowing, lifting. Six photos in a grid OR one composite collage.',
        }}
      />

      {/* Knockout band */}
      <section className="relative overflow-hidden border-t border-b px-5 sm:px-10 py-16" style={{ background: BG, borderColor: HAIR }}>
        <Hairlines />
        <div className="relative z-10 mx-auto w-full max-w-[1280px] text-center">
          <h2
            className="leading-[1.0] tracking-[-0.015em]"
            style={{ fontFamily: DRUK, fontSize: 'clamp(32px, 5vw, 64px)', textTransform: 'uppercase' }}
          >
            Unify your <KO>data</KO>, your <KO>tools</KO>, your <KO>training</KO>.
          </h2>
        </div>
      </section>

      {/* Sport accordion (visual style — full-width tiles) */}
      <section className="relative" style={{ background: BG }}>
        <SectionLabel>// every sport synth covers</SectionLabel>
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-10">
          {SPORTS.map((s, i) => (
            <SportRow key={s.slug} sport={s} index={i} />
          ))}
        </div>
      </section>

      <FeaturedQuote
        quote="synth was born in rowing. It scales because every signal it watches is the same shape no matter the sport — load in, load out, recovery in between."
        attribution="Abishai Gosula"
        role="Founder · synth"
      />

      <ClosingCta
        headline={<>Pick your <KO>sport</KO>. Start free.</>}
        primary={{ label: 'start free', to: '/signup' }}
        secondary={{ label: 'see the platform', to: '/platform' }}
      />
    </PageShell>
  )
}

function SportRow({
  sport,
  index,
}: {
  sport: { slug: string; name: string; tagline: string; capabilities: string[] }
  index: number
}) {
  const flip = index % 2 === 1
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
      className="relative grid gap-10 border-t py-16 sm:py-24 lg:grid-cols-2 lg:items-center"
      style={{ borderColor: HAIR }}
    >
      <Crosshairs count={2} opacity={0.3} />

      <div className={flip ? 'lg:order-2' : ''}>
        <PlaceholderMedia
          kind="photo"
          label={`${sport.name} — amateur athlete photo`}
          ratio="5/4"
        />
      </div>

      <div className={flip ? 'lg:order-1' : ''}>
        <div className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
          // {sport.slug}
        </div>
        <h3
          className="mt-4 leading-[0.92] tracking-[-0.015em]"
          style={{ fontFamily: DRUK, fontSize: 'clamp(36px, 5.5vw, 80px)', textTransform: 'uppercase', color: FG }}
        >
          {sport.name}<span style={{ color: GREEN }}>.</span>
        </h3>
        <p className="mt-4 max-w-[480px] text-[15px]" style={{ color: MUTED }}>
          {sport.tagline}
        </p>
        <ul className="mt-6 space-y-2.5" style={{ fontFamily: MONO }}>
          {sport.capabilities.map(c => (
            <li key={c} className="flex items-start gap-3 text-[13px]" style={{ color: FG }}>
              <span className="mt-2 inline-block h-px w-3 shrink-0" style={{ background: GREEN }} />
              <span>{c}</span>
            </li>
          ))}
        </ul>
        <div className="mt-7">
          <Link
            to={`/sports/${sport.slug}`}
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition-opacity hover:opacity-80"
            style={{ fontFamily: MONO, color: GREEN }}
          >
            learn more <span aria-hidden>›</span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

