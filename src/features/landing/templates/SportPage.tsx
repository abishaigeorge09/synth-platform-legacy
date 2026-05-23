import {
  PageShell, StandardHero, ValueBridge, CapabilityList,
  FeaturedQuote, IntegrationsStrip, type StandardHeroProps, type Capability,
} from '../shell/primitives'

export type SportPageConfig = {
  slug: string
  hero: StandardHeroProps
  manifesto: {
    eyebrow: string
    headline: React.ReactNode
    body: string
    media?: { kind: 'photo' | 'video' | 'illustration' | 'screenshot'; label: string; caption?: string }
  }
  capabilities: {
    eyebrow: string
    title: string
    items: Capability[]
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

export function SportPage({ config }: { config: SportPageConfig }) {
  return (
    <PageShell active="sports">
      <StandardHero {...config.hero} />
      <ValueBridge {...config.manifesto} />
      <IntegrationsStrip />
      <CapabilityList
        eyebrow={config.capabilities.eyebrow}
        title={config.capabilities.title}
        capabilities={config.capabilities.items}
      />
      {config.quote && <FeaturedQuote {...config.quote} />}
    </PageShell>
  )
}
