import { useParams, Link } from 'react-router-dom'
import { PageShell, KO, Hairlines, Crosshairs, SectionLabel } from '../landing/shell/primitives'
import { BG, FG, MUTED, DIM, HAIR, GREEN, DRUK, MONO, BODY } from '../landing/shell/tokens'

/** Placeholder legal page. Renders content for /legal/privacy,
 *  /legal/terms, /legal/security, /legal/sub-processors via the :slug
 *  route param. Drop real legal text into the LEGAL_CONTENT map below
 *  when it lands — no routing changes needed. */

type LegalContent = {
  title: string
  eyebrow: string
  intro: string
  sections: { heading: string; body: string }[]
}

const LEGAL_CONTENT: Record<string, LegalContent> = {
  privacy: {
    title: 'Privacy Policy',
    eyebrow: '// privacy',
    intro: 'We are drafting a full privacy policy. The summary below explains how synth handles your data today during the alpha; the full policy will replace this page before the beta opens.',
    sections: [
      { heading: 'What we collect', body: 'Email + name (optional) when you join the waitlist. Email + password (or Google OAuth profile) when you create an account. The data from any tool you connect (Whoop, Strava, Oura, Garmin, Apple Health, Google Sheets, Google Calendar, Notion, etc.) once you authorize the connection.' },
      { heading: 'How we use it', body: 'To run the product (synthesize your signals into a unified dashboard, surface patterns, answer your AI questions). We do not sell your data. We do not share your data with third parties for marketing.' },
      { heading: 'Where it lives', body: 'Your data is stored in your own Supabase tenant in the United States. You can request a full export or full deletion any time by emailing support.' },
      { heading: 'Athletes vs coaches', body: 'When you are an athlete on a team, your coach sees only the metrics you choose to share. Defaults are conservative — you opt in to visibility per metric.' },
      { heading: 'Questions or requests', body: 'Email supportsynth@gmail.com. We respond within 72 hours during the alpha.' },
    ],
  },
  terms: {
    title: 'Terms of Service',
    eyebrow: '// terms',
    intro: 'We are drafting a full Terms of Service. The summary below outlines the alpha-period agreement; the full document will replace this page before the beta opens.',
    sections: [
      { heading: 'Acceptable use', body: 'Use synth for the purpose it is built for — synthesizing your own training data, or for athletes on a team where you have authorization. Do not use it to scrape, resell, or harvest data from others without their consent.' },
      { heading: 'Service availability', body: 'The alpha runs best-effort. We aim for 99% uptime but make no SLA. Scheduled maintenance is communicated in-app.' },
      { heading: 'Your data, your control', body: 'You own your data. You can export it any time. You can delete your account and all associated data by emailing support; we comply within 30 days.' },
      { heading: 'Pricing during the alpha', body: 'Free for the first three programs and for individual athletes. Pricing detailed on /pricing applies when you choose to upgrade or when we open the beta.' },
      { heading: 'Termination', body: 'You can stop using synth at any time. We may terminate accounts that violate the acceptable-use clause above.' },
    ],
  },
  security: {
    title: 'Security & Compliance',
    eyebrow: '// security',
    intro: 'Security posture summary. Full SOC 2 Type II and HECVAT documentation will land here before the institutional tier opens.',
    sections: [
      { heading: 'Infrastructure', body: 'Hosted on Vercel (edge) + Supabase (Postgres + auth + realtime) in US regions. TLS 1.2+ in transit, AES-256 at rest. Daily automated backups with 7-day retention.' },
      { heading: 'Authentication', body: 'Email + password with bcrypt hashing, Google OAuth (when enabled), magic-link options. Anonymous sessions for demo browsing. Row-level security on every public table; no direct table access from the anon role.' },
      { heading: 'Data minimization', body: 'We pull only the fields necessary to compute your synth views. Raw connector tokens are encrypted with a per-tenant key.' },
      { heading: 'Audit + monitoring', body: 'Every auth event lands in auth.audit_log_entries. Every Edge Function call is logged. Anomalies trigger an alert to the engineering team.' },
      { heading: 'Disclosure', body: 'Suspect a vulnerability? Email supportsynth@gmail.com with details. We respond within 24 hours and credit responsible disclosure.' },
    ],
  },
  'sub-processors': {
    title: 'Sub-Processors',
    eyebrow: '// sub-processors',
    intro: 'Third-party services synth uses to run the product. Each is listed with its purpose and the data it processes.',
    sections: [
      { heading: 'Supabase', body: 'Database, authentication, realtime, and storage. Processes: email, password hash, profile metadata, all connector data, all synth-derived metrics. Region: US (us-east-2).' },
      { heading: 'Vercel', body: 'Static asset hosting and Edge Function execution. Processes: HTTP request metadata, anonymized analytics. No PII stored at rest.' },
      { heading: 'Anthropic (Claude API)', body: 'Powers the synth AI chat. Processes: the questions you ask + the relevant rows from your data needed to answer. Anthropic does not train on API traffic.' },
      { heading: 'Google (OAuth)', body: 'OAuth identity provider when you choose Continue-with-Google. Processes: your Google email, display name, profile photo.' },
      { heading: 'PostHog', body: 'Product analytics for understanding how athletes use the platform. Processes: anonymized usage events keyed to a session ID. No raw training data.' },
      { heading: 'Connector providers', body: 'Whoop, Strava, Oura, Garmin, Apple Health, Google Sheets, Google Calendar, Notion — only when you authorize each connection. synth reads on your behalf using the OAuth token you grant.' },
    ],
  },
}

