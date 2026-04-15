# Design foundation (presentation engine)

This repo is **standalone** (not under `presentations/`). The product UI uses the same tokens in `src/lib/theme.ts`, motion in `src/lib/motion.ts`, and prototype data in `src/prototype/`. The sections below describe the original deck engine and shared visual DNA.

---

# CLAUDE.md — Presentation Engine

## What This Is

A reusable full-screen presentation website framework. Every product gets its own branch, its own color palette, its own content — but the underlying architecture, animation system, component library, and design language stay the same.

The foundation is the **a16z State of Crypto 2023** aesthetic. Every presentation built on this engine inherits that DNA.

## Run Mode
```bash
claude --dangerously-skip-permissions
```

## Stack
```
React 18 + TypeScript + Vite 5
Tailwind CSS 3.4
Framer Motion 11
Google Fonts (varies per product)
Deploy: Vercel
```

No PowerPoint. No chart libraries. No component libraries. Everything is custom React + CSS + Framer Motion.

---

## FOUNDATION — What Never Changes

These elements are inherited by EVERY presentation regardless of product or brand:

### Architecture
- Full-screen: 100vw × 100vh per slide, no scrolling
- 16:9 aspect ratio enforced (letterbox on non-matching screens)
- React component per slide, keyboard + click navigation
- Framer Motion AnimatePresence for all transitions
- Progress bar at bottom, nav buttons bottom-right

### Navigation
- Click anywhere to advance
- Arrow keys: Right/Space/Enter = next, Left/Backspace = previous
- Bottom-right: ← → buttons + "7 / 14" counter
- Bottom: thin progress bar (accent color), 3px tall
- Slide transitions: 350ms fade + 16px vertical slide

### Core Components (always available)

```
SlideShell.tsx       — Fullscreen container, enforces 16:9, handles nav
TopNav.tsx           — a16z-style top bar: brand · deck name · year · section · page
HighlightLine.tsx    — Monospace text with colored background bar
PixelArt.tsx         — SVG pixel block patterns (cascade, swoosh, scatter, dense)
StatCard.tsx         — Dark card with colored left border + large number
DashedRule.tsx       — Dashed horizontal separator
SectionLabel.tsx     — "01 — SECTION NAME" green label
Tagline.tsx          — Bottom-center italic serif tagline
Logo.tsx             — Product wordmark (configurable)
BarChart.tsx         — Custom div-based animated bar chart
ComparisonTable.tsx  — Styled table with colored cells and tinted columns
TierCard.tsx         — Pricing card with staircase offset
ExpansionPath.tsx    — Boxes connected by CSS arrows
TeamCard.tsx         — Profile card with initials circle
MetricRow.tsx        — Large colored number + description text
```

### Slide Types (reusable templates)

Every presentation mixes and matches from these templates:

```
CoverSlide          — Full-bleed color bg, pixel art, massive monospace headline with highlight bars, logo
LogoRevealCover     — Two-phase: logo animation on black → crossfade to CoverSlide
ContentSlide        — Light bg, serif headline, dashed rule, body text + visual element
StatSlide           — Dark bg, headline, stat cards stacked on right side
GridSlide           — 2×2 or 3-column card grid with accent borders
ComparisonSlide     — Dark bg, styled comparison table
TeamSlide           — Dark bg, profile cards in a row
PricingSlide        — Light bg, staircase tier cards
ChartSlide          — Dark bg, headline + custom bar/line chart
CloseSlide          — Dark bg, numbered takeaways, centered logo
```

### Animation Presets

```typescript
// lib/motion.ts — shared across all presentations

export const TRANSITIONS = {
  page: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  spring: { type: "spring", stiffness: 200, damping: 25 },
  springSnappy: { type: "spring", stiffness: 400, damping: 30 },
  smooth: { duration: 0.4, ease: "easeOut" },
  fast: { duration: 0.15, ease: "easeOut" },
};

export const STAGGER = {
  cards: 0.08,
  highlights: 0.1,
  pixels: 0.03,
  bars: 0.15,
  letters: 0.08,
};

export const VARIANTS = {
  fadeUp: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  },
  highlightBar: {
    initial: { scaleX: 0, transformOrigin: "left" },
    animate: { scaleX: 1 },
  },
  barGrow: {
    initial: { height: 0 },
    animate: (h) => ({ height: h }),
  },
};
```

