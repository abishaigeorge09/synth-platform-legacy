import { useState, useMemo } from 'react'
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import { THEME } from '../../../../../lib/theme'
import { makeEmptyBoat } from '../../../../../shared/data/queries'
import type { BoatLineup, SeatAssignment } from '../../../../../shared/data/queries'
import type { DemoAthlete } from '../data/demoLineupData'

// ─── Recovery helpers ────────────────────────────────────────────────────────

function recoveryColor(v: number): string {
  if (v >= 75) return 'var(--green-primary)'
  if (v >= 50) return 'var(--amber-primary)'
  return 'var(--red-primary)'
}

// ─── Sub-types ────────────────────────────────────────────────────────────────

type SideFilter = 'all' | 'port' | 'starboard' | 'cox'

interface Props {
  boats: BoatLineup[]
  roster: DemoAthlete[]
  onSetBoats: (boats: BoatLineup[]) => void
  showBanner: boolean
  onBannerDismiss: () => void
  onGoHistory: () => void
  onGoSessions: () => void
}

// ─── Add-athlete modal ────────────────────────────────────────────────────────

interface AddModalState {
  boatId: string
  boatName: string
  seatNumber: number
  isCox: boolean
  side: string
  seatLabel: string
}

function AddAthleteModal({
  state,
  roster,
  assigned,
  onAssign,
  onClose,
}: {
  state: AddModalState
  roster: DemoAthlete[]
  assigned: Record<string, string>
  onAssign: (athleteId: string) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<SideFilter>('all')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return roster
      .filter((a) => !q || a.name.toLowerCase().includes(q))
      .filter((a) => filter === 'all' || a.side === filter)
      .filter((a) => !assigned[a.id])
  }, [roster, search, filter, assigned])

  const recommended = filtered.filter((a) => {
    if (state.isCox) return a.side === 'cox'
    if (state.side === 'starboard') return a.side === 'starboard'
    if (state.side === 'port') return a.side === 'port'
    return true
  })
  const other = filtered.filter((a) => !recommended.includes(a))

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxHeight: '78vh',
          background: 'var(--bg-primary, #fff)',
          borderRadius: '16px 16px 0 0',
          padding: 20,
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontSize: 11,
            fontFamily: THEME.fontMono,
            color: 'var(--text-tertiary)',
            letterSpacing: '0.14em',
            marginBottom: 12,
          }}
        >
          ADD ATHLETE · {state.boatName} · SEAT {state.seatLabel} ({state.isCox ? 'cox' : state.side.toUpperCase()})
        </div>
        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search athletes…"
          style={{
            width: '100%',
            border: '1px solid var(--border-default)',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 14,
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            marginBottom: 10,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {(['all', 'port', 'starboard', 'cox'] as SideFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontFamily: THEME.fontMono,
                fontWeight: 600,
                border: '1px solid var(--border-default)',
                background: filter === f ? 'var(--green-subtle)' : 'transparent',
                color: filter === f ? 'var(--green-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {f === 'all' ? 'ALL' : f === 'starboard' ? 'STBD' : f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Recommended section */}
        {recommended.length > 0 && (
          <>
            <div
              style={{
                fontSize: 10,
                fontFamily: THEME.fontMono,
                color: 'var(--green-primary)',
                letterSpacing: '0.14em',
                marginBottom: 6,
              }}
            >
              RECOMMENDED · MATCHING SIDE
            </div>
            {recommended.map((a) => (
              <ModalAthleteRow key={a.id} athlete={a} onSelect={() => onAssign(a.id)} />
            ))}
          </>
        )}

        {/* Other side section */}
        {other.length > 0 && (
          <>
            <div
              style={{
                fontSize: 10,
                fontFamily: THEME.fontMono,
                color: 'var(--text-tertiary)',
                letterSpacing: '0.14em',
                marginTop: 12,
                marginBottom: 6,
              }}
            >
              OTHER SIDE
            </div>
            {other.map((a) => (
              <ModalAthleteRow key={a.id} athlete={a} onSelect={() => onAssign(a.id)} />
            ))}
          </>
        )}

        {recommended.length === 0 && other.length === 0 && (
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
            No available athletes match this filter.
          </div>
        )}
      </div>
    </div>
  )
}

function ModalAthleteRow({ athlete, onSelect }: { athlete: DemoAthlete; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 8,
        border: '1px solid transparent',
        background: 'var(--bg-surface)',
        marginBottom: 4,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: athlete.avatarColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 600,
          color: '#fff',
          fontFamily: THEME.fontMono,
          flexShrink: 0,
        }}
      >
        {athlete.initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{athlete.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          {athlete.side} · recovery {athlete.recovery}
        </div>
      </div>
      <span style={{ color: recoveryColor(athlete.recovery), fontSize: 11, fontWeight: 600 }}>
        {athlete.recovery}
      </span>
      <span style={{ fontSize: 12, fontFamily: THEME.fontMono, color: 'var(--text-secondary)' }}>
        {athlete.ergTime}
      </span>
    </button>
  )
}

// ─── Roster row (draggable) ──────────────────────────────────────────────────

function RosterRow({
  athlete,
  assignedBoat,
  selected,
  multi,
  onToggle,
}: {
  athlete: DemoAthlete
  assignedBoat?: string
  selected: boolean
  multi: boolean
  onToggle: () => void
}) {
  const { setNodeRef, listeners, attributes, transform } = useDraggable({ id: athlete.id })
  const style = transform ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` } : undefined

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => multi && onToggle()}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 10px',
        borderRadius: 8,
        border: `1px solid ${selected ? 'var(--green-primary)' : 'var(--border-default)'}`,
        background: selected ? 'var(--green-subtle)' : 'var(--bg-surface, #fff)',
        opacity: assignedBoat && !multi ? 0.38 : 1,
        cursor: multi ? 'pointer' : 'grab',
        width: '100%',
        textAlign: 'left',
      }}
      {...(!multi && !assignedBoat ? listeners : {})}
      {...(!multi && !assignedBoat ? attributes : {})}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: athlete.avatarColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 600,
          color: '#fff',
          fontFamily: THEME.fontMono,
          flexShrink: 0,
        }}
      >
        {athlete.initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {athlete.name}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
          {athlete.side}{assignedBoat ? ` · ${assignedBoat}` : ''}
        </div>
      </div>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: recoveryColor(athlete.recovery),
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 11, color: recoveryColor(athlete.recovery), fontWeight: 600 }}>
        {athlete.recovery}
      </span>
      <span style={{ fontSize: 12, fontFamily: THEME.fontMono, color: 'var(--text-secondary)' }}>
        {athlete.ergTime}
      </span>
    </button>
  )
}

// ─── Seat cell (droppable) ───────────────────────────────────────────────────

function SeatCell({
  boatId,
  seat,
  athlete,
  onClear,
  onTap,
}: {
  boatId: string
  seat: SeatAssignment
  athlete?: DemoAthlete
  onClear: () => void
  onTap: () => void
}) {
  const dropId = `${boatId}::${seat.isCox ? 'cox' : seat.seatNumber}`
  const { setNodeRef, isOver } = useDroppable({ id: dropId })
  const [popover, setPopover] = useState(false)

  const borderCol = seat.isCox
    ? 'var(--green-primary)'
    : seat.side === 'port'
    ? 'var(--red-primary)'
    : 'var(--green-primary)'

  const seatLabel = seat.isCox
    ? 'COX'
    : seat.seatNumber === 8
    ? '8 · STR'
    : seat.seatNumber === 1
    ? '1 · BOW'
    : String(seat.seatNumber)

  return (
    <div
      ref={setNodeRef}
      style={{
        borderRadius: 8,
        border: `1px solid ${athlete ? borderCol : 'var(--border-default)'}`,
        borderStyle: athlete ? 'solid' : 'dashed',
        background: isOver
          ? 'var(--green-subtle)'
          : seat.isCox
          ? 'rgba(5,150,105,0.06)'
          : 'var(--bg-surface, #fff)',
        padding: '6px 8px',
        position: 'relative',
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontFamily: THEME.fontMono,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 2,
        }}
      >
        {seatLabel}
      </div>
      {athlete ? (
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setPopover((v) => !v)}
            style={{
              width: '100%',
              textAlign: 'left',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>
              {athlete.name}
            </span>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: recoveryColor(athlete.recovery),
                flexShrink: 0,
              }}
            />
          </button>
          {popover && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                zIndex: 30,
                background: 'var(--bg-primary, #fff)',
                border: '1px solid var(--border-default)',
                borderRadius: 8,
                padding: '8px 12px',
                minWidth: 140,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                {athlete.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Recovery: {athlete.recovery} · {athlete.ergTime}
              </div>
              <button
                type="button"
                onClick={() => { setPopover(false); onClear() }}
                style={{
                  width: '100%',
                  padding: '6px 0',
                  borderRadius: 4,
                  border: '1px solid var(--red-primary)',
                  background: 'transparent',
                  color: 'var(--red-primary)',
                  fontSize: 11,
                  fontFamily: THEME.fontMono,
                  cursor: 'pointer',
                }}
              >
                Remove
              </button>
            </div>
          )}
          {popover && (
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 29 }}
              onClick={() => setPopover(false)}
            />
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={onTap}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 11,
            color: 'var(--text-tertiary)',
            textAlign: 'left',
            padding: 0,
          }}
        >
          tap to add
        </button>
      )}
    </div>
  )
}

// ─── Boat card ────────────────────────────────────────────────────────────────

function BoatCard({
  boat,
  athleteById,
  onRename,
  onResize,
  onSeatClear,
  onSeatTap,
}: {
  boat: BoatLineup
  athleteById: Record<string, DemoAthlete>
  onRename: (name: string) => void
  onResize: (size: 4 | 8) => void
  onSeatClear: (seat: SeatAssignment) => void
  onSeatTap: (seat: SeatAssignment) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(boat.name)
  const cox = boat.seats.find((s) => s.isCox)
  const rowSeats = boat.seats.filter((s) => !s.isCox).sort((a, b) => b.seatNumber - a.seatNumber)
  const rows: SeatAssignment[][] = []
  for (let i = 0; i < rowSeats.length; i += 2) rows.push([rowSeats[i], rowSeats[i + 1]].filter(Boolean))

  const totalSeats = boat.seats.length
  const filledSeats = boat.seats.filter((s) => s.athleteId).length

  return (
    <article
      style={{
        width: '100%',
        minWidth: 0,
        borderRadius: 16,
        border: `1px solid ${THEME.border}`,
        background: 'var(--bg-primary)',
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative hull SVG */}
      <svg
        viewBox="0 0 340 500"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.04,
        }}
        aria-hidden
      >
        <path
          d="M170 20 C250 20,310 80,310 200 C310 350,250 450,170 490 C90 450,30 350,30 200 C30 80,90 20,170 20 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line x1="170" y1="30" x2="170" y2="480" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
      </svg>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12, position: 'relative' }}>
        {editing ? (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => { setEditing(false); if (draft.trim()) onRename(draft.trim()) }}
            autoFocus
            style={{
              flex: 1,
              fontSize: 18,
              fontWeight: 600,
              fontFamily: THEME.fontMono,
              color: THEME.textPrimary,
              border: 'none',
              borderBottom: `2px solid var(--green-primary)`,
              outline: 'none',
              background: 'transparent',
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            style={{
              fontSize: 18,
              fontWeight: 600,
              fontFamily: THEME.fontMono,
              color: THEME.textPrimary,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {boat.name}
            <span style={{ fontSize: 12, color: THEME.textMuted }}>✏</span>
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div
            style={{
              display: 'flex',
              borderRadius: 20,
              border: `1px solid ${THEME.border}`,
              overflow: 'hidden',
            }}
          >
            {([4, 8] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onResize(size)}
                style={{
                  padding: '2px 8px',
                  fontSize: 10,
                  fontFamily: THEME.fontMono,
                  fontWeight: 600,
                  background: boat.size === size ? 'var(--green-subtle)' : 'transparent',
                  color: boat.size === size ? 'var(--green-primary)' : THEME.textSecondary,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {size}+
              </button>
            ))}
          </div>
          <span style={{ fontSize: 11, color: THEME.textMuted, fontFamily: THEME.fontMono }}>
            {filledSeats}/{totalSeats}
          </span>
        </div>
      </div>

      {/* COX */}
      {cox && (
        <div style={{ marginBottom: 8 }}>
          <SeatCell
            boatId={boat.id}
            seat={cox}
            athlete={cox.athleteId ? athleteById[cox.athleteId] : undefined}
            onClear={() => onSeatClear(cox)}
            onTap={() => onSeatTap(cox)}
          />
        </div>
      )}

      {/* Seat rows */}
      <div style={{ display: 'grid', gap: 6 }}>
        {rows.map((pair) => (
          <div key={pair[0].seatNumber} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {pair.map((seat) => (
              <SeatCell
                key={`${boat.id}-${seat.seatNumber}`}
                boatId={boat.id}
                seat={seat}
                athlete={seat.athleteId ? athleteById[seat.athleteId] : undefined}
                onClear={() => onSeatClear(seat)}
                onTap={() => onSeatTap(seat)}
              />
            ))}
          </div>
        ))}
      </div>
    </article>
  )
}

// ─── Main BuilderTab ──────────────────────────────────────────────────────────

export function BuilderTab({
  boats,
  roster,
  onSetBoats,
  showBanner,
  onBannerDismiss,
  onGoHistory,
  onGoSessions,
}: Props) {
  const [query, setQuery] = useState('')
  const [sideFilter, setSideFilter] = useState<SideFilter>('all')
  const [multi, setMulti] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [addModal, setAddModal] = useState<AddModalState | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
  )

  const assigned = useMemo(() => {
    const map: Record<string, string> = {}
    boats.forEach((b) => b.seats.forEach((s) => s.athleteId && (map[s.athleteId] = b.name)))
    return map
  }, [boats])

  const athleteById = useMemo(
    () => Object.fromEntries(roster.map((a) => [a.id, a])),
    [roster],
  )

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return roster
      .filter((a) => !q || a.name.toLowerCase().includes(q))
      .filter((a) => sideFilter === 'all' || a.side === sideFilter)
  }, [roster, query, sideFilter])

  const available = filtered.filter((a) => !assigned[a.id])
  const assignedList = filtered.filter((a) => !!assigned[a.id])

  function put(boatId: string, seatNumber: number, isCox: boolean, athleteId: string | null) {
    onSetBoats(
      boats.map((b) => ({
        ...b,
        seats: b.seats
          .map((s) => (s.athleteId === athleteId && athleteId ? { ...s, athleteId: null } : s))
          .map((s) =>
            b.id === boatId && s.seatNumber === seatNumber && Boolean(s.isCox) === isCox
              ? { ...s, athleteId }
              : s,
          ),
      })),
    )
  }

  function onDragEnd(e: DragEndEvent) {
    if (multi) return
    const athleteId = String(e.active.id)
    const over = e.over?.id ? String(e.over.id) : null
    if (!over) return
    const [boatId, seatKey] = over.split('::')
    put(boatId, seatKey === 'cox' ? 0 : Number(seatKey), seatKey === 'cox', athleteId)
  }

  function handleSeatTap(boat: BoatLineup, seat: SeatAssignment) {
    if (seat.athleteId) return // seat is filled — handled by popover
    const seatLabel = seat.isCox
      ? 'COX'
      : seat.seatNumber === 8
      ? '8'
      : seat.seatNumber === 1
      ? '1 · BOW'
      : String(seat.seatNumber)
    setAddModal({
      boatId: boat.id,
      boatName: boat.name,
      seatNumber: seat.isCox ? 0 : seat.seatNumber,
      isCox: Boolean(seat.isCox),
      side: seat.side === 'both' ? 'cox' : seat.side,
      seatLabel,
    })
  }

  function handleMultiFill(boatIdx: number) {
    const boat = boats[boatIdx]
    if (!boat) return
    const remaining = selected.slice()
    const next = boats.map((b) => {
      if (b.id !== boat.id) return b
      return {
        ...b,
        seats: b.seats.map((s) => {
          if (s.athleteId || remaining.length === 0) return s
          const id = remaining.shift()!
          return { ...s, athleteId: id }
        }),
      }
    })
    onSetBoats(next)
    setSelected([])
    setMulti(false)
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      {/* Publish banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            style={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 40,
              background: 'var(--bg-primary)',
              border: `1px solid var(--green-primary)`,
              borderRadius: 14,
              padding: '16px 24px',
              minWidth: 320,
              boxShadow: '0 8px 32px rgba(5,150,105,0.18)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 22, color: 'var(--green-primary)' }}>✓</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green-primary)', marginTop: 4 }}>
              Lineup Published
            </div>
            <div style={{ fontSize: 13, color: THEME.textSecondary, marginTop: 2 }}>
              {boats.length} boats · {boats.reduce((n, b) => n + b.seats.filter((s) => s.athleteId).length, 0)} athletes notified
            </div>
            <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>
              An email notification has been sent to all athletes.
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => { onBannerDismiss(); onGoHistory() }}
                style={{
                  borderRadius: 20,
                  border: `1px solid ${THEME.border}`,
                  padding: '6px 14px',
                  fontSize: 11,
                  fontFamily: THEME.fontMono,
                  fontWeight: 600,
                  color: THEME.textSecondary,
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                View in History
              </button>
              <button
                type="button"
                onClick={() => { onBannerDismiss(); onGoSessions() }}
                style={{
                  borderRadius: 20,
                  padding: '6px 14px',
                  fontSize: 11,
                  fontFamily: THEME.fontMono,
                  fontWeight: 600,
                  color: '#fff',
                  background: 'var(--green-primary)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Create Session →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 items-start gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[280px_1fr]">
        {/* ── Roster Panel ── */}
        <section
          className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-160px)]"
          style={{
            borderRadius: 16,
            border: `1px solid ${THEME.border}`,
            background: 'var(--bg-primary)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontFamily: THEME.fontMono,
              color: THEME.textMuted,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Roster · Available
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            style={{
              width: '100%',
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
              padding: '7px 10px',
              fontSize: 13,
              background: THEME.light,
              outline: 'none',
              marginBottom: 8,
              boxSizing: 'border-box',
            }}
          />
          {/* Side filter pills */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
            {(['all', 'port', 'starboard', 'cox'] as SideFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSideFilter(f)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 20,
                  fontSize: 9,
                  fontFamily: THEME.fontMono,
                  fontWeight: 600,
                  border: `1px solid ${sideFilter === f ? 'var(--green-primary)' : THEME.border}`,
                  background: sideFilter === f ? 'var(--green-subtle)' : 'transparent',
                  color: sideFilter === f ? 'var(--green-primary)' : THEME.textSecondary,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {f === 'all' ? 'ALL' : f === 'starboard' ? 'STBD' : f.toUpperCase()}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 8, fontFamily: THEME.fontMono }}>
            {available.length} available · {assignedList.length} assigned
          </div>
          <button
            type="button"
            onClick={() => { setMulti((v) => !v); setSelected([]) }}
            style={{
              borderRadius: 20,
              border: `1px solid ${multi ? 'var(--green-primary)' : THEME.border}`,
              background: multi ? 'var(--green-subtle)' : 'var(--bg-primary)',
              color: multi ? 'var(--green-primary)' : THEME.textSecondary,
              padding: '4px 10px',
              fontSize: 10,
              fontFamily: THEME.fontMono,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 8,
            }}
          >
            {multi ? `☑ Multi-select (${selected.length})` : '☐ Multi-select'}
          </button>
          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {filtered.map((a) => (
              <RosterRow
                key={a.id}
                athlete={a}
                assignedBoat={assigned[a.id]}
                selected={selected.includes(a.id)}
                multi={multi}
                onToggle={() =>
                  setSelected((prev) =>
                    prev.includes(a.id) ? prev.filter((id) => id !== a.id) : [...prev, a.id],
                  )
                }
              />
            ))}
          </div>
          {/* Multi-select action bar */}
          {multi && selected.length > 0 && (
            <div
              style={{
                borderTop: `1px solid ${THEME.border}`,
                paddingTop: 10,
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ fontSize: 11, color: THEME.textSecondary, marginBottom: 4 }}>
                {selected.length} selected
              </div>
              {boats.map((b, idx) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleMultiFill(idx)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontFamily: THEME.fontMono,
                    background: 'var(--green-primary)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Fill {b.name} →
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Boat cards ── */}
        <section style={{ paddingBottom: 8, minWidth: 0 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: 16,
            }}
          >
            {boats.map((boat) => (
              <BoatCard
                key={boat.id}
                boat={boat}
                athleteById={athleteById}
                onRename={(name) =>
                  onSetBoats(boats.map((b) => (b.id === boat.id ? { ...b, name } : b)))
                }
                onResize={(size) => {
                  // rebuild boat preserving filled seats where possible
                  const empty = makeEmptyBoat(boat.id, boat.name, size)
                  const existing = boat.seats.filter((s) => s.athleteId)
                  empty.seats = empty.seats.map((s) => {
                    const match = existing.find(
                      (e) => e.isCox === s.isCox && e.seatNumber === s.seatNumber,
                    )
                    return match ? { ...s, athleteId: match.athleteId } : s
                  })
                  onSetBoats(boats.map((b) => (b.id === boat.id ? empty : b)))
                }}
                onSeatClear={(seat) =>
                  put(boat.id, seat.seatNumber, Boolean(seat.isCox), null)
                }
                onSeatTap={(seat) => handleSeatTap(boat, seat)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Add athlete modal */}
      {addModal && (
        <AddAthleteModal
          state={addModal}
          roster={roster}
          assigned={assigned}
          onAssign={(athleteId) => {
            put(addModal.boatId, addModal.seatNumber, addModal.isCox, athleteId)
            setAddModal(null)
          }}
          onClose={() => setAddModal(null)}
        />
      )}
    </DndContext>
  )
}
