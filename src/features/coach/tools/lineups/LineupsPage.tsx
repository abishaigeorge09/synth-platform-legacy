import { useMemo, useState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { PageHeader } from '../../dashboard/components/PageHeader'
import { RosterPanel } from './components/RosterPanel'
import { BoatCard } from './components/BoatCard'
import { THEME } from '../../../../lib/theme'
import { SEED_ATHLETES, SEED_ERG_SCORES } from '../../../../shared/data/seeds'
import {
  makeEmptyBoat,
  SEED_PUBLISHED_LINEUPS,
  type BoatLineup,
} from '../../../../shared/data/seeds/lineups'

export function LineupsPage() {
  const [boats, setBoats] = useState<BoatLineup[]>(() => [
    makeEmptyBoat('boat-1v', '1V 8+', 8),
    makeEmptyBoat('boat-2v', '2V 8+', 8),
  ])
  const [published, setPublished] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  )

  const athleteById = useMemo(() => {
    const map: Record<string, (typeof SEED_ATHLETES)[number]> = {}
    for (const a of SEED_ATHLETES) map[a.id] = a
    return map
  }, [])

  const ergByAthleteId = useMemo(() => {
    const map: Record<string, (typeof SEED_ERG_SCORES)[number]> = {}
    for (const e of SEED_ERG_SCORES) map[e.athleteId] = e
    return map
  }, [])

  const assignedIds = useMemo(() => {
    const set = new Set<string>()
    for (const boat of boats)
      for (const seat of boat.seats) if (seat.athleteId) set.add(seat.athleteId)
    return set
  }, [boats])

  const totalSeats = boats.reduce((acc, b) => acc + b.seats.length, 0)
  const filledSeats = boats.reduce(
    (acc, b) => acc + b.seats.filter((s) => s.athleteId).length,
    0,
  )

  function handleDragEnd(event: DragEndEvent) {
    const athleteId = String(event.active.id)
    const dropId = event.over?.id ? String(event.over.id) : null
    if (!dropId) return
    const [boatId, seatKey] = dropId.split('::')
    const isCox = seatKey.endsWith('-cox')
    const seatNumber = isCox ? 0 : parseInt(seatKey, 10)

    setBoats((prev) => {
      // Remove the athlete from any existing seat
      const next = prev.map((boat) => ({
        ...boat,
        seats: boat.seats.map((s) =>
          s.athleteId === athleteId ? { ...s, athleteId: null } : s,
        ),
      }))
      // Place into target
      return next.map((boat) => {
        if (boat.id !== boatId) return boat
        return {
          ...boat,
          seats: boat.seats.map((s) =>
            s.seatNumber === seatNumber && !!s.isCox === isCox
              ? { ...s, athleteId }
              : s,
          ),
        }
      })
    })
  }

  function removeFromSeat(boatId: string, seatNumber: number, isCox: boolean) {
    setBoats((prev) =>
      prev.map((boat) =>
        boat.id !== boatId
          ? boat
          : {
              ...boat,
              seats: boat.seats.map((s) =>
                s.seatNumber === seatNumber && !!s.isCox === isCox
                  ? { ...s, athleteId: null }
                  : s,
              ),
            },
      ),
    )
  }

  function renameBoat(boatId: string, name: string) {
    setBoats((prev) => prev.map((b) => (b.id === boatId ? { ...b, name } : b)))
  }

  function resizeBoat(boatId: string, size: 4 | 8) {
    setBoats((prev) =>
      prev.map((b) => (b.id === boatId ? makeEmptyBoat(b.id, b.name, size) : b)),
    )
  }

  function addBoat() {
    setBoats((prev) => [...prev, makeEmptyBoat(`boat-${Date.now()}`, `${prev.length + 1}V 4+`, 4)])
  }

  function clearAll() {
    setBoats((prev) =>
      prev.map((b) => ({ ...b, seats: b.seats.map((s) => ({ ...s, athleteId: null })) })),
    )
    setPublished(false)
  }

  function publish() {
    setPublished(true)
    setTimeout(() => setPublished(false), 2400)
  }

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <PageHeader
        kicker="Custom Tools · Lineups"
        title="Boat builder"
        subtitle={`${boats.length} boats · ${filledSeats} / ${totalSeats} seats filled · drag athletes from the roster`}
      />

      <div className="flex flex-wrap items-center gap-2 px-10 pb-4">
        <button
          type="button"
          onClick={addBoat}
          className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors hover:bg-zinc-50"
          style={{ borderColor: THEME.border, background: THEME.white, color: THEME.textPrimary, fontFamily: THEME.fontMono }}
        >
          + Add boat
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors hover:bg-zinc-50"
          style={{ borderColor: THEME.border, background: THEME.white, color: THEME.textSecondary, fontFamily: THEME.fontMono }}
        >
          Clear seats
        </button>
        <div className="ml-auto flex items-center gap-3">
          {published && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
            >
              ✓ Published — athletes notified
            </motion.span>
          )}
          <button
            type="button"
            onClick={publish}
            className="rounded-full px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02]"
            style={{
              background: THEME.primary,
              color: THEME.white,
              fontFamily: THEME.fontMono,
              boxShadow: '0 12px 30px -14px rgba(5,150,105,0.5)',
            }}
          >
            Publish lineup →
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 px-10 xl:grid-cols-[300px_1fr]">
          <RosterPanel
            athletes={SEED_ATHLETES}
            ergByAthleteId={ergByAthleteId}
            assignedIds={assignedIds}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {boats.map((boat) => (
              <BoatCard
                key={boat.id}
                boat={boat}
                athleteById={athleteById}
                ergByAthleteId={ergByAthleteId}
                onRename={(name) => renameBoat(boat.id, name)}
                onRemoveSeat={(seatNumber, isCox) => removeFromSeat(boat.id, seatNumber, isCox)}
                onResize={(size) => resizeBoat(boat.id, size)}
              />
            ))}
          </div>
        </div>
      </DndContext>

      <div className="mt-8 px-10">
        <div
          className="rounded-2xl border p-5"
          style={{ background: THEME.white, borderColor: THEME.border }}
        >
          <div
            className="text-[9px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            Lineup history · last 3 published
          </div>
          <div className="mt-1 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
            Past sessions
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {SEED_PUBLISHED_LINEUPS.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
                style={{ background: THEME.light, borderColor: THEME.border }}
              >
                <div>
                  <div
                    className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                    style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
                  >
                    {p.date}
                  </div>
                  <div className="mt-0.5 text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
                    {p.sessionTitle}
                  </div>
                  <div className="text-[11px]" style={{ color: THEME.textSecondary }}>
                    {p.note}
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors hover:bg-zinc-50"
                  style={{ borderColor: THEME.border, color: THEME.textSecondary, fontFamily: THEME.fontMono }}
                >
                  View →
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
