import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { THEME } from '../../../../lib/theme'
import { AI_INSIGHT_MARKDOWN } from '../../../../shared/data/seeds/trends'
import { SynthAiIllustration } from '../../../../shared/illustrations/sidebarIllustrations'

/**
 * Tiny in-house markdown renderer — just bold + paragraphs. No dep for a
 * 2-line block of text.
 */
function renderLite(md: string) {
  return md.split(/\n{2,}/).map((para, i) => (
    <p key={i} className="mb-3 text-[13px] leading-relaxed" style={{ color: THEME.textSecondary }}>
      {para.split(/(\*\*[^*]+\*\*)/).map((chunk, j) => {
        if (chunk.startsWith('**') && chunk.endsWith('**')) {
          return (
            <strong key={j} style={{ color: THEME.textPrimary, fontWeight: 600 }}>
              {chunk.slice(2, -2)}
            </strong>
          )
        }
        return <span key={j}>{chunk}</span>
      })}
    </p>
  ))
}

export function AiInsightBlock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl border p-6"
      style={{
        background: `linear-gradient(180deg, ${THEME.white} 0%, ${THEME.light} 100%)`,
        borderColor: THEME.border,
        boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ background: `${THEME.primary}12` }}
        >
          <SynthAiIllustration size={22} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div
                className="text-[9px] font-semibold uppercase tracking-[0.18em]"
                style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
              >
                synth. AI · team-wide insight
              </div>
              <h3 className="mt-0.5 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
                What changed this week
              </h3>
            </div>
            <Link
              to="/coach/ai"
              className="rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors hover:bg-zinc-50"
              style={{
                borderColor: THEME.border,
                color: THEME.primary,
                fontFamily: THEME.fontMono,
                background: THEME.white,
              }}
            >
              Ask a question →
            </Link>
          </div>
          <div className="mt-3">{renderLite(AI_INSIGHT_MARKDOWN)}</div>
        </div>
      </div>
    </motion.div>
  )
}
