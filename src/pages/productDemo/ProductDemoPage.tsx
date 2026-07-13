import { Link } from 'react-router-dom'
import { THEME } from '@lib/theme'

export function ProductDemoPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col" style={{ background: THEME.white }}>
      <header
        className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b px-5 py-3 sm:px-10"
        style={{ background: THEME.white, borderColor: THEME.border }}
      >
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-opacity hover:opacity-100"
            style={{ borderColor: THEME.border, color: THEME.textPrimary, fontFamily: THEME.fontMono }}
          >
            ← Back
          </Link>
          <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
            Product Demo
          </div>
        </div>
        <a
          href="/demos/synth_demo_nature.html"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-opacity hover:opacity-100"
          style={{ borderColor: THEME.border, color: THEME.textPrimary, fontFamily: THEME.fontMono }}
        >
          Open in new tab ↗
        </a>
      </header>

      <div className="flex-1">
        <iframe
          title="synth. Product Demo"
          src="/demos/synth_demo_nature.html"
          className="h-full w-full"
          style={{ border: 'none' }}
          loading="lazy"
        />
      </div>
    </div>
  )
}

