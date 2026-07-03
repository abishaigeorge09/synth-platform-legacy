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
    intro: 'Effective date: June 27, 2026. synth is a health and athletic performance platform operated by Synth Sports Co. ("synth", "we", "us"). This policy explains what data we collect, why, how we use it, and your rights over it. It applies to the synth mobile app (iOS and Android) and all related services. Contact: founder@synthsports.co.',
    sections: [
      { heading: 'Data we collect', body: 'Account data: email address, name, and authentication provider identifier (if you sign in with Google or Apple). Health and fitness data (from Apple HealthKit / Android Health Connect, only after you grant explicit permission): heart rate, heart rate variability (HRV), resting heart rate, sleep duration and stages, blood oxygen (SpO2), respiratory rate, workouts and activity, steps, and energy expenditure. We do not write to Apple Health or Health Connect. Connector data: if you connect third-party services (e.g. Strava), we receive data according to the scopes you authorize. In-app content: chat messages, voice notes, and files you upload (e.g. training log sheets). Usage and diagnostics: crash reports (Sentry), analytics events, and device information. We do not link analytics to your health data.' },
      { heading: 'How we use your data', body: 'Solely to provide the synth coaching product: computing training readiness, recovery scores, and performance insights; powering the synth AI chat (your health context is included in prompts sent to AI providers to generate personalized coaching responses); displaying your training history and trends; and sending optional notifications if you opt in. HealthKit data is never used for advertising, never sold, and never used for data mining or market research — a hard rule we commit to unconditionally, consistent with Apple HealthKit guidelines.' },
      { heading: 'Model training and AI consent', body: 'We will never use your health or personal data to train machine learning models without your explicit, per-athlete consent, captured on a separate in-app consent screen. You can withdraw training consent at any time in Settings > Consent. Withdrawing consent removes your data from future training runs; it does not delete your account or affect core coaching features.' },
      { heading: 'Sub-processors and AI providers', body: 'We share data with the following sub-processors, all bound by data processing agreements: Supabase (database and authentication, hosted in the United States); Google Cloud Platform (application hosting); Anthropic (AI chat responses — health context included in prompts; Anthropic does not use API data to train its models); Sentry (crash reporting — crash payloads do not include health data); Temporal Cloud (workflow orchestration). We do not use advertising networks, sell data to data brokers, or share health data with any party not listed above.' },
      { heading: 'Data retention and deletion', body: 'We retain your data for as long as your account is active. Delete your account and all associated data any time: in-app via Settings > Delete account (permanent deletion scheduled within 24 hours), on the web at synthsports.co/delete-account, or by emailing founder@synthsports.co (processed within 30 days). Deletion cascades to your auth account, health data, ingestion events, derived metrics, chat history, connector accounts, and all associated records. Backups are purged on their normal rotation schedule (30 days or less after deletion).' },
      { heading: 'Your rights', body: 'Access: request a copy of your personal data. Correction: fix inaccurate data in Settings > Profile. Deletion: delete your account and all data. Portability: export your data from Settings > Export data (CSV). Consent withdrawal: withdraw AI-training consent any time in Settings > Consent. GDPR (EU/EEA) and UK users additionally have the right to object to or restrict processing and to lodge a complaint with a supervisory authority. California (CCPA/CPRA) users have the right to know, delete, correct, and opt out of sale of personal information — we do not sell personal information. To exercise any right, email founder@synthsports.co; we respond within 30 days.' },
      { heading: 'Children', body: 'synth is designed for collegiate athletes (typically 18+). We do not knowingly collect data from anyone under 13. If you believe a child has provided us data, contact us and we will delete it promptly.' },
      { heading: 'Security', body: 'All data is encrypted in transit (TLS 1.2+) and at rest (AES-256). Authentication tokens are stored in device secure storage (iOS Keychain / Android Keystore). Row-level security is enforced on every database table — your data is isolated from other users at the database level.' },
      { heading: 'Changes to this policy', body: 'We will notify you of material changes by updating the effective date above and, where required by law, by in-app notification or email. Continued use of synth after changes take effect constitutes acceptance of the updated policy.' },
    ],
  },
  terms: {
    title: 'Terms of Service',
    eyebrow: '// terms',
    intro: 'Effective date: June 27, 2026. These Terms form a binding agreement between you and Synth Sports Co. Medical disclaimer: synth is an informational and coaching tool, not a medical device and not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before making changes to your training or health regimen based on synth\'s outputs. Contact: founder@synthsports.co.',
    sections: [
      { heading: 'Acceptance and eligibility', body: 'By creating an account or using synth (the "Service"), you agree to these Terms and our Privacy Policy. You must be at least 13 years old. We may update these Terms; material changes will be notified in-app or by email, and continued use after changes take effect constitutes acceptance.' },
      { heading: 'Your account', body: 'You are responsible for maintaining the security of your account credentials, and must notify us immediately at founder@synthsports.co if you suspect unauthorized access. You may delete your account at any time from Settings > Delete account or at synthsports.co/delete-account; deletion is permanent and scheduled within 24 hours.' },
      { heading: 'The service', body: 'synth provides health and performance insights by reading data from Apple HealthKit, Android Health Connect, and connected fitness services (e.g. Strava), using heuristics and AI-assisted analysis, for informational and coaching purposes only. Outputs — readiness scores, recovery assessments, training recommendations — are not medical diagnoses. The Service is offered "as is" and "as available"; we do not guarantee uptime or accuracy of AI-generated outputs.' },
      { heading: 'Your data and content', body: 'You retain ownership of all health data and content you provide. You grant us a limited, non-exclusive license to process your data solely to provide the Service as described in the Privacy Policy. We will never sell your health data, never use it for advertising, and will not use it to train AI models without your explicit consent.' },
      { heading: 'Acceptable use', body: 'You agree not to: use the Service unlawfully; reverse-engineer, scrape, or extract data beyond normal use; harm, harass, or infringe the rights of others; attempt unauthorized access to the Service or its infrastructure; or upload illegal, harmful, or infringing content.' },
      { heading: 'Third-party integrations and IP', body: 'Your use of integrated third-party services (Apple Health, Strava, etc.) is governed by their own terms and privacy policies. All synth software, design, branding, and content (excluding your data) is owned by Synth Sports Co.; you may not copy, modify, or distribute synth\'s materials without written permission.' },
      { heading: 'Disclaimers and limitation of liability', body: 'TO THE FULLEST EXTENT PERMITTED BY LAW, SYNTH DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. IN NO EVENT SHALL SYNTH BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOSS OF PROFITS OR DATA. OUR TOTAL LIABILITY SHALL NOT EXCEED THE GREATER OF (A) $100 USD OR (B) THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.' },
      { heading: 'Termination and governing law', body: 'You may stop using synth at any time. We may suspend or terminate accounts that violate these Terms, with reasonable notice where practicable. Account deletion removes your data within 24 hours; the data, IP, and liability sections survive termination. These Terms are governed by the laws of the State of California, USA; disputes will be resolved in California courts.' },
    ],
  },
  support: {
    title: 'Support',
    eyebrow: '// support',
    intro: 'Need help with synth? Here is how to reach us and what to expect. We respond to every message.',
    sections: [
      { heading: 'Contact us', body: 'Email founder@synthsports.co for anything — bug reports, account issues, data questions, or feedback. We respond within 24-48 hours.' },
      { heading: 'Account and data', body: 'To export your data: Settings > Export data (CSV) in the app. To delete your account: Settings > Delete account in the app, or see synthsports.co/delete-account. To withdraw AI-training consent: Settings > Consent.' },
      { heading: 'Connector issues', body: 'If a connected service (Apple Health, Strava) stops syncing, try disconnecting and reconnecting it from the Source screen. If the problem persists, email us with the connector name and the approximate time syncing stopped.' },
      { heading: 'Privacy and legal', body: 'Privacy Policy: synthsports.co/legal/privacy. Terms of Service: synthsports.co/legal/terms. For privacy-rights requests (access, deletion, portability), email founder@synthsports.co.' },
    ],
  },
  'delete-account': {
    title: 'Delete Your Account',
    eyebrow: '// delete account',
    intro: 'You can permanently delete your synth account and all associated data at any time. Deletion is scheduled within 24 hours of your request and cascades to everything we hold about you.',
    sections: [
      { heading: 'In the app', body: 'Open synth, go to Settings > Delete account, and confirm. Your account and data are scheduled for permanent deletion within 24 hours.' },
      { heading: 'By email', body: 'Email founder@synthsports.co from the address on your account with the subject "Delete my account". We process email requests within 30 days.' },
      { heading: 'What gets deleted', body: 'Your auth account, health data, ingestion events, derived metrics, chat history, connector accounts, and all associated records. Backups are purged on their normal rotation schedule (30 days or less after deletion).' },
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
      { heading: 'Disclosure', body: 'Suspect a vulnerability? Email founder@synthsports.co with details. We respond within 24 hours and credit responsible disclosure.' },
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
          <a href="mailto:founder@synthsports.co" className="transition-colors hover:text-white" style={{ color: GREEN }}>
            support →
          </a>
        </div>
      </section>
    </PageShell>
  )
}
