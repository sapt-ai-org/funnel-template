import { Landing } from '@/templates/aurora/Landing'
import { landingSpec } from '@/config/funnel'
import type { Metadata } from 'next'

/**
 * The whole client site is one page: a perspective.co-style funnel landing.
 * All content lives in `src/config/funnel.ts` — this file never changes per client.
 */

export const metadata: Metadata = {
  title: `${landingSpec.brandName} — ${landingSpec.hero.headline}`,
  description: landingSpec.hero.subhead,
}

export default function Home() {
  return <Landing spec={landingSpec} />
}
