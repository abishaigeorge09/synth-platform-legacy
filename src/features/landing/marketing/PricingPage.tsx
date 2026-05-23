import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInstallPrompt } from '../useInstallPrompt'
import {
  PageShell, KO, Hairlines, Crosshairs, SectionLabel,
  PrimaryButton, OutlineButton,
} from '../shell/primitives'
import {
  BG, FG, MUTED, DIM, HAIR, GREEN, DRUK, MONO, BODY,
} from '../shell/tokens'

const TIERS = [
  {
    tier: 'Athlete',
    price: '$9',
    unit: '/mo',
    tagline: 'individual training',
    feats: [
      '12+ direct integrations',
      'recovery, training & progress modules',
      'synth AI · 100 questions / mo',
      'mobile PWA on any device',
      'export your data any time',
    ],
    cta: { label: 'start free', to: '/signup' },
  },
  {
    tier: 'Athlete Pro',
    price: '$19',
    unit: '/mo',
    tagline: '+ unlimited AI · API · trends',
    feats: [
      'everything in Athlete',
      'unlimited synth AI',
      'API access on your tenant',
      'custom CSV / Parquet export',
      'long-arc trend engine + PR pacing',
    ],
    featured: true,
    cta: { label: 'go pro', to: '/signup' },
  },
  {
    tier: 'Team',
    price: '$199+',
    unit: '/mo',
    tagline: 'clubs · schools · programs',
    feats: [
      'lineup builder + 2-way sync',
      '$199/mo for ≤30 athletes',
      '$499/mo for ≤100 athletes',
      'collegiate tier from $15K/yr',
      'priority support + onboarding',
    ],
    cta: { label: 'talk to us', to: 'mailto:supportsynth@gmail.com' },
  },
]

const PRICING_FAQS = [
  { q: 'is there a free trial?', a: 'free during the entire alpha. no credit card. you stay free for as long as we\'re asking for feedback — pricing only kicks in once you tell us you want to keep it for the season.' },
  { q: 'can i cancel any time?', a: 'yes. cancel from settings or by emailing us. your data exports back to whichever tool you came from — sheets, training peaks, concept2 logbook, etc.' },
  { q: 'do team plans include athlete seats?', a: 'yes. team plan covers up to 30 athlete seats; team+ covers up to 100. each athlete gets their own login, the athlete-facing mobile app, and visibility you control.' },
  { q: 'what counts as a question on Athlete?', a: 'a single AI question. follow-up turns inside one conversation still count as one. 100/mo is generous — most athletes use 20-40.' },
  { q: 'do you offer student / amateur discounts?', a: 'yes. send us a screenshot of your athlete id or amateur registration and we\'ll give you Athlete Pro at $9/mo for a year.' },
  { q: 'what about programs over 100 athletes?', a: 'we run collegiate and federation tiers from $15K/yr. these include white-glove onboarding, custom integrations, and FERPA/HECVAT compliance work. email us.' },
]

