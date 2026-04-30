/**
 * Dark-themed step preview mockups for the landing "How it works" section.
 * All mockups match the dark landing page — no white flash, no contrast shock.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { THEME } from '../../lib/theme'

/* ─── Dark tokens — match landing page exactly ─────────────────────── */
const BG   = '#0d0d0e'   // mockup bg
const SURF = '#111113'   // card surface
const SURF2 = '#161618'  // raised surface
const BD   = 'rgba(255,255,255,0.08)'
const T1   = '#ffffff'
const T2   = 'rgba(255,255,255,0.55)'
const T3   = 'rgba(255,255,255,0.28)'
const GREEN  = '#10B981'
const G_DIM  = 'rgba(16,185,129,0.12)'
const G_LINE = 'rgba(16,185,129,0.35)'
const MF = THEME.fontMono
const SF = "'Instrument Sans', system-ui, sans-serif"

/* ─── Shared sidebar ─────────────────────────────────────────────────── */
function MiniSidebar({ active }: { active: 'dashboard' | 'athletes' | 'sources' | 'lineups' | 'ai' }) {
  const items: { id: typeof active; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'athletes',  label: 'Athletes'  },
    { id: 'sources',   label: 'Sources'   },
    { id: 'lineups',   label: 'Lineups'   },
    { id: 'ai',        label: 'synth. AI' },
  ]
  return (
    <div
      className="flex h-full w-[110px] shrink-0 flex-col border-r p-2.5"
      style={{ background: '#090909', borderColor: BD }}
    >
      {/* Logo */}
      <div className="pb-3 pt-1 text-[12px] font-semibold" style={{ fontFamily: MF, color: T1 }}>
        synth<span style={{ color: GREEN }}>.</span>
      </div>
      {/* Team chip */}
      <div className="mb-3 rounded-lg border px-2 py-1.5" style={{ borderColor: BD, background: SURF2 }}>
        <div className="text-[7px] font-bold uppercase tracking-wider" style={{ fontFamily: MF, color: T3 }}>Team</div>
        <div className="mt-0.5 text-[10px] font-semibold" style={{ color: T1 }}>Pacific Women's</div>
      </div>
      {/* Nav */}
      <div className="flex flex-col gap-0.5">
        {items.map(it => (
          <div
            key={it.id}
            className="rounded-md px-2 py-1.5 text-[10px] font-semibold"
            style={{
              fontFamily: MF,
              background: active === it.id ? G_DIM : 'transparent',
              color: active === it.id ? GREEN : T2,
              borderLeft: active === it.id ? `2px solid ${GREEN}` : '2px solid transparent',
            }}
          >
            {it.label}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Step 1 — Connect sources ───────────────────────────────────────── */
const SOURCES = [
  { label: 'Google Sheets', sub: 'erg log · 2,847 records', color: '#34A853' },
  { label: 'TeamWorks', sub: 'calendar + compliance', color: '#4A90D9' },
  { label: 'Whoop', sub: 'recovery + strain', color: '#00C896' },
  { label: 'Strava', sub: 'cross-training', color: '#FC4C02' },
]

export function MockConnect() {
  const [selected, setSelected] = useState<number | null>(null)
  const [phase, setPhase] = useState<'idle' | 'connecting' | 'done'>('idle')

  useEffect(() => {
    const t1 = setTimeout(() => setSelected(0), 700)
    const t2 = setTimeout(() => setPhase('connecting'), 1500)
    const t3 = setTimeout(() => setPhase('done'), 2900)
    const t4 = setTimeout(() => { setSelected(null); setPhase('idle') }, 5200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  return (
    <div className="flex h-full" style={{ fontFamily: SF, background: BG }}>
      <MiniSidebar active="sources" />
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        <div className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ fontFamily: MF, color: GREEN }}>
          Sources · connectors
        </div>
        <div className="mt-1 text-[16px] font-bold" style={{ color: T1 }}>Connect your tools</div>
        <div className="mt-0.5 text-[11px]" style={{ color: T2 }}>OAuth in 60 seconds — no rip-and-replace.</div>

        <div className="mt-4 flex flex-col gap-2">
          {SOURCES.map((s, i) => (
            <motion.div
              key={s.label}
              className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5"
              animate={{
                borderColor: selected === i ? s.color + '66' : BD,
                background: selected === i ? s.color + '14' : SURF,
              }}
              transition={{ duration: 0.3 }}
            >
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold" style={{ color: T1 }}>{s.label}</div>
                <div className="text-[9px]" style={{ color: T3 }}>{s.sub}</div>
              </div>
              {selected === i && phase === 'connecting' && (
                <motion.span
                  className="h-3 w-3 rounded-full border-2 border-transparent shrink-0"
                  style={{ borderTopColor: GREEN }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              )}
              {selected === i && phase === 'done' && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-[11px] font-bold shrink-0"
                  style={{ color: GREEN }}
                >
                  ✓
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {phase === 'done' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-xl border px-3 py-2.5"
              style={{ borderColor: G_LINE, background: G_DIM }}
            >
              <div className="text-[9px] font-bold uppercase tracking-wider" style={{ fontFamily: MF, color: GREEN }}>
                First sync complete
              </div>
              <div className="mt-0.5 text-[10px]" style={{ color: T2 }}>
                8,283 records ingested · 52/52 athletes mapped
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── Step 2 — Synthesize ────────────────────────────────────────────── */
const PIPE_IN = [
  { label: 'Google Sheets', color: '#34A853' },
  { label: 'Strava', color: '#FC4C02' },
  { label: 'Apple Health', color: '#FF2D55' },
  { label: 'Whoop', color: '#00C896' },
]
const PIPE_OUT = [
  { label: 'Athlete profiles', color: GREEN },
  { label: 'Training load', color: '#3B82F6' },
  { label: 'Recovery index', color: '#F59E0B' },
  { label: 'Coach alerts', color: '#EF4444' },
]

export function MockSynthesize() {
  const [pulse, setPulse] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p + 1) % PIPE_IN.length), 900)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex h-full" style={{ fontFamily: SF, background: BG }}>
      <MiniSidebar active="sources" />
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        <div className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ fontFamily: MF, color: GREEN }}>
          Sources · data pipeline
        </div>
        <div className="mt-1 text-[16px] font-bold" style={{ color: T1 }}>synth. synthesizes</div>
        <div className="mt-0.5 text-[11px]" style={{ color: T2 }}>Normalise → map roster → compute signals</div>

        {/* Pipeline diagram */}
        <div className="mt-5 flex flex-1 items-center gap-2">
          {/* Inputs */}
          <div className="flex flex-col gap-1.5">
            {PIPE_IN.map((s, i) => (
              <motion.div
                key={s.label}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5"
                animate={{
                  borderColor: pulse === i ? s.color + '88' : BD,
                  background: pulse === i ? s.color + '18' : SURF,
                }}
                transition={{ duration: 0.35 }}
              >
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-[10px] font-medium" style={{ color: T1 }}>{s.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Arrow + engine */}
          <div className="flex shrink-0 flex-col items-center gap-1">
            <motion.div
              className="h-px"
              style={{ width: 20, background: GREEN }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            <div
              className="flex flex-col items-center justify-center rounded-xl border px-3 py-3"
              style={{ background: G_DIM, borderColor: G_LINE, minWidth: 72 }}
            >
              <div className="text-[9px] font-bold uppercase tracking-wider text-center" style={{ fontFamily: MF, color: GREEN }}>
                Synthesis
              </div>
              <motion.div
                className="mt-1.5 h-2 w-2 rounded-full"
                style={{ background: GREEN }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            </div>
            <motion.div
              className="h-px"
              style={{ width: 20, background: GREEN }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0.7 }}
            />
          </div>

          {/* Outputs */}
          <div className="flex flex-col gap-1.5">
            {PIPE_OUT.map(o => (
              <div
                key={o.label}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5"
                style={{ borderColor: o.color + '44', background: o.color + '12' }}
              >
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: o.color }} />
                <span className="text-[10px] font-medium" style={{ color: T1 }}>{o.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[
            { k: 'Athletes', v: '52/52', c: GREEN },
            { k: 'Records', v: '8,283', c: '#3B82F6' },
            { k: 'Signals', v: '14', c: '#8B5CF6' },
          ].map(s => (
            <div key={s.k} className="rounded-lg border px-2 py-1.5" style={{ borderColor: BD, background: SURF }}>
              <div className="text-[7px] uppercase tracking-wider" style={{ fontFamily: MF, color: T3 }}>{s.k}</div>
              <div className="mt-0.5 text-[12px] font-bold" style={{ fontFamily: MF, color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Step 3 — Coach dashboard ───────────────────────────────────────── */
const ROSTER = [
  { name: 'Ella Wheeler',  pos: '1V Port',   erg: '6:35.6', load: 'High', risk: false },
  { name: 'Lily Abbott',   pos: '1V Stroke', erg: '6:42.8', load: 'Med',  risk: false },
  { name: 'Star Miller',   pos: '1V 3-seat', erg: '6:44.9', load: 'Low',  risk: false },
  { name: 'Julia Irmler',  pos: '2V Port',   erg: '6:45.1', load: 'High', risk: true  },
  { name: 'Olivia Roth',   pos: '2V Stroke', erg: '6:46.3', load: 'Med',  risk: false },
]

export function MockDashboard() {
  return (
    <div className="flex h-full" style={{ fontFamily: SF, background: BG }}>
      <MiniSidebar active="dashboard" />
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ fontFamily: MF, color: GREEN }}>
              Dashboard
            </div>
            <div className="mt-0.5 text-[15px] font-bold" style={{ color: T1 }}>Pacific Women's Rowing</div>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: GREEN }} />
            <span className="text-[9px] font-semibold" style={{ fontFamily: MF, color: GREEN }}>live</span>
          </div>
        </div>

        {/* Stat tiles */}
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {[
            { k: 'Athletes', v: '52', c: GREEN },
            { k: 'Avg 2K',   v: '6:48', c: '#3B82F6' },
            { k: 'Alerts',   v: '3',  c: '#EF4444' },
            { k: 'Sources',  v: '4',  c: '#8B5CF6' },
          ].map(t => (
            <div
              key={t.k}
              className="rounded-xl border px-2 py-2"
              style={{ borderColor: BD, borderLeft: `2px solid ${t.c}`, background: SURF }}
            >
              <div className="text-[7px] uppercase tracking-wider" style={{ fontFamily: MF, color: T3 }}>{t.k}</div>
              <div className="mt-1 text-[14px] font-bold leading-none" style={{ fontFamily: MF, color: t.c }}>{t.v}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="mt-3 rounded-xl border p-2.5" style={{ borderColor: BD, background: SURF }}>
          <div className="mb-2 text-[7px] font-bold uppercase tracking-wider" style={{ fontFamily: MF, color: T3 }}>
            Team signal · weekly
          </div>
          <div className="flex h-9 items-end gap-1">
            {[58, 72, 68, 88, 76, 82, 79].map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t-sm"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                style={{
                  height: `${h}%`,
                  background: `linear-gradient(180deg, ${GREEN}, #047857)`,
                  transformOrigin: 'bottom',
                }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
              />
            ))}
          </div>
        </div>

        {/* Roster */}
        <div className="mt-2 overflow-hidden rounded-xl border" style={{ borderColor: BD, background: SURF }}>
          {ROSTER.map((r) => (
            <div
              key={r.name}
              className="flex items-center border-b px-3 py-1.5 last:border-b-0"
              style={{ borderColor: BD }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-semibold truncate" style={{ color: T1 }}>{r.name}</div>
                <div className="text-[8px]" style={{ color: T3, fontFamily: MF }}>{r.pos}</div>
              </div>
              <div className="text-[10px] font-bold mr-3" style={{ fontFamily: MF, color: GREEN }}>{r.erg}</div>
              <div
                className="rounded-full px-1.5 py-0.5 text-[7px] font-bold"
                style={{
                  background: r.load === 'High' ? 'rgba(245,158,11,0.15)' : r.load === 'Med' ? G_DIM : SURF2,
                  color: r.load === 'High' ? '#F59E0B' : r.load === 'Med' ? GREEN : T3,
                  fontFamily: MF,
                }}
              >
                {r.load}
              </div>
              {r.risk && <span className="ml-1.5 text-[10px]" style={{ color: '#EF4444' }}>⚠</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Step 4 — Athlete view ──────────────────────────────────────────── */
export function MockAthleteView() {
  return (
    <div className="flex h-full flex-col" style={{ fontFamily: SF, background: BG }}>
      {/* Top nav */}
      <div
        className="flex items-center justify-between border-b px-4 py-2.5 shrink-0"
        style={{ background: '#090909', borderColor: BD }}
      >
        <span className="text-[12px] font-semibold" style={{ fontFamily: MF, color: T1 }}>
          synth<span style={{ color: GREEN }}>.</span>
          <span className="ml-1.5 text-[9px] font-normal" style={{ color: T3 }}>athlete</span>
        </span>
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold"
          style={{ background: GREEN, color: '#050505', fontFamily: MF }}
        >
          SM
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-4 py-3 flex flex-col gap-2.5">
        {/* Hero status */}
        <div className="rounded-xl border p-3" style={{ background: SURF, borderColor: BD }}>
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
              style={{ background: GREEN, color: '#050505', fontFamily: MF }}
            >
              SM
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-bold" style={{ color: T1 }}>Star Miller</div>
              <div className="text-[9px]" style={{ color: T2 }}>Pacific Women's · Port · Sophomore</div>
            </div>
            <div
              className="rounded-full border px-2 py-0.5 text-[8px] font-semibold"
              style={{ borderColor: G_LINE, background: G_DIM, color: GREEN, fontFamily: MF }}
            >
              Race in 2 days
            </div>
          </div>

          {/* Stat pods */}
          <div className="mt-2.5 grid grid-cols-3 gap-1.5">
            {[
              { k: '2K BEST', v: '6:44.9', sub: '-1.7s YOY', c: GREEN },
              { k: 'RECOVERY', v: '72', sub: 'amber zone', c: '#F59E0B', ring: true },
              { k: 'STREAK', v: '13d', sub: 'wellness', c: T2 },
            ].map(s => (
              <div key={s.k} className="rounded-lg border px-2 py-2 text-center" style={{ borderColor: BD, background: SURF2 }}>
                <div className="text-[7px] uppercase tracking-wider" style={{ fontFamily: MF, color: T3 }}>{s.k}</div>
                {s.ring ? (
                  <div
                    className="mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{ border: `2px solid ${s.c}`, color: s.c, background: s.c + '20' }}
                  >
                    {s.v}
                  </div>
                ) : (
                  <div className="mt-1 text-[13px] font-bold" style={{ fontFamily: MF, color: s.c }}>{s.v}</div>
                )}
                <div className="mt-0.5 text-[7px]" style={{ color: s.ring ? s.c : GREEN }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="rounded-xl border p-3" style={{ background: SURF, borderColor: BD }}>
          <div className="text-[8px] font-bold uppercase tracking-wider mb-2" style={{ fontFamily: MF, color: T3 }}>Today</div>
          {[
            { time: '6:00 AM', label: 'Practice — race pace pieces', dot: GREEN },
            { time: '2:00 PM', label: 'Midterm — EECS 126', dot: '#F59E0B' },
            { time: '4:30 PM', label: 'Gym — S&C session', dot: GREEN },
          ].map(e => (
            <div key={e.time} className="flex items-center gap-2 py-1">
              <div className="w-12 text-[8px] shrink-0" style={{ fontFamily: MF, color: T3 }}>{e.time}</div>
              <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: e.dot }} />
              <div className="text-[10px] font-medium" style={{ color: T1 }}>{e.label}</div>
            </div>
          ))}
        </div>

        {/* Coach note */}
        <div
          className="rounded-xl border-l-[3px] px-3 py-2.5"
          style={{ borderLeft: `3px solid #8B5CF6`, background: SURF, border: `1px solid ${BD}`, borderLeftColor: '#8B5CF6' }}
        >
          <div className="text-[7px] font-bold uppercase tracking-wider mb-1" style={{ fontFamily: MF, color: '#8B5CF6' }}>
            Coach note · Apr 22
          </div>
          <div className="text-[10px] leading-snug" style={{ color: T2 }}>
            Catch timing improved since footplate adjustment. Drive connection still needs work at high rates.
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Step 5 — synth. AI ─────────────────────────────────────────────── */
const SUGGESTIONS = [
  "Who improved most this block?",
  "Top athletes by recovery score",
  "Race-day lineup recommendation",
  "Who's at injury risk right now?",
]

const CANNED: Record<string, { a: string; citations: string[] }> = {
  "Who improved most this block?": {
    a: "**Madeline Cox** improved most — 2K dropped **10.4s** vs prior block. Second: Lola Crampin (−7.1s). Both in good recovery.",
    citations: ['Concept2 Logbook · Apr 2026', 'Whoop · recovery'],
  },
  "Top athletes by recovery score": {
    a: "**1. Lily Abbott** — 89% · **2. Ella Wheeler** — 86% · **3. Star Miller** — 81%. All slept 7.5+ hrs.",
    citations: ['Apple Health · sleep', 'Whoop · HRV'],
  },
  "Race-day lineup recommendation": {
    a: "Based on current 2K + recovery: Ella Wheeler (bow), Lily Abbott (2), Star Miller (3), Julia Irmler (4), Olivia Roth (5)…",
    citations: ['Concept2 Logbook', 'Whoop'],
  },
  "Who's at injury risk right now?": {
    a: "**Julia Irmler** — high load + 5.4h sleep avg last 3 nights. Reduce intensity tomorrow. No other flags.",
    citations: ['Apple Health · sleep', 'Bridge · S&C loads'],
  },
}

type Msg = { role: 'user' | 'assistant'; text: string; citations?: string[] }

function formatMsg(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/).map((p, i) => {
    const m = p.match(/^\*\*([^*]+)\*\*$/)
    return m ? <strong key={i} style={{ color: T1 }}>{m[1]}</strong> : <span key={i}>{p}</span>
  })
}

export function MockAI() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [typing, setTyping] = useState(false)
  const [chatTab, setChatTab] = useState<'ai' | 'team'>('ai')
  const bottomRef = useRef<HTMLDivElement>(null)

  function send(text: string) {
    if (typing) return
    setMessages(m => [...m, { role: 'user', text }])
    setTyping(true)
    setTimeout(() => {
      const c = CANNED[text]
      setMessages(m => [...m, {
        role: 'assistant',
        text: c?.a ?? "I've got data on that — pulling from all connected sources.",
        citations: c?.citations,
      }])
      setTyping(false)
    }, 1000)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  return (
    <div className="flex h-full" style={{ fontFamily: SF, background: BG }}>
      <MiniSidebar active="ai" />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b px-4 py-2" style={{ background: '#090909', borderColor: BD }}>
          <div className="flex gap-2 mb-2">
            {(['ai', 'team'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setChatTab(t)}
                className="rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-all"
                style={{
                  fontFamily: MF,
                  borderColor: chatTab === t ? G_LINE : BD,
                  background: chatTab === t ? G_DIM : 'transparent',
                  color: chatTab === t ? GREEN : T3,
                }}
              >
                {t === 'ai' ? 'synth. AI' : 'Team Messages'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="flex h-5 w-5 items-center justify-center rounded-full"
              style={{ background: `linear-gradient(135deg, ${GREEN}, #047857)` }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2l1.6 6.3L20 10l-6.4 1.7L12 18l-1.6-6.3L4 10l6.4-1.7L12 2z" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-bold" style={{ color: T1 }}>Ask your data</div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: GREEN }} />
                <span className="text-[8px] font-semibold" style={{ fontFamily: MF, color: GREEN }}>TEAM SCOPE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2" style={{ background: BG }}>
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-4 text-center"
              >
                <div
                  className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-full"
                  style={{ background: G_DIM, border: `1px solid ${G_LINE}` }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round">
                    <path d="M12 2l1.6 6.3L20 10l-6.4 1.7L12 18l-1.6-6.3L4 10l6.4-1.7L12 2z" />
                  </svg>
                </div>
                <div className="text-[11px] font-bold" style={{ color: T1 }}>Ask anything</div>
                <div className="mt-1 text-[9px]" style={{ color: T2 }}>
                  Every answer cites the source rows it drew from
                </div>
                <div className="mt-3 grid w-full grid-cols-2 gap-1.5">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-lg border px-2 py-1.5 text-left text-[9px] font-medium transition-colors"
                      style={{ borderColor: BD, color: T2, background: SURF }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[90%] rounded-xl px-3 py-2 text-[10px] leading-snug"
                  style={{
                    background: m.role === 'user' ? G_DIM : SURF,
                    border: `1px solid ${m.role === 'user' ? G_LINE : BD}`,
                    color: T2,
                  }}
                >
                  {formatMsg(m.text)}
                  {m.citations && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {m.citations.map(c => (
                        <span
                          key={c}
                          className="rounded border px-1 py-0.5 text-[7px]"
                          style={{ borderColor: G_LINE, color: GREEN, background: G_DIM, fontFamily: MF }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {typing && (
            <div className="flex gap-1 px-3 py-2 rounded-xl w-fit" style={{ background: SURF, border: `1px solid ${BD}` }}>
              {[0, 1, 2].map(d => (
                <motion.span
                  key={d}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: T3 }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.6, delay: d * 0.14, repeat: Infinity }}
                />
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 border-t px-3 py-2" style={{ background: '#090909', borderColor: BD }}>
          <div className="flex items-center gap-2 rounded-full border px-3 py-1.5" style={{ borderColor: BD, background: SURF }}>
            <input
              readOnly
              placeholder="Ask synth. AI…"
              className="flex-1 bg-transparent text-[10px] outline-none"
              style={{ color: T2 }}
            />
            <button
              type="button"
              onClick={() => !messages.length && send(SUGGESTIONS[0]!)}
              className="rounded-full px-2 py-0.5 text-[9px] font-bold"
              style={{ background: GREEN, color: '#050505', fontFamily: MF }}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
