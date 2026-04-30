import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Check, AlertCircle, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { ATHLETE_CONNECTORS } from '../data/mockConnectors'
import { AddSourceSheet, SourceDetailSheet, type ConnectorMeta } from '../primitives/SourcesSheets'
import { SYNTH } from '../lib/theme'

type Status = 'synced' | 'syncing' | 'error'

type Row = {
  id: string
  status: Status
  lastSync: string
}

const SEED_ROWS: Row[] = [
  { id: 'concept2', status: 'synced', lastSync: '4m ago' },
  { id: 'strava', status: 'synced', lastSync: '12m ago' },
  { id: 'whoop', status: 'synced', lastSync: '6m ago' },
  { id: 'apple-health', status: 'syncing', lastSync: 'now' },
  { id: 'garmin', status: 'error', lastSync: '2h ago' },
]

export function SourcesPage() {
  const [rows, setRows] = useState<Row[]>(SEED_ROWS)
  const [openDetailId, setOpenDetailId] = useState<string | null>(null)
  const [openAdd, setOpenAdd] = useState(false)
  const [syncingAll, setSyncingAll] = useState(false)
  const [lastSyncCount, setLastSyncCount] = useState('4m')

  const enriched = useMemo(
    () =>
      rows
        .map((r) => {
          const meta = ATHLETE_CONNECTORS.find((c) => c.id === r.id)
          if (!meta) return null
          return { ...r, meta }
        })
        .filter((r): r is Row & { meta: typeof ATHLETE_CONNECTORS[number] } => r !== null),
    [rows],
  )

  const available: ConnectorMeta[] = ATHLETE_CONNECTORS.filter(
    (c) => !rows.some((r) => r.id === c.id),
  ).map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    brandColor: c.brandColor,
  }))

  const onSyncAll = () => {
    if (syncingAll) return
    setSyncingAll(true)
    setRows((r) =>
      r.map((row) => (row.status === 'error' ? row : { ...row, status: 'syncing', lastSync: 'now' })),
    )
    setTimeout(() => {
      setRows((r) =>
        r.map((row) => (row.status === 'error' ? row : { ...row, status: 'synced', lastSync: 'just now' })),
      )
      setLastSyncCount('0m')
      setSyncingAll(false)
    }, 1400)
  }

  const onAdd = (id: string) => {
    setRows((r) => [...r, { id, status: 'synced', lastSync: 'just now' }])
    setOpenAdd(false)
  }

  const detailSource = enriched.find((r) => r.id === openDetailId)

  const onPause = () => {
    if (!openDetailId) return
    setRows((r) =>
      r.map((row) =>
        row.id === openDetailId
          ? { ...row, status: row.status === 'syncing' ? 'synced' : 'syncing' }
          : row,
      ),
    )
  }

  const onDisconnect = () => {
    if (!openDetailId) return
    setRows((r) => r.filter((row) => row.id !== openDetailId))
    setOpenDetailId(null)
  }

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-safe-tab">
      <CoachPageHeader
        title="My sources"
        subtitle={`${enriched.length} connected`}
        back="/app/athlete/home"
        rightSlot={
          <button
            type="button"
            aria-label="Add source"
            data-tour="athlete-sources-grant"
            onClick={() => setOpenAdd(true)}
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{
              background: SYNTH.glass,
              backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              border: `1px solid ${SYNTH.glassBorder}`,
              color: SYNTH.inkOnBrand,
            }}
          >
            <Plus size={18} strokeWidth={2.4} />
          </button>
        }
      />

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="mx-5 mt-2 rounded-3xl p-5"
        style={{ background: SYNTH.cardMint, boxShadow: SYNTH.shadow.card }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.ink, opacity: 0.65, fontFamily: SYNTH.font }}
        >
          Last sync
        </p>
        <div className="mt-2 flex items-baseline gap-3">
          <span
            className="text-[36px] font-bold leading-none tracking-[-0.02em]"
            style={{ color: SYNTH.ink, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
          >
            {syncingAll ? '—' : lastSyncCount}
          </span>
          <span
            className="text-[12px] font-semibold"
            style={{ color: SYNTH.ink, opacity: 0.6, fontFamily: SYNTH.font }}
          >
            {syncingAll ? 'pulling fresh data…' : `ago · pulling from ${enriched.length} sources`}
          </span>
        </div>
        <button
          type="button"
          onClick={onSyncAll}
          disabled={syncingAll}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50"
          style={{
            background: SYNTH.accentBlack,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
          }}
        >
          <motion.span
            animate={syncingAll ? { rotate: 360 } : { rotate: 0 }}
            transition={syncingAll ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }}
            className="flex"
          >
            <RefreshCw size={11} strokeWidth={2.4} />
          </motion.span>
          {syncingAll ? 'Syncing' : 'Sync now'}
        </button>
      </motion.section>

      <section className="mt-5 px-5">
        <p
          className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Connected
        </p>
        <div
          className="overflow-hidden rounded-3xl"
          style={{
            background: SYNTH.inlineCard,
            border: `1px solid ${SYNTH.inlineCardBorder}`,
          }}
        >
          {enriched.map((row, i) => (
            <div key={row.id} {...(i === 0 ? { 'data-tour': 'athlete-sources-card' } : {})}>
              <SourceRow
                brandColor={row.meta.brandColor}
                initial={row.meta.name.charAt(0)}
                name={row.meta.name}
                category={row.meta.category}
                status={row.status}
                lastSync={row.lastSync}
                isFirst={i === 0}
                onClick={() => setOpenDetailId(row.id)}
              />
            </div>
          ))}
        </div>
      </section>

      <AddSourceSheet open={openAdd} onClose={() => setOpenAdd(false)} available={available} onAdd={onAdd} />
      {detailSource ? (
        <SourceDetailSheet
          open={!!openDetailId}
          onClose={() => setOpenDetailId(null)}
          source={{
            id: detailSource.id,
            name: detailSource.meta.name,
            category: detailSource.meta.category,
            brandColor: detailSource.meta.brandColor,
            status: detailSource.status,
            lastSync: detailSource.lastSync,
          }}
          onPause={onPause}
          onDisconnect={onDisconnect}
        />
      ) : null}
    </div>
  )
}

