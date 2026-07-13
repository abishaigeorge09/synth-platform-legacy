import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { THEME } from '@lib/theme'
import { toast } from '@shared/store/useToastStore'
import {
  confirmIngestion,
  type ConfirmOverride,
} from '@lib/ingest/uploadClient'
import {
  MATCH_AUTO_THRESHOLD,
  MATCH_FLAG_THRESHOLD,
} from '@lib/ingest/athleteMatch'
import { useAthletes } from '@shared/data/queries'
import type {
  IngestionEvent,
  IngestionPreview,
  UUID,
} from '@shared/data/types'

type Override = {
  athleteId?: UUID | null
  reject?: boolean
}

export function IngestionPreviewPanel({
  preview,
  onDone,
  onCancel,
}: {
  preview: IngestionPreview
  onDone: (result: { confirmedCount: number; rejectedCount: number }) => void
  onCancel: () => void
}) {
  const { data: athletes } = useAthletes()
  const [overrides, setOverrides] = useState<Record<UUID, Override>>({})
  const [submitting, setSubmitting] = useState(false)

  const athleteById = useMemo(() => {
    const m = new Map<UUID, string>()
    for (const a of athletes) m.set(a.id, a.name)
    return m
  }, [athletes])

  const events = preview.events
  const matched = useMemo(
    () => events.filter((e) => effectiveAthlete(e, overrides[e.id])).length,
    [events, overrides],
  )
  const rejected = useMemo(
    () => events.filter((e) => overrides[e.id]?.reject).length,
    [events, overrides],
  )

  function setRowOverride(eventId: UUID, patch: Override) {
    setOverrides((prev) => ({
      ...prev,
      [eventId]: { ...prev[eventId], ...patch },
    }))
  }

  async function onConfirm() {
    setSubmitting(true)
    const overrideList: ConfirmOverride[] = []
    for (const evt of events) {
      const o = overrides[evt.id]
      if (!o) continue
      if (o.reject) overrideList.push({ eventId: evt.id, reject: true })
      else if (o.athleteId !== undefined && o.athleteId !== evt.athleteId) {
        overrideList.push({ eventId: evt.id, athleteId: o.athleteId })
      }
    }
    try {
      const result = await confirmIngestion(preview.upload.id, overrideList)
      toast(
        `Confirmed ${result.confirmedCount} events from ${preview.upload.filename}`,
        'success',
      )
      onDone(result)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      toast(`Confirm failed: ${msg}`, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      {/* Summary header */}
      <div
        className="rounded-xl border p-4"
        style={{ background: THEME.light, borderColor: THEME.border }}
      >
        <div
          className="text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          Preview · {preview.upload.kind.toUpperCase()}
        </div>
        <div
          className="mt-0.5 text-[15px] font-semibold"
          style={{ color: THEME.textPrimary }}
        >
          {preview.upload.filename}
        </div>
        <div
          className="mt-1 text-[12px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
        >
          {events.length} events extracted · {matched} matched ·{' '}
          {events.length - matched - rejected} unmatched · {rejected} rejected
        </div>
      </div>

      {/* Empty state */}
      {events.length === 0 && (
        <div
          className="rounded-lg border border-dashed p-6 text-center text-[12px]"
          style={{ borderColor: THEME.border, color: THEME.textSecondary }}
        >
          Claude couldn't extract any events from this file. Try a different
          upload, or check that the file contains athlete-keyed data.
        </div>
      )}

      {/* Event table */}
      {events.length > 0 && (
        <div
          className="overflow-x-auto rounded-lg border"
          style={{ borderColor: THEME.border }}
        >
          <table className="w-full min-w-[720px] text-[12px]">
            <thead>
              <tr
                style={{
                  background: THEME.light,
                  fontFamily: THEME.fontMono,
                  color: THEME.textMuted,
                }}
              >
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider">
                  Athlete
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider">
                  Category
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider">
                  Value
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider">
                  Conf.
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((evt) => {
                const o = overrides[evt.id]
                const isRejected = !!o?.reject
                const effId = effectiveAthlete(evt, o)
                const candidates = preview.candidates[evt.id] ?? []
                const matchScore = evt.matchConfidence ?? null
                const flagged =
                  effId !== null &&
                  matchScore !== null &&
                  matchScore < MATCH_AUTO_THRESHOLD

                return (
                  <tr
                    key={evt.id}
                    className="border-t"
                    style={{
                      borderColor: THEME.border,
                      opacity: isRejected ? 0.4 : 1,
                      background: !effId
                        ? `${THEME.amber}0a`
                        : undefined,
                    }}
                  >
                    <td
                      className="px-3 py-2"
                      style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
                    >
                      {evt.occurredAt.slice(0, 10)}
                    </td>
                    <td className="px-3 py-2">
                      <AthleteCell
                        evt={evt}
                        currentAthleteId={effId}
                        candidates={candidates}
                        roster={athletes.map((a) => ({ id: a.id, name: a.name }))}
                        athleteById={athleteById}
                        flagged={flagged}
                        onChange={(athleteId) =>
                          setRowOverride(evt.id, { athleteId, reject: false })
                        }
                      />
                    </td>
                    <td className="px-3 py-2" style={{ color: THEME.textPrimary }}>
                      {evt.category}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
                    >
                      {evt.metric}
                    </td>
                    <td className="px-3 py-2" style={{ color: THEME.textPrimary }}>
                      {evt.value !== undefined && evt.value !== null
                        ? `${evt.value}${evt.unit ? ` ${evt.unit}` : ''}`
                        : evt.valueText ?? '—'}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
                    >
                      {evt.extractionConfidence !== undefined
                        ? evt.extractionConfidence.toFixed(2)
                        : '—'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setRowOverride(evt.id, { reject: !isRejected })
                        }
                        className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          borderColor: isRejected ? THEME.red : THEME.border,
                          background: isRejected
                            ? `${THEME.red}10`
                            : 'var(--bg-primary)',
                          color: isRejected ? THEME.red : THEME.textSecondary,
                          fontFamily: THEME.fontMono,
                        }}
                      >
                        {isRejected ? 'Rejected' : 'Reject'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={submitting}
          onClick={onCancel}
          className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
          style={{
            borderColor: THEME.border,
            background: 'var(--bg-primary)',
            color: THEME.textSecondary,
            fontFamily: THEME.fontMono,
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={submitting || events.length === 0}
          onClick={onConfirm}
          className="rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
          style={{
            background: THEME.primary,
            color: THEME.white,
            fontFamily: THEME.fontMono,
          }}
        >
          {submitting
            ? 'Confirming…'
            : `Confirm ${events.length - rejected} events`}
        </button>
      </div>
    </motion.div>
  )
}

function effectiveAthlete(
  evt: IngestionEvent,
  override: Override | undefined,
): UUID | null {
  if (override?.reject) return null
  if (override?.athleteId !== undefined) return override.athleteId
  return evt.athleteId
}

function AthleteCell({
  evt,
  currentAthleteId,
  candidates,
  roster,
  athleteById,
  flagged,
  onChange,
}: {
  evt: IngestionEvent
  currentAthleteId: UUID | null
  candidates: Array<{ athleteId: UUID; name: string; score: number }>
  roster: Array<{ id: UUID; name: string }>
  athleteById: Map<UUID, string>
  flagged: boolean
  onChange: (athleteId: UUID | null) => void
}) {
  // Build dropdown options: top candidates first (with score badge),
  // then the full roster, then "Unmatched" sentinel.
  const seen = new Set<string>()
  const opts: Array<{ id: UUID | ''; name: string; hint?: string }> = []
  opts.push({ id: '', name: '— Unmatched —' })
  for (const c of candidates) {
    if (seen.has(c.athleteId)) continue
    seen.add(c.athleteId)
    opts.push({
      id: c.athleteId,
      name: c.name,
      hint: `${Math.round(c.score * 100)}%`,
    })
  }
  for (const r of roster) {
    if (seen.has(r.id)) continue
    seen.add(r.id)
    opts.push({ id: r.id, name: r.name })
  }

  const ringColor = !currentAthleteId
    ? THEME.amber
    : flagged
    ? THEME.amber
    : THEME.border

  return (
    <div className="flex flex-col gap-0.5">
      {evt.athleteNameRaw && (
        <div
          className="text-[10px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          file: “{evt.athleteNameRaw}”
        </div>
      )}
      <select
        value={currentAthleteId ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="rounded-md border bg-[var(--bg-primary)] px-2 py-1 text-[12px] outline-none"
        style={{
          borderColor: ringColor,
          fontFamily: THEME.fontMono,
          color: currentAthleteId ? THEME.textPrimary : THEME.amber,
          minWidth: 180,
        }}
      >
        {opts.map((o) => (
          <option key={`${o.id}-${o.name}`} value={o.id}>
            {o.name}
            {o.hint ? ` · ${o.hint}` : ''}
          </option>
        ))}
      </select>
      {currentAthleteId && (
        <div
          className="text-[10px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          → {athleteById.get(currentAthleteId) ?? currentAthleteId}
          {flagged && evt.matchConfidence !== undefined && (
            <span style={{ color: THEME.amber }}>
              {' '}
              · low conf {Math.round(evt.matchConfidence * 100)}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Re-export so consumers don't need to import from athleteMatch.ts
export { MATCH_AUTO_THRESHOLD, MATCH_FLAG_THRESHOLD }
