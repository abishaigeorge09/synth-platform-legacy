import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdvanceGateProvider } from '../components/advanceGate'
import { DeckAdvanceProvider } from '../components/DeckAdvanceContext'
import { SlideShell, type SlideDef } from '../components/SlideShell'
import { DeployAgentProcessingSlide } from '../slides/DeployAgentProcessingSlide'
import { SolutionDataHubSlide } from '../slides/SolutionDataHubSlide'
import {
  SF03_ExtensionLive,
  SF04_ConnectSources,
  SF05_PlayerInsights,
  SF06_SourceScreens,
  SF07_CustomTools,
} from '../slides/SolutionFlowSlides'
import { THEME } from '../lib/theme'
import { APPENDIX_SLIDE_TOTAL } from '../lib/deckTotal'

/**
 * Draft slides removed from the main deck — open via `/#appendix`.
 * Same navigation as the main deck; not part of the primary story order.
 */
export function AppendixDeck() {
  const [index, setIndex] = useState(0)

  const slides: SlideDef[] = useMemo(
    () => [
      {
        id: 'draft-deploy',
        section: 'APPENDIX · DRAFTS',
        component: <DeployAgentProcessingSlide />,
        background: THEME.light,
      },
      {
        id: 'draft-hub',
        section: 'APPENDIX · DRAFTS',
        component: <SolutionDataHubSlide />,
        background: THEME.light,
      },
      { id: 'draft-sf03', section: 'APPENDIX · DRAFTS', component: <SF03_ExtensionLive />, background: THEME.light },
      { id: 'draft-sf04', section: 'APPENDIX · DRAFTS', component: <SF04_ConnectSources />, background: THEME.light },
      { id: 'draft-sf05', section: 'APPENDIX · DRAFTS', component: <SF05_PlayerInsights />, background: THEME.light },
      { id: 'draft-sf06', section: 'APPENDIX · DRAFTS', component: <SF06_SourceScreens />, background: THEME.light },
      { id: 'draft-sf07', section: 'APPENDIX · DRAFTS', component: <SF07_CustomTools />, background: THEME.light },
    ],
    [],
  )

  const advanceDeck = useCallback(() => {
    setIndex((i) => Math.min(i + 1, slides.length - 1))
  }, [slides.length])

  useEffect(() => {
    document.title = 'Synth · Appendix (drafts)'
    return () => {
      document.title = 'Synth · Pitch Deck'
    }
  }, [])

  return (
    <AdvanceGateProvider>
      <DeckAdvanceProvider advance={advanceDeck}>
        <div className="relative flex h-full min-h-0 w-full flex-col">
          <a
            href="#"
            className="absolute right-4 top-3 z-[200] rounded-md border px-3 py-1.5 text-[10px] font-semibold shadow-sm"
            style={{
              fontFamily: THEME.fontMono,
              borderColor: THEME.border,
              background: THEME.light,
              color: THEME.textPrimary,
            }}
            onClick={(e) => {
              e.preventDefault()
              window.location.hash = ''
            }}
          >
            ← Main deck
          </a>
          <p
            className="pointer-events-none absolute left-4 top-3 z-[200] text-[10px] font-bold uppercase tracking-wider text-zinc-400"
            style={{ fontFamily: THEME.fontMono }}
          >
            Appendix · drafts ({APPENDIX_SLIDE_TOTAL})
          </p>
          <div className="min-h-0 flex-1 pt-9">
            <SlideShell slides={slides} index={index} setIndex={setIndex} />
          </div>
        </div>
      </DeckAdvanceProvider>
    </AdvanceGateProvider>
  )
}