function SourceRow({
  brandColor,
  initial,
  name,
  category,
  status,
  lastSync,
  isFirst,
  onClick,
}: {
  brandColor: string
  initial: string
  name: string
  category: string
  status: Status
  lastSync: string
  isFirst: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-4 text-left active:opacity-70"
      style={{ borderTop: isFirst ? 'none' : `1px solid ${SYNTH.inlineCardBorder}` }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: brandColor,
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        {initial.toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[14px] font-semibold leading-tight"
          style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
        >
          {name}
        </p>
        <p
          className="mt-0.5 text-[11px] uppercase tracking-[0.12em]"
          style={{
            color: SYNTH.inkOnBrandMuted,
            fontFamily: SYNTH.font,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {category} · {lastSync}
        </p>
      </div>
      <StatusBadge status={status} />
    </button>
  )
}

function StatusBadge({ status }: { status: Status }) {
  let icon: ReactNode
  let bg: string
  let label: string
  switch (status) {
    case 'synced':
      icon = <Check size={11} strokeWidth={3} color={SYNTH.inkOnBrand} />
      bg = SYNTH.accentEmerald
      label = 'Synced'
      break
    case 'syncing':
      icon = <RefreshCw size={11} strokeWidth={2.6} color={SYNTH.inkOnBrand} />
      bg = SYNTH.accentAmber
      label = 'Syncing'
      break
    case 'error':
      icon = <AlertCircle size={11} strokeWidth={2.6} color={SYNTH.inkOnBrand} />
      bg = SYNTH.accentRed
      label = 'Error'
      break
  }
  return (
    <span
      className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
      style={{ background: bg, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
    >
      {icon}
      {label}
    </span>
  )
}
