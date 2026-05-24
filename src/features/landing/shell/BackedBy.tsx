import { motion } from 'framer-motion'
import {
  BG, FG, MUTED, DIM, HAIR, GREEN, DRUK, MONO,
} from './tokens'
import { Hairlines, SectionLabel } from './primitives'
import { DotGridHover } from './DotGridHover'

/**
 * "Backed by" trust strip — surfaces our accelerator + startup-program
 * affiliations as proper logo cards (real brand artwork from /public/logos/
 * backers/, not text wordmarks).
 *
 * Card backgrounds match each logo's designed-for context:
 *  - Berkeley SkyDeck stacked lockup is designed for Berkeley Blue ground
 *  - Microsoft + Google "for Startups" marks sit on white
 */

const BERKELEY_BLUE = '#003262'

type Backer = {
  name: string
  src: string
  /** Background of the logo card */
  bg: string
  /** Logo height — kept identical across cards so the marks read as a row */
  logoHeight: number
  /** Label under the card */
  label: string
  /** Optional anchor — clicking the card opens the program page in a new tab */
  href?: string
}

const BACKERS: Backer[] = [
  {
    name: 'Berkeley SkyDeck',
    src: '/logos/backers/berkeley-skydeck.svg',
    bg: BERKELEY_BLUE,
    logoHeight: 82,
    label: 'Berkeley SkyDeck',
    href: 'https://skydeck.berkeley.edu/',
  },
  {
    name: 'Pad-13',
    src: '/logos/backers/pad-13.svg',
    bg: '#ffffff',
    logoHeight: 64,
    label: 'Pad-13 · Batch 22',
    href: 'https://skydeck.berkeley.edu/',
  },
  {
    name: 'Microsoft for Startups',
    src: '/logos/backers/microsoft-for-startups.png',
    bg: '#ffffff',
    logoHeight: 56,
    label: 'Microsoft for Startups',
    href: 'https://www.microsoft.com/en-us/startups',
  },
  {
    name: 'Google for Startups',
    src: '/logos/backers/google-for-startups.png',
    bg: '#ffffff',
    logoHeight: 72,
    label: 'Google for Startups',
    href: 'https://startup.google.com/',
  },
  {
    name: 'NVIDIA Inception',
    src: '/logos/backers/nvidia-inception.svg',
    bg: '#ffffff',
    logoHeight: 78,
    label: 'NVIDIA Inception',
    href: 'https://www.nvidia.com/en-us/startups/',
  },
]

export function BackedBy({ variant = 'section' }: { variant?: 'section' | 'inline' }) {
  if (variant === 'inline') {
    return (
      <div className="relative z-10 mt-12 w-full">
        <div className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
          // backed by
        </div>
        <BackerGrid />
      </div>
    )
  }

  return (
    <section
      className="relative overflow-hidden border-t px-5 sm:px-10 py-20 sm:py-24"
      style={{ background: BG, color: FG, borderColor: HAIR }}
    >
      <Hairlines />
      <SectionLabel>// backed by</SectionLabel>

      <div className="relative z-10 mx-auto mt-10 w-full max-w-[1280px]">
        <h2
          className="tracking-[-0.015em]"
          style={{
            fontFamily: DRUK,
            fontSize: 'clamp(32px, 4.6vw, 64px)',
            textTransform: 'uppercase',
            lineHeight: 1.05,
          }}
        >
          Built with the support of <span style={{ color: MUTED }}>operators who back</span>{' '}
          serious <span style={{ color: MUTED }}>founders</span>.
        </h2>

        <BackerGrid />
      </div>
    </section>
  )
}

function BackerGrid() {
  return (
    <div
      className="mt-10 grid gap-px sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
      style={{ background: HAIR }}
    >
      {BACKERS.map((b, i) => {
        const Card = (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="relative flex flex-col items-center gap-5 px-6 py-10"
            style={{ background: BG }}
          >
            <DotGridHover />
            <div
              className="relative z-10 flex h-[130px] w-full max-w-[280px] items-center justify-center rounded-[6px] px-6"
              style={{ background: b.bg }}
            >
              <img
                src={b.src}
                alt={`${b.name} logo`}
                style={{ height: b.logoHeight, width: 'auto', maxWidth: '100%' }}
                loading="lazy"
              />
            </div>
            <div
              className="relative z-10 text-[11px] uppercase tracking-[0.28em]"
              style={{ fontFamily: MONO, color: DIM }}
            >
              {b.label}
            </div>
          </motion.div>
        )
        return b.href ? (
          <a key={b.name} href={b.href} target="_blank" rel="noreferrer" className="block transition-opacity hover:opacity-90">
            {Card}
          </a>
        ) : (
          <div key={b.name}>{Card}</div>
        )
      })}
    </div>
  )
}
