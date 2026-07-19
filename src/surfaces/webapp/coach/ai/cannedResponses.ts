/**
 * Rule-based canned responder for the Phase 8 chat UI. Matches user input on
 * keywords and returns a plausible answer drawing on seeded data. Swap this
 * module for a real LLM call when the backend lands — the shape of the
 * response (string + citations[]) is the contract.
 */
import type { ChatScope } from '@shared/data/types'
import {
  SEED_ATHLETES,
  SEED_ERG_SCORES,
  SEED_SOURCES,
  SEED_ALERTS,
  SEED_ACTIVITY,
} from '@shared/data/seeds'
import { SEED_ATHLETE_YOY, getYoyFor } from '@shared/data/seeds/athleteExtras'

export type CannedReply = {
  content: string
  citations: { label: string; source: string }[]
}

function fmt2k(seconds?: number) {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = (seconds - m * 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

export function generateCannedReply(
  input: string,
  scope: ChatScope,
  scopedAthleteId?: string,
  teamId?: string,
): CannedReply {
  void teamId
  const q = input.toLowerCase()
  const scopedAthlete = scopedAthleteId
    ? SEED_ATHLETES.find((a) => a.id === scopedAthleteId)
    : null

  // Athlete-scoped chat ────────────────────────────────────────────────────
  if (scope === 'athlete' && scopedAthlete) {
    const erg = SEED_ERG_SCORES.find((e) => e.athleteId === scopedAthlete.id)
    const yoy = getYoyFor(scopedAthlete.id)
    if (q.includes('ready') || q.includes('race') || q.includes('saturday')) {
      return {
        content: `${scopedAthlete.name.split(' ')[0]} looks **ready**. Last 2K test on ${erg?.date} was **${fmt2k(
          erg?.timeSeconds,
        )}** at ${erg?.watts ?? '—'}W${
          yoy ? ` — a ${Math.abs(yoy.deltaSec).toFixed(1)}s improvement vs. ${yoy.date2025}` : ''
        }. No open alerts, wearable recovery trending on baseline.`,
        citations: [
          { label: 'erg_scores', source: `2026-03-16 · 316 2K workbook` },
          { label: 'wearable hub', source: 'Whoop rollup · live' },
        ],
      }
    }
    if (q.includes('trend') || q.includes('progress') || q.includes('compare')) {
      if (yoy) {
        return {
          content: `${scopedAthlete.name.split(' ')[0]}'s 2K has gone from **${fmt2k(yoy.sec2025)}** (${
            yoy.date2025
          }) → **${fmt2k(yoy.sec2026)}** (${yoy.date2026}) — a ${Math.abs(yoy.deltaSec).toFixed(
            1,
          )}s ${yoy.deltaSec < 0 ? 'improvement' : 'regression'}.`,
          citations: [
            { label: 'erg_scores', source: `${yoy.date2025} + ${yoy.date2026}` },
          ],
        }
      }
    }
    if (erg) {
      return {
        content: `Here's what I see for **${scopedAthlete.name}**: latest 2K ${fmt2k(
          erg.timeSeconds,
        )} on ${erg.date}, avg split ${fmt2k(erg.splitSeconds)}, ${erg.watts ?? '—'}W, ${erg.spm ?? '—'} spm.`,
        citations: [{ label: 'erg_scores', source: `${erg.date} · 316 2K workbook` }],
      }
    }
  }

  // Self-scoped (athlete's own chat) ──────────────────────────────────────
  if (scope === 'self') {
    if (q.includes('trend') || q.includes('month') || q.includes('progress')) {
      return {
        content:
          'Your rolling 30-day average split dropped from 1:43.1 to 1:41.8 — a 1.3-second improvement. Keep the current stroke-rate distribution.',
        citations: [
          { label: 'erg_scores', source: 'last 30 days' },
          { label: 'session_splits', source: '4 recent sessions' },
        ],
      }
    }
    if (q.includes('focus') || q.includes('test') || q.includes('2k')) {
      return {
        content:
          'Before the next 2K test, focus on the first 500 — your splits in the opening piece are 0.8s slower than your 1.5K mark. Keep the taper and aim for a 1:40.5 open.',
        citations: [{ label: 'session_splits', source: 'last 4 pieces' }],
      }
    }
    return {
      content:
        'I can answer questions scoped to your own data — erg trends, session splits, lineup history, wellness. What would you like to know?',
      citations: [],
    }
  }

  // Team-wide chat ─────────────────────────────────────────────────────────
  if (q.includes('improved') || q.includes('best') || q.includes('top')) {
    const top = [...SEED_ATHLETE_YOY]
      .sort((a, b) => a.deltaSec - b.deltaSec)
      .slice(0, 3)
    return {
      content: `Top improvers on the roster since last year: ${top
        .map((p) => {
          const a = SEED_ATHLETES.find((x) => x.id === p.athleteId)
          return `**${a?.name ?? p.athleteId}** (${p.deltaSec.toFixed(1)}s)`
        })
        .join(', ')}. All measured against the 2025-03-17 test.`,
      citations: [{ label: 'erg_scores (YoY)', source: `${SEED_ATHLETE_YOY.length} paired athletes` }],
    }
  }
  if (q.includes('average') || q.includes('avg') || q.includes('2k')) {
    const sum = SEED_ERG_SCORES.reduce((acc, e) => acc + e.timeSeconds, 0)
    const avg = sum / SEED_ERG_SCORES.length
    return {
      content: `Team average on the most recent 2K test (${SEED_ERG_SCORES.length} athletes): **${fmt2k(
        avg,
      )}**. The fastest ${
        SEED_ERG_SCORES[0] ? `was ${fmt2k(SEED_ERG_SCORES.sort((a, b) => a.timeSeconds - b.timeSeconds)[0].timeSeconds)}` : ''
      }.`,
      citations: [{ label: 'erg_scores', source: '2026-03-16 · 316 2K workbook' }],
    }
  }
  if (q.includes('gym') || q.includes('log') || q.includes('missed')) {
    return {
      content:
        'Two athletes are flagged for gym-log gaps: **Perry Osgood** (5 days) and one more for 2+ days. Both flagged by the TeamWorks compliance connector.',
      citations: [
        { label: 'alerts', source: SEED_ALERTS.map((a) => a.id).join(', ') },
        { label: 'teamworks', source: 'compliance scan · 14h ago' },
      ],
    }
  }
  if (q.includes('alert') || q.includes('risk') || q.includes('flag')) {
    return {
      content: `${SEED_ALERTS.length} active alerts on the team right now: ${SEED_ALERTS.map(
        (a) => `**${a.title}**`,
      ).join(', ')}.`,
      citations: [{ label: 'alerts', source: `${SEED_ALERTS.length} open` }],
    }
  }
  if (q.includes('source') || q.includes('sync') || q.includes('connector')) {
    const healthy = SEED_SOURCES.filter((s) => s.status === 'healthy').length
    return {
      content: `${healthy} of ${SEED_SOURCES.length} connectors are healthy: ${SEED_SOURCES.map(
        (s) => s.name,
      ).join(', ')}. Last scan across all sources within the last 14 hours.`,
      citations: [{ label: 'sources', source: `${SEED_SOURCES.length} connectors` }],
    }
  }
  if (q.includes('recent') || q.includes('activity') || q.includes('happening')) {
    return {
      content: `Latest activity: ${SEED_ACTIVITY.slice(0, 3)
        .map((a) => `**${a.title}**`)
        .join(' · ')}.`,
      citations: [{ label: 'activity', source: `${SEED_ACTIVITY.length} events` }],
    }
  }

  // Default
  return {
    content:
      'I can see every synthesized signal for this team — erg scores, gym compliance, wellness, lineups, and session splits. Try asking about **top improvers**, **team average 2K**, **missed gym logs**, or a **specific athlete**.',
    citations: [{ label: 'source_data', source: 'all connectors' }],
  }
}
