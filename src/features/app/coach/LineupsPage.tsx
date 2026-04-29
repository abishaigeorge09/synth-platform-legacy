import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Calendar } from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { ComingSoonSheet } from '../primitives/SettingsSheets'
import { RaceRecorder, type Split } from '../primitives/RaceRecorder'
import { SaveRaceSheet, type SaveRaceResult } from '../primitives/SaveRaceSheet'
import { APP_MOCK_ATHLETES, APP_MOCK_TEAM } from '../data/mockTeam'
import { SYNTH } from '../lib/theme'

type TabKey = 'builder' | 'sessions' | 'timer' | 'ratings' | 'history'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'builder', label: 'Builder' },
  { key: 'timer', label: 'Timer' },
  { key: 'ratings', label: 'Ratings' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'history', label: 'History' },
]

const TODAY_LINEUP = [
  { seat: 'S', label: 'Stroke', athleteId: 'a-juno-okafor', side: 'S' as const },
  { seat: '7', label: '7 seat', athleteId: 'a-isla-park', side: 'S' as const },
  { seat: '6', label: '6 seat', athleteId: 'a-noor-haidari', side: 'P' as const },
  { seat: '5', label: '5 seat', athleteId: 'a-star-miller', side: 'P' as const },
  { seat: '4', label: '4 seat', athleteId: 'a-coral-mendez', side: 'S' as const },
  { seat: '3', label: '3 seat', athleteId: 'a-rae-akhtar', side: 'P' as const },
  { seat: '2', label: '2 seat', athleteId: 'a-noor-haidari', side: 'S' as const },
  { seat: 'B', label: 'Bow', athleteId: 'a-star-miller', side: 'P' as const },
]

const RACE_BOATS = [
  { id: 'v8a', name: 'V8 A', color: SYNTH.cardSky },
  { id: 'v8b', name: 'V8 B', color: SYNTH.cardPink },
  { id: 'v4a', name: 'V4 A', color: SYNTH.cardLemon },
  { id: 'v4b', name: 'V4 B', color: SYNTH.cardMint },
]

