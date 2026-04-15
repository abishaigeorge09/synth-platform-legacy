import type { ReactElement, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { THEME } from '../../../../lib/theme'
import type { ScanLog } from '../../../../shared/data/types'

/**
 * Minimal markdown renderer — good enough for the synth. Agent scan reports
 * we seed in scanLogs.ts (headings, bullets, bold, inline code, italics).
 * Deliberately dependency-free — a real MD viewer can swap in later.
 */
function renderMarkdown(md: string) {
  const lines = md.split('\n')
  const nodes: ReactElement[] = []
  let listBuffer: string[] = []
  let key = 0

  const flushList = () => {
    if (listBuffer.length === 0) return
    nodes.push(
      <ul
        key={`list-${key++}`}
        className="mb-3 flex flex-col gap-1.5 pl-4"
        style={{ color: THEME.textSecondary }}
      >
        {listBuffer.map((item, i) => (
          <li
            key={i}
            className="text-[12px] leading-relaxed"
            style={{ listStyleType: 'disc' }}
          >
            <span dangerouslySetInnerHTML={{ __html: inline(item) }} />
          </li>
        ))}
      </ul>,
    )
    listBuffer = []
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (!line.trim()) {
      flushList()
      continue
    }
    if (line.startsWith('# ')) {
      flushList()
      nodes.push(
        <h3
          key={`h-${key++}`}
          className="mb-2 mt-1 text-[17px] font-semibold leading-tight"
          style={{ color: THEME.textPrimary, fontFamily: THEME.fontSerif }}
        >
          {line.slice(2)}
        </h3>,
      )
      continue
    }
    if (line.startsWith('## ')) {
      flushList()
      nodes.push(
        <div
          key={`sh-${key++}`}
          className="mb-1.5 mt-3 text-[9px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}
        >
          {line.slice(3)}
        </div>,
      )
      continue
    }
    if (line.startsWith('- ')) {
      listBuffer.push(line.slice(2))
      continue
    }
    flushList()
    nodes.push(
      <p
        key={`p-${key++}`}
        className="mb-2 text-[12px] leading-relaxed"
        style={{ color: THEME.textSecondary }}
        dangerouslySetInnerHTML={{ __html: inline(line) }}
      />,
    )
  }
  flushList()
  return nodes
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function inline(raw: string) {
  let s = escapeHtml(raw)
  // bold **x**
  s = s.replace(/\*\*([^*]+)\*\*/g, `<strong style="color:${THEME.textPrimary}">$1</strong>`)
  // italics _x_
  s = s.replace(/(^|[\s])_([^_]+)_/g, `$1<em style="color:${THEME.textPrimary}">$2</em>`)
  // code `x`
  s = s.replace(
    /`([^`]+)`/g,
    `<code style="font-family:${THEME.fontMono};background:${THEME.light};padding:1px 5px;border-radius:4px;border:1px solid ${THEME.border};font-size:11px;color:${THEME.textPrimary}">$1</code>`,
  )
  return s
}

export function ScanReportViewer({
  log,
  sourceName,
}: {
  log: ScanLog | null
  sourceName: string
}) {
  if (!log) {
    return (
      <div
        className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border p-8"
        style={{ background: THEME.white, borderColor: THEME.border }}
      >
        <div className="text-center">
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            Scan report
          </div>
          <div
            className="mt-2 text-[14px]"
            style={{ color: THEME.textSecondary }}
          >
            Select a scan to read its markdown report.
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      key={log.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex h-full flex-col overflow-hidden rounded-2xl border"
      style={{ background: THEME.white, borderColor: THEME.border }}
    >
      <header
        className="flex items-center justify-between border-b px-5 py-4"
        style={{ borderColor: THEME.border }}
      >
        <div>
          <div
            className="text-[9px] font-semibold uppercase tracking-[0.2em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            Scan report · {sourceName}
          </div>
          <div
            className="mt-0.5 text-[12px]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
          >
            {new Date(log.scannedAt).toUTCString().replace(' GMT', ' UTC')}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Chip tone="primary">+{log.itemsAdded}</Chip>
          {log.itemsUpdated > 0 && <Chip tone="cyan">~{log.itemsUpdated}</Chip>}
          {log.itemsRemoved > 0 && <Chip tone="red">-{log.itemsRemoved}</Chip>}
        </div>
      </header>
      <div className="synth-scroll flex-1 overflow-y-auto px-6 py-5">
        {renderMarkdown(log.reportMd)}
      </div>
    </motion.div>
  )
}

function Chip({ children, tone }: { children: ReactNode; tone: 'primary' | 'cyan' | 'red' }) {
  const toneMap = {
    primary: { fg: THEME.primary, bg: 'rgba(16,185,129,0.14)' },
    cyan: { fg: THEME.cyan, bg: 'rgba(6,182,212,0.14)' },
    red: { fg: THEME.red, bg: 'rgba(239,68,68,0.14)' },
  } as const
  const t = toneMap[tone]
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
      style={{ background: t.bg, color: t.fg, fontFamily: THEME.fontMono }}
    >
      {children}
    </span>
  )
}
