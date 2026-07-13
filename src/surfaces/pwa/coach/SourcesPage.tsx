import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, ChevronRight, ArrowUpRight } from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { COACH_CONNECTORS, type ConnectorMock } from '../data/mockConnectors'
import { ConnectorLogo } from '../primitives/ConnectorLogo'
import { ConnectorPermissionsSheet } from '../primitives/ConnectorPermissionsSheet'
import { SourcesSegmentedSwitch } from '../primitives/SourcesSegmentedSwitch'
import { AddSourceSheet } from '../primitives/SourcesSheets'
import { useSourcesStore, enabledToolCount } from '../data/useSourcesStore'
import { SYNTH } from '../lib/theme'

export function SourcesPage() {
  const sources = useSourcesStore((s) => s.sources)
  const connect = useSourcesStore((s) => s.connect)

  const [openDetailId, setOpenDetailId] = useState<string | null>(null)
  const [openAdd, setOpenAdd] = useState(false)

  const connected = useMemo(
    () =>
      COACH_CONNECTORS.filter((c) => sources[c.id]).map((c) => ({
        ...c,
        toolCount: enabledToolCount(sources[c.id]),
      })),
    [sources],
  )

  const available = useMemo(
    () => COACH_CONNECTORS.filter((c) => !sources[c.id]),
    [sources],
  )

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-safe-tab">
      <CoachPageHeader
        title="Sources"
        subtitle={`${connected.length} connected`}
        back="/app/coach/home"
        rightSlot={
          <button
            type="button"
            aria-label="Add source"
            data-tour="coach-sources-grant"
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

      <SourcesSegmentedSwitch />

      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="mt-3 px-5"
      >
        <p
          className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Connected
        </p>
        <div className="flex flex-col">
          {connected.map((c, i) => (
            <ConnectorRow
              key={c.id}
              connector={c}
              toolCount={c.toolCount}
              connected
              isFirst={i === 0}
              isLast={i === connected.length - 1}
              onClick={() => setOpenDetailId(c.id)}
            />
          ))}
        </div>
      </motion.section>

      {available.length > 0 ? (
        <section className="mt-6 px-5">
          <p
            className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            Available
          </p>
          <div className="flex flex-col">
            {available.map((c, i) => (
              <ConnectorRow
                key={c.id}
                connector={c}
                toolCount={0}
                connected={false}
                isFirst={i === 0}
                isLast={i === available.length - 1}
                onClick={() => connect(c.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <AddSourceSheet
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        available={available.map((c) => ({
          id: c.id,
          name: c.name,
          category: c.category,
          brandColor: c.brandColor,
        }))}
        onAdd={(id) => {
          connect(id)
          setOpenAdd(false)
        }}
      />

      <ConnectorPermissionsSheet
        open={openDetailId !== null}
        onClose={() => setOpenDetailId(null)}
        sourceId={openDetailId}
      />
    </div>
  )
}

function ConnectorRow({
  connector,
  toolCount,
  connected,
  isFirst,
  isLast,
  onClick,
}: {
  connector: ConnectorMock
  toolCount: number
  connected: boolean
  isFirst: boolean
  isLast: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 py-3 text-left active:opacity-70"
      style={{
        borderTop: isFirst ? 'none' : `1px solid rgba(255,255,255,0.08)`,
        paddingTop: isFirst ? 12 : 12,
        paddingBottom: isLast ? 12 : 12,
      }}
    >
      <ConnectorLogo id={connector.id} size={32} />
      <span
        className="flex-1 truncate text-[15px] font-semibold"
        style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
      >
        {connector.name}
      </span>
      {connected ? (
        <>
          <span
            className="flex h-7 min-w-[28px] items-center justify-center rounded-full px-2 text-[12px] font-bold"
            style={{
              background: '#3B82F6',
              color: '#FFFFFF',
              fontFamily: SYNTH.font,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {toolCount}
          </span>
          <ChevronRight size={18} color="rgba(255,255,255,0.6)" strokeWidth={2.2} />
        </>
      ) : (
        <span
          className="flex items-center gap-1 text-[13px] font-semibold"
          style={{ color: 'rgba(255,255,255,0.62)', fontFamily: SYNTH.font }}
        >
          Connect
          <ArrowUpRight size={14} strokeWidth={2.4} />
        </span>
      )}
    </button>
  )
}