export function LineupsPage() {
  const [tab, setTab] = useState<TabKey>('builder')

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[140px]">
      <CoachPageHeader title="Lineup Builder" back="/app/coach/tools" />

      {/* Tab strip */}
      <div className="px-5">
        <div
          className="synth-scroll flex gap-1.5 overflow-x-auto rounded-full p-1"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`,
            scrollbarWidth: 'none',
          }}
        >
          {TABS.map((t) => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className="shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors"
                style={{
                  background: active ? SYNTH.inkOnBrand : 'transparent',
                  color: active ? SYNTH.ink : SYNTH.inkOnBrandMuted,
                  fontFamily: SYNTH.font,
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-3"
        >
          {tab === 'builder' && <BuilderTab />}
          {tab === 'timer' && <TimerTab />}
          {tab === 'ratings' && <RatingsTab />}
          {tab === 'sessions' && <SessionsTab />}
          {tab === 'history' && <HistoryTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Builder ────────────────────────────────────────────────────────────────

function BuilderTab() {
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [shareToast, setShareToast] = useState<string | null>(null)

  const onShare = async () => {
    const text = `${APP_MOCK_TEAM.name} · V8 — Wednesday AM\n8 × 500m at 22 spm — water at 06:30.`
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: "Today's lineup", text })
        return
      } catch {
        /* fall through */
      }
    }
    try {
      await navigator.clipboard.writeText(text)
      setShareToast('Lineup copied')
      setTimeout(() => setShareToast(null), 1800)
    } catch {
      setShareToast('Sharing not available')
      setTimeout(() => setShareToast(null), 1800)
    }
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="mx-5 mt-2 rounded-3xl p-5"
        style={{ background: SYNTH.cardMint, boxShadow: SYNTH.shadow.card }}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex h-1.5 w-1.5 rounded-full" style={{ background: SYNTH.ink }} />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.ink, opacity: 0.7, fontFamily: SYNTH.font }}
          >
            Published 06:42 · Steady state
          </span>
        </div>
        <p
          className="mt-2 text-[20px] font-bold leading-[1.2] tracking-[-0.01em]"
          style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
        >
          8 × 500m at 22 spm — water at 06:30.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="rounded-full px-4 py-2 text-[12px] font-semibold"
            style={{
              background: SYNTH.accentBlack,
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
            }}
          >
            Edit lineup
          </button>
          <button
            type="button"
            onClick={onShare}
            className="rounded-full border px-4 py-2 text-[12px] font-semibold"
            style={{
              background: 'transparent',
              borderColor: SYNTH.ink,
              color: SYNTH.ink,
              fontFamily: SYNTH.font,
            }}
          >
            Share
          </button>
          {shareToast ? (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="ml-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: SYNTH.ink, opacity: 0.55, fontFamily: SYNTH.font }}
            >
              {shareToast}
            </motion.span>
          ) : null}
        </div>
      </motion.section>

      <ComingSoonSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Lineup builder"
        body="Drag-and-drop seat editing on mobile lands next sprint. For now, edit on the desktop coach surface and the change syncs here automatically."
      />

      <BoatVisual />

      <section className="mt-6 px-5">
        <p
          className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Roster
        </p>
        <div
          className="overflow-hidden rounded-3xl"
          style={{
            background: SYNTH.inlineCard,
            border: `1px solid ${SYNTH.inlineCardBorder}`,
          }}
        >
          {TODAY_LINEUP.map((seat, i) => {
            const a = APP_MOCK_ATHLETES.find((x) => x.id === seat.athleteId)
            if (!a) return null
            return (
              <button
                key={`${seat.seat}-${i}`}
                type="button"
                onClick={() => navigate(`/app/coach/athlete/${a.id}`)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left active:opacity-70"
                style={{ borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.inlineCardBorder}` }}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: seat.side === 'P' ? `${SYNTH.cardSky}DD` : `${SYNTH.cardYellow}DD`,
                    color: SYNTH.ink,
                    fontFamily: SYNTH.font,
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  {seat.seat}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-[14px] font-semibold"
                    style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                  >
                    {a.name}
                  </p>
                  <p
                    className="text-[11px] uppercase tracking-[0.12em]"
                    style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {seat.label} · {seat.side === 'P' ? 'Port' : 'Stbd'}
                  </p>
                </div>
                <span
                  className="text-[10px] uppercase tracking-[0.14em]"
                  style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
                >
                  {a.weeklyVolumeMeters / 1000}k
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </>
  )
}

// ─── Timer (Strava-translated) ──────────────────────────────────────────────

function TimerTab() {
  const [saveOpen, setSaveOpen] = useState(false)
  const [result, setResult] = useState<{ elapsedMs: number; splits: Split[] } | null>(null)

  return (
    <section className="mx-5 mt-2">
      <RaceRecorder
        boats={RACE_BOATS}
        totalSplits={4}
        onFinish={(r) => {
          setResult(r)
          setSaveOpen(true)
        }}
      />
      {result ? (
        <SaveRaceSheet
          open={saveOpen}
          onClose={() => setSaveOpen(false)}
          boats={RACE_BOATS}
          elapsedMs={result.elapsedMs}
          splits={result.splits}
          onSave={(saved: SaveRaceResult) => {
            console.log('Race saved', saved, result)
          }}
        />
      ) : null}
    </section>
  )
}

// ─── Sessions / Ratings / History stubs ─────────────────────────────────────

function SessionsTab() {
  return (
    <section className="mx-5 mt-2">
      <StubCard
        kicker="Sessions"
        title="Recent practices + races for this lineup"
        body="Each timer run shows up here automatically with its splits, ratings, and the coach who logged it. Tap to open the full session detail."
      />
    </section>
  )
}

function RatingsTab() {
  return (
    <section className="mx-5 mt-2">
      <StubCard
        kicker="Ratings"
        title="Boat-level ratings, tagged by coach"
        body="Every post-race form contributes a rating (technique / power / sync) and the coach who rated it. Aggregate trends + rating-coach attribution land in the next pass."
      />
    </section>
  )
}

