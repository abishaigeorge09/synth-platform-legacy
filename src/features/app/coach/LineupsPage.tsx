import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronRight, Calendar, Star, Play, Settings2, Boxes } from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { BoatLanesView, type LaneBoat } from '../primitives/BoatLanesView'
import { BoatConfigSheet } from '../primitives/BoatConfigSheet'
import { RacePresetSheet } from '../primitives/RacePresetSheet'
import { RaceRecorder, type Split, type RaceBoat } from '../primitives/RaceRecorder'
import { SaveRaceSheet, type SaveRaceResult } from '../primitives/SaveRaceSheet'
import { SessionDetailSheet } from '../primitives/SessionDetailSheet'
import { APP_MOCK_ATHLETES } from '../data/mockTeam'
import { APP_MOCK_SESSIONS, type MockSession } from '../data/mockSessions'
import { useLineupBuilderStore, SEAT_COUNT } from '../data/lineupBuilderStore'
import { SYNTH } from '../lib/theme'

type TabKey = 'builder' | 'sessions' | 'ratings'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'builder', label: 'Builder' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'ratings', label: 'Ratings' },
]

export function LineupsPage() {
  const [tab, setTab] = useState<TabKey>('builder')

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[140px]">
      <CoachPageHeader title="Lineup Builder" back="/app/coach/tools" />

      {/* Tab strip */}
      <div className="px-5">
        <div
          className="flex gap-1.5 rounded-full p-1"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`,
          }}
        >
          {TABS.map((t) => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className="flex-1 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors"
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
          {tab === 'sessions' && <SessionsTab />}
          {tab === 'ratings' && <RatingsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Builder ────────────────────────────────────────────────────────────────

function BuilderTab() {
  const boats = useLineupBuilderStore((s) => s.boats)
  const preset = useLineupBuilderStore((s) => s.preset)
  const [editingBoatId, setEditingBoatId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [presetOpen, setPresetOpen] = useState(false)

  const [recording, setRecording] = useState(false)
  const [savedResult, setSavedResult] = useState<{ elapsedMs: number; splits: Split[] } | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)

  // Idle boat preview — boats drift in their lanes while you build
  const idleLaneBoats: LaneBoat[] = useMemo(
    () =>
      boats.map((b) => ({
        id: b.id,
        name: b.name,
        color: b.color,
        progress: 0,
      })),
    [boats],
  )

  const recordBoats: RaceBoat[] = useMemo(
    () => boats.map((b) => ({ id: b.id, name: b.name, color: b.color, speed: b.speed })),
    [boats],
  )

  return (
    <>
      {/* Race preset card */}
      <section className="mx-5 mt-2">
        <button
          type="button"
          onClick={() => setPresetOpen(true)}
          className="flex w-full items-center gap-3 rounded-3xl p-4 text-left active:opacity-90"
          style={{ background: SYNTH.cardLemon, boxShadow: SYNTH.shadow.card }}
        >
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand }}
          >
            <Settings2 size={20} strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: SYNTH.ink, opacity: 0.6, fontFamily: SYNTH.font }}
            >
              Session preset · tap to edit
            </p>
            <p
              className="mt-1 text-[15px] font-bold leading-tight"
              style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
            >
              {preset.raceFor}
            </p>
            <p
              className="mt-0.5 text-[11px]"
              style={{ color: SYNTH.ink, opacity: 0.65, fontFamily: SYNTH.font }}
            >
              {preset.distance} · {preset.splits.length} splits · timing in{' '}
              {preset.splitUnit === 'ms' ? 'milliseconds' : 'seconds'}
            </p>
          </div>
          <ChevronRight size={16} color={SYNTH.ink} />
        </button>
      </section>

      {/* Idle boats preview — always animating */}
      {boats.length > 0 ? (
        <section className="mx-5 mt-3">
          <p
            className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            {boats.length} boat{boats.length === 1 ? '' : 's'} · live preview
          </p>
          <BoatLanesView
            boats={idleLaneBoats}
            markers={preset.splits.length}
            mode="idle"
            height={Math.max(180, Math.min(280, 56 * boats.length + 8))}
          />
        </section>
      ) : null}

      {/* Boats list */}
      <section className="mx-5 mt-4 flex flex-col gap-2">
        {boats.map((b) => {
          const filled = b.seats.filter((s) => s.athleteId !== null).length
          const total = SEAT_COUNT[b.size]
          const sample = b.seats
            .filter((s) => s.athleteId)
            .slice(0, 3)
            .map((s) => APP_MOCK_ATHLETES.find((a) => a.id === s.athleteId)?.name.split(' ')[0])
            .filter(Boolean)
            .join(' · ')
          return (
            <motion.button
              key={b.id}
              type="button"
              whileTap={{ scale: 0.99 }}
              onClick={() => setEditingBoatId(b.id)}
              className="flex items-center gap-3 rounded-2xl border p-3.5 text-left"
              style={{
                background: SYNTH.glass,
                backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
                WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
                borderColor: SYNTH.glassBorder,
              }}
            >
              <span
                className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl"
                style={{ background: b.color, color: SYNTH.ink, fontFamily: SYNTH.font }}
              >
                <span className="text-[16px] font-bold leading-none">{b.size}</span>
                <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] opacity-70">
                  {total} seats
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[14px] font-bold"
                  style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                >
                  {b.name}
                </p>
                <p
                  className="mt-0.5 truncate text-[11px]"
                  style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                >
                  {filled}/{total} filled{sample ? ` · ${sample}` : ''}
                </p>
              </div>
              <ChevronRight size={14} color={SYNTH.inkOnBrandFaint} />
            </motion.button>
          )
        })}

        {/* Add boat */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.99 }}
          onClick={() => setAdding(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em]"
          style={{
            borderColor: 'rgba(255,255,255,0.3)',
            color: SYNTH.inkOnBrandMuted,
            fontFamily: SYNTH.font,
          }}
        >
          <Plus size={14} strokeWidth={2.6} />
          Add a boat
        </motion.button>
      </section>

      {/* Start session — pinned-style hero CTA */}
      <section className="mx-5 mt-5">
        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          onClick={() => setRecording(true)}
          disabled={boats.length === 0}
          className="flex w-full items-center justify-center gap-2.5 rounded-full py-4 text-[15px] font-bold uppercase tracking-[0.04em] disabled:opacity-40"
          style={{
            background: SYNTH.accentEmerald,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            boxShadow: `0 14px 32px ${SYNTH.accentEmerald}88`,
          }}
        >
          <Play size={18} strokeWidth={2.6} fill={SYNTH.inkOnBrand} />
          Start session
        </motion.button>
        <p
          className="mt-2 text-center text-[11px]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
        >
          Records all {boats.length} boat{boats.length === 1 ? '' : 's'} · timing in{' '}
          {preset.splitUnit === 'ms' ? 'ms' : 'seconds'}
        </p>
      </section>

      {/* Sheets */}
      <BoatConfigSheet
        open={editingBoatId !== null || adding}
        onClose={() => {
          setEditingBoatId(null)
          setAdding(false)
        }}
        boatId={editingBoatId}
      />
      <RacePresetSheet open={presetOpen} onClose={() => setPresetOpen(false)} />

      {/* Live recorder */}
      {recording ? (
        <RaceRecorder
          boats={recordBoats}
          totalSplits={preset.splits.length}
          expectedRaceMs={preset.expectedDurationMs}
          splitUnit={preset.splitUnit}
          splitUnitLabel={preset.splitUnit === 'ms' ? '/ms' : '/500m'}
          label={`${preset.raceFor} · ${recordBoats.length} boats`}
          onFinish={(r) => {
            setSavedResult(r)
            setRecording(false)
            setSaveOpen(true)
          }}
          onDismiss={() => setRecording(false)}
        />
      ) : null}

      {savedResult ? (
        <SaveRaceSheet
          open={saveOpen}
          onClose={() => {
            setSaveOpen(false)
            setSavedResult(null)
          }}
          boats={recordBoats}
          elapsedMs={savedResult.elapsedMs}
          splits={savedResult.splits}
          onSave={(saved: SaveRaceResult) => {
            // Stub: would persist to a sessions store
            console.log('Session saved', saved, savedResult)
          }}
        />
      ) : null}
    </>
  )
}

// ─── Sessions (date-organized list) ─────────────────────────────────────────

function SessionsTab() {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = APP_MOCK_SESSIONS.find((s) => s.id === openId) ?? null

  return (
    <>
      <section className="mx-5 mt-2">
        <p
          className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Sessions · most recent first
        </p>
        <div className="flex flex-col gap-2">
          {APP_MOCK_SESSIONS.map((s) => (
            <SessionRow key={s.id} session={s} onOpen={() => setOpenId(s.id)} />
          ))}
        </div>
      </section>
      <SessionDetailSheet open={openId !== null} onClose={() => setOpenId(null)} session={open} />
    </>
  )
}

function SessionRow({ session, onOpen }: { session: MockSession; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.99 }}
      onClick={onOpen}
      className="rounded-2xl border p-4 text-left"
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
          {session.date} · {session.type} · {session.ratedByCoach}
        </span>
      </div>
      <p
        className="mt-1.5 text-[14px] font-bold leading-tight"
        style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
      >
        {session.title}
      </p>
      <div className="mt-2 flex items-center gap-3">
        <span
          className="text-[20px] font-bold"
          style={{
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {session.duration}
        </span>
        <div className="flex flex-wrap items-center gap-1">
          {session.boats.map((b) => (
            <span
              key={b.id}
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{
                background: `${b.color}55`,
                color: SYNTH.inkOnBrand,
                fontFamily: SYNTH.font,
                border: `1px solid ${b.color}99`,
              }}
            >
              {b.name}
            </span>
          ))}
        </div>
        <span className="ml-auto flex items-center gap-1">
          <Star size={11} color={SYNTH.accentEmerald} fill={SYNTH.accentEmerald} />
          <span
            className="text-[12px] font-bold"
            style={{
              color: SYNTH.accentEmerald,
              fontFamily: SYNTH.font,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {avgRating(session).toFixed(1)}
          </span>
        </span>
      </div>
    </motion.button>
  )
}

function avgRating(session: MockSession): number {
  if (session.boats.length === 0) return 0
  const sum = session.boats.reduce((acc, b) => acc + b.rating, 0)
  return sum / session.boats.length
}

// ─── Ratings (top boats by rating) ──────────────────────────────────────────

function RatingsTab() {
  const allRatings = APP_MOCK_SESSIONS.flatMap((s) =>
    s.boats.map((b) => ({
      session: s,
      boatName: b.name,
      boatColor: b.color,
      rating: b.rating,
    })),
  ).sort((a, b) => b.rating - a.rating)

  return (
    <section className="mx-5 mt-2 flex flex-col gap-2">
      <p
        className="pb-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
      >
        Top-rated boats
      </p>
      {allRatings.map((r, i) => (
        <div
          key={`${r.session.id}-${r.boatName}-${i}`}
          className="flex items-center gap-3 rounded-2xl border p-3"
          style={{
            background: SYNTH.glass,
            borderColor: SYNTH.glassBorder,
          }}
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: r.boatColor, color: SYNTH.ink }}
          >
            <Boxes size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p
              className="text-[13px] font-bold"
              style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
            >
              {r.boatName}
            </p>
            <p
              className="text-[11px]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              {r.session.title} · {r.session.date}
            </p>
          </div>
          <span className="flex items-center gap-1">
            <Star size={12} color={SYNTH.accentEmerald} fill={SYNTH.accentEmerald} />
            <span
              className="text-[16px] font-bold"
              style={{
                color: SYNTH.inkOnBrand,
                fontFamily: SYNTH.font,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {r.rating.toFixed(1)}
            </span>
          </span>
        </div>
      ))}
    </section>
  )
}
