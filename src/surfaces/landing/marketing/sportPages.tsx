import { SportPage } from '../templates/SportPage'
import { SPORT_CONFIGS } from './sportConfigs'

export function RunningPage()  { return <SportPage config={SPORT_CONFIGS.running} /> }
export function CyclingPage()  { return <SportPage config={SPORT_CONFIGS.cycling} /> }
export function SwimmingPage() { return <SportPage config={SPORT_CONFIGS.swimming} /> }
export function RowingPage()   { return <SportPage config={SPORT_CONFIGS.rowing} /> }
export function LiftingPage()  { return <SportPage config={SPORT_CONFIGS.lifting} /> }
export function TeamsPage()    { return <SportPage config={SPORT_CONFIGS.teams} /> }
