/**
 * Programmatic smoke test for ToolRenderer.
 *
 * The Sprint 3 prompt called for a manual visual verification recipe; this
 * file provides mechanical SSR-render coverage as a complement (no jsdom,
 * no RTL — just react-dom/server). Confirms that every example spec
 * renders to markup without throwing. Catches typos, broken Recharts
 * shapes, missing registry entries, and resolver mismatches in CI.
 */
import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ToolRenderer } from './ToolRenderer'
import { EXAMPLES } from './examples'

describe('ToolRenderer — SSR smoke', () => {
  for (const spec of EXAMPLES) {
    it(`${spec.id} renders to markup without throwing`, () => {
      expect(() =>
        renderToStaticMarkup(createElement(ToolRenderer, { spec })),
      ).not.toThrow()
    })

    it(`${spec.id} produces non-empty markup`, () => {
      const markup = renderToStaticMarkup(createElement(ToolRenderer, { spec }))
      expect(markup.length).toBeGreaterThan(50)
    })
  }
})
