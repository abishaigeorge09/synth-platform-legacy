import { useMemo } from 'react'
import { useAthletes } from '@shared/data/queries'
import type { Athlete } from '@shared/data/types'

export type AttentionSeverity = 'high' | 'med' | 'low'

export type AttentionSignalTemplate = {
  id: string
  signal: string
  source: string
  syncedLabel: string
  severity: AttentionSeverity
}

export type AttentionItem = AttentionSignalTemplate & {
  athleteId: string
  athleteName: string
  initials: string
}

// 10 diverse attention signals — performance, recovery, training-load,
// schedule, wellness, and positive streaks. Order is roughly by severity
// so the home-page top-3 surfaces the most pressing.
export const ATTENTION_SIGNAL_TEMPLATES: AttentionSignalTemplate[] = [
  {
    id: 'att-erg-slip',
    signal: '2K split slipped 7.2s vs 4-week avg',
    source: 'Concept2',
    syncedLabel: '36m ago',
    severity: 'high',
  },
  {
    id: 'att-sleep-debt',
    signal: 'Recovery 38 — 3 nights of poor sleep',
    source: 'WHOOP',
    syncedLabel: '12m ago',
    severity: 'high',
  },
  {
    id: 'att-hrv-low',
    signal: 'HRV 18% below baseline for 8 days',
    source: 'Oura',
    syncedLabel: '1h ago',
    severity: 'high',
  },
  {
    id: 'att-volume-spike',
    signal: 'Training volume up 42% week-over-week',
    source: 'Concept2',
    syncedLabel: '22m ago',
    severity: 'med',
  },
  {
    id: 'att-gym-miss',
    signal: 'Missed 2 of 4 planned gym sessions this week',
    source: 'Bridge Athletics',
    syncedLabel: '4h ago',
    severity: 'med',
  },
  {
    id: 'att-schedule-conflict',
    signal: 'Schedule conflict — midterm + AM practice Apr 28',
    source: 'Google Calendar',
    syncedLabel: '8m ago',
    severity: 'med',
  },
  {
    id: 'att-resting-hr',
    signal: 'Resting HR up 8 bpm — possible illness',
    source: 'Apple Health',
    syncedLabel: '18m ago',
    severity: 'med',
  },
  {
    id: 'att-soreness',
    signal: 'Soreness check-ins trending up (3 → 7 in 5 days)',
    source: 'synth · check-ins',
    syncedLabel: '2h ago',
    severity: 'med',
  },
  {
    id: 'att-streak',
    signal: 'Hit 23-day training streak — longest on team',
    source: 'synth',
    syncedLabel: 'live',
    severity: 'low',
  },
  {
    id: 'att-pr',
    signal: '5K PR — 17.4s improvement vs prior best',
    source: 'Concept2',
    syncedLabel: '6m ago',
    severity: 'low',
  },
]

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

export function pairSignalsWithAthletes(
  templates: AttentionSignalTemplate[],
  athletes: Athlete[],
): AttentionItem[] {
  if (athletes.length === 0) return []
  return templates.map((t, i) => {
    const athlete = athletes[i % athletes.length]!
    return {
      ...t,
      athleteId: athlete.id,
      athleteName: athlete.name,
      initials: initialsOf(athlete.name),
    }
  })
}

/**
 * Returns 10 attention items, each pairing a signal template with a real
 * web-seed athlete (pulled from useAthletes). Stable across renders for
 * the same athlete order.
 */
export function useAttentionItems(): AttentionItem[] {
  const { data: athletes } = useAthletes()
  return useMemo(
    () => pairSignalsWithAthletes(ATTENTION_SIGNAL_TEMPLATES, athletes),
    [athletes],
  )
}