export function LegalPage() {
  const { slug = 'privacy' } = useParams<{ slug: string }>()
  const content = LEGAL_CONTENT[slug] ?? LEGAL_CONTENT.privacy

  return (
    <PageShell canvas="dark">
      <section
        className="relative overflow-hidden px-5 sm:px-10 pt-32 pb-12 sm:pt-40"
        style={{ background: BG, color: FG }}
      >
        <Hairlines />
        <Crosshairs count={3} opacity={0.35} />

        <div className="relative z-10 mx-auto w-full max-w-[820px]">
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
            {content.eyebrow}
          </div>
          <h1
            className="mt-5 tracking-[-0.015em]"
            style={{ fontFamily: DRUK, fontSize: 'clamp(40px, 6vw, 80px)', textTransform: 'uppercase', lineHeight: 1.05 }}
          >
            <KO>{content.title}</KO>
          </h1>

          <p className="mt-6 text-[14px] leading-relaxed" style={{ fontFamily: BODY, color: MUTED }}>
            {content.intro}
          </p>
        </div>
      </section>

      <section
        className="relative px-5 sm:px-10 py-16 sm:py-24"
        style={{ background: BG, borderTop: `1px solid ${HAIR}` }}
      >
        <SectionLabel>// summary</SectionLabel>

        <div className="mx-auto mt-10 grid w-full max-w-[820px] gap-px" style={{ background: HAIR }}>
          {content.sections.map((s, i) => (
            <div key={s.heading} className="flex flex-col gap-3 p-7" style={{ background: BG }}>
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.28em]" style={{ fontFamily: MONO, color: GREEN }}>
                <span>0{i + 1}</span>
                <span className="h-px w-6" style={{ background: HAIR }} />
              </div>
              <div
                className="leading-[1.04]"
                style={{ fontFamily: DRUK, fontSize: 22, textTransform: 'uppercase', color: FG }}
              >
                {s.heading}
              </div>
              <p className="text-[13px] leading-relaxed" style={{ fontFamily: BODY, color: MUTED }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 flex w-full max-w-[820px] items-center justify-between text-[11px] uppercase tracking-[0.28em]" style={{ fontFamily: MONO, color: DIM }}>
          <Link to="/" className="transition-colors hover:text-white">← back to synth</Link>
          <a href="mailto:supportsynth@gmail.com" className="transition-colors hover:text-white" style={{ color: GREEN }}>
            support →
          </a>
        </div>
      </section>
    </PageShell>
  )
}
