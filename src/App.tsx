import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdvanceGateProvider } from './components/advanceGate'
import { DeckAdvanceProvider } from './components/DeckAdvanceContext'
import { SlideShell, type SlideDef } from './components/SlideShell'
import { AppendixDeck } from './appendix/AppendixDeck'
import { S01_Title } from './slides/S01_Title'
import { S02_Problem } from './slides/S02_Problem'
import { OurSolutionCover } from './slides/OurSolutionCover'
import { SetupAccountSlide } from './slides/SetupAccountSlide'
import { SynthAgentWorkflowSlide } from './slides/SynthAgentWorkflowSlide'
import { SF01_DashboardIntro, SF02_DeployExtension } from './slides/SolutionFlowSlides'
import { S04_Connectors } from './slides/S04_Connectors'
import { S05_Traction } from './slides/S05_Traction'
import { S06_WhyNow } from './slides/S06_WhyNow'
import { S07_Market } from './slides/S07_Market'
import { S08_BusinessModel } from './slides/S08_BusinessModel'
import { S09_Competition } from './slides/S09_Competition'
import { S10_Team } from './slides/S10_Team'
import { S11_Vision } from './slides/S11_Vision'
import { S12_Close } from './slides/S12_Close'
import { S13_ThankYou } from './slides/S13_ThankYou'
import { THEME } from './lib/theme'
import { DeckBlurLock } from './components/DeckBlurLock'
import { ProductPrototypeApp } from './prototype/ProductPrototypeApp'

function isPrototypeHash() {
  if (typeof window === 'undefined') return false
  const h = window.location.hash
  return h === '#prototype' || h.startsWith('#prototype/')
}

function MainDeck() {
  const [index, setIndex] = useState(0)

  const slides: SlideDef[] = useMemo(
    () => [
      {
        id: 's01',
        section: 'TITLE',
        component: <S01_Title />,
        background: THEME.darkDeep,
        frame: 'none',
        showTopNav: false,
        showProgress: false,
        showNavButtons: false,
      },
      { id: 's02', section: '01 · PROBLEM', component: <S02_Problem />, background: THEME.light },
      { id: 's02-solution', section: '02 · SOLUTION', component: <OurSolutionCover />, background: THEME.light },
      { id: 's02-setup', section: '02 · SOLUTION', component: <SetupAccountSlide />, background: THEME.light },
      { id: 's02-workflow', section: '02 · SOLUTION', component: <SynthAgentWorkflowSlide />, background: THEME.primary },
      { id: 's03a', section: '02 · SOLUTION', component: <SF01_DashboardIntro />, background: THEME.light },
      { id: 's03b', section: '02 · SOLUTION', component: <SF02_DeployExtension />, background: THEME.light },
      { id: 's04', section: '03 · CONNECTORS', component: <S04_Connectors />, background: THEME.light },
      { id: 's05', section: '04 · TRACTION', component: <S05_Traction />, background: THEME.light },
      { id: 's06', section: '05 · WHY NOW', component: <S06_WhyNow />, background: THEME.light },
      { id: 's07', section: '06 · MARKET', component: <S07_Market />, background: THEME.darkDeep },
      { id: 's08', section: '07 · BUSINESS MODEL', component: <S08_BusinessModel />, background: THEME.light },
      { id: 's09', section: '08 · COMPETITION', component: <S09_Competition />, background: THEME.darkDeep },
      { id: 's10', section: '09 · TEAM', component: <S10_Team />, background: THEME.darkDeep },
      { id: 's11', section: 'VISION', component: <S11_Vision />, background: THEME.light },
      { id: 's12', section: 'CLOSE', component: <S12_Close />, background: THEME.light },
      { id: 's13', section: 'THANK YOU', component: <S13_ThankYou />, background: THEME.primary },
    ],
    [],
  )

  const advanceDeck = useCallback(() => {
    setIndex((i) => Math.min(i + 1, slides.length - 1))
  }, [slides.length])

  return (
    <DeckAdvanceProvider advance={advanceDeck}>
      <DeckBlurLock printSlides={slides}>
        <div className="deck-print-hide h-full w-full min-h-0">
          <SlideShell slides={slides} index={index} setIndex={setIndex} />
        </div>
      </DeckBlurLock>
    </DeckAdvanceProvider>
  )
}

export default function App() {
  const [appendix, setAppendix] = useState(() =>
    typeof window !== 'undefined' ? window.location.hash === '#appendix' : false,
  )
  const [prototype, setPrototype] = useState(() => isPrototypeHash())

  useEffect(() => {
    const sync = () => {
      setAppendix(window.location.hash === '#appendix')
      setPrototype(isPrototypeHash())
    }
    window.addEventListener('hashchange', sync)
    sync()
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  if (prototype) {
    return (
      <AdvanceGateProvider>
        <ProductPrototypeApp />
      </AdvanceGateProvider>
    )
  }

  if (appendix) {
    return (
      <AdvanceGateProvider>
        <div className="deck-print-hide h-full w-full min-h-0">
          <AppendixDeck />
        </div>
      </AdvanceGateProvider>
    )
  }

  return (
    <AdvanceGateProvider>
      <MainDeck />
    </AdvanceGateProvider>
  )
}
