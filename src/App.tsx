import { BrowserRouter, useRoutes } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { routes } from './app/routes'

function AppRoutes() {
  return useRoutes(routes)
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </MotionConfig>
  )
}
