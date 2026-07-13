import { BrowserRouter, useRoutes } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { routes } from '@app/routes'
import { AccessGate } from '@pages/gate/AccessGate'

function AppRoutes() {
  return useRoutes(routes)
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        {/* AccessGate wraps everything — landing (/) and the app
            (/app/*) — so casual visitors hit the passcode wall first.
            Children stay mounted underneath; the gate fades out on
            unlock without re-initialising routes or stores. */}
        <AccessGate>
          <AppRoutes />
        </AccessGate>
      </BrowserRouter>
    </MotionConfig>
  )
}
