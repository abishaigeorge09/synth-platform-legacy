import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initAuth } from '@shared/store/authInit'
import { initAnalytics, posthog } from '@shared/analytics/posthog'
import { PostHogErrorBoundary, PostHogProvider } from '@posthog/react'

initAuth()
initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <PostHogErrorBoundary>
        <App />
      </PostHogErrorBoundary>
    </PostHogProvider>
  </StrictMode>,
)