export function PricingPage() {
  const { canInstall, installed, isIos, trigger } = useInstallPrompt()
  const [showIosTip, setShowIosTip] = useState(false)

  function handleStart() {
    if (canInstall) { trigger(); return }
    if (isIos) { setShowIosTip(true); return }
    setShowIosTip(true)
  }

  return (
    <PageShell active="pricing" onStart={handleStart} ctaLabel={installed ? 'installed' : 'start free'}>
      {/* Hero */}
      <section
        className="relative overflow-hidden px-5 sm:px-10 pt-32 pb-16 sm:pt-40"
        style={{ background: BG, color: FG }}
      >
        <Hairlines />
        <Crosshairs count={4} opacity={0.4} />

        <div className="relative z-10 mx-auto w-full max-w-[1280px] text-center">
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
            // pricing
          </div>
          <h1
            className="mx-auto mt-5 max-w-[1080px] tracking-[-0.015em]"
            style={{ fontFamily: DRUK, fontSize: 'clamp(48px, 8vw, 128px)', textTransform: 'uppercase', lineHeight: 1.02 }}
          >
            Start <KO>free</KO>. Pick your tier when you're ready.
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-[15px] leading-relaxed" style={{ color: MUTED }}>
            Free during the alpha. No credit card. Your data is yours — export back to the tool you came from at any time.
          </p>
        </div>
      </section>

      {/* Tier grid */}
      <section className="relative border-t px-5 sm:px-10 py-16 sm:py-24" style={{ background: BG, color: FG, borderColor: HAIR }}>
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="grid gap-px sm:grid-cols-3" style={{ background: HAIR }}>
            {TIERS.map((t, i) => (
              <motion.div
                key={t.tier}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className="relative flex flex-col gap-5 p-8"
                style={{
                  background: BG,
                  borderTop: t.featured ? `2px solid ${GREEN}` : 'none',
                  boxShadow: t.featured ? `inset 0 0 60px rgba(16,185,129,0.05)` : 'none',
                }}
              >
                {t.featured && (
                  <div
                    className="absolute right-3 top-3 px-2 py-1 text-[9px] uppercase tracking-[0.22em]"
                    style={{ background: GREEN, color: '#000', fontFamily: MONO }}
                  >
                    most popular
                  </div>
                )}

                <div className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: t.featured ? GREEN : DIM }}>
                  {t.tier}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="leading-none" style={{ fontFamily: DRUK, fontSize: 72, color: FG }}>
                    {t.price}
                  </span>
                  <span className="text-[13px]" style={{ fontFamily: MONO, color: MUTED }}>{t.unit}</span>
                </div>
                <div className="text-[12px] uppercase tracking-[0.22em]" style={{ fontFamily: MONO, color: MUTED }}>
                  {t.tagline}
                </div>
                <ul className="space-y-2 pt-2" style={{ fontFamily: MONO }}>
                  {t.feats.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px]" style={{ color: FG }}>
                      <span className="mt-2 inline-block h-px w-3 shrink-0" style={{ background: GREEN }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-4">
                  {t.cta.to.startsWith('mailto:') ? (
                    <a
                      href={t.cta.to}
                      className="inline-flex items-center gap-2 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
                      style={{
                        background: t.featured ? GREEN : 'transparent',
                        color: t.featured ? '#000' : FG,
                        border: t.featured ? 'none' : `1px solid ${HAIR}`,
                        fontFamily: MONO,
                      }}
                    >
                      {t.cta.label} →
                    </a>
                  ) : t.featured ? (
                    <PrimaryButton onClick={handleStart}>{t.cta.label} →</PrimaryButton>
                  ) : (
                    <OutlineButton onClick={handleStart}>{t.cta.label} →</OutlineButton>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center text-[11px] uppercase tracking-[0.22em]" style={{ fontFamily: MONO, color: DIM }}>
            all tiers · no credit card during alpha · cancel any time · export your data
          </div>
        </div>
      </section>

      {/* What's included across all tiers */}
      <section className="relative border-t px-5 sm:px-10 py-24 sm:py-32" style={{ background: BG, color: FG, borderColor: HAIR }}>
        <Hairlines />
        <SectionLabel>// included in every tier</SectionLabel>
        <div className="mx-auto mt-10 grid w-full max-w-[1280px] gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: HAIR }}>
          {[
            { t: '12+ integrations', d: 'Whoop, Strava, Oura, Garmin, Apple Health + more.' },
            { t: 'AI Import', d: 'Photos, voice notes, pasted text — for everything without an API.' },
            { t: 'Your data, your tenant', d: 'You decide what\'s public, per metric.' },
            { t: 'Mobile PWA', d: 'One-tap install on iPhone, iPad, Android, desktop.' },
          ].map(item => (
            <div key={item.t} className="flex flex-col gap-3 p-7" style={{ background: BG, fontFamily: MONO }}>
              <div className="flex h-7 w-7 items-center justify-center text-[12px]" style={{ border: `1px solid ${GREEN}`, color: GREEN }}>+</div>
              <div className="text-[16px] uppercase tracking-[0.01em]" style={{ color: FG, fontFamily: DRUK }}>{item.t}</div>
              <div className="text-[12px] leading-relaxed" style={{ color: MUTED, fontFamily: BODY }}>{item.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="relative border-t px-5 sm:px-10 py-24 sm:py-32" style={{ background: BG, color: FG, borderColor: HAIR }}>
        <SectionLabel>// pricing questions</SectionLabel>
        <div className="mx-auto mt-12 w-full max-w-[820px]">
          <div className="grid gap-px sm:grid-cols-1" style={{ background: HAIR }}>
            {PRICING_FAQS.map((f, i) => (
              <motion.div
                key={f.q}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="flex flex-col gap-2 p-6"
                style={{ background: BG, fontFamily: MONO }}
              >
                <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: GREEN }}>q.0{i + 1}</div>
                <div className="text-[15px] leading-snug" style={{ color: FG }}>{f.q}</div>
                <div className="text-[13px] leading-relaxed" style={{ color: MUTED, fontFamily: BODY }}>→ {f.a}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {showIosTip && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-5 sm:items-center" onClick={() => setShowIosTip(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} />
          <div className="relative w-full max-w-sm border p-6" style={{ background: BG, borderColor: GREEN, fontFamily: MONO }} onClick={e => e.stopPropagation()}>
            <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: GREEN }}>install synth</div>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: FG }}>
              tap <strong style={{ color: GREEN }}>share</strong> then <strong style={{ color: GREEN }}>add to home screen</strong> in safari.
            </p>
            <button
              type="button"
              onClick={() => setShowIosTip(false)}
              className="mt-5 w-full px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.32em]"
              style={{ background: GREEN, color: '#000', fontFamily: MONO }}
            >
              got it →
            </button>
          </div>
        </div>
      )}
    </PageShell>
  )
}