### Pixel Art Patterns

```typescript
// lib/pixelPatterns.ts — generates architectural pixel block layouts

type Pattern = "cascade-tr" | "cascade-bl" | "swoosh" | "scatter" | "dense";

// Each pattern returns an array of { x, y, w, h, shade } blocks
// Blocks are grid-aligned (snap to 10px), sizes from [10,15,20,25,30,40]
// "cascade-tr": 40+ blocks flowing diagonally from top-right
// "cascade-bl": mirror, bottom-left corner
// "swoosh": arc of pixels across 60% width
// "scatter": sparse individual blocks at edges
// "dense": both corners + scattered (for vision/closing slides)
```

### Typography Rules

```
Headlines (section covers):  Monospace, 700, uppercase, tight tracking
Body headlines:              Serif, 700, mixed case
Body text:                   Sans-serif, 400, 15px, 1.6 line-height
Data/numbers:                Monospace, 500-700
Labels:                      Monospace, 500, 10-11px, uppercase, wide tracking
Nav:                         Monospace, 400, 11px
Taglines:                    Serif, italic, 13-14px
```

### Visual Element Rules

```
Highlight bars:    40-50% opacity accent, 110% line height, staircase widths, animate from left
Stat cards:        Dark bg (#18181B), 5px colored left border, 36-42px monospace number
Dashed rules:      2px dashed, 50% opacity, between headline and body on content slides
Section labels:    Monospace, bold, accent color, "01 — SECTION" format
Taglines:          Italic serif, centered, bottom 20-24px, accent color
Top nav:           5 items evenly spaced, monospace, 40-50% opacity
Pixel art:         SVG blocks, 10-18% opacity, darker shades of bg color, architectural flow
```

---

## CUSTOMIZATION — What Changes Per Product

Each product overrides these values in a `theme.ts` file:

```typescript
// src/lib/theme.ts — override per product

export const THEME = {
  // Brand
  name: "synth.",
  logoFont: "'JetBrains Mono', monospace",
  logoWeight: 600,
  logoDotColor: "#10B981",
  tagline: "Every signal. One surface.",

  // Deck metadata (shown in top nav)
  deckName: "Pitch Deck",
  year: "2026",

  // Colors — primary palette
  primary: "#059669",
  primaryDark: "#047857",
  primaryDarker: "#065F46",
  primaryLight: "#A7F3D0",
  accent: "#10B981",

  // Colors — semantic
  blue: "#3B82F6",
  amber: "#F59E0B",
  red: "#EF4444",
  cyan: "#06B6D4",
  purple: "#8B5CF6",

  // Colors — surfaces
  dark: "#18181B",
  darkDeep: "#0C0A09",
  darkMid: "#27272A",
  light: "#FAFAF9",
  white: "#FFFFFF",

  // Colors — text
  textPrimary: "#18181B",
  textSecondary: "#52525B",
  textMuted: "#A1A1AA",
  border: "#E4E4E7",

  // Typography
  fontMono: "'JetBrains Mono', monospace",
  fontSerif: "'Fraunces', Georgia, serif",
  fontSans: "'Instrument Sans', system-ui, sans-serif",
  fontImport: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap",

  // Logo animation
  logoReveal: {
    dotFirst: true,
    typewriterSpeed: 80,
    crossfadeDuration: 600,
    showSubtitle: true,
    showLine: true,
  },

  // Pixel art
  pixelOpacity: 0.12,
  pixelSizes: [10, 15, 20, 25, 30, 40],
};
```

### To Create a New Presentation