function HistoryTab() {
  // Lightweight static demo: 3 history rows
  const items = [
    { date: 'Apr 21', name: 'V8 A — race pace pieces', time: '06:42.1', rating: 4.4, coach: 'Coach Geri' },
    { date: 'Apr 14', name: 'V8 B — seat race', time: '07:01.6', rating: 3.8, coach: 'Coach Mike' },
    { date: 'Apr 07', name: 'V4 A — time trial', time: '07:18.3', rating: 4.1, coach: 'Coach Geri' },
  ]
  return (
    <section className="mx-5 mt-2">
      <p
        className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
      >
        Past races
      </p>
      <div
        className="flex flex-col gap-2"
      >
        {items.map((it) => (
          <div
            key={it.date}
            className="rounded-2xl border p-4"
            style={{
              background: SYNTH.glass,
              backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              borderColor: SYNTH.glassBorder,
            }}
          >
            <div className="flex items-center gap-2">
              <Calendar size={12} color={SYNTH.inkOnBrandFaint} />
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
              >
                {it.date} · rated by {it.coach}
              </span>
            </div>
            <p
              className="mt-1 text-[14px] font-bold"
              style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
            >
              {it.name}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span
                className="text-[18px] font-bold"
                style={{
                  color: SYNTH.inkOnBrand,
                  fontFamily: SYNTH.font,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {it.time}
              </span>
              <span className="flex items-center gap-1">
                <Star size={12} color={SYNTH.accentEmerald} fill={SYNTH.accentEmerald} />
                <span
                  className="text-[12px] font-semibold"
                  style={{ color: SYNTH.accentEmerald, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
                >
                  {it.rating.toFixed(1)}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function StubCard({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return (
    <div
      className="rounded-3xl p-5"
      style={{
        background: SYNTH.inlineCard,
        border: `1px solid ${SYNTH.inlineCardBorder}`,
      }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
      >
        {kicker}
      </p>
      <p
        className="mt-1 text-[16px] font-bold"
        style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
      >
        {title}
      </p>
      <p
        className="mt-2 text-[13px] leading-[1.5]"
        style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
      >
        {body}
      </p>
    </div>
  )
}

function BoatVisual() {
  return (
    <div className="px-5 pt-5">
      <svg width="100%" viewBox="0 0 760 180" className="block">
        <defs>
          <linearGradient id="hullGrad" x1="0" x2="1">
            <stop offset="0" stopColor="rgba(255,255,255,0.16)" />
            <stop offset="1" stopColor="rgba(255,255,255,0.10)" />
          </linearGradient>
        </defs>
        <path
          d="M 60,90 Q 40,60 90,55 L 670,55 Q 720,55 740,90 Q 720,125 670,125 L 90,125 Q 40,120 60,90 Z"
          fill="url(#hullGrad)"
          stroke="rgba(255,255,255,0.32)"
          strokeWidth="1.5"
        />
        <line
          x1="80"
          y1="90"
          x2="720"
          y2="90"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <rect x="92" y="76" width="42" height="28" rx="6" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.32)" />
        <text x="113" y="94" textAnchor="middle" fill={SYNTH.inkOnBrandMuted} fontSize="9" fontWeight="700" fontFamily="Geist, Inter, sans-serif">COX</text>

        {[
          { x: 180, side: 'S', n: 'S' },
          { x: 250, side: 'P', n: '7' },
          { x: 320, side: 'S', n: '6' },
          { x: 390, side: 'P', n: '5' },
          { x: 460, side: 'S', n: '4' },
          { x: 530, side: 'P', n: '3' },
          { x: 600, side: 'S', n: '2' },
          { x: 670, side: 'P', n: 'B' },
        ].map((seat) => (
          <g key={seat.n}>
            <line
              x1={seat.x}
              y1="90"
              x2={seat.x}
              y2={seat.side === 'P' ? 60 : 120}
              stroke={seat.side === 'P' ? SYNTH.cardSky : SYNTH.cardYellow}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx={seat.x} cy="90" r="11" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.40)" />
            <text
              x={seat.x}
              y="93"
              textAnchor="middle"
              fill={SYNTH.inkOnBrand}
              fontSize="9"
              fontWeight="800"
              fontFamily="Geist, Inter, sans-serif"
            >
              {seat.n}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-center gap-4">
        <span
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: SYNTH.cardSky }} />
          Port
        </span>
        <span
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: SYNTH.cardYellow }} />
          Starboard
        </span>
      </div>
    </div>
  )
}
