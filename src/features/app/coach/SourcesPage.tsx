import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Check, AlertCircle, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { COACH_CONNECTORS } from '../data/mockConnectors'
import { SYNTH } from '../lib/theme'

type Status = 'synced' | 'syncing' | 'error'

const MOCK_STATUS: { id: string; status: Status; lastSync: string }[] = [
  { id: 'concept2', status: 'synced', lastSync: '4m ago' },
  { id: 'strava', status: 'synced', lastSync: '12m ago' },
  { id: 'trainingpeaks', status: 'syncing', lastSync: 'now' },
  { id: 'whoop', status: 'synced', lastSync: '6m ago' },
  { id: 'apple-health', status: 'synced', lastSync: '4m ago' },
  { id: 'garmin', status: 'error', lastSync: '2h ago' },
]

export function SourcesPage() {
  const navigate = useNavigate()

  const rows = MOCK_STATUS.map((s) => {
    const meta = COACH_CONNECTORS.find((c) => c.id === s.id)
    return { ...s, meta }
  }).filter((r) => r.meta)

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[140px]">
      <CoachPageHeader
        title="Sources"
        subtitle={`${rows.length} connected`}
        back="/app/coach/home"
        rightSlot={
          <button
            type="button"
            aria-label="Add source"
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{
              background: SYNTH.glass,
              backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              border: `1px solid ${SYNTH.glassBorder}`,
              color: SYNTH.inkOnBrand,
            }}
            onClick={() => {
              /* would open add-source flow */
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
        style={{
          background: SYNTH.cardSky,
          boxShadow: SYNTH.shadow.card,
        }}
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
            4m
          </span>
          <span
            className="text-[12px] font-semibold"
            style={{ color: SYNTH.ink, opacity: 0.6, fontFamily: SYNTH.font }}
          >
            ago · all sources healthy
          </span>
        </div>
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{
            background: SYNTH.accentBlack,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
          }}
        >
          <RefreshCw size={11} strokeWidth={2.4} />
          Sync now
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
          {rows.map((row, i) => (
            <SourceRow
              key={row.id}
              brandColor={row.meta!.brandColor}
              initial={row.meta!.name.charAt(0)}
              name={row.meta!.name}
              category={row.meta!.category}
              status={row.status}
              lastSync={row.lastSync}
              isFirst={i === 0}
              onClick={() => navigate(`/app/coach/sources?id=${row.id}`)}
            />
          ))}
        </div>
      </section>
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
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
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
      style={{
        background: bg,
        color: SYNTH.inkOnBrand,
        fontFamily: SYNTH.font,
      }}
    >
      {icon}
      {label}
    </span>
  )
}
