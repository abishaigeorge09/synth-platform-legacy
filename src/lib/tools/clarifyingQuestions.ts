/**
 * Sprint 5.6 — keyword-derived clarifying questions, mock-only.
 *
 * Sprint 9's v0 will replace this with model-generated clarifications.
 * For now, the chat shows three quick-tap chips before generation fires.
 * Coaches can pick / answer / skip — answers (if any) are appended to
 * the prompt before generation.
 */

type Rule = { keyword: string; questions: string[] }

const RULES: Rule[] = [
  {
    keyword: 'stroke rate',
    questions: ['Which athlete?', 'Last 7 or 14 days?', 'Compare to baseline?'],
  },
  {
    keyword: 'concept2',
    questions: ['Which athlete?', 'Last 7 or 14 days?', 'Compare to baseline?'],
  },
  {
    keyword: 'lineup',
    questions: ['Boat A?', 'Boat B?', 'Per-seat or summary?'],
  },
  {
    keyword: 'compare',
    questions: ['Boat A?', 'Boat B?', 'Per-seat or summary?'],
  },
  {
    keyword: 'wellness',
    questions: ['Which boat?', 'Daily or weekly?', 'Highlight flagged athletes?'],
  },
  {
    keyword: 'lap',
    questions: [
      'Which boat?',
      'Auto-stop after how many?',
      'Track splits or just elapsed?',
    ],
  },
  {
    keyword: 'race plan',
    questions: ['Which athlete?', 'Which regatta?', 'Predicted vs target splits?'],
  },
  {
    keyword: 'race',
    questions: ['Which athlete?', 'Which regatta?', 'Predicted vs target splits?'],
  },
]

const DEFAULT_QUESTIONS = [
  'Which team?',
  'Time window?',
  'Compare to baseline?',
]

export function deriveQuestions(prompt: string): string[] {
  const q = prompt.toLowerCase()
  for (const rule of RULES) {
    if (q.includes(rule.keyword)) return rule.questions
  }
  return DEFAULT_QUESTIONS
}