1. `git checkout -b [product-name]-deck`
2. Copy `src/lib/theme.ts` and update colors, fonts, name
3. Create slides in `src/slides/` using the template components
4. Update `src/App.tsx` with the slide array
5. `vercel --prod`

---

## LOGO FILES — Usage Per Slide Context

Logo files are in `public/logos/`. Use the correct variant based on slide background:

| Background | Logo File | Notes |
|---|---|---|
| Green (#059669) | `synth-logo-on-green.svg` | White text + light green dot (#A7F3D0) |
| Dark (#0C0A09, #18181B) | `synth-logo-white.svg` | White text + green dot (#10B981) |
| Light (#FAFAF9, #FFFFFF) | `synth-logo-dark.svg` | Dark text + green dot (#10B981) |
| Any (nav bar, subtle) | `synth-logo-muted.svg` | Gray text + green dot |
| All green (monochrome) | `synth-logo-green.svg` | Green text + brighter green dot |

**Favicon / App Icon:** `synth-icon-green.svg` (or PNG at 32×32, 16×16)

**PNG sizes available (for non-SVG contexts):**
- Logos: 800×240, 400×120, 200×60
- Icons: 512×512, 120×120, 64×64, 32×32, 16×16

**In the presentation:**
- Slide 1 (logo reveal phase): render the logo as HTML text (JetBrains Mono) for the typewriter animation — don't use an image file
- Slide 1 (title phase, bottom-right): `synth-logo-on-green.svg`
- Dark slides (7, 9, 11, 12, 14): `synth-logo-white.svg` if logo appears
- Light slides (2, 4, 5, 8, 10): `synth-logo-dark.svg` if logo appears
- Section covers (3, 6, 13): `synth-logo-on-green.svg`

Copy all logo files into `public/logos/` when setting up the project.

---

## FILE STRUCTURE

```
src/
├── main.tsx
├── App.tsx
├── index.css
├── lib/
│   ├── theme.ts                 // ← CHANGE THIS PER PRODUCT
│   ├── colors.ts
│   ├── motion.ts                // Shared animation presets
│   └── pixelPatterns.ts         // Shared pixel art generators
├── components/                  // ← SHARED, NEVER CHANGE
│   ├── SlideShell.tsx
│   ├── TopNav.tsx
│   ├── HighlightLine.tsx
│   ├── PixelArt.tsx
│   ├── StatCard.tsx
│   ├── DashedRule.tsx
│   ├── SectionLabel.tsx
│   ├── Tagline.tsx
│   ├── Logo.tsx
│   ├── BarChart.tsx
│   ├── ComparisonTable.tsx
│   ├── TierCard.tsx
│   ├── ExpansionPath.tsx
│   ├── TeamCard.tsx
│   └── MetricRow.tsx
├── templates/                   // ← SHARED slide layouts
│   ├── CoverSlide.tsx
│   ├── LogoRevealCover.tsx
│   ├── ContentSlide.tsx
│   ├── StatSlide.tsx
│   ├── GridSlide.tsx
│   ├── ComparisonSlide.tsx
│   ├── TeamSlide.tsx
│   ├── PricingSlide.tsx
│   ├── ChartSlide.tsx
│   └── CloseSlide.tsx
└── slides/                      // ← CHANGE THESE PER PRODUCT
    ├── S01_Title.tsx
    ├── S02_Problem.tsx
    ├── ...
    └── S14_Close.tsx
```

## DEPENDENCIES

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

## CRITICAL RULES

1. Zero PowerPoint. Zero pptxgenjs. Pure web.
2. Every component reads from `theme.ts` — no hardcoded colors in slide files.
3. Pixel art must be large and architectural on section covers — not decorative confetti.
4. Highlight bars must staircase (each line independently sized) and animate from left.
5. All charts are div-based with Framer Motion — no chart libraries.
6. Target viewport: 1440×900. Letterbox on other sizes.
7. The a16z DNA must be obvious on every slide.
