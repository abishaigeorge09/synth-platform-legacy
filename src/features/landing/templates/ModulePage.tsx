import { useState } from 'react'
import {
  PageShell, StandardHero, ValueBridge, CapabilityList,
  FeaturedQuote, IntegrationsStrip, ClosingCta, type StandardHeroProps, type Capability,
} from '../shell/primitives'

export type ModulePageConfig = {
  slug: string
  active: 'platform'
  hero: StandardHeroProps
  valueBridge: {
    eyebrow: string
    headline: React.ReactNode
    body: string
    media?: { kind: 'photo' | 'video' | 'illustration' | 'screenshot'; label: string; caption?: string }
  }
  capabilities: {
    eyebrow: string
    title: string
    coreCapabilities: Capability[]
    addOnCapabilities?: Capability[]
  }
  quote?: {
    quote: string
    attribution: string
    role: string
  }
  closing: {
    headline: React.ReactNode
    body?: string
    primary: { label: string; to: string }
    secondary?: { label: string; to: string }
  }
}

export function ModulePage({ config }: { config: ModulePageConfig }) {
  const hasAddOns = config.capabilities.addOnCapabilities && config.capabilities.addOnCapabilities.length > 0
  const [tab, setTab] = useState<'core capabilities' | 'feature add-ons'>('core capabilities')
  const tabs = hasAddOns ? ['core capabilities', 'feature add-ons'] : undefined
  const visible = tab === 'feature add-ons' && hasAddOns
    ? config.capabilities.addOnCapabilities!
    : config.capabilities.coreCapabilities

  return (
    <PageShell active="platform">
      <StandardHero {...config.hero} />
      <ValueBridge {...config.valueBridge} />
      <IntegrationsStrip />
      <CapabilityList
        eyebrow={config.capabilities.eyebrow}
        title={config.capabilities.title}
        tabs={tabs}
        activeTab={tab}
        onTab={t => setTab(t as 'core capabilities' | 'feature add-ons')}
        capabilities={visible}
      />
      {config.quote && <FeaturedQuote {...config.quote} />}
      <ClosingCta {...config.closing} />
    </PageShell>
  )
}
