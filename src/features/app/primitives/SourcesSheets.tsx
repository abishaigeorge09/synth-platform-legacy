import { motion } from 'framer-motion'
import { Plus, Pause, Play, AlertCircle, Check, RefreshCw } from 'lucide-react'
import { SheetShell } from './SheetShell'
import { ConnectorLogo } from './ConnectorLogo'
import { SYNTH } from '../lib/theme'

export type ConnectorMeta = {
  id: string
  name: string
  category: string
  brandColor: string
}

// — Source detail —

export function SourceDetailSheet({
  open,
  onClose,
  source,
  onPause,
  onDisconnect,
}: {
  open: boolean
  onClose: () => void
  source: ConnectorMeta & { status: 'synced' | 'syncing' | 'error'; lastSync: string }
  onPause?: () => void
  onDisconnect?: () => void
}) {
  return (
    <SheetShell open={open} onClose={onClose} title="Source">
      <div className="flex items-center gap-3 pt-2">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: source.brandColor, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontWeight: 700, fontSize: 16 }}
        >
          {source.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[18px] font-bold leading-tight" style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}>
            {source.name}
          </p>
          <p className="mt-0.5 text-[12px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
            {source.category} · {source.lastSync}
          </p>
        </div>
        <StatusIcon status={source.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <DetailStat label="Records" value="14,328" />
        <DetailStat label="Health" value="100%" />
      </div>

      <button
        type="button"
        onClick={onPause}
        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left active:opacity-80"
        style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: '#FFFFFF', color: SYNTH.ink }}>
          {source.status === 'syncing' ? <Pause size={16} /> : <Play size={16} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold" style={{ fontFamily: SYNTH.font }}>
            {source.status === 'syncing' ? 'Pause sync' : 'Resume sync'}
          </p>
          <p className="text-[11px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
            Stops automatic refreshes; data stays available
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={onDisconnect}
        className="rounded-2xl px-4 py-3 text-center text-[13px] font-semibold"
        style={{ background: '#FEE2E2', color: '#B91C1C', fontFamily: SYNTH.font }}
      >
        Disconnect source
      </button>
    </SheetShell>
  )
}

function StatusIcon({ status }: { status: 'synced' | 'syncing' | 'error' }) {
  const map = {
    synced: { bg: SYNTH.accentEmerald, icon: <Check size={12} strokeWidth={3} color="#FFF" /> },
    syncing: { bg: SYNTH.accentAmber, icon: <RefreshCw size={12} strokeWidth={2.6} color="#FFF" /> },
    error: { bg: SYNTH.accentRed, icon: <AlertCircle size={12} strokeWidth={2.6} color="#FFF" /> },
  }[status]
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: map.bg }}>
      {map.icon}
    </span>
  )
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl px-3 py-3" style={{ background: SYNTH.sheetMuted }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
        {label}
      </p>
      <p className="mt-1 text-[18px] font-bold" style={{ color: SYNTH.ink, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
    </div>
  )
}

// — Add source —

export function AddSourceSheet({
  open,
  onClose,
  available,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  available: ConnectorMeta[]
  onAdd: (id: string) => void
}) {
  return (
    <SheetShell open={open} onClose={onClose} title="Add a source">
      <p className="text-[13px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
        Pick anything synth doesn't yet pull from. We'll handshake the OAuth and start synthesizing immediately.
      </p>
      <div className="flex flex-col gap-2">
        {available.length === 0 ? (
          <div className="rounded-2xl px-5 py-8 text-center" style={{ background: SYNTH.sheetMuted }}>
            <p className="text-[13px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
              All sources connected. Nothing to add.
            </p>
          </div>
        ) : (
          available.map((c) => (
            <motion.button
              key={c.id}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => onAdd(c.id)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left"
              style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}
            >
              <ConnectorLogo id={c.id} size={36} />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold" style={{ fontFamily: SYNTH.font }}>{c.name}</p>
                <p className="text-[11px] uppercase tracking-[0.12em]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
                  {c.category}
                </p>
              </div>
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand }}
              >
                <Plus size={14} strokeWidth={2.6} />
              </span>
            </motion.button>
          ))
        )}
      </div>
    </SheetShell>
  )
}

// — Quick stats overlay (for the bar-chart chip on home) —

export type QuickStatItem = {
  label: string
  value: string
  unit?: string
  delta?: { direction: 'up' | 'down' | 'flat'; value: string }
  source: string
  syncedAgo: string
}

export function QuickStatsSheet({
  open,
  onClose,
  title,
  stats,
}: {
  open: boolean
  onClose: () => void
  title: string
  stats: QuickStatItem[]
}) {
  return (
    <SheetShell open={open} onClose={onClose} title={title}>
      <div className="grid grid-cols-2 gap-2 pt-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl px-3 py-3" style={{ background: SYNTH.sheetMuted }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
              {s.label}
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[24px] font-bold leading-none" style={{ color: SYNTH.ink, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
                {s.value}
              </span>
              {s.unit ? (
                <span className="text-[11px] font-semibold" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
                  {s.unit}
                </span>
              ) : null}
              {s.delta ? (
                <span
                  className="ml-auto text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{
                    color:
                      s.delta.direction === 'up'
                        ? SYNTH.accentEmerald
                        : s.delta.direction === 'down'
                          ? SYNTH.accentRed
                          : SYNTH.inkMuted,
                    fontFamily: SYNTH.font,
                  }}
                >
                  {s.delta.direction === 'up' ? '↑' : s.delta.direction === 'down' ? '↓' : '·'} {s.delta.value}
                </span>
              ) : null}
            </div>
            <p
              className="mt-1 text-[10px] uppercase tracking-[0.1em]"
              style={{ color: SYNTH.provenanceOnSheet, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
            >
              {s.source} · {s.syncedAgo}
            </p>
          </div>
        ))}
      </div>
    </SheetShell>
  )
}
