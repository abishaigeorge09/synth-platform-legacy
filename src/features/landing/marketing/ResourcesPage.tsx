import { motion } from 'framer-motion'
import {
  PageShell, KO,
  Hairlines, Crosshairs, SectionLabel, PlaceholderMedia,
} from '../shell/primitives'
import {
  BG, FG, MUTED, DIM, HAIR, GREEN, DRUK, MONO,
} from '../shell/tokens'

const CATEGORIES = ['all', 'guides', 'blog', 'video', 'podcasts'] as const

const RESOURCES = [
  { tag: 'guide',   title: 'How synth scores recovery readiness',           snippet: 'The 0-100 number explained. Inputs, weights, why your HRV trend matters more than today\'s reading.' },
  { tag: 'guide',   title: 'Acute:chronic load for amateur athletes',       snippet: 'The math elite sport scientists use, simplified for the runner training around a 9-to-5.' },
  { tag: 'blog',    title: 'Why your training data shouldn\'t live in six apps', snippet: 'A short post on the cost of fragmented data — and how the picture changes when you unify it.' },
  { tag: 'video',   title: 'Connecting your first source in 60 seconds',    snippet: 'Walkthrough of the OAuth handshake for Whoop, Strava, and Google Sheets.' },
  { tag: 'guide',   title: 'Reading the synth dashboard',                   snippet: 'What each panel means, what to act on, what to ignore.' },
  { tag: 'blog',    title: 'How Star Miller used synth before U23 Worlds',  snippet: 'A real athlete\'s synth log in the lead-up to a medal.' },
  { tag: 'podcast', title: 'Berkeley SkyDeck — synth interview',            snippet: 'Founder Abishai Gosula on starting the data layer for sports.' },
  { tag: 'video',   title: 'AI Import — read any chart, voice, or paste',   snippet: 'A demo of how synth ingests data that doesn\'t have an API.' },
  { tag: 'guide',   title: 'The case for two-way sync',                     snippet: 'Why we read AND write back to your existing tools — and what that means for switching cost.' },
]

export function ResourcesPage() {
  return (
    <PageShell active="resources">
      {/* Top hero — simpler than module heroes */}
      <section className="relative overflow-hidden px-5 sm:px-10 pt-32 pb-16 sm:pt-40" style={{ background: BG, color: FG }}>
        <Hairlines />
        <Crosshairs count={5} opacity={0.4} />
        <div className="relative z-10 mx-auto w-full max-w-[1280px]">
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
            // resources
          </div>
          <h1
            className="mt-5 tracking-[-0.015em]"
            style={{ fontFamily: DRUK, fontSize: 'clamp(56px, 9vw, 144px)', textTransform: 'uppercase', lineHeight: 1.02 }}
          >
            How synth <KO>thinks</KO>.
          </h1>
          <p className="mt-6 max-w-[640px] text-[15px] leading-relaxed" style={{ color: MUTED }}>
            Guides, blog posts, videos, and podcast conversations from the team that builds synth and the athletes that use it.
          </p>

          {/* Filter chips */}
          <div className="mt-10 flex flex-wrap items-center gap-2">
            {CATEGORIES.map(c => (
              <span
                key={c}
                className="px-4 py-2 text-[10px] uppercase tracking-[0.22em]"
                style={{
                  border: `1px solid ${c === 'all' ? GREEN : HAIR}`,
                  background: c === 'all' ? 'rgba(16,185,129,0.08)' : 'transparent',
                  color: c === 'all' ? GREEN : MUTED,
                  fontFamily: MONO,
                }}
              >
                {c}
              </span>
            ))}
            <span className="ml-3 text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: DIM }}>
              filters wired in next iteration
            </span>
          </div>
        </div>
      </section>

      {/* Resource grid */}
      <section className="relative border-t px-5 sm:px-10 py-20" style={{ background: BG, borderColor: HAIR }}>
        <SectionLabel>// latest</SectionLabel>
        <div className="mx-auto mt-10 grid w-full max-w-[1280px] gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map((r, i) => (
            <motion.article
              key={r.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: (i % 3) * 0.05 }}
              className="flex flex-col gap-4"
              style={{ background: BG }}
            >
              <div className="relative">
                <PlaceholderMedia
                  kind={r.tag === 'video' ? 'video' : r.tag === 'podcast' ? 'illustration' : 'photo'}
                  label={`${r.tag} thumb — ${r.title}`}
                  ratio="16/9"
                />
                <span
                  className="absolute top-3 left-3 px-2 py-1 text-[9px] uppercase tracking-[0.22em]"
                  style={{ background: GREEN, color: '#000', fontFamily: MONO }}
                >
                  {r.tag}
                </span>
              </div>
              <div
                className="leading-[1.04] tracking-[-0.005em]"
                style={{ fontFamily: DRUK, fontSize: 22, textTransform: 'uppercase', color: FG }}
              >
                {r.title}
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: MUTED }}>
                {r.snippet}
              </p>
              <span className="mt-auto text-[10px] uppercase tracking-[0.22em]" style={{ fontFamily: MONO, color: GREEN }}>
                read now ›
              </span>
            </motion.article>
          ))}
        </div>
      </section>

    </PageShell>
  )
}
